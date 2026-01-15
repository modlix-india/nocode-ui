import { getRedisClient } from '../cache/redis.js';
import logger from '../config/logger.js';
import { getConfig } from '../config/configLoader.js';

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
 * 1. From URL path: /{appCode}/{clientCode}/page/{pageName}
 *    Example: /monkeytwo/SYSTEM/page/home
 * 2. From scheme/host/port via security API (when codes not in URL)
 *
 * Based on GatewayFilter.java logic
 */
export async function resolveCodesFromRequest(request: Request): Promise<Codes> {
	const url = new URL(request.url);
	const pathParts = url.pathname.split('/').filter(Boolean);

	// Try to extract from URL path first
	// Pattern: /{appCode}/{clientCode}/page/{pageName}
	const pageIndex = pathParts.indexOf('page');

	if (pageIndex >= 2) {
		// Codes are in URL: parts[0] = appCode, parts[1] = clientCode
		const codes = {
			appCode: pathParts[0],
			clientCode: pathParts[1],
		};
		logger.info('Resolved codes from URL path', { codes, pathname: url.pathname });
		return codes;
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
		const data = await response.json() as Record<string, unknown>;
		logger.info('Security service response', { data });

		let clientCode: string;
		let appCode: string;

		if (Array.isArray(data)) {
			// Array format [clientCode, appCode]
			clientCode = (data[0] as string) || DEFAULT_CLIENT;
			appCode = (data[1] as string) || DEFAULT_APP;
		} else if ('t1' in data && 't2' in data) {
			// Reactor Tuple2 format {t1: clientCode, t2: appCode}
			clientCode = (data.t1 as string) || DEFAULT_CLIENT;
			appCode = (data.t2 as string) || DEFAULT_APP;
		} else {
			// Object format {clientCode, appCode}
			clientCode = (data.clientCode as string) || DEFAULT_CLIENT;
			appCode = (data.appCode as string) || DEFAULT_APP;
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
 * Handles:
 * - /{appCode}/{clientCode}/page/{pageName} -> pageName
 * - /{appCode}/{clientCode}/page/{pageName}/param -> pageName (ignores path params)
 * - /{appCode}/{clientCode}/page/ -> index (default page)
 * - /page/{pageName} -> pageName
 * - /{pageName} -> pageName (when no 'page' in path)
 * - / -> index
 */
export function extractPageName(pathname: string): string {
	const pathParts = pathname.split('/').filter(Boolean);
	const pageIndex = pathParts.indexOf('page');

	if (pageIndex !== -1) {
		// Found 'page' in path
		if (pageIndex + 1 < pathParts.length) {
			// Only take the first segment after 'page' as the page name
			// This allows URLs like /page/walkInForm/3tioupvup1xsqSlDaWjdbU
			// to resolve to page 'walkInForm' (path params are handled by client-side routing)
			return pathParts[pageIndex + 1];
		}
		// 'page' is at the end (e.g., /app/client/page/ or /app/client/page)
		// Return 'index' to use the default page
		return 'index';
	}

	// No 'page' in path - treat first part as page name (or 'index' if empty)
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
