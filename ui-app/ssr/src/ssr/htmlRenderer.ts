/**
 * Pure HTML renderer for SSR
 * Renders pages as HTML without any React/framework client-side code
 * The client bundle (vendors.js, index.js) handles rendering
 */

import type { IncomingMessage } from 'http';
import logger from '../config/logger';
import { getConfig } from '../config/configLoader';
import {
	resolveCodesFromRequest,
	extractPageName,
	getAuthToken,
} from '../resolver/codeResolver';
import {
	fetchAllPageData,
	type ApplicationDefinition,
	type PageDefinition,
	type ThemeDefinition,
} from '../api/client';
import { getCachedData, setCachedData, generateCacheKey } from '../cache/redis';

interface CachedPageData {
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
	resolvedPageName: string;
	appCode: string;
	clientCode: string;
	cachedAt: number;
}

/**
 * Convert IncomingMessage to Request-like object for code resolver
 */
function createRequestFromIncoming(req: IncomingMessage): Request {
	const protocol = (req.headers['x-forwarded-proto'] as string) || 'http';
	const host =
		(req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
	const url = `${protocol}://${host}${req.url || '/'}`;

	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			headers.set(key, Array.isArray(value) ? value.join(', ') : value);
		}
	}

	return new Request(url, {
		method: req.method || 'GET',
		headers,
	});
}

/**
 * Get CDN configuration
 */
function getCdnConfig(): {
	hostName: string;
	stripAPIPrefix: boolean;
	replacePlus: boolean;
	resizeOptionsType: string;
} {
	try {
		const config = getConfig();
		return {
			hostName: config.cdn.hostName || '',
			stripAPIPrefix: config.cdn.stripAPIPrefix,
			replacePlus: config.cdn.replacePlus,
			resizeOptionsType: config.cdn.resizeOptionsType || '',
		};
	} catch {
		return {
			hostName: '',
			stripAPIPrefix: true,
			replacePlus: false,
			resizeOptionsType: '',
		};
	}
}

/**
 * Generate HTML for the page
 * Follows the same structure as the client's index.html
 */
function generateHtml(pageData: CachedPageData): string {
	const { application, page, theme, resolvedPageName, appCode, clientCode } = pageData;
	const appProps = application?.properties || {};
	const pageProps = page?.properties || {};

	// Build title
	let title = appProps.title || 'Loading...';
	if (pageProps.title?.name?.value) {
		if (pageProps.title?.append?.value) {
			title = `${pageProps.title.name.value} - ${title}`;
		} else {
			title = pageProps.title.name.value;
		}
	}

	// Build meta tags
	const metaTags: string[] = [];

	// SEO meta tags from page
	const seo = pageProps.seo;
	if (seo?.description?.value) {
		metaTags.push(
			`<meta name="description" content="${escapeHtml(seo.description.value)}">`
		);
	}
	if (seo?.keywords?.value) {
		metaTags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.value)}">`);
	}

	// Open Graph meta tags
	if (seo?.ogTitle?.value) {
		metaTags.push(
			`<meta property="og:title" content="${escapeHtml(seo.ogTitle.value)}">`
		);
	}
	if (seo?.ogDescription?.value) {
		metaTags.push(
			`<meta property="og:description" content="${escapeHtml(seo.ogDescription.value)}">`
		);
	}
	if (seo?.ogImage?.value) {
		metaTags.push(
			`<meta property="og:image" content="${escapeHtml(seo.ogImage.value)}">`
		);
	}

	// Application-level meta tags
	if (appProps.metas && Array.isArray(appProps.metas)) {
		for (const meta of appProps.metas) {
			if (meta.name && meta.content) {
				metaTags.push(
					`<meta name="${escapeHtml(meta.name)}" content="${escapeHtml(meta.content)}">`
				);
			}
		}
	}

	// CDN configuration
	const cdn = getCdnConfig();
	logger.debug('CDN config for HTML generation', { cdnHostName: cdn.hostName });
	const jsPath = cdn.hostName ? `https://${cdn.hostName}/js/dist` : '/js/dist';

	// Use the actual page name from the returned page definition
	// This handles cases where a secured page returns a login page instead
	const actualPageName = page?.name || resolvedPageName;

	// Build __APP_BOOTSTRAP__ data in the format the client expects
	const bootstrapData = {
		application,
		pageDefinition: { [actualPageName]: page },
		theme,
		styles: null, // Styles are loaded via api/ui/style
		urlDetails: {
			pageName: actualPageName,
			appCode,
			clientCode,
		},
	};

	// Build global variable assignments
	const globalVars: string[] = [
		'globalThis.nodeDev = true;',
		`window.__APP_BOOTSTRAP__ = ${JSON.stringify(bootstrapData)};`,
	];

	// CDN globals (if configured)
	if (cdn.hostName) {
		globalVars.push(`globalThis.cdnPrefix = '${cdn.hostName}';`);
		globalVars.push(`globalThis.cdnStripAPIPrefix = ${cdn.stripAPIPrefix};`);
		globalVars.push(`globalThis.cdnReplacePlus = ${cdn.replacePlus};`);
		if (cdn.resizeOptionsType) {
			globalVars.push(`globalThis.cdnResizeOptionsType = '${cdn.resizeOptionsType}';`);
		}
	}

	// Domain codes
	if (appCode) {
		globalVars.push(`globalThis.domainAppCode = '${appCode}';`);
	}
	if (clientCode) {
		globalVars.push(`globalThis.domainClientCode = '${clientCode}';`);
	}

	// Local static prefix (when no CDN)
	globalVars.push(
		`globalThis.__LOCAL_STATIC_PREFIX__ = ${cdn.hostName ? 'null' : "'/js/dist'"};`
	);

	// Loading animation styles (same as original index.html)
	const loaderStyles = `@keyframes loaderAnimation {
	0% { background-position: 0% 0%; }
	50% { background-position: 90% 0%; }
	100% { background-position: 0% 0%; }
}`;

	const loaderDiv = `<div style="position: fixed; top: 0px; left: 0px; width: 100%; height: 3px; opacity: 0.5; background: linear-gradient(90deg, rgba(36, 36, 36, 1) 0%, rgba(117, 117, 117, 1) 20%, rgba(144, 144, 144, 1) 40%, rgba(175, 175, 175, 1) 60%, rgba(36, 36, 36, 1) 80%, rgba(117, 117, 112, 1) 100%); display: block; animation: loaderAnimation 1s ease-in-out infinite; background-size: 200%;"></div>`;

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>${globalVars.join('\n        ')}</script>
    <title>${escapeHtml(title)}</title>
    ${metaTags.join('\n    ')}
    <script defer src="${jsPath}/vendors.js"></script>
    <script defer src="${jsPath}/index.js"></script>
