import axios from 'axios';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ErrorBoundary } from './App/ErrorBoundary';
import { AppDefinitionResponse, getAppDefinition } from './App/appDefinition';
import { PageDefinition } from './types/common';
import getPageDefinition from './Engine/pageDefinition';
import { processLocation } from './util/locationProcessor';
import { consumeSocialArrival, consumeSsoArrival } from './sso/ssoModule';
import { lazyStylePropURL } from './components/util/lazyStylePropertyUtil';
import DraftBanner from './components/DraftBanner';

// TEST CDN CODE
// globalThis.cdnPrefix = 'cdn-local.modlix.com';
// globalThis.cdnStripAPIPrefix = true;
// globalThis.cdnReplacePlus = true;
// globalThis.cdnResizeOptionsType = 'cloudflare';

// TEST SSO3
// globalThis.__SSO_BEACON_HOST__ = 'authzump.local.modlix.com';
// globalThis.__SOCIAL_LOGIN_HOST__ = 'authzump.local.modlix.com';

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
		editingPageDefinition: PageDefinition;
		personalization: any;
	};
	var fillerValueEditor: {
		selectedComponent?: string;
		selectedSectionNumber?: number;
		personalization?: any;
	};
	var cdnPrefix: string;
	var buildVersion: string;
	var cdnStripAPIPrefix: boolean;
	var cdnReplacePlus: boolean;
	var cdnResizeOptionsType: string;
	var determineRightClickPosition: (e: MouseEvent) => { x: number; y: number };
	var domainClientCode: string;
	var domainAppCode: string;
	var lastInteracted: number;
	var styleProperties: any;
	var __APP_BOOTSTRAP__: {
		application: any;
		pageDefinition: any;
		theme: any;
		/** Which theme `theme` is. Absent means the app's default. */
		themeName?: string;
		/**
		 * The page routing resolved to, which need not be the one named in the URL.
		 * Absent when the shell came from the Java ui service rather than SSR, in
		 * which case the client resolves for itself.
		 */
		resolvedPageName?: string;
		urlDetails: any;
	}
	/**
	 * The app this page belongs to, stamped by IndexHTMLService. Read this rather
	 * than `domainAppCode`, which getHref.ts overwrites on import.
	 */
	var __mlxAppCode: string;
	var appDefinitionResponse: AppDefinitionResponse;
	var pageDefinitionResponse: PageDefinition;
	var pageDefinitionRequestPageName: string;
	var debugContext: any;
	var isDraftMode: boolean;
	// var d3: typeof import('d3/index');
}

globalThis.debugContext = {};
globalThis.styleProperties = {};

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

// Whether this page is being served from the app's draft surface.
//
// Derived from the response, not from the URL. The gateway resolves the hostname
// and stamps every request, so the server is the authority on which surface this
// is and the client only needs to know for its own chrome. Reading it from a
// query parameter would make it look settable from here, which it is not.
globalThis.isDraftMode = (() => {
	try {
		if (document.documentElement.getAttribute('data-draft') === 'true') return true;

		// Local dev only, and it exists because the two cannot both be had: the
		// webpack dev server serves its own index.html, so `data-draft` is never
		// stamped, and routing the document to the ui service instead would serve
		// the CDN bundle and throw away every local change. So on the dev shell
		// alone, fall back to the two shapes the platform mints: `d` plus 32 hex
		// for the permanent draft link, `t-` plus 32 hex for an editing session's
		// grant.
		//
		// `nodeDev` is set in src/index.html and nowhere else, so this branch
		// cannot exist in a real deployment, where the stamp above is the only
		// answer and the gateway remains the only thing that decides.
		if (globalThis.nodeDev === true)
			return /^(d|t-)[0-9a-f]{32}\./.test(window.location.hostname);

		return false;
	} catch (e) {
		return false;
	}
})();

// To check if the app is being interacted with
globalThis.lastInteracted = Date.now();

