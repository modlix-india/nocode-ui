import { defineConfig, type PluginOption } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Custom API middleware plugin for handling internal API endpoints
 * These endpoints are handled before TanStack Start routes
 *
 * Note: Static assets (/js/dist/*) are served from CDN, not locally
 */
function apiMiddlewarePlugin(): PluginOption {
	let initialized = false;

	return {
		name: 'api-middleware',
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
					const { default: logger } = await import('./src/config/logger');
					const INVALIDATION_SECRET =
						process.env.CACHE_INVALIDATION_SECRET || 'dev-secret';

					res.setHeader('Content-Type', 'application/json');

					logger.info('Received HTTP cache invalidation request');

					// Verify authorization
					const authHeader = req.headers.authorization;
					if (authHeader !== `Bearer ${INVALIDATION_SECRET}`) {
						logger.warn('Cache invalidation request unauthorized');
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

						logger.info('Cache invalidation request body', {
							appCode: body.appCode,
							clientCode: body.clientCode,
							pageName: body.pageName,
						});

						if (!body.appCode) {
							logger.warn('Cache invalidation request missing appCode');
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

						logger.info('HTTP cache invalidation completed', {
							pattern,
							keysRemoved: invalidated,
						});

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
						logger.error('Cache invalidation error', { error: String(error) });
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
