import {
	currentAppCode,
	getThemeEntry,
	readThemeCookie,
	resolveThemeName,
	swapThemeStylesheet,
	themeEntries,
	writeThemeCookie,
} from '../themeSelection';

jest.mock('axios');
jest.mock('../../context/StoreContext', () => ({
	getDataFromPath: jest.fn(),
	setData: jest.fn(),
}));

const app = (themes: any) => ({ properties: { themes } });

const LIGHT = { name: 'light', displayName: 'Light', order: 0 };
const DARK = { name: 'dark', displayName: 'Dark', icon: 'mso-dark_mode', order: 1 };

describe('themeEntries', () => {
	it('orders by `order`, not by map key order', () => {
		const entries = themeEntries(app({ zzz: DARK, aaa: LIGHT }));
		expect(entries.map(e => e.name)).toEqual(['light', 'dark']);
	});

	it('treats a missing `order` as 0, so untouched definitions keep map order', () => {
		const entries = themeEntries(app({ a: { name: 'one' }, b: { name: 'two' } }));
		expect(entries.map(e => e.name)).toEqual(['one', 'two']);
		expect(entries[0].order).toBe(0);
	});

	it('drops entries with no name, which is the only required field', () => {
		const entries = themeEntries(app({ a: { name: 'one' }, b: { displayName: 'Ghost' } }));
		expect(entries.map(e => e.name)).toEqual(['one']);
	});

	it('is empty for an app with no themes at all', () => {
		expect(themeEntries(undefined)).toEqual([]);
		expect(themeEntries({})).toEqual([]);
		expect(themeEntries(app({}))).toEqual([]);
	});
});

describe('resolveThemeName', () => {
	const two = app({ a: LIGHT, b: DARK });

	it('prefers an explicit request over everything else', () => {
		expect(
			resolveThemeName(two, { requested: 'dark', personalized: 'light', cookie: 'light' }),
		).toBe('dark');
	});

	it('prefers the signed-in choice over this device cookie', () => {
		expect(resolveThemeName(two, { personalized: 'dark', cookie: 'light' })).toBe('dark');
	});

	it('falls back to the cookie when there is no stored choice', () => {
		expect(resolveThemeName(two, { cookie: 'dark' })).toBe('dark');
	});

	it('defaults to the lowest `order` when nothing is chosen', () => {
		expect(resolveThemeName(two, {})).toBe('light');
	});

	// The case the whole fall-through exists for: an author deletes a theme that
	// visitors still hold in a cookie. They must land on the first theme, not on
	// an unthemed app.
	it('falls through to the default when the chosen theme is gone', () => {
		expect(resolveThemeName(two, { cookie: 'deleted' })).toBe('light');
		expect(resolveThemeName(two, { personalized: 'deleted' })).toBe('light');
		expect(resolveThemeName(two, { requested: 'deleted' })).toBe('light');
	});

	it('skips a dead choice but still honours a live one behind it', () => {
		expect(resolveThemeName(two, { personalized: 'deleted', cookie: 'dark' })).toBe('dark');
	});

	it('is undefined when the app defines no themes', () => {
		expect(resolveThemeName(app({}), { cookie: 'dark' })).toBeUndefined();
		expect(resolveThemeName(undefined, {})).toBeUndefined();
	});
});

describe('getThemeEntry', () => {
	it('returns the whole entry so a switcher can read its optional fields', () => {
		expect(getThemeEntry(app({ a: LIGHT, b: DARK }), 'dark')).toMatchObject({
			name: 'dark',
			displayName: 'Dark',
			icon: 'mso-dark_mode',
		});
	});

	it('is undefined for a name that is not listed, and for no name', () => {
		expect(getThemeEntry(app({ a: LIGHT }), 'dark')).toBeUndefined();
		expect(getThemeEntry(app({ a: LIGHT }), undefined)).toBeUndefined();
	});
});

