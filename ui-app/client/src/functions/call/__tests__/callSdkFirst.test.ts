/**
 * LZT-2731 step 3: `UIEngine.Call.Connect` takes an optional `sdkFirst` (default false). With it,
 * the server's report that an INCOMING call is over no longer hangs the browser's leg up after
 * SERVER_END_GRACE_MS: the phone's own end is the end, and the server's end only follows after
 * SERVER_END_FLOOR_MS when the phone never said so (a lost BYE). Outgoing calls, and the agent's
 * own leg of a click to call, keep the short grace. Without the flag nothing changes.
 *
 * The flag off cases here copy the scenarios of callDisplayWiring.test.ts (~289) and
 * callTabs.test.ts (~1129 and ~1342), which stay as they are; each runs with the flag absent, off
 * and on.
 */

export {};

type Listener = (m: any) => void;

class FakeTabs {
	holders = new Map<string, string>();
	channels: Array<{ tab: string; name: string; on: Listener; open: boolean }> = [];

	forTab(tab: string) {
		const self = this;
		return {
			tryLead: async (name: string) => {
				if (self.holders.has(name)) return false;
				self.holders.set(name, tab);
				return true;
			},
			waitLead: () => () => {},
			release: (name: string) => {
				if (self.holders.get(name) === tab) self.holders.delete(name);
			},
			open: (name: string, on: Listener) => {
				const ch = { tab, name, on, open: true };
				self.channels.push(ch);
				return {
					post: (m: any) => {
						const copy = JSON.parse(JSON.stringify(m));
						for (const c of self.channels)
							if (c.open && c.name === name && c !== ch)
								Promise.resolve().then(() => c.on(copy));
					},
					close: () => {
						ch.open = false;
					},
				};
			},
		};
	}
}

class FakeAdapter {
	listener: (p: any) => void = () => {};
	load = jest.fn(async () => {});
	register = jest.fn(async () => {});
	answer = jest.fn();
	hangup = jest.fn();
	mute = jest.fn();
	hold = jest.fn();
	disconnect = jest.fn();
	onStateChange(l: any) {
		this.listener = l;
	}
	emit(p: any) {
		this.listener(p);
	}
}

class QuietOut {
	async play() {
		return 'playing';
	}
	stop() {}
	async unlock() {
		return true;
	}
	onUnlocked() {}
	setRingtone() {}
}

class Browser {
	hidden() {
		return false;
	}
	onVisibility() {}
	title() {
		return 'Deals';
	}
	setTitle() {}
	permission() {
		return 'denied';
	}
	async request() {
		return 'denied';
	}
	notify() {
		return { close() {} };
	}
}

interface Tab {
	session: typeof import('../session');
	fns: typeof import('../CallFunctions');
	adapters: FakeAdapter[];
	call: () => any;
	display: () => any;
}

const writes: Record<string, Array<{ path: string; value: any }>> = {};
const loaded: Tab[] = [];

function loadTab(name: string, tabs: FakeTabs): Tab {
	let tab!: Tab;
	writes[name] = [];
	jest.isolateModules(() => {
		jest.doMock('../../../context/StoreContext', () => ({
			setData: (path: string, value: any) => writes[name].push({ path, value }),
		}));
		const registry = require('../registry');
		const session = require('../session');
		const fns = require('../CallFunctions');
		const adapters: FakeAdapter[] = [];
		registry.registerCallProvider('fake', () => {
			const a = new FakeAdapter();
			adapters.push(a);
			return a;
		});
		require('../tabs').setTabSync(tabs.forTab(name));
		const sounds = require('../sounds');
		session.useCallSounds(new sounds.CallSounds(() => new QuietOut()));
		const alerts = require('../alerts');
		session.useCallAlerts(new alerts.CallAlerts(() => new Browser()));
		const last = (path: string) => {
			const w = writes[name].filter(x => x.path === path);
			return w[w.length - 1]?.value;
		};
		tab = {
			session,
			fns,
			adapters,
			call: () => last('Store.call'),
			display: () => last('Store.callDisplay'),
		};
	});
	loaded.push(tab);
	return tab;
}

const settle = async (ms = 0) => {
	await jest.advanceTimersByTimeAsync(ms);
	for (let i = 0; i < 20; i++) await Promise.resolve();
};

/** `sdkFirst`: the parameter is left out ('absent'), false, or true. */
type Flag = 'absent' | false | true;

async function connect(tab: Tab, flag: Flag) {
	const options: Record<string, any> = { displayPath: 'Store.callDisplay' };
	if (flag !== 'absent') options.sdkFirst = flag;
	const p = tab.session.connect(
		'fake',
		{ user: 'agent', password: 'pw' },
		'Store.call',
		'_global',
		options,
	);
	await settle(500);
	return p;
}

