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

const fetchJson = (url) => new Promise((ok) => {
  return window.fetch(url, {credentials: "include"})
    .then((res) => res.json())
    .then(ok);
});

const processPage = (json) => {
  if ( !json.books || json.books.length == 0 ) {
    return false;
  }

  json.books.forEach((book, index) => {
    const url = `https://www.amazon.co.jp/dp/${book.id}`;
    const title = book.title;
    const imageUrl = book.image;
    const readAt = book.read_at;
    window.setTimeout(() => {
      sendAmazonProductDataToAmakan({ imageUrl, readAt, title, url });
    }, 200 * index);
  });

  return true;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const actions = {
    scrapeAllBooklogReadHistory: () => {
      if ( document.querySelector("body.guest") ) {
        if ( ! window.confirm("登録したい本棚が間違っていない事を確認してください。続行しますか?") ) {
          return;
        }
      } else {
        if ( ! document.querySelector(".user-setting-btn") ) {
          if ( ! window.confirm("この本棚はログインしているユーザーの物ではありませんが、続行しますか?") ) {
            return;
          }
        }
      }

      const pathNamePart = `${location.pathname}/all`;
      const request = (i) => {
        // status=3 (読み終わった)
        const url = `${pathNamePart}?category_id=all&status=3&sort=sort_asc&rank=all&tag=&keyword=&reviewed=&quoted=&json=true&page=${i + 1}`;
        fetchJson(url)
          .then((a) => processPage(a) && window.setTimeout(() => request(++i), 500));
      };
      request(0);
    }
  };
  if (request.action in actions) {
    actions[request.action]();
  }
  return true;
});
