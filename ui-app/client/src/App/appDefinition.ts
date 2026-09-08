import axios, { AxiosRequestConfig } from 'axios';
import { shortUUID } from '../util/shortUUID';
import { consumeSsoArrival, hasAskedBeacon, isSsoEnabled, ssoBounce } from '../sso/ssoModule';
import {
	currentAppCode,
	readThemeCookie,
	readThemePersonalization,
	resolveThemeName,
	swapThemeStylesheet,
	writeThemeCookie,
	writeThemePersonalization,
} from '../util/themeSelection';

export interface AppDefinitionResponse {
	auth: any;
	application: any;
	isApplicationLoadFailed: boolean;
	theme: any;
	/** The theme `theme` came from. Seeds Store.selectedTheme before React mounts. */
	selectedTheme?: string;
}

export async function getAppDefinition(): Promise<AppDefinitionResponse> {
	let TOKEN_NAME = 'AuthToken';
	let TOKEN_EXPIRY = 'AuthTokenExpiry';
	let TOKEN_LANGUAGE = 'currentLanguage';

	if (globalThis.isDesignMode) {
		TOKEN_NAME = 'designMode_AuthToken';
		TOKEN_EXPIRY = 'designMode_AuthTokenExpiry';
		TOKEN_LANGUAGE = 'designMode_currentLanguage';
	}

	// A return from the beacon carries the session on the URL, and has to be banked before
	// the token is read below. It also scrubs the one-time token off the address bar.
	await consumeSsoArrival();

	const authToken = localStorage.getItem(TOKEN_NAME);
	const authExpiry = localStorage.getItem(TOKEN_EXPIRY);

	let axiosOptions: AxiosRequestConfig<any> = { headers: {} };
	let language: string | undefined = undefined;
	let auth: any = undefined;
	if (authToken) {
		if (parseInt(authExpiry ?? '0') * 1000 < Date.now()) {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
		} else {
			({ axiosOptions, auth } = await makeVerifyTokenCall(
				axiosOptions,
				authToken,
				language,
				TOKEN_NAME,
				TOKEN_EXPIRY,
			));
		}
	}

	let application,
		isApplicationLoadFailed = false,
		theme;

	// The signed-in user's stored theme is fetched alongside the app definition
	// rather than after it, when the app code is already known from the URL or the
	// stamp: the round trip is then free, finishing before the theme request it has
	// to inform. Fetching it later would mean the first paint used the wrong theme
	// and had to be corrected.
	const urlAppCode = currentAppCode();

	let personalizedTheme;
	[{ application, isApplicationLoadFailed, language }, personalizedTheme] = await Promise.all([
		makeAppDefinitionCall(axiosOptions, language),
		readThemePersonalization(urlAppCode),
	]);

	// A domain-mapped host has no app code in its path, so on those the definition
	// itself is the only source and this second attempt is what makes a remembered
	// theme work there at all. It costs one serial request, and only there.
	const appCode = urlAppCode ?? currentAppCode(application);
	const cookieTheme = readThemeCookie(appCode);
	if (!urlAppCode) personalizedTheme = await readThemePersonalization(appCode);

	// Cold start with no session: ask the beacon, once. `isSsoEnabled` rather than a bare
	// `properties.sso3` check, so design mode is excluded here the way it is everywhere else;
	// the old check fired inside the appbuilder design-mode iframe.
	if (!auth && isSsoEnabled(application) && !hasAskedBeacon()) {
		// Navigates, so nothing below this runs. The browser comes back to this same URL
		// carrying either a one-time token or `sso=none`, and `consumeSsoArrival` above
		// banks it on that second pass.
		ssoBounce({
			appCode: application.appCode,
			clientCode: application.urlClientCode ?? '',
		});
	}
	if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();

	const selectedTheme = resolveThemeName(application, {
		personalized: personalizedTheme,
		cookie: cookieTheme,
	});

	try {
		// The SSR bootstrap is only usable when it carries the theme we resolved to.
		// It is rendered from a shared cache with no knowledge of this visitor, so
		// for anyone who has picked a non-default theme it holds the wrong one —
		// and taking it would apply that wrong theme permanently, not just for a
		// frame. `themeName` is absent until the SSR side is taught to stamp it,
		// which is why the comparison also accepts "we resolved to the default".
		const bootstrap = globalThis.__APP_BOOTSTRAP__;
		const bootstrapTheme =
			bootstrap?.themeName ?? resolveThemeName(application, {});

		if (bootstrap && bootstrapTheme === selectedTheme) theme = bootstrap.theme;
		else {
			const themeOptions: AxiosRequestConfig<any> = { ...axiosOptions };
			if (selectedTheme) themeOptions.params = { theme: selectedTheme };
			const response = await axios.get('api/ui/theme', themeOptions);
			if (response.status === 200) theme = response.data;
		}
	} catch (err) {}

	// The document was served with a stylesheet chosen from the COOKIE, because the
	// cookie is the only part of this the server can read. When the signed-in
	// user's stored choice differs -- they switched theme on another device, so
	// this device's cookie is stale -- resolution correctly prefers the stored one,
	// and the app then wore that theme's variables over the cookie theme's CSS
	// until someone reloaded twice. This is the only place that mismatch is
	// knowable, and swapThemeStylesheet is a no-op when the hrefs already agree, so
	// the common case costs nothing.
	await swapThemeStylesheet(selectedTheme);

	// Rewrite whatever disagrees with what actually resolved, so a theme that has
	// been deleted stops being replayed on every load, on every device.
	if (selectedTheme && selectedTheme !== cookieTheme) writeThemeCookie(appCode, selectedTheme);
	if (selectedTheme && personalizedTheme && selectedTheme !== personalizedTheme)
		writeThemePersonalization(appCode, selectedTheme);

	if (language) localStorage.setItem(TOKEN_LANGUAGE, language);
	else localStorage.removeItem(TOKEN_LANGUAGE);

	return { auth, application, isApplicationLoadFailed, theme, selectedTheme };
}

async function makeAppDefinitionCall(
	axiosOptions: AxiosRequestConfig<any>,
	language: string | undefined,
) {
	let application = undefined;
	let isApplicationLoadFailed = false;
	try {
		if (globalThis.__APP_BOOTSTRAP__?.application)
			application = globalThis.__APP_BOOTSTRAP__?.application;
		else {
		const response = await axios.get('api/ui/application', axiosOptions);
		if (response.status === 200) {
			application = response.data;
			
		}}
		if (application  && !language) language = application.defaultLanguage;
	} catch (e) {
		isApplicationLoadFailed = true;
		console.error('Unable to load application definition:', e);
	}
	return { application, isApplicationLoadFailed, language };
}

async function makeVerifyTokenCall(
	axiosOptions: AxiosRequestConfig<any>,
	authToken: string,
	language: string | undefined,
	TOKEN_NAME: string,
	TOKEN_EXPIRY: string,
) {
	try {
		axiosOptions.headers!.Authorization = JSON.parse(authToken);
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();
		const response = await axios.get('api/security/verifyToken', axiosOptions);

		if (response.status === 200) {
			language = response.data.localeCode;
			// localStorage.setItem(, language);
		} else {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
			axiosOptions = {};
		}
		return { auth: response?.data, axiosOptions, language };
	} catch (e) {
		console.error('Unable to verify token:', e);
		// localStorage.removeItem(TOKEN_NAME);
		// localStorage.removeItem(TOKEN_EXPIRY);
		axiosOptions = { headers: {} };
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();
	}
	return { axiosOptions, language };
}
