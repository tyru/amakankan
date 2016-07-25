import _ from "underscore";

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
      chrome.runtime.sendMessage(chrome.runtime.id, {url: a.href, title: a.textContent, imageUrl: null});
    });
};

const scrapingPage = (html) => {
  const targetDoc = document.createElement("html");
  targetDoc.innerHTML = html;
  const items = [...targetDoc.querySelectorAll(".order > .a-box .a-fixed-right-grid .a-fixed-right-grid-col.a-col-left .a-fixed-left-grid.a-spacing-none .a-fixed-left-grid-inner .a-fixed-left-grid-col.a-col-right")];
  if (items.length < 1) return false;
  items.forEach((item, index) => {
    const link = item.querySelector(".a-link-normal");
    if (!link) {
      return;
    }
    const url = link.href;
    const title = link.textContent.replace(/^[\s\t\n]*(.+)[\s\t\n]*$/, "$1");
    const imageUrl = item.parentNode.querySelector("img").src;
    window.setTimeout(() => {
      chrome.runtime.sendMessage(chrome.runtime.id, {url, title, imageUrl}, {});
    }, 200 * index);
  });
  // まとめ買い対策
  [...targetDoc.querySelectorAll(".a-size-medium.a-link-emphasis")]
    .forEach((a) => fetchPage(a.href).then(parseOrderSummry));
  return true;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAmazonOrderHistory") {
    _.range(new Date().getFullYear(), 1996, -1).forEach((year) => {
      const request = (i) => {
        fetchPage(
          `/gp/your-account/order-history/ref=oh_aui_pagination_1_${(i + 1)}?startIndex=${(i * 10)}&orderFilter=year-${year}`
        ).then((a) => {
          scrapingPage(a) && window.setTimeout(() => request(++i), 100);
        });
      };
      request(0);
    });
  }
  return true;
});
