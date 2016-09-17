import moment from "moment";

/**
 * @param {String} url
 * @returns {Promise}
 */
const post = (url) => {
  return window.fetch(
    url,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "AJAXHEADER": "AJAXHEADER",
        "X-Requested-With": "XMLHttpRequest",
      },
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

const isbnContainingUrlPattern = /picture\/jacket\/[0-9]{5}\/(978[0-9]{10})_001T.jpg/;

/**
 * @param {String} isbn13
 * @returns {String}
 */
const convertIsbn13to10 = (isbn13) => {
  const code = isbn13.slice(3, -1);
  const sum = code.split("").reduce((s, x, i) => { return s + Number(x) * (10 - i);}, 0);
  const checkDigit = 11 - sum % 11;

  if (checkDigit == 10) {
    return code + "X";
  } else if (checkDigit == 11 ) {
    return code + "0";
  } else {
    return code + String(checkDigit);
  }
};

/**
 * @param {Integer} page
 * @returns {Promise}
 */
const getReadBooks = ({ page }) => {
  return post(`/pc/DHS002PS21Action.do?more&currPageNum=${page}`).then(({ body, status }) => {
    if (status === 200) {
      const rootElement = document.createElement("html");
      rootElement.innerHTML = body;
      return [...rootElement.querySelectorAll("tr")].map((stockElement) => {
        const imageElement = stockElement.querySelector("td.title dl dt img");
        if (!imageElement) {
          return;
        }
        const imageUrl = imageElement.src;
        const foundIsbn13 = imageUrl.match(isbnContainingUrlPattern);
        if (!foundIsbn13 || foundIsbn13.length < 0) {
          return;
        }
        const asin = convertIsbn13to10(foundIsbn13[1]);
        const url = `https://www.amazon.co.jp/dp/${asin}`;

        const titleElement = stockElement.querySelector("td.title dl dd");
        const title = titleElement.textContent;

        const dateElement = stockElement.querySelector("tr td.date");
        const readAt = moment(dateElement.textContent, "YYYY/MM/DD").format("YYYY-MM-DD 00:00:00");

        return {
          url, title, imageUrl, readAt,
        };
      }).filter(x => x);
    } else {
      return [];
    }
  });
};

/**
 * @param {Integer=} page
 */
const crawl = (page = 0) => {
  getReadBooks({ page }).then((books) => {
    books.forEach((book, index) => {
      window.setTimeout(() => {
        chrome.runtime.sendMessage(chrome.runtime.id, book, {});
      }, 200 * index);
    });
    if (books.length > 0) {
      crawl(page + 1);
    }
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeAllTsutayaLogStockHistory") {
    crawl();
  }
  return true;
});
