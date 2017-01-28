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
 * @param {String} url
 * @returns {Promise}
 */
const get = (url) => {
  return window.fetch(
    url,
    {
      credentials: "include",
      redirect: "manual",
    }
  ).then((response) => {
    return response.text().then((body) => {
      return {
        body,
        status: response.status,
      };
    });
  });
};

/**
 * @param {Integer} page
 * @returns {Promise}
 */
const getReadBooks = ({ page }) => {
  return get(`/home?main=book&display=list&p=${page}`).then(({ body, status }) => {
    if (status === 200) {
      const rootElement = document.createElement("html");
      rootElement.innerHTML = body;
      return [...rootElement.querySelectorAll("#status_box .book_list_simple_box:not(:first-child)")].map((boxElement) => {
        const titleElement = boxElement.querySelector(".book_list_simple_td_title a");
        const title = titleElement.textContent.replace(/^\s+/, "").replace(/\s+$/, "");
        const asin = titleElement.href.match(/\/b\/(.+)/)[1];
        const url = `https://www.amazon.co.jp/dp/${asin}`;
        const dateElement = boxElement.querySelector(".book_list_simple_td_date");
        const readAt = moment(
          dateElement.textContent.replace(/^\s+/, "").replace(/\s+$/, ""),
          "YYYY年MM月DD日"
        ).format("YYYY-MM-DD 00:00:00");
        return {
          readAt,
          title,
          url,
        };
      });
    } else {
      return [];
    }
  });
};

/**
 * @param {Integer=} page
 */
const crawl = (page = 1) => {
  getReadBooks({ page }).then((books) => {
    books.forEach((book, index) => {
      window.setTimeout(() => {
        sendAmazonProductDataToAmakan(book);
      }, 200 * index);
    });
    if (books.length > 0) {
      crawl(page + 1);
    }
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAllBookmeterReadHistory") {
    crawl();
  }
  return true;
});
