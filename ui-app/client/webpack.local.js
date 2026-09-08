const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
        exclude: /node_modules\/(?!@fincity)/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
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
    symlinks: true, // Follow symlinks to resolve modules
    // Prefer "source" (Parcel field) so linked @fincity/kirun-js uses src/ in dev for live edits
    mainFields: ['source', 'module', 'main'],
    alias: {
      // Force symlinked packages (e.g. @fincity/kirun-ui) to resolve peer
      // dependencies from nocode-ui's node_modules, not their own copies.
      // Without this, duplicate React/kirun-js instances cause runtime errors.
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor'),
      '@fincity/kirun-js': path.resolve(__dirname, 'node_modules/@fincity/kirun-js'),
    },
  },
  watchOptions: {
    followSymlinks: true, // Watch changes in symlinked directories
    ignored: /node_modules\/(?!@fincity)/, // Ignore node_modules except @fincity packages
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html')
    }),
    new webpack.EvalSourceMapDevToolPlugin({}),
  ],
  devServer: {

    allowedHosts: "all",
    client: {
      // Point the HMR socket at the PAGE's own origin instead of the dev
      // server's port. Served through nginx on https:443, the default resolves
      // to wss://<host>:1234/ws -- a TLS handshake against a plain-HTTP port
      // that always fails, so live reload never worked and the console filled
      // with ERR_SSL_PROTOCOL_ERROR. `auto://0.0.0.0:0` means "take the
      // protocol, host and port from the page", which is right on
      // https://apps.local.modlix.com AND on http://localhost:1234.
      // nginx proxies /ws to this server (dbs/nginx/.../local.modlix.com.conf).
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    static: {
      directory: path.join(__dirname, 'dist') // If you have static files like index.html
    },
    historyApiFallback: true, // For React Router support
    port: 1234,
    hot: true, 
    proxy: [
      {
        context: ["**/api/**", "/sso/**", "/hassso/**"],
        target: "http://localhost:8080/",
        secure: false,
        changeOrigin: true,
        on: {
          proxyReq: (proxyReq, req) => {
            // `changeOrigin` rewrites Host to localhost:8080, so the only record of the host the
            // browser actually asked for is the X-Forwarded-* set. nginx populates these when it
            // proxies to this dev server (dbs/nginx/.../local.modlix.com.conf), and the gateway
            // and the services behind it resolve appCode / clientCode from them, so they have to
            // survive this hop verbatim. When the dev server is hit directly on :1234 there is no
            // nginx in front, so derive the same values from this request instead.
            const host = req.headers['x-forwarded-host'] || req.headers.host || '';
            const proto =
              req.headers['x-forwarded-proto'] ||
              (req.socket && req.socket.encrypted ? 'https' : 'http');
            const port =
              req.headers['x-forwarded-port'] ||
              // An IPv6 literal host is bracketed, so only a colon after the closing
              // bracket -- or in a plain host -- is the port separator.
              host.slice(host.lastIndexOf(']') + 1).split(':')[1] ||
              (proto === 'https' ? '443' : '80');

            if (host) proxyReq.setHeader('X-Forwarded-Host', host);
            proxyReq.setHeader('X-Forwarded-Proto', proto);
            proxyReq.setHeader('X-Forwarded-Port', port);
          },
          proxyRes: (proxyRes, _req, res) => {
            // Disable buffering for SSE responses to enable real-time streaming
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              res.flushHeaders();
            }
          },
        },
      }
    ]
  }
  
};