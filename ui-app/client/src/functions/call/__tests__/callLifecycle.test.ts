/**
 * The call session's life cycle around the phone (LZT-2157): signing out always signs the phone
 * out (LZT-2163), the credential comes from a server function and never reaches the page
 * (LZT-2162), the editor canvas never signs in (LZT-2164), the robustness rules (LZT-2167) and
 * the keypad and away controls (LZT-2166). A fake provider, a fake sign in and a fake server.
 */
import { FunctionExecutionParameters } from '@fincity/kirun-js';

const writes: Array<{ path: string; value: any; page: string }> = [];
let failWrites = 0;
jest.mock('../../../context/StoreContext', () => ({
	setData: (path: string, value: any, page: string) => {
		if (failWrites > 0) {
			failWrites--;
			throw new Error('a page listener broke');
		}
		writes.push({ path, value, page });
	},
}));

import { Availability, Connect, SendDTMF } from '..';
import { UIFunctionRepository } from '../..';
import { AuthWatch, setAuthWatch } from '../auth';
import {
	CredentialError,
	functionOutput,
	setCredentialFetcher,
	toCredentials,
} from '../credentials';
import { registerCallProvider, unregisterCallProvider } from '../registry';
import * as session from '../session';
import { setTabSync } from '../tabs';
import { CallAdapter, CallStateListener } from '../types';

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
	sendDtmf = jest.fn();
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

class FakeAuth implements AuthWatch {
	id = 'u1';
	private cbs: Array<(elsewhere: boolean) => void> = [];
	user() {
		return this.id;
	}
	watch(cb: (elsewhere: boolean) => void) {
		this.cbs.push(cb);
		return () => undefined;
	}
	change(id: string) {
		this.id = id;
		this.cbs.forEach(c => c(false));
	}
	signedOutElsewhere() {
		this.cbs.forEach(c => c(true));
	}
}

const auth = new FakeAuth();
let adapters: FakeAdapter[];
let factoryGate: Promise<void> | undefined;
const fetches: Array<{ fn: string; args: any }> = [];
let answers: Array<() => Promise<any>>;

const SECRET = 'sip-secret-42';

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

const flush = async () => {
	for (let i = 0; i < 30; i++) await Promise.resolve();
};

const last = () => adapters[adapters.length - 1];
const lastState = () => writes[writes.length - 1]?.value;

/** Connect through the server function; resolves once the provider confirms. */
async function connectFetched(args: Record<string, any> = {}) {
	const p = exec(new Connect(), {
		provider: 'fake',
		statePath: 'Store.call',
		credentialsFunction: 'LeadZumpV2.callAgentCredential',
		credentialsArgs: args,
	});
	for (let i = 0; i < 50 && !last()?.register.mock.calls.length; i++) await Promise.resolve();
	last()?.finishRegister();
	return p;
}

beforeAll(() => setAuthWatch(auth));
afterAll(() => {
	setAuthWatch(undefined);
	setCredentialFetcher(undefined);
	unregisterCallProvider('fake');
});

beforeEach(async () => {
	delete (globalThis as any).isDesignMode;
	delete (globalThis as any).designMode;
	setTabSync(null);
	await session.disconnect();
	try {
		localStorage.clear();
	} catch {
		// No storage in this environment.
	}
	auth.id = 'u1';
	writes.length = 0;
	failWrites = 0;
	adapters = [];
	factoryGate = undefined;
	fetches.length = 0;
	answers = [];
	registerCallProvider('fake', async () => {
		if (factoryGate) await factoryGate;
		const a = new FakeAdapter();
		adapters.push(a);
		return a;
	});
	setCredentialFetcher(async (fn, args) => {
		fetches.push({ fn, args });
		const next = answers.shift();
		if (next) return next();
		return {
			enabled: true,
			provider: 'telecmi',
			credential: SECRET,
			providerUserId: '1001_7',
			region: '',
		};
	});
});

