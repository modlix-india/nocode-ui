import axios from 'axios';
import { createRoot, hydrateRoot } from 'react-dom/client';

// TEST CDN CODE
// globalThis.cdnPrefix = 'cdn-local.modlix.com';
// globalThis.cdnStripAPIPrefix = true;
// globalThis.cdnReplacePlus = true;
// globalThis.cdnResizeOptionsType = 'cloudflare';

// PageDefinition type - inline to avoid importing from @modlix/ui-components before bootstrap
interface PageDefinitionType {
	id?: string;
	name: string;
	appCode?: string;
	clientCode?: string;
	rootComponent: string;
	componentDefinition: Record<string, any>;
	eventFunctions?: Record<string, unknown>;
	translations?: Record<string, Record<string, string>>;
	properties?: Record<string, any>;
}

// AppDefinitionResponse type - inline to avoid importing before bootstrap
interface AppDefinitionResponseType {
	auth: any;
	application: any;
	isApplicationLoadFailed: boolean;
	theme: any;
}

declare global {
	var nodeDev: boolean;
	var isDesignMode: boolean;
	var isFullDebugMode: boolean;
	var designMode: string;
	var addDesignModeChangeListener: (fn: () => void) => () => void;
	var removeDesignModeChangeListener: (fn: () => void) => void;
	var raiseDesignModeChangeEvent: () => void;
	var screenType: string;
	var getStore: () => any;
	var getTempStore: () => any;
	var isDebugMode: boolean;
	var pageEditor: {
		selectedComponents: string[];
		selectedSubComponent: string;
		editingPageDefinition: PageDefinitionType;
		personalization: any;
	};
	var fillerValueEditor: {
		selectedComponent?: string;
		selectedSectionNumber?: number;
		personalization?: any;
	};
	var cdnPrefix: string;
	var cdnStripAPIPrefix: boolean;
	var cdnReplacePlus: boolean;
	var cdnResizeOptionsType: string;
	var determineRightClickPosition: (e: MouseEvent) => { x: number; y: number };
	var domainClientCode: string;
	var domainAppCode: string;
	var lastInteracted: number;
	var appDefinitionResponse: AppDefinitionResponseType;
	var pageDefinitionResponse: PageDefinitionType;
	var pageDefinitionRequestPageName: string;
	var styleProperties: any;
	// SSR bootstrap data injected by server
	var __APP_BOOTSTRAP__: {
		application: any;
		pageDefinition: { [key: string]: PageDefinitionType };
		theme: any;
		styles: any;
		urlDetails: {
			pageName: string;
			appCode: string;
			clientCode: string;
		};
	} | undefined;
	// SSR sets this for local static file paths when no CDN is configured
	var __LOCAL_STATIC_PREFIX__: string | null;
	// var d3: typeof import('d3/index');
}

globalThis.styleProperties = {};

// CRITICAL: Set bootstrap data BEFORE any imports from @modlix/ui-components
// This ensures StoreContext.ts gets the data when it initializes
const bootstrap = window.__APP_BOOTSTRAP__;
const AUTH_TOKEN_KEY = globalThis.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';
const hasAuthTokenEarly = typeof window !== 'undefined' && !!window.localStorage?.getItem(AUTH_TOKEN_KEY);

if (bootstrap && !hasAuthTokenEarly) {
	const bootstrapPageName = bootstrap.urlDetails?.pageName;
	globalThis.pageDefinitionRequestPageName = bootstrapPageName;
	globalThis.appDefinitionResponse = {
		auth: undefined,
		application: bootstrap.application,
		isApplicationLoadFailed: false,
		theme: bootstrap.theme,
	};
	globalThis.pageDefinitionResponse = bootstrap.pageDefinition[bootstrapPageName];
}

let listeners: Set<() => void> = new Set();
globalThis.removeDesignModeChangeListener = (fn: () => void) => listeners.delete(fn);
globalThis.addDesignModeChangeListener = (fn: () => void) => {
	listeners.add(fn);
	return () => globalThis.removeDesignModeChangeListener(fn);
};
globalThis.raiseDesignModeChangeEvent = () => listeners.forEach(fn => fn());

// To check if it is designMode
globalThis.isDesignMode = (() => {
	try {
		return window.self !== window.top;
	} catch (e) {
		return false;
	}
})();

// To enable debug mode, add ?debug to the URL
globalThis.isDebugMode = window.location.search.indexOf('debug') != -1;

// To check if the app is being interacted with
globalThis.lastInteracted = Date.now();

