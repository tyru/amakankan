# amakankan

[![Build Status](https://travis-ci.org/amakan/amakankan.svg?branch=master)](https://travis-ci.org/amakan/amakankan)

amakankan は、[amakan.net](https://amakan.net) のためのブラウザ拡張です。

![demo](/images/demo.gif)

## 利用者用ドキュメント

### インストールする

現状、Chrome ウェブストアや Mozilla Add-ons などには登録されておりません。そのため、自前でブラウザ拡張のコードをコンパイルし、インストールしていただく必要があります。

### Amazon の商品ページから amakan の対応するページに移動する

1. Amazon の商品ページを開きます
2. ブラウザ拡張のボタンをクリックします

### Amazon の購入履歴から読んだ本を一括登録する

1. Amazonの [注文履歴ページ](https://www.amazon.co.jp/gp/css/order-history) を開きます
2. ブラウザ拡張のボタンをクリックします

### ブクログの読書履歴から読んだ本を一括登録する

1. [ブクログ](http://booklog.jp/) の自分の本棚のページを開きます
2. ブラウザ拡張のボタンをクリックします

### 読書メーターの読書履歴から読んだ本を一括登録する

1. [読書メーター](http://bookmeter.com/) の自分の読んだ本のページを開きます
2. ブラウザ拡張のボタンをクリックします

### TSUTAYA LOG の履歴ストックから読んだ本を一括登録する

1. [TSUTAYA LOG](https://log.tsutaya.co.jp/) の履歴ストックページを開きます
2. ブラウザ拡張のボタンをクリックします

### amakan.net に移動する

1. 上記以外のページを開きます
2. ブラウザ拡張のボタンをクリックします

## 開発者用ドキュメント

### 準備

このリポジトリは、Dockerを利用して開発することを想定しています。
手元の環境でDockerを動かせるように準備を行ってください。

https://docs.docker.com/

### watch

ファイルの変更を監視して継続的にビルドを行うには、以下のスクリプトを実行してください。

```bash
docker-compose up
```

### build

1度だけビルドを行うには、以下のスクリプトを実行してください。

```bash
docker-compose run --rm node yarn run build
```

### pack

拡張用のファイルを生成するには、以下のスクリプトを実行してください。

```bash
docker-compose run --rm node yarn run pack
```