describe('LZT-2163: signing out always signs the phone out', () => {
	test('a sign out in this tab disconnects and writes idle', async () => {
		await connectFetched();
		const a = last();
		auth.change('');
		await flush();
		expect(a.disconnect).toHaveBeenCalledTimes(1);
		expect(lastState()).toEqual({ status: 'idle', muted: false });
		expect(session.activeCallState()).toBeUndefined();
	});

	test('a sign out in another tab of the site disconnects too', async () => {
		await connectFetched();
		auth.signedOutElsewhere();
		await flush();
		expect(last().disconnect).toHaveBeenCalledTimes(1);
		expect(session.activeCallState()).toBeUndefined();
	});

	test('another user signing in disconnects; the same user again does not', async () => {
		await connectFetched();
		auth.change('u1');
		await flush();
		expect(last().disconnect).not.toHaveBeenCalled();
		auth.change('u2');
		await flush();
		expect(last().disconnect).toHaveBeenCalledTimes(1);
	});

	test('a sign out while the phone is registering signs it out', async () => {
		const p = exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		for (let i = 0; i < 50 && !last()?.register.mock.calls.length; i++) await Promise.resolve();
		const a = last();
		auth.change('');
		await flush();
		expect(a.disconnect).toHaveBeenCalledTimes(1);
		a.failRegister(new Error('Disconnected before sign in finished.'));
		const r = await p;
		expect(r.event).toBe('error');
		expect(lastState()).toEqual({ status: 'idle', muted: false });
	});

	test('a sign out before the provider SDK even loaded: the phone made later is let go, never registered', async () => {
		let open!: () => void;
		factoryGate = new Promise<void>(r => (open = r));
		const p = exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		await flush();
		expect(adapters).toHaveLength(0);
		auth.change('');
		await flush();
		open();
		const r = await p;
		expect(r.event).toBe('error');
		expect(adapters).toHaveLength(1);
		expect(adapters[0].register).not.toHaveBeenCalled();
		expect(adapters[0].disconnect).toHaveBeenCalledTimes(1);
		expect(lastState()).toEqual({ status: 'idle', muted: false });
	});

	test('a sign out while the credential is being fetched: no phone is made', async () => {
		let give!: (v: any) => void;
		answers.push(() => new Promise(r => (give = r)));
		const p = exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		await flush();
		auth.change('');
		await flush();
		give({ enabled: true, credential: SECRET, providerUserId: 'x' });
		const r = await p;
		expect(r.event).toBe('error');
		expect(adapters).toHaveLength(0);
	});
});

describe('LZT-2162: the credential stays off the page', () => {
	test('Connect asks the named server function; the secret reaches only the adapter', async () => {
		const r = await connectFetched({ connectionName: 'tc1' });
		expect(r.event).toBe('output');
		expect(fetches).toEqual([
			{ fn: 'LeadZumpV2.callAgentCredential', args: { connectionName: 'tc1' } },
		]);
		expect(last().credentials).toMatchObject({ password: SECRET, userId: '1001_7' });
		expect(r.result.state.status).toBe('ready');
		expect(JSON.stringify(r.result)).not.toContain(SECRET);
		expect(JSON.stringify(writes)).not.toContain(SECRET);
		expect(JSON.stringify(session.activeCallState())).not.toContain(SECRET);
	});

	test('a remount Connect with the same function keeps the phone and asks for nothing', async () => {
		await connectFetched();
		const r = await exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		expect(r.event).toBe('output');
		expect(fetches).toHaveLength(1);
		expect(adapters).toHaveLength(1);
	});

	test('calling not turned on fails Connect without making a phone, and is not asked again', async () => {
		answers.push(async () => ({ enabled: false }));
		const r = await exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		expect(r.event).toBe('error');
		expect(r.result.error).toBe('Browser calling is not turned on for this user.');
		expect(fetches).toHaveLength(1);
		expect(adapters).toHaveLength(0);
	});

	test('a briefly unreachable server is asked again; a refusal is not', async () => {
		jest.useFakeTimers();
		try {
			answers.push(async () => {
				throw new CredentialError(
					'The calling credential could not be fetched (503).',
					false,
				);
			});
			const p = exec(new Connect(), {
				provider: 'fake',
				statePath: 'Store.call',
				credentialsFunction: 'LeadZumpV2.callAgentCredential',
			});
			await jest.advanceTimersByTimeAsync(session.CREDENTIAL_RETRY_MS + 1);
			expect(fetches).toHaveLength(2);
			last().finishRegister();
			expect((await p).event).toBe('output');
		} finally {
			jest.useRealTimers();
		}
		await session.disconnect();
		answers.push(async () => {
			throw new CredentialError('The calling credential could not be fetched (403).', true);
		});
		const r = await exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		expect(r.result.error).toBe('The calling credential could not be fetched (403).');
		expect(fetches).toHaveLength(3);
	});

	test('the server answer is read in both shapes, and an error event is a refusal', () => {
		expect(
			toCredentials(
				'telecmi',
				functionOutput([
					{
						name: 'output',
						result: {
							result: { enabled: true, agentId: 'a1', password: 'p', region: 'r' },
						},
					},
				]),
			),
		).toEqual({ password: 'p', userId: 'a1', region: 'r' });
		expect(
			toCredentials('telecmi', {
				enabled: true,
				credential: 'c',
				providerUserId: 'u',
				expiresIn: 0,
			}),
		).toEqual({ password: 'c', userId: 'u' });
		expect(() => toCredentials('telecmi', { enabled: true })).toThrow('no credential');
		expect(() => functionOutput([{ name: 'error', result: { message: 'nope' } }])).toThrow(
			'nope',
		);
	});
});

