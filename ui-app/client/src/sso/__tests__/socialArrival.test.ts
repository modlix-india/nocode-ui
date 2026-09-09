/**
 * @jest-environment-options {"url": "https://sitezump.local.modlix.com/"}
 */

/**
 * The social return leg. The callback drops the user back here with a provider-verified profile
 * and a single-use state, and this is the only thing that turns that into a session: no page
 * definition takes part, so if it does not work here it does not work anywhere.
 *
 * What the tests are really guarding: the session is banked in the format the bootstrap reads,
 * the app is asked before the user is registered into it, the state is never spent twice, and
 * nobody's email is left sitting in the address bar.
 */

// Makes this file a module rather than a global script, so its `loadModule` and `setLocation`
// helpers do not collide with the identically named ones in the sibling suite.
export {};

const SOCIAL_HOST = 'authzump.local.modlix.com';
const STATE = 'a1b2c3-state';
const EMAIL = 'someone@example.com';

const ARRIVAL =
	`https://sitezump.local.modlix.com/accountHome?sessionId=${STATE}` +
	`&userName=${encodeURIComponent(EMAIL)}&emailId=${encodeURIComponent(EMAIL)}` +
	'&firstName=Some&lastName=One&platform=GOOGLE&appCode=sitezump&clientCode=SYSTEM' +
	'&redirectUrl=https%3A%2F%2Fsitezump.local.modlix.com%2FaccountHome';

const SESSION = {
	accessToken: 'the-access-token',
	// Epoch SECONDS, as the platform sends it. Banking it as milliseconds lands in 1970 and the
	// session is deleted as expired the instant it is stored.
	accessTokenExpiryAt: Math.floor(Date.now() / 1000) + 3600,
	verifiedAppCode: 'sitezump',
};

function loadModule() {
	let mod: typeof import('../ssoModule');
	jest.isolateModules(() => {
		mod = require('../ssoModule');
	});
	return mod!;
}

function setLocation(href: string) {
	window.history.replaceState(null, '', href);
}

type Reply = { status: number; body?: any };

/** Answers by URL suffix, and records what was asked. */
function mockFetch(replies: Record<string, Reply>) {
	const calls: Array<{ url: string; body: any; headers: any }> = [];

	(globalThis as any).fetch = jest.fn((url: string, init: any) => {
		calls.push({
			url,
			body: init?.body ? JSON.parse(init.body) : undefined,
			headers: init?.headers,
		});

		const key = Object.keys(replies).find(k => url.includes(k));
		const reply = key ? replies[key] : { status: 404 };

		return Promise.resolve({
			ok: reply.status >= 200 && reply.status < 300,
			status: reply.status,
			json: () => Promise.resolve(reply.body ?? {}),
		});
	});

	return calls;
}

