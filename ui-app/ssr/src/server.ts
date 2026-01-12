import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadConfig } from './config/configLoader.js';
import { initCacheInvalidationSubscriber, invalidateCache, closeRedis, getRedisClient } from './cache/redis.js';
import { handlePageRequest } from './render/htmlRenderer.js';
import logger from './config/logger.js';

const PORT = Number.parseInt(process.env.SERVER_PORT || '3080', 10);
const HOST = process.env.SERVER_HOST || '0.0.0.0';

/**
 * Parse JSON body from request
 */
async function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
	return new Promise((resolve, reject) => {
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
	});
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, status: number, data: unknown): void {
	res.writeHead(status, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

/**
 * Handle health check endpoint
 * Returns 200 if server and Redis are operational, 503 otherwise
 */
async function handleHealth(res: ServerResponse): Promise<void> {
	const healthData: {
		status: string;
		timestamp: string;
		redis?: string;
		memory?: {
			heapUsed: string;
			heapTotal: string;
			rss: string;
		};
	} = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
	};

	// Check Redis connectivity
	try {
		const redis = getRedisClient();
		await redis.ping();
		healthData.redis = 'connected';
	} catch (error) {
		logger.warn('Health check: Redis not available', { error: String(error) });
		healthData.redis = 'disconnected';
		healthData.status = 'degraded';
	}

	// Add memory info
	const usage = process.memoryUsage();
	healthData.memory = {
		heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
		heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
		rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
	};

	// Return 200 even if degraded (Redis down shouldn't fail health check)
	// This allows server to stay up and serve uncached requests
	sendJson(res, 200, healthData);
}

/**
 * Handle cache invalidation endpoint
 */
async function handleCacheInvalidation(req: IncomingMessage, res: ServerResponse): Promise<void> {
	const INVALIDATION_SECRET = process.env.CACHE_INVALIDATION_SECRET || 'dev-secret';

	logger.info('Received HTTP cache invalidation request');

	// Verify authorization
	const authHeader = req.headers.authorization;
	if (authHeader !== `Bearer ${INVALIDATION_SECRET}`) {
		logger.warn('Cache invalidation request unauthorized');
		sendJson(res, 401, { error: 'Unauthorized' });
		return;
	}

	try {
		const body = await parseJsonBody<{
			appCode?: string;
			clientCode?: string;
			pageName?: string;
		}>(req);

		logger.info('Cache invalidation request body', {
			appCode: body.appCode,
			clientCode: body.clientCode,
			pageName: body.pageName,
		});

		if (!body.appCode) {
			logger.warn('Cache invalidation request missing appCode');
			sendJson(res, 400, { error: 'appCode is required' });
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

		sendJson(res, 200, {
			success: true,
			pattern,
			invalidated,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		logger.error('Cache invalidation error', { error: String(error) });
		sendJson(res, 500, { error: 'Internal server error' });
	}
}

/**
 * Main server entry point
 */
async function startServer(): Promise<void> {
	try {
		// Initialize configuration from Spring Cloud Config Server
		await loadConfig();
		logger.info('Configuration loaded');

		// Initialize Redis cache invalidation subscriber (non-blocking)
		try {
			await initCacheInvalidationSubscriber();
			logger.info('Cache invalidation subscriber initialized');
		} catch (error) {
			logger.error('Failed to initialize cache subscriber (continuing anyway)', { error: String(error) });
		}

		const server = createServer(async (req, res) => {
			try {
				const url = new URL(req.url || '/', `http://${req.headers.host}`);

				// Health check endpoint
				if (req.method === 'GET' && url.pathname === '/health') {
					await handleHealth(res);
					return;
				}

				// Cache invalidation endpoint
				if (req.method === 'POST' && url.pathname === '/api/cache/invalidate') {
					await handleCacheInvalidation(req, res);
					return;
				}

				// All other requests are page requests
				await handlePageRequest(req, res);
			} catch (error) {
				logger.error('Request handling error', {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					url: req.url
				});
				if (!res.headersSent) {
					res.writeHead(500, { 'Content-Type': 'text/html' });
					res.end('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Internal Server Error</h1></body></html>');
				}
			}
		});

		// Handle server errors
		server.on('error', (error) => {
			logger.error('Server error', { error: String(error) });
		});

		server.on('clientError', (err, socket) => {
			logger.warn('Client error', { error: String(err) });
			if (!socket.destroyed) {
				socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
			}
		});

		server.listen(PORT, HOST, () => {
			logger.info(`SSR server listening on http://${HOST}:${PORT}`, {
				nodeVersion: process.version,
				pid: process.pid,
				memory: process.memoryUsage(),
			});
		});

		// Graceful shutdown
		const shutdown = async () => {
			logger.info('Shutdown signal received, shutting down gracefully');
			server.close(async () => {
				try {
					await closeRedis();
					logger.info('Server closed');
					process.exit(0);
				} catch (error) {
					logger.error('Error during shutdown', { error: String(error) });
					process.exit(1);
				}
			});

			// Force exit after 30 seconds
			setTimeout(() => {
				logger.error('Forced shutdown after timeout');
				process.exit(1);
			}, 30000);
		};

		process.on('SIGTERM', shutdown);
		process.on('SIGINT', shutdown);

		// Handle uncaught exceptions and rejections
		process.on('uncaughtException', (error) => {
			logger.error('Uncaught exception - process will exit', {
				error: error.message,
				stack: error.stack
			});
			// Don't exit immediately - let the process crash naturally
			// This ensures Docker healthcheck detects the failure
		});

		process.on('unhandledRejection', (reason) => {
			logger.error('Unhandled promise rejection - process may exit', {
				reason: String(reason),
				reasonType: typeof reason
			});
		});

		// Log memory usage periodically
		setInterval(() => {
			const usage = process.memoryUsage();
			logger.debug('Memory usage', {
				heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
				heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
				rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
			});
		}, 60000); // Every minute

	} catch (error) {
		logger.error('Failed to initialize server', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	logger.error('Fatal server startup error', { error: String(error) });
	process.exit(1);
});
