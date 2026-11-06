/**
 * `?lang=<code>` (PLAT-1550): the SSR's hreflang alternates point at it, so the app must load in
 * that language when it has it, and otherwise choose exactly as before.
 */
import { getAppDefinition } from '../appDefinition';

jest.mock('axios');
jest.mock('../../sso/ssoModule', () => ({
	consumeSsoArrival: jest.fn(async () => undefined),
	hasAskedBeacon: jest.fn(() => true),
	isLeavingForBeacon: jest.fn(() => false),
	isSsoEnabled: jest.fn(() => false),
	ssoBounce: jest.fn(),
}));
jest.mock('../../util/themeSelection', () => ({
	currentAppCode: jest.fn(() => 'shop'),
	pageThemeName: jest.fn(() => undefined),
	readThemeCookie: jest.fn(() => undefined),
	readThemePersonalization: jest.fn(async () => undefined),
	resolveThemeName: jest.fn(() => 'light'),
	swapThemeStylesheet: jest.fn(async () => undefined),
	writeThemeCookie: jest.fn(),
	writeThemePersonalization: jest.fn(),
}));

const application = {
	appCode: 'shop',
	defaultLanguage: 'en',
	languages: { en: 'English', hi: 'Hindi' },
	properties: {},
};

async function languageAt(search: string, app: any = application) {
	window.history.replaceState(null, '', `/page/home${search}`);
	globalThis.__APP_BOOTSTRAP__ = {
		application: app,
		pageDefinition: undefined,
		theme: {},
		themeName: 'light',
		urlDetails: {},
	};
	localStorage.clear();
	await getAppDefinition();
	return localStorage.getItem('currentLanguage');
}

afterEach(() => {
	(globalThis as any).__APP_BOOTSTRAP__ = undefined;
	window.history.replaceState(null, '', '/');
	localStorage.clear();
});

describe('getAppDefinition language', () => {
	it('loads in the language ?lang names when the app has it', async () => {
		expect(await languageAt('?lang=hi')).toBe('hi');
		expect(await languageAt('?utm=x&lang=HI')).toBe('hi');
	});

	it('falls back to the default language without ?lang, or for one the app does not have', async () => {
		expect(await languageAt('')).toBe('en');
		expect(await languageAt('?lang=fr')).toBe('en');
	});

	it('does not keep ?lang: the next load without it is back on the default', async () => {
		expect(await languageAt('?lang=hi')).toBe('hi');
		window.history.replaceState(null, '', '/page/home');
		await getAppDefinition();
		expect(localStorage.getItem('currentLanguage')).toBe('en');
	});

	it('ignores ?lang for an app with no languages', async () => {
		expect(await languageAt('?lang=hi', { ...application, languages: undefined })).toBe('en');
	});
});