describe('social arrival', () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		(globalThis as any).isDesignMode = false;
		(globalThis as any).__SOCIAL_LOGIN_HOST__ = SOCIAL_HOST;
		// sso3 off unless a test says otherwise, so the beacon seeding hop stays out of the way.
		(globalThis as any).__SSO_BEACON_HOST__ = undefined;
		setLocation('/');
	});

	it('does nothing at all on an ordinary page load', async () => {
		const calls = mockFetch({});
		const mod = loadModule();
		setLocation('https://sitezump.local.modlix.com/accountHome');

		await expect(mod.consumeSocialArrival()).resolves.toBe(false);
		expect(calls).toHaveLength(0);
	});

	it('signs in an existing user and banks the session the bootstrap can read', async () => {
		const calls = mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });
		const mod = loadModule();
		setLocation(ARRIVAL);

		await expect(mod.consumeSocialArrival()).resolves.toBe(true);

		// The token is JSON-encoded and the expiry is epoch seconds, because that is what
		// makeVerifyTokenCall and the bootstrap's expiry sweep each expect to find.
		expect(localStorage.getItem('AuthToken')).toBe(JSON.stringify(SESSION.accessToken));
		expect(localStorage.getItem('AuthTokenExpiry')).toBe(String(SESSION.accessTokenExpiryAt));

		expect(calls).toHaveLength(1);
		expect(calls[0].body).toMatchObject({ userName: EMAIL, socialRegisterState: STATE });

		// No appCode/clientCode headers: the platform reads the app off the host, which is what
		// makes the account land in the app the user actually clicked from.
		expect(calls[0].headers.appCode).toBeUndefined();
		expect(calls[0].headers.clientCode).toBeUndefined();
	});

	it('registers the user into THIS app when the app does not know them yet', async () => {
		const calls = mockFetch({
			'authenticate/social': { status: 403 },
			'clients/socialRegister': {
				status: 200,
				body: { created: true, userId: 42, authentication: SESSION },
			},
		});
		const mod = loadModule();
		setLocation(ARRIVAL);

		await expect(mod.consumeSocialArrival()).resolves.toBe(true);
		expect(localStorage.getItem('AuthToken')).toBe(JSON.stringify(SESSION.accessToken));

		expect(calls).toHaveLength(2);
		expect(calls[1].url).toContain('clients/socialRegister');
		expect(calls[1].body).toMatchObject({
			userName: EMAIL,
			emailId: EMAIL,
			firstName: 'Some',
			lastName: 'One',
			socialRegisterState: STATE,
			// `register` refuses a request with no passType, and only a request with no password
			// takes the social branch. This pair is the only one that satisfies both.
			passType: 'PASSWORD',
			// The app said nothing, and an app's registration rules are almost always written
			// for business clients. Registering as an individual instead creates the account and
			// grants it nothing.
			businessClient: true,
		});
		expect(calls[1].body.password).toBeUndefined();
	});

	it('registers an individual when the app asked for one', async () => {
		const calls = mockFetch({
			'authenticate/social': { status: 403 },
			'clients/socialRegister': { status: 200, body: { authentication: SESSION } },
		});
		const mod = loadModule();
		setLocation(`${ARRIVAL}&businessClient=false`);

		await expect(mod.consumeSocialArrival()).resolves.toBe(true);
		expect(calls[1].body.businessClient).toBe(false);
	});

	it('does not try to register when the refusal was not "unknown user"', async () => {
		const calls = mockFetch({ 'authenticate/social': { status: 500 } });
		const mod = loadModule();
		setLocation(ARRIVAL);

		await expect(mod.consumeSocialArrival()).resolves.toBe(false);
		expect(calls).toHaveLength(1);
		expect(localStorage.getItem('AuthToken')).toBeNull();
	});

	it('treats a registration that produced no session as a failure', async () => {
		// The platform answers 200 with authentication: null rather than an error. Banking
		// nothing and reporting success would leave the user looking signed in and not being.
		mockFetch({
			'authenticate/social': { status: 403 },
			'clients/socialRegister': { status: 200, body: { created: true, authentication: null } },
		});
		const mod = loadModule();
		setLocation(ARRIVAL);

		await expect(mod.consumeSocialArrival()).resolves.toBe(false);
		expect(localStorage.getItem('AuthToken')).toBeNull();
	});

	it('takes the profile off the address bar once it has been spent', async () => {
		mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });
		const mod = loadModule();
		setLocation(ARRIVAL);

		await mod.consumeSocialArrival();

		const params = new URL(window.location.href).searchParams;
		expect(params.get('sessionId')).toBeNull();
		expect(params.get('emailId')).toBeNull();
		expect(params.get('firstName')).toBeNull();
		// The path is untouched: the bootstrap read the page name off it before this ran.
		expect(window.location.pathname).toBe('/accountHome');
	});

	it('keeps the destination its own query params', async () => {
		mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });
		const mod = loadModule();
		setLocation(`${ARRIVAL}&tab=billing`);

		await mod.consumeSocialArrival();

		expect(new URL(window.location.href).searchParams.get('tab')).toBe('billing');
	});

	it('spends a state once, however many callers ask', async () => {
		const calls = mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });
		const mod = loadModule();
		setLocation(ARRIVAL);

		// Concurrent callers share the one in-flight redeem rather than each posting the state.
		const [first, second] = await Promise.all([
			mod.consumeSocialArrival(),
			mod.consumeSocialArrival(),
		]);

		expect(first).toBe(true);
		expect(second).toBe(true);
		expect(calls).toHaveLength(1);
	});

	it('will not re-spend a state after a reload', async () => {
		mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });
		setLocation(ARRIVAL);
		await loadModule().consumeSocialArrival();

		// A reload is a fresh module with the params still on the URL. The per-tab mark is the
		// only thing that stops the state being posted a second time.
		localStorage.clear();
		setLocation(ARRIVAL);
		const calls = mockFetch({ 'authenticate/social': { status: 200, body: SESSION } });

		await expect(loadModule().consumeSocialArrival()).resolves.toBe(false);
		expect(calls).toHaveLength(0);
	});

	it('tidies up after a cancelled consent screen', async () => {
		const calls = mockFetch({});
		const mod = loadModule();
		setLocation(
			'https://sitezump.local.modlix.com/accountHome?error=access_denied&appCode=sitezump&clientCode=SYSTEM',
		);

		await expect(mod.consumeSocialArrival()).resolves.toBe(false);
		expect(calls).toHaveLength(0);
		expect(new URL(window.location.href).searchParams.get('error')).toBeNull();
	});

	it('survives a provider that sent no email', async () => {
		const calls = mockFetch({});
		const mod = loadModule();
		setLocation(`https://sitezump.local.modlix.com/accountHome?sessionId=${STATE}`);

		await expect(mod.consumeSocialArrival()).resolves.toBe(false);
		expect(calls).toHaveLength(0);
	});

	describe('on an sso3 app', () => {
		beforeEach(() => {
			(globalThis as any).__SSO_BEACON_HOST__ = SOCIAL_HOST;
		});

		it('seeds the beacon, so the session is not local to this app', async () => {
			const calls = mockFetch({
				'authenticate/social': { status: 200, body: SESSION },
				makeOneTimeToken: { status: 200, body: { token: 'one-time' } },
			});
			const mod = loadModule();
			setLocation(ARRIVAL);

			await expect(mod.consumeSocialArrival()).resolves.toBe(true);

			const mint = calls.find(c => c.url.includes('makeOneTimeToken'));
			expect(mint).toBeDefined();
			expect(mint!.body).toEqual({ targetAppCode: 'authzump', targetClientCode: 'SYSTEM' });
			// The bare token, not the JSON-encoded form it is stored as.
			expect(mint!.headers.Authorization).toBe(SESSION.accessToken);
		});

		it('still signs the user in when the beacon cannot be seeded', async () => {
			mockFetch({
				'authenticate/social': { status: 200, body: SESSION },
				makeOneTimeToken: { status: 500 },
			});
			const mod = loadModule();
			setLocation(ARRIVAL);

			// Seeding is a convenience for the NEXT app. Losing it must not cost this one its
			// session.
			await expect(mod.consumeSocialArrival()).resolves.toBe(true);
			expect(localStorage.getItem('AuthToken')).toBe(JSON.stringify(SESSION.accessToken));
		});
	});
});

