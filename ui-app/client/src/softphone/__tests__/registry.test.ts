import type { ICallProvider, ProviderInit } from '../providers/ICallProvider';
import type { SoftphoneEvent, SoftphoneState } from '../types';

/**
 * The registry's guards, rather than its happy path.
 *
 * Each of these fails silently in production if it regresses - a phone that stays registered after
 * logout, a microphone prompt shown to someone who cannot take calls, a real call placed from the
 * page editor - so each is worth a test that would notice.
 */

const { BroadcastChannel: NodeBroadcastChannel } = require('node:worker_threads');

const api = {
	fetchStatus: jest.fn(),
	fetchToken: jest.fn(),
	dialTicket: jest.fn(),
	fetchCallLog: jest.fn(),
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
		registry = require('../registry').softphoneRegistry;
	});
	loaded.push(registry);
	return registry;
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

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
		loaded.splice(0).forEach(r => r.stop());
		restoreChannel();
	});

	function provisioned() {
		api.fetchStatus.mockResolvedValue({
			provisioned: true,
			provider: 'EXOTEL',
			providerUserId: 'agent@example.com',
			virtualNumber: '+911234567890',
		});
		api.fetchToken.mockResolvedValue({
			token: 'agent-token',
			providerUserId: 'agent@example.com',
			expiresIn: 7776000,
			provider: 'EXOTEL',
		});
	}

	it('mints no token and loads no provider for an agent who is not provisioned', async () => {
		api.fetchStatus.mockResolvedValue({ provisioned: false, provider: 'EXOTEL' });
		const registry = loadRegistry();

		await registry.start('exotelConnection');
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

		await registry.start('exotelConnection');
		await settle();

		expect(api.fetchToken).toHaveBeenCalledWith('exotelConnection');
		expect(FakeProvider.last?.init).toHaveBeenCalledWith({
			token: 'agent-token',
			providerUserId: 'agent@example.com',
			autoRegister: true,
		});
		expect(registry.getState()).toMatchObject({ provisioned: true, isLeader: true });
	});

	it('does nothing at all in the page editor', async () => {
		provisioned();
		(globalThis as { isDesignMode?: boolean }).isDesignMode = true;
		const registry = loadRegistry();

		await registry.start('exotelConnection');
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

		await registry.start('exotelConnection');
		await settle();

		expect(api.fetchStatus).not.toHaveBeenCalled();
	});

	it('puts the phone down when the user logs out', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection');
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

		await registry.start('exotelConnection');
		await settle();

		await registry.current()?.dial('501');

		expect(api.dialTicket).toHaveBeenCalledWith('501', 'exotelConnection');
		expect(registry.getState().direction).toBe('outbound');
	});

	it('reports a failed dial rather than leaving the agent waiting', async () => {
		provisioned();
		api.dialTicket.mockRejectedValue(new Error('No number on this deal.'));
		const registry = loadRegistry();

		await registry.start('exotelConnection');
		await settle();

		await expect(registry.current()?.dial('501')).rejects.toMatchObject({
			code: 'DIAL_REJECTED',
		});
		expect(registry.getState().lastError).toMatchObject({ code: 'DIAL_REJECTED' });
	});

	it('surfaces a refused microphone as its own answer', async () => {
		provisioned();
		FakeProvider.initFailure = { code: 'MIC_DENIED', message: 'Microphone access is blocked.' };
		const registry = loadRegistry();

		await registry.start('exotelConnection');
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

		await registry.start('exotelConnection');
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

	it('does not write a duration into the store', async () => {
		provisioned();
		const registry = loadRegistry();

		await registry.start('exotelConnection');
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
