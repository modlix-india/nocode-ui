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
	/**
	 * Which surface this hostname serves: 'LIVE' or 'DRAFT'.
	 *
	 * Taken from the same security-service lookup the gateway itself uses, so SSR
	 * and the gateway can never disagree about it. This is deliberately not read
	 * from an inbound header: the gateway strips x-draft from every request, and a
	 * caller-supplied one would be a way to force draft pre-renders and split the
	 * SSR cache at will.
	 *
	 * Path-based resolution (/{appCode}/{clientCode}/page/...) is always LIVE.
	 */
	urlType?: string;
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

	const scheme = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
	const host = request.headers.get('x-forwarded-host') || url.hostname;
	const port = request.headers.get('x-forwarded-port') || url.port || (scheme === 'https' ? '443' : '80');

	if (pageIndex >= 2) {
		// Codes are in URL: parts[0] = appCode, parts[1] = clientCode
		const codes: Codes = {
			appCode: pathParts[0],
			clientCode: pathParts[1],
		};

		// A path-prefixed URL is LIVE on every hostname but one. The page editor's
		// canvases run on a `t-<32 hex>` host, which is an editing session's grant of
		// the draft surface, and there the path prefix is the point: it names the
		// client being previewed while the token names who may preview it.
		//
		// Without this the shell would be rendered live -- live definitions inlined
		// into __APP_BOOTSTRAP__, no data-draft attribute, and a live entry under a
		// draft cache key -- while every request the page then made was drafted.
		codes.urlType = (await resolveDraftTokenType(host, codes.appCode, codes.clientCode))
			? 'DRAFT'
			: 'LIVE';

		logger.info('Resolved codes from URL path', { codes, pathname: url.pathname });
		return codes;
	}

	// Fallback: resolve from scheme/host/port via security API
	return resolveFromSecurityService(scheme, host, port);
}

/** `t-` plus 32 lowercase hex, matched over the first label only. */
const DRAFT_TOKEN_LABEL = /^t-[0-9a-f]{32}$/;

/**
 * Whether a draft-edit token hostname grants the draft surface for these codes.
 *
 * Cached for a minute rather than the ten the hostname resolver uses: a token is
 * short-lived and extended in place, so a stale yes must not outlive it by much.
 * Any failure is a no -- a pre-render that comes back live is wrong but harmless,
 * one that comes back draft when it should not is a leak.
 */
async function resolveDraftTokenType(
	host: string,
	appCode: string,
	clientCode: string
): Promise<boolean> {
	const label = host.split(':')[0].split('.')[0];
	if (!DRAFT_TOKEN_LABEL.test(label)) return false;

	const cacheKey = `draftToken:${host}:${appCode}:${clientCode}`;

	try {
		const redis = getRedisClient();

		const cached = await redis.get(cacheKey);
		if (cached) return cached === '1';

		const response = await fetch(
			`${getGatewayUrl()}/api/security/clienturls/internal/draft/token/resolve` +
				`?host=${encodeURIComponent(host)}&appCode=${encodeURIComponent(appCode)}` +
				`&clientCode=${encodeURIComponent(clientCode)}`
		);

		if (!response.ok) return false;

		// Reactor Tuple4 {t1: allowed, t2: expiresAtEpochSeconds, t3: appCode, t4: clientCode},
		// or the same four as an array.
		const data = (await response.json()) as Record<string, unknown> | unknown[];
		const allowed = Array.isArray(data) ? data[0] : data.t1;
		const expiresAt = Number(Array.isArray(data) ? data[1] : data.t2);

		const granted = allowed === true && expiresAt * 1000 > Date.now();

		await redis.setex(cacheKey, 60, granted ? '1' : '0');

		return granted;
	} catch (error) {
		logger.error('Failed to resolve a draft-edit token, rendering live', {
			error: String(error),
			host,
		});
		return false;
	}
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
			`${gatewayUrl}/api/security/clients/internal/getClientNAppCodeNType?scheme=${scheme}&host=${host}&port=${port}`
		);

		if (!response.ok) {
			logger.warn('Security service returned error, using defaults', { status: response.status });
			return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP, urlType: 'LIVE' };
		}

		// Response is Tuple3 from Java: {"t1": clientCode, "t2": appCode, "t3": urlType}
		const data = await response.json() as Record<string, unknown>;
		logger.info('Security service response', { data });

		let clientCode: string;
		let appCode: string;
		let urlType = 'LIVE';

		if (Array.isArray(data)) {
			// Array format [clientCode, appCode, urlType]
			clientCode = (data[0] as string) || DEFAULT_CLIENT;
			appCode = (data[1] as string) || DEFAULT_APP;
			urlType = (data[2] as string) || 'LIVE';
		} else if ('t1' in data && 't2' in data) {
			// Reactor Tuple3 format {t1: clientCode, t2: appCode, t3: urlType}
			clientCode = (data.t1 as string) || DEFAULT_CLIENT;
			appCode = (data.t2 as string) || DEFAULT_APP;
			urlType = (data.t3 as string) || 'LIVE';
		} else {
			// Object format {clientCode, appCode, urlType}
			clientCode = (data.clientCode as string) || DEFAULT_CLIENT;
			appCode = (data.appCode as string) || DEFAULT_APP;
			urlType = (data.urlType as string) || 'LIVE';
		}

		const codes: Codes = { clientCode, appCode, urlType };

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
		return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP, urlType: 'LIVE' };
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