describe('LZT-2164: the editor canvas never signs a phone in', () => {
	test('isDesignMode (set at boot): Connect makes no phone and asks for nothing', async () => {
		(globalThis as any).isDesignMode = true;
		const r = await connectFetched();
		expect(r.event).toBe('output');
		expect(r.result.state).toEqual({ status: 'idle', muted: false });
		expect(adapters).toHaveLength(0);
		expect(fetches).toHaveLength(0);
		expect(writes).toEqual([]);
	});

	test('designMode (set when the editor posts its type): same, and the controls never reach a phone', async () => {
		await connectFetched();
		const a = last();
		a.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		(globalThis as any).designMode = 'PAGE';
		expect(
			(
				await exec(new Connect(), {
					provider: 'fake',
					credentials: { x: 1 },
					statePath: 'Store.call',
				})
			).event,
		).toBe('output');
		await session.answer();
		await session.hangup();
		await session.sendDtmf('1');
		await session.setAvailability(false);
		expect(a.answer).not.toHaveBeenCalled();
		expect(a.hangup).not.toHaveBeenCalled();
		expect(a.sendDtmf).not.toHaveBeenCalled();
		expect(a.disconnect).not.toHaveBeenCalled();
		expect(adapters).toHaveLength(1);
	});
});

describe('LZT-2167: robustness', () => {
	test('a duplicated provider event changes the state once', async () => {
		await connectFetched();
		writes.length = 0;
		last().emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '99' });
		last().emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '99' });
		last().emit({ status: 'connected' });
		last().emit({ status: 'connected' });
		last().emit({ error: 'call not found' });
		last().emit({ error: 'call not found' });
		expect(writes.map(w => w.value.status)).toEqual(['ringing', 'connected', 'connected']);
	});

	test('a page listener that throws inside the provider callback breaks neither the SDK nor later states', async () => {
		await connectFetched();
		const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		failWrites = 1;
		expect(() =>
			last().emit({ status: 'ringing', direction: 'inbound', callId: 'c1' }),
		).not.toThrow();
		last().emit({ status: 'connected' });
		expect(lastState().status).toBe('connected');
		spy.mockRestore();
	});
});

describe('LZT-2166: keypad and away', () => {
	test('SendDTMF sends one key on the connected call; a bad key or no call is an error', async () => {
		await connectFetched();
		let r = await exec(new SendDTMF(), { digit: '5' });
		expect(r.result.error).toBe('No connected call to send a key on.');
		last().emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		last().emit({ status: 'connected' });
		r = await exec(new SendDTMF(), { digit: '#' });
		expect(r.event).toBe('output');
		expect(last().sendDtmf).toHaveBeenCalledWith('#');
		r = await exec(new SendDTMF(), { digit: '12' });
		expect(r.event).toBe('error');
		expect(last().sendDtmf).toHaveBeenCalledTimes(1);
		last().sendDtmf.mockImplementation(() => {
			throw new Error('TeleCMI would not send that key');
		});
		r = await exec(new SendDTMF(), { digit: '1' });
		expect(r.result.error).toBe('TeleCMI would not send that key');
	});

	test('Availability away signs the phone out; available signs in again with a fresh credential', async () => {
		await connectFetched();
		const first = last();
		let r = await exec(new Availability(), { available: false });
		expect(r.event).toBe('output');
		expect(first.disconnect).toHaveBeenCalledTimes(1);
		expect(lastState()).toMatchObject({ status: 'idle', away: true });

		const p = exec(new Availability(), { available: true });
		for (let i = 0; i < 50 && adapters.length < 2; i++) await Promise.resolve();
		for (let i = 0; i < 50 && !last().register.mock.calls.length; i++) await Promise.resolve();
		last().finishRegister();
		r = await p;
		expect(r.event).toBe('output');
		expect(adapters).toHaveLength(2);
		expect(fetches).toHaveLength(2);
		expect(lastState().status).toBe('ready');
		expect(lastState().away).toBeUndefined();
		// The old phone's late events are ignored.
		first.emit({ status: 'ringing', direction: 'inbound', callId: 'old' });
		expect(lastState().status).toBe('ready');
	});

	test('away is refused during a call, and remembered for the next Connect', async () => {
		await connectFetched();
		last().emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		let r = await exec(new Availability(), { available: false });
		expect(r.result.error).toBe('Finish the call before going away.');
		last().emit({ status: 'ended' });
		r = await exec(new Availability(), { available: false });
		expect(r.event).toBe('output');
		await session.disconnect();
		const n = adapters.length;
		r = await exec(new Connect(), {
			provider: 'fake',
			statePath: 'Store.call',
			credentialsFunction: 'LeadZumpV2.callAgentCredential',
		});
		expect(r.result.state).toMatchObject({ status: 'idle', away: true });
		expect(adapters).toHaveLength(n);
	});

	test('the new functions resolve under UIEngine.Call', async () => {
		const repo = new UIFunctionRepository();
		for (const name of ['SendDTMF', 'Availability'])
			expect((await repo.find('UIEngine.Call', name))?.getSignature().getFullName()).toBe(
				`UIEngine.Call.${name}`,
			);
	});
});
