const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.jsx',
//   watch: true,
  watchOptions: {
    aggregateTimeout: 2000,
    //poll: 2000,
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

  devServer: {
    port: 1025,
    historyApiFallback: true,
    hot: true,
    open: true,
    compress: true,
  },

  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },

  plugins: [
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  resolve: {
    modules: [__dirname, 'src', 'node_modules'],
    extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),

          options: {
            plugins: [
              process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
          },
        },

        // loader: require.resolve('babel-loader'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.png|svg|jpg|gif$/,
        use: ['file-loader'],
      },
    ],
  },
};
