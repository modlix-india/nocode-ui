const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = async (env = {}) => {
  const publicUrl = env.publicUrl || '/';
  const buildVersion = Date.now().toString(36); // Short unique build identifier

  // Dynamically import ES module
  const { WebpackManifestPlugin } = await import('webpack-manifest-plugin');

  const plugins =  [
    new webpack.DefinePlugin({
      'globalThis.buildVersion': JSON.stringify(buildVersion),
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!css/**', '!styleProperties/**' ]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
      // If you need to dynamically set <base href>, you can do so here if needed
    }),
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicUrl,
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);

        const entrypointFiles = {};
        Object.keys(entrypoints).forEach(entrypoint => {
          entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(
            fileName => !fileName.endsWith('.map')
          );
        });

        // Extract Application/ApplicationStyle chunks for preloading
        // Use filenames only (not full paths) since HTML renderers will prepend CDN URL
        const applicationChunks = files
          .filter(f => /^Application.*\.js$/.test(f.name))
          .map(f => f.name);

        const applicationStyleChunks = files
          .filter(f => /^ApplicationStyle.*\.js$/.test(f.name))
          .map(f => f.name);

        return {
          buildVersion,
          files: manifestFiles,
          entrypoints: entrypointFiles,
          preload: {
            application: applicationChunks,
            applicationStyle: applicationStyleChunks,
          }
        };
      },
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
      filename: '[name]-[contenthash:8].js',
      chunkFilename: (pathData) => {
        // Use explicit name for named chunks, ID for auto-generated ones
        return pathData.chunk.name ? '[name]-[contenthash:8].js' : 'chunk.[id].[contenthash:8].js';
      },
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
      extensions: ['.ts', '.tsx', '.js'],
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
    plugins,
    optimization: {
      chunkIds: 'deterministic',
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        maxSize: 550000, // Split chunks larger than 550KB
        cacheGroups: {
          // React (stable, rarely changes - good for caching)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'react-vendors',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Monaco Editor (huge, only for lazy-loaded editors)
          monaco: {
            test: /[\\/]node_modules[\\/](monaco-editor|@monaco-editor)[\\/]/,
            name: 'monaco',
            priority: 15,
            reuseExistingChunk: true,
            chunks: 'async',  // Only include in async chunks
          },
          // KIRun runtime (large, only for lazy-loaded components)
          kirun: {
            test: /[\\/]node_modules[\\/]@fincity[\\/]kirun/,
            name: 'kirun',
            priority: 14,
            reuseExistingChunk: true,
          },
          // Path reactive state management
          pathReactive: {
            test: /[\\/]node_modules[\\/]@fincity[\\/]path-reactive/,
            name: 'path-reactive',
            priority: 13,
            reuseExistingChunk: true,
          },
          // Heavy Editor Components - only lazy-loaded implementation files
          editors: {
            test: /[\\/]src[\\/]components[\\/](PageEditor|KIRunEditor|FormEditor|FillerDefinitionEditor|FillerValueEditor|SchemaBuilder|TemplateEditor|TextEditor|ThemeEditor|MarkdownEditor)[\\/].*Lazy/,
            name: 'editors',
            priority: 12,
            reuseExistingChunk: true,
            chunks: 'async',  // Only include in async chunks (loaded via React.lazy)
            minSize: 10000,
          },
          // Table Components
          tableComponents: {
            test: /[\\/]src[\\/]components[\\/]TableComponents[\\/]/,
            name: 'table-components',
            priority: 11,
            reuseExistingChunk: true,
          },
          // Chart and Gallery (visualization components)
          visualization: {
            test: /[\\/]src[\\/]components[\\/](Chart|Gallery|Calendar|Carousel|SmallCarousel)[\\/]/,
            name: 'visualization',
            priority: 11,
            reuseExistingChunk: true,
          },
          // Form Components
          formComponents: {
            test: /[\\/]src[\\/]components[\\/](TextBox|TextArea|Dropdown|CheckBox|RadioButton|ToggleButton|Button|ButtonBar|FileUpload|ColorPicker|PhoneNumber|Otp|RangeSlider)[\\/]/,
            name: 'form-components',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Remaining node_modules
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 9,
            reuseExistingChunk: true,
          },
          // Split remaining large application code
          appCommon: {
            test: /[\\/]src[\\/](Engine|context|util)[\\/]/,
            name: 'app-common',
            priority: 8,
            reuseExistingChunk: true,
            minChunks: 2,
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