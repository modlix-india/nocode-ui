import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadConfig, getConfig } from './config/configLoader.js';
import { initCacheInvalidationSubscriber, invalidateCache, closeRedis } from './cache/redis.js';
import { handlePageRequest } from './render/htmlRenderer.js';
import logger from './config/logger.js';

const PORT = parseInt(process.env.SERVER_PORT || '3080', 10);
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
 */
function handleHealth(res: ServerResponse): void {
	sendJson(res, 200, {
		status: 'healthy',
		timestamp: new Date().toISOString(),
	});
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
	// Initialize configuration from Spring Cloud Config Server
	await loadConfig();
	logger.info('Configuration loaded');

	// Initialize Redis cache invalidation subscriber
	await initCacheInvalidationSubscriber();
	logger.info('Cache invalidation subscriber initialized');

	const server = createServer(async (req, res) => {
		const url = new URL(req.url || '/', `http://${req.headers.host}`);

		// Health check endpoint
		if (req.method === 'GET' && url.pathname === '/health') {
			handleHealth(res);
			return;
		}

		// Cache invalidation endpoint
		if (req.method === 'POST' && url.pathname === '/api/cache/invalidate') {
			await handleCacheInvalidation(req, res);
			return;
		}

		// All other requests are page requests
		try {
			await handlePageRequest(req, res);
		} catch (error) {
			logger.error('Request handling error', { error: String(error), url: url.pathname });
			res.writeHead(500, { 'Content-Type': 'text/html' });
			res.end('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Internal Server Error</h1></body></html>');
		}
	});

	server.listen(PORT, HOST, () => {
		logger.info(`SSR server listening on http://${HOST}:${PORT}`);
	});

	// Graceful shutdown
	const shutdown = async () => {
		logger.info('Shutdown signal received, shutting down gracefully');
		server.close(async () => {
			await closeRedis();
			logger.info('Server closed');
			process.exit(0);
		});
	};

	process.on('SIGTERM', shutdown);
	process.on('SIGINT', shutdown);
}

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});