const frame = (tab: Tab, over: Record<string, any>) =>
	tab.session.liveFrame({
		callLogId: 'log-2',
		status: 'RINGING',
		terminal: false,
		direction: 'inbound',
		at: Date.now(),
		customerDialCode: '91',
		customerPhoneNumber: '9740485795',
		...over,
	} as any);

beforeEach(() => {
	jest.useFakeTimers({ now: 1_793_800_000_000 });
});

afterEach(async () => {
	for (const t of loaded.splice(0)) await t.session.disconnect();
	jest.useRealTimers();
});

const OFF: Flag[] = ['absent', false];

describe('LZT-2731: sdkFirst on Connect', () => {
	test('the parameter is optional and its default is false', () => {
		const { fns } = loadTab('S', new FakeTabs());
		const param = new fns.Connect().getSignature().getParameters().get('sdkFirst');
		expect(param).toBeDefined();
		expect(param!.getSchema().getDefaultValue()).toBe(false);
		expect(new fns.Connect().getSignature().getDocumentation()).toContain('sdkFirst');
	});

	test('the floor is longer than the grace', () => {
		const { session } = loadTab('S', new FakeTabs());
		expect(session.SERVER_END_FLOOR_MS).toBeGreaterThan(session.SERVER_END_GRACE_MS);
		expect(session.SERVER_END_FLOOR_MS).toBe(30000);
	});

	describe.each([...OFF, true] as Flag[])('incoming call, flag %s', flag => {
		const on = flag === true;

		/** An answered incoming call whose server report ends while the SDK says nothing. */
		async function serverEndsFirst(a: Tab) {
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			a.adapters[0].emit({ status: 'connected' });
			frame(a, { status: 'IN_PROGRESS' });
			await settle(5_000);
			frame(a, { status: 'COMPLETED', terminal: true, talkDuration: 5 });
		}

		test('the server ends first and the SDK stays silent (callTabs ~1129)', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			await serverEndsFirst(a);
			await settle(a.session.SERVER_END_GRACE_MS + 10);
			if (on) {
				// No hangup at the grace: the SDK's end is the end.
				expect(a.adapters[0].hangup).not.toHaveBeenCalled();
				expect(a.call()).toMatchObject({ status: 'connected', callId: 'c1' });
				await settle(a.session.SERVER_END_FLOOR_MS - a.session.SERVER_END_GRACE_MS - 100);
				expect(a.adapters[0].hangup).not.toHaveBeenCalled();
				// The floor: a lost BYE cannot keep the call up for good.
				await settle(200);
				expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
				expect(a.adapters[0].hangup).toHaveBeenCalledWith('c1');
				expect(a.call().status).toBe('ended');
			} else {
				expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
				expect(a.adapters[0].hangup).toHaveBeenCalledWith('c1');
				expect(a.call().status).toBe('ended');
			}
		});

		test('the SDK ends the call after the server did: no hangup, one end, the display stays', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			await serverEndsFirst(a);
			await settle(1_000);
			a.adapters[0].emit({ status: 'ended' });
			await settle(10);
			expect(a.call().status).toBe('ended');
			expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 5 });
			await settle(a.session.SERVER_END_FLOOR_MS * 2);
			expect(a.adapters[0].hangup).not.toHaveBeenCalled();
			expect(a.call().status).toBe('ended');
			expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 5 });
		});

		test('the SDK ends first (a caller hangup while it rings): nothing for the server end to do', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			frame(a, {});
			await settle(3_000);
			a.adapters[0].emit({ status: 'ended' });
			frame(a, { status: 'MISSED', terminal: true });
			await settle(a.session.SERVER_END_FLOOR_MS * 2);
			expect(a.adapters[0].hangup).not.toHaveBeenCalled();
			expect(a.call().status).toBe('ended');
		});

		test('the end of an earlier call heard again never ends the call up (callTabs ~1129)', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			const t0 = Date.now();
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'x1' });
			a.adapters[0].emit({ status: 'connected' });
			frame(a, { callLogId: 'L1', status: 'IN_PROGRESS', at: t0 });
			frame(a, { callLogId: 'L1', status: 'COMPLETED', terminal: true, at: t0 + 1000 });
			a.adapters[0].emit({ status: 'ended' });
			await settle(10_000);
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'x2' });
			a.adapters[0].emit({ status: 'connected' });
			const t1 = Date.now();
			frame(a, { callLogId: 'L1', status: 'IN_PROGRESS', at: t1 });
			frame(a, { callLogId: 'L2', status: 'RINGING', at: t1 + 100 });
			expect(a.session.liveReport()?.callLogId).toBe('L2');
			frame(a, {
				callLogId: 'L1',
				status: 'COMPLETED',
				terminal: true,
				at: t1 + 200,
				recordingFile: 'rec/1.mp3',
			});
			await settle(a.session.SERVER_END_FLOOR_MS + 100);
			expect(a.adapters[0].hangup).not.toHaveBeenCalled();
			expect(a.call()).toMatchObject({ status: 'connected', callId: 'x2' });
		});

		test("the second caller's frames never end the call going on; the first call's own end does (callTabs ~1342)", async () => {
			const tabs = new FakeTabs();
			const a = loadTab('A', tabs);
			const b = loadTab('B', tabs);
			await connect(a, flag);
			await connect(b, flag);
			const sdk = a.adapters[0];
			const t0 = Date.now();
			frame(a, { callLogId: 'L1', status: 'RINGING', at: t0 });
			sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+918143118272' });
			sdk.emit({ status: 'connected' });
			frame(a, { callLogId: 'L1', status: 'IN_PROGRESS', at: t0 + 2000 });
			await settle(11_000);

			const t1 = Date.now();
			frame(b, { callLogId: 'L2', status: 'RINGING', at: t1 });
			frame(a, { callLogId: 'L2', status: 'RINGING', at: t1 + 10 });
			await settle(30_000);
			frame(a, { callLogId: 'L2', status: 'MISSED', terminal: true, ringDuration: 32 });
			frame(b, { callLogId: 'L2', status: 'MISSED', terminal: true, ringDuration: 32 });
			await settle(5_000);
			expect(sdk.hangup).not.toHaveBeenCalled();
			expect(a.call()).toMatchObject({ status: 'connected', callId: 'c1' });

			frame(a, { callLogId: 'L1', status: 'COMPLETED', terminal: true, talkDuration: 63 });
			await settle(a.session.SERVER_END_GRACE_MS + 10);
			if (on) {
				expect(sdk.hangup).not.toHaveBeenCalled();
				expect(a.call().status).toBe('connected');
				await settle(a.session.SERVER_END_FLOOR_MS);
			}
			expect(sdk.hangup).toHaveBeenCalledWith('c1');
			expect(sdk.hangup).toHaveBeenCalledTimes(1);
			expect(a.call().status).toBe('ended');
		});
	});

	describe.each([...OFF, true] as Flag[])('outgoing call, flag %s', flag => {
		test('the customer ends it and the SDK stays silent: the server end hangs up after the grace in both cases (callDisplayWiring ~289)', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			a.session.expectOutbound(true);
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
			a.adapters[0].emit({ status: 'connected' });
			frame(a, { direction: 'outbound', status: 'RINGING' });
			await settle(3_000);
			frame(a, { direction: 'outbound', status: 'IN_PROGRESS' });
			await settle(30_000);
			expect(a.display().phase).toBe('talking');

			frame(a, { direction: 'outbound', status: 'COMPLETED', terminal: true, talkDuration: 31 });
			await settle(10);
			expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 31 });
			expect(a.adapters[0].hangup).not.toHaveBeenCalled();
			await settle(a.session.SERVER_END_GRACE_MS + 10);
			expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
			expect(a.adapters[0].hangup).toHaveBeenCalledWith('leg1');
			expect(a.call().status).toBe('ended');
			expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 31 });
		});

		test('an outgoing call the SDK ends itself is not hung up again', async () => {
			const a = loadTab('A', new FakeTabs());
			await connect(a, flag);
			a.session.expectOutbound(true);
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
			a.adapters[0].emit({ status: 'connected' });
			frame(a, { direction: 'outbound', status: 'IN_PROGRESS' });
			await settle(5_000);
			a.adapters[0].emit({ status: 'ended' });
			frame(a, { direction: 'outbound', status: 'COMPLETED', terminal: true });
			await settle(a.session.SERVER_END_FLOOR_MS * 2);
			expect(a.adapters[0].hangup).not.toHaveBeenCalled();
		});
	});

	test('a Connect again with the same phone takes the new flag', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a, false);
		await connect(a, true);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { status: 'IN_PROGRESS' });
		await settle(2_000);
		frame(a, { status: 'COMPLETED', terminal: true });
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).not.toHaveBeenCalled();
		await settle(a.session.SERVER_END_FLOOR_MS);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
		expect(a.adapters).toHaveLength(1);
	});
});
