/**
 * The TeleCMI adapter, against a stand-in for the PIOPIY SDK.
 *
 * The stand-in emits what the SDK's own source emits - `login`, `loginFailed` with its codes,
 * `inComingCall` with `call_id` and a display-name `from`, `ended` for the far end hanging up and
 * `hangup` for this browser doing it - so each case is a sequence the real SDK can produce.
 */

jest.mock('../../components/util/getSrcUrl', () => ({
	__esModule: true,
	default: jest.fn((url: string) =>
		(globalThis as { cdnPrefix?: string }).cdnPrefix
			? `https://${(globalThis as { cdnPrefix?: string }).cdnPrefix}${url}`
			: url,
	),
}));

import type { SoftphoneEvent } from '../types';

type Handler = (data: unknown) => void;

/** One PIOPIY instance: its calls recorded, its events drivable from the test. */
class FakePiopiy {
	static instances: FakePiopiy[] = [];

	readonly options: unknown;
	readonly handlers = new Map<string, Handler[]>();

	held = false;
	muted = false;

	/**
	 * The SDK's own view of registration, and what its sign-in calls do with it (`lib/userAgent.js`):
	 * `login()` on a registered phone is refused with error 1001; `logout()` on one that is not
	 * registered does nothing but emit error 1002 - including while a sign-in is still under way.
	 */
	registered = false;
	login = jest.fn(() => {
		if (this.registered)
			this.fire('error', { code: 1001, status: 'Please logout before you login' });
	});
	logout = jest.fn(() => {
		if (!this.registered) {
			this.fire('error', { code: 1002, status: 'Please login' });
			return;
		}
		this.registered = false;
		if (!this.slowSignOut) this.fire('logout', { code: 200, status: 'logout successfully' });
	});

	/**
	 * Makes a sign-out take a round trip, as it does against TeleCMI: `logout()` returns at once and
	 * the SDK reports later - `logout` for the unregister and `disconnected` for the socket it then
	 * closes, in an order the SDK source does not settle.
	 */
	slowSignOut = false;
	signOutFinishes(order: 'logout first' | 'socket first') {
		const unregistered = () =>
			this.fire('logout', { code: 200, status: 'logout successfully' });
		const closed = () => this.fire('disconnected', { code: 1000, status: 'disconnected' });
		if (order === 'logout first') {
			unregistered();
			closed();
		} else {
			closed();
			unregistered();
		}
	}

	/** TeleCMI accepts the registration a `login()` asked for. */
	signsIn() {
		this.registered = true;
		this.fire('login', { code: 200, status: 'login successfully' });
	}

	/** The socket drops; the SDK will reconnect and sign in again by itself. */
	drops() {
		this.registered = false;
		this.fire('disconnected', { code: 1000, status: 'disconnected' });
	}
	answer = jest.fn();
	reject = jest.fn();
	terminate = jest.fn();
	// The SDK emits hold / unhold from inside these, as JsSIP does, which is why they are synchronous here.
	hold = jest.fn(() => {
		this.held = true;
		this.fire('hold', { code: 200, status: 'call on hold', whom: 'myself' });
	});
	unHold = jest.fn(() => {
		this.held = false;
		this.fire('unhold', { code: 200, status: 'call unhold', whom: 'myself' });
	});
	onHold = jest.fn(() => this.held);
	// No event for mute: the SDK has none.
	mute = jest.fn(() => (this.muted = true));
	unMute = jest.fn(() => (this.muted = false));
	onMute = jest.fn(() => this.muted);
	sendDtmf = jest.fn();
	call = jest.fn();

	constructor(options: unknown) {
		this.options = options;
		FakePiopiy.instances.push(this);
	}

	on(event: string, handler: Handler) {
		this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
		return this;
	}

	fire(event: string, data?: unknown) {
		this.handlers.get(event)?.forEach(h => h(data));
	}
}

function loadProviderModule() {
	let mod!: typeof import('../providers/telecmi');
	jest.isolateModules(() => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		mod = require('../providers/telecmi');
	});
	return mod;
}

