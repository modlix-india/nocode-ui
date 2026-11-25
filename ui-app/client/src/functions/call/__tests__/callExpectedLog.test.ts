/**
 * LZT-2731: the page can tell the engine the server call (callLogId) the browser call is, with
 * `UIEngine.Call.Expect(callLogId)`: the id the click to call function returned (outgoing, it
 * answers after the agent's leg rang) or the id in the push (incoming). The engine then binds the
 * server's reports to exactly that call; the time windows (heardAsThisCall, bindable) stay the
 * way for a call the page gave no id for.
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

async function connect(tab: Tab) {
	const p = tab.session.connect(
		'fake',
		{ user: 'agent', password: 'pw' },
		'Store.call',
		'_global',
		{ displayPath: 'Store.callDisplay' },
	);
	await settle(500);
	return p;
}

const frame = (tab: Tab, over: Record<string, any>) =>
	tab.session.liveFrame({
		callLogId: 'log-2',
		status: 'RINGING',
		terminal: false,
		direction: 'outbound',
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

/** The agent's own leg of a click to call rings in the browser and is answered by the engine. */
function ownLegRings(a: Tab) {
	a.session.expectOutbound(true);
	a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
	a.adapters[0].emit({ status: 'connected' });
}

describe('LZT-2731: an expected callLogId beats the time windows', () => {
	test('outgoing: the id told after the leg rang wins over a closer in time other call', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		// A missed call box left on the page: its frame is the first one this tab hears.
		frame(a, { callLogId: 'missed', status: 'IN_PROGRESS', direction: 'inbound' });
		await settle(1_000);
		expect(a.display().callLogId).toBe('missed');
		// The click to call function answers with the real call's id.
		await a.session.expectOutbound(true, 'mine');
		expect(a.display().callLogId).not.toBe('missed');
		frame(a, { callLogId: 'mine', status: 'RINGING' });
		await settle(1_000);
		expect(a.display()).toMatchObject({ callLogId: 'mine', phase: 'dialling' });
		frame(a, { callLogId: 'mine', status: 'IN_PROGRESS' });
		await settle(1_000);
		expect(a.display()).toMatchObject({ callLogId: 'mine', phase: 'talking' });
		// The other call's end does not end this call.
		frame(a, {
			callLogId: 'missed',
			status: 'COMPLETED',
			terminal: true,
			direction: 'inbound',
		});
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).not.toHaveBeenCalled();
		expect(a.display()).toMatchObject({ callLogId: 'mine', phase: 'talking' });
		// Its own end does.
		frame(a, { callLogId: 'mine', status: 'COMPLETED', terminal: true });
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
		expect(a.call().status).toBe('ended');
	});

	test('the same without the id: the first call heard binds, as before', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		frame(a, { callLogId: 'missed', status: 'IN_PROGRESS', direction: 'inbound' });
		await settle(1_000);
		frame(a, { callLogId: 'mine', status: 'RINGING' });
		await settle(1_000);
		expect(a.display().callLogId).toBe('missed');
		frame(a, {
			callLogId: 'missed',
			status: 'COMPLETED',
			terminal: true,
			direction: 'inbound',
		});
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
	});

	test('the id told before the call rings binds it, two calls close together', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		a.session.expectOutbound(true);
		await a.session.expectOutbound(true, 'mine');
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
		a.adapters[0].emit({ status: 'connected' });
		frame(a, { callLogId: 'other', status: 'IN_PROGRESS', direction: 'inbound' });
		await settle(500);
		frame(a, { callLogId: 'mine', status: 'RINGING' });
		await settle(500);
		expect(a.display()).toMatchObject({ callLogId: 'mine', phase: 'dialling' });
		frame(a, { callLogId: 'other', status: 'COMPLETED', terminal: true, direction: 'inbound' });
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).not.toHaveBeenCalled();
		frame(a, { callLogId: 'mine', status: 'IN_PROGRESS' });
		await settle(500);
		expect(a.display()).toMatchObject({ callLogId: 'mine', phase: 'talking' });
	});

	test('incoming: the id in the push binds the ringing call over an earlier call heard just before', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		// The final record of the earlier call arrives again, then the push of the new one.
		frame(a, { callLogId: 'old', status: 'RINGING', direction: 'inbound' });
		await a.session.expectOutbound(true, 'new');
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		frame(a, { callLogId: 'old', status: 'IN_PROGRESS', direction: 'inbound' });
		frame(a, { callLogId: 'new', status: 'RINGING', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('new');
		expect(a.call().direction).toBe('inbound');
	});

	test('an id told to a tab that does not hold the phone reaches the tab that does', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const b = loadTab('B', tabs);
		await connect(b);
		await settle(500);
		a.session.expectOutbound(true);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'leg1' });
		a.adapters[0].emit({ status: 'connected' });
		await settle(100);
		frame(a, { callLogId: 'missed', status: 'IN_PROGRESS', direction: 'inbound' });
		await settle(100);
		await b.session.expectOutbound(true, 'mine');
		await settle(100);
		frame(a, { callLogId: 'mine', status: 'IN_PROGRESS' });
		await settle(100);
		expect(a.display().callLogId).toBe('mine');
	});
});

