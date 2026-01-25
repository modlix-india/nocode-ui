import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveCodesFromRequest, extractPageName, getAuthToken } from '../resolver/codeResolver.js';
import {
	fetchAllPageData,
	type PageDefinition,
	type ApplicationDefinition,
	type ThemeDefinition,
} from '../api/client.js';
import { getCachedData, setCachedData, generateCacheKey, getCachedHtml, setCachedHtml, getCachedGzippedHtml } from '../cache/redis.js';
import { getConfig } from '../config/configLoader.js';
import logger from '../config/logger.js';
import { loadManifest, getCriticalChunks } from '../util/manifestLoader.js';
// Key compression removed - doesn't help gzipped transfer size (only 14% savings)
// and adds 10-20ms CPU overhead that hurts TTFB/FBBT

// Load manifest at startup
const assetManifest = loadManifest();
if (assetManifest) {
	logger.info('Asset manifest loaded successfully', {
		applicationChunks: assetManifest.preload.application.length,
		styleChunks: assetManifest.preload.applicationStyle.length,
	});
} else {
	logger.warn('Asset manifest not found or invalid - preload optimization disabled');
}

interface CDNConfig {
	hostName: string;
	stripAPIPrefix: boolean;
	replacePlus: boolean;
	resizeOptionsType: string;
}

interface CachedPageData {
	application: ApplicationDefinition;
	page: PageDefinition;
	theme: ThemeDefinition | null;
	codes: { appCode: string; clientCode: string };
	pageName: string;
	cachedAt: number;
}

/**
 * Convert camelCase to kebab-case (e.g., defaultSrc -> default-src)
 */
