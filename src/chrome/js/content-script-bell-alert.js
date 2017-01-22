import _ from "underscore";
import moment from "moment";

/**
 * @param {String} imageUrl
 * @param {String=} readAt
 * @param {String} title
 * @param {String} url
 */
const sendAmazonProductDataToAmakan = ({ imageUrl, readAt, title, url }) => {
  chrome.runtime.sendMessage(chrome.runtime.id, { imageUrl, readAt, title, url }, {});
};

/**
 * @param {String} url
 * @returns {Promise}
 */
const fetchPage = (url) => {
  return window.fetch(
    url,
    { credentials: "include" }
  ).then((response) => {
    return response.text();
  });
};

/**
 * Resolve after [msec] msec
 * @param {Integer} msec
 * @returns {Promise}
 */
const delay = (msec) => {
  return new Promise((done) => {
    window.setTimeout(done, msec);
  });
};

/**
 * @param {String} html
 * @returns {Boolean} A flag to tell there is a next page or not.
 */
const scrapePage = (content) => {
  const convertTrToBook = ($tr) => {
    const getImageUrl = ($tr) => {
      const images = $tr.querySelectorAll("div > img");
      return images.length > 0 ? images[0].src : null;
    };
    const getTitle = ($tr) => {
      const $pList = $tr.querySelectorAll("td p");
      if ($pList.length === 0) {
        return null;
      }
      return $pList[0].innerText.trim();
    };
    const getReadAt = ($tr) => {
      const $divList = $tr.querySelectorAll("td div");
      if ($divList.length === 0) {
        return null;
      }
      const readAtText = $divList[$divList.length - 1].innerText;
      if (! /(\d{4}年\d{1,2}月\d{1,2}日発売)/.test(readAtText)) {
        return null;
      }
      return moment(RegExp.$1, "YYYY年MM月DD日発売").format("YYYY-MM-DD 00:00:00");
    };
    const getUrl = ($tr) => {
      const isAmazonLink = ($a) => {
        return /www\.amazon\.co\.jp/.test($a.href);
      };
      const links = [...$tr.querySelectorAll("a.buyThis")].filter(isAmazonLink);
      return links.length > 0 ? links[0].href : null;
    };

    return {
      imageUrl: getImageUrl($tr),
      title: getTitle($tr),
      readAt: getReadAt($tr),
      url: getUrl($tr)
    };
  };

  const hasRequiredProps = (book) => {
    return typeof book.title === "string" && book.title !== "" &&
           typeof book.readAt === "string" && book.readAt !== "" &&
           typeof book.url === "string" && book.url !== "";
  };

  const shouldImport = (book) => {
    return ! /コミックセット|総集編/.test(book.title);
  };

  const $html = document.createElement("html");
  $html.innerHTML = content;
  return [...$html.querySelectorAll("#dealings-table tr")]
      .map(convertTrToBook)
      .filter(hasRequiredProps)
      .filter(shouldImport);
};

/**
 * GET /users/alert_list/
 * @returns {Promise}
 */
const getAlertListPage = () => {
  return fetchPage("/users/alert_list/");
};

/**
 * GET /dealings/index/{alertId}/
 * @param {String} alertId
 * @returns {Promise}
 */
const getDealingsPage = (alertId) => {
  return fetchPage(`/dealings/index/${alertId}/`);
};

/**
 * Scrape list of alertId from given html
 * @param {String} html
 * @returns {Array.<String>} List of alertId
 */
const getAlertIdListFromPage = (content) => {
  const $html = document.createElement("html");
  $html.innerHTML = content;
  // Convert <tr> to Array.<Book>
  // (.slice(1) to get rid of first <th> row)
  const $trList = [...$html.querySelectorAll("table tr")].slice(1);
  // $tr.querySelectorAll("td") = [アラートID, アラート条件, 読み仮名, 時期, 最新発売日, 最新刊巻数, 次回発売日, 次巻数, 編集・一覧・削除ボタン]
  return $trList.map($tr => $tr.querySelectorAll("td")[0].textContent);
};

const scrapeAllBellAlertAlertList = () => {
  // GET /users/alert_list/ -> html
  getAlertListPage()
    // Scrape list of alertId from given html -> Array.<Promise<AlertID>>
    .then(getAlertIdListFromPage)
    // GET /dealings/index/{alertId}/ with 50ms delay -> Array.<Promise.<HTML>>
    .then((alertIdList) => {
      const promiseList = alertIdList.map((alertId, index) => {
        return delay(index * 50).then(() => getDealingsPage(alertId));
      });
      return Promise.all(promiseList);
    // Scrape books from html list -> Array.<Book>
    }).then((htmlList) => {
      const books = htmlList.reduce((books, html) => books.concat(scrapePage(html)), []);
      return _.uniq(books, (book) => book.url);
    // Register books to amakan with 200ms delay
    }).then((books) => {
      books.forEach((book, index) => {
        window.setTimeout(() => {
          sendAmazonProductDataToAmakan(book);
        }, index * 200);
      });
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAllBellAlertAlertList") {
    scrapeAllBellAlertAlertList();
  }
  return true;
});
