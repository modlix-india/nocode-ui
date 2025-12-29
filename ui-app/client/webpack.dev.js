const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Your main entry file
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/' // Ensures correct handling of assets when using dev-server
  },
  devtool: 'source-map', // Better debugging in development
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
              }),
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/, // If you are using CSS
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // If you need images
        type: 'asset/resource'
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'], // Resolve these extensions
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html')
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.EvalSourceMapDevToolPlugin({}),
  ],
  devServer: {

    allowedHosts: "all",
    static: {
      directory: path.join(__dirname, 'dist') // If you have static files like index.html
    },
    historyApiFallback: true, // For React Router support
    port: 1234,
    hot: true, 
    proxy: [
      {
        context: ["**/api/**", "/sso/**"],
        target: "http://localhost:8080/",
        changeOrigin: true,
        secure: false
      }
    ]
  }
  
};

