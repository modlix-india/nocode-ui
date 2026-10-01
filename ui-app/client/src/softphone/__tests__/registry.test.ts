import { BroadcastChannel as NodeBroadcastChannel } from 'node:worker_threads';
import { LeaderChannel } from '../leader';
import type { ICallProvider, ProviderInit } from '../providers/ICallProvider';
import type { SoftphoneEvent, SoftphoneState } from '../types';

/**
 * The registry's guards, rather than its happy path.
 *
 * Each of these fails silently in production if it regresses - a phone that stays registered after
 * logout, a microphone prompt shown to someone who cannot take calls, a real call placed from the
 * page editor - so each is worth a test that would notice.
 */

const api = {
	fetchStatus: jest.fn(),
	fetchToken: jest.fn(),
	dialTicket: jest.fn(),
};

/** Fires when the registry's own listener on `Store.auth` should fire. */
let authListener: (() => void) | undefined;
let authValue: unknown = { loggedInClientCode: 'ACME' };

const store = {
	addListener: jest.fn((_page: unknown, callback: () => void) => {
		authListener = callback;
		return () => (authListener = undefined);
	}),
	getDataFromPath: jest.fn((path: string) => (path === 'Store.auth' ? authValue : undefined)),
};

class FakeProvider implements ICallProvider {
	readonly provider = 'EXOTEL';

	static last?: FakeProvider;
	static initFailure?: unknown;
	/** Holds the next provider's init open until the test settles it - the microphone prompt, say. */
	static initGate?: Promise<void>;

	/**
	 * Whether this provider has a registered phone, modelled on Exotel's adapter - the case that
	 * needs the most from the registry. Its `destroy` before `init` has finished finds no phone and
	 * does nothing, and `init` then goes on to make and register one regardless. Only a destroy
	 * after `init` returns reaches it.
	 */
	hasPhone = false;

	init = jest.fn(async (config: ProviderInit) => {
		this.initConfig = config;
		const gate = FakeProvider.initGate;
		FakeProvider.initGate = undefined;
		if (gate) await gate;
		if (FakeProvider.initFailure) throw FakeProvider.initFailure;
		this.hasPhone = true;
	});
	register = jest.fn();
	unregister = jest.fn();
	answer = jest.fn();
	hangup = jest.fn();
	toggleHold = jest.fn();
	toggleMute = jest.fn();
	sendDtmf = jest.fn();
	destroy = jest.fn(() => {
		this.hasPhone = false;
	});

	initConfig?: ProviderInit;
	private listener?: (event: SoftphoneEvent) => void;

	constructor() {
		FakeProvider.last = this;
	}

	on(listener: (event: SoftphoneEvent) => void): () => void {
		this.listener = listener;
		return () => (this.listener = undefined);
	}

	emit(event: SoftphoneEvent): void {
		this.listener?.(event);
	}

	get subscribed(): boolean {
		return !!this.listener;
	}
}

jest.mock('../api', () => api);
jest.mock('../providers/exotel', () => ({
	ExotelCallProvider: jest.fn(() => new FakeProvider()),
}));
jest.mock('../providers/telecmi', () => ({
	TelecmiCallProvider: jest.fn(() => new FakeProvider()),
}));
jest.mock('../../context/StoreContext', () => store);

/** Every registry a test loads, so afterEach can put its timers and channels away. */
const loaded: Array<typeof import('../registry').softphoneRegistry> = [];

