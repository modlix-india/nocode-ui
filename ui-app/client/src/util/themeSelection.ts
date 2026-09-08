import axios from 'axios';

/**
 * IMPORTANT: this module must not import StoreContext, directly or transitively.
 *
 * `getAppDefinition` uses it, so it sits in index.tsx's static import graph.
 * StoreContext builds `storeInitialObject` from `globalThis.appDefinitionResponse`
 * in its module body, and index.tsx does not assign that until after the fetches
 * — the store is seeded only because StoreContext is first evaluated by the
 * `await import('./App/App')` further down. A value import from here would hoist
 * that evaluation to module init, seed an empty store, and cost exactly the
 * flicker this whole feature is about. `types/common.ts` gets away with importing
 * it because that import is type-only and elided at emit.
 *
 * Anything here needing the store goes in ./selectTheme instead, which is only
 * reachable from the App chunk. There is a test in __tests__ holding this.
 */

/**
 * Which of the application's themes is active, and everything needed to change it.
 *
 * `application.properties.themes` used to be a list that all loaded and merged into
 * one blob. It is now a list of alternatives with exactly one active at a time. Only
 * `name` is required on an entry; every other field is optional and degrades, which
 * is what keeps the definitions that predate this change working untouched.
 *
 * The choice lives in a cookie rather than localStorage for one reason: the server
 * can read a cookie. That is what lets the generated index.html request the right
 * stylesheet before any script of ours runs, which is the whole of the no-flicker
 * story. For a signed-in user the choice is additionally mirrored into the
 * personalization service, which is what carries it to a second device.
 */

export interface ThemeEntry {
	/** Theme document name. The identifier, everywhere. The only required field. */
	name: string;
	displayName?: string;
	icon?: string;
	iconColor?: string;
	/** Style document loaded only while this theme is active. Optional. */
	style?: string;
	order?: number;
}

const COOKIE_PREFIX = 'mlxTheme_';
/** Must match IndexHTMLService.APP_STYLE_LINK_ID. */
const APP_STYLE_LINK_ID = 'mlxAppStyle';
const PERSONALIZATION_NAME = 'theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The app this page belongs to, from the three places it can be known, in the
 * order they become available.
 *
 * `window.__mlxAppCode` is stamped by IndexHTMLService and by the SSR renderer.
 * The URL parse covers the webpack dev server and path-style URLs.
 *
 * `application` is the last resort and the reason this takes an argument at all:
 * on a DOMAIN-MAPPED host the path is `/` or `/editPage/<id>`, there is no
 * `/appCode/clientCode/page` prefix to read, and if nothing stamped the code then
 * every caller here used to get undefined -- at which point `writeThemeCookie` and
 * `writeThemePersonalization` both return early and a theme the visitor picked is
 * silently never remembered. Measured on a draft host: the switch applied and the
 * next load was back to the app default.
 *
 * Deliberately not `globalThis.domainAppCode`: getHref.ts overwrites that with a
 * hardcoded 'appbuilder' the moment it is imported, so its value depends on module
 * evaluation order.
 */
export function currentAppCode(application?: any): string | undefined {
	const stamped = (globalThis as any).__mlxAppCode;
	if (stamped) return stamped;

	const path = typeof window === 'undefined' ? '' : window.location.pathname;
	const index = path.indexOf('/page');
	if (index !== -1) {
		const parts = path.substring(0, index).split('/');
		if (parts.length > 1 && parts[1]) return parts[1];
	}

	return application?.appCode || undefined;
}

/**
 * Design mode gets its own cookie, the same way it gets its own `AuthToken`.
 *
 * The name matters beyond tidiness: the server reads the unprefixed cookie to
 * pick the stylesheet, so prefixing here means an author clicking a switcher in
 * a preview canvas cannot change the theme of the real app in their own browser.
 */
function cookieName(appCode: string): string {
	return (globalThis.isDesignMode ? 'designMode_' : '') + COOKIE_PREFIX + appCode;
}

export function readThemeCookie(appCode: string | undefined): string | undefined {
	if (!appCode || typeof document === 'undefined') return undefined;

	const match = new RegExp(String.raw`(?:^|;\s*)` + cookieName(appCode) + '=([^;]*)').exec(
		document.cookie,
	);
	if (!match) return undefined;

	try {
		return decodeURIComponent(match[1]) || undefined;
	} catch {
		// A value we did not write, or a truncated one. Treat it as absent rather
		// than letting a malformed cookie take the app down on boot.
		return undefined;
	}
}

