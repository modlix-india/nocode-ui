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
        },
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
              }),
              transpileOnly: true,
              // Allow ts-loader to process files from the @modlix/ui-components package
              allowTsInNodeModules: true,
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
    symlinks: true, // Follow symlinks for watching linked packages
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
  watchOptions: {
    // Watch the linked @modlix/ui-components package for HMR
    ignored: /node_modules\/(?!@modlix)/,
    // Poll for changes in linked packages (needed for some file systems)
    poll: 1000,
    aggregateTimeout: 300,
  },
  snapshot: {
    // Don't treat linked @modlix packages as immutable - they need to be watched
    managedPaths: [],
    immutablePaths: [],
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
      directory: path.join(__dirname, 'dist'), // If you have static files like index.html
      publicPath: '/',
    },
    historyApiFallback: true,
    port: 1234,
    hot: true,
    setupMiddlewares: (middlewares, devServer) => {
      // Rewrite requests for static assets to root path
      devServer.app.use((req, res, next) => {
        // Match css files
        const cssMatch = req.url.match(/.*\/(css\/.*)$/);
        if (cssMatch) {
          req.url = '/' + cssMatch[1];
          return next();
        }
        // Match styleProperties files
        const styleMatch = req.url.match(/.*\/(styleProperties\/.*)$/);
        if (styleMatch) {
          req.url = '/' + styleMatch[1];
          return next();
        }
        next();
      });
      return middlewares;
    }, 
    proxy: [
      {
        context: ["**/api/**", "/sso/**"],
        target: "https://apps.dev.modlix.com/",
        changeOrigin: true,
        onProxyRes: (proxyRes, _req, res) => {
          // Disable buffering for SSE responses to enable real-time streaming
          if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
            res.flushHeaders();
          }
        },
      }
    ]
  }
  
};