// Real interaction, not just page events.
//
// The refresher below stops renewing the session once this goes fifteen minutes
// stale, and until now the ONLY thing that stamped it was `runEvent`, i.e. a KIRun
// page-event function firing. That is a fair proxy for a rendered app and a bad one
// for anything built in React on top of the engine: a whole hour in the page editor
// -- dragging components, typing in the property panel, saving -- runs no page event
// at all, so the session was declared idle at minute fifteen and left to die at
// thirty while somebody was actively working in it. What that looked like was every
// call answered 401 for up to a minute, until the tick below noticed the expiry and
// reloaded, or the user reloaded first -- which is why a refresh always "fixed" it.
//
// Capture phase and passive, so this cannot be stopped by a handler that swallows
// the event and cannot delay scrolling. `visibilitychange` counts because coming
// back to a tab is the moment a stale session is about to be used.
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(name =>
	window.addEventListener(name, () => (window.lastInteracted = Date.now()), {
		capture: true,
		passive: true,
	}),
);
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') window.lastInteracted = Date.now();
});

const THREE_MINUTES = 3 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

// One refresh at a time.
//
// The server REVOKES the old token before issuing the new one, so a second refresh
// started while the first is still in flight sends a value that is already dead: it
// is answered 401, its `then` never runs, and the live token the first call returned
// is never written. The tick is every 60s and the refresh window is the last 3
// minutes of the token's life, so there are three chances to do that.
let refreshInFlight = false;

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
	if (!token || refreshInFlight) return;

	refreshInFlight = true;
	axios({
		url: 'api/security/refreshToken',
		method: 'GET',
		headers: {
			Authorization: JSON.parse(token ?? '""'),
		},
	})
		.then(response => {
			window.localStorage.setItem(AUTH_TOKEN, JSON.stringify(response.data.accessToken));
			window.localStorage.setItem(AUTH_TOKEN_EXPIRY, response.data.accessTokenExpiryAt);
		})
		.catch(e => {
			// A 401/403 means this token is already gone -- revoked by a sign-out
			// elsewhere, or by a refresh whose reply we never received. Keeping it
			// would leave every subsequent call answered 401 with nothing to fix it
			// but a manual reload. Dropping it and reloading is what the user was
			// doing by hand, and on an SSO app the beacon seeds a fresh session on
			// the way back, so it is invisible.
			//
			// Anything else -- a 5xx, an offline blip -- must leave the token alone.
			// The session is probably fine and the next tick will try again; signing
			// somebody out over a flaky connection is the worse failure.
			const status = e?.response?.status;
			if (status !== 401 && status !== 403) return;

			window.localStorage.removeItem(AUTH_TOKEN);
			window.localStorage.removeItem(AUTH_TOKEN_EXPIRY);
			window.location.reload();
		})
		.finally(() => {
			refreshInFlight = false;
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

		// A return from the SSO beacon carries the session as a one-time token on the URL,
		// and it has to be banked BEFORE either call below starts. `getAppDefinition` does
		// this itself, but the two run under one `Promise.all`, and `getPageDefinition`
		// reads `localStorage.AuthToken` on its first synchronous line -- so it raced the
		// redeem, went out anonymous, was answered 403, and the app fell back to its login
		// page with a perfectly good session already in hand. That is why an arrival from
		// the beacon rendered the sign-in screen and only a second load showed the real
		// page. Awaiting it here is a no-op on every other load: the arrival params are
		// scrubbed off the URL once consumed, so the call inside `getAppDefinition`
		// returns immediately on the second pass.
		await consumeSsoArrival();

		// A return from a social-login callback is the same problem with a different token:
		// the provider-verified profile and a single-use state arrive on the URL, and the
		// session has to exist before the two calls below go out. This is also the only place
		// the social return leg is handled at all, so it works the same on every app rather
		// than only on the ones whose pages were wired for it. A no-op without a `sessionId`
		// param, which is every ordinary load.
		await consumeSocialArrival();

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

		const AUTH_TOKEN = globalThis.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';

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
			<ErrorBoundary>
				<AppStyle />
				<App />
				<DraftBanner />
			</ErrorBoundary>
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
