import { defineConfig, type PluginOption } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';

/**
 * Custom API middleware plugin for handling internal API endpoints
 * These endpoints are handled before TanStack Start routes
 */
function apiMiddlewarePlugin(): PluginOption {
	// Path to client dist directory for serving static files
	const clientDistPath = path.resolve(__dirname, '../client/dist');

	return {
		name: 'api-middleware',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				// Handle /js/dist/* static files - serve from client dist directory
				if (req.url?.startsWith('/js/dist/')) {
					const relativePath = req.url.replace('/js/dist/', '');
					const filePath = path.join(clientDistPath, relativePath);

					// Check if file exists
					if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
						// Determine content type
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
						res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache for static assets
						res.statusCode = 200;
						fs.createReadStream(filePath).pipe(res);
						return;
					}
				}

				// Handle /health endpoint
				if (req.method === 'GET' && req.url === '/health') {
					res.setHeader('Content-Type', 'application/json');
					res.statusCode = 200;
					res.end(
						JSON.stringify({
							status: 'healthy',
							timestamp: new Date().toISOString(),
						})
					);
					return;
				}

				// Handle /api/cache/invalidate endpoint
				if (req.method === 'POST' && req.url === '/api/cache/invalidate') {
					const INVALIDATION_SECRET =
						process.env.CACHE_INVALIDATION_SECRET || 'dev-secret';

					res.setHeader('Content-Type', 'application/json');

					// Verify authorization
					const authHeader = req.headers.authorization;
					if (authHeader !== `Bearer ${INVALIDATION_SECRET}`) {
						res.statusCode = 401;
						res.end(JSON.stringify({ error: 'Unauthorized' }));
						return;
					}

					try {
						// Parse request body
						const body = await new Promise<{ appCode?: string; clientCode?: string; pageName?: string }>(
							(resolve, reject) => {
								let data = '';
								req.on('data', (chunk) => (data += chunk));
								req.on('end', () => {
									try {
										resolve(JSON.parse(data));
									} catch {
										reject(new Error('Invalid JSON'));
									}
								});
								req.on('error', reject);
							}
						);

						if (!body.appCode) {
							res.statusCode = 400;
							res.end(JSON.stringify({ error: 'appCode is required' }));
							return;
						}

						// Import and use the invalidateCache function
						const { invalidateCache } = await import('./src/cache/redis');

						// Build pattern
						let pattern: string;
						if (body.pageName && body.clientCode) {
							pattern = `${body.appCode}:${body.clientCode}:${body.pageName}`;
						} else if (body.clientCode) {
							pattern = `${body.appCode}:${body.clientCode}:*`;
						} else if (body.pageName) {
							pattern = `${body.appCode}:*:${body.pageName}`;
						} else {
							pattern = `${body.appCode}:*`;
						}

						const invalidated = await invalidateCache(pattern);

						res.statusCode = 200;
						res.end(
							JSON.stringify({
								success: true,
								pattern,
								invalidated,
								timestamp: new Date().toISOString(),
							})
						);
						return;
					} catch (error) {
						console.error('Cache invalidation error:', error);
						res.statusCode = 500;
						res.end(JSON.stringify({ error: 'Internal server error' }));
						return;
					}
				}

				next();
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
	plugins: [
		apiMiddlewarePlugin(),
		tanstackStart({
			srcDirectory: 'src',
		}),
		viteReact(),
	],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './src'),
		},
	},
});
