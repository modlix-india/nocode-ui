/**
 * How the vendor bundle gets onto the page.
 *
 * Worth testing on its own because every failure here looks like something else. A memo keyed on
 * nothing hands back a bundle from a URL nobody asked for; an integrity hash left on a custom URL
 * blocks the script and reports it as corrupt; and a `getSrcUrl` call at module scope silently
 * misses the CDN because `cdnPrefix` is set later during boot.
 */

jest.mock('../../components/util/getSrcUrl', () => ({
	__esModule: true,
	default: jest.fn((url: string) =>
		(globalThis as { cdnPrefix?: string }).cdnPrefix
			? `https://${(globalThis as { cdnPrefix?: string }).cdnPrefix}${url}`
			: url,
	),
}));

type Loaded = { src: string; integrity?: string; crossOrigin?: string | null };

/** Stands in for the browser fetching and evaluating the script. */
function captureScripts(onAppend: (script: HTMLScriptElement) => void) {
	const appended: HTMLScriptElement[] = [];
	const spy = jest.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
		appended.push(node as HTMLScriptElement);
		// Asynchronously, the way a real load resolves - so a second caller arriving before the
		// first finishes exercises the memo rather than racing past it.
		setTimeout(() => onAppend(node as HTMLScriptElement), 0);
		return node;
	});
	return { appended, restore: () => spy.mockRestore() };
}

/** The phone the fake SDK hands back, so a test can see which methods were called. */
const phone = {
	RegisterDevice: jest.fn(),
	UnRegisterDevice: jest.fn(),
	AcceptCall: jest.fn(),
	HangupCall: jest.fn(),
	ToggleHold: jest.fn(),
	ToggleMute: jest.fn(),
	SendDTMF: jest.fn(),
};

/** The call listener the adapter registers, so a test can drive the vendor's own events. */
let vendorListener: ((event: string, data: unknown) => void) | undefined;

/** The registration listener, whose strings are the vendor's and undocumented. */
let vendorRegisterListener: ((state: string) => void) | undefined;

function fakeSdk() {
	return function ExotelCRMWebSDK() {
		return {
			Initialize: async (
				callListener: (event: string, data: unknown) => void,
				registerListener: (state: string) => void,
			) => {
				vendorListener = callListener;
				vendorRegisterListener = registerListener;
				return phone;
			},
		};
	};
}

function loadProviderModule() {
	let mod!: typeof import('../providers/exotel');
	jest.isolateModules(() => {
		// A fresh instance per call is the point, and only require() can ask for one - an import
		// is hoisted out of the callback and evaluated once for the whole file.
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		mod = require('../providers/exotel');
	});
	return mod;
}

