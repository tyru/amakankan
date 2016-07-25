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

const parseOrderSummry = (html) => {
  const targetDoc = document.createElement("html");
  targetDoc.innerHTML = html;
  [...targetDoc.querySelectorAll(".sample b > a")]
    .forEach((a) => {
      sendAmazonProductDataToAmakan({
        imageUrl: null,
        title: a.textContent,
        url: a.href,
      });
    });
};

/**
 * @param {String} html
 * @returns {Boolean} A flag to tell there is a next page or not.
 */
const scrapePage = (html) => {
  const targetDoc = document.createElement("html");
  targetDoc.innerHTML = html;
  targetDoc.querySelectorAll(".order").forEach((orderElement) => {
    const momentTime = moment(
      orderElement.querySelector(".order-info .a-column:first-child .value").textContent.replace(/^\s+/, "").replace(/\s+$/, ""),
      "YYYY年M月D日"
    );

    const items = orderElement.querySelectorAll(".a-box .a-fixed-right-grid .a-fixed-right-grid-col.a-col-left .a-fixed-left-grid.a-spacing-none .a-fixed-left-grid-inner .a-fixed-left-grid-col.a-col-right");
    if (items.length < 1) {
      return false;
    }
    items.forEach((item, index) => {
      const link = item.querySelector(".a-link-normal");
      if (!link) {
        return;
      }
      sendAmazonProductDataToAmakan({
        imageUrl: item.parentNode.querySelector("img").src,
        title: link.textContent.replace(/^[\s\t\n]*(.+)[\s\t\n]*$/, "$1"),
        readAt: momentTime.format("YYYY-MM-DD 00:00:00"),
        url: link.href,
      });
    });
    // まとめ買い対策
    [...targetDoc.querySelectorAll(".a-size-medium.a-link-emphasis")]
      .forEach((a) => fetchPage(a.href).then(parseOrderSummry));
    return true;
  });
};

/**
 * @returns {Array.<Integer>} e.g. `[1998, 1997, 1996]`
 */
const getCrawlableYears = () => {
  return _.range(new Date().getFullYear(), 1996, -1);
};

/**
 * @param {Integer} page
 * @param {Integer} year
 * @returns {Promise}
 */
const getOrderHistoryPage = ({ page, year }) => {
  return fetchPage(`/gp/your-account/order-history/ref=oh_aui_pagination_1_${page}?startIndex=${((page - 1) * 10)}&orderFilter=year-${year}`);
};

/**
 * @param {Integer} year
 */
const crawlAllPagesInYear = (year) => {
  const request = (page) => {
    getOrderHistoryPage({ page, year }).then((body) => {
      return scrapePage(body);
    }).then((hasNextPage) => {
      if (hasNextPage) {
        window.setTimeout(() => request(page + 1), 100);
      }
    });
  };
  request(1);
};

const scrapeAmazonOrderHistory = () => {
  getCrawlableYears().forEach((year) => {
    crawlAllPagesInYear(year);
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAmazonOrderHistory") {
    scrapeAmazonOrderHistory();
  }
  return true;
});
