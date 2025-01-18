import axios from 'axios';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppDefinitionResponse, getAppDefinition } from './App/appDefinition';
import { PageDefinition } from './types/common';
import getPageDefinition from './Engine/pageDefinition';
import { processLocation } from './util/locationProcessor';
import { lazyStylePropURL } from './components/util/lazyStylePropertyUtil';

// TEST CDN CODE
// window.cdnPrefix = 'cdn-dev.modlix.com';
// window.cdnStripAPIPrefix = true;
// window.cdnReplacePlus = true;

declare global {
	var nodeDev: boolean;
	var isDesignMode: boolean;
	var designMode: string;
	var addDesignModeChangeListener: (fn: () => void) => () => void;
	var removeDesignModeChangeListener: (fn: () => void) => void;
	var raiseDesignModeChangeEvent: () => void;
	var screenType: string;
	var getStore: () => any;
	var isDebugMode: boolean;
	var pageEditor: {
		selectedComponents: string[];
		selectedSubComponent: string;
		editingPageDefinition: PageDefinition;
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
	var determineRightClickPosition: (e: MouseEvent) => { x: number; y: number };
	var domainClientCode: string;
	var domainAppCode: string;
	var lastInteracted: number;
	var appDefinitionResponse: AppDefinitionResponse;
	var pageDefinitionResponse: PageDefinition;
	var pageDefinitionRequestPageName: string;
	// var d3: typeof import('d3/index');
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
	const AUTH_TOKEN_EXPIRY = window.isDebugMode ? 'designMode_AuthTokenExpiry' : 'AuthTokenExpiry';
	const AUTH_TOKEN = window.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';
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
		const pageName = processLocation(window.location)?.pageName;

		let appDefinitionResponse, pageDefinitionResponse;
		if (pageName) {
			globalThis.pageDefinitionRequestPageName = pageName;
			[appDefinitionResponse, pageDefinitionResponse] = await Promise.all([
				getAppDefinition(),
				getPageDefinition(pageName),
			]);
		} else {
			appDefinitionResponse = await getAppDefinition();
			globalThis.pageDefinitionRequestPageName =
				appDefinitionResponse?.application?.properties?.defaultPage;
			pageDefinitionResponse = await getPageDefinition(
				globalThis.pageDefinitionRequestPageName,
			);
		}

		globalThis.appDefinitionResponse = appDefinitionResponse;
		globalThis.pageDefinitionResponse = pageDefinitionResponse;

		const AUTH_TOKEN = window.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';

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
				try {
					await axios.get(lazyStylePropURL(eachcomp));
				} catch (err) {}
			}
		}

		const reactNode = (
			<>
				<AppStyle />
				<App />
			</>
		);
		if (window.localStorage.getItem(AUTH_TOKEN) || !rendered) createRoot(app).render(reactNode);
		else
			try {
				hydrateRoot(app, reactNode);
			} catch (err) {
				console.error('Hydration failed...', err);
				createRoot(app).render(reactNode);
			}
	})();
}