</head>
<body>
    <div id="app">
        <style>${loaderStyles}</style>
        ${loaderDiv}
    </div>
    <link rel="stylesheet" id="serviceStyle">
    <script>document.getElementById('serviceStyle').setAttribute('href', 'api/ui/style');</script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: unknown): string {
	if (text === null || text === undefined) {
		return '';
	}
	let str: string;
	if (typeof text === 'string') {
		str = text;
	} else if (typeof text === 'number' || typeof text === 'boolean') {
		str = String(text);
	} else {
		// For objects/arrays, return empty string (don't render [object Object])
		return '';
	}
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Generate minimal fallback HTML when SSR fails
 */
function generateFallbackHtml(): string {
	const cdn = getCdnConfig();
	const jsPath = cdn.hostName ? `https://${cdn.hostName}/js/dist` : '/js/dist';

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>globalThis.nodeDev = true;</script>
    <title>Loading...</title>
    <script defer src="${jsPath}/vendors.js"></script>
    <script defer src="${jsPath}/index.js"></script>
</head>
<body>
    <div id="app"></div>
    <link rel="stylesheet" id="serviceStyle">
    <script>document.getElementById('serviceStyle').setAttribute('href', 'api/ui/style');</script>
</body>
</html>`;
}

/**
 * Render a page to HTML
 */
export async function renderPage(req: IncomingMessage): Promise<string> {
	const startTime = Date.now();

	try {
		// Create Request object from IncomingMessage
		const request = createRequestFromIncoming(req);
		const url = new URL(request.url);

		// Resolve app/client codes from request
		const codes = await resolveCodesFromRequest(request);
		const pageName = extractPageName(url.pathname);
		const authToken = getAuthToken(request);

		logger.debug('Rendering page', {
			pageName,
			appCode: codes.appCode,
			clientCode: codes.clientCode,
			hasAuth: !!authToken,
		});

		// Check cache first (only for non-authenticated requests)
		let pageData: CachedPageData | null = null;
		const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, pageName);

		if (!authToken) {
			pageData = await getCachedData<CachedPageData>(cacheKey);
			if (pageData) {
				logger.debug('Cache hit', { cacheKey });
			}
		}

		// Fetch data if not cached
		if (!pageData) {
			const fetchOptions = {
				appCode: codes.appCode,
				clientCode: codes.clientCode,
				authToken,
			};

			const { application, page, theme, resolvedPageName } = await fetchAllPageData(
				pageName,
				fetchOptions
			);

			pageData = {
				application,
				page,
				theme,
				resolvedPageName,
				appCode: codes.appCode,
				clientCode: codes.clientCode,
				cachedAt: Date.now(),
			};

			// Cache the result (only for non-authenticated requests)
			if (!authToken) {
				try {
					const config = getConfig();
					await setCachedData(cacheKey, pageData, config.cache.ttlSeconds);
					logger.debug('Cached page data', { cacheKey, ttl: config.cache.ttlSeconds });
				} catch {
					// Ignore cache errors
				}
			}
		}

		// Generate HTML
		const html = generateHtml(pageData);

		const duration = Date.now() - startTime;
		logger.info('Page rendered', {
			pageName: pageData.resolvedPageName,
			appCode: codes.appCode,
			clientCode: codes.clientCode,
			durationMs: duration,
			cached: pageData.cachedAt < startTime,
		});

		return html;
	} catch (error) {
		logger.error('Error rendering page', { error: String(error), url: req.url });

		// Return fallback HTML that lets the client handle everything
		return generateFallbackHtml();
	}
}
