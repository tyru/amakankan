'use strict';

let nextPageUrl = null
let notificationId = null
let Q = []
Q.workingCount = 0
Q.finishedCount = 0
Q.execShift = () => {
  const action = Q.shift()
  Q.workingCount++
  action().then(() => {
    Q.workingCount--
    Q.finishedCount++
    Q.execShift()
  }).catch((e) => {
    Q.finishedCount++
    Q.workingCount--
  })
}
Q.start = () => {
  Q.execShift()
}

const notify = (options) => {
  return new Promise((done) => {
    chrome.notifications.create(options, done);
  });
};

const sendPageUrl = ({url, title, imageUrl}) => new Promise((done) => {
  window.fetch(
    'https://amakan.net/imports',
    {
      body: JSON.stringify({
        amazon_product_url: url,
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    }
  ).then((response) => {
    chrome.notifications.update(
      notificationId,
      {
        title,
        iconUrl: imageUrl,
        message: '登録成功(' + (Q.finishedCount + 1) + '/' + (Q.length + Q.finishedCount + 1) + ')',
        priority: 0,
      }
    );
    done();
  });
});

class UrlDetection {
  /**
   * @param {String} url
   */
  constructor(url) {
    this.element = document.createElement('a');
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
  hasOrderHistoryPathname() {
    return /\/order-history/.test(this.element.pathname);
  }

  /**
   * @return {Boolean}
   */
  hasOrderHistoryUrl() {
    return this.hasAmazonHostname() && this.hasOrderHistoryPathname();
  }

  /**
   * @return {Boolean}
   */
  hasProductUrl() {
    return this.hasAmazonHostname() && !this.hasOrderHistoryPathname();
  }
}

const onExtensionButtonClickedAtProductPage = (tab) => {
  chrome.tabs.create({
    url: `https://amakan.net/search?query=${tab.url}`
  });
};

const onExtensionButtonClickedAtOrderHistoryPage = (tab) => {
  notify({
    iconUrl: 'images/icon-38.png',
    message: '登録中...',
    priority: 1,
    requireInteraction: true,
    title: '開始',
    type: 'basic',
  }).then((notifyId) => {
    notificationId = notifyId;
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'scrapingAllHistory'
      }
    );
  });
};

const onExtensionButtonClickedAtUnknownPage = (tab) => {
  console.log('🍣');
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Q.push(() => sendPageUrl(request))
  if (Q.length > 0 && Q.workingCount <= 2) Q.start()
});

chrome.browserAction.onClicked.addListener((tab) => {
  const detection = new UrlDetection(tab.url);
  if (detection.hasOrderHistoryUrl()) {
    onExtensionButtonClickedAtOrderHistoryPage(tab);
  } else if (detection.hasProductUrl()) {
    onExtensionButtonClickedAtProductPage(tab);
  } else {
    onExtensionButtonClickedAtUnknownPage(tab);
  }
});