function camelToKebab(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * CSP directives that should include the CDN URL
 */
const CSP_DIRECTIVES_FOR_CDN = [
	'default-src',
	'script-src',
	'style-src',
	'img-src',
	'font-src',
	'connect-src',
	'media-src',
];

/**
 * Process CSP value (can be string or object with directives)
 * Handles both formats:
 * - Already kebab-case: { "default-src": "'self'" }
 * - camelCase: { "defaultSrc": "'self'" } -> converts to "default-src"
 * Also adds CDN URL to relevant directives
 */
function processCSP(csp: string | Record<string, string> | undefined, cdnHostName?: string): string | null {
	if (!csp) return null;

	const cdnUrl = cdnHostName ? `https://${cdnHostName}` : null;

	if (typeof csp === 'string') {
		// For string CSP, we can't easily inject CDN - return as-is
		return csp;
	}

	return Object.entries(csp)
		.map(([directive, value]) => {
			// Convert camelCase to kebab-case if needed
			const kebabDirective = directive.includes('-') ? directive : camelToKebab(directive);

			// Add CDN URL to relevant directives if not already present
			let finalValue = value;
			if (cdnUrl && CSP_DIRECTIVES_FOR_CDN.includes(kebabDirective)) {
				if (!value.includes(cdnHostName!)) {
					finalValue = `${value} ${cdnUrl}`;
				}
			}

			return `${kebabDirective} ${finalValue}`;
		})
		.join('; ');
}

/**
 * Generate ETag from page data
 */
function generateETag(data: CachedPageData): string {
	const content = JSON.stringify({
		app: data.application?.id,
		page: data.page?.id,
		pageName: data.pageName,
		cachedAt: data.cachedAt,
	});
	return `"${createHash('md5').update(content).digest('hex').slice(0, 16)}"`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string | undefined | null): string {
	if (!str || typeof str !== 'string') {
		return '';
	}
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Critical CSS for initial render
 */
const CRITICAL_CSS = `
body { margin: 0; }
.comp { box-sizing: border-box; position: relative; }
.compPage { min-height: 100vh; }
.compGrid { display: flex; flex-direction: column; }
.compTable { display: flex; flex-direction: row; }
.compTableColumns { display: table; border-spacing: 0; width: 100%; }
.compTableColumn, .compTableHeaderColumn { display: table-cell; vertical-align: middle; }
.compMessages { position: fixed; top: 10px; right: 10px; z-index: 10000; }
._noAnchorGrid { }
._ROWLAYOUT { flex-direction: row; }
._SINGLECOLUMNLAYOUT { flex-direction: column; }
._ROWCOLUMNLAYOUT { flex-direction: column; }
._TWOCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._THREECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._FOURCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._FIVECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
@media screen and (min-width: 641px) {
	._TWOCOLUMNSLAYOUT, ._THREECOLUMNSLAYOUT, ._FOURCOLUMNSLAYOUT, ._FIVECOLUMNSLAYOUT {
		grid-template-columns: 1fr 1fr;
	}
}
@media screen and (min-width: 1025px) {
	._TWOCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr; }
	._THREECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr; }
	._FOURCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr; }
	._FIVECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
	._ROWCOLUMNLAYOUT { flex-direction: row; }
}
`;

/**
 * Generate meta tags HTML
 */
function generateMetaTags(
	page: PageDefinition | null,
	application: ApplicationDefinition | null
): string {
	const tags: string[] = [
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1">',
	];

	const seo = page?.properties?.seo;
	if (seo?.description?.value) {
		tags.push(`<meta name="description" content="${escapeHtml(seo.description.value)}">`);
	}
	if (seo?.keywords?.value) {
		tags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.value)}">`);
	}
	if (seo?.ogTitle?.value) {
		tags.push(`<meta property="og:title" content="${escapeHtml(seo.ogTitle.value)}">`);
	}
	if (seo?.ogDescription?.value) {
		tags.push(`<meta property="og:description" content="${escapeHtml(seo.ogDescription.value)}">`);
	}
	if (seo?.ogImage?.value) {
		tags.push(`<meta property="og:image" content="${escapeHtml(seo.ogImage.value)}">`);
	}

	// Application-level meta tags
	const externalMetas = application?.properties?.metas || [];
	for (const meta of externalMetas) {
		const attrs: string[] = [];
		if (meta.name) attrs.push(`name="${escapeHtml(meta.name)}"`);
		if (meta.property) attrs.push(`property="${escapeHtml(meta.property)}"`);
		if (meta.httpEquiv) attrs.push(`http-equiv="${escapeHtml(meta.httpEquiv)}"`);
		if (meta.content) attrs.push(`content="${escapeHtml(meta.content)}"`);
		if (attrs.length > 0) {
			tags.push(`<meta ${attrs.join(' ')}>`);
		}
	}

	return tags.join('\n\t\t');
}

/**
 * Generate external links HTML (fonts, stylesheets)
 */
function generateExternalLinks(application: ApplicationDefinition | null): string {
	const links: string[] = [];
	const externalLinks = application?.properties?.links || {};

	for (const [, link] of Object.entries(externalLinks)) {
		// Skip links without href
		if (!link.href || typeof link.href !== 'string') {
			continue;
		}
		const rel = link.rel || 'stylesheet';
		links.push(`<link rel="${escapeHtml(rel)}" href="${escapeHtml(link.href)}">`);
	}

	return links.join('\n\t\t');
}

/**
 * Generate external scripts HTML
 */
function generateExternalScripts(application: ApplicationDefinition | null): string {
	const scripts: string[] = [];
	const externalScripts = application?.properties?.scripts || [];

	for (const script of externalScripts) {
		// Skip scripts without src
		if (!script.src || typeof script.src !== 'string') {
			continue;
		}
		scripts.push(`<script src="${escapeHtml(script.src)}" defer></script>`);
	}

	return scripts.join('\n\t\t');
}

/**
 * Extract and sort code parts by placement
 */
interface CodePart {
	place: 'BEFORE_HEAD' | 'AFTER_HEAD' | 'BEFORE_BODY' | 'AFTER_BODY';
	order: number;
	part: string;
}

