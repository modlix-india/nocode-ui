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
		fillerValues?: Record<string, unknown>;
		fontPacks?: string[];
		iconPacks?: string[];
		themes?: Record<string, { name: string }>;
		styles?: Record<string, { name: string }>;
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
	options: FetchOptions
): Promise<ThemeDefinition | null> {
	return fetchApi<ThemeDefinition>('/api/ui/theme', options);
}

/**
 * Fetch all data needed for SSR
 * If pageName is 'index' or empty (fallback), uses application's defaultPage
 */
export async function fetchAllPageData(
	pageName: string,
	options: FetchOptions
): Promise<{
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
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
	const [page, theme] = await Promise.all([
		fetchPage(actualPageName, options),
		fetchTheme(options),
	]);

	logger.debug('Fetched page data', {
		requestedPage: pageName,
		resolvedPage: actualPageName,
		hasApplication: !!application,
		hasPage: !!page,
		hasTheme: !!theme,
	});

	return { application, page, theme, resolvedPageName: actualPageName };
}
