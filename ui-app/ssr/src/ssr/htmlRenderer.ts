/**
 * Pure HTML renderer for SSR
 * Renders pages as HTML without any React/framework client-side code
 * The client bundle (vendors.js, index.js) handles hydration
 */

import type { IncomingMessage } from 'http';
import logger from '../config/logger';
import { getConfig } from '../config/configLoader';
import { resolveCodesFromRequest, extractPageName, getAuthToken } from '../resolver/codeResolver';
import { fetchAllPageData, type ApplicationDefinition, type PageDefinition, type ThemeDefinition } from '../api/client';
import { getCachedData, setCachedData, generateCacheKey } from '../cache/redis';

interface CachedPageData {
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
	resolvedPageName: string;
	cachedAt: number;
}

/**
 * Convert IncomingMessage to Request-like object for code resolver
 */
function createRequestFromIncoming(req: IncomingMessage): Request {
	const protocol = (req.headers['x-forwarded-proto'] as string) || 'http';
	const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
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
 * Get CDN URL for static assets
 */
function getCdnUrl(): string {
	try {
		const config = getConfig();
		if (config.cdn.hostName) {
			return `https://${config.cdn.hostName}`;
		}
	} catch {
		// Config not loaded yet
	}
	// Default to relative paths for local development
	return '';
}

/**
 * Generate HTML for the page
 */
function generateHtml(
	application: ApplicationDefinition | null,
	page: PageDefinition | null,
	theme: ThemeDefinition | null,
	pageName: string
): string {
	const cdnUrl = getCdnUrl();
	const appProps = application?.properties || {};
	const pageProps = page?.properties || {};

	// Build title
	let title = appProps.title || 'Application';
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
		metaTags.push(`<meta name="description" content="${escapeHtml(seo.description.value)}">`);
	}
	if (seo?.keywords?.value) {
		metaTags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.value)}">`);
	}

	// Open Graph meta tags
	if (seo?.ogTitle?.value) {
		metaTags.push(`<meta property="og:title" content="${escapeHtml(seo.ogTitle.value)}">`);
	}
	if (seo?.ogDescription?.value) {
		metaTags.push(`<meta property="og:description" content="${escapeHtml(seo.ogDescription.value)}">`);
	}
	if (seo?.ogImage?.value) {
		metaTags.push(`<meta property="og:image" content="${escapeHtml(seo.ogImage.value)}">`);
	}

	// Application-level meta tags
	if (appProps.metas) {
		for (const meta of appProps.metas) {
			if (meta.name && meta.content) {
				metaTags.push(`<meta name="${escapeHtml(meta.name)}" content="${escapeHtml(meta.content)}">`);
			}
		}
	}

	// Build link tags
	const linkTags: string[] = [];
	if (appProps.links) {
		for (const [_key, link] of Object.entries(appProps.links)) {
			if (link.rel && link.href) {
				linkTags.push(`<link rel="${escapeHtml(link.rel)}" href="${escapeHtml(link.href)}">`);
			}
		}
	}

	// Build script tags
	const scriptTags: string[] = [];
	if (appProps.scripts) {
		for (const script of appProps.scripts) {
			if (script.src) {
				scriptTags.push(`<script src="${escapeHtml(script.src)}"></script>`);
			}
		}
	}

	// CDN prefix for JS files
	const cdnPrefix = appProps.codeParts?.cdnPrefix || cdnUrl;
	const jsPath = cdnPrefix ? `${cdnPrefix}/js/dist` : '/js/dist';

	// Build initial state for client hydration
	const initialState = {
		application,
		page,
		theme,
		pageName,
	};

	// CSP header if configured
	const cspMeta = appProps.csp
		? `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(appProps.csp)}">`
		: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${cspMeta}
    <title>${escapeHtml(title)}</title>
    ${metaTags.join('\n    ')}
    ${linkTags.join('\n    ')}
    <link rel="stylesheet" href="${jsPath}/index.css">
</head>
<body>
    <div id="app"></div>
    <script>
        window.__SSR_DATA__ = ${JSON.stringify(initialState)};
    </script>
    <script src="${jsPath}/vendors.js"></script>
    <script src="${jsPath}/index.js"></script>
    ${scriptTags.join('\n    ')}
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
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
		const html = generateHtml(
			pageData.application,
			pageData.page,
			pageData.theme,
			pageData.resolvedPageName
		);

		const duration = Date.now() - startTime;
		logger.info('Page rendered', {
			pageName: pageData.resolvedPageName,
			appCode: codes.appCode,
			clientCode: codes.clientCode,
			durationMs: duration,
			cached: !!pageData.cachedAt && pageData.cachedAt < startTime,
		});

		return html;
	} catch (error) {
		logger.error('Error rendering page', { error: String(error), url: req.url });

		// Return a minimal error page
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
</head>
<body>
    <div id="app"></div>
    <script>
        window.__SSR_DATA__ = { error: true };
    </script>
    <script src="/js/dist/vendors.js"></script>
    <script src="/js/dist/index.js"></script>
</body>
</html>`;
	}
}
