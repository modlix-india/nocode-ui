import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveCodesFromRequest, extractPageName, getAuthToken } from '../resolver/codeResolver.js';
import {
	fetchAllPageData,
	fetchApplication,
	type PageDefinition,
	type ApplicationDefinition,
	type ThemeDefinition,
} from '../api/client.js';
import { assignmentSetCookie, resolveRoute } from '../resolver/pageRouting.js';
import { getCachedData, setCachedData, generateAppCacheKey, generateCacheKey, getCachedHtml, setCachedHtml, getCachedGzippedHtml } from '../cache/redis.js';
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
	/** Which theme `theme` is, so the client can tell whether it matches its own. */
	themeName?: string;
	codes: { appCode: string; clientCode: string };
	pageName: string;
	cachedAt: number;
}

/**
 * The visitor's selected theme, from the cookie the client writes.
 *
 * The name must match IndexHTMLService.THEME_COOKIE_PREFIX and the client's
 * themeSelection.ts. One cookie per app, because a single host can serve several
 * apps under /appCode/clientCode/page and they do not share a theme.
 */
function readThemeCookie(header: string | undefined, appCode: string): string | undefined {
	if (!header) return undefined;

	const match = new RegExp(String.raw`(?:^|;\s*)mlxTheme_` + appCode + '=([^;]*)').exec(header);
	if (!match) return undefined;

	try {
		return decodeURIComponent(match[1]) || undefined;
	} catch {
		// Not a value we wrote. Treat it as absent rather than keying the cache on
		// something malformed.
		return undefined;
	}
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
// Map security.appCodeSuffix to the authzump beacon host:
//   ""        -> "authzump.ai"
//   ".dev"    -> "dev.authzump.ai"
//   ".stage"  -> "stage.authzump.ai"
//   ".local"  -> "authzump.local.modlix.com"
//
// Local is deliberately not "local.authzump.ai". Local hosts are <app>.local.modlix.com
// (dnsmasq wildcards that suffix to 127.0.0.1 on a developer machine); the .ai names
// belong to the deployed environments only. "local.authzump.ai" does resolve, to prod-lb,
// where it is a stray vhost carrying appCode "nothing", so pointing the beacon there
// silently broke all local SSO.
//
// Must stay in step with IndexHTMLService.deriveBeaconHost in nocode-saas/ui.
const LOCAL_ENV = 'local';

function deriveBeaconHost(appCodeSuffix: string | undefined | null): string {
	if (!appCodeSuffix) return 'authzump.ai';
	const trimmed = appCodeSuffix.startsWith('.') ? appCodeSuffix.slice(1) : appCodeSuffix;
	const dotIdx = trimmed.indexOf('.');
	const env = dotIdx >= 0 ? trimmed.slice(0, dotIdx) : trimmed;
	if (!env) return 'authzump.ai';
	return env === LOCAL_ENV ? `authzump.${env}.modlix.com` : `${env}.authzump.ai`;
}

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
/* The ROOT page only. Every rule in this block outlives the first paint, because
   nothing removes the <style>, and the client's own PageCss never writes a
   min-height, so a single-class .compPage rule went on applying to every NESTED
   page too. A SubPage pane is a .compPage inside the shell's .compPage, so 100vh
   forced each pane to a full viewport below the shell header and pushed the
   document down by the header's height: a scrollbar on workspace, org and docs,
   which lock their height, and only on the environments serving this block. */
#app > .comp.compPage { min-height: 100vh; }
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
 * The analytics beacon, as one script tag.
 *
 * The script itself is served by the engine that receives its events, so there is no vendor
 * stub here and no copy of the wire format. The previous arrangement transcribed the same
 * minified blob into this file and into IndexHTMLService.java, and the two had begun to
 * drift; now both emit a tag and the engine owns the client.
 *
 * Returns '' when analytics is off for the app or no host is configured — the rendered page
 * then carries nothing at all, rather than a script that would load and measure nobody.
 */
function generateAnalyticsSnippet(
	application: ApplicationDefinition | null,
	ingestionHost: string,
): string {
	if (!ingestionHost) return '';

	const a = application?.properties?.analytics;
	if (!a?.enabled) return '';

	const host = ingestionHost.endsWith('/') ? ingestionHost.slice(0, -1) : ingestionHost;
	const attr = (v: unknown, dflt: boolean) => String(v === undefined || v === null ? dflt : v !== false);

	return (
		// A queue, so an event fired before the async script arrives is not lost.
		'<script>window.mlx=window.mlx||function(){(window.mlx.q=window.mlx.q||[]).push(arguments)};</script>' +
		`<script async src="${escapeHtml(host)}/a.js"` +
		` data-autocapture="${attr(a.autocapture, true)}"` +
		` data-pageviews="${attr(a.capturePageviews, true)}"` +
		` data-pageleaves="${attr(a.capturePageleaves, true)}"` +
		// Off unless the app asks: every click becomes an event, where autocapture records
		// only the labelled ones.
		` data-heatmaps="${attr(a.heatmaps?.enabled, false)}"` +
		// Unconditional. There is no application setting that turns consent off:
		// one set wrong, once, measures people who were never asked, and nothing
		// about that state looks wrong from the outside.
		' data-consent="required"></script>'
	);
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
	// `urlType` is part of the object every caller already passes; it was the
	// TYPE here that hid it, which is why the draft marker never reached the
	// shell. Taking it off `codes` rather than adding a parameter means none of
	// the six call sites can forget it -- the way they all did.
	codes: { appCode: string; clientCode: string; urlType?: string },
	pageName: string,
	cdn: CDNConfig,
	error?: string
): string {
	// The client reads this to know which surface it is on, and SSR is the only
	// thing that writes the shell on this path -- IndexHTMLService never runs
	// here, so without this a draft host gets drafted content, a draft-keyed
	// cache entry and no banner.
	const draftAttr = codes.urlType === 'DRAFT' ? ' data-draft="true"' : '';
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
	// Which theme `theme` is. Without it the client cannot tell whether this
	// bootstrap matches its own resolution, and taking a mismatched one applies
	// the wrong theme permanently rather than for a frame.
	const themeName = data?.themeName;

	const bootstrapData = data
		? {
				application,
				pageDefinition: { [pageName]: page },
				theme,
				themeName,
				/**
				 * The page routing chose, which is not necessarily the one named in
				 * the URL. The client reads this instead of deriving the name from
				 * the location, so it does not discard this bootstrap and refetch.
				 *
				 * Only the resolved name appears here, and deliberately so: it is
				 * exactly what the HTML cache is keyed by, so every visitor served
				 * this cached document belongs under it. Which rule fired, and which
				 * arm of a split they drew, are per-visitor and would be baked in for
				 * whoever happened to miss the cache first.
				 */
				resolvedPageName: pageName,
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
	const analyticsSnippet = generateAnalyticsSnippet(
		application,
		getConfig().analytics.ingestionHost,
	);

	// Extract code parts for different placements
	const beforeHeadParts = extractCodeParts(application, 'BEFORE_HEAD');
	const afterHeadParts = extractCodeParts(application, 'AFTER_HEAD');
	const beforeBodyParts = extractCodeParts(application, 'BEFORE_BODY');
	const afterBodyParts = extractCodeParts(application, 'AFTER_BODY');

	// Get critical chunks from manifest for preloading
	const criticalChunks = getCriticalChunks(assetManifest, 3);

	// Get entrypoint scripts from manifest (with fallback to legacy bundles)
	const entrypointScripts = assetManifest?.entrypoints?.index || ['vendors.js', 'index.js'];

	// Generate preload tags for entrypoint scripts
	const entrypointPreloadTags = entrypointScripts
		.map(script => `<link rel="preload" href="${cdnUrl}${script}" as="script">`)
		.join('\n\t\t');

	// Helper to extract filename from full URL or return as-is if already a filename
	const extractFilename = (path: string) => {
		if (path.startsWith('http')) {
			return path.split('/').pop() || path;
		}
		return path;
	};

	// Generate preload tags for critical chunks (strip CDN URL if present)
	const chunkPreloadTags = [
		...criticalChunks.application.map(chunk => `<link rel="preload" href="${cdnUrl}${extractFilename(chunk)}" as="script">`),
		...criticalChunks.applicationStyle.map(chunk => `<link rel="preload" href="${cdnUrl}${extractFilename(chunk)}" as="script">`)
	].join('\n\t\t');

	return `<!DOCTYPE html>
<html lang="en"${draftAttr}>
	<head>
		${beforeHeadParts ? `${beforeHeadParts}\n\t\t` : ''}${metaTags}
		<title>${escapeHtml(pageTitle)}</title>

		<!-- Resource hints -->
		<link rel="dns-prefetch" href="https://${cdn.hostName}">
		<link rel="preconnect" href="https://${cdn.hostName}" crossorigin="anonymous">

		<!-- Preload entrypoint scripts -->
		${entrypointPreloadTags}		
		${chunkPreloadTags ? `${chunkPreloadTags}\n\t\t` : ''}<!-- Preload critical Application chunks -->

		<!-- Critical CSS -->
		<style id="criticalCss">${CRITICAL_CSS}</style>

		<!-- External stylesheets (fonts, etc.) -->
		${externalLinks}
		${analyticsSnippet}
		${afterHeadParts ? `\n\t\t${afterHeadParts}` : ''}
	</head>
	<body>
		${beforeBodyParts ? `${beforeBodyParts}\n\t\t` : ''}<!-- Bootstrap data for client hydration -->
		<script>
			${bootstrapData ? `window.__APP_BOOTSTRAP__ = ${JSON.stringify(removeCodeParts(bootstrapData))};` : ''}
			window.domainAppCode = '${escapeHtml(codes.appCode)}';
			window.domainClientCode = '${escapeHtml(codes.clientCode)}';
			// Read by the client's themeSelection.ts to name the theme cookie and the
			// personalization row. Separate from domainAppCode because getHref.ts
			// overwrites that one with a hardcoded value on import, and because a
			// domain-mapped host has no app code in its path for the client to parse:
			// without this stamp a theme the visitor picks here is never remembered.
			window.__mlxAppCode = '${escapeHtml(codes.appCode)}';
			window.cdnPrefix = '${escapeHtml(cdn.hostName)}';
			window.cdnStripAPIPrefix = ${cdn.stripAPIPrefix};
			window.cdnReplacePlus = ${cdn.replacePlus};
			${cdn.resizeOptionsType ? `window.cdnResizeOptionsType = '${escapeHtml(cdn.resizeOptionsType)}';` : ''}
			window.__SOCIAL_LOGIN_HOST__ = '${escapeHtml(deriveBeaconHost(getConfig().security.appCodeSuffix))}';
			${application?.properties?.sso3 === true ? `window.__SSO_BEACON_HOST__ = '${escapeHtml(deriveBeaconHost(getConfig().security.appCodeSuffix))}';` : ''}
		</script>

		<!-- Main app container -->
		<div id="app">${error ? `<div style="padding:20px;color:#721c24;background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;margin:20px;">${escapeHtml(error)}</div>` : ''}</div>

		<!-- Application style from style service, for the resolved theme -->
		<link rel="stylesheet" id="mlxAppStyle" href="/${escapeHtml(codes.appCode)}/${escapeHtml(codes.clientCode)}/page/api/ui/style${themeName ? `?theme=${encodeURIComponent(themeName)}` : ''}" />

		<!-- External scripts from application -->
		${externalScripts}

		<!-- Client JS bundles -->
		${entrypointScripts.map(script => `<script src="${cdnUrl}${script}" defer></script>`).join('\n\t\t')}
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
const SHARED_CACHE_CONTROL = 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600';

/**
 * A response that carries a Set-Cookie must never be stored by a shared cache.
 *
 * The HTML body is the same for everyone who resolves to this page, so the body
 * itself is perfectly cacheable — but replaying its Set-Cookie to the next
 * visitor would pin the whole internet into one arm of a split. Only the first
 * request from a given visitor draws, so only that one response is uncacheable;
 * every one after it carries the cookie, draws nothing, and is public again.
 */
function cacheControlFor(drewAssignment: boolean): string {
	return drewAssignment ? 'private, no-store' : SHARED_CACHE_CONTROL;
}

function setResponseHeaders(
	res: ServerResponse,
	isAuthenticated: boolean,
	fromCache: boolean,
	etag: string | null,
	application: ApplicationDefinition | null,
	cdnHostName?: string,
	drewAssignment: boolean = false,
): void {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');

	// Cache headers
	if (isAuthenticated) {
		res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
	} else {
		res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
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

	// The gateway set this from the resolved hostname before the request reached
	// us, and it is the only trustworthy signal of which surface this is: SSR
	// talks to the gateway server to server, so the original host is not
	// recoverable downstream.
	// The surface comes from resolving the hostname, NOT from an inbound header.
	// An x-draft on the incoming request is caller-supplied and is ignored: the
	// gateway is the only thing allowed to decide this, and codes.urlType comes
	// from the same security-service lookup the gateway itself uses.
	const isDraft = codes.urlType === 'DRAFT';

	// The visitor's selected theme. A cookie rather than localStorage precisely so
	// that this server can see it: the pre-rendered HTML carries the theme in its
	// bootstrap, and getting it wrong here means the client throws that away and
	// refetches on every load.
	//
	// Cached per theme. Apps have one or two, so this multiplies the entry count by
	// one or two, and the alternative is serving every visitor the default.
	const cookieTheme = readThemeCookie(req.headers.cookie, codes.appCode);


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

	const fetchOptions = {
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		authToken,
		// Let the gateway resolve the surface from the host, as it does for a
		// direct browser request.
		forwardedHost: headers.get('x-forwarded-host') ?? url.host,
		forwardedProto: headers.get('x-forwarded-proto') ?? url.protocol.replace(':', ''),
		forwardedPort: headers.get('x-forwarded-port') ?? url.port,
	};

	// The application definition must be in hand before anything else, because it
	// carries the routing rules and routing decides which page this request
	// renders -- which is what every cache key below is built from.
	//
	// Before page routing there was only one such decision, index -> defaultPage,
	// and it was taken after the page had already been fetched. That is why the
	// cache used to be probed twice, once on the URL's name and again on the
	// resolved one. Deciding first collapses both into a single lookup.
	//
	// Cached for anonymous visitors only: the ui service varies the definition by
	// whether the caller is authenticated, so a signed-in copy must not be shared
	// -- and authenticated requests never reach the HTML cache anyway.
	const appCacheKey = generateAppCacheKey(codes.appCode, codes.clientCode, isDraft);
	let application: ApplicationDefinition | null;
	if (isAuthenticated) {
		application = await fetchApplication(fetchOptions);
	} else {
		application = await getCachedData<ApplicationDefinition>(appCacheKey);
		if (!application) {
			application = await fetchApplication(fetchOptions);
			if (application) await setCachedData(appCacheKey, application, config.cache.ttlSeconds);
		}
	}

	const route = resolveRoute(application, url, req.headers, urlPageName, isAuthenticated);
	const actualPageName = route.pageName;

	// A visitor drawn into a split for the first time. The cookie is set whether
	// the HTML that follows comes from cache or not: the body is identical for
	// everyone who resolves to this page, but the assignment is theirs alone.
	const drewAssignment = !!route.assignments;
	if (route.assignments) {
		res.setHeader(
			'Set-Cookie',
			assignmentSetCookie(
				route.assignments,
				config.routing.assignmentCookieMaxAgeSeconds,
				fetchOptions.forwardedProto === 'https',
			),
		);
	}

	if (actualPageName !== urlPageName) {
		logger.info('Page routing resolved', {
			requested: urlPageName,
			resolved: actualPageName,
			rule: route.resolution.ruleKey,
			variant: route.resolution.variantKey,
		});
	}

	const htmlCacheKey = generateCacheKey(
		codes.appCode,
		codes.clientCode,
		actualPageName,
		isDraft,
		cookieTheme,
	);

	// Check HTML cache for non-authenticated requests (fastest path)
	if (!isAuthenticated) {
		// Check if client accepts gzip
		const acceptEncoding = req.headers['accept-encoding'] || '';
		const supportsGzip = acceptEncoding.includes('gzip');

		if (supportsGzip) {
			// Try to serve pre-compressed content (fastest TTFB!)
			const cachedGzipped = await getCachedGzippedHtml(htmlCacheKey);
			if (cachedGzipped) {
				logger.info('HTML cache hit (pre-compressed)', {
					cacheKey: htmlCacheKey,
					pageName: actualPageName,
					size: cachedGzipped.length
				});

				// Set headers for pre-compressed response
				res.setHeader('Content-Type', 'text/html; charset=utf-8');
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
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
			logger.info('HTML cache hit', { cacheKey: htmlCacheKey, pageName: actualPageName });

			// Set headers for cached response
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
			res.setHeader('Vary', 'Authorization, Cookie');
			res.setHeader('X-Cache-Status', 'HIT-HTML');

			res.writeHead(200);
			res.end(cachedHtml);
			return;
		}

		// Fallback: legacy object cache
		const cached = await getCachedData<CachedPageData>(htmlCacheKey);
		if (cached) {
			logger.info('Cache hit', { cacheKey: htmlCacheKey, pageName: actualPageName });
			const etag = generateETag(cached);

			// Check If-None-Match for conditional request
			const ifNoneMatch = req.headers['if-none-match'];
			if (ifNoneMatch === etag) {
				res.writeHead(304);
				res.end();
				return;
			}

			setResponseHeaders(res, isAuthenticated, true, etag, cached.application, cdn.hostName, drewAssignment);
			res.writeHead(200);
			res.end(generateHtml(cached, codes, cached.pageName, cdn));
			return;
		}
	}

	// Fetch from backend. The application is handed in rather than refetched: it
	// is already loaded above, and it is what routing was decided from, so the
	// page and the rules that chose it come from the same definition.
	logger.info('Fetching page data from backend', { pageName: actualPageName });
	let data = await fetchAllPageData(actualPageName, fetchOptions, cookieTheme, application);
	let servedPageName = actualPageName;

	// A rule can name a page that has since been deleted, or was never published.
	// Falling back to the URL's own name keeps the live page working while the
	// definition is wrong, rather than taking it down with a 404 naming a page no
	// visitor ever asked for. Only worth trying when routing actually changed the
	// name, and only when the app itself came back.
	if (data.application && !data.page && actualPageName !== urlPageName) {
		logger.warn('Routed page missing, falling back to the requested page', {
			requested: urlPageName,
			resolved: actualPageName,
			rule: route.resolution.ruleKey,
		});
		const fallback = await fetchAllPageData(urlPageName, fetchOptions, cookieTheme, application);
		if (fallback.page) {
			data = fallback;
			servedPageName = fallback.resolvedPageName;
		}
	}

	// Handle not found
	if (!data.application || !data.page) {
		logger.warn('Page not found', { pageName: servedPageName, appCode: codes.appCode });
		setResponseHeaders(res, true, false, null, null, cdn.hostName);
		res.writeHead(404);
		res.end(generateHtml(null, codes, servedPageName, cdn, `Page "${servedPageName}" not found`));
		return;
	}

	// Build result
	const result: CachedPageData = {
		application: data.application,
		page: data.page,
		theme: data.theme as ThemeDefinition | null,
		themeName: data.themeName,
		codes,
		pageName: servedPageName,
		cachedAt: Date.now(),
	};

	// Generate HTML once
	const generatedHtml = generateHtml(result, codes, servedPageName, cdn);

	// Cache HTML for unauthenticated requests (primary cache).
	//
	// Keyed on the page actually served, which after a fallback is not the page
	// routing picked -- storing it under the missing name would serve the wrong
	// document the moment that name starts resolving again.
	const servedCacheKey =
		servedPageName === actualPageName
			? htmlCacheKey
			: generateCacheKey(codes.appCode, codes.clientCode, servedPageName, isDraft, cookieTheme);
	if (!isAuthenticated) {
		// Cache the rendered HTML (fast serving)
		await setCachedHtml(servedCacheKey, generatedHtml, config.cache.ttlSeconds);
		logger.info('Cached HTML', {
			cacheKey: servedCacheKey,
			pageName: servedPageName,
			htmlSize: generatedHtml.length,
			ttl: config.cache.ttlSeconds
		});

		// Also cache the object data (for cache warming and debugging)
		await setCachedData(servedCacheKey + ':data', result, config.cache.ttlSeconds);
	}

	// Analyze key frequencies (debug mode only - set ANALYZE_KEYS=true in env)
	if (process.env.ANALYZE_KEYS === 'true') {
		analyzeKeyFrequencies(data);
	}

	// Generate response
	const etag = generateETag(result);
	setResponseHeaders(res, isAuthenticated, false, etag, data.application, cdn.hostName, drewAssignment);

	logger.info('SSR page rendered', {
		pageName: servedPageName,
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
