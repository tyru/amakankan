# amakankan

amakankanは、https://amakan.net/ を便利に使うためのamakan公式Chrome拡張です。

## 使い方

1. Amazonの[注文履歴ページ](https://www.amazon.co.jp/gp/css/order-history)でボタンを押すと、読んだ本をamakanに一括登録できます
2. Amazonの商品ページでボタンを押すと、amakan上の対応するページに飛べます

![demo](/images/demo.gif)

## インストール方法

1. https://github.com/amakan/amakankan/releases から amakankan.crx をダウンロードします
2. chrome://extensions/ (「設定」の「拡張機能」) にアクセスします
3. ダウンロードしておいた amakankan.crx を画面上にドラッグ&ドロップします

## 開発者の方へ
以下の手順でソースコードをビルドした上で、chrome://extensions/ で「パッケージ化されていない拡張を取り込む...」というボタンから app ディレクトリを開くとインストールできます。

```sh
git clone https://github.com/amakan/amakankan.git
cd amakankan
npm install
gulp build
```
