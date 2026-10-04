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

interface FetchOptions {
	appCode: string;
	clientCode: string;
	authToken?: string | null;
	/**
	 * The hostname the browser actually asked for.
	 *
	 * This is how the draft surface reaches the backend, and it replaces an earlier
	 * attempt that forwarded an `x-draft` header. That did not work: GatewayFilter
	 * strips `x-draft` from EVERY request, including this server-to-server hop, and
	 * then re-derives the surface from the connection it sees, which is
	 * `gateway-server:8080` and never matches a DRAFT row. A draft host therefore
	 * got a live pre-render, cached under a draft key.
	 *
	 * Forwarding the host instead lets the gateway resolve the surface itself, the
	 * same way it does for a direct browser request, and keeps it the single
	 * authority on what is a draft. GatewayFilter.getSchemeHostPort already reads
	 * exactly these three headers.
	 */
	forwardedHost?: string | null;
	forwardedProto?: string | null;
	forwardedPort?: string | null;
}

/**
 * Fetch from backend API with proper headers
 */
async function fetchApi<T>(
	endpoint: string,
	options: FetchOptions
): Promise<T | null> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		appCode: options.appCode,
		clientCode: options.clientCode,
	};

	if (options.authToken) {
		headers['Authorization'] = options.authToken;
	}

	// Deliberately no x-draft here. The gateway strips it on arrival and derives
	// the surface from the forwarded host below, so sending it would be both
	// useless and misleading about where the decision is made.
	if (options.forwardedHost) {
		headers['X-Forwarded-Host'] = options.forwardedHost;
	}
	if (options.forwardedProto) {
		headers['X-Forwarded-Proto'] = options.forwardedProto;
	}
	if (options.forwardedPort) {
		headers['X-Forwarded-Port'] = options.forwardedPort;
	}

	try {
		const gatewayUrl = getGatewayUrl();
		const response = await fetch(`${gatewayUrl}${endpoint}`, { headers });

		if (!response.ok) {
			logger.error('API error', { status: response.status, endpoint });
			return null;
		}

		return response.json() as Promise<T>;
	} catch (error) {
		logger.error('Failed to fetch endpoint', { endpoint, error: String(error) });
		return null;
	}
}

/**
 * Application definition from UI service
 */
export interface ApplicationDefinition {
	id?: string;
	name: string;
	appCode: string;
	clientCode: string;
	properties?: {
		title?: string;
		defaultPage?: string;
		shellPageDefinition?: string;
		loginPage?: string;
		sso3?: boolean;
		fillerValues?: Record<string, unknown>;
		fontPacks?: string[];
		iconPacks?: string[];
		/**
		 * Selectable appearances, exactly one active at a time. Only `name` is
		 * required; every other field is optional and degrades.
		 */
		themes?: Record<string, ThemeEntry>;
		styles?: Record<string, { name: string; order?: number }>;
		codeParts?: {
			cdnPrefix?: string;
			[key: string]: string | undefined;
		};
		links?: Record<string, { rel: string; href: string }>;
		/**
		 * Head tags, stored as a KEYED MAP, not an array.
		 *
		 * These were typed here as arrays and consumed with `for...of`, which
		 * throws `TypeError: not iterable` on the shape the platform actually
		 * stores -- so every app that had ever used the Head tags pane rendered
		 * as a bare 500 from SSR. The map is what the Java renderer reads
		 * (`IndexHTMLService.processTagType` iterates `.values()`), what the
		 * React client reads (`App.tsx` `Object.entries`), and what the
		 * appbuilder Settings pane writes. The array arm stays accepted because
		 * nothing guarantees which shape a given document is in.
		 *
		 * `order` sorts ASCENDING, matching the Java `MapWithOrderComparator`.
		 * The client sorts descending and SSR used not to sort at all; prod is
		 * rendered by this file and the Java one, so those two are the pair
		 * worth agreeing.
		 */
		scripts?: HeadTagCollection<{ src?: string; order?: number }>;
		metas?: HeadTagCollection<MetaTag>;
		/**
		 * Site-wide Open Graph defaults. Every page of the app inherits these
		 * unless its own `properties.seo` overrides the same property.
		 *
		 * This is a subtree of its own rather than entries in `metas` because a
		 * meta may only carry `charset`, `name`, `http-equiv` and `content` on
		 * the Java path, and Open Graph needs `property`. An og tag expressed
		 * through `metas` renders there as `<meta content="...">`, which is
		 * nothing at all.
		 */
		og?: OpenGraphDefaults;
		notFoundPage?: string;
		csp?: string | Record<string, string>;
		cspReport?: string | Record<string, string>;
		analytics?: AnalyticsConfig;
	};
}

/**
 * A head tag collection as stored: a map keyed by the tag's generated id. The
 * array arm is tolerated because older documents and hand-written fixtures use
 * it, and a renderer that throws on one of two shapes is worse than one that
 * reads both.
 */
export type HeadTagCollection<T> = Record<string, T> | T[];

