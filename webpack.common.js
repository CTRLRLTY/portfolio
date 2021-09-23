const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [
  new HtmlWebpackPlugin({
    template: './index.html',
    favicon: './favicon.svg'
  }),
  new HtmlWebpackPlugin({
    template: './ok.html',
    filename: 'ok.html'
  }),
  new HtmlWebpackPlugin({
    template: './fail.html',
    filename: 'fail.html'
  }),
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
  }),
]

const modules = {
  rules: [
    {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, "css-loader"],
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: 'asset/resource',
    },
  ],
}

module.exports = {
  plugins,
  context: path.resolve(__dirname, 'src'),
  entry: { 
    main: ['./main.js', './component.css', './main.css'],
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: modules
};
