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
          use: {
            loader: 'ts-loader',
            options: {
              // Allow ts-loader to process files from the @modlix/ui-components package
              allowTsInNodeModules: true,
            }
          },
          // Include @modlix packages in the build (they use file: reference)
          // Exclude node_modules (except @modlix) and test files
          exclude: (filePath) => {
            // Always exclude __tests__ folders
            if (filePath.includes('__tests__')) return true;
            // Include @modlix packages
            if (filePath.includes('node_modules/@modlix')) return false;
            // Exclude other node_modules
            if (filePath.includes('node_modules')) return true;
            return false;
          }
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
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        // Ensure React and react-router are always resolved from client's node_modules
        // This prevents multiple copies when using linked packages
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        'react-router': path.resolve(__dirname, 'node_modules/react-router'),
        '@remix-run/router': path.resolve(__dirname, 'node_modules/@remix-run/router'),
      }
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