function loadRegistry() {
	// A fresh module instance per test: the whole point of the registry is that it is a singleton,
	// so state would otherwise leak between cases.
	let registry!: typeof import('../registry').softphoneRegistry;
	jest.isolateModules(() => {
		// require(), because an import would be hoisted out of this callback and evaluated once -
		// which is the single module instance these tests exist to avoid.
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		registry = require('../registry').softphoneRegistry;
	});
	loaded.push(registry);
	return registry;
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * jsdom has no Web Locks, and the production fallback for that is "assume a single tab and lead".
 *
 * Which is right in such a browser and useless for testing leadership: a tab that cannot hand the
 * post to anyone has to keep it. Installed only in the tests where stepping down is the point.
 */
function installLockManager() {
	const held = new Set<string>();
	const queued = new Map<string, Array<() => void>>();

	const grant = (name: string, callback: () => Promise<void>): Promise<void> => {
		held.add(name);
		return Promise.resolve(callback()).finally(() => {
			held.delete(name);
			queued.get(name)?.shift()?.();
		});
	};

	(navigator as unknown as { locks: unknown }).locks = {
		// Both call shapes, as the real one: (name, callback) and (name, { signal }, callback). An
		// aborted request still queued leaves the queue and rejects, per the Web Locks spec.
		request: (
			name: string,
			optionsOrCallback: { signal?: AbortSignal } | (() => Promise<void>),
			maybeCallback?: () => Promise<void>,
		) => {
			const callback =
				typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback!;
			const signal =
				typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback.signal;
			if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
			if (!held.has(name)) return grant(name, callback);

			return new Promise<void>((resolve, reject) => {
				const waiters = queued.get(name) ?? [];
				const waiter = () => grant(name, callback).then(resolve, reject);
				waiters.push(waiter);
				queued.set(name, waiters);
				signal?.addEventListener('abort', () => {
					const at = waiters.indexOf(waiter);
					if (at >= 0) waiters.splice(at, 1);
					reject(new DOMException('Aborted', 'AbortError'));
				});
			});
		},
	};

	return () => {
		delete (navigator as unknown as { locks?: unknown }).locks;
	};
}

/** Channels a test opened directly, so afterEach can release their locks and timers. */
const channels: LeaderChannel[] = [];

/** BroadcastChannel delivery has no guaranteed timing, so poll rather than wait a fixed spell. */
async function waitFor(condition: () => boolean, timeoutMs = 2_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (!condition()) {
		if (Date.now() > deadline) throw new Error('Timed out waiting for the expected state.');
		await new Promise(resolve => setTimeout(resolve, 5));
	}
}

/** There is no built-in default any more, so every test that expects a phone must name a URL. */
const SDK = 'api/files/static/file/SYSTEM/jslib/exotelBundle/crmBundle.js';

describe('softphoneRegistry', () => {
	let restoreChannel: () => void;

	beforeEach(() => {
		jest.clearAllMocks();
		FakeProvider.last = undefined;
		FakeProvider.initFailure = undefined;
		FakeProvider.initGate = undefined;
		authListener = undefined;
		authValue = { loggedInClientCode: 'ACME' };

		const had = 'BroadcastChannel' in globalThis;
		if (!had)
			(globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel =
				NodeBroadcastChannel;
		restoreChannel = () => {
			if (!had)
				delete (globalThis as unknown as { BroadcastChannel?: unknown }).BroadcastChannel;
		};

		delete (globalThis as { isDesignMode?: boolean }).isDesignMode;
		delete (globalThis as { designMode?: string }).designMode;
	});

	afterEach(() => {
		// The leader's announce interval and its BroadcastChannel both hold the event loop open,
		// which is correct in a tab and would hang the runner.
		channels.splice(0).forEach(c => c.stop());
		loaded.splice(0).forEach(r => r.stop());
		restoreChannel();
	});

	function provisioned() {
		// Lowercase, because that is what the backend actually sends:
		// ConnectionSubType.getProvider() returns name().toLowerCase(). Mocking it uppercase hid a
		// real bug - the adapter lookup missed and the phone never started.
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'exotel',
			providerUserId: 'agent@example.com',
			virtualNumber: '+911234567890',
		});
		api.fetchToken.mockResolvedValue({
			token: 'agent-token',
			providerUserId: 'agent@example.com',
			expiresIn: 7776000,
			provider: 'exotel',
		});
	}

	it('mints no token and loads no provider for an agent who is not provisioned', async () => {
		api.fetchStatus.mockResolvedValue({ provisioned: false, provider: 'exotel' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		// The important half is what did *not* happen: no credential minted, no vendor bundle
		// fetched, and so no microphone prompt for a user who cannot take calls.
		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(FakeProvider.last).toBeUndefined();
		expect(registry.getState().provisioned).toBe(false);
		expect(registry.current()).toBeUndefined();
	});

	it('brings the phone up for a provisioned agent', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(api.fetchToken).toHaveBeenCalledWith('exotelConnection');
		expect(FakeProvider.last?.init).toHaveBeenCalledWith({
			token: 'agent-token',
			providerUserId: 'agent@example.com',
			autoRegister: true,
			sdkUrl: SDK,
		});
		expect(registry.getState()).toMatchObject({ provisioned: true, isLeader: true });
	});

	it('finds the adapter for the name the backend actually sends', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		// The regression this guards: keyed on the enum name, this lookup missed, bringUpPhone
		// bailed before minting a token, and the vendor bundle was never fetched.
		expect(FakeProvider.last).toBeDefined();
		expect(api.fetchToken).toHaveBeenCalled();
		expect(registry.getState().lastError).toBeNull();
	});

	it('finds the adapter whatever case the provider name arrives in', async () => {
		provisioned();
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'ExOtEl',
			providerUserId: 'agent@example.com',
			virtualNumber: '+911234567890',
		});
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(FakeProvider.last).toBeDefined();
		// And the store gets one predictable form regardless, so a page can compare against it.
		expect(registry.getState().provider).toBe('exotel');
	});

	it('says so plainly when there is genuinely no adapter', async () => {
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'twilio',
			providerUserId: 'agent@example.com',
		});
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(FakeProvider.last).toBeUndefined();
		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(registry.getState().lastError).toMatchObject({ code: 'INIT_FAILED' });
	});

	it('passes a configured library URL through to the adapter', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, 'api/files/x/crmBundle.js');
		await settle();

		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: 'api/files/x/crmBundle.js' }),
		);
	});

	it('refuses to start, and mints no token, when no library URL is configured', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection');
		await settle();

		// Checked before the token is minted: every mint is a call to the provider, and burning
		// one to then fail on a missing URL is waste with a worse error.
		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(FakeProvider.last).toBeUndefined();
		expect(registry.getState().lastError).toMatchObject({ code: 'SDK_LOAD_FAILED' });
	});

	it('brings the phone up again when the library URL changes', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, 'api/files/wrong/crmBundle.js');
		await settle();
		const first = FakeProvider.last;

		// The case an author hits while getting the URL right: the first load 404d, they correct
		// it, and it has to actually be retried rather than noted and ignored.
		await registry.start('exotelConnection', true, 'api/files/right/crmBundle.js');
		await settle();

		expect(first?.destroy).toHaveBeenCalled();
		expect(FakeProvider.last).not.toBe(first);
		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: 'api/files/right/crmBundle.js' }),
		);
	});

	it('does not restart when nothing that identifies the session changed', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, 'api/files/x/crmBundle.js');
		await settle();
		const first = FakeProvider.last;

		await registry.start('exotelConnection', true, 'api/files/x/crmBundle.js');
		await settle();

		expect(FakeProvider.last).toBe(first);
		expect(first?.destroy).not.toHaveBeenCalled();
	});

	// ------------------------------------------------------------------ a second provider

	function telecmiProvisioned(status: Record<string, unknown> = {}) {
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'telecmi',
			providerUserId: '5001_1111112',
			connectionName: 'telecmiCalls',
			...status,
		});
		api.fetchToken.mockResolvedValue({
			token: 'agent-password',
			providerUserId: '5001_1111112',
			provider: 'telecmi',
			region: 'sbcind.telecmi.com',
		});
	}

	it('brings up the TeleCMI adapter for a TeleCMI connection, with its region', async () => {
		telecmiProvisioned();
		const { TelecmiCallProvider } = jest.requireMock('../providers/telecmi');
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, SDK);
		await settle();

		expect(TelecmiCallProvider).toHaveBeenCalledTimes(1);
		expect(FakeProvider.last?.init).toHaveBeenCalledWith({
			token: 'agent-password',
			providerUserId: '5001_1111112',
			autoRegister: true,
			sdkUrl: SDK,
			region: 'sbcind.telecmi.com',
		});
		expect(registry.getState().provider).toBe('telecmi');
	});

	it('runs on the connection the backend answered for when the page names none', async () => {
		telecmiProvisioned({
			sdkUrl: 'api/files/static/file/SYSTEM/jslib/telecmiBundle/piopiy.min.js',
		});
		api.dialTicket.mockResolvedValue({});
		const registry = loadRegistry();

		await registry.start(undefined, true, undefined);
		await settle();

		// Asked with no connection, so the backend picks the agent's own...
		expect(api.fetchStatus).toHaveBeenCalledWith(undefined);
		// ...and the token, the library and every dial then use what it picked.
		expect(api.fetchToken).toHaveBeenCalledWith('telecmiCalls');
		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({
				sdkUrl: 'api/files/static/file/SYSTEM/jslib/telecmiBundle/piopiy.min.js',
			}),
		);

		await registry.current()?.dial('501');
		expect(api.dialTicket).toHaveBeenCalledWith('501', 'telecmiCalls');
	});

	it("prefers the connection's library over the page's", async () => {
		telecmiProvisioned({ sdkUrl: 'api/connection/piopiy.min.js' });
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();

		// One page, Exotel's bundle as its setting: a TeleCMI agent must still get TeleCMI's.
		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: 'api/connection/piopiy.min.js' }),
		);
	});

	it("falls back to the page's library when the connection names none", async () => {
		provisioned();
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'exotel',
			providerUserId: 'agent@example.com',
			connectionName: 'exotelConnection',
		});
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();

		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: SDK }),
		);
	});

	it('refuses, and mints no token, when neither the connection nor the page names a library', async () => {
		telecmiProvisioned();
		const registry = loadRegistry();

		await registry.start(undefined);
		await settle();

		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(registry.getState().lastError).toMatchObject({ code: 'SDK_LOAD_FAILED' });
	});

	it('does nothing more for a user on no connection when the page names none', async () => {
		api.fetchStatus.mockResolvedValue({ provisioned: false });
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();

		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(FakeProvider.last).toBeUndefined();
		expect(registry.current()).toBeUndefined();
		expect(registry.getState().lastError).toBeNull();
	});

	it("says which connections the page has to choose between, in the server's words", async () => {
		api.fetchStatus.mockRejectedValue({
			response: {
				status: 400,
				data: { message: 'This user can take calls on more than one connection: a, b.' },
			},
		});
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();

		expect(api.fetchToken).not.toHaveBeenCalled();
		expect(registry.getState().lastError).toEqual({
			code: 'NOT_PROVISIONED',
			message: 'This user can take calls on more than one connection: a, b.',
		});
	});

	it('does not restart when the page again names no connection', async () => {
		telecmiProvisioned({ sdkUrl: 'api/connection/piopiy.min.js' });
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();
		const first = FakeProvider.last;

		// Compared with what the page asked for, not with the connection the backend picked -
		// otherwise every remount of a page with no connection would tear a working phone down.
		await registry.start(undefined, true, SDK);
		await settle();

		expect(FakeProvider.last).toBe(first);
		expect(first?.destroy).not.toHaveBeenCalled();
		expect(api.fetchStatus).toHaveBeenCalledTimes(1);
	});

	// ------------------------------------------------------------------ a start replaced mid-flight

	it('drops the status of a start a newer one replaced, when both name the same connection', async () => {
		telecmiProvisioned();
		let answerFirst!: (status: unknown) => void;
		api.fetchStatus.mockReturnValueOnce(new Promise(resolve => (answerFirst = resolve)));
		const registry = loadRegistry();

		// An author correcting the library URL while the first status read is still in flight:
		// the same connection (here none), a different URL.
		const first = registry.start(undefined, true, 'api/wrong/piopiy.min.js');
		await registry.start(undefined, true, 'api/right/piopiy.min.js');
		await settle();

		answerFirst({ provisioned: true, provider: 'telecmi', connectionName: 'telecmiCalls' });
		await first;
		await settle();

		// One phone, on the URL asked for last. The stale answer used to open a second leader
		// channel, which brought up a second phone and kept its lock.
		expect(api.fetchToken).toHaveBeenCalledTimes(1);
		expect(FakeProvider.last?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: 'api/right/piopiy.min.js' }),
		);
	});

	it('does not bring up the phone of a start replaced while its token was being minted', async () => {
		telecmiProvisioned();
		let mintFirst!: (token: unknown) => void;
		api.fetchToken.mockReturnValueOnce(new Promise(resolve => (mintFirst = resolve)));
		// Real locks, so a resign would actually hand the post away and show here.
		const restoreLocks = installLockManager();
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, 'api/wrong/piopiy.min.js');
		await settle();
		await registry.start('telecmiCalls', true, 'api/right/piopiy.min.js');
		await settle();
		const current = FakeProvider.last;

		mintFirst({ token: 'agent-password', providerUserId: '5001_1111112', provider: 'telecmi' });
		await settle();
		await settle();
		restoreLocks();

		expect(FakeProvider.last).toBe(current);
		expect(current?.init).toHaveBeenCalledWith(
			expect.objectContaining({ sdkUrl: 'api/right/piopiy.min.js' }),
		);
		// And the stale start does not count itself a failure and resign the new one's post.
		expect(registry.getState().isLeader).toBe(true);
		expect(registry.getState().lastError).toBeNull();
	});

	/** Starts on one library URL, then restarts on another while the first init is still open. */
	async function restartDuringInit() {
		telecmiProvisioned();
		let settleInit!: { resolve: () => void; reject: (e: unknown) => void };
		FakeProvider.initGate = new Promise<void>(
			(resolve, reject) => (settleInit = { resolve, reject }),
		);
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, 'api/wrong/piopiy.min.js');
		await settle();
		const replaced = FakeProvider.last!;

		await registry.start('telecmiCalls', true, 'api/right/piopiy.min.js');
		await settle();
		const current = FakeProvider.last!;
		expect(current).not.toBe(replaced);

		return { registry, replaced, current, settleInit };
	}

	it("keeps the new phone's events when a replaced bring-up finishes after it", async () => {
		const { registry, replaced, current, settleInit } = await restartDuringInit();

		// Torn down by the restart itself, not when its init returns - an adapter destroyed there
		// goes no further, so it never signs in...
		expect(replaced.destroy).toHaveBeenCalledTimes(1);

		// ...nothing it says on its way out reaches the page, because the restart unsubscribed it...
		replaced.emit({ type: 'INCOMING', callId: 'stale', from: '+91000' });
		expect(registry.getState().inCall).toBe(false);

		settleInit.resolve();
		await settle();

		// ...and destroyed again when its init returns, which is what unregisters a phone that init
		// made regardless - Exotel's. Skipping this left one registered and owned by nobody...
		expect(replaced.destroy).toHaveBeenCalledTimes(2);
		expect(replaced.hasPhone).toBe(false);
		expect(current.destroy).not.toHaveBeenCalled();

		// ...and the phone in use still reaches the page. Discarding the replaced one used to
		// unsubscribe this one instead, so a registered phone rang with nothing on screen.
		current.emit({ type: 'REGISTRATION', registered: true });
		current.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });
		expect(registry.getState()).toMatchObject({ registered: true, inCall: true, callId: 'c1' });
	});

	it('destroys a phone still in its init when the session stops, and again when its init returns', async () => {
		telecmiProvisioned();
		let settleInit!: () => void;
		FakeProvider.initGate = new Promise<void>(resolve => (settleInit = resolve));
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, SDK);
		await settle();
		const pending = FakeProvider.last!;

		// Logging out of the CRM while the microphone prompt is still open.
		registry.stop();
		expect(pending.destroy).toHaveBeenCalledTimes(1);
		expect(pending.subscribed).toBe(false);

		settleInit();
		await settle();

		// An adapter that could not stop part-way has made and registered its phone by now. It
		// must not be left ringing for the agent who just logged out.
		expect(pending.destroy).toHaveBeenCalledTimes(2);
		expect(pending.hasPhone).toBe(false);
		expect(registry.getState().lastError).toBeNull();
	});

	it("still reaches a newer phone in its init after a replaced one's init returns", async () => {
		telecmiProvisioned();
		const gates: Array<() => void> = [];
		const gate = () =>
			(FakeProvider.initGate = new Promise<void>(resolve => gates.push(resolve)));
		const registry = loadRegistry();

		gate();
		await registry.start('telecmiCalls', true, 'api/wrong/piopiy.min.js');
		await settle();
		const replaced = FakeProvider.last!;

		gate();
		await registry.start('telecmiCalls', true, 'api/right/piopiy.min.js');
		await settle();
		const pending = FakeProvider.last!;

		// The replaced bring-up finishes while the newer one is still in its init...
		gates[0]();
		await settle();
		expect(replaced.hasPhone).toBe(false);

		// ...and must not have taken the newer one's record with it: a logout now still destroys
		// the newer phone at once, before its own init has returned.
		registry.stop();
		expect(pending.destroy).toHaveBeenCalledTimes(1);

		gates[1]();
		await settle();
		expect(pending.hasPhone).toBe(false);
	});

	it("lets go of the phone's events when the session stops", async () => {
		telecmiProvisioned();
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, SDK);
		await settle();
		const provider = FakeProvider.last!;
		expect(provider.subscribed).toBe(true);

		registry.stop();

		expect(provider.subscribed).toBe(false);
		expect(provider.destroy).toHaveBeenCalled();
	});

	it('does not report the failure of a bring-up a newer start replaced', async () => {
		const { registry, replaced, current, settleInit } = await restartDuringInit();

		settleInit.reject({ code: 'MIC_DENIED', message: 'The microphone could not be opened.' });
		await settle();

		expect(replaced.destroy).toHaveBeenCalled();
		expect(registry.getState().lastError).toBeNull();
		expect(registry.getState().micDenied).toBe(false);

		current.emit({ type: 'REGISTRATION', registered: true });
		expect(registry.getState().registered).toBe(true);
	});

	it('does not report the failed status of a start a newer one replaced', async () => {
		telecmiProvisioned();
		let failFirst!: (error: unknown) => void;
		api.fetchStatus.mockReturnValueOnce(new Promise((_, reject) => (failFirst = reject)));
		const registry = loadRegistry();

		const first = registry.start('oldConnection', true, SDK);
		await registry.start('telecmiCalls', true, SDK);
		await settle();

		failFirst({
			response: { data: { message: 'Connection with name oldConnection not found' } },
		});
		await first;
		await settle();

		// The phone that is running is fine; an error about the one that was replaced would say
		// otherwise, and fire the page's onError for nothing.
		expect(registry.getState().lastError).toBeNull();
		expect(registry.getState().provisioned).toBe(true);
	});

	// ------------------------------------------------------------------ what a failure tells the page

	/** What axios rejects with on a 4xx: its own `code` and `message`, and the whole request. */
	function httpFailure(serverMessage?: string) {
		return Object.assign(new Error('Request failed with status code 400'), {
			isAxiosError: true,
			code: 'ERR_BAD_REQUEST',
			config: { headers: { Authorization: 'the-users-jwt' } },
			response: { status: 400, data: serverMessage ? { message: serverMessage } : {} },
		});
	}

	it("reports a refused dial as DIAL_REJECTED in the server's words, not as the HTTP error", async () => {
		provisioned();
		api.dialTicket.mockRejectedValue(httpFailure('This deal has no phone number.'));
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		await expect(registry.current()?.dial('501')).rejects.toEqual({
			code: 'DIAL_REJECTED',
			message: 'This deal has no phone number.',
		});
		// Exactly those two fields: the request, its auth header among them, stays out of the store.
		expect(registry.getState().lastError).toEqual({
			code: 'DIAL_REJECTED',
			message: 'This deal has no phone number.',
		});
	});

	it('reports a refused token as TOKEN_FAILED, with the fallback when the server says nothing', async () => {
		provisioned();
		api.fetchToken.mockRejectedValue(httpFailure());
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(registry.getState().lastError).toEqual({
			code: 'TOKEN_FAILED',
			message: 'The phone could not be started.',
		});
	});

	it('does not take a built-in object name for one of our codes', async () => {
		provisioned();
		// `'constructor' in {...}` is true - the name lives on the prototype of every object.
		api.dialTicket.mockRejectedValue({ code: 'constructor', message: 'Not one of ours.' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		await expect(registry.current()?.dial('501')).rejects.toMatchObject({
			code: 'DIAL_REJECTED',
		});
	});

	it("still passes an adapter's own error through, as its own fields only", async () => {
		provisioned();
		FakeProvider.initFailure = { code: 'MIC_DENIED', message: 'Blocked.', extra: 'dropped' };
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(registry.getState().lastError).toEqual({ code: 'MIC_DENIED', message: 'Blocked.' });
	});

	// ------------------------------------------------------------------ one phone, however it is named

	it('keeps a running phone when a Softphone with no connection mounts', async () => {
		telecmiProvisioned();
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, SDK);
		await settle();
		const running = FakeProvider.last!;

		// Navigating mid-call from a page naming the connection to one that leaves it blank. Blank
		// means the agent's own, and the running phone is one they are provisioned on: a restart
		// would drop the call and sign in again, only to land back on the same connection.
		await registry.start(undefined, true, SDK);
		await settle();

		expect(running.destroy).not.toHaveBeenCalled();
		expect(FakeProvider.last).toBe(running);
		expect(api.fetchStatus).toHaveBeenCalledTimes(1);
	});

	it('keeps a running phone when a Softphone names the connection it already runs on', async () => {
		telecmiProvisioned();
		const registry = loadRegistry();

		await registry.start(undefined, true, SDK);
		await settle();
		const running = FakeProvider.last!;

		await registry.start('telecmiCalls', true, SDK);
		await settle();

		expect(running.destroy).not.toHaveBeenCalled();
		expect(api.fetchStatus).toHaveBeenCalledTimes(1);
	});

	it('still lets the Softphone mounted last win when it names a different connection', async () => {
		telecmiProvisioned();
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, SDK);
		await settle();
		const running = FakeProvider.last!;

		provisioned();
		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(running.destroy).toHaveBeenCalled();
		expect(api.fetchToken).toHaveBeenLastCalledWith('exotelConnection');
	});

	it('restarts for a Softphone with no connection when the running one is not provisioned', async () => {
		api.fetchStatus.mockResolvedValue({ provisioned: false, connectionName: 'someOtherCalls' });
		const registry = loadRegistry();

		await registry.start('someOtherCalls', true, SDK);
		await settle();

		// Not provisioned on that one says nothing about the agent's own, which may be elsewhere.
		telecmiProvisioned();
		await registry.start(undefined, true, SDK);
		await settle();

		expect(api.fetchStatus).toHaveBeenCalledTimes(2);
		expect(FakeProvider.last).toBeDefined();
	});

	it("ignores a change of the component's library URL that the connection's own library overrides", async () => {
		telecmiProvisioned({ sdkUrl: 'api/connection/piopiy.min.js' });
		const registry = loadRegistry();

		await registry.start('telecmiCalls', true, 'api/page/one.js');
		await settle();
		const running = FakeProvider.last!;

		await registry.start('telecmiCalls', true, 'api/page/two.js');
		await settle();

		expect(running.destroy).not.toHaveBeenCalled();
	});

	it('does nothing at all in the page editor', async () => {
		provisioned();
		(globalThis as { isDesignMode?: boolean }).isDesignMode = true;
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(api.fetchStatus).not.toHaveBeenCalled();
		expect(FakeProvider.last).toBeUndefined();

		// A no-op facade rather than undefined, so a Call button dropped on the canvas does
		// nothing quietly instead of erroring at the designer - and never rings a customer.
		const phone = registry.current();
		expect(phone).toBeDefined();
		await expect(phone?.dial('501')).resolves.toBeUndefined();
		expect(api.dialTicket).not.toHaveBeenCalled();
	});

	it('is guarded by isDesignMode before the editor announces its type', async () => {
		provisioned();
		// `designMode` arrives asynchronously from the editor; `isDesignMode` is set at boot. A
		// guard on the former alone would register a real SIP session in this window.
		(globalThis as { isDesignMode?: boolean }).isDesignMode = true;
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(api.fetchStatus).not.toHaveBeenCalled();
	});

	it('puts the phone down when the user logs out', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last;
		expect(provider).toBeDefined();

		// What Logout.ts does: clear Store.auth. It cannot reach a module singleton, so without
		// the registry's own listener the browser stays registered as the agent who just left and
		// their calls ring on a login screen.
		authValue = undefined;
		authListener?.();

		expect(provider?.destroy).toHaveBeenCalled();
		expect(registry.getState().provisioned).toBe(false);
		expect(registry.current()).toBeUndefined();
	});

	it('dials by ticket and never by number', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123', callStatus: 'ORIGINATE' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		await registry.current()?.dial('501');

		expect(api.dialTicket).toHaveBeenCalledWith('501', 'exotelConnection');
		expect(registry.getState().direction).toBe('outbound');
	});

	it('reports a failed dial rather than leaving the agent waiting', async () => {
		provisioned();
		api.dialTicket.mockRejectedValue(new Error('No number on this deal.'));
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		await expect(registry.current()?.dial('501')).rejects.toMatchObject({
			code: 'DIAL_REJECTED',
		});
		expect(registry.getState().lastError).toMatchObject({ code: 'DIAL_REJECTED' });
	});

	it('gives up leadership when it cannot bring the phone up', async () => {
		provisioned();
		FakeProvider.initFailure = { code: 'INIT_FAILED', message: 'The SIP stack did not start.' };
		const restoreLocks = installLockManager();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();
		await settle();
		restoreLocks();

		// A leader with no phone is not a leader: the other tabs keep relaying their controls to
		// it, so its failure to register becomes a failure to call anywhere. Standing down is what
		// lets a tab that can register take the lock instead.
		expect(registry.getState()).toMatchObject({
			isLeader: false,
			lastError: { code: 'INIT_FAILED' },
		});
		expect(FakeProvider.last!.destroy).toHaveBeenCalled();
	});

	it('surfaces a refused microphone as its own answer', async () => {
		provisioned();
		FakeProvider.initFailure = { code: 'MIC_DENIED', message: 'Microphone access is blocked.' };
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		// Sticky, because "you blocked the microphone once and Chrome remembered" needs saying
		// every time, not only on the attempt that first hit it.
		expect(registry.getState()).toMatchObject({
			micDenied: true,
			lastError: { code: 'MIC_DENIED' },
		});
	});

	it('tracks a call through its events', async () => {
		provisioned();
		const registry = loadRegistry();
		const seen: SoftphoneState[] = [];
		registry.subscribe(s => seen.push(s));

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'REGISTRATION', registered: true });
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });

		expect(registry.getState()).toMatchObject({
			registered: true,
			inCall: true,
			callId: 'c1',
			direction: 'inbound',
			from: '+919876543210',
		});

		provider.emit({ type: 'CONNECTED', callId: 'c1', startedAt: '2026-09-04T10:00:00.000Z' });
		expect(registry.getState().startedAt).toBe('2026-09-04T10:00:00.000Z');

		provider.emit({ type: 'MUTE', muted: true });
		expect(registry.getState().isMuted).toBe(true);

		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'normal' });
		expect(registry.getState()).toMatchObject({
			inCall: false,
			callId: undefined,
			from: undefined,
			isMuted: false,
			startedAt: undefined,
		});

		expect(seen.length).toBeGreaterThan(1);
	});

	it('answers the agent leg of a call the agent placed, so dialling is one click', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		await registry.current()?.dial('501');

		// The provider rings the customer and pushes a SIP INVITE to the agent's browser, which the
		// SDK reports as an ordinary incoming call. Without auto-answer the agent is asked to
		// answer the call they just asked for.
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });

		expect(provider.answer).toHaveBeenCalledTimes(1);
		expect(registry.getState()).toMatchObject({ direction: 'outbound', inCall: true });
	});

	it('ignores a CONNECTED that arrives after the call it belongs to has ended', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });
		provider.emit({ type: 'CONNECTED', callId: 'c1', startedAt: '2026-09-04T10:00:00.000Z' });
		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'completed' });

		// Every event arrives twice and in no promised order, so the duplicate CONNECTED can land
		// after the call is over. Trusting it puts the agent back in a call that has ended: the
		// card stays up, the timer keeps counting, and Hangup has nothing to hang up.
		provider.emit({ type: 'CONNECTED', callId: 'c1', startedAt: '2026-09-04T10:00:00.000Z' });

		expect(registry.getState()).toMatchObject({ inCall: false, callId: undefined });
	});

	it('claims the call before the dial request, not after it', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		// The INVITE travels over a socket that is already open, so it can land before the dial's
		// own HTTP response gets back. Claiming after the await leaves that gap, and a call that
		// falls into it is treated as a stranger ringing in.
		api.dialTicket.mockImplementation(async () => {
			provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });
			return { code: 'abc123' };
		});

		await registry.current()?.dial('501');

		expect(provider.answer).toHaveBeenCalledTimes(1);
		expect(registry.getState()).toMatchObject({ direction: 'outbound', inCall: true });
	});

	it('drops the claim when the dial fails, so the next inbound call still rings', async () => {
		provisioned();
		api.dialTicket.mockRejectedValue(new Error('no credit'));
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		await expect(registry.current()?.dial('501')).rejects.toMatchObject({
			code: 'DIAL_REJECTED',
		});

		// Claiming early means a failed dial has to give the claim back. Otherwise a customer who
		// rings in during the claim window is answered without the agent touching anything.
		provider.emit({ type: 'INCOMING', callId: 'c9', from: '+919876543210' });

		expect(provider.answer).not.toHaveBeenCalled();
		expect(registry.getState()).toMatchObject({ direction: 'inbound', inCall: true });
	});

	it('tells the other tabs about a dial, so the leader can answer its leg', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;

		// A second tab, driven through the real channel rather than a stub: only the leader ever
		// sees the INVITE, so a dial from anywhere else has to reach it over the channel. Without
		// that, the agent's own call was labelled inbound and they answered their own dial by hand.
		const announced: string[] = [];
		const otherTab = new LeaderChannel();
		channels.push(otherTab);
		otherTab.start({
			onBecameLeader: () => {},
			onEvent: () => {},
			onStateRequest: () => registry.getState(),
			onAction: async () => true,
			onSnapshot: () => {},
			onOutboundPlaced: ticketId => announced.push(ticketId),
			onOutboundFailed: () => {},
			onLeaderStale: () => {},
		});
		// Driven through dial(), not by calling announce directly - otherwise this would pass with
		// the announce removed and prove only that the receiving half works.
		await registry.current()?.dial('777');
		await waitFor(() => announced.length > 0);

		expect(announced).toEqual(['777']);

		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+91000' });
		expect(provider.answer).toHaveBeenCalledTimes(1);

		provider.emit({ type: 'ENDED', callId: 'c1' });
		expect(registry.getState().lastCall).toMatchObject({ ticketId: '777' });
	});

	it('does not answer a genuine inbound call', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919876543210' });

		expect(provider.answer).not.toHaveBeenCalled();
		expect(registry.getState()).toMatchObject({ direction: 'inbound', from: '+919876543210' });
	});

	it('claims only one leg per dial', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		await registry.current()?.dial('501');

		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+91000' });
		provider.emit({ type: 'ENDED', callId: 'c1' });

		// A customer calling back inside the same 20-second window must not be picked up on the
		// agent's behalf just because they dialled recently.
		provider.emit({ type: 'INCOMING', callId: 'c2', from: '+919876543210' });

		expect(provider.answer).toHaveBeenCalledTimes(1);
		expect(registry.getState()).toMatchObject({ direction: 'inbound', from: '+919876543210' });
	});

	it('survives an auto-answer that throws, because it runs inside the SDK callback', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.answer.mockImplementation(() => {
			throw { code: 'NO_ACTIVE_CALL', message: 'There is no call in progress.' };
		});
		const logged = jest.spyOn(console, 'error').mockImplementation(() => {});

		await registry.current()?.dial('501');

		expect(() =>
			provider.emit({ type: 'INCOMING', callId: 'c1', from: '+91000' }),
		).not.toThrow();
		expect(logged).toHaveBeenCalled();
		expect(registry.getState().inCall).toBe(true);

		logged.mockRestore();
	});

	it('summarises an answered inbound call as it ends', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919000000001' });
		provider.emit({
			type: 'CONNECTED',
			callId: 'c1',
			startedAt: new Date(Date.now() - 15_000).toISOString(),
		});
		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'normal' });

		expect(registry.getState().lastCall).toMatchObject({
			callId: 'c1',
			direction: 'inbound',
			phoneNumber: '+919000000001',
			agent: 'agent@example.com',
			answered: true,
			endReason: 'normal',
		});
		// Snapshotted at the moment it ended, not measured when a card is drawn.
		expect(registry.getState().lastCall?.durationSeconds).toBeGreaterThanOrEqual(14);
		expect(registry.getState().lastCall?.durationSeconds).toBeLessThanOrEqual(17);
	});

	it('summarises a call that was never answered', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'INCOMING', callId: 'c2', from: '+919000000001' });
		provider.emit({ type: 'ENDED', callId: 'c2', reason: 'cancelled' });

		expect(registry.getState().lastCall).toMatchObject({
			answered: false,
			durationSeconds: 0,
			phoneNumber: '+919000000001',
		});
		expect(registry.getState().lastCall?.startedAt).toBeUndefined();
	});

	it('names the deal on an outbound call, and no number', async () => {
		provisioned();
		api.dialTicket.mockResolvedValue({ code: 'abc123' });
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		await registry.current()?.dial('501');
		provider.emit({ type: 'INCOMING', callId: 'c3', from: '+91000' });
		provider.emit({ type: 'ENDED', callId: 'c3' });

		// The customer's number is read from the deal on the server and never sent to the browser,
		// so there is none to show. The deal is what a redial needs anyway.
		expect(registry.getState().lastCall).toMatchObject({
			direction: 'outbound',
			ticketId: '501',
		});
		expect(registry.getState().lastCall?.phoneNumber).toBeUndefined();
	});

	it('keeps the summary after the call state is cleared', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		provider.emit({ type: 'INCOMING', callId: 'c4', from: '+919000000001' });
		provider.emit({ type: 'ENDED', callId: 'c4' });

		const state = registry.getState();
		// The live fields go, the record stays - that is the whole point of holding it here.
		expect(state).toMatchObject({ inCall: false, callId: undefined, from: undefined });
		expect(state.lastCall?.phoneNumber).toBe('+919000000001');
	});

	it('has no summary before the first call', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		expect(registry.getState().lastCall).toBeNull();
	});

	it('survives the provider sending every call event twice', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		const startedAt = new Date(Date.now() - 30_000).toISOString();

		// This is what the bundle actually does - each event is delivered twice.
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919000000001' });
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919000000001' });
		provider.emit({ type: 'CONNECTED', callId: 'c1', startedAt });
		provider.emit({ type: 'CONNECTED', callId: 'c1', startedAt: new Date().toISOString() });

		// The second CONNECTED carries a later timestamp; taking it would restart the agent's
		// timer mid-conversation.
		expect(registry.getState().startedAt).toBe(startedAt);

		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'normal' });
		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'normal' });

		// The regression this guards: the second ENDED re-summarised after the fields were
		// cleared, overwriting a good record with one that had no direction, no number, and
		// reported every call as unanswered and zero-length.
		const lastCall = registry.getState().lastCall;
		expect(lastCall).toMatchObject({
			direction: 'inbound',
			phoneNumber: '+919000000001',
			answered: true,
		});
		expect(lastCall?.durationSeconds).toBeGreaterThanOrEqual(29);
	});

	it('keeps the live timer when INCOMING repeats after the call connected', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		const provider = FakeProvider.last!;
		const startedAt = new Date(Date.now() - 10_000).toISOString();

		provider.emit({ type: 'INCOMING', callId: 'c9', from: '+91000' });
		provider.emit({ type: 'CONNECTED', callId: 'c9', startedAt });
		provider.emit({ type: 'INCOMING', callId: 'c9', from: '+91000' });

		expect(registry.getState().startedAt).toBe(startedAt);
		expect(registry.getState().inCall).toBe(true);
	});

	it('reports an unimplemented control as an error, not a success', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		// What a newer follower relaying to an older leader looks like. `control` reads any result
		// other than false as success, so falling through would have told the page it worked.
		const relay = (registry as unknown as { performLocally(a: string): Promise<unknown> })
			.performLocally;
		await expect(relay.call(registry, 'transferCall' as never)).rejects.toMatchObject({
			code: 'UNSUPPORTED_CONTROL',
		});
	});

	it('does not write a duration into the store', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection', true, SDK);
		await settle();

		FakeProvider.last!.emit({
			type: 'CONNECTED',
			callId: 'c1',
			startedAt: new Date().toISOString(),
		});

		// A ticking counter here would be a store write every second, and store writes fan out to
		// everything bound to `Store.softphone`. The clock ticks in the component that shows it.
		expect(registry.getState()).not.toHaveProperty('durationSeconds');
		expect(registry.getState().startedAt).toBeDefined();
	});
});
