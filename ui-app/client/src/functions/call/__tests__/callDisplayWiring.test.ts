/**
 * LZT-2161: the session writes the call bar's display values (display.ts) to the display path
 * Connect names, in every tab, from the shared state and the merged server report: the same
 * seconds in every tab, the clock frozen at the provider's end, an earlier call's report never
 * shown, no summary in a tab opened after the end, and nothing written without a displayPath.
 */

export {};

type Listener = (m: any) => void;

class FakeTabs {
	holders = new Map<string, string>();
	waiters = new Map<string, Array<{ tab: string; onLead: () => void; cancelled: boolean }>>();
	channels: Array<{ tab: string; name: string; on: Listener; open: boolean }> = [];

	forTab(tab: string) {
		const self = this;
		return {
			tryLead: async (name: string) => {
				if (self.holders.has(name)) return false;
				self.holders.set(name, tab);
				return true;
			},
			waitLead: (name: string, onLead: () => void) => {
				const w = { tab, onLead, cancelled: false };
				self.waiters.set(name, [...(self.waiters.get(name) ?? []), w]);
				return () => {
					w.cancelled = true;
				};
			},
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
	adapters: FakeAdapter[];
	/** The display writes of this tab. */
	shown: () => any[];
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
		const shown = () =>
			writes[name].filter(w => w.path === 'Store.callDisplay').map(w => w.value);
		tab = { session, adapters, shown, display: () => shown()[shown().length - 1] };
	});
	loaded.push(tab);
	return tab;
}

const settle = async (ms = 0) => {
	await jest.advanceTimersByTimeAsync(ms);
	for (let i = 0; i < 20; i++) await Promise.resolve();
};

