const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

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
		const response = await fetch(`${GATEWAY_URL}${endpoint}`, { headers });

		if (!response.ok) {
			console.error(`API error ${response.status} for ${endpoint}`);
			return null;
		}

		return response.json();
	} catch (error) {
		console.error(`Failed to fetch ${endpoint}:`, error);
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
		metas?: Array<{ name: string; content: string }>;
		notFoundPage?: string;
		csp?: string;
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
 * Style definition
 */
export interface StyleDefinition {
	name: string;
	appCode: string;
	clientCode: string;
	definition?: Record<string, unknown>;
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
 * Fetch styles
 */
export async function fetchStyles(
	options: FetchOptions
): Promise<StyleDefinition[] | null> {
	return fetchApi<StyleDefinition[]>('/api/ui/styles', options);
}

/**
 * Fetch all data needed for SSR
 * If pageName is 'index' (fallback), uses application's defaultPage
 */
export async function fetchAllPageData(
	pageName: string,
	options: FetchOptions
): Promise<{
	application: ApplicationDefinition | null;
	page: PageDefinition | null;
	theme: ThemeDefinition | null;
	styles: StyleDefinition[] | null;
	resolvedPageName: string;
}> {
	// First fetch application (need it for defaultPage and it's always needed)
	const application = await fetchApplication(options);

	// Resolve actual page name - use defaultPage if pageName is 'index' (the fallback)
	let actualPageName = pageName;
	if (pageName === 'index' && application?.properties?.defaultPage) {
		actualPageName = application.properties.defaultPage;
	}

	// Now fetch page, theme, and styles in parallel
	const [page, theme, styles] = await Promise.all([
		fetchPage(actualPageName, options),
		fetchTheme(options),
		fetchStyles(options),
	]);

	return { application, page, theme, styles, resolvedPageName: actualPageName };
}
