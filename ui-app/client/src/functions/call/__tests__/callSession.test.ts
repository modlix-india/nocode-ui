/**
 * UIEngine.Call.* with a fake provider: Connect, an incoming call ringing, Answer, Mute,
 * Hangup, Disconnect, the error paths, and the state written to the statePath each time.
 */
import { FunctionExecutionParameters } from '@fincity/kirun-js';

const writes: Array<{ path: string; value: any; page: string }> = [];
jest.mock('../../../context/StoreContext', () => ({
	setData: (path: string, value: any, page: string) => writes.push({ path, value, page }),
}));

import { Alert, Answer, Connect, Disconnect, Hangup, Hold, Mute, Sound, View } from '..';
import { registerCallProvider, unregisterCallProvider } from '../registry';
import * as session from '../session';
import { CallAdapter, CallStateListener } from '../types';
import { UIFunctionRepository } from '../..';

class FakeAdapter implements CallAdapter {
	listener: CallStateListener = () => {};
	credentials: any;
	finishRegister!: () => void;
	failRegister!: (e: Error) => void;
	load = jest.fn(async () => {});
	answer = jest.fn();
	hangup = jest.fn();
	mute = jest.fn();
	hold = jest.fn();
	disconnect = jest.fn();
	register = jest.fn(
		(credentials: any) =>
			new Promise<void>((resolve, reject) => {
				this.credentials = credentials;
				this.finishRegister = resolve;
				this.failRegister = reject;
			}),
	);
	onStateChange(l: CallStateListener) {
		this.listener = l;
	}
	emit(patch: any) {
		this.listener(patch);
	}
}

let adapter: FakeAdapter;
let adapters: FakeAdapter[];

function context(args: Record<string, any>, pageName = 'callPage') {
	return {
		getArguments: () => new Map(Object.entries(args)),
		getValuesMap: () => new Map([['Page.', { getPageName: () => pageName }]]),
	} as unknown as FunctionExecutionParameters;
}

async function exec(fn: any, args: Record<string, any> = {}) {
	const out = await fn.internalExecute(context(args));
	const er = out.allResults()[0];
	return { event: er.getName(), result: Object.fromEntries(er.getResult()) as any };
}

const lastState = () => writes[writes.length - 1].value;

/** Lets Connect run up to the adapter's register (it may disconnect an older one first). */
async function registerCalled() {
	for (let i = 0; i < 50 && !adapter?.register.mock.calls.length; i++) await Promise.resolve();
}

async function connected() {
	adapter = undefined as unknown as FakeAdapter;
	const p = exec(new Connect(), {
		provider: 'fake',
		credentials: { user: 'agent1', password: 'pw-123' },
		statePath: 'Store.call',
	});
	await registerCalled();
	adapter.finishRegister();
	return p;
}

beforeEach(async () => {
	await session.disconnect();
	writes.length = 0;
	adapters = [];
	registerCallProvider('fake', () => {
		adapter = new FakeAdapter();
		adapters.push(adapter);
		return adapter;
	});
});

afterAll(() => unregisterCallProvider('fake'));

describe('function repository', () => {
	test('the call functions resolve under UIEngine.Call, the old ones under UIEngine', async () => {
		const repo = new UIFunctionRepository();
		for (const name of [
			'Connect',
			'Answer',
			'Hangup',
			'Mute',
			'Hold',
			'View',
			'Disconnect',
			'Sound',
			'Alert',
		]) {
			const fn = await repo.find('UIEngine.Call', name);
			expect(fn?.getSignature().getFullName()).toBe(`UIEngine.Call.${name}`);
		}
		expect((await repo.find('UIEngine', 'SetStore'))?.getSignature().getName()).toBe(
			'SetStore',
		);
		expect(await repo.find('UIEngine', 'Connect')).toBeUndefined();
	});

	test('every call function has a description', () => {
		for (const F of [Connect, Answer, Hangup, Mute, Hold, View, Disconnect, Sound, Alert]) {
			expect(new F().getSignature().getDescription()?.length).toBeGreaterThan(20);
		}
	});
});

