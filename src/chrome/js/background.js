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
          iconUrl: imageUrl || "images/icon-38.png",
          message: "送信完了",
          priority: 0,
        }
      );
    } else {
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create({
          title,
          iconUrl: imageUrl || "images/icon-38.png",
          message: "送信完了",
          priority: 0,
          type: "basic",
        });
      });
    }
    done();
  });
});

/**
 * @param {String} actionName
 * @param {Object} tab
 */
const startScrapeInContentScript = ({ actionName, tab }) => {
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
        action: actionName,
      }
    );
  });
};

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
  hasBookmeterHomeUrl() {
    return this.hasBookmeterHostname() && this.hasBookmeterHomePathname();
  }

  /**
   * @return {Boolean}
   */
  hasBookmeterHostname() {
    return /bookmeter\.com$/.test(this.element.hostname);
  }

  /**
   * @return {Boolean}
   */
  hasBookmeterHomePathname() {
    return /^\/home$/.test(this.element.pathname);
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

  /**
   * @return {Boolean}
   */
  hasTsutayaLogStockHistoryUrl() {
    return this.hasTsutayaLogStockHostname() && this.hasTsutayaLogStockHistoryPathname();
  }

  /**
   * @return {Boolean}
   */
  hasTsutayaLogStockHostname() {
    return /log\.tsutaya\.co\.jp/.test(this.element.hostname);
  }

  /**
   * @return {Boolean}
   */
  hasTsutayaLogStockHistoryPathname() {
    return /^\/pc\/[^/]+Action.do$/.test(this.element.pathname);
  }

  /**
   * @return {Boolean}
   */
  hasBellAlertAlertListUrl() {
    return this.hasBellAlertAlertListHostname() && this.hasBellAlertAlertListPathname();
  }

  /**
   * @return {Boolean}
   */
  hasBellAlertAlertListHostname() {
    return /alert\.shop-bell\.com/.test(this.element.hostname);
  }

  /**
   * @return {Boolean}
   */
  hasBellAlertAlertListPathname() {
    return /^\/users\/alert_list\/$/.test(this.element.pathname);
  }
}

const onExtensionButtonClickedAtAmazonOrderHistoryPage = (tab) => {
  startScrapeInContentScript({ actionName: "scrapeAmazonOrderHistory", tab });
};

const onExtensionButtonClickedAtAmazonProductPage = (tab) => {
  chrome.tabs.create({ url: `https://amakan.net/search?query=${tab.url}` });
};

const onExtensionButtonClickedAtBooklogShelfPage = (tab) => {
  startScrapeInContentScript({ actionName: "scrapeAllBooklogReadHistory", tab });
};

const onExtensionButtonClickedAtBookmeterHomePage = (tab) => {
  startScrapeInContentScript({ actionName: "scrapeAllBookmeterReadHistory", tab });
};

const onExtensionButtonClickedAtTsutayaLogPage = (tab) => {
  startScrapeInContentScript({ actionName: "scrapeAllTsutayaLogStockHistory", tab });
};

const onExtensionButtonClickedAtBellAlertAlertListPage = (tab) => {
  startScrapeInContentScript({ actionName: "scrapeAllBellAlertAlertList", tab });
};

const onExtensionButtonClickedAtUnknownPage = (tab) => {
  chrome.tabs.create({ url: "https://amakan.net" });
};

chrome.runtime.onMessage.addListener((message) => {
  requestQueue.push({}, () => {
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
  } else if (detection.hasBookmeterHomeUrl()) {
    onExtensionButtonClickedAtBookmeterHomePage(tab);
  } else if (detection.hasTsutayaLogStockHistoryUrl()) {
    onExtensionButtonClickedAtTsutayaLogPage(tab);
  } else if (detection.hasBellAlertAlertListUrl()) {
    onExtensionButtonClickedAtBellAlertAlertListPage(tab);
  } else {
    onExtensionButtonClickedAtUnknownPage(tab);
  }
});