describe('buildSocialLoginURL', () => {
	beforeEach(() => {
		(globalThis as any).isDesignMode = false;
		(globalThis as any).__SOCIAL_LOGIN_HOST__ = SOCIAL_HOST;
		setLocation('/');
	});

	it('sends the redirect it is given, and defaults to the current page', () => {
		const mod = loadModule();
		setLocation('https://sitezump.local.modlix.com/signIn');

		const url = new URL(
			mod.buildSocialLoginURL('GOOGLE', { appCode: 'sitezump', clientCode: 'SYSTEM' })!,
		);

		expect(url.host).toBe(SOCIAL_HOST);
		expect(url.pathname).toBe('/api/security/clients/socialRegister/evoke');
		expect(url.searchParams.get('platform')).toBe('GOOGLE');
		expect(url.searchParams.get('appCode')).toBe('sitezump');
		expect(url.searchParams.get('redirectUrl')).toBe(
			'https://sitezump.local.modlix.com/signIn',
		);
	});

	it('carries the client type, since the return leg is a page load away', () => {
		const mod = loadModule();

		// The evoke call is the app's only chance to say anything: everything after it happens
		// on the provider's site and then on a fresh page load, so whatever registration needs
		// has to make the round trip on the URL.
		const asBusiness = new URL(
			mod.buildSocialLoginURL('GOOGLE', { appCode: 'sitezump' }, undefined)!,
		);
		expect(asBusiness.searchParams.get('businessClient')).toBe('true');

		const asIndividual = new URL(
			mod.buildSocialLoginURL('GOOGLE', { appCode: 'sitezump' }, undefined, false)!,
		);
		expect(asIndividual.searchParams.get('businessClient')).toBe('false');
	});

	it('is null when social login is not configured', () => {
		(globalThis as any).__SOCIAL_LOGIN_HOST__ = undefined;
		const mod = loadModule();

		expect(mod.buildSocialLoginURL('GOOGLE', { appCode: 'sitezump' })).toBeNull();
	});
});
