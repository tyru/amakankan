# amakankan [![Build Status](https://travis-ci.org/amakan/amakankan.svg?branch=master)](https://travis-ci.org/amakan/amakankan)

amakankanは、[amakan.net](https://amakan.net) のための公式ブラウザ拡張です。

## インストール

### Google Chrome

~~[amakankan - Chromeウェブストア](https://chrome.google.com/webstore/detail/amakankan/cbbcooiceghdbkklnkdahccnbbfleoll)~~ 登録取消のため再申請中

### Firefox, Opera, Edge

登録申請中 :bow:

## 使い方

### Amazonの注文履歴からインポート

Amazonの [注文履歴ページ](https://www.amazon.co.jp/gp/css/order-history) でボタンを押すと、読んだ本をamakanに一括登録できます。

![demo](/images/demo.gif)

### Amazonの商品ページからamakanに移動

Amazonの商品ページでボタンを押すと、amakanの対応する書籍のページを開きます。

### ブクログの本棚からインポート

[ブクログ](http://booklog.jp/) の本棚ページでボタンを押すと、読んだ本をamakanに一括登録できます。

### 読書メーターの読んだ本からインポート

[読書メーター](http://bookmeter.com/) の読んだ本のページでボタンを押すと、読んだ本をamakanに一括登録できます。

### TSUTAYA LOG の履歴ストックからインポート

[TSUTAYA LOG](https://log.tsutaya.co.jp/) の履歴ストックページでボタンを押すと、読んだ本をamakanに一括登録できます。

### amakanに移動

上記以外のページでボタンを押すと、[amakan.net](https://amakan.net) を開きます。

## For developers

### Set up

Install dependencies for development (Requires node >= 6.1.0).

```sh
npm install
```

### Build

Compile source files into ./dist directory.

```sh
npm run build
```

### Watch

Watch source files to be built.

```
npm run watch
```

### Pack

Create browser extension packages.

```
npm run pack
```