export function writeThemeCookie(appCode: string | undefined, name: string | undefined) {
	if (!appCode || typeof document === 'undefined') return;

	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	const key = cookieName(appCode);

	if (!name) {
		document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
		return;
	}

	document.cookie =
		`${key}=${encodeURIComponent(name)}` +
		`; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/** The app's themes as a list, ordered the way a switcher should show them. */
export function themeEntries(application: any): ThemeEntry[] {
	const themes = application?.properties?.themes;
	if (!themes || typeof themes !== 'object') return [];

	return Object.values<any>(themes)
		.filter(e => e && typeof e === 'object' && e.name)
		.map(e => ({ ...e, order: Number(e.order ?? 0) }) as ThemeEntry)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getThemeEntry(application: any, name: string | undefined): ThemeEntry | undefined {
	if (!name) return undefined;
	return themeEntries(application).find(e => e.name === name);
}

/**
 * The theme to apply, given everything we know.
 *
 * Preference order: an explicit request, then the signed-in user's stored choice,
 * then this device's cookie, then the app's own default (lowest `order`). A name
 * that is no longer in the list falls through to the default instead of failing —
 * a stored choice outlives the theme it points at, and an author deleting a theme
 * must not leave those visitors unthemed.
 *
 * Note this only knows what is *listed*. A listed theme whose document has been
 * deleted is caught server side, in EngineService.resolveTheme.
 */
export function resolveThemeName(
	application: any,
	{
		requested,
		personalized,
		cookie,
	}: { requested?: string; personalized?: string; cookie?: string },
): string | undefined {
	const entries = themeEntries(application);
	if (!entries.length) return undefined;

	for (const candidate of [requested, personalized, cookie]) {
		if (candidate && entries.some(e => e.name === candidate)) return candidate;
	}

	return entries[0].name;
}

function styleHref(appCode: string | undefined, name: string | undefined): string {
	const base = 'api/ui/style';
	return name ? `${base}?theme=${encodeURIComponent(name)}` : base;
}

/**
 * Point the app stylesheet at a different theme without ever showing an unstyled
 * frame: the replacement is loaded to completion beside the current one, and only
 * then is the old one removed. Mutating the live link's href instead would drop
 * every rule it carries the moment the request starts.
 *
 * Resolves once the new sheet is applied, so the caller can land the variables in
 * the same paint. A load failure resolves too rather than rejecting — a missing
 * style document is not a reason to refuse the theme, and the old sheet is left in
 * place.
 */
export function swapThemeStylesheet(name: string | undefined): Promise<void> {
	if (typeof document === 'undefined') return Promise.resolve();

	// The id is what IndexHTMLService, the SSR renderer and the dev index.html all
	// stamp. The href match is the fallback for a document served before they did,
	// which would otherwise leave the old sheet in place alongside the new one.
	const existing = (document.getElementById(APP_STYLE_LINK_ID) ??
		document.querySelector(
			'link[rel="stylesheet"][href*="api/ui/style"]',
		)) as HTMLLinkElement | null;
	const href = styleHref(currentAppCode(), name);

	if (existing?.getAttribute('href') === href) return Promise.resolve();

	return new Promise<void>(resolve => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.setAttribute('href', href);

		const done = () => {
			if (existing) existing.remove();
			link.id = APP_STYLE_LINK_ID;
			resolve();
		};

		link.addEventListener('load', done, { once: true });
		link.addEventListener('error', () => resolve(), { once: true });

		(existing?.parentNode ?? document.head).insertBefore(link, existing?.nextSibling ?? null);
	});
}

function authToken(): string | undefined {
	const key = globalThis.isDesignMode ? 'designMode_AuthToken' : 'AuthToken';
	const raw = window.localStorage.getItem(key);
	if (!raw) return undefined;
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

export function isSignedIn(): boolean {
	return !!authToken();
}

/**
 * The signed-in user's stored theme, or undefined. Never throws: there is no
 * document until the first switch, and an anonymous caller gets an empty object
 * back rather than a 401.
 */
export async function readThemePersonalization(appCode: string | undefined): Promise<string | undefined> {
	const token = authToken();
	if (!appCode || !token) return undefined;

	try {
		const response = await axios.get(
			`api/ui/personalization/${appCode}/${PERSONALIZATION_NAME}`,
			{ headers: { Authorization: token } },
		);
		return response?.data?.theme || undefined;
	} catch {
		return undefined;
	}
}

export async function writeThemePersonalization(appCode: string | undefined, name: string) {
	const token = authToken();
	if (!appCode || !token) return;

	try {
		await axios.post(
			`api/ui/personalization/${appCode}/${PERSONALIZATION_NAME}`,
			{ theme: name },
			{ headers: { Authorization: token } },
		);
	} catch {
		// A preference is a convenience, not data. The cookie still holds it on
		// this device.
	}
}

/**
 * Is the active theme a dark one?
 *
 * Measured off the theme's own page ground rather than declared, so it is right
 * for a theme nobody generated -- a hand-made one, or one imported with an app --
 * and cannot drift out of step with a palette someone retunes.
 *
 * `surfaceColorOne` is the page ground and every generated palette defines it;
 * `backgroundColorOne` is the fallback for a theme predating that slot. A theme
 * with neither reads as light, which is what the platform has always assumed.
 *
 * Used by any component that keeps a light and a dark chrome of its own and must
 * follow the app rather than offer its own switch.
 */
export function isDarkTheme(variables: any): boolean {
	const all = variables?.ALL ?? variables;
	const ground: string | undefined = all?.surfaceColorOne ?? all?.backgroundColorOne;
	if (typeof ground !== 'string') return false;

	let r: number, g: number, b: number;
	const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(ground.trim());
	if (hex) {
		const h =
			hex[1].length === 3
				? hex[1]
						.split('')
						.map(c => c + c)
						.join('')
				: hex[1];
		[r, g, b] = [0, 2, 4].map(i => Number.parseInt(h.substring(i, i + 2), 16));
	} else {
		const rgb = /^rgba?\(([^)]*)\)$/i.exec(ground.trim());
		if (!rgb) return false;
		[r, g, b] = rgb[1].split(',').map(p => Number.parseFloat(p));
		if ([r, g, b].some(v => Number.isNaN(v))) return false;
	}

	// Relative luminance, halfway as the threshold. Every generated light ground
	// sits above 0.9 and every dark one below 0.1, so nothing here is a near miss.
	return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

export async function fetchThemeVariables(name: string | undefined): Promise<any> {
	try {
		const response = await axios.get('api/ui/theme', {
			params: name ? { theme: name } : undefined,
		});
		return response.status === 200 ? response.data : undefined;
	} catch {
		return undefined;
	}
}
