/**
 * @jest-environment-options {"url": "https://leadzump.local.modlix.com/"}
 */

/**
 * The cold-start bounce leaves the page, so the thing that matters most is that it cannot
 * leave twice. A beacon with no session sends the browser straight back, and an origin that
 * forgets it already asked would bounce forever.
 */

const BEACON = 'authzump.local.modlix.com';

function loadModule() {
	let mod: typeof import('../ssoModule');
	jest.isolateModules(() => {
		mod = require('../ssoModule');
	});
	return mod!;
}

// jsdom refuses to let window.location be redefined, so the URL is driven the way a real
// browser would change it, and the navigation itself is tested through the pure builders.
function setLocation(href: string) {
	window.history.replaceState(null, '', href);
}

describe('cold-start bounce', () => {
	beforeEach(() => {
		localStorage.clear();
		(globalThis as any).__SSO_BEACON_HOST__ = BEACON;
		(globalThis as any).isDesignMode = false;
		window.history.replaceState(null, '', '/');
	});

	it('bounces to the beacon and marks the origin BEFORE leaving', () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/deals');

		expect(mod.hasAskedBeacon()).toBe(false);
		const href = mod.beginSsoBounce({ appCode: 'leadzump', clientCode: 'SYSTEM' });

		// The mark is what stops the loop, so it must be set before the browser leaves.
		expect(mod.hasAskedBeacon()).toBe(true);
		expect(href).not.toBeNull();

		const target = new URL(href!);
		expect(target.host).toBe(BEACON);
		expect(target.pathname).toBe('/hassso');
		expect(target.searchParams.get('mode')).toBe('bounce');
		expect(target.searchParams.get('targetAppCode')).toBe('leadzump');
		expect(target.searchParams.get('returnUrl')).toBe(
			'https://leadzump.local.modlix.com/deals',
		);
	});

	it('does nothing when no beacon host is injected', () => {
		(globalThis as any).__SSO_BEACON_HOST__ = undefined;
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/');

		expect(mod.beginSsoBounce({ appCode: 'leadzump', clientCode: 'SYSTEM' })).toBeNull();
		expect(mod.hasAskedBeacon()).toBe(false);
	});

	it('a "no session" answer marks the origin, so the next load does not bounce again', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/deals?sso=none');

		const established = await mod.consumeSsoArrival();

		expect(established).toBe(false);
		expect(mod.hasAskedBeacon()).toBe(true);
		// And the marker is scrubbed off the address bar.
		expect(window.location.search).not.toContain('sso=none');
	});

	it('the mark expires, so signing in elsewhere is eventually picked up', () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/');

		mod.beginSsoBounce({ appCode: 'leadzump', clientCode: 'SYSTEM' });
		expect(mod.hasAskedBeacon()).toBe(true);

		// Two minutes later the question is worth asking again: the user may have signed in
		// on another app in the meantime, and a permanent mark would strand them anonymous.
		const later = Date.now() + 2 * 60 * 1000;
		jest.spyOn(Date, 'now').mockReturnValue(later);
		expect(mod.hasAskedBeacon()).toBe(false);
		jest.restoreAllMocks();
	});

	it('a mark from the future is ignored rather than pinning the bounce shut', () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/');

		localStorage.setItem('ssoCheckedAt', String(Date.now() + 10 * 60 * 1000));
		expect(mod.hasAskedBeacon()).toBe(false);
	});

	it('signing out clears the mark, so a new session elsewhere is picked up', () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/');

		mod.beginSsoBounce({ appCode: 'leadzump', clientCode: 'SYSTEM' });
		expect(mod.hasAskedBeacon()).toBe(true);

		mod.clearBeaconMark();
		expect(mod.hasAskedBeacon()).toBe(false);
	});

	it('design mode keeps its own mark, so it cannot strand the real one', () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/');

		mod.beginSsoBounce({ appCode: 'leadzump', clientCode: 'SYSTEM' });
		expect(localStorage.getItem('ssoCheckedAt')).not.toBeNull();

		(globalThis as any).isDesignMode = true;
		expect(mod.hasAskedBeacon()).toBe(false);
	});
});

describe('arrival with a token', () => {
	beforeEach(() => {
		localStorage.clear();
		(globalThis as any).__SSO_BEACON_HOST__ = BEACON;
		(globalThis as any).isDesignMode = false;
	});

	// The platform really returns a NUMBER of epoch seconds here. Measured against a live
	// authenticateWithOneTimeToken response, not assumed: an earlier version of this test used
	// an ISO string, passed, and hid a bug that would have expired every session on arrival.
	it('stores the session in the exact shape the bootstrap reads back', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/deals?ott=abc123');

		(globalThis as any).fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				accessToken: 'eyJhbGciOi.token.value',
				accessTokenExpiryAt: 1788610764,
			}),
		});

		const established = await mod.consumeSsoArrival();

		expect(established).toBe(true);
		// makeVerifyTokenCall does JSON.parse on this, so it must be JSON-encoded.
		expect(localStorage.getItem('AuthToken')).toBe('"eyJhbGciOi.token.value"');
		// index.tsx does parseInt(...) * 1000, so this must be epoch SECONDS, unchanged.
		expect(localStorage.getItem('AuthTokenExpiry')).toBe('1788610764');
		expect(window.location.search).not.toContain('ott=');
	});

	it('accepts a date string too, in case the field ever becomes one', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/?ott=abc123');

		(globalThis as any).fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				accessToken: 'tok',
				accessTokenExpiryAt: '2099-01-01T00:00:00.000Z',
			}),
		});

		expect(await mod.consumeSsoArrival()).toBe(true);
		expect(localStorage.getItem('AuthTokenExpiry')).toBe(
			String(Math.floor(Date.parse('2099-01-01T00:00:00.000Z') / 1000)),
		);
	});

	it('an unusable expiry is refused rather than stored as 1970', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/?ott=abc123');

		(globalThis as any).fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ accessToken: 'tok', accessTokenExpiryAt: 'never' }),
		});

		expect(await mod.consumeSsoArrival()).toBe(false);
		expect(localStorage.getItem('AuthToken')).toBeNull();
	});

	it('a refused token is not stored, and the origin is still marked', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/?ott=stale');

		(globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

		expect(await mod.consumeSsoArrival()).toBe(false);
		expect(localStorage.getItem('AuthToken')).toBeNull();
		expect(mod.hasAskedBeacon()).toBe(true);
	});

	it('a plain page load is not an arrival', async () => {
		const mod = loadModule();
		setLocation('https://leadzump.local.modlix.com/deals');

		expect(await mod.consumeSsoArrival()).toBe(false);
		expect(mod.hasAskedBeacon()).toBe(false);
	});
});