export interface MetaTag {
	name?: string;
	content?: string;
	property?: string;
	/**
	 * Stored under the HTML attribute name, `http-equiv`. `httpEquiv` is
	 * accepted too: it is what this file used to declare, so a fixture or a
	 * caller written against the old type keeps working.
	 */
	'http-equiv'?: string;
	httpEquiv?: string;
	charset?: string;
	order?: number | string;
}

/** An og:image and its structured properties, per ogp.me. */
export interface OpenGraphImage {
	url?: string;
	alt?: string;
	width?: number | string;
	height?: number | string;
	type?: string;
}

export interface OpenGraphDefaults {
	siteName?: string;
	title?: string;
	description?: string;
	/** An ogp.me global type. Defaults to `website`, which is also ogp.me's default. */
	type?: string;
	locale?: string;
	localeAlternate?: string[];
	/** One of `a`, `an`, `the`, `""`, `auto`. */
	determiner?: string;
	/**
	 * The origin every canonical URL is built from, e.g. `https://sitezump.ai`.
	 *
	 * Deliberately configured rather than taken from the request host: the HTML
	 * cache key carries no host, so an app reachable on two domains shares one
	 * cached document and a host-derived `og:url` would bake whichever host
	 * missed the cache first into everyone's card.
	 */
	canonicalBase?: string;
	image?: OpenGraphImage;
	twitter?: { card?: string; site?: string; creator?: string };
	fbAppId?: string;
}

export interface ThemeEntry {
	/** Theme document name. The identifier, everywhere. */
	name: string;
	displayName?: string;
	icon?: string;
	iconColor?: string;
	/** Style document loaded only while this theme is active. Optional. */
	style?: string;
	order?: number;
	/** Only a page can name it (`properties.theme`); never the default or a stored choice. */
	pageOnly?: boolean;
}

export interface AnalyticsConfig {
	enabled?: boolean;
	autocapture?: boolean;
	capturePageviews?: boolean;
	capturePageleaves?: boolean;
	/**
	 * Scroll-depth capture. On unless the app turns it off, which is the
	 * default both renderers apply.
	 *
	 * This interface is a hand-kept mirror of the analytics block the UI
	 * service returns, so a key added to the beacon and not added here does
	 * not fail where it was written. It fails `tsc` in the SSR image build,
	 * which is what happened: htmlRenderer started emitting `data-scroll`
	 * and every deploy from master, cf-development and cf-stage stopped
	 * building, while cf-production kept working only because it did not
	 * have the beacon change yet.
	 */
	captureScroll?: boolean;
	consentCookieName?: string;
	sessionReplay?: {
		enabled?: boolean;
		maskAllInputs?: boolean;
		sampleRate?: number;
	};
	heatmaps?: {
		enabled?: boolean;
	};
}

/**
 * Page definition from UI service
 */
export interface PageDefinition {
	id?: string;
	name: string;
	appCode?: string;
	clientCode?: string;
	rootComponent: string;
	componentDefinition: Record<string, ComponentDefinition>;
	eventFunctions?: Record<string, unknown>;
	translations?: Record<string, Record<string, string>>;
	properties?: {
		title?: { name?: { value?: string }; append?: { value?: boolean } };
		onLoadEvent?: string;
		wrapShell?: boolean;
		/**
		 * Per-page metadata. Every value is a ComponentProperty, but only
		 * `.value` is ever read here: there is no store, no TokenValueExtractor
		 * and no getData in this process, so an expression-bound field is filled
		 * in by the client long after any crawler has read the document. The
		 * authoring surfaces write plain values for that reason.
		 *
		 * The index signature matches the client's own type and keeps unknown
		 * keys readable rather than dropping them.
		 */
		seo?: SeoProperties;
	};
}

/** A page SEO value. Only `value` is server-rendered; see `seo` above. */
export interface SeoValue {
	value?: string;
}

export interface SeoProperties {
	description?: SeoValue;
	keywords?: SeoValue;
	robots?: SeoValue;
	charset?: SeoValue;
	author?: SeoValue;
	applicationName?: SeoValue;
	generator?: SeoValue;

	ogTitle?: SeoValue;
	ogDescription?: SeoValue;
	ogImage?: SeoValue;
	ogImageAlt?: SeoValue;
	ogImageWidth?: SeoValue;
	ogImageHeight?: SeoValue;
	ogImageType?: SeoValue;
	ogType?: SeoValue;
	ogUrl?: SeoValue;
	ogLocale?: SeoValue;
	ogDeterminer?: SeoValue;
	ogSiteName?: SeoValue;

	twitterCard?: SeoValue;
	twitterSite?: SeoValue;
	twitterCreator?: SeoValue;

	/** Emitted only when `ogType` is `article`, per ogp.me's type-specific set. */
	articlePublishedTime?: SeoValue;
	articleModifiedTime?: SeoValue;
	articleAuthor?: SeoValue;
	articleSection?: SeoValue;
	articleTag?: SeoValue;

	[key: string]: SeoValue | undefined;
}

export interface ComponentDefinition {
	key: string;
	name: string;
	type: string;
	properties?: Record<string, ComponentProperty>;
	styleProperties?: Record<string, unknown>;
	children?: Record<string, boolean>;
	displayOrder?: number;
	override?: boolean;
}