const THREE_MINUTES = 3 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;
setInterval(async () => {
	const AUTH_TOKEN_EXPIRY = globalThis.isDebugMode
		? 'designMode_AuthTokenExpiry'
		: 'AuthTokenExpiry';
	const AUTH_TOKEN = globalThis.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';
	let authTokenExpiry = parseInt(window.localStorage.getItem(AUTH_TOKEN_EXPIRY) ?? '0');
	if (isNaN(authTokenExpiry)) return;
	authTokenExpiry *= 1000;

	const now = Date.now();

	if (authTokenExpiry < now) {
		// Token is expired

		const token = window.localStorage.getItem(AUTH_TOKEN);
		window.localStorage.removeItem(AUTH_TOKEN);
		window.localStorage.removeItem(AUTH_TOKEN_EXPIRY);

		if (token) window.location.reload();
		return;
	}

	if (
		authTokenExpiry - now > THREE_MINUTES || // Token expires in more than 2 minutes
		now - window.lastInteracted > FIFTEEN_MINUTES // No interaction for 15 minutes
	)
		return;

	// Refresh token

	const token = window.localStorage.getItem(AUTH_TOKEN);
	if (!token) return;

	axios({
		url: 'api/security/refreshToken',
		method: 'GET',
		headers: {
			Authorization: JSON.parse(token ?? '""'),
		},
	}).then(response => {
		window.localStorage.setItem(AUTH_TOKEN, JSON.stringify(response.data.accessToken));
		window.localStorage.setItem(AUTH_TOKEN_EXPIRY, response.data.accessTokenExpiryAt);
	});
}, 60000);

const app = document.getElementById('app');
if (!app) {
	const span = document.createElement('SPAN');
	span.innerHTML = 'Unable to find "app" div to start the application.';
	document.body.appendChild(span);
} else {
	(async function () {
		// Import functions dynamically - this triggers StoreContext initialization
		// which will now have access to globalThis.appDefinitionResponse set above
		const { processLocation, getPageDefinition } = await import('@modlix/ui-components');
		const { getAppDefinition } = await import('./App/appDefinition');

		const pageName = processLocation(window.location)?.pageName;
		const AUTH_TOKEN = globalThis.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';
		const hasAuthToken = !!window.localStorage.getItem(AUTH_TOKEN);

		let appDefResponse: AppDefinitionResponseType;
		let pageDefResponse: PageDefinitionType;

		// Check for SSR bootstrap data - use it to avoid network requests during hydration
		// Note: Bootstrap data was already set synchronously at module load time above
		if (globalThis.appDefinitionResponse && globalThis.pageDefinitionResponse && !hasAuthToken) {
			// Use pre-set SSR data
			appDefResponse = globalThis.appDefinitionResponse;
			pageDefResponse = globalThis.pageDefinitionResponse;
		} else {
			// No SSR data or user is authenticated - fetch from API
			if (pageName) {
				globalThis.pageDefinitionRequestPageName = pageName;
				[appDefResponse, pageDefResponse] = await Promise.all([
					getAppDefinition(),
					getPageDefinition(pageName),
				]);
			} else {
				appDefResponse = await getAppDefinition();
				globalThis.pageDefinitionRequestPageName =
					appDefResponse?.application?.properties?.defaultPage;
				pageDefResponse = await getPageDefinition(
					globalThis.pageDefinitionRequestPageName,
				);
			}
			// Update globals for non-SSR case
			globalThis.appDefinitionResponse = appDefResponse;
			globalThis.pageDefinitionResponse = pageDefResponse;
		}

		const { App } = await import(/* webpackChunkName: "Application" */ './App/App');
		const { AppStyle } = await import(
			/* webpackChunkName: "ApplicationStyle" */ './App/AppStyle'
		);

		const externalStylePropertyJSONComponents = new Set([
			'Button',
			'Calendar',
			'ColorPicker',
			'Dropdown',
			'FileUpload',
			'Menu',
			'Otp',
			'PhoneNumber',
			'Stepper',
			'Table',
			'TableColumn',
			'TableColumnHeader',
			'TableColumns',
			'TableEmptyGrid',
			'TableGrid',
			'TablePreviewGrid',
			'TextArea',
			'TextBox',
			'Video',
		]);

		const rendered = document.getElementById('_rendered');
		if (rendered) {
			const comps = (rendered.getAttribute('data-used-components') ?? '').split(',');

			for (const eachcomp of comps) {
				if (!externalStylePropertyJSONComponents.has(eachcomp)) continue;

				// This is required for server side rendering to load the needed components style props early on.

				// try {
				// 	globalThis.styleProperties[eachcomp] = (
				// 		await axios.get(lazyStylePropURL(eachcomp))
				// 	)?.data;
				// } catch (err) {}
			}
		}

		const reactNode = (
			<>
				<AppStyle />
				<App />
			</>
		);

		// Hydration decision:
		// - If user has auth token: always use createRoot (authenticated pages aren't SSR'd)
		// - If no _rendered marker: no SSR, use createRoot
		// - Otherwise: attempt hydration
		if (hasAuthToken || !rendered) {
			createRoot(app).render(reactNode);
		} else {
			try {
				hydrateRoot(app, reactNode);
			} catch (err) {
				console.error('Hydration failed, falling back to createRoot:', err);
				createRoot(app).render(reactNode);
			}
		}
	})();
}
