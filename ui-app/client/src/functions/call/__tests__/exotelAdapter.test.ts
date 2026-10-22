/**
 * The Exotel adapter's mapping from the ExotelWebClient callbacks and calls to the call state,
 * with the SDK replaced by a fake. Also: the SIP password the SDK copies into its localStorage
 * log is scrubbed.
 */
import { createExotelAdapter, EXOTEL_SDK_URL, resetExotelClients } from '../exotelAdapter';
import { CallStatePatch } from '../types';

const SECRET = 's3cret-sip-pw';

class FakeStorage {
	data = new Map<string, string>();
	getItem(k: string) {
		return this.data.get(k) ?? null;
	}
	setItem(k: string, v: string) {
		this.data.set(k, v);
	}
	removeItem(k: string) {
		this.data.delete(k);
	}
}

let storage: FakeStorage;

class FakeClient {
	static instances: FakeClient[] = [];
	static setEnableConsoleLogging = jest.fn();
	static nextInitResult = true;
	info: any;
	reg!: (state: string, phone: string) => void;
	callCb!: (callObj: any, eventType: string, phone: string) => void;
	sess!: (state: string, phone: string, error?: any) => void;
	theCall = { Answer: jest.fn(), Hangup: jest.fn(), Mute: jest.fn(), UnMute: jest.fn() };
	DoRegister = jest.fn(() => true);
	UnRegister = jest.fn();
	enableAutoRetry = jest.fn();
	disableAutoRetry = jest.fn();
	getCall = jest.fn(() => this.theCall);
	initWebrtc = jest.fn(async (info: any, reg: any, callCb: any, sess: any) => {
		this.info = info;
		this.reg = reg;
		this.callCb = callCb;
		this.sess = sess;
		// What the real SDK does: log the whole sipAccountInfo into localStorage.
		storage.setItem(
			'webrtc_sdk_logs',
			JSON.stringify([
				'[t] [LOG] earlier line',
				`[t] [LOG] ExWebClient: initWebrtc: Exotel Client Initialised with ${JSON.stringify(info)}`,
			]),
		);
		const result = FakeClient.nextInitResult;
		FakeClient.nextInitResult = true;
		return result;
	});
	constructor() {
		FakeClient.instances.push(this);
	}
}

const SDK = { ExotelWebClient: FakeClient };

const CREDENTIALS = {
	userName: 'agent1',
	secret: SECRET,
	sipdomain: 'acct.voip.exotel.in',
	domain: 'voip.in1.exotel.com:443',
};

let patches: CallStatePatch[];

function adapterOf() {
	const adapter = createExotelAdapter({
		loadSdk: async () => SDK,
		storage: () => storage as unknown as Storage,
	});
	adapter.onStateChange(p => patches.push(p));
	return adapter;
}

async function registered() {
	const adapter = adapterOf();
	await adapter.load();
	const done = adapter.register(CREDENTIALS);
	for (let i = 0; i < 5; i++) await Promise.resolve();
	const client = FakeClient.instances[FakeClient.instances.length - 1];
	client.reg('registered', 'agent1');
	await done;
	return { adapter, client };
}

beforeEach(() => {
	patches = [];
	storage = new FakeStorage();
	FakeClient.instances = [];
	FakeClient.setEnableConsoleLogging.mockClear();
	resetExotelClients();
});