function extractCodeParts(
	application: ApplicationDefinition | null,
	place: CodePart['place']
): string {
	const codeParts = application?.properties?.codeParts || {};

	// Filter and sort code parts for the specified placement
	const parts = Object.values(codeParts)
		.filter((part: any) => part.place === place)
		.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
		.map((part: any) => part.part || '');

	return parts.join('\n\t\t');
}

/**
 * Generate the complete HTML page
 */
function generateHtml(
	data: CachedPageData | null,
	codes: { appCode: string; clientCode: string },
	pageName: string,
	cdn: CDNConfig,
	error?: string
): string {
	const cdnUrl = `https://${cdn.hostName}/js/dist/`;
	const application = data?.application || null;
	const page = data?.page || null;
	const theme = data?.theme || null;

	// Get page title
	const pageTitle =
		page?.properties?.title?.name?.value ||
		application?.properties?.title ||
		'Modlix';

	// Bootstrap data for client hydration
	const bootstrapData = data
		? {
				application,
				pageDefinition: { [pageName]: page },
				theme,
				urlDetails: {
					pageName,
					appCode: codes.appCode,
					clientCode: codes.clientCode,
				},
		  }
		: null;

	const metaTags = generateMetaTags(page, application);
	const externalLinks = generateExternalLinks(application);
	const externalScripts = generateExternalScripts(application);

	// Extract code parts for different placements
	const beforeHeadParts = extractCodeParts(application, 'BEFORE_HEAD');
	const afterHeadParts = extractCodeParts(application, 'AFTER_HEAD');
	const beforeBodyParts = extractCodeParts(application, 'BEFORE_BODY');
	const afterBodyParts = extractCodeParts(application, 'AFTER_BODY');

	// Get critical chunks from manifest for preloading
	const criticalChunks = getCriticalChunks(assetManifest, 3);

	// Generate preload tags for critical chunks
	const chunkPreloadTags = [
		...criticalChunks.application.map(chunk => `<link rel="preload" href="${chunk}" as="script">`),
		...criticalChunks.applicationStyle.map(chunk => `<link rel="preload" href="${chunk}" as="script">`)
	].join('\n\t\t');

	return `<!DOCTYPE html>
<html lang="en">
	<head>
		${beforeHeadParts ? `${beforeHeadParts}\n\t\t` : ''}${metaTags}
		<title>${escapeHtml(pageTitle)}</title>

		<!-- Resource hints -->
		<link rel="dns-prefetch" href="https://${cdn.hostName}">
		<link rel="preconnect" href="https://${cdn.hostName}" crossorigin="anonymous">

		<!-- Preload critical resources -->
		<link rel="preload" href="${cdnUrl}vendors.js" as="script">
		<link rel="preload" href="${cdnUrl}index.js" as="script">
		<link rel="preload" href="${cdnUrl}css/App.css" as="style">
		${chunkPreloadTags ? `${chunkPreloadTags}\n\t\t` : ''}<!-- Preload critical Application chunks -->

		<!-- Critical CSS -->
		<style id="criticalCss">${CRITICAL_CSS}</style>

		<!-- External CSS -->
		<link rel="stylesheet" href="${cdnUrl}css/App.css">

		<!-- External stylesheets (fonts, etc.) -->
		${externalLinks}
		${afterHeadParts ? `\n\t\t${afterHeadParts}` : ''}
	</head>
	<body>
		${beforeBodyParts ? `${beforeBodyParts}\n\t\t` : ''}<!-- Bootstrap data for client hydration -->
		<script>
			${bootstrapData ? `window.__APP_BOOTSTRAP__ = ${JSON.stringify(removeCodeParts(bootstrapData))};` : ''}
			window.domainAppCode = '${escapeHtml(codes.appCode)}';
			window.domainClientCode = '${escapeHtml(codes.clientCode)}';
			window.cdnPrefix = '${escapeHtml(cdn.hostName)}';
			window.cdnStripAPIPrefix = ${cdn.stripAPIPrefix};
			window.cdnReplacePlus = ${cdn.replacePlus};
			${cdn.resizeOptionsType ? `window.cdnResizeOptionsType = '${escapeHtml(cdn.resizeOptionsType)}';` : ''}
		</script>

		<!-- Main app container -->
		<div id="app">${error ? `<div style="padding:20px;color:#721c24;background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;margin:20px;">${escapeHtml(error)}</div>` : ''}</div>

		<!-- External scripts from application -->
		${externalScripts}

		<!-- Client JS bundles -->
		<script src="${cdnUrl}vendors.js" defer></script>
		<script src="${cdnUrl}index.js" defer></script>
		${afterBodyParts ? `\n\t\t${afterBodyParts}` : ''}
	</body>
</html>`;
}