describe('UIEngine.Call', () => {
	test('Connect writes registering, then ready; credentials never reach the state', async () => {
		const { event, result } = await connected();
		expect(event).toBe('output');
		expect(result.state).toEqual({
			status: 'ready',
			muted: false,
			error: undefined,
			soundOn: true,
			audioBlocked: false,
			alertsOffer: false,
			collapsed: false,
		});
		expect(adapter.load).toHaveBeenCalled();
		expect(adapter.credentials).toEqual({ user: 'agent1', password: 'pw-123' });
		expect(writes.map(w => w.value.status)).toEqual(['registering', 'ready']);
		expect(writes.every(w => w.path === 'Store.call' && w.page === 'callPage')).toBe(true);
		expect(JSON.stringify(writes)).not.toContain('pw-123');
	});

	test('incoming call: ringing, Answer, connected, Mute, Hangup', async () => {
		await connected();
		jest.spyOn(Date, 'now').mockReturnValue(5000);

		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+9198' });
		expect(lastState()).toEqual({
			status: 'ringing',
			direction: 'inbound',
			callId: 'c1',
			from: '+9198',
			to: undefined,
			ringAt: expect.any(Number),
			muted: false,
			soundOn: true,
			audioBlocked: false,
			alertsOffer: false,
			collapsed: false,
		});

		let r = await exec(new Answer(), { callId: 'c1' });
		expect(r.event).toBe('output');
		expect(adapter.answer).toHaveBeenCalledWith('c1');

		adapter.emit({ status: 'connected' });
		expect(lastState()).toMatchObject({ status: 'connected', callId: 'c1', startedAt: 5000 });

		r = await exec(new Mute(), { on: true });
		expect(adapter.mute).toHaveBeenCalledWith(true);
		expect(lastState().muted).toBe(true);
		r = await exec(new Mute(), { on: false });
		expect(lastState().muted).toBe(false);

		r = await exec(new Hangup(), {});
		expect(adapter.hangup).toHaveBeenCalledWith('c1');
		expect(r.result.state).toMatchObject({ status: 'ended', callId: 'c1', startedAt: 5000 });
		(Date.now as jest.Mock).mockRestore();
	});

	test('a new call after the last one starts clean', async () => {
		await connected();
		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: 'a' });
		adapter.emit({ status: 'connected' });
		await exec(new Mute(), { on: true });
		adapter.emit({ status: 'ended' });
		expect(lastState()).toMatchObject({ status: 'ended', muted: false });

		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c2', from: 'b' });
		expect(lastState()).toEqual({
			status: 'ringing',
			direction: 'inbound',
			callId: 'c2',
			from: 'b',
			to: undefined,
			ringAt: expect.any(Number),
			muted: false,
			soundOn: true,
			audioBlocked: false,
			alertsOffer: false,
			collapsed: false,
		});
	});

	test('error paths return the error event and leave the call alone', async () => {
		let r = await exec(new Answer());
		expect(r).toMatchObject({
			event: 'error',
			result: { error: expect.stringMatching(/Connect/) },
		});

		await connected();
		r = await exec(new Answer());
		expect(r.result.error).toBe('No incoming call to answer.');
		r = await exec(new Hangup());
		expect(r.result.error).toBe('No call to hang up.');
		r = await exec(new Mute(), { on: true });
		expect(r.result.error).toBe('No connected call to mute.');

		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		r = await exec(new Answer(), { callId: 'other' });
		expect(r.result.error).toBe('No call with id other.');

		adapter.answer.mockImplementationOnce(() => {
			throw new Error('sdk refused');
		});
		r = await exec(new Answer());
		expect(r.event).toBe('error');
		expect(r.result.state).toMatchObject({ status: 'ringing', error: 'sdk refused' });
		expect(adapter.answer).toHaveBeenCalledTimes(1);
	});

	test('Answer asks for the microphone first; a blocked microphone stops it before the SDK answers', async () => {
		const stop = jest.fn();
		const getUserMedia = jest.fn().mockResolvedValue({ getTracks: () => [{ stop }] });
		Object.defineProperty(navigator, 'mediaDevices', {
			value: { getUserMedia },
			configurable: true,
		});
		try {
			await connected();
			adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			let r = await exec(new Answer());
			expect(r.event).toBe('output');
			expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
			expect(stop).toHaveBeenCalled();
			expect(adapter.answer).toHaveBeenCalledTimes(1);

			adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c2' });
			getUserMedia.mockRejectedValueOnce(
				Object.assign(new Error('denied'), { name: 'NotAllowedError' }),
			);
			r = await exec(new Answer());
			expect(r.event).toBe('error');
			expect(r.result.error).toBe('The microphone is blocked for this site');
			expect(r.result.state).toMatchObject({
				status: 'ringing',
				error: 'The microphone is blocked for this site',
			});
			expect(adapter.answer).toHaveBeenCalledTimes(1);
		} finally {
			delete (navigator as any).mediaDevices;
		}
	});

	test('Connect: unknown provider, missing statePath or credentials', async () => {
		let r = await exec(new Connect(), {
			provider: 'nope',
			credentials: {},
			statePath: 'Store.call',
		});
		expect(r.result.error).toBe('Unknown call provider "nope".');
		r = await exec(new Connect(), { provider: 'fake', credentials: {}, statePath: '' });
		expect(r.result.error).toBe('statePath is required.');
		r = await exec(new Connect(), {
			provider: 'fake',
			credentials: null,
			statePath: 'Store.call',
		});
		expect(r.result.error).toBe('credentials or credentialsFunction is required.');
		expect(writes).toEqual([]);
	});

	test('Connect: a failed sign in writes error and releases the adapter', async () => {
		adapter = undefined as unknown as FakeAdapter;
		const p = exec(new Connect(), {
			provider: 'FAKE',
			credentials: {},
			statePath: 'Store.call',
		});
		await registerCalled();
		adapter.failRegister(new Error('bad password'));
		const r = await p;
		expect(r.event).toBe('error');
		expect(r.result.error).toBe('bad password');
		expect(lastState()).toEqual({
			status: 'error',
			muted: false,
			error: 'bad password',
			soundOn: true,
			audioBlocked: false,
			alertsOffer: false,
			collapsed: false,
		});
		expect(adapter.disconnect).toHaveBeenCalled();
		expect(session.activeCallState()).toBeUndefined();
	});

	test('Connect: a sign in the provider never confirms times out', async () => {
		jest.useFakeTimers();
		try {
			const p = exec(new Connect(), {
				provider: 'fake',
				credentials: {},
				statePath: 'Store.call',
			});
			await jest.advanceTimersByTimeAsync(session.REGISTER_TIMEOUT_MS + 1);
			const r = await p;
			expect(r.result.error).toBe('The call provider did not confirm the sign in.');
			expect(lastState().status).toBe('error');
		} finally {
			jest.useRealTimers();
		}
	});

	test('a second Connect replaces the first, but not during a call', async () => {
		await connected();
		const first = adapter;
		first.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		let r = await exec(new Connect(), {
			provider: 'fake',
			credentials: {},
			statePath: 'Store.call',
		});
		expect(r.result.error).toBe('A call is in progress. Hang up before connecting again.');

		first.emit({ status: 'ended' });
		// The same phone again keeps its sign in (LZT-2158).
		r = await exec(new Connect(), {
			provider: 'fake',
			credentials: { password: 'pw-123', user: 'agent1' },
			statePath: 'Store.call',
		});
		expect(r.event).toBe('output');
		expect(adapters).toHaveLength(1);
		expect(first.disconnect).not.toHaveBeenCalled();

		// Another phone replaces it.
		adapter = undefined as unknown as FakeAdapter;
		const p = exec(new Connect(), {
			provider: 'fake',
			credentials: { user: 'agent2', password: 'pw-456' },
			statePath: 'Store.call',
		});
		await registerCalled();
		adapter.finishRegister();
		await p;
		expect(adapters).toHaveLength(2);
		expect(first.disconnect).toHaveBeenCalled();

		// The replaced adapter's late events are ignored.
		const before = writes.length;
		first.emit({ status: 'ringing', callId: 'ghost' });
		expect(writes.length).toBe(before);
	});

	test('Disconnect signs out and writes idle; twice is harmless', async () => {
		await connected();
		let r = await exec(new Disconnect());
		expect(r.event).toBe('output');
		expect(adapter.disconnect).toHaveBeenCalled();
		expect(lastState()).toEqual({ status: 'idle', muted: false });
		r = await exec(new Disconnect());
		expect(r.result.state).toEqual({ status: 'idle', muted: false });
		r = await exec(new Hangup());
		expect(r.event).toBe('error');
	});

	test('a provider reporting an error mid session lands in the state', async () => {
		await connected();
		adapter.emit({ status: 'error', error: 'signed in elsewhere' });
		expect(lastState()).toMatchObject({ status: 'error', error: 'signed in elsewhere' });
	});
});

