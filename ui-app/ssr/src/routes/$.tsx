import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest, setResponseHeader } from '@tanstack/react-start/server';
import {
	resolveCodesFromRequest,
	extractPageName,
	getAuthToken,
} from '~/resolver/codeResolver';
import {
	fetchAllPageData,
	type PageDefinition,
	type ApplicationDefinition,
	type ThemeDefinition,
} from '~/api/client';
import { getCachedData, setCachedData, generateCacheKey } from '~/cache/redis';
import { createHash } from 'node:crypto';

interface CachedPageData {
	application: ApplicationDefinition;
	page: PageDefinition;
	theme: ThemeDefinition | null;
	codes: { appCode: string; clientCode: string };
	pageName: string;
	cachedAt: number; // Timestamp for ETag generation
}

type PageDataResult =
	| (CachedPageData & { fromCache: boolean; isAuthenticated: boolean; error?: never })
	| { error: string; codes: { appCode: string; clientCode: string }; pageName: string };

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
 * Set cache headers based on authentication and cache status
 */
function setCacheHeaders(
	isAuthenticated: boolean,
	fromCache: boolean,
	etag?: string
): void {
	if (isAuthenticated) {
		// Authenticated requests: no caching
		setResponseHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		setResponseHeader('Pragma', 'no-cache');
		setResponseHeader('Expires', '0');
	} else {
		// Public pages: allow browser and CDN caching
		// s-maxage for CDN (30 min), max-age for browser (5 min), stale-while-revalidate for background refresh
		setResponseHeader(
			'Cache-Control',
			'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600'
		);
		// Vary header to ensure proper caching with different auth states
		setResponseHeader('Vary', 'Authorization, Cookie');
	}

	// Add ETag for conditional requests
	if (etag) {
		setResponseHeader('ETag', etag);
	}

	// Add cache status header for debugging
	setResponseHeader('X-Cache-Status', fromCache ? 'HIT' : 'MISS');
}

// Server function to fetch page data
const getPageData = createServerFn().handler(async (): Promise<PageDataResult> => {
	const request = getRequest();
	const codes = await resolveCodesFromRequest(request);
	const urlPageName = extractPageName(new URL(request.url).pathname);
	const authToken = getAuthToken(request);
	const isAuthenticated = !!authToken;

	// For 'index' fallback, we need to fetch application first to get defaultPage
	// For explicit page names, we can check cache immediately
	if (urlPageName !== 'index' && !isAuthenticated) {
		const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, urlPageName);
		const cached = await getCachedData<CachedPageData>(cacheKey);
		if (cached) {
			const etag = generateETag(cached);
			setCacheHeaders(isAuthenticated, true, etag);
			return { ...cached, fromCache: true, isAuthenticated };
		}
	}

	// Fetch from backend (will resolve 'index' to defaultPage)
	const data = await fetchAllPageData(urlPageName, {
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		authToken,
	});

	// Use resolved page name (may be defaultPage if 'index' was used)
	const actualPageName = data.resolvedPageName;

	// For 'index' fallback, check cache with resolved page name
	if (urlPageName === 'index' && !isAuthenticated) {
		const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);
		const cached = await getCachedData<CachedPageData>(cacheKey);
		if (cached) {
			const etag = generateETag(cached);
			setCacheHeaders(isAuthenticated, true, etag);
			return { ...cached, fromCache: true, isAuthenticated };
		}
	}

	if (!data.application || !data.page) {
		// Set no-cache headers for error responses
		setCacheHeaders(true, false);
		return {
			error: 'Page not found',
			codes,
			pageName: actualPageName,
		};
	}

	const result: CachedPageData = {
		application: data.application,
		page: data.page,
		theme: data.theme as ThemeDefinition | null,
		codes,
		pageName: actualPageName,
		cachedAt: Date.now(),
	};

	// Cache for unauthenticated requests (30 minutes) - use resolved page name
	const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);
	if (!isAuthenticated) {
		await setCachedData(cacheKey, result, 1800);
	}

	// Set cache headers
	const etag = generateETag(result);
	setCacheHeaders(isAuthenticated, false, etag);

	return { ...result, fromCache: false, isAuthenticated };
});

export const Route = createFileRoute('/$')({
	loader: async () => {
		return getPageData();
	},
	head: ({ loaderData }) => {
		if (!loaderData || 'error' in loaderData) {
			return {
				meta: [{ title: 'Page Not Found' }],
			};
		}

		const { page, application } = loaderData;
		const pageTitle =
			page?.properties?.title?.name?.value ||
			application?.properties?.title ||
			'Modlix';

		const seo = page?.properties?.seo;

		return {
			meta: [
				{ title: pageTitle },
				seo?.description?.value && {
					name: 'description',
					content: seo.description.value,
				},
				seo?.keywords?.value && {
					name: 'keywords',
					content: seo.keywords.value,
				},
				// Open Graph
				seo?.ogTitle?.value && {
					property: 'og:title',
					content: seo.ogTitle.value,
				},
				seo?.ogDescription?.value && {
					property: 'og:description',
					content: seo.ogDescription.value,
				},
				seo?.ogImage?.value && {
					property: 'og:image',
					content: seo.ogImage.value,
				},
			].filter(Boolean),
		};
	},
	component: PageComponent,
});

