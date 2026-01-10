const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env = {}) => {
  const publicUrl = env.publicUrl || '/';

  const plugins =  [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!css/**', '!styleProperties/**' ]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
      // If you need to dynamically set <base href>, you can do so here if needed
    })
  ];

  if (env.analyze) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    plugins.push(new BundleAnalyzerPlugin({
      reportFilename: path.resolve(__dirname, 'report', 'index.html'),
      openAnalyzer: false
    }));
  }

  return {
    mode: 'production',
    entry: {
      index: './src/index.tsx',
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: publicUrl
    },
    devtool: 'source-map', // You can remove or change this to 'hidden-source-map' or false if desired
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
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
      extensions: ['.ts', '.tsx', '.js']
    },
    plugins,
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name: 'vendors',
          },
          default: {
            minChunks: 3,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
};