/**
 * The TeleCMI adapter's mapping from PIOPIY SDK events and calls to the call state, with the
 * SDK replaced by a fake that records calls and fires events.
 */
import {
	createTelecmiAdapter,
	DEFAULT_REGION,
	RING_TIME_SECONDS,
	SIGN_OUT_WAIT_MS,
	TELECMI_SDK_URL,
} from '../telecmiAdapter';
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

async function registered(
	credentials: any = { userId: '1001_33', password: 'pw', region: 'sbcind.telecmi.com' },
) {
	// The bundle's global may be the class itself or a module with a default export.
	const adapter = createTelecmiAdapter({ loadSdk: async () => ({ default: FakePiopiy }) });
	adapter.onStateChange(p => patches.push(p));
	await adapter.load();
	const done = adapter.register(credentials);
	const sdk = FakePiopiy.instances[FakePiopiy.instances.length - 1];
	sdk.fire('login', { code: 200, status: 'Login successfully' });
	await done;
	return { adapter, sdk };
}

beforeEach(() => {
	patches = [];
	FakePiopiy.instances = [];
});

describe('telecmi adapter', () => {
	test('pins a versioned jsDelivr build of the scoped package', () => {
		expect(TELECMI_SDK_URL).toMatch(
			/^https:\/\/cdn\.jsdelivr\.net\/npm\/@telecmi\/piopiyjs@\d+\.\d+\.\d+\/dist\/piopiy\.min\.js$/,
		);
	});

	test('login with the credentials, registering then ready', async () => {
		const { sdk } = await registered();
		expect(sdk.options).toMatchObject({ debug: false, autoplay: true });
		expect(sdk.login).toHaveBeenCalledWith('1001_33', 'pw', 'sbcind.telecmi.com');
		expect(patches).toEqual([{ status: 'registering' }, { status: 'ready', error: undefined }]);
	});

	test('missing credentials and a failed login reject register', async () => {
		const adapter = createTelecmiAdapter({ loadSdk: async () => FakePiopiy });
		await adapter.load();
		await expect(adapter.register({ userId: 'x' })).rejects.toThrow(/userId and password/);

		const done = adapter.register({ userId: 'x', password: 'bad' });
		FakePiopiy.instances[0].fire('loginFailed', {
			code: 401,
			status: 'Invalid user_id or password',
		});
		await expect(done).rejects.toThrow('TeleCMI sign in failed: Invalid user_id or password');
	});

	test('a load that defines nothing usable fails', async () => {
		const adapter = createTelecmiAdapter({ loadSdk: async () => ({}) });
		await expect(adapter.load()).rejects.toThrow('The TeleCMI SDK did not load.');
	});

	test('incoming call: ringing, answer, answered, mute, ended', async () => {
		const { adapter, sdk } = await registered();
		patches = [];
		sdk.fire('inComingCall', {
			from: '+919800000000',
			call_id: 'uuid-1',
			to_number: '+918000000000',
			transfer: false,
		});
		sdk.fire('ringing', { code: 183, status: 'ringing', type: 'incoming', call_id: 'uuid-1' });
		adapter.answer();
		expect(sdk.answer).toHaveBeenCalled();
		sdk.fire('answered', { code: 200, status: 'answered', call_id: 'uuid-1' });
		adapter.mute(true);
		adapter.mute(false);
		expect(sdk.mute).toHaveBeenCalledTimes(1);
		expect(sdk.unMute).toHaveBeenCalledTimes(1);
		adapter.hold!(true);
		adapter.hold!(false);
		expect(sdk.hold).toHaveBeenCalledTimes(1);
		expect(sdk.unHold).toHaveBeenCalledTimes(1);
		sdk.fire('ended', { code: 200, status: 'call ended' });
		sdk.fire('hangup', { code: 200, status: 'call hangup' });

		expect(patches).toEqual([
			{
				status: 'ringing',
				direction: 'inbound',
				callId: 'uuid-1',
				from: '+919800000000',
				to: '+918000000000',
			},
			{ callId: 'uuid-1', direction: 'inbound' },
			{ status: 'connected', callId: 'uuid-1' },
			{ status: 'ended' },
		]);
	});

	test('hangup rejects a ringing incoming call and terminates anything else', async () => {
		const { adapter, sdk } = await registered();
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		adapter.hangup();
		expect(sdk.reject).toHaveBeenCalledTimes(1);
		sdk.fire('ended', {});

		// A call the server placed through the agent's login, once it is connected.
		sdk.fire('ringing', { type: 'outbound', call_id: 'o1' });
		sdk.fire('answered', {});
		adapter.hangup();
		expect(sdk.terminate).toHaveBeenCalledTimes(1);
	});

	test('a server placed call: trying and ringing fill the call id, a busy end is reported', async () => {
		const { sdk } = await registered();
		patches = [];
		sdk.fire('trying', { code: 100, status: 'trying', type: 'outgoing', call_id: 'o1' });
		sdk.fire('ringing', { code: 183, status: 'ringing', type: 'outbound', call_id: 'o1' });
		sdk.fire('ended', { code: 200, status: 'Busy' });
		expect(patches).toEqual([
			{ callId: 'o1' },
			{ status: 'ringing', callId: 'o1', direction: 'outbound' },
			{ status: 'ended' },
		]);
	});

	test('errors: command errors and media failures set error only; sbc_logout is fatal', async () => {
		const { sdk } = await registered();
		patches = [];
		sdk.fire('error', { code: 1002, status: 'call not found' });
		sdk.fire('mediaFailed', { code: 400, status: 'NotAllowedError' });
		sdk.fire('disconnected', { code: 1006, status: 'disconnected' });
		sdk.fire('login', { code: 200 });
		sdk.fire('sbc_logout', { code: 401, reason: 'logged in elsewhere' });
		expect(patches).toEqual([
			{ error: 'call not found' },
			{ error: 'Microphone unavailable or not allowed: NotAllowedError' },
			{ status: 'registering' },
			{ status: 'ready', error: undefined },
			{ status: 'error', error: 'TeleCMI signed this agent out: logged in elsewhere' },
		]);
	});

	test('disconnect ends a live call, logs out and drops the listeners', async () => {
		const { adapter, sdk } = await registered();
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		sdk.fire('answered', { call_id: 'c1' });
		patches = [];
		const done = adapter.disconnect();
		expect(sdk.terminate).toHaveBeenCalled();
		expect(sdk.logout).toHaveBeenCalled();
		// The listeners stay until the SDK says the sign out finished.
		expect(sdk.removeAllListeners).not.toHaveBeenCalled();
		sdk.fire('logout', { code: 200 });
		await done;
		expect(sdk.removeAllListeners).toHaveBeenCalled();
		expect(patches).toEqual([]);
		expect(() => adapter.answer()).toThrow('TeleCMI is not connected.');
	});

	test("the SDK's beforeunload teardown runs only on pagehide, so Cancel on the leave dialog keeps the call", async () => {
		const teardown = jest.fn();
		window.onbeforeunload = null;
		const adapter = createTelecmiAdapter({
			loadSdk: async () => {
				// What the PIOPIY bundle does when it loads.
				window.onbeforeunload = teardown;
				return { default: FakePiopiy };
			},
		});
		await adapter.load();
		expect(window.onbeforeunload).toBeNull();

		window.dispatchEvent(new Event('beforeunload', { cancelable: true }));
		expect(teardown).not.toHaveBeenCalled();

		window.dispatchEvent(new Event('pagehide'));
		expect(teardown).toHaveBeenCalledTimes(1);
	});
});