/**
 * Critical CSS for initial render - must match client's base styles
 * This ensures content is styled before external CSS loads
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

function PageComponent() {
	const data = Route.useLoaderData();

	// CDN configuration - needed for both success and error cases
	const cdnHostName = process.env.CDN_HOST_NAME || '';
	const cdnUrl = cdnHostName ? `https://${cdnHostName}/js/dist/` : '/js/dist/';

	if (!data || 'error' in data) {
		// Even for error pages, we need to load the client bundle so it can fetch data
		// This is important for authenticated users whose SSR data fetch may fail
		const codes = data && 'codes' in data ? data.codes : { appCode: '', clientCode: '' };
		return (
			<>
				{/* Critical CSS */}
				<style id="criticalCss" dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />

				{/* External CSS */}
				<link rel="stylesheet" href={`${cdnUrl}css/App.css`} />

				{/* Bootstrap script for client - sets up necessary globals */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.domainAppCode = '${codes.appCode}';
							window.domainClientCode = '${codes.clientCode}';
							${cdnHostName ? `window.cdnPrefix = '${cdnHostName}';` : ''}
							window.__LOCAL_STATIC_PREFIX__ = ${cdnHostName ? 'null' : "'/js/dist'"};
						`,
					}}
				/>

				<div id="app">
					{/* Empty app div - client will render content */}
				</div>

				{/* Client JS bundles */}
				<script src={`${cdnUrl}vendors.js`} defer />
				<script src={`${cdnUrl}index.js`} defer />
			</>
		);
	}

	const { application, page, theme, codes, pageName } = data;

	// Bootstrap data for client hydration
	const bootstrapData = {
		application,
		pageDefinition: { [pageName]: page },
		theme,
		urlDetails: {
			pageName,
			appCode: codes.appCode,
			clientCode: codes.clientCode,
		},
	};

	// Additional CDN configuration for success case
	const cdnStripAPIPrefix = process.env.CDN_STRIP_API_PREFIX || 'true';
	const cdnReplacePlus = process.env.CDN_REPLACE_PLUS === 'true';
	const cdnResizeOptionsType = process.env.CDN_RESIZE_OPTIONS_TYPE || '';

	// External links from application (fonts, stylesheets, etc.)
	const externalLinks = application?.properties?.links || {};

	return (
		<>
			{/* Resource hints for faster loading */}
			{cdnHostName && (
				<>
					<link rel="dns-prefetch" href={`https://${cdnHostName}`} />
					<link rel="preconnect" href={`https://${cdnHostName}`} crossOrigin="anonymous" />
				</>
			)}

			{/* Preload critical resources */}
			<link rel="preload" href={`${cdnUrl}vendors.js`} as="script" />
			<link rel="preload" href={`${cdnUrl}index.js`} as="script" />
			<link rel="preload" href={`${cdnUrl}css/App.css`} as="style" />

			{/* Critical CSS - inline for immediate styling */}
			<style id="criticalCss" dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />

			{/* External CSS - async load */}
			<link rel="stylesheet" href={`${cdnUrl}css/App.css`} />

			{/* External stylesheets from application (fonts, etc.) */}
			{Object.entries(externalLinks).map(([key, link]) => (
				<link
					key={key}
					rel={link.rel || 'stylesheet'}
					href={link.href}
				/>
			))}

			{/* Bootstrap data for client hydration */}
			<script
				dangerouslySetInnerHTML={{
					__html: `
						window.__APP_BOOTSTRAP__ = ${JSON.stringify(bootstrapData)};
						window.domainAppCode = '${codes.appCode}';
						window.domainClientCode = '${codes.clientCode}';
						${cdnHostName ? `window.cdnPrefix = '${cdnHostName}';` : ''}
						${cdnHostName ? `window.cdnStripAPIPrefix = ${cdnStripAPIPrefix};` : ''}
						${cdnHostName ? `window.cdnReplacePlus = ${cdnReplacePlus};` : ''}
						${cdnHostName && cdnResizeOptionsType ? `window.cdnResizeOptionsType = '${cdnResizeOptionsType}';` : ''}
						// When no CDN, use local path prefix for styleProperties and css files
						// This ensures requests go through /js/dist/ which Nginx routes to gateway
						window.__LOCAL_STATIC_PREFIX__ = ${cdnHostName ? 'null' : "'/js/dist'"};
					`,
				}}
			/>

			{/* Main app container - client will render content */}
			{/* Note: We don't use SSRPageRenderer here because it uses React hooks which causes
			    hydration errors when the client bundle has its own React instance.
			    Instead, we let the client render everything using the bootstrap data above. */}
			<div id="app"></div>

			{/* Client JS bundles - defer for non-blocking load */}
			<script src={`${cdnUrl}vendors.js`} defer />
			<script src={`${cdnUrl}index.js`} defer />
		</>
	);
}
