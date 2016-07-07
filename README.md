# amakankan

amakankanは、https://amakan.net/ を便利に使うための公式Chrome拡張です。

1. Amazonの注文履歴ページでボタンを押すと、読んだ本をamakanに一括登録できます
2. Amazonの商品ページでボタンを押すと、amakan上の対応するページに飛べます

![demo](/images/demo.gif)

## インストール方法

### 一般の方向け

1. https://github.com/amakan/amakankan/releases から amakan.crx をダウンロードします
2. chrome://extensions/ にアクセスします
3. ダウンロードしておいた amakan.crx を画面上にドラッグ&ドロップします

### 開発者の方向け
以下の手順でソースコードをビルドした上で、chrome://extensions/ で「パッケージ化されていない拡張を取り込む...」というボタンから app ディレクトリを開くとインストールできます。

```sh
git clone https://github.com/amakan/amakankan.git
cd amakankan
npm install
gulp build
```

## 使い方

### 注文履歴から読んだ本を取り込む
1. [注文履歴ページ](https://www.amazon.co.jp/gp/css/order-history) にアクセスします
2. ツールバーに表示されているamakankanのボタンを押すと、登録処理を開始します
3. Amazonの購入履歴を1996年まで遡ってゆっくりと登録されていきます
4. 書籍が登録されていく過程が通知が表示されます
5. 完了したタイミングで特に通知などは表示されないのでご注意ください

### Amazonの商品ページからamakan上の対応するページを開く
1. Amazonの商品ページにアクセスします
2. ツールバーに表示されているamakankanのボタンを押すと、amakan上の対応するページに飛びます
