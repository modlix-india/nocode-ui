/**
 * LZT-2731 step 1b: a dropped transport must not flash "offline". The PIOPIY SDK sends
 * `disconnected`, `logout`, `connected`, `login` in that order and signs back in by itself, so the
 * adapter stays `registering` until `login`, and a `logout` is a sign out (idle) only when the
 * adapter asked for it or after `sbc_logout`. The SDK is replaced by a fake that fires events.
 */
import { createTelecmiAdapter } from '../telecmiAdapter';
import { CallStatePatch } from '../types';

class FakePiopiy {
	static instances: FakePiopiy[] = [];
	handlers = new Map<string, Array<(d: any) => void>>();
	login = jest.fn();
	logout = jest.fn();
	call = jest.fn();
	answer = jest.fn();
	reject = jest.fn();
	terminate = jest.fn();
	mute = jest.fn();
	unMute = jest.fn();
	hold = jest.fn();
	unHold = jest.fn();
	removeAllListeners = jest.fn(() => {
		this.handlers.clear();
	});
	constructor(public options: any) {
		FakePiopiy.instances.push(this);
	}
	on(event: string, handler: (d: any) => void) {
		this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
		return this;
	}
	fire(event: string, data?: any) {
		this.handlers.get(event)?.forEach(h => h(data));
	}
}

let patches: CallStatePatch[];

async function registered() {
	const adapter = createTelecmiAdapter({ loadSdk: async () => ({ default: FakePiopiy }) });
	adapter.onStateChange(p => patches.push(p));
	await adapter.load();
	const done = adapter.register({ userId: '1001_33', password: 'pw' });
	const sdk = FakePiopiy.instances[FakePiopiy.instances.length - 1];
	sdk.fire('login', { code: 200, status: 'Login successfully' });
	await done;
	return { adapter, sdk };
}

const statuses = () => patches.filter(p => p.status).map(p => p.status);

beforeEach(() => {
	patches = [];
	FakePiopiy.instances = [];
});

describe('LZT-2731 step 1b: a transport drop', () => {
	test('disconnected, logout, connected, login in the real order: registering throughout, ready only at login, never idle', async () => {
		const { sdk } = await registered();
		patches = [];
		sdk.fire('disconnected', { code: 1006, status: 'disconnected' });
		expect(statuses()).toEqual(['registering']);
		sdk.fire('logout', { code: 200 });
		sdk.fire('connected', {});
		// The socket is back but REGISTER has not finished: not ready yet, and never idle.
		expect(statuses()).toEqual(['registering']);
		expect(patches.some(p => p.status === 'idle')).toBe(false);
		sdk.fire('login', { code: 200, status: 'Login successfully' });
		expect(statuses()).toEqual(['registering', 'ready']);
		expect(patches[patches.length - 1]).toEqual({ status: 'ready', error: undefined });
	});

	test('the order the SDK sends logout before disconnected is also never idle', async () => {
		const { sdk } = await registered();
		patches = [];
		sdk.fire('logout', { code: 200 });
		sdk.fire('disconnected', {});
		sdk.fire('connected', {});
		expect(statuses()).toEqual(['registering']);
		sdk.fire('login', { code: 200 });
		expect(statuses()).toEqual(['registering', 'ready']);
	});

	test('connected alone does not make a registering phone ready', async () => {
		const { sdk } = await registered();
		sdk.fire('disconnected', {});
		patches = [];
		sdk.fire('connected', {});
		expect(patches).toEqual([]);
	});

	test('a call that is up through the drop stays up and comes back at login', async () => {
		const { sdk } = await registered();
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		sdk.fire('answered', { call_id: 'c1' });
		patches = [];
		sdk.fire('disconnected', {});
		sdk.fire('logout', { code: 200 });
		sdk.fire('connected', {});
		sdk.fire('login', { code: 200 });
		expect(patches).toEqual([]);
	});

	test('a logout after sbc_logout is a real sign out: idle', async () => {
		const { sdk } = await registered();
		patches = [];
		sdk.fire('sbc_logout', { code: 401, reason: 'logged in elsewhere' });
		sdk.fire('logout', { code: 200 });
		expect(patches).toEqual([
			{ status: 'error', error: 'TeleCMI signed this agent out: logged in elsewhere' },
			{ status: 'idle' },
		]);
	});

	test('a logout the adapter asked for reports nothing and ends in idle through disconnect', async () => {
		const { adapter, sdk } = await registered();
		patches = [];
		const done = adapter.disconnect();
		sdk.fire('logout', { code: 200 });
		await done;
		expect(patches).toEqual([]);
		expect(() => adapter.answer()).toThrow('TeleCMI is not connected.');
	});

	test('a new register on the same adapter after sbc_logout starts clean: a drop is not taken as a provider sign out', async () => {
		const { adapter, sdk } = await registered();
		sdk.fire('sbc_logout', { code: 401, reason: 'x' });
		const out = adapter.disconnect();
		sdk.fire('logout', {});
		await out;
		const done = adapter.register({ userId: '1001_33', password: 'pw' });
		const next = FakePiopiy.instances[FakePiopiy.instances.length - 1];
		expect(next).not.toBe(sdk);
		next.fire('login', { code: 200 });
		await done;
		patches = [];
		next.fire('disconnected', {});
		next.fire('logout', {});
		expect(statuses()).toEqual(['registering']);
	});
});
