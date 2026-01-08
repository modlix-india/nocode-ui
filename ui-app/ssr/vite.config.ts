import { defineConfig, type PluginOption } from 'vite';
import path from 'path';
import fs from 'node:fs';

/**
 * SSR middleware plugin that handles all page requests
 * Returns pure HTML without any framework client-side code
 */
function ssrMiddlewarePlugin(): PluginOption {
	// Path to client dist directory for serving static files
	const clientDistPath = path.resolve(__dirname, '../client/dist');
	let initialized = false;

	return {
		name: 'ssr-middleware',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				// Initialize configuration and Redis on first request
				if (!initialized) {
					initialized = true;
					try {
						const { default: logger } = await import('./src/config/logger');
						const { loadConfig } = await import('./src/config/configLoader');
						const { initCacheInvalidationSubscriber } = await import('./src/cache/redis');

						await loadConfig();
						await initCacheInvalidationSubscriber();
						logger.info('SSR service initialized');
					} catch (error) {
						console.error('Failed to initialize SSR:', error);
					}
				}

				// Handle /js/dist/* static files - serve from client dist directory
				if (req.url?.startsWith('/js/dist/')) {
					const relativePath = req.url.replace('/js/dist/', '');
					const filePath = path.join(clientDistPath, relativePath);

					if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
						const ext = path.extname(filePath).toLowerCase();
						const contentTypes: Record<string, string> = {
							'.js': 'application/javascript',
							'.css': 'text/css',
							'.json': 'application/json',
							'.html': 'text/html',
							'.png': 'image/png',
							'.jpg': 'image/jpeg',
							'.jpeg': 'image/jpeg',
							'.gif': 'image/gif',
							'.svg': 'image/svg+xml',
							'.woff': 'font/woff',
							'.woff2': 'font/woff2',
							'.ttf': 'font/ttf',
							'.eot': 'application/vnd.ms-fontobject',
						};

						res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
						res.setHeader('Cache-Control', 'public, max-age=31536000');
						res.statusCode = 200;
						fs.createReadStream(filePath).pipe(res);
						return;
					}
				}

				// Handle /health endpoint
				if (req.method === 'GET' && req.url === '/health') {
					res.setHeader('Content-Type', 'application/json');
					res.statusCode = 200;
					res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
					return;
				}

				// Skip non-page requests (Vite's own assets, HMR, etc.)
				if (
					req.url?.startsWith('/@') ||
					req.url?.startsWith('/__') ||
					req.url?.startsWith('/node_modules') ||
					req.url?.includes('.') // files with extensions
				) {
					return next();
				}

				// Handle page requests - return pure HTML
				try {
					const { renderPage } = await import('./src/ssr/htmlRenderer');
					const html = await renderPage(req);

					res.setHeader('Content-Type', 'text/html; charset=utf-8');
					res.statusCode = 200;
					res.end(html);
				} catch (error) {
					console.error('SSR render error:', error);
					// Fall through to next handler on error
					next();
				}
			});
		},
	};
}

export default defineConfig({
	server: {
		port: 3080,
		host: '0.0.0.0', // Bind to all interfaces for Docker access
		allowedHosts: true, // Allow all hosts - SSR service can be accessed from any domain
	},
	plugins: [ssrMiddlewarePlugin()],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './src'),
		},
	},
});