function removeCodeParts(def: any) : any {

	console.log(def.application?.properties?.codeParts);

	if (!def.application?.properties?.codeParts) return def;

	delete def.application.properties.codeParts;

	return def;
}

/**
 * Set response headers
 */
function setResponseHeaders(
	res: ServerResponse,
	isAuthenticated: boolean,
	fromCache: boolean,
	etag: string | null,
	application: ApplicationDefinition | null,
	cdnHostName?: string
): void {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');

	// Cache headers
	if (isAuthenticated) {
		res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
	} else {
		res.setHeader(
			'Cache-Control',
			'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600'
		);
		res.setHeader('Vary', 'Authorization, Cookie');
	}

	// ETag
	if (etag) {
		res.setHeader('ETag', etag);
	}

	// Cache status
	res.setHeader('X-Cache-Status', fromCache ? 'HIT' : 'MISS');

	// CSP headers
	if (application?.properties) {
		const csp = processCSP(application.properties.csp, cdnHostName);
		if (csp) {
			res.setHeader('Content-Security-Policy', csp);
		}

		const cspReport = processCSP(application.properties.cspReport, cdnHostName);
		if (cspReport) {
			res.setHeader('Content-Security-Policy-Report-Only', cspReport);
		}
	}
}

/**
 * Handle page request - main entry point for SSR
 */
