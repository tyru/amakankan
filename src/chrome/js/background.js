import queue from "async/queue";

let notificationId;

const requestQueue = queue((task, callback) => {
  callback();
});

const notify = (options) => {
  return new Promise((done) => {
    chrome.notifications.create(options, done);
  });
};

const sendPageUrl = ({url, title, imageUrl, readAt}) => new Promise((done) => {
  window.fetch(
    "https://amakan.net/imports",
    {
      body: JSON.stringify({
        amazon_product_url: url,
        read_at: readAt,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
    }
  ).then((response) => {
    if (chrome.notifications.update) {
      chrome.notifications.update(
        notificationId,
        {
          title,
          iconUrl: imageUrl,
          message: "申請完了",
          priority: 0,
        }
      );
    } else {
      chrome.notifications.clear(notificationId, () => {
        notificationId = chrome.notifications.create({
          title,
          iconUrl: imageUrl,
          message: "申請完了",
          priority: 0,
          type: "basic",
        });
      });
    }
    done();
  });
});

class UrlDetection {
  /**
   * @param {String} url
   */
  constructor(url) {
    this.element = document.createElement("a");
    this.element.href = url;
  }

  /**
   * @return {Boolean}
   */
  hasAmazonHostname() {
    return /amazon\.co\.jp/.test(this.element.hostname);
  }

  /**
   * @return {Boolean}
   */
  hasOrderAmazonHistoryPathname() {
    return /\/order-history/.test(this.element.pathname);
  }

  /**
   * @return {Boolean}
   */
  hasAmazonOrderHistoryUrl() {
    return this.hasAmazonHostname() && this.hasOrderAmazonHistoryPathname();
  }

  /**
   * @return {Boolean}
   */
  hasAmazonProductUrl() {
    return this.hasAmazonHostname() && !this.hasOrderAmazonHistoryPathname();
  }

  /**
   * @return {Boolean}
   */
  hasBooklogHostname() {
    return /booklog\.jp$/.test(this.element.hostname);
  }

  /**
   * @return {Boolean}
   */
  hasBooklogShelfPathname() {
    return /^\/users\/[^/]+$/.test(this.element.pathname);
  }

  /**
   * @return {Boolean}
   */
  hasBooklogShelfUrl() {
    return this.hasBooklogHostname() && this.hasBooklogShelfPathname();
  }
}

const onExtensionButtonClickedAtAmazonProductPage = (tab) => {
  chrome.tabs.create({
    url: `https://amakan.net/search?query=${tab.url}`
  });
};

const onExtensionButtonClickedAtAmazonOrderHistoryPage = (tab) => {
  notify({
    iconUrl: "images/icon-38.png",
    message: "登録中...",
    priority: 1,
    title: "開始",
    type: "basic",
  }).then((notifyId) => {
    notificationId = notifyId;
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "scrapingAllAmazonHistory"
      }
    );
  });
};

const onExtensionButtonClickedAtBooklogShelfPage = (tab) => {
  notify({
    iconUrl: "images/icon-38.png",
    message: "登録中...",
    priority: 1,
    title: "開始",
    type: "basic",
  }).then((notifyId) => {
    notificationId = notifyId;
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "scrapeAllBooklogReadHistory"
      }
    );
  });
};

const onExtensionButtonClickedAtUnknownPage = (tab) => {
  chrome.tabs.create({
    url: "https://amakan.net"
  });
};

chrome.runtime.onMessage.addListener((message) => {
  requestQueue.push(() => {
    sendPageUrl(message);
  });
});

chrome.browserAction.onClicked.addListener((tab) => {
  const detection = new UrlDetection(tab.url);
  if (detection.hasAmazonOrderHistoryUrl()) {
    onExtensionButtonClickedAtAmazonOrderHistoryPage(tab);
  } else if (detection.hasAmazonProductUrl()) {
    onExtensionButtonClickedAtAmazonProductPage(tab);
  } else if (detection.hasBooklogShelfUrl()) {
    onExtensionButtonClickedAtBooklogShelfPage(tab);
  } else {
    onExtensionButtonClickedAtUnknownPage(tab);
  }
});
