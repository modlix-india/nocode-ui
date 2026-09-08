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
		scripts?: Array<{ src: string }>;
		metas?: Array<{ name?: string; content?: string; property?: string; httpEquiv?: string }>;
		notFoundPage?: string;
		csp?: string | Record<string, string>;
		cspReport?: string | Record<string, string>;
		analytics?: AnalyticsConfig;
	};
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
}

export interface AnalyticsConfig {
	enabled?: boolean;
	autocapture?: boolean;
	capturePageviews?: boolean;
	capturePageleaves?: boolean;
	consentRequired?: boolean;
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
		seo?: {
			description?: { value?: string };
			keywords?: { value?: string };
			ogTitle?: { value?: string };
			ogDescription?: { value?: string };
			ogImage?: { value?: string };
		};
	};
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

	const entries = Object.values(themes)
		.filter((e) => e?.name)
		.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

	if (!entries.length) return undefined;
	if (requested && entries.some((e) => e.name === requested)) return requested;

	return entries[0].name;
}

/**
 * Fetch all data needed for SSR
 * If pageName is 'index' or empty (fallback), uses application's defaultPage
 */
export async function fetchAllPageData(
	pageName: string,
	options: FetchOptions,
	/** The visitor's stored theme, from their cookie. */
	requestedTheme?: string | null
): Promise<{
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
	themeName?: string;
	resolvedPageName: string;
}> {
	// First fetch application (need it for defaultPage and it's always needed)
	const application = await fetchApplication(options);

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
	const themeName = resolveThemeName(application, requestedTheme);
	const [page, theme] = await Promise.all([
		fetchPage(actualPageName, options),
		fetchTheme(options, themeName),
	]);

	logger.debug('Fetched page data', {
		requestedPage: pageName,
		resolvedPage: actualPageName,
		hasApplication: !!application,
		hasPage: !!page,
		hasTheme: !!theme,
	});

	return { application, page, theme, themeName, resolvedPageName: actualPageName };
}