export async function handlePageRequest(
	req: IncomingMessage,
	res: ServerResponse
): Promise<void> {
	const url = new URL(req.url || '/', `http://${req.headers.host}`);

	// Convert IncomingMessage to Request-like object for resolver
	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			if (Array.isArray(value)) {
				value.forEach((v) => headers.append(key, v));
			} else {
				headers.set(key, value);
			}
		}
	}

	const request = {
		url: url.toString(),
		headers,
	} as Request;

	const codes = await resolveCodesFromRequest(request);
	const urlPageName = extractPageName(url.pathname);
	const authToken = getAuthToken(request);
	const isAuthenticated = !!authToken;

	logger.info('SSR page request', {
		url: url.pathname,
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		pageName: urlPageName,
		isAuthenticated,
	});

	// Get CDN config
	const config = getConfig();
	const cdn: CDNConfig = {
		hostName: config.cdn.hostName,
		stripAPIPrefix: config.cdn.stripAPIPrefix,
		replacePlus: config.cdn.replacePlus,
		resizeOptionsType: config.cdn.resizeOptionsType,
	};

	if (!cdn.hostName) {
		logger.error('CDN hostName not configured');
		res.writeHead(500, { 'Content-Type': 'text/html' });
		res.end(generateHtml(null, codes, urlPageName, cdn, 'CDN hostName not configured. Check ssr.cdn.hostName in config server.'));
		return;
	}

	// Check HTML cache first for non-authenticated requests (fastest path)
	if (!isAuthenticated) {
		const htmlCacheKey = generateCacheKey(codes.appCode, codes.clientCode, urlPageName);

		// Check if client accepts gzip
		const acceptEncoding = req.headers['accept-encoding'] || '';
		const supportsGzip = acceptEncoding.includes('gzip');

		if (supportsGzip) {
			// Try to serve pre-compressed content (fastest TTFB!)
			const cachedGzipped = await getCachedGzippedHtml(htmlCacheKey);
			if (cachedGzipped) {
				logger.info('HTML cache hit (pre-compressed)', {
					cacheKey: htmlCacheKey,
					pageName: urlPageName,
					size: cachedGzipped.length
				});

				// Set headers for pre-compressed response
				res.setHeader('Content-Type', 'text/html; charset=utf-8');
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
				res.setHeader('Vary', 'Authorization, Cookie, Accept-Encoding');
				res.setHeader('X-Cache-Status', 'HIT-HTML-GZIP');

				res.writeHead(200);
				res.end(cachedGzipped);
				return;
			}
		}

		// Fallback: serve uncompressed HTML (let Nginx compress)
		const cachedHtml = await getCachedHtml(htmlCacheKey);
		if (cachedHtml) {
			logger.info('HTML cache hit', { cacheKey: htmlCacheKey, pageName: urlPageName });

			// Set headers for cached response
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
			res.setHeader('Vary', 'Authorization, Cookie');
			res.setHeader('X-Cache-Status', 'HIT-HTML');

			res.writeHead(200);
			res.end(cachedHtml);
			return;
		}
	}

	// Check cache for non-authenticated, non-index requests (legacy object cache)
	if (urlPageName !== 'index' && !isAuthenticated) {
		const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, urlPageName);
		const cached = await getCachedData<CachedPageData>(cacheKey);
		if (cached) {
			logger.info('Cache hit', { cacheKey, pageName: urlPageName });
			const etag = generateETag(cached);

			// Check If-None-Match for conditional request
			const ifNoneMatch = req.headers['if-none-match'];
			if (ifNoneMatch === etag) {
				res.writeHead(304);
				res.end();
				return;
			}

			setResponseHeaders(res, isAuthenticated, true, etag, cached.application, cdn.hostName);
			res.writeHead(200);
			res.end(generateHtml(cached, codes, cached.pageName, cdn));
			return;
		}
	}

	// Fetch from backend
	logger.info('Fetching page data from backend', { pageName: urlPageName });
	const data = await fetchAllPageData(urlPageName, {
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		authToken,
	});

	const actualPageName = data.resolvedPageName;

	// Check HTML cache for resolved page name (when index was resolved to default page)
	if (urlPageName === 'index' && !isAuthenticated) {
		const resolvedHtmlCacheKey = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);

		// Check if client accepts gzip
		const acceptEncoding = req.headers['accept-encoding'] || '';
		const supportsGzip = acceptEncoding.includes('gzip');

		if (supportsGzip) {
			// Try to serve pre-compressed content (fastest!)
			const cachedGzipped = await getCachedGzippedHtml(resolvedHtmlCacheKey);
			if (cachedGzipped) {
				logger.info('HTML cache hit (resolved, pre-compressed)', {
					cacheKey: resolvedHtmlCacheKey,
					pageName: actualPageName,
					size: cachedGzipped.length
				});

				res.setHeader('Content-Type', 'text/html; charset=utf-8');
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
				res.setHeader('Vary', 'Authorization, Cookie, Accept-Encoding');
				res.setHeader('X-Cache-Status', 'HIT-HTML-RESOLVED-GZIP');

				res.writeHead(200);
				res.end(cachedGzipped);
				return;
			}
		}

		// Fallback: serve uncompressed HTML
		const cachedResolvedHtml = await getCachedHtml(resolvedHtmlCacheKey);
		if (cachedResolvedHtml) {
			logger.info('HTML cache hit (resolved page)', { cacheKey: resolvedHtmlCacheKey, pageName: actualPageName });

			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
			res.setHeader('Vary', 'Authorization, Cookie');
			res.setHeader('X-Cache-Status', 'HIT-HTML-RESOLVED');

			res.writeHead(200);
			res.end(cachedResolvedHtml);
			return;
		}

		// Fallback: check legacy object cache
		const cached = await getCachedData<CachedPageData>(resolvedHtmlCacheKey);
		if (cached) {
			logger.info('Object cache hit (resolved page)', { cacheKey: resolvedHtmlCacheKey, pageName: actualPageName });
			const etag = generateETag(cached);

			const ifNoneMatch = req.headers['if-none-match'];
			if (ifNoneMatch === etag) {
				res.writeHead(304);
				res.end();
				return;
			}

			setResponseHeaders(res, isAuthenticated, true, etag, cached.application, cdn.hostName);
			res.writeHead(200);
			res.end(generateHtml(cached, codes, cached.pageName, cdn));
			return;
		}
	}

	// Handle not found
	if (!data.application || !data.page) {
		logger.warn('Page not found', { pageName: actualPageName, appCode: codes.appCode });
		setResponseHeaders(res, true, false, null, null, cdn.hostName);
		res.writeHead(404);
		res.end(generateHtml(null, codes, actualPageName, cdn, `Page "${actualPageName}" not found`));
		return;
	}

	// Build result
	const result: CachedPageData = {
		application: data.application,
		page: data.page,
		theme: data.theme as ThemeDefinition | null,
		codes,
		pageName: actualPageName,
		cachedAt: Date.now(),
	};

	// Generate HTML once
	const generatedHtml = generateHtml(result, codes, actualPageName, cdn);

	// Cache HTML for unauthenticated requests (primary cache)
	const htmlCacheKey = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);
	if (!isAuthenticated) {
		// Cache the rendered HTML (fast serving)
		await setCachedHtml(htmlCacheKey, generatedHtml, config.cache.ttlSeconds);
		logger.info('Cached HTML', {
			cacheKey: htmlCacheKey,
			pageName: actualPageName,
			htmlSize: generatedHtml.length,
			ttl: config.cache.ttlSeconds
		});

		// Also cache the object data (for cache warming and debugging)
		await setCachedData(htmlCacheKey + ':data', result, config.cache.ttlSeconds);
	}

	// Analyze key frequencies (debug mode only - set ANALYZE_KEYS=true in env)
	if (process.env.ANALYZE_KEYS === 'true') {
		analyzeKeyFrequencies(data);
	}

	// Generate response
	const etag = generateETag(result);
	setResponseHeaders(res, isAuthenticated, false, etag, data.application, cdn.hostName);

	logger.info('SSR page rendered', {
		pageName: actualPageName,
		appCode: codes.appCode,
		fromCache: false,
		htmlSize: generatedHtml.length,
		cdnHostName: cdn.hostName,
	});

	res.writeHead(200);
	res.end(generatedHtml);
}