describe('exotel bundle loading', () => {
	let restoreScripts: () => void = () => {};

	beforeEach(() => {
		jest.clearAllMocks();
		vendorListener = undefined;
		vendorRegisterListener = undefined;

		(globalThis as { isSecureContext?: boolean }).isSecureContext = true;
		Object.defineProperty(navigator, 'mediaDevices', {
			configurable: true,
			value: {
				getUserMedia: jest
					.fn()
					.mockResolvedValue({ getTracks: () => [{ stop: () => {} }] }),
			},
		});

		// The loader reuses a bundle already on the page when it came from the same URL, so each
		// case starts with neither the global nor the note of where it came from.
		delete (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
		delete (globalThis as Record<string, unknown>).__modlixExotelSdkSource;
		delete (globalThis as { cdnPrefix?: string }).cdnPrefix;
	});

	afterEach(() => restoreScripts());

	async function init(sdkUrl?: string) {
		const { ExotelCallProvider } = loadProviderModule();
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).ExotelCRMWebSDK = fakeSdk();
			script.onload?.(new Event('load'));
		});
		restoreScripts = capture.restore;

		const provider = new ExotelCallProvider();
		await provider.init({
			token: 't',
			providerUserId: 'agent@example.com',
			autoRegister: true,
			sdkUrl,
		});

		return capture.appended.map<Loaded>(s => ({
			src: s.src,
			integrity: s.integrity,
			crossOrigin: s.crossOrigin,
		}));
	}

	it('injects nothing when no URL is configured', async () => {
		const { ExotelCallProvider } = loadProviderModule();
		const capture = captureScripts(() => {});
		restoreScripts = capture.restore;

		// No built-in default: a default is a path that has to be true of every deployment, and
		// the one that used to be here named a folder nobody had created.
		await expect(
			new ExotelCallProvider().init({
				token: 't',
				providerUserId: 'a@b.c',
				autoRegister: true,
			}),
		).rejects.toMatchObject({ code: 'SDK_LOAD_FAILED' });

		expect(capture.appended).toHaveLength(0);
	});

	it('loads a configured URL instead', async () => {
		const loaded = await init('api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js');

		expect(loaded).toHaveLength(1);
		expect(loaded[0].src).toContain('/jslib/exotelBundle/crmBundle.js');
		expect(loaded[0].src).toContain('crmBundle.js');
	});

	it('sets no integrity attribute', async () => {
		const loaded = await init('api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js');

		// A hash pins one exact file, so it cannot be paired with a configurable URL: it would
		// block every other one and report it as a corrupt bundle.
		expect(loaded[0].integrity).toBeFalsy();
		expect(loaded[0].crossOrigin).toBeFalsy();
	});

	it('sends the URL through the CDN when one is configured', async () => {
		(globalThis as { cdnPrefix?: string }).cdnPrefix = 'cdn-dev.modlix.com';

		const loaded = await init('api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js');

		// Resolved at load time, not at module scope: cdnPrefix is set during boot and would not
		// exist yet when this module was first evaluated.
		expect(loaded[0].src).toContain('cdn-dev.modlix.com');
	});

	it('injects one script for two providers sharing a URL', async () => {
		const { ExotelCallProvider } = loadProviderModule();
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).ExotelCRMWebSDK = fakeSdk();
			script.onload?.(new Event('load'));
		});
		restoreScripts = capture.restore;

		const cfg = { token: 't', providerUserId: 'a@b.c', autoRegister: true, sdkUrl: 'api/x.js' };
		await Promise.all([new ExotelCallProvider().init(cfg), new ExotelCallProvider().init(cfg)]);

		// A leader election racing a remount must not append two script tags.
		expect(capture.appended).toHaveLength(1);
	});

	it('fetches a second URL instead of reusing the bundle already on the page', async () => {
		const { ExotelCallProvider } = loadProviderModule();
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).ExotelCRMWebSDK = fakeSdk();
			script.onload?.(new Event('load'));
		});
		restoreScripts = capture.restore;

		const init = (sdkUrl: string) =>
			new ExotelCallProvider().init({
				token: 't',
				providerUserId: 'a@b.c',
				autoRegister: true,
				sdkUrl,
			});

		await init('api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js');
		await init('api/files/static/file/CLIENT/jslib/forked/crmBundle.js');

		// The global is a page-wide name; the URL is per-component configuration. Reusing the
		// bundle merely because the name is taken silently serves the first URL's bundle to
		// everyone after it - so an author who corrects the path, or a second app on a forked
		// build, keeps running code they did not ask for and nothing says so.
		expect(capture.appended).toHaveLength(2);
		expect(capture.appended[1].src).toContain('/CLIENT/jslib/forked/crmBundle.js');
	});

	it('retries after a failed load rather than caching the failure', async () => {
		const { ExotelCallProvider } = loadProviderModule();

		const failing = jest.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
			setTimeout(() => node.onerror?.(new Event('error')), 0);
			return node;
		});

		await expect(
			new ExotelCallProvider().init({
				token: 't',
				providerUserId: 'a@b.c',
				autoRegister: true,
				sdkUrl: 'api/wrong.js',
			}),
		).rejects.toMatchObject({ code: 'SDK_LOAD_FAILED' });

		failing.mockRestore();

		// The same URL has to be attempted again - this is the case an author hits after
		// correcting a path that 404d, without reloading the tab.
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).ExotelCRMWebSDK = fakeSdk();
			script.onload?.(new Event('load'));
		});
		restoreScripts = capture.restore;

		await new ExotelCallProvider().init({
			token: 't',
			providerUserId: 'a@b.c',
			autoRegister: true,
			sdkUrl: 'api/wrong.js',
		});

		expect(capture.appended).toHaveLength(1);
	});

	it('names the URL it could not load', async () => {
		const { ExotelCallProvider } = loadProviderModule();
		const spy = jest.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
			setTimeout(() => node.onerror?.(new Event('error')), 0);
			return node;
		});
		restoreScripts = () => spy.mockRestore();

		await expect(
			new ExotelCallProvider().init({
				token: 't',
				providerUserId: 'a@b.c',
				autoRegister: true,
				sdkUrl: 'api/typo/crmBundle.js',
			}),
		).rejects.toMatchObject({ message: expect.stringContaining('api/typo/crmBundle.js') });
	});
});

