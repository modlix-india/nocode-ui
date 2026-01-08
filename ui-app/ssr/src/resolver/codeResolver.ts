import { getRedisClient } from '../cache/redis';
import logger from '../config/logger';
import { getConfig } from '../config/configLoader';

function getGatewayUrl(): string {
	try {
		return getConfig().gateway.url;
	} catch {
		// Config not loaded yet, use env variable or default
		return process.env.GATEWAY_URL || 'http://localhost:8080';
	}
}

const DEFAULT_CLIENT = 'SYSTEM';
const DEFAULT_APP = 'nothing';

export interface Codes {
	appCode: string;
	clientCode: string;
}

/**
 * Resolves appCode and clientCode from the request.
 *
 * Two resolution strategies:
 * 1. From URL path: /{clientCode}/{appCode}/page/{pageName}
 * 2. From scheme/host/port via security API (when codes not in URL)
 *
 * Based on GatewayFilter.java logic
 */
export async function resolveCodesFromRequest(request: Request): Promise<Codes> {
	const url = new URL(request.url);
	const pathParts = url.pathname.split('/').filter(Boolean);

	// Try to extract from URL path first
	// Pattern: /{clientCode}/{appCode}/page/{pageName}
	const pageIndex = pathParts.indexOf('page');

	if (pageIndex >= 2) {
		// Codes are in URL: parts[0] = clientCode, parts[1] = appCode
		return {
			clientCode: pathParts[0],
			appCode: pathParts[1],
		};
	}

	// Fallback: resolve from scheme/host/port via security API
	const scheme = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
	const host = request.headers.get('x-forwarded-host') || url.hostname;
	const port = request.headers.get('x-forwarded-port') || url.port || (scheme === 'https' ? '443' : '80');

	return resolveFromSecurityService(scheme, host, port);
}

/**
 * Resolves appCode/clientCode from scheme, host, port via security service.
 * Results are cached in Redis.
 */
async function resolveFromSecurityService(
	scheme: string,
	host: string,
	port: string
): Promise<Codes> {
	const cacheKey = `resolver:${scheme}:${host}:${port}`;

	try {
		const redis = getRedisClient();

		// Check cache first
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		// Call security service internal endpoint (same as GatewayFilter.java uses)
		const gatewayUrl = getGatewayUrl();
		const response = await fetch(
			`${gatewayUrl}/api/security/clients/internal/getClientNAppCode?scheme=${scheme}&host=${host}&port=${port}`
		);

		if (!response.ok) {
			logger.warn('Security service returned error, using defaults', { status: response.status });
			return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP };
		}

		// Response is Tuple2 from Java which serializes as {"t1": clientCode, "t2": appCode}
		const data = await response.json();
		logger.info('Security service response', { data });

		let clientCode: string;
		let appCode: string;

		if (Array.isArray(data)) {
			// Array format [clientCode, appCode]
			clientCode = data[0] || DEFAULT_CLIENT;
			appCode = data[1] || DEFAULT_APP;
		} else if (data.t1 !== undefined && data.t2 !== undefined) {
			// Reactor Tuple2 format {t1: clientCode, t2: appCode}
			clientCode = data.t1 || DEFAULT_CLIENT;
			appCode = data.t2 || DEFAULT_APP;
		} else {
			// Object format {clientCode, appCode}
			clientCode = data.clientCode || DEFAULT_CLIENT;
			appCode = data.appCode || DEFAULT_APP;
		}

		const codes: Codes = { clientCode, appCode };

		// Cache for 10 minutes
		await redis.setex(cacheKey, 600, JSON.stringify(codes));

		return codes;
	} catch (error) {
		logger.error('Failed to resolve codes from security service', {
			error: String(error),
			scheme,
			host,
			port,
		});
		return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP };
	}
}

/**
 * Extracts the page name from the URL path.
 * Handles both /page/{pageName} and /{clientCode}/{appCode}/page/{pageName}
 */
export function extractPageName(pathname: string): string {
	const pathParts = pathname.split('/').filter(Boolean);
	const pageIndex = pathParts.indexOf('page');

	if (pageIndex !== -1 && pageIndex + 1 < pathParts.length) {
		// Everything after 'page' is the page name (can include slashes)
		return pathParts.slice(pageIndex + 1).join('/');
	}

	// No 'page' in path - treat first part as page name
	return pathParts[0] || 'index';
}

/**
 * Gets auth token from request (header or cookie)
 */
export function getAuthToken(request: Request): string | null {
	// Check Authorization header first
	const authHeader = request.headers.get('Authorization');
	if (authHeader) return authHeader;

	// Check cookie
	const cookies = request.headers.get('Cookie');
	if (cookies) {
		const match = cookies.match(/AuthToken=([^;]+)/);
		if (match) return match[1];
	}

	return null;
}