/**
 * Analyze key frequencies in the data structure
 */
function analyzeKeyFrequencies(data: any): void {
	const keyFrequency = new Map<string, number>();

	function traverse(obj: any): void {
		if (!obj || typeof obj !== 'object') return;

		if (Array.isArray(obj)) {
			for (const item of obj) {
				traverse(item);
			}
			return;
		}

		for (const key of Object.keys(obj)) {
			keyFrequency.set(key, (keyFrequency.get(key) || 0) + 1);
			traverse(obj[key]);
		}
	}

	traverse({ application: data.application, page: data.page, theme: data.theme });

	// Sort by frequency
	const sorted = Array.from(keyFrequency.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 50); // Top 50 keys

	logger.info('Key frequency analysis (top 50)', {
		totalUniqueKeys: keyFrequency.size,
		topKeys: sorted.map(([key, count]) => `${key}: ${count}`).join(', ')
	});

	// Check user's hypothesis
	const highFreqKeys = ['statementName', 'name', 'namespace', 'position', 'parameterMap',
		'expression', 'type', 'value', 'key', 'order', 'top', 'left', 'steps', 'dependentStatements'];
	const mediumFreqKeys = ['createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'id',
		'version', 'clientCode', 'appCode', 'properties', 'eventFunctions', 'message'];

	logger.info('Hypothesis validation', {
		highFrequency: highFreqKeys.map(k => `${k}: ${keyFrequency.get(k) || 0}`).join(', '),
		mediumFrequency: mediumFreqKeys.map(k => `${k}: ${keyFrequency.get(k) || 0}`).join(', ')
	});
}
