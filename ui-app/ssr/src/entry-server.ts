import { createServer } from 'node:http';
import { loadConfig } from './config/configLoader.js';
import { initCacheInvalidationSubscriber, invalidateCache } from './cache/redis.js';
import logger from './config/logger.js';

const PORT = parseInt(process.env.SERVER_PORT || '3080', 10);
const HOST = process.env.SERVER_HOST || '0.0.0.0';

/**
 * Production server entry point for TanStack Start SSR
 *
 * This wraps the TanStack Start fetch handler with a Node.js HTTP server
 * and adds custom endpoints for health checks and cache invalidation.
 */
async function startServer() {
	// Initialize configuration from Spring Cloud Config Server
	await loadConfig();
	logger.info('Configuration loaded');

	// Initialize Redis cache invalidation subscriber
	await initCacheInvalidationSubscriber();
	logger.info('Cache invalidation subscriber initialized');

	// Dynamically import the built server handler
	const { default: handler } = await import('../dist/server/server.js');

	const server = createServer(async (req, res) => {
		const url = new URL(req.url || '/', `http://${req.headers.host}`);

		// Health check endpoint
		if (req.method === 'GET' && url.pathname === '/health') {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				status: 'healthy',
				timestamp: new Date().toISOString(),
			}));
			return;
		}

		// Cache invalidation endpoint
		if (req.method === 'POST' && url.pathname === '/api/cache/invalidate') {
			const INVALIDATION_SECRET = process.env.CACHE_INVALIDATION_SECRET || 'dev-secret';

			res.setHeader('Content-Type', 'application/json');
			logger.info('Received HTTP cache invalidation request');

			// Verify authorization
			const authHeader = req.headers.authorization;
			if (authHeader !== `Bearer ${INVALIDATION_SECRET}`) {
				logger.warn('Cache invalidation request unauthorized');
				res.writeHead(401);
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
					res.writeHead(400);
					res.end(JSON.stringify({ error: 'appCode is required' }));
					return;
				}

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

				res.writeHead(200);
				res.end(JSON.stringify({
					success: true,
					pattern,
					invalidated,
					timestamp: new Date().toISOString(),
				}));
				return;
			} catch (error) {
				logger.error('Cache invalidation error', { error: String(error) });
				res.writeHead(500);
				res.end(JSON.stringify({ error: 'Internal server error' }));
				return;
			}
		}

		// Forward all other requests to TanStack Start handler
		try {
			// Convert Node.js request to Fetch Request
			const headers = new Headers();
			for (const [key, value] of Object.entries(req.headers)) {
				if (value) {
					if (Array.isArray(value)) {
						value.forEach(v => headers.append(key, v));
					} else {
						headers.set(key, value);
					}
				}
			}

			const bodyBuffer = req.method !== 'GET' && req.method !== 'HEAD'
				? await new Promise<Buffer>((resolve, reject) => {
						const chunks: Buffer[] = [];
						req.on('data', chunk => chunks.push(chunk));
						req.on('end', () => resolve(Buffer.concat(chunks)));
						req.on('error', reject);
					})
				: undefined;

			// Convert Buffer to Uint8Array for Request body compatibility
			const body = bodyBuffer ? new Uint8Array(bodyBuffer) : undefined;

			const request = new Request(url.toString(), {
				method: req.method,
				headers,
				body,
				// @ts-ignore - duplex is required for streaming bodies
				duplex: body ? 'half' : undefined,
			});

			// Call TanStack Start handler
			const response = await handler.fetch(request);

			// Convert Fetch Response to Node.js response
			res.statusCode = response.status;
			response.headers.forEach((value, key) => {
				res.setHeader(key, value);
			});

			if (response.body) {
				const reader = response.body.getReader();
				const pump = async () => {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						res.write(value);
					}
					res.end();
				};
				await pump();
			} else {
				res.end(await response.text());
			}
		} catch (error) {
			logger.error('Request handling error', { error: String(error), url: url.pathname });
			res.writeHead(500);
			res.end('Internal Server Error');
		}
	});

	server.listen(PORT, HOST, () => {
		logger.info(`SSR server listening on http://${HOST}:${PORT}`);
	});

	// Graceful shutdown
	process.on('SIGTERM', () => {
		logger.info('SIGTERM received, shutting down gracefully');
		server.close(() => {
			logger.info('Server closed');
			process.exit(0);
		});
	});
}

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});
