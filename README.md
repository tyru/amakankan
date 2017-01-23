# amakankan

[![Build Status](https://travis-ci.org/amakan/amakankan.svg?branch=master)](https://travis-ci.org/amakan/amakankan)

[amakan.net](https://amakan.net) のためのブラウザ拡張。

![demo](/images/demo.gif)

## インストール方法

準備中

## 使い方

### Amazon

- Amazonの[注文履歴ページ](https://www.amazon.co.jp/gp/css/order-history)で拡張のボタンを押すと、読んだ本をamakanに一括登録できます
- Amazonの商品ページで拡張のボタンを押すと、amakanの対応する書籍のページを開きます

### ブクログ

- [ブクログ](http://booklog.jp/)の本棚ページで拡張のボタンを押すと、読んだ本をamakanに一括登録できます

### 読書メーター

- [読書メーター](http://bookmeter.com/)の読んだ本のページで拡張のボタンを押すと、読んだ本をamakanに一括登録できます

### TSUTAYA LOG

- [TSUTAYA LOG](https://log.tsutaya.co.jp/)の履歴ストックページで拡張のボタンを押すと、読んだ本をamakanに一括登録できます

### その他

- 上記以外のページで拡張のボタンを押すと、https://amakan.net を開きます

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