describe('UIEngine.Call.Hold and UIEngine.Call.View', () => {
	afterEach(() => localStorage.clear());

	test('Hold puts the connected call on hold and off; the end of the call clears it', async () => {
		await connected();
		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+9198' });
		adapter.emit({ status: 'connected' });

		let r = await exec(new Hold(), { on: true });
		expect(r.event).toBe('output');
		expect(adapter.hold).toHaveBeenCalledWith(true);
		expect(lastState().held).toBe(true);

		r = await exec(new Hold(), { on: false });
		expect(adapter.hold).toHaveBeenLastCalledWith(false);
		expect(lastState().held).toBe(false);

		await exec(new Hold(), {});
		expect(lastState().held).toBe(true);
		adapter.emit({ status: 'ended' });
		expect(lastState()).toMatchObject({ status: 'ended', held: false });
	});

	test('Hold needs a connected call and a provider that can hold', async () => {
		await connected();
		let r = await exec(new Hold(), { on: true });
		expect(r.event).toBe('error');
		expect(r.result.error).toMatch(/No connected call/);

		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		adapter.emit({ status: 'connected' });
		(adapter as any).hold = undefined;
		r = await exec(new Hold(), { on: true });
		expect(r.event).toBe('error');
		expect(r.result.error).toMatch(/cannot hold/);
		expect(lastState().held).toBeFalsy();
	});

	test('a provider refusing to hold leaves the call as it was', async () => {
		await connected();
		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		adapter.emit({ status: 'connected' });
		adapter.hold.mockImplementation(() => {
			throw new Error('re-invite rejected');
		});
		await exec(new Hold(), { on: true });
		expect(lastState().held).toBeFalsy();
	});

	test('View collapses the bar, is remembered, and a new connection starts collapsed', async () => {
		await connected();
		expect(lastState().collapsed).toBe(false);

		let r = await exec(new View(), { collapsed: true });
		expect(r.event).toBe('output');
		expect(lastState().collapsed).toBe(true);

		await session.disconnect();
		await connected();
		expect(lastState().collapsed).toBe(true);

		r = await exec(new View(), { collapsed: false });
		expect(lastState().collapsed).toBe(false);
		r = await exec(new View(), {});
		expect(r.result.state.collapsed).toBe(false);
	});

	test('View keeps the choice through a call and after it', async () => {
		await connected();
		await exec(new View(), { collapsed: true });
		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		expect(lastState()).toMatchObject({ status: 'ringing', collapsed: true });
		adapter.emit({ status: 'connected' });
		adapter.emit({ status: 'ended' });
		expect(lastState()).toMatchObject({ status: 'ended', collapsed: true });
	});

	test('View without a connection only remembers the choice', async () => {
		const r = await exec(new View(), { collapsed: true });
		expect(r.event).toBe('output');
		expect(r.result.state.collapsed).toBe(true);
		expect(writes.length).toBe(0);
	});
});
