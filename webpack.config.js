var webpack = require("webpack");

module.exports = {
  entry: {
    background: "./src/javascripts/background.js",
    contentScriptAmazon: "./src/javascripts/contentScriptAmazon.js",
    contentScriptBellAlert: "./src/javascripts/contentScriptBellAlert.js",
    contentScriptBooklog: "./src/javascripts/contentScriptBooklog.js",
    contentScriptBookmeter: "./src/javascripts/contentScriptBookmeter.js",
    contentScriptTsutayaLog: "./src/javascripts/contentScriptTsutayaLog.js",
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: "babel-loader",
        test: "\.jsx?$",
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: "./dist/javascripts",
  },
  plugins: process.env.NODE_ENV === "production" ? [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
  ] : [],
};
