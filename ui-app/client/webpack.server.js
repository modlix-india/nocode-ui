const path = require('path');
const webpack = require('webpack');

// The client built for Node, for the server render of landing pages (see
// ui-app/ssr/HYDRATION_PLAN.md). Same loader and aliases as the browser build so the server
// renders the exact components the browser hydrates; one file, because a server has no use for
// chunks and every lazy import resolves before the render finishes.
module.exports = {
	mode: 'production',
	target: 'node',
	entry: './src/ssr/serverEntry.tsx',
	output: {
		filename: 'serverEntry.js',
		path: path.resolve(__dirname, 'dist-server'),
		library: { type: 'commonjs2' },
		clean: true,
	},
	optimization: { minimize: false, splitChunks: false },
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules\/(?!@fincity)/,
				use: [{ loader: require.resolve('ts-loader'), options: { transpileOnly: true } }],
			},
			{ test: /\.(png|jpg|gif|svg)$/, type: 'asset/inline' },
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		symlinks: true,
		mainFields: ['module', 'main'],
		alias: {
			react: path.resolve(__dirname, 'node_modules/react'),
			'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
			'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor'),
			'@fincity/kirun-js': path.resolve(__dirname, 'node_modules/@fincity/kirun-js'),
		},
	},
	plugins: [
		// The output is CommonJS, but CI copies it into the SSR image under /app, whose package.json
		// says "type": "module". Node takes a .js file's module type from the nearest package.json,
		// so there the bundle loaded as ESM and every render died on `require is not defined`.
		// This package.json beside the bundle keeps it CommonJS wherever it is copied.
		{
			apply(compiler) {
				compiler.hooks.thisCompilation.tap('CommonJsPackageJson', compilation => {
					compilation.hooks.processAssets.tap(
						{ name: 'CommonJsPackageJson', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
						() => compilation.emitAsset('package.json', new webpack.sources.RawSource('{ "type": "commonjs" }\n')),
					);
				});
			},
		},
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		new webpack.DefinePlugin({
			// No buildVersion here: it stamps asset URLs (AppStyle's stylesheet), so the server must
			// carry the SAME version as the client bundle it pairs with or hydration fails on the
			// first <link>. The SSR process sets globalThis.buildVersion from the deployed client.
			__ANALYTICS_INGESTION_HOST__: JSON.stringify(''),
		}),
	],
};