describe('telecmi adapter faults found against the real bundle (LZT-2165 8a to 8c)', () => {
	async function signingIn(credentials: any) {
		const adapter = createTelecmiAdapter({ loadSdk: async () => ({ default: FakePiopiy }) });
		adapter.onStateChange(p => patches.push(p));
		await adapter.load();
		const done = adapter.register(credentials);
		return { adapter, done, sdk: FakePiopiy.instances[FakePiopiy.instances.length - 1] };
	}

	test('8c: with no region (or an empty one from the server) the India SBC is passed, never the SDK default', async () => {
		for (const [creds, want] of [
			[{ userId: 'u', password: 'pw' }, DEFAULT_REGION],
			[{ userId: 'u', password: 'pw', region: '' }, DEFAULT_REGION],
			[
				{ userId: 'u', password: 'pw', region: null, sbc: 'sbcus.telecmi.com' },
				'sbcus.telecmi.com',
			],
			[{ userId: 'u', password: 'pw', region: 'sbcsg.telecmi.com' }, 'sbcsg.telecmi.com'],
		] as Array<[any, string]>) {
			const { sdk, done } = await signingIn(creds);
			expect(sdk.login).toHaveBeenCalledWith('u', 'pw', want);
			sdk.fire('login', {});
			await done;
		}
		expect(DEFAULT_REGION).toBe('sbcind.telecmi.com');
	});

	test("8b: the ring time is longer than the SDK's 40 s unless the credentials set one", async () => {
		const { sdk } = await registered();
		expect(sdk.options.ringTime).toBe(RING_TIME_SECONDS);
		expect(RING_TIME_SECONDS).toBeGreaterThan(40);
		const { sdk: other } = await registered({ userId: 'u', password: 'pw', ringTime: '75' });
		expect(other.options.ringTime).toBe(75);
	});

	test('8a: hanging up a call just answered terminates it, before the SDK says it is answered', async () => {
		const { adapter, sdk } = await registered();
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		adapter.answer();
		adapter.hangup();
		expect(sdk.terminate).toHaveBeenCalledTimes(1);
		expect(sdk.reject).not.toHaveBeenCalled();
		sdk.fire('hangup', {});

		// The next incoming call, not answered, is rejected again.
		sdk.fire('inComingCall', { from: 'b', call_id: 'c2' });
		adapter.hangup();
		expect(sdk.reject).toHaveBeenCalledTimes(1);
	});

	test('a phone torn down while signing in is signed out when its sign in lands, and reports nothing', async () => {
		const { adapter, sdk, done } = await signingIn({ userId: 'u', password: 'pw' });
		adapter.disconnect();
		await expect(done).rejects.toThrow('Disconnected before sign in finished.');
		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(sdk.removeAllListeners).not.toHaveBeenCalled();
		patches = [];
		sdk.fire('inComingCall', { from: 'a', call_id: 'late' });
		sdk.fire('login', { code: 200 });
		expect(sdk.logout).toHaveBeenCalledTimes(2);
		expect(sdk.removeAllListeners).toHaveBeenCalled();
		expect(patches).toEqual([]);
	});

	test('a login the SDK refuses because a phone is still signed in fails at once', async () => {
		const { sdk, done } = await signingIn({ userId: 'u', password: 'pw' });
		sdk.fire('error', { code: 1001, status: 'Please logout before you login' });
		await expect(done).rejects.toThrow(
			'TeleCMI sign in failed: Please logout before you login',
		);
	});

	test('mute is read back: a mute the SDK refused is an error, not a muted state', async () => {
		const { adapter, sdk } = await registered();
		let muted = false;
		(sdk as any).onMute = () => muted;
		sdk.mute.mockImplementation(() => {
			muted = true;
		});
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		sdk.fire('answered', {});
		expect(() => adapter.mute(true)).not.toThrow();
		sdk.unMute.mockImplementation(() => undefined);
		expect(() => adapter.mute(false)).toThrow('TeleCMI did not unmute the call.');
	});
	test('LZT-2163: disconnect waits for the socket to close when the SDK sends no logout', async () => {
		const { adapter, sdk } = await registered();
		patches = [];
		let finished = false;
		const done = Promise.resolve(adapter.disconnect()).then(() => (finished = true));
		await Promise.resolve();
		expect(finished).toBe(false);
		sdk.fire('disconnected', {});
		await done;
		expect(finished).toBe(true);
		expect(sdk.removeAllListeners).toHaveBeenCalled();
		// A closed socket of a phone let go is not a drop to report.
		expect(patches.filter(p => p.status === 'registering')).toEqual([]);
	});

	test('LZT-2163: a sign out while the socket reconnects is not swallowed: the phone that signs back in is signed out', async () => {
		const { adapter, sdk } = await registered();
		sdk.fire('disconnected', {});
		expect(patches[patches.length - 1]).toEqual({ status: 'registering' });
		patches = [];
		const done = adapter.disconnect();
		// The SDK answers logout on a reconnecting socket with "Please login".
		sdk.fire('error', { code: 1002, status: 'Please login' });
		await done;
		expect(sdk.logout).toHaveBeenCalledTimes(1);
		// Its own reconnect signs it in again a moment later.
		sdk.fire('login', { code: 200 });
		expect(sdk.logout).toHaveBeenCalledTimes(2);
		sdk.fire('login', { code: 200 });
		expect(sdk.logout).toHaveBeenCalledTimes(3);
		sdk.fire('inComingCall', { from: 'a', call_id: 'late' });
		expect(patches).toEqual([]);
	});

	test('LZT-2163: a sign out the SDK never confirms is bounded', async () => {
		jest.useFakeTimers();
		try {
			const { adapter } = await registered();
			let finished = false;
			const done = Promise.resolve(adapter.disconnect()).then(() => (finished = true));
			await jest.advanceTimersByTimeAsync(SIGN_OUT_WAIT_MS - 10);
			expect(finished).toBe(false);
			await jest.advanceTimersByTimeAsync(20);
			await done;
			expect(finished).toBe(true);
		} finally {
			jest.useRealTimers();
		}
	});

	test('LZT-2166: sendDtmf sends one key; a key the SDK refuses or a bad key throws', async () => {
		const { adapter, sdk } = await registered();
		(sdk as any).sendDtmf = jest.fn();
		sdk.fire('inComingCall', { from: 'a', call_id: 'c1' });
		sdk.fire('answered', {});
		adapter.sendDtmf!('7');
		expect((sdk as any).sendDtmf).toHaveBeenCalledWith('7');
		expect(() => adapter.sendDtmf!('A')).toThrow('"A" is not a keypad key.');
		(sdk as any).sendDtmf = jest.fn(() =>
			sdk.fire('error', { code: 1005, status: 'Invalid DTMF' }),
		);
		expect(() => adapter.sendDtmf!('9')).toThrow(
			'TeleCMI would not send that key: Invalid DTMF',
		);
		// A refusal that comes later lands in the state as an error.
		patches = [];
		sdk.fire('error', { code: 1005, status: 'Invalid DTMF' });
		expect(patches).toEqual([{ error: 'TeleCMI would not send that key: Invalid DTMF' }]);
	});
});