describe('LZT-2731: no id given', () => {
	test('Expect without callLogId still arms the claim and binds nothing', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		expect(a.call()).toMatchObject({ direction: 'outbound', ringBack: true });
		frame(a, { callLogId: 'x', status: 'IN_PROGRESS' });
		await settle(2_000);
		expect(a.display().callLogId).toBe('x');
		frame(a, { callLogId: 'x', status: 'COMPLETED', terminal: true });
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
	});

	test('the Expect function has an optional callLogId and its text says what it does', () => {
		const { fns } = loadTab('S', new FakeTabs());
		const sig = new fns.Expect().getSignature();
		const param = sig.getParameters().get('callLogId');
		expect(param).toBeDefined();
		expect(param!.getSchema().getDefaultValue()).toBe('');
		expect(sig.getDocumentation()).toContain('callLogId');
		expect(sig.getParameters().get('on')!.getSchema().getDefaultValue()).toBe(true);
	});

	test('an id told with no call up and no call after it changes nothing for a later call', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		await a.session.expectOutbound(true, 'ghost');
		await settle(a.session.EXPECTED_LOG_TTL_MS + 1_000);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		frame(a, { callLogId: 'real', status: 'RINGING', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('real');
	});
});

describe('LZT-2731: the page can tell the bundle takes an id', () => {
	test('the answer of Connect carries exactLog, the stored state does not', async () => {
		const a = loadTab('A', new FakeTabs());
		const run = (a.fns.Connect.prototype as any).run.bind(new a.fns.Connect());
		const args = new Map<string, any>([
			['provider', 'fake'],
			['credentials', { user: 'agent', password: 'pw' }],
			['statePath', 'Store.call'],
			['displayPath', 'Store.callDisplay'],
		]);
		const p = run({ getArguments: () => args, getValuesMap: () => undefined });
		await settle(500);
		const answer = await p;
		expect(answer.exactLog).toBe(true);
		expect(a.call().status).toBe('ready');
		expect(a.call()).not.toHaveProperty('exactLog');
	});

	test('the answer of Expect with an id is the state, and the call is left alone', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		const run = (a.fns.Expect.prototype as any).run.bind(new a.fns.Expect());
		const answer = await run({
			getArguments: () =>
				new Map<string, any>([
					['on', true],
					['callLogId', 'mine'],
				]),
		});
		expect(answer.status).toBe('ready');
	});
});

describe('LZT-2731: an id that never matches', () => {
	test('falls back to the time windows once the server never reports it', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		await a.session.expectOutbound(true, 'lost');
		frame(a, { callLogId: 'real', status: 'IN_PROGRESS' });
		await settle(1_000);
		// Waiting for the id: the other call is not shown as this one.
		expect(a.display().callLogId).toBe('');
		await settle(a.session.EXPECTED_LOG_WAIT_MS + 1_000);
		frame(a, { callLogId: 'real', status: 'IN_PROGRESS' });
		await settle(500);
		expect(a.display().callLogId).toBe('real');
		frame(a, { callLogId: 'real', status: 'COMPLETED', terminal: true });
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
	});

	test('does not fall back while the id is heard of', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		await a.session.expectOutbound(true, 'mine');
		frame(a, { callLogId: 'mine', status: 'RINGING' });
		await settle(a.session.EXPECTED_LOG_WAIT_MS + 5_000);
		frame(a, { callLogId: 'other', status: 'IN_PROGRESS', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('mine');
	});
});

describe('LZT-2731: a stale id', () => {
	test('is dropped with its call and never binds a later unrelated call', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		await a.session.expectOutbound(true, 'first');
		frame(a, { callLogId: 'first', status: 'IN_PROGRESS' });
		await settle(2_000);
		a.adapters[0].emit({ status: 'ended' });
		await settle(100);
		await a.session.hangup(undefined, true);
		await settle(a.session.EXPECTED_LOG_LATE_MS + 2_000);
		// A later call, within the id's lifetime, which the page gave no id for.
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c2' });
		frame(a, { callLogId: 'second', status: 'RINGING', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('second');
		frame(a, {
			callLogId: 'second',
			status: 'COMPLETED',
			terminal: true,
			direction: 'inbound',
		});
		await settle(a.session.SERVER_END_GRACE_MS + 10);
		expect(a.adapters[0].hangup).toHaveBeenCalledTimes(1);
	});

	test('an id told while another call is up does not wait for the next call', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		frame(a, { callLogId: 'first', status: 'IN_PROGRESS' });
		await settle(30_000);
		// The push of a second incoming call: the phone refuses it, the id must not stick.
		await a.session.expectOutbound(true, 'second');
		a.adapters[0].emit({ status: 'ended' });
		await settle(100);
		await a.session.hangup(undefined, true);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c3' });
		frame(a, { callLogId: 'third', status: 'RINGING', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('third');
	});

	test('an id told long after the call rang does not bind it', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		ownLegRings(a);
		frame(a, { callLogId: 'x', status: 'IN_PROGRESS' });
		await settle(a.session.EXPECTED_LOG_LATE_MS + 5_000);
		await a.session.expectOutbound(true, 'late');
		frame(a, { callLogId: 'x', status: 'IN_PROGRESS' });
		await settle(500);
		expect(a.display().callLogId).toBe('x');
	});

	test('an id with on false is forgotten', async () => {
		const a = loadTab('A', new FakeTabs());
		await connect(a);
		await a.session.expectOutbound(true, 'gone');
		await a.session.expectOutbound(false, 'gone');
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		frame(a, { callLogId: 'real', status: 'RINGING', direction: 'inbound' });
		await settle(500);
		expect(a.display().callLogId).toBe('real');
	});
});