describe('exotel adapter', () => {
	test('pins a versioned jsDelivr build', () => {
		expect(EXOTEL_SDK_URL).toMatch(
			/^https:\/\/cdn\.jsdelivr\.net\/npm\/@exotel-npm-dev\/webrtc-client-sdk@\d+\.\d+\.\d+\/dist\/exotelsdk\.js$/,
		);
	});

	test('initWebrtc gets the sipAccountInfo, DoRegister runs, registered means ready', async () => {
		const { client } = await registered();
		expect(FakeClient.setEnableConsoleLogging).toHaveBeenCalledWith(false);
		expect(client.info).toEqual({
			userName: 'agent1',
			authUser: 'agent1',
			sipdomain: 'acct.voip.exotel.in',
			domain: 'voip.in1.exotel.com:443',
			displayName: 'agent1',
			displayname: 'agent1',
			secret: SECRET,
			port: '443',
			security: 'wss',
			endpoint: 'wss',
		});
		expect(client.DoRegister).toHaveBeenCalled();
		expect(patches).toEqual([{ status: 'registering' }, { status: 'ready', error: undefined }]);
	});

	test('the SIP password is scrubbed from the SDK log in localStorage', async () => {
		await registered();
		const logs = JSON.parse(storage.getItem('webrtc_sdk_logs')!);
		expect(logs).toEqual(['[t] [LOG] earlier line']);
		expect(JSON.stringify([...storage.data])).not.toContain(SECRET);
	});

	test('register fails on missing fields, a refused init, or a failed registration', async () => {
		const adapter = adapterOf();
		await adapter.load();
		await expect(adapter.register({ userName: 'a' })).rejects.toThrow(
			/userName, secret, sipdomain and domain/,
		);

		FakeClient.nextInitResult = false;
		await expect(adapter.register({ ...CREDENTIALS, userName: 'agent2' })).rejects.toThrow(
			/this SIP user is in use in this tab/,
		);

		const failing = adapter.register({ ...CREDENTIALS, userName: 'agent3' });
		for (let i = 0; i < 5; i++) await Promise.resolve();
		FakeClient.instances[FakeClient.instances.length - 1].reg('terminated', 'agent3');
		await expect(failing).rejects.toThrow('Exotel registration failed.');
	});

	test('a load without ExotelWebClient fails', async () => {
		const adapter = createExotelAdapter({ loadSdk: async () => ({}) });
		await expect(adapter.load()).rejects.toThrow('The Exotel SDK did not load.');
	});

	test('incoming call: ringing, answer, connected, mute, ended', async () => {
		const { adapter, client } = await registered();
		patches = [];
		client.callCb(
			{
				callId: 'sip-call-id',
				callSid: 'CA123',
				remoteId: '+919800000000',
				remoteDisplayName: 'Ann',
			},
			'incoming',
			'agent1',
		);
		adapter.answer();
		expect(client.theCall.Answer).toHaveBeenCalled();
		client.callCb({ callId: 'sip-call-id', callSid: 'CA123' }, 'connected', 'agent1');
		adapter.mute(true);
		adapter.mute(false);
		expect(client.theCall.Mute).toHaveBeenCalledTimes(1);
		expect(client.theCall.UnMute).toHaveBeenCalledTimes(1);
		adapter.hangup();
		expect(client.theCall.Hangup).toHaveBeenCalledTimes(1);
		client.callCb({}, 'callEnded', 'agent1');
		client.callCb({}, 'terminated', 'agent1');

		expect(patches).toEqual([
			{
				status: 'ringing',
				direction: 'inbound',
				callId: 'CA123',
				from: '+919800000000',
				to: undefined,
			},
			{ status: 'connected', callId: 'CA123' },
			{ status: 'ended' },
		]);
	});

	test('the SIP call id is used when the call has no callSid', async () => {
		const { client } = await registered();
		patches = [];
		client.callCb({ callId: 'sip-1', remoteDisplayName: 'Bob' }, 'incoming', 'agent1');
		expect(patches[0]).toMatchObject({ callId: 'sip-1', from: 'Bob' });
	});

	test('session notices: mic denied, socket drop while ready, re-registration', async () => {
		const { client } = await registered();
		patches = [];
		client.sess('media_permission_denied', 'agent1');
		client.sess('websocket_disconnected', 'agent1', {
			code: 1006,
			message: 'WebSocket closed (code: 1006)',
		});
		client.reg('registered', 'agent1');
		client.reg('unregistered', 'agent1');
		client.sess('ice_gathering_state_complete', 'agent1');
		expect(patches).toEqual([
			{ error: 'Microphone access was denied.' },
			{ error: 'WebSocket closed (code: 1006)', status: 'registering' },
			{ status: 'ready', error: undefined },
			{ status: 'registering' },
		]);
	});

	test('disconnect hangs up a live call, stops retries and unregisters', async () => {
		const { adapter, client } = await registered();
		client.callCb({ callSid: 'CA1' }, 'incoming', 'agent1');
		client.callCb({ callSid: 'CA1' }, 'connected', 'agent1');
		patches = [];
		adapter.disconnect();
		expect(client.theCall.Hangup).toHaveBeenCalled();
		expect(client.disableAutoRetry).toHaveBeenCalled();
		expect(client.UnRegister).toHaveBeenCalled();
		client.reg('unregistered', 'agent1');
		client.sess('websocket_disconnected', 'agent1', {});
		expect(patches).toEqual([]);
		expect(() => adapter.answer()).toThrow('No Exotel call.');
	});

	test('a reconnect for the same SIP user reuses the client the SDK already knows', async () => {
		const first = await registered();
		first.adapter.disconnect();
		const second = await registered();
		expect(second.client).toBe(first.client);
		expect(FakeClient.instances).toHaveLength(1);
	});
});