async function connect(tab: Tab, displayPath: string | undefined = 'Store.callDisplay') {
	const p = tab.session.connect(
		'fake',
		{ user: 'agent', password: 'pw' },
		'Store.call',
		'_global',
		{
			displayPath,
		},
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

describe('LZT-2161: the session writes the display', () => {
	test('an incoming call: the same ring and talk seconds in both tabs, frozen at the end', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		expect(a.display()).toMatchObject({ phase: 'ready', otherTab: false });
		expect(b.display()).toMatchObject({ phase: 'ready', otherTab: true });

		const t0 = Date.now();
		a.adapters[0].emit({
			status: 'ringing',
			direction: 'inbound',
			callId: 'c1',
			from: '+919740485795',
		});
		frame(a, {});
		await settle(4000);
		expect(a.display()).toMatchObject({
			phase: 'ringing',
			ringStartedAt: t0,
			ringSec: 4,
			ringText: '00:04',
		});
		expect(b.display()).toMatchObject({
			phase: 'ringing',
			ringStartedAt: t0,
			ringSec: 4,
			otherTab: true,
		});
		expect(a.display().number).toBe('+91 9740485795');

		a.adapters[0].emit({ status: 'connected' });
		await settle(65_000);
		expect(a.display()).toMatchObject({
			phase: 'talking',
			ringSec: 4,
			talkSec: 65,
			talkText: '01:05',
		});
		const { otherTab: _b, ...bSeen } = b.display();
		const { otherTab: _a, ...aSeen } = a.display();
		expect(bSeen).toEqual(aSeen);

		a.adapters[0].emit({ status: 'ended' });
		await settle(10);
		const atEnd = a.display();
		expect(atEnd).toMatchObject({ phase: 'ended', final: true, talkSec: 65 });
		const n = a.shown().length;
		await settle(30_000);
		// The clock stopped: nothing more is written, and the seconds never moved.
		expect(a.shown()).toHaveLength(n);
		expect(b.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 65 });
	});

	test("the server's end freezes the clock at once and its talk time wins; an earlier call's frames never show", async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		// A late final record of the call before, heard first.
		frame(a, {
			callLogId: 'log-1',
			status: 'COMPLETED',
			terminal: true,
			talkDuration: 400,
			recordingFile: 'rec/log-1.mp3',
			customerPhoneNumber: '9111111111',
		});
		await settle(60_000);

		a.session.expectOutbound(true);
		a.adapters[0].emit({
			status: 'ringing',
			direction: 'inbound',
			callId: 'leg1',
			from: '+918000000428',
		});
		await settle(10);
		// The earlier call arrives again while this one rings: never shown.
		frame(a, { callLogId: 'log-1', status: 'COMPLETED', terminal: true, talkDuration: 400 });
		await settle(10);
		expect(a.display()).toMatchObject({
			phase: 'dialling',
			outbound: true,
			callLogId: '',
			recordingFile: '',
		});

		frame(a, { direction: 'outbound', status: 'RINGING' });
		a.adapters[0].emit({ status: 'connected' });
		await settle(5_000);
		expect(a.display()).toMatchObject({ phase: 'dialling', callLogId: 'log-2', talkText: '' });

		frame(a, { direction: 'outbound', status: 'IN_PROGRESS' });
		await settle(30_000);
		expect(a.display().phase).toBe('talking');
		// Shown as of the last 1 s tick: at most one tick behind.
		expect(a.display().talkSec).toBeGreaterThanOrEqual(29);
		expect(a.display().talkSec).toBeLessThanOrEqual(30);

		frame(a, { direction: 'outbound', status: 'COMPLETED', terminal: true, talkDuration: 31 });
		await settle(10);
		expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 31 });
		const n = a.shown().length;
		await settle(1_500);
		expect(a.shown()).toHaveLength(n);
		// The engine then hangs up its side (SERVER_END_GRACE_MS) and the display stays the same.
		await settle(2_000);
		expect(a.display()).toMatchObject({ phase: 'ended', final: true, talkSec: 31 });
	});

	test('a tab opened after the call ended shows no summary of it', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { status: 'IN_PROGRESS' });
		await settle(20_000);
		a.adapters[0].emit({ status: 'ended' });
		frame(a, { status: 'COMPLETED', terminal: true, talkDuration: 20 });
		await settle(10);
		expect(a.display()).toMatchObject({ phase: 'ended', final: true });

		const c = loadTab('C', tabs);
		await connect(c);
		await settle(10);
		expect(c.display()).toMatchObject({
			phase: 'ready',
			final: false,
			callId: '',
			talkText: '',
		});
	});

	test("LZT-2256: a tab opened during a call shows the call tab's talk seconds, whatever its own server report says", async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.session.expectOutbound(true);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { direction: 'outbound', status: 'RINGING' });
		await settle(3_000);
		const answered = Date.now();
		frame(a, { direction: 'outbound', status: 'IN_PROGRESS', answeredAt: answered });
		await settle(60_000);
		expect(a.display()).toMatchObject({
			phase: 'talking',
			callLogId: 'log-2',
			talkStartedAt: answered,
		});

		// A duplicate tab: its own first server report (the newest call row of the user) is another
		// call still going on, heard before it joins; the call tab's own report comes after.
		const b = loadTab('B', tabs);
		frame(b, {
			callLogId: 'log-9',
			direction: 'outbound',
			status: 'IN_PROGRESS',
			at: Date.now(),
		});
		await connect(b);
		frame(b, {
			callLogId: 'log-9',
			direction: 'outbound',
			status: 'IN_PROGRESS',
			at: Date.now(),
		});
		await settle(5_000);
		expect(b.display()).toMatchObject({
			phase: 'talking',
			otherTab: true,
			callLogId: 'log-2',
			talkStartedAt: answered,
		});
		// Each tab rewrites its seconds on its own 1 s tick: at most one tick apart.
		expect(Math.abs(b.display().talkSec - a.display().talkSec)).toBeLessThanOrEqual(1);
		expect(b.display().talkSec).toBeGreaterThanOrEqual(64);

		// The same tab joining when its first report of the call has no answer time: the call
		// tab's answer still wins (not the moment this tab first heard of the call).
		const c = loadTab('C', tabs);
		frame(c, { direction: 'outbound', status: 'IN_PROGRESS', at: Date.now() });
		await connect(c);
		await settle(2_000);
		expect(c.display()).toMatchObject({ phase: 'talking', talkStartedAt: answered });
		// Each tab rewrites its seconds on its own 1 s tick: at most one tick apart.
		expect(Math.abs(c.display().talkSec - a.display().talkSec)).toBeLessThanOrEqual(1);
	});

	test('LZT-2256: an incoming call: a tab opened mid call counts from the answer', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await settle(2_000);
		const answered = Date.now();
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { status: 'IN_PROGRESS' });
		await settle(70_000);
		const b = loadTab('B', tabs);
		frame(b, {
			callLogId: 'log-9',
			direction: 'outbound',
			status: 'IN_PROGRESS',
			at: Date.now(),
		});
		await connect(b);
		await settle(3_000);
		expect(b.display()).toMatchObject({
			phase: 'talking',
			talkStartedAt: answered,
			outbound: false,
		});
		// Each tab rewrites its seconds on its own 1 s tick: at most one tick apart.
		expect(Math.abs(b.display().talkSec - a.display().talkSec)).toBeLessThanOrEqual(1);
	});

	test('LZT-2256: a remount of the page (Connect again, another page name) keeps the seconds', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.session.expectOutbound(true);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { direction: 'outbound', status: 'RINGING' });
		await settle(2_000);
		const answered = Date.now();
		frame(a, { direction: 'outbound', status: 'IN_PROGRESS' });
		await settle(40_000);
		await a.session.connect('fake', { user: 'agent', password: 'pw' }, 'Store.call', 'deals', {
			displayPath: 'Store.callDisplay',
		});
		frame(a, { direction: 'outbound', status: 'IN_PROGRESS' });
		await settle(2_000);
		expect(a.display()).toMatchObject({ phase: 'talking', talkStartedAt: answered });
		expect(a.display().talkSec).toBeGreaterThanOrEqual(41);
	});

	test('without a displayPath nothing is written there', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a, '');
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await settle(3_000);
		expect(a.shown()).toEqual([]);
		expect(writes.A.every(w => w.path === 'Store.call')).toBe(true);
	});
});