describe('the cookie', () => {
	beforeEach(() => {
		document.cookie
			.split(';')
			.map(c => c.split('=')[0].trim())
			.filter(Boolean)
			.forEach(name => {
				document.cookie = `${name}=; Path=/; Max-Age=0`;
			});
	});

	it('round trips', () => {
		writeThemeCookie('appbuilder', 'vercelDark');
		expect(readThemeCookie('appbuilder')).toBe('vercelDark');
	});

	// One host serves several apps under /appCode/clientCode/page, and they do
	// not share a theme.
	it('is scoped per app', () => {
		writeThemeCookie('appbuilder', 'vercelDark');
		expect(readThemeCookie('leadzump')).toBeUndefined();
	});

	it('is absent before anything is written, and after it is cleared', () => {
		expect(readThemeCookie('appbuilder')).toBeUndefined();
		writeThemeCookie('appbuilder', 'vercelDark');
		writeThemeCookie('appbuilder', undefined);
		expect(readThemeCookie('appbuilder')).toBeUndefined();
	});

	it('survives a name needing encoding', () => {
		writeThemeCookie('appbuilder', 'a b;c');
		expect(readThemeCookie('appbuilder')).toBe('a b;c');
	});

	it('reads nothing without an appCode rather than matching some other app', () => {
		writeThemeCookie('appbuilder', 'vercelDark');
		expect(readThemeCookie(undefined)).toBeUndefined();
	});
});

describe('currentAppCode', () => {
	afterEach(() => {
		delete (globalThis as any).__mlxAppCode;
	});

	it('prefers the value the server stamped', () => {
		(globalThis as any).__mlxAppCode = 'leadzump';
		expect(currentAppCode()).toBe('leadzump');
	});

	it('falls back to the path for a /appCode/clientCode/page URL', () => {
		window.history.replaceState({}, '', '/appbuilder/SYSTEM/page/workspace');
		expect(currentAppCode()).toBe('appbuilder');
	});

	it('is undefined on a custom-domain URL with nothing stamped', () => {
		window.history.replaceState({}, '', '/some/other/path');
		expect(currentAppCode()).toBeUndefined();
	});
});

describe('swapThemeStylesheet', () => {
	// The path IndexHTMLService and the SSR renderer both stamp. Every production
	// document arrives with this shape; only the webpack dev index.html differs.
	const SERVED = '/mistyshores/FIN/page/api/ui/style';

	const links = () =>
		Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];

	/** jsdom never fires `load` on an inserted <link>, so the swap would hang. */
	const swap = (name?: string) => {
		const done = swapThemeStylesheet(name);
		links().forEach(l => l.dispatchEvent(new Event('load')));
		return done;
	};

	const serve = (href?: string) => {
		document.head.innerHTML = `<link rel="stylesheet" id="mlxAppStyle"${
			href === undefined ? '' : ` href="${href}"`
		} />`;
	};

	afterEach(() => {
		document.head.innerHTML = '';
	});

	// The regression. Both sides agree on the theme (there isn't one), but the
	// hrefs never matched as strings, so a second <link> was created on every
	// cold load and the sheet was fetched twice, serially, before first paint.
	it('does nothing when the served sheet already carries the requested theme', async () => {
		serve(SERVED);
		await swap(undefined);

		expect(links()).toHaveLength(1);
		expect(links()[0].getAttribute('href')).toBe(SERVED);
	});

	it('does nothing when the served sheet already carries a named theme', async () => {
		serve(`${SERVED}?theme=dark`);
		await swap('dark');

		expect(links()).toHaveLength(1);
		expect(links()[0].getAttribute('href')).toBe(`${SERVED}?theme=dark`);
	});

	// A relative href would resolve against `/` on a domain-mapped host, landing
	// on a different url that the gateway routes to the same handler: it works,
	// so nothing fails, and the sheet is simply fetched twice forever.
	it('keeps the served path when the theme does change', async () => {
		serve(`${SERVED}?theme=dark`);
		await swap('light');

		expect(links()).toHaveLength(1);
		expect(links()[0].getAttribute('href')).toBe(`${SERVED}?theme=light`);
	});

	it('drops the theme param rather than naming a theme of ""', async () => {
		serve(`${SERVED}?theme=dark`);
		await swap(undefined);

		expect(links()[0].getAttribute('href')).toBe(SERVED);
	});

	// The dev index.html emits the link href-less and fills it from a script. If
	// that script has not run, "no theme either side" must not read as a match.
	it('writes an href onto an href-less link instead of treating it as a match', async () => {
		serve(undefined);
		await swap(undefined);

		expect(links()).toHaveLength(1);
		expect(links()[0].getAttribute('href')).toBe('api/ui/style');
	});

	it('falls back to the relative path when no link was served at all', async () => {
		document.head.innerHTML = '';
		await swap('dark');

		expect(links()).toHaveLength(1);
		expect(links()[0].getAttribute('href')).toBe('api/ui/style?theme=dark');
	});

	it('carries the id over to the replacement so the next swap still finds it', async () => {
		serve(SERVED);
		await swap('dark');

		expect(document.getElementById('mlxAppStyle')?.getAttribute('href')).toBe(
			`${SERVED}?theme=dark`,
		);
	});
});
