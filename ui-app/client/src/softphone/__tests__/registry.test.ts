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

	init = jest.fn(async (config: ProviderInit) => {
		this.initConfig = config;
		if (FakeProvider.initFailure) throw FakeProvider.initFailure;
	});
	register = jest.fn();
	unregister = jest.fn();
	answer = jest.fn();
	hangup = jest.fn();
	toggleHold = jest.fn();
	toggleMute = jest.fn();
	sendDtmf = jest.fn();
	destroy = jest.fn();

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
}

jest.mock('../api', () => api);
jest.mock('../providers/exotel', () => ({
	ExotelCallProvider: jest.fn(() => new FakeProvider()),
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
		request: (name: string, callback: () => Promise<void>) => {
			if (!held.has(name)) return grant(name, callback);
			return new Promise<void>((resolve, reject) => {
				const waiters = queued.get(name) ?? [];
				waiters.push(() => grant(name, callback).then(resolve, reject));
				queued.set(name, waiters);
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
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919701191800' });
		provider.emit({
			type: 'CONNECTED',
			callId: 'c1',
			startedAt: new Date(Date.now() - 15_000).toISOString(),
		});
		provider.emit({ type: 'ENDED', callId: 'c1', reason: 'normal' });

		expect(registry.getState().lastCall).toMatchObject({
			callId: 'c1',
			direction: 'inbound',
			phoneNumber: '+919701191800',
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
		provider.emit({ type: 'INCOMING', callId: 'c2', from: '+919701191800' });
		provider.emit({ type: 'ENDED', callId: 'c2', reason: 'cancelled' });

		expect(registry.getState().lastCall).toMatchObject({
			answered: false,
			durationSeconds: 0,
			phoneNumber: '+919701191800',
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
		provider.emit({ type: 'INCOMING', callId: 'c4', from: '+919701191800' });
		provider.emit({ type: 'ENDED', callId: 'c4' });

		const state = registry.getState();
		// The live fields go, the record stays - that is the whole point of holding it here.
		expect(state).toMatchObject({ inCall: false, callId: undefined, from: undefined });
		expect(state.lastCall?.phoneNumber).toBe('+919701191800');
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
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919701191800' });
		provider.emit({ type: 'INCOMING', callId: 'c1', from: '+919701191800' });
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
			phoneNumber: '+919701191800',
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
