import _ from "underscore";
import moment from "moment";

/**
 * @param {String} imageUrl
 * @param {String=} readAt
 * @param {String} title
 * @param {String} url
 */
const sendAmazonProductDataToAmakan = ({ imageUrl, readAt, title, url }) => {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    action: "sendAmazonProductDataToAmakan",
    imageUrl, readAt, title, url
  }, {});
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
 * Show notification popup
 * @param {Object} options
 */
const notify = (options) => {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    action: "notify", options
  }, {});
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
  /**
   * - Do not send duplicate requests ('book.url' may be duplicate)
   * - Delay 200ms at least between last time when sending a request
   * @returns {Promise}
   */
  const sendWithDelay = (() => {
    let sentUrl = {};
    let lastSentTime = Date.now() - 200;
    return (book) => {
      if (sentUrl.hasOwnProperty(book.url)) {
        return Promise.resolve();
      }
      sentUrl[book.url] = true;
      const distance = Date.now() - lastSentTime;
      const msec = distance >= 200 ? 0 : 200 - distance;
      return delay(msec).then(() => {
        sendAmazonProductDataToAmakan(book);
        lastSentTime = Date.now();
      });
    };
  })();

  // GET /users/alert_list/ -> html
  getAlertListPage()
    // Scrape list of alertId from given html -> Array.<Promise<AlertID>>
    .then(getAlertIdListFromPage)
    .then((alertIdList) => {
      const promiseList = alertIdList.map((alertId, index) => {
        // GET /dealings/index/{alertId}/ with delay -> Array.<Promise.<HTML>>
        return delay(index * 100)
          .then(() => getDealingsPage(alertId))
          // Scrape books from html list -> Array.<Book>
          .then((content) => scrapePage(content))
          // Register books to amakan with delay
          .then((books) => {
            return Promise.all(books.map(sendWithDelay));
          });
      });
      return Promise.all(promiseList);
    }).then(() => {
      delay(2000).then(() => notify({
        title: "終了",
        iconUrl: "images/icon-38.png",
        message: "インポート完了",
        priority: 0,
        type: "basic",
      }));
    });
};

const isLoggedIn = () => {
  return fetchPage("/users/login/").then((content) => {
    const $html = document.createElement("html");
    $html.innerHTML = content;
    return $html.querySelector("#UserLoginForm") ? Promise.reject() : Promise.resolve();
  }, (error) => {
    // Bell alert redirects to 'http://...' but chrome blocks due to mixed
    // contents with no sufficient error information!
    // (error.message = "Failed to fetch")
    return Promise.resolve();
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAllBellAlertAlertList") {
    isLoggedIn().then(
      () => scrapeAllBellAlertAlertList(),
      () => window.alert("ログインして下さい")
    );
  }
  return true;
});