describe('call presence, separately from the call id', () => {
	let restore: () => void = () => {};

	beforeEach(() => {
		(globalThis as { isSecureContext?: boolean }).isSecureContext = true;
		Object.defineProperty(navigator, 'mediaDevices', {
			configurable: true,
			value: {
				getUserMedia: jest
					.fn()
					.mockResolvedValue({ getTracks: () => [{ stop: () => {} }] }),
			},
		});
		delete (globalThis as Record<string, unknown>).ExotelCRMWebSDK;
		delete (globalThis as Record<string, unknown>).__modlixExotelSdkSource;
		jest.clearAllMocks();
		vendorListener = undefined;
		vendorRegisterListener = undefined;
	});

	afterEach(() => restore());

	async function ringing(callId: string) {
		const { ExotelCallProvider } = loadProviderModule();
		const capture = captureScripts(script => {
			(globalThis as Record<string, unknown>).ExotelCRMWebSDK = fakeSdk();
			script.onload?.(new Event('load'));
		});
		restore = capture.restore;

		const provider = new ExotelCallProvider();
		await provider.init({
			token: 't',
			providerUserId: 'a@b.c',
			autoRegister: true,
			sdkUrl: 'api/x.js',
		});

		// The vendor's own snapshot, with whatever id it chose to give - which is often none.
		vendorListener?.('incoming', { callSid: callId, callId, callFromNumber: '+91000' });
		return provider;
	}

	it('answers a ringing call the provider gave no id for', async () => {
		const provider = await ringing('');

		// The regression this guards: presence was read off the id, and the provider sends an
		// empty one whenever its INVITE reader has not populated it. `!""` is true, so a real
		// ringing call read as no call, this threw, and the agent's own outbound leg rang until
		// the provider timed it out.
		expect(() => provider.answer()).not.toThrow();
		expect(phone.AcceptCall).toHaveBeenCalledTimes(1);
	});

	it('still refuses a control when nothing is ringing', async () => {
		const { ExotelCallProvider } = loadProviderModule();
		const provider = new ExotelCallProvider();

		// The guard has to keep working - ToggleMute is not optional-chained inside the SDK and
		// throws on its own without a call.
		expect(() => provider.toggleMute()).toThrow();
	});

	it('holds and mutes by what was asked for, not by counting the confirmations', async () => {
		const provider = await ringing('c1');
		const seen: Array<{ type: string; value: boolean }> = [];
		provider.on(event => {
			if (event.type === 'HOLD') seen.push({ type: 'HOLD', value: event.onHold });
			if (event.type === 'MUTE') seen.push({ type: 'MUTE', value: event.muted });
		});

		provider.toggleHold();
		// The bundle delivers its call events more than once - the reason INCOMING, CONNECTED and
		// ENDED are all idempotent - and its confirmation says only that a toggle happened. A
		// second one used to invert the flag, leaving the call held while the button offered to
		// hold it, so the agent's next press unheld a call they thought was live.
		vendorListener?.('holdtoggle', {});
		vendorListener?.('holdtoggle', {});

		provider.toggleMute();
		vendorListener?.('mutetoggle', {});
		vendorListener?.('mutetoggle', {});

		expect(seen).toEqual([
			{ type: 'HOLD', value: true },
			{ type: 'HOLD', value: true },
			{ type: 'MUTE', value: true },
			{ type: 'MUTE', value: true },
		]);

		// And a real second press still comes back off hold.
		provider.toggleHold();
		vendorListener?.('holdtoggle', {});

		expect(seen.at(-1)).toEqual({ type: 'HOLD', value: false });
	});

	it('forgets a hold that the SDK refused', async () => {
		const provider = await ringing('c1');
		phone.ToggleHold.mockImplementationOnce(() => {
			throw new Error('no session');
		});

		expect(() => provider.toggleHold()).toThrow();

		// The request never reached the SDK, so it must not be waiting to be asserted by whatever
		// confirmation arrives next.
		const seen: boolean[] = [];
		provider.on(event => {
			if (event.type === 'HOLD') seen.push(event.onHold);
		});
		vendorListener?.('holdtoggle', {});

		expect(seen).toEqual([false]);
	});

	it('reads the registration strings that mean the opposite of registered', async () => {
		const provider = await ringing('c1');
		const readings = new Map<string, boolean>();
		provider.on(event => {
			if (event.type === 'REGISTRATION') readings.set(event.detail ?? '', event.registered);
		});

		// The vendor's strings are undocumented, so this matches loosely - but every string that
		// means "not registered" contains the word "registered", and a substring match called
		// them all registered. That is the worst way for it to be wrong: the agent is shown as
		// available by a phone the provider has just dropped, and their calls go nowhere.
		for (const value of [
			'registered',
			'REGISTERED',
			'sip registered',
			'unregistered',
			'deregistered',
			'not registered',
			'not_registered',
			'registration_failed',
			'registering',
			'',
		])
			vendorRegisterListener?.(value);

		expect(Object.fromEntries(readings)).toEqual({
			registered: true,
			REGISTERED: true,
			'sip registered': true,
			unregistered: false,
			deregistered: false,
			'not registered': false,
			not_registered: false,
			registration_failed: false,
			registering: false,
			'': false,
		});
	});

	it('separates a key it cannot dial from having no call at all', async () => {
		const provider = await ringing('c1');

		// Two different answers for two different problems. Reported as NO_ACTIVE_CALL, a typo in
		// an author's expression sent them looking at the phone - which was working - instead of
		// at the value they were passing.
		expect(() => provider.sendDtmf('A')).toThrow(
			expect.objectContaining({ code: 'INVALID_INPUT' }),
		);
		expect(phone.SendDTMF).not.toHaveBeenCalled();

		provider.sendDtmf('#');
		expect(phone.SendDTMF).toHaveBeenCalledWith('#');
	});

	it('refuses again once the call has ended', async () => {
		const provider = await ringing('c1');
		expect(() => provider.hangup()).not.toThrow();

		vendorListener?.('callEnded', { callId: 'c1' });

		expect(() => provider.hangup()).toThrow();
	});
});