function captureScripts(onAppend: (script: HTMLScriptElement) => void) {
	const appended: HTMLScriptElement[] = [];
	const spy = jest.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
		appended.push(node as HTMLScriptElement);
		setTimeout(() => onAppend(node as HTMLScriptElement), 0);
		return node;
	});
	return { appended, restore: () => spy.mockRestore() };
}

const SDK = 'api/files/static/file/SYSTEM/jslib/telecmiBundle/piopiy.min.js';

describe('telecmi adapter', () => {
	let restoreScripts: () => void = () => {};

	beforeEach(() => {
		jest.clearAllMocks();
		FakePiopiy.instances = [];

		(globalThis as { isSecureContext?: boolean }).isSecureContext = true;
		Object.defineProperty(navigator, 'mediaDevices', {
			configurable: true,
			value: {
				getUserMedia: jest
					.fn()
					.mockResolvedValue({ getTracks: () => [{ stop: () => {} }] }),
			},
		});

		delete (globalThis as Record<string, unknown>).PIOPIY;
		delete (globalThis as Record<string, unknown>).__modlixTelecmiSdkSource;
		delete (globalThis as { cdnPrefix?: string }).cdnPrefix;
	});

	afterEach(() => restoreScripts());

	function scriptsDefinePiopiy() {
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).PIOPIY = FakePiopiy;
			script.onload?.(new Event('load'));
		});
		restoreScripts = capture.restore;
		return capture;
	}

	async function started(overrides: { autoRegister?: boolean; region?: string } = {}) {
		const { TelecmiCallProvider } = loadProviderModule();
		scriptsDefinePiopiy();

		const provider = new TelecmiCallProvider();
		const events: SoftphoneEvent[] = [];
		provider.on(event => events.push(event));

		await provider.init({
			token: 'agent-password',
			providerUserId: '5001_1111112',
			autoRegister: overrides.autoRegister ?? true,
			sdkUrl: SDK,
			region: overrides.region,
		});

		return { provider, events, sdk: FakePiopiy.instances.at(-1)! };
	}

	// ------------------------------------------------------------------ loading

	it('injects nothing when no URL is configured', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = captureScripts(() => {});
		restoreScripts = capture.restore;

		await expect(
			new TelecmiCallProvider().init({ token: 't', providerUserId: 'u', autoRegister: true }),
		).rejects.toMatchObject({ code: 'SDK_LOAD_FAILED' });

		expect(capture.appended).toHaveLength(0);
	});

	it('loads the configured URL, through the CDN when there is one', async () => {
		(globalThis as { cdnPrefix?: string }).cdnPrefix = 'cdn-dev.modlix.com';
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = scriptsDefinePiopiy();

		await new TelecmiCallProvider().init({
			token: 't',
			providerUserId: 'u',
			autoRegister: false,
			sdkUrl: SDK,
		});

		expect(capture.appended).toHaveLength(1);
		expect(capture.appended[0].src).toContain('cdn-dev.modlix.com');
		expect(capture.appended[0].src).toContain('/jslib/telecmiBundle/piopiy.min.js');
	});

	it('injects one script for two adapters sharing a URL', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = scriptsDefinePiopiy();

		const cfg = { token: 't', providerUserId: 'u', autoRegister: false, sdkUrl: SDK };
		await Promise.all([
			new TelecmiCallProvider().init(cfg),
			new TelecmiCallProvider().init(cfg),
		]);

		expect(capture.appended).toHaveLength(1);
	});

	it('refuses a bundle that defines no PIOPIY, naming nothing it was not given', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = captureScripts(script => script.onload?.(new Event('load')));
		restoreScripts = capture.restore;

		await expect(
			new TelecmiCallProvider().init({
				token: 't',
				providerUserId: 'u',
				autoRegister: true,
				sdkUrl: SDK,
			}),
		).rejects.toMatchObject({ code: 'SDK_LOAD_FAILED' });
	});

	it('retries a bundle that loaded but defined no PIOPIY, once the file is replaced', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const cfg = { token: 't', providerUserId: 'u', autoRegister: false, sdkUrl: SDK };

		// A wrong file uploaded at the right URL: it loads, and defines nothing.
		const wrongFile = captureScripts(script => script.onload?.(new Event('load')));
		await expect(new TelecmiCallProvider().init(cfg)).rejects.toMatchObject({
			code: 'SDK_LOAD_FAILED',
		});
		wrongFile.restore();

		// The right file put in its place: the same URL is fetched again rather than the failure
		// being handed back until the tab is reloaded.
		const rightFile = scriptsDefinePiopiy();
		await new TelecmiCallProvider().init(cfg);

		expect(rightFile.appended).toHaveLength(1);
		expect(FakePiopiy.instances).toHaveLength(1);
	});

	it('retries after a failed load, and names the URL it could not load', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const failing = jest.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
			setTimeout(() => node.onerror?.(new Event('error')), 0);
			return node;
		});

		const cfg = { token: 't', providerUserId: 'u', autoRegister: false, sdkUrl: 'api/typo.js' };
		await expect(new TelecmiCallProvider().init(cfg)).rejects.toMatchObject({
			code: 'SDK_LOAD_FAILED',
			message: expect.stringContaining('api/typo.js'),
		});
		failing.mockRestore();

		const capture = scriptsDefinePiopiy();
		await new TelecmiCallProvider().init(cfg);
		expect(capture.appended).toHaveLength(1);
	});

	it('fetches its own URL rather than reusing a PIOPIY another URL put on the page', async () => {
		// The global is page-wide; the URL is per-connection configuration. A bundle defined by some
		// other URL must not be passed off as the one this connection asked for.
		(globalThis as Record<string, unknown>).PIOPIY = FakePiopiy;
		(globalThis as Record<string, unknown>).__modlixTelecmiSdkSource =
			'api/some/other/piopiy.js';
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = scriptsDefinePiopiy();

		await new TelecmiCallProvider().init({
			token: 't',
			providerUserId: 'u',
			autoRegister: false,
			sdkUrl: SDK,
		});

		expect(capture.appended).toHaveLength(1);
		expect(capture.appended[0].src).toContain(SDK);
	});

	it('surfaces a refused microphone before loading anything', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = scriptsDefinePiopiy();
		(navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
			Object.assign(new Error('denied'), { name: 'NotAllowedError' }),
		);

		await expect(
			new TelecmiCallProvider().init({
				token: 't',
				providerUserId: 'u',
				autoRegister: true,
				sdkUrl: SDK,
			}),
		).rejects.toMatchObject({ code: 'MIC_DENIED' });
		expect(capture.appended).toHaveLength(0);
	});

	it('goes no further when destroyed during the microphone prompt', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		const capture = scriptsDefinePiopiy();
		let allow!: (stream: unknown) => void;
		(navigator.mediaDevices.getUserMedia as jest.Mock).mockReturnValue(
			new Promise(resolve => (allow = resolve)),
		);

		const provider = new TelecmiCallProvider();
		const init = provider.init({
			token: 'agent-password',
			providerUserId: '5001_1111112',
			autoRegister: true,
			sdkUrl: SDK,
		});

		// The session stopped - a logout, a restart - while the prompt was still open.
		provider.destroy();
		allow({ getTracks: () => [{ stop: () => {} }] });
		await init;

		// No library fetched, no phone made, so nothing signs in as the agent.
		expect(capture.appended).toHaveLength(0);
		expect(FakePiopiy.instances).toHaveLength(0);
	});

	it('is safe to destroy twice, as the registry does to a phone replaced during init', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();

		provider.destroy();
		provider.destroy();

		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	it('goes no further when destroyed while the library loads', async () => {
		const { TelecmiCallProvider } = loadProviderModule();
		let loaded!: () => void;
		const capture = captureScripts(script => {
			loaded = () => {
				(globalThis as Record<string, unknown>).PIOPIY = FakePiopiy;
				script.onload?.(new Event('load'));
			};
		});
		restoreScripts = capture.restore;

		const provider = new TelecmiCallProvider();
		const init = provider.init({
			token: 'agent-password',
			providerUserId: '5001_1111112',
			autoRegister: true,
			sdkUrl: SDK,
		});
		// Until the script is on the page and still loading.
		while (!loaded) await new Promise(resolve => setTimeout(resolve, 0));

		provider.destroy();
		loaded();
		await init;

		expect(FakePiopiy.instances).toHaveLength(0);
	});

	// ------------------------------------------------------------------ registration

	it('signs in with the agent id, password and the region the backend sent', async () => {
		const { sdk } = await started({ region: 'sbcsg.telecmi.com' });

		expect(sdk.options).toEqual({ autoplay: true, ringTime: 60 });
		expect(sdk.login).toHaveBeenCalledWith(
			'5001_1111112',
			'agent-password',
			'sbcsg.telecmi.com',
		);
	});

	it('signs in to the India SBC when the backend sends no region, not the SDK default', async () => {
		// The SDK's own default is Singapore; every account in scope is on India.
		const { sdk } = await started();

		expect(sdk.login).toHaveBeenCalledWith(
			'5001_1111112',
			'agent-password',
			'sbcind.telecmi.com',
		);
	});

	it('does not sign in until asked when autoRegister is off', async () => {
		const { provider, sdk } = await started({ autoRegister: false });
		expect(sdk.login).not.toHaveBeenCalled();

		provider.register();
		expect(sdk.login).toHaveBeenCalledTimes(1);
	});

	it('goes Away by signing out, and back by signing in again', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();

		provider.unregister();
		expect(sdk.logout).toHaveBeenCalledTimes(1);

		provider.register();
		expect(sdk.login).toHaveBeenCalledTimes(2);

		expect(events.filter(e => e.type === 'REGISTRATION')).toEqual([
			{ type: 'REGISTRATION', registered: true, detail: 'login successfully' },
			{ type: 'REGISTRATION', registered: false, detail: 'logout successfully' },
		]);
		// Stepping away is the agent's choice, not a fault.
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	// ------------------------------------------------------------------ signing in and out, in every window

	it('does not sign in again while signed in, which the SDK would refuse with an error', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();

		// autoRegister plus a page's own "go online", or Available pressed while already online.
		provider.register();

		expect(sdk.login).toHaveBeenCalledTimes(1);
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	it('does not start a second sign-in while one is under way', async () => {
		const { provider, sdk } = await started();

		provider.register();
		sdk.signsIn();

		expect(sdk.login).toHaveBeenCalledTimes(1);
	});

	it('tries again after a refused sign-in', async () => {
		const { provider, sdk } = await started();
		sdk.fire('loginFailed', { code: 405, status: 'too many connections' });

		provider.register();

		expect(sdk.login).toHaveBeenCalledTimes(2);
	});

	it('goes Away while signing in by signing out the moment the sign-in lands', async () => {
		const { provider, sdk, events } = await started();

		// logout() now would do nothing but emit "Please login", and the sign-in would carry on.
		provider.unregister();
		expect(sdk.logout).not.toHaveBeenCalled();

		sdk.signsIn();

		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(sdk.registered).toBe(false);
		// Never shown online, and never an error: the agent asked to be away and is.
		expect(events.some(e => e.type === 'REGISTRATION' && e.registered)).toBe(false);
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	it('is no error to go Away twice', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();

		provider.unregister();
		provider.unregister();

		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	it('comes back online without a second connection after a dropped socket', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.drops();

		// The SDK is reconnecting. A login() now would open a second connection beside it.
		provider.register();
		expect(sdk.login).toHaveBeenCalledTimes(1);

		sdk.signsIn();
		expect(
			events
				.filter(e => e.type === 'REGISTRATION')
				.map(e => e.type === 'REGISTRATION' && e.registered),
		).toEqual([true, false, true]);
	});

	it('signs back in when Available follows Away before the sign-out has finished', async () => {
		for (const order of ['logout first', 'socket first'] as const) {
			const { provider, sdk, events } = await started();
			sdk.signsIn();
			sdk.slowSignOut = true;

			provider.unregister();
			// Pressed inside the sign-out's round trip: nothing can be done with it yet...
			provider.register();
			expect(sdk.login).toHaveBeenCalledTimes(1);

			// ...and once the sign-out finishes it is acted on, however the SDK reports that.
			sdk.signOutFinishes(order);
			expect(sdk.login).toHaveBeenCalledTimes(2);

			sdk.signsIn();
			const registration = events.filter(e => e.type === 'REGISTRATION');
			expect(registration.at(-1)).toMatchObject({ registered: true });
			expect(events.some(e => e.type === 'ERROR')).toBe(false);
		}
	});

	it('does not take a signed-in phone down with the late half of an earlier sign-out', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.slowSignOut = true;

		provider.unregister();
		provider.register();

		// The socket closing finishes the sign-out and the phone signs in again - and only then
		// does the first sign-out's own `logout` arrive.
		sdk.fire('disconnected', { code: 1000, status: 'disconnected' });
		sdk.signsIn();
		sdk.fire('logout', { code: 200, status: 'logout successfully' });

		expect(events.filter(e => e.type === 'REGISTRATION').at(-1)).toMatchObject({
			registered: true,
		});
	});

	it("does not mark a phone that signed in again offline when the old sign-out's socket closes late", async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.slowSignOut = true;

		provider.unregister();
		provider.register();

		// The unregister is answered first and the phone signs in again - and only then does the
		// old socket close.
		sdk.fire('logout', { code: 200, status: 'logout successfully' });
		sdk.signsIn();
		sdk.fire('disconnected', { code: 1000, status: 'disconnected' });

		expect(events.filter(e => e.type === 'REGISTRATION').at(-1)).toMatchObject({
			registered: true,
		});

		// And Away still reaches it.
		sdk.slowSignOut = false;
		provider.unregister();
		expect(sdk.logout).toHaveBeenCalledTimes(2);
		expect(sdk.registered).toBe(false);
	});

	it('reports a sign-in again that fails, rather than throwing into the SDK', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.slowSignOut = true;

		provider.unregister();
		provider.register();
		sdk.login.mockImplementation(() => {
			throw new Error('invalid user_id or password');
		});

		// This runs inside the SDK's own event callback.
		expect(() => sdk.signOutFinishes('logout first')).not.toThrow();
		expect(events.at(-1)).toMatchObject({ type: 'ERROR', error: { code: 'INIT_FAILED' } });
	});

	it('stays away after Away, whichever way the sign-out reports finishing', async () => {
		for (const order of ['logout first', 'socket first'] as const) {
			const { provider, sdk, events } = await started();
			sdk.signsIn();
			sdk.slowSignOut = true;

			provider.unregister();
			sdk.signOutFinishes(order);

			// Our own sign-out closing its socket is not a dropped connection to wait out: a later
			// Available has to sign in, not wait for a reconnect that will never come.
			expect(sdk.login).toHaveBeenCalledTimes(1);
			provider.register();
			expect(sdk.login).toHaveBeenCalledTimes(2);
			expect(events.some(e => e.type === 'ERROR')).toBe(false);
		}
	});

	it('waits out the sign-out of a sign-in that landed after Away before signing in again', async () => {
		const { provider, sdk } = await started();
		sdk.slowSignOut = true;

		// Away while signing in: the adapter signs out as the sign-in lands, and was never online.
		provider.unregister();
		sdk.signsIn();
		expect(sdk.logout).toHaveBeenCalledTimes(1);

		// Available now would sign in beside a phone the SDK still has registered - it refuses that.
		provider.register();
		expect(sdk.login).toHaveBeenCalledTimes(1);

		sdk.signOutFinishes('logout first');
		expect(sdk.login).toHaveBeenCalledTimes(2);
	});

	it('finishes a sign-out the SDK refuses with "Please login", instead of waiting for good', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		// A drop the adapter never heard about: the SDK is no longer registered, the adapter thinks
		// it is.
		sdk.registered = false;

		provider.unregister();

		// The SDK answers the logout with "Please login" and nothing else. That is the sign-out
		// finished, so the phone is offline and Available works again.
		expect(events.filter(e => e.type === 'REGISTRATION').at(-1)).toMatchObject({
			registered: false,
		});
		expect(events.some(e => e.type === 'ERROR')).toBe(false);

		provider.register();
		expect(sdk.login).toHaveBeenCalledTimes(2);
	});

	it("stops waiting for an old sign-out's socket after a while, so a later drop is heard", async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.slowSignOut = true;

		jest.useFakeTimers();
		try {
			provider.unregister();
			provider.register();
			// The unregister is answered, the phone signs in again - and the old socket's close
			// never arrives.
			sdk.fire('logout', { code: 200, status: 'logout successfully' });
			sdk.signsIn();

			jest.advanceTimersByTime(5_000);

			// A real drop now has to be heard, not taken for that old socket.
			sdk.drops();
			expect(events.filter(e => e.type === 'REGISTRATION').at(-1)).toMatchObject({
				registered: false,
			});
		} finally {
			jest.useRealTimers();
		}
	});

	it('signs out once when Away is pressed again during the sign-out', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.slowSignOut = true;

		provider.unregister();
		provider.unregister();
		sdk.signOutFinishes('logout first');

		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(events.some(e => e.type === 'ERROR')).toBe(false);
	});

	it('signs out a phone destroyed while signing in, once the sign-in lands', async () => {
		const { provider, sdk, events } = await started();

		// Logging out of the CRM within the first moments of the page: the registry destroys the
		// adapter before TeleCMI has answered the sign-in.
		provider.destroy();
		sdk.signsIn();

		// Without this the phone registers after all, and rings for someone who has logged out.
		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(sdk.registered).toBe(false);
		expect(events).toEqual([]);
	});

	it('signs out a phone destroyed while reconnecting, once it reconnects', async () => {
		const { provider, sdk } = await started();
		sdk.signsIn();
		sdk.drops();

		provider.destroy();
		expect(sdk.logout).not.toHaveBeenCalled();

		sdk.signsIn();
		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(sdk.registered).toBe(false);
	});

	it('signs out a reconnected phone after Away was pressed while it was down', async () => {
		const { provider, sdk } = await started();
		sdk.signsIn();
		sdk.drops();

		provider.unregister();
		sdk.signsIn();

		expect(sdk.registered).toBe(false);
	});

	it('reports a refused sign-in as offline and as a registration failure', async () => {
		const { sdk, events } = await started();

		sdk.fire('loginFailed', { code: 407, status: 'invalid IP' });

		expect(events).toEqual([
			{ type: 'REGISTRATION', registered: false, detail: 'invalid IP' },
			{
				type: 'ERROR',
				error: {
					code: 'REGISTRATION_FAILED',
					message: expect.stringContaining('invalid IP'),
				},
			},
		]);
	});

	it('reports being signed out by TeleCMI, but not a socket drop it recovers from', async () => {
		const { sdk, events } = await started();

		sdk.fire('disconnected', { code: 1000, status: 'disconnected' });
		expect(events).toEqual([
			{ type: 'REGISTRATION', registered: false, detail: 'disconnected' },
		]);

		sdk.fire('sbc_logout', { code: 200, reason: 'logged in elsewhere' });
		expect(events.at(-1)).toMatchObject({
			type: 'ERROR',
			error: { code: 'REGISTRATION_FAILED' },
		});
	});

	it('never emits the password, and keeps it in no field of its own', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.fire('loginFailed', { code: 401, status: 'invalid user' });

		expect(JSON.stringify(events)).not.toContain('agent-password');

		// The adapter's own fields, the SDK instance left out: the real SDK keeps the password in its
		// SIP configuration once `login` has run, which no adapter can prevent and this stand-in does
		// not model. What this proves is that the adapter adds no copy of its own.
		const own = Object.fromEntries(
			Object.entries(provider as unknown as Record<string, unknown>).filter(
				([field]) => field !== 'phone',
			),
		);
		expect(JSON.stringify(own)).not.toContain('agent-password');
		expect(sdk.login).toHaveBeenCalledWith(
			'5001_1111112',
			'agent-password',
			'sbcind.telecmi.com',
		);
	});

	// ------------------------------------------------------------------ calls

	it('turns an incoming call into INCOMING with its id and caller', async () => {
		const { sdk, events } = await started();

		sdk.fire('inComingCall', { from: '919000000003', name: 'Customer', call_id: 'CALL-1' });

		expect(events).toEqual([
			{ type: 'INCOMING', callId: 'CALL-1', from: '919000000003', displayName: 'Customer' },
		]);
	});

	it('does not pass the SDK\'s "unknown" off as a caller number', async () => {
		const { sdk, events } = await started();

		sdk.fire('inComingCall', { from: 'unknown', call_id: 'CALL-1' });

		expect(events[0]).toMatchObject({ type: 'INCOMING', from: '' });
	});

	it('answers, connects, and ends once however many end events arrive', async () => {
		const { provider, sdk, events } = await started();
		sdk.fire('inComingCall', { from: '919000000003', call_id: 'CALL-1' });

		provider.answer();
		expect(sdk.answer).toHaveBeenCalledTimes(1);

		sdk.fire('answered', { code: 200, status: 'answered' });
		sdk.fire('answered', { code: 200, status: 'answered' });
		sdk.fire('ended', { code: 200, status: 'call ended' });
		sdk.fire('hangup', { code: 200, status: 'call hangup' });

		expect(events.map(e => e.type)).toEqual(['INCOMING', 'CONNECTED', 'CONNECTED', 'ENDED']);
		expect(events.at(-1)).toEqual({ type: 'ENDED', callId: 'CALL-1', reason: 'call ended' });
	});

	it('ends a withdrawn call that was never answered', async () => {
		const { sdk, events } = await started();
		sdk.fire('inComingCall', { from: '919000000003', call_id: 'CALL-1' });

		sdk.fire('missedCall', { uuid: 'CALL-1', from: '919000000003', reason: 'cancelled' });

		expect(events.at(-1)).toEqual({ type: 'ENDED', callId: 'CALL-1', reason: 'cancelled' });
	});

	it('refuses a ringing call it has not answered, and hangs up one it has', async () => {
		const { provider, sdk } = await started();

		sdk.fire('inComingCall', { call_id: 'CALL-1' });
		provider.hangup();
		expect(sdk.reject).toHaveBeenCalledTimes(1);
		expect(sdk.terminate).not.toHaveBeenCalled();
		sdk.fire('hangup', { code: 200, status: 'call hangup' });

		sdk.fire('inComingCall', { call_id: 'CALL-2' });
		provider.answer();
		provider.hangup();
		expect(sdk.terminate).toHaveBeenCalledTimes(1);
		expect(sdk.reject).toHaveBeenCalledTimes(1);
	});

	it('refuses every control when there is no call, and again once it has ended', async () => {
		const { provider, sdk } = await started();

		for (const control of [
			() => provider.answer(),
			() => provider.hangup(),
			() => provider.toggleHold(),
			() => provider.toggleMute(),
			() => provider.sendDtmf('1'),
		])
			expect(control).toThrow(expect.objectContaining({ code: 'NO_ACTIVE_CALL' }));

		sdk.fire('inComingCall', { call_id: 'CALL-1' });
		expect(() => provider.hangup()).not.toThrow();
		sdk.fire('hangup', { code: 200, status: 'call hangup' });

		expect(() => provider.hangup()).toThrow(
			expect.objectContaining({ code: 'NO_ACTIVE_CALL' }),
		);
	});

	it('holds from what the SDK says the call is, and reports only its own hold', async () => {
		const { provider, sdk, events } = await started();
		sdk.fire('inComingCall', { call_id: 'CALL-1' });

		provider.toggleHold();
		provider.toggleHold();
		// The far end holding the agent is not the agent's hold, and must not flip the button.
		sdk.fire('hold', { code: 200, status: 'call on hold', whom: 'other' });

		expect(sdk.hold).toHaveBeenCalledTimes(1);
		expect(sdk.unHold).toHaveBeenCalledTimes(1);
		expect(events.filter(e => e.type === 'HOLD')).toEqual([
			{ type: 'HOLD', onHold: true },
			{ type: 'HOLD', onHold: false },
		]);
	});

	it('emits mute itself, from what the SDK reports after the toggle', async () => {
		const { provider, sdk, events } = await started();
		sdk.fire('inComingCall', { call_id: 'CALL-1' });

		provider.toggleMute();
		provider.toggleMute();

		expect(sdk.mute).toHaveBeenCalledTimes(1);
		expect(sdk.unMute).toHaveBeenCalledTimes(1);
		expect(events.filter(e => e.type === 'MUTE')).toEqual([
			{ type: 'MUTE', muted: true },
			{ type: 'MUTE', muted: false },
		]);
	});

	it('separates a key it cannot dial from having no call at all', async () => {
		const { provider, sdk } = await started();
		sdk.fire('inComingCall', { call_id: 'CALL-1' });

		expect(() => provider.sendDtmf('A')).toThrow(
			expect.objectContaining({ code: 'INVALID_INPUT' }),
		);
		expect(sdk.sendDtmf).not.toHaveBeenCalled();

		provider.sendDtmf('#');
		expect(sdk.sendDtmf).toHaveBeenCalledWith('#');
	});

	it('explains an SDK error by what it was about', async () => {
		const { sdk, events } = await started();

		// Signed out: every control answers "Please login".
		sdk.fire('error', { code: 1002, status: 'Please login' });
		sdk.signsIn();
		sdk.fire('error', { code: 1005, status: 'invalid dtmf type' });
		sdk.fire('error', { code: 1002, status: 'no session' });

		expect(
			events.filter(e => e.type === 'ERROR').map(e => e.type === 'ERROR' && e.error.code),
		).toEqual(['REGISTRATION_FAILED', 'INVALID_INPUT', 'NO_ACTIVE_CALL']);
	});

	it('reports a failed microphone mid-call as a microphone problem', async () => {
		const { sdk, events } = await started();

		sdk.fire('mediaFailed', { code: 400, status: 'media failed' });

		expect(events.at(-1)).toMatchObject({ type: 'ERROR', error: { code: 'MIC_DENIED' } });
	});

	it('signs out and stops listening when destroyed', async () => {
		const { provider, sdk, events } = await started();
		sdk.signsIn();
		sdk.fire('inComingCall', { call_id: 'CALL-1' });

		provider.destroy();

		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(sdk.registered).toBe(false);
		sdk.fire('inComingCall', { call_id: 'CALL-2' });
		expect(events.map(e => e.type)).toEqual(['REGISTRATION', 'INCOMING']);
		expect(() => provider.answer()).toThrow(
			expect.objectContaining({ code: 'NO_ACTIVE_CALL' }),
		);
	});

	it('never places a call itself, whatever it is asked to do', async () => {
		const { provider, sdk } = await started();

		sdk.signsIn();
		sdk.fire('inComingCall', { call_id: 'CALL-1' });
		provider.answer();
		provider.toggleHold();
		provider.toggleMute();
		provider.sendDtmf('1');
		provider.hangup();
		provider.unregister();
		provider.register();
		provider.destroy();

		// Dialling goes to our backend, which reads the number off the deal. The SDK's own `call`
		// would carry no deal and no caller id.
		expect(sdk.call).not.toHaveBeenCalled();
	});
});
