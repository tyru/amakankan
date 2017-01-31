# amakankan

[![CircleCI](https://circleci.com/gh/amakan/amakankan.svg?style=svg)](https://circleci.com/gh/amakan/amakankan)

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

### analyze

Webpack の生成するファイルの容量を調べたい場合は、以下のスクリプトを実行してください。

```bash
docker-compose run --rm node yarn run analyze
```

<details>
<summary>Example output</summary>

```
yarn run v0.18.1
$ webpack --json | webpack-bundle-size-analyzer
moment: 120.56 KB (51.9%)
underscore: 51.67 KB (22.3%)
async: 14.01 KB (6.03%)
setimmediate: 6.32 KB (2.72%)
process: 5.17 KB (2.23%)
lodash: 5.12 KB (2.20%)
node-libs-browser: 1.33 KB (0.572%)
  timers-browserify: 1.33 KB (100%)
  <self>: 0 B (0.00%)
webpack: 1 KB (0.432%)
<self>: 26.95 KB (11.6%)
Done in 2.22s.
```

</details>

### リリース

新しいバージョンをリリースする場合は、以下の手順に従ってください。

1. CHANGELOG.md を更新する
1. src/others/manifest-chrome.json のバージョンを更新する
1. src/others/manifest-filrefox.json のバージョンを更新する
1. Git の commit にタグを付ける (e.g. `git tag v0.8.0`)
1. Git のタグを push する (e.g. `git push --tags`)
1. GitHub の releases に拡張のファイルをアップロードする
