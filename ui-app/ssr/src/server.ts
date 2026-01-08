/**
 * Production SSR server
 * Standalone Node.js HTTP server for serving SSR pages
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import logger from './config/logger.js';
import { loadConfig, getConfig } from './config/configLoader.js';
import { initCacheInvalidationSubscriber } from './cache/redis.js';
import { renderPage } from './ssr/htmlRenderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to client dist directory for serving static files
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const CONTENT_TYPES: Record<string, string> = {
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
	'.ico': 'image/x-icon',
};

/**
 * Serve static file from client dist directory
 */
function serveStaticFile(
	res: http.ServerResponse,
	filePath: string
): boolean {
	try {
		if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
			return false;
		}

		const ext = path.extname(filePath).toLowerCase();
		const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

		res.setHeader('Content-Type', contentType);
		res.setHeader('Cache-Control', 'public, max-age=31536000');
		res.statusCode = 200;
		fs.createReadStream(filePath).pipe(res);
		return true;
	} catch {
		return false;
	}
}

/**
 * Handle incoming HTTP request
 */
async function handleRequest(
	req: http.IncomingMessage,
	res: http.ServerResponse
): Promise<void> {
	const url = req.url || '/';

	// Health check endpoint
	if (req.method === 'GET' && url === '/health') {
		res.setHeader('Content-Type', 'application/json');
		res.statusCode = 200;
		res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
		return;
	}

	// Serve static files from /js/dist/*
	if (url.startsWith('/js/dist/')) {
		const relativePath = url.replace('/js/dist/', '').split('?')[0]; // Remove query params
		const filePath = path.join(clientDistPath, relativePath);

		if (serveStaticFile(res, filePath)) {
			return;
		}
	}

	// Skip requests for files with extensions (likely static assets)
	const urlPath = url.split('?')[0];
	if (urlPath.includes('.') && !urlPath.endsWith('/')) {
		res.statusCode = 404;
		res.end('Not Found');
		return;
	}

	// Handle page requests - render SSR HTML
	try {
		const html = await renderPage(req);
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.statusCode = 200;
		res.end(html);
	} catch (error) {
		logger.error('SSR render error', { error: String(error), url });
		res.statusCode = 500;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(`<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<div id="app"></div>
<script src="/js/dist/vendors.js"></script>
<script src="/js/dist/index.js"></script>
</body>
</html>`);
	}
}

/**
 * Start the SSR server
 */
async function startServer(): Promise<void> {
	try {
		// Load configuration from Spring Cloud Config Server
		await loadConfig();

		// Initialize Redis cache invalidation subscriber
		await initCacheInvalidationSubscriber();

		const config = getConfig();
		const port = config.server.port;

		const server = http.createServer(handleRequest);

		server.listen(port, '0.0.0.0', () => {
			logger.info('SSR server started', { port, environment: process.env.INSTANCE_ENVIRONMENT || 'Local' });
		});

		// Graceful shutdown
		const shutdown = () => {
			logger.info('Shutting down SSR server...');
			server.close(() => {
				logger.info('SSR server stopped');
				process.exit(0);
			});
		};

		process.on('SIGTERM', shutdown);
		process.on('SIGINT', shutdown);
	} catch (error) {
		logger.error('Failed to start SSR server', { error: String(error) });
		process.exit(1);
	}
}

startServer();