export interface ComponentProperty<T = unknown> {
	value?: T;
	location?: {
		type: 'EXPRESSION' | 'VALUE';
		value?: string;
		expression?: string;
	};
	overrideValue?: T;
}

/**
 * Theme definition
 */
export interface ThemeDefinition {
	[key: string]: Record<string, string>;
}

/**
 * Fetch application definition
 */
export async function fetchApplication(
	options: FetchOptions
): Promise<ApplicationDefinition | null> {
	return fetchApi<ApplicationDefinition>('/api/ui/application', options);
}

/**
 * Fetch page definition
 */
export async function fetchPage(
	pageName: string,
	options: FetchOptions
): Promise<PageDefinition | null> {
	return fetchApi<PageDefinition>(`/api/ui/page/${encodeURIComponent(pageName)}`, options);
}

/**
 * Fetch theme
 */
export async function fetchTheme(
	options: FetchOptions,
	themeName?: string | null
): Promise<ThemeDefinition | null> {
	const query = themeName ? `?theme=${encodeURIComponent(themeName)}` : '';
	return fetchApi<ThemeDefinition>(`/api/ui/theme${query}`, options);
}

/**
 * The theme to render with: the visitor's stored choice if it is still listed,
 * otherwise the app's default (lowest `order`).
 *
 * This is the same rule as `resolveThemeName` in the client's themeSelection.ts
 * and `themeCandidates` in EngineService, and all three have to agree. If SSR
 * picked a different theme from the one the client resolves to, the client would
 * throw away the bootstrap theme and refetch, costing a round trip on every SSR
 * page load.
 *
 * Only knows what is listed. A listed theme whose document has been deleted is
 * caught by the ui service, which is why the name is passed on rather than
 * verified here.
 */
export function resolveThemeName(
	application: ApplicationDefinition | null,
	requested?: string | null
): string | undefined {
	const themes = application?.properties?.themes;
	if (!themes) return undefined;

	const listed = Object.values(themes)
		.filter((e) => e?.name)
		.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
	// Page-only themes are never a visitor's theme (see ThemeEntry.pageOnly).
	const chosen = listed.filter((e) => !e.pageOnly);
	const entries = chosen.length ? chosen : listed;

	if (!entries.length) return undefined;
	if (requested && entries.some((e) => e.name === requested)) return requested;

	return entries[0].name;
}

/**
 * The theme a page names in `properties.theme`, when the app lists it; undefined
 * to follow the visitor's choice. Must agree with `pageThemeName` in the client's
 * themeSelection.ts, or the client would refetch the theme SSR rendered with.
 */
export function pageThemeName(
	application: ApplicationDefinition | null,
	page: PageDefinition | null
): string | undefined {
	const name = (page as any)?.properties?.theme;
	const themes = application?.properties?.themes;
	return typeof name === 'string' && themes && Object.values(themes).some((e) => e?.name === name)
		? name
		: undefined;
}

/**
 * Fetch all data needed for SSR
 * If pageName is 'index' or empty (fallback), uses application's defaultPage
 */
export async function fetchAllPageData(
	pageName: string,
	options: FetchOptions,
	/** The visitor's stored theme, from their cookie. */
	requestedTheme?: string | null,
	/**
	 * The definition the caller already holds, so page routing can be resolved
	 * before the page is chosen without paying for a second fetch. The
	 * application was always fetched first and awaited here anyway, so handing it
	 * in costs nothing and saves a round trip.
	 */
	preloadedApplication?: ApplicationDefinition | null
): Promise<{
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
	themeName?: string;
	resolvedPageName: string;
}> {
	// First fetch application (need it for defaultPage and it's always needed)
	const application =
		preloadedApplication !== undefined ? preloadedApplication : await fetchApplication(options);

	// Resolve actual page name - use defaultPage if pageName is empty or 'index'
	let actualPageName = pageName;
	const needsDefaultPage = !pageName || pageName === 'index';

	if (needsDefaultPage && application?.properties?.defaultPage) {
		actualPageName = application.properties.defaultPage;
		logger.debug('Using default page from application', {
			requestedPage: pageName,
			defaultPage: actualPageName,
		});
	}

	// Now fetch page and theme in parallel
	let themeName = resolveThemeName(application, requestedTheme);
	let [page, theme] = await Promise.all([
		fetchPage(actualPageName, options),
		fetchTheme(options, themeName),
	]);

	// A page may name its own theme (`properties.theme`), which beats the visitor's
	// choice for that page only. Same rule as `pageThemeName` in the client's
	// themeSelection.ts: honoured only when the app lists it. Costs a second theme
	// fetch only on such a page, and only when it differs from the visitor's.
	const pageTheme = pageThemeName(application, page);
	if (pageTheme && pageTheme !== themeName) {
		themeName = pageTheme;
		theme = await fetchTheme(options, themeName);
	}

	logger.debug('Fetched page data', {
		requestedPage: pageName,
		resolvedPage: actualPageName,
		hasApplication: !!application,
		hasPage: !!page,
		hasTheme: !!theme,
	});

	return { application, page, theme, themeName, resolvedPageName: actualPageName };
}
