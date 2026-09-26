const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = async (env = {}) => {
  const publicUrl = env.publicUrl || '/';
  const buildVersion = Date.now().toString(36); // Short unique build identifier

  // Dynamically import ES module
  const { WebpackManifestPlugin } = await import('webpack-manifest-plugin');

  const plugins =  [
    new webpack.DefinePlugin({
      'globalThis.buildVersion': JSON.stringify(buildVersion),
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
        // Use actual filenames (with contenthash) so the server generates correct script tags
        //
        // `components-common` is listed alongside them because it is NOT
        // optional: it holds the modules Application and ApplicationStyle
        // share, so the app cannot render without it. Matching on the name
        // `Application` alone is what made this easy to get wrong -- the
        // chunk is still fetched by webpack's runtime either way, but without
        // a preload tag it arrives one round trip later, which would hand
        // back as latency most of what splitting it saved in bytes.
        const applicationChunks = files
          .filter(f => /^(Application|components-common).*\.js$/.test(f.name))
          .map(f => f.path.split('/').pop());

        const applicationStyleChunks = files
          .filter(f => /^ApplicationStyle.*\.js$/.test(f.name))
          .map(f => f.path.split('/').pop());

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
      publicPath: publicUrl,
      clean: {
        keep: /^(css|styleProperties)\//,
      }
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
          // World map: the geo plugin, the topojson reader and the atlas.
          //
          // `chunks: 'async'` is the whole point of this group, exactly as it is
          // for monaco above. The `vendors` group below matches all of
          // node_modules with no `chunks` restriction, so without this the three
          // packages are hoisted out of the dynamic import in Chart/chartjs/geo
          // and into the INITIAL entrypoint — measured, not guessed: they landed
          // in two initial vendors chunks the first time this was built. Every
          // page would then pay for a world atlas it never draws.
          //
          // Priority must stay above `vendors` (9) or that group wins.
          //
          // The d3 packages are NOT optional here. They are chartjs-chart-geo's
          // transitive dependencies, and naming only the three top-level
          // packages left d3-geo and d3-scale-chromatic behind in `vendors` --
          // 22KB gzipped added to the initial entrypoint for a map almost no
          // page draws. Every package listed arrived with the geo plugin and is
          // used by nothing else; `chunks: 'async'` means anything that ever
          // gains an initial consumer still gets its copy through `vendors`.
          // The atlases get a chunk EACH, above the group below, because a single
          // shared name merges them: the coarse atlas landed in the same chunk as
          // the plugin, so a map asking for the detailed one downloaded both and
          // drew with one. Naming per file is what keeps `geoResolution` honest.
          geoAtlas: {
            test: /[\\/]node_modules[\\/]world-atlas[\\/]/,
            name(module) {
              const m = /countries-(\d+m)\.json/.exec(module.resource || '');
              return m ? `chart-geo-atlas-${m[1]}` : 'chart-geo-atlas';
            },
            priority: 17,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          geo: {
            test: /[\\/]node_modules[\\/](chartjs-chart-geo|topojson-client|d3-geo|d3-scale-chromatic|d3-interpolate|d3-color|d3-array|internmap)[\\/]/,
            name: 'chart-geo',
            priority: 16,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          // three.js (~815KB across three chunks), only ever reached through the
          // dynamic import in util/three/threeLoader.ts. `chunks: 'async'` is
          // what keeps it out of the initial bundle, exactly as for monaco and
          // geo above: `vendors` below matches all of node_modules with no
          // `chunks` restriction and is INITIAL, so anything this group fails to
          // claim lands in the entrypoint.
          //
          // `name` MUST NOT be 'three'. Measured, not reasoned: with name:
          // 'three' this group silently never fired at all -- no error, no
          // warning, no chunk -- and all three of three's modules fell through
          // to `vendors`, adding ~2.3MB of modules to the initial entrypoint.
          // Renaming it to 'threejs' and changing nothing else made it work.
          // The collision is with the chunk webpack derives for the
          // src/components/util/three directory; the same class of bug fails
          // loudly when a webpackChunkName magic comment collides with a cache
          // group name ("Cache group X conflicts with existing chunk"), and
          // silently here. If you rename this, rebuild and check that
          // asset-manifest.json's entrypoint still has no three asset in it.
          // The Scene Editor's drag handles. Nothing on a customer page ever
          // reaches TransformControls, but the `three` group below matches all
          // of node_modules/three, so without a HIGHER priority group naming
          // this one file it lands in the chunk every page with a scene
          // downloads — the webpackChunkName at the import site cannot
          // override a cache group.
          threeEditor: {
            test: /[\\/]node_modules[\\/]three[\\/]examples[\\/]jsm[\\/]controls[\\/]TransformControls/,
            // NOT the same string as the webpackChunkName at the import site:
            // a magic comment and a cache group sharing a name is the
            // collision that makes a group silently never fire, which is why
            // the import site now carries no name at all.
            name: 'three-gizmo',
            priority: 19,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          three: {
            test: /[\\/]node_modules[\\/]three[\\/]/,
            name: 'threejs',
            priority: 18,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          // The WebGL components themselves. Deliberately NOT matching
          // src/components/util/three: sceneDocument.ts and easing.ts there are
          // pure, import no three, and are read by eagerly-registered component
          // definitions, so forcing them async-only would split them off from
          // the code that needs them at registration time.
          webgl: {
            test: /[\\/]src[\\/]components[\\/](ShaderBackground|ParticleField|ModelViewer|ScrollScene)[\\/]/,
            name: 'webgl',
            priority: 11,
            reuseExistingChunk: true,
            chunks: 'async',
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
          // Everything the component REGISTRY drags in, shared rather than
          // copied into both chunks that need it.
          //
          // `default` below only splits a module out once THREE chunks want
          // it. Application and ApplicationStyle are exactly two -- AppStyle
          // iterates the component map to emit styles, so it reaches every
          // component the app itself reaches -- so every module common to the
          // pair matched no group at all and was emitted TWICE. Measured on a
          // stats build: 130 modules, 2,028KB of parsed source duplicated
          // across the startup set. The largest copies were PageEditor
          // (278KB) and SubCompInfo (213KB), neither of which most pages ever
          // render.
          //
          // minChunks: 2 is the whole fix. The priority sits above `default`
          // and below every named group above it, so nothing already placed
          // moves.
          componentsCommon: {
            test: /[\\/]src[\\/](components|commonComponents|functions)[\\/]/,
            name: 'components-common',
            priority: 7,
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