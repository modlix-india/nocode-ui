/**
 * LZT-2762 step 1: the tabs check each other. The owner announces itself, a follower that hears
 * nothing asks, and a click to call from a follower never goes against a dead or signed out owner.
 * Each "tab" is its own copy of the session module over a fake lock and channel.
 */

type Listener = (m: any) => void;

class FakeTabs {
	holders = new Map<string, string>();
	waiters = new Map<string, Array<{ tab: string; onLead: () => void; cancelled: boolean }>>();
	channels: Array<{ tab: string; name: string; on: Listener; open: boolean }> = [];
	/** Tabs that neither receive nor send (frozen). */
	frozen = new Set<string>();
	sent: Array<{ tab: string; m: any }> = [];

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
				const list = self.waiters.get(name) ?? [];
				list.push(w);
				self.waiters.set(name, list);
				return () => {
					w.cancelled = true;
				};
			},
			release: (name: string) => {
				if (self.holders.get(name) === tab) self.handOver(name);
			},
			open: (name: string, on: Listener) => {
				const ch = { tab, name, on, open: true };
				self.channels.push(ch);
				return {
					post: (m: any) => {
						if (self.frozen.has(tab)) return;
						const copy = JSON.parse(JSON.stringify(m));
						self.sent.push({ tab, m: copy });
						for (const c of self.channels)
							if (c.open && c.name === name && c !== ch && !self.frozen.has(c.tab))
								Promise.resolve().then(
									() => c.open && !self.frozen.has(c.tab) && c.on(copy),
								);
					},
					close: () => {
						ch.open = false;
					},
				};
			},
		};
	}

	closeTab(tab: string) {
		for (const c of this.channels) if (c.tab === tab) c.open = false;
		for (const [name, holder] of Array.from(this.holders.entries()))
			if (holder === tab) this.handOver(name);
	}

	private handOver(name: string) {
		this.holders.delete(name);
		const list = this.waiters.get(name) ?? [];
		let next;
		while ((next = list.shift()) && next.cancelled);
		if (next) {
			this.holders.set(name, next.tab);
			next.onLead();
		}
	}
}

const writes: Record<string, Array<any>> = {};
const loaded: Tab[] = [];

class FakeAdapter {
	listener: (p: any) => void = () => {};
	load = jest.fn(async () => {});
	register = jest.fn(async () => {});
	answer = jest.fn();
	hangup = jest.fn();
	mute = jest.fn();
	hold = jest.fn();
	sendDtmf = jest.fn();
	disconnect = jest.fn();
	onStateChange(l: any) {
		this.listener = l;
	}
	emit(p: any) {
		this.listener(p);
	}
}

interface Tab {
	name: string;
	session: typeof import('../session');
	adapters: FakeAdapter[];
	last: () => any;
	calls: Array<{ fn: string; args: any }>;
}

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
		const out = {
			play: async () => 'playing',
			stop() {},
			unlock: async () => true,
			onUnlocked() {},
			setRingtone() {},
		};
		session.useCallSounds(new sounds.CallSounds(() => out));
		const alerts = require('../alerts');
		session.useCallAlerts(
			new alerts.CallAlerts(() => ({
				hidden: () => false,
				onVisibility() {},
				title: () => '',
				setTitle() {},
				permission: () => 'default',
				request: async () => 'default',
				notify: () => ({ close() {} }),
			})),
		);
		const calls: Array<{ fn: string; args: any }> = [];
		require('../credentials').setCredentialFetcher(async (fn: string, args: any) => {
			calls.push({ fn, args });
			return { enabled: true, credential: `secret-for-${name}`, providerUserId: 'agent-7' };
		});
		tab = {
			name,
			session,
			adapters,
			last: () => {
				const w = writes[name].filter(x => x.path === 'Store.call');
				return w[w.length - 1]?.value;
			},
			calls,
		};
	});
	loaded.push(tab);
	return tab;
}

const flush = async () => {
	await jest.advanceTimersByTimeAsync(1);
	for (let i = 0; i < 20; i++) await Promise.resolve();
};

async function connect(tab: Tab, extra: Record<string, any> = { tabHealth: true }) {
	const p = tab.session.connect(
		'fake',
		{ user: 'agent', password: 'pw-1' },
		'Store.call',
		'_global',
		{
			displayPath: 'Store.callDisplay',
			noteFunction: 'LeadZumpV2.callClientNote',
			...extra,
		},
	);
	await flush();
	await flush();
	return p;
}

const display = (t: Tab) => {
	const w = writes[t.name].filter(x => x.path === 'Store.callDisplay');
	return w[w.length - 1]?.value;
};

const noteCalls = (t: Tab) => t.calls.filter(c => c.fn === 'LeadZumpV2.callClientNote');

let tabs: FakeTabs;
let a: Tab;
let b: Tab;

beforeEach(async () => {
	jest.useFakeTimers({ now: 1_793_800_000_000 });
	Object.defineProperty(window, 'sessionStorage', {
		configurable: true,
		value: { getItem: () => null, setItem() {}, removeItem() {} },
	});
	window.localStorage.clear();
	tabs = new FakeTabs();
	a = loadTab('A', tabs);
	await connect(a);
	b = loadTab('B', tabs);
	await connect(b);
});

afterEach(async () => {
	for (const t of loaded.splice(0)) await t.session.disconnect();
	jest.useRealTimers();
});

describe('owner health', () => {
	test('the owner beats and the follower shows the phone in another tab', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		expect(tabs.sent.some(x => x.tab === 'A' && x.m.t === 'beat' && x.m.signedIn)).toBe(true);
		expect(a.last().phoneTab).toBe('here');
		expect(display(a).phoneTab).toBe('here');
		expect(b.last().phoneTab).toBe('other');
		expect(b.last().ownerHealth).toBe('ok');
		expect(display(b).phoneTab).toBe('other');
	});

	test('owner frozen: the follower pings, then shows the phone as not responding', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		tabs.frozen.add('A');
		await jest.advanceTimersByTimeAsync(OWNER(b).quiet + 2500);
		expect(tabs.sent.some(x => x.tab === 'B' && x.m.t === 'ping')).toBe(true);
		expect(b.last().ownerHealth).toBe('checking');
		await jest.advanceTimersByTimeAsync(OWNER(b).pong + 500);
		expect(b.last().ownerHealth).toBe('stale');
		expect(b.last().phoneTab).toBe('stale');
		expect(display(b).phoneTab).toBe('stale');
		// The owner thaws: its next message shows it healthy again.
		tabs.frozen.delete('A');
		await jest.advanceTimersByTimeAsync(OWNER(b).beat * 2);
		expect(b.last().ownerHealth).toBe('ok');
	});

	test('click to call from a follower with a frozen owner is refused and relays nothing', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		tabs.frozen.add('A');
		const before = tabs.sent.length;
		const p = b.session.expectOutbound(true);
		const done = expect(p).rejects.toThrow(/not responding, and it cannot be released/);
		await jest.advanceTimersByTimeAsync(b.session.CLICK_PROBE_MS + 50);
		await done;
		expect(tabs.sent.slice(before).some(x => x.m.t === 'cmd')).toBe(false);
		expect(b.last().ownerHealth).toBe('stale');
	});

	test('click from a follower while the owner is not signed in is refused with the plain message', async () => {
		a.adapters[0].emit({ status: 'registering' });
		await jest.advanceTimersByTimeAsync(1000);
		const p = b.session.expectOutbound(true);
		const done = expect(p).rejects.toThrow(
			'Your browser phone is not ready in another tab. Use that tab or reload this one.',
		);
		await jest.advanceTimersByTimeAsync(300);
		await done;
		// The owner is asked to sign in again.
		expect(tabs.sent.some(x => x.m.t === 'cmd' && x.m.op === 'repair')).toBe(true);
	});

	test('owner not signed in for 10 s shows the follower a phone that is not responding', async () => {
		a.adapters[0].emit({ status: 'registering' });
		await jest.advanceTimersByTimeAsync(OWNER(b).unsigned + 6000);
		expect(b.last().ownerHealth).toBe('notSignedIn');
		expect(b.last().phoneTab).toBe('stale');
	});

	test('click from a follower with a healthy owner relays Expect and the owner answers its own leg', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		const p = b.session.expectOutbound(true);
		await jest.advanceTimersByTimeAsync(100);
		await p;
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await jest.advanceTimersByTimeAsync(50);
		expect(a.adapters[0].answer).toHaveBeenCalledWith('c1');
		// The id the server answered is passed on, and the placement is noted on the row.
		await b.session.expectOutbound(true, 'log-9').catch(() => undefined);
		await jest.advanceTimersByTimeAsync(100);
		expect(noteCalls(b).length).toBe(1);
		expect(noteCalls(b)[0].args.callLogId).toBe('log-9');
		expect(noteCalls(b)[0].args.note).toMatch(
			/placedFromFollower role=follower tab=\S+ owner=ok/,
		);
	});

	test('a failed probe is kept and goes with the next note', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		tabs.frozen.add('A');
		const p = b.session.expectOutbound(true);
		const done = expect(p).rejects.toThrow();
		await jest.advanceTimersByTimeAsync(2000);
		await done;
		tabs.frozen.delete('A');
		await jest.advanceTimersByTimeAsync(6000);
		await b.session.expectOutbound(true, 'log-1');
		await jest.advanceTimersByTimeAsync(50);
		expect(noteCalls(b)[0].args.note).toMatch(/probeFailed:stale.*placedFromFollower/);
		expect(noteCalls(b)[0].args.note.length).toBeLessThanOrEqual(400);
	});

	test('relay timeouts: controls 5 s, Expect with an id 2 s, and the owner is then being checked', async () => {
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		await jest.advanceTimersByTimeAsync(6000);
		tabs.frozen.add('A');
		const e = b.session.expectOutbound(true, 'log-2');
		const eDone = expect(e).rejects.toThrow(/did not respond/);
		await jest.advanceTimersByTimeAsync(b.session.RELAY_TIMEOUT_EXPECT_MS + 10);
		await eDone;
		expect(b.last().ownerHealth).toBe('checking');
		const h = b.session.hangup();
		const hDone = expect(h).rejects.toThrow(/did not respond/);
		await jest.advanceTimersByTimeAsync(b.session.RELAY_TIMEOUT_MS - 1000);
		let settled = false;
		h.catch(() => (settled = true));
		await jest.advanceTimersByTimeAsync(0);
		expect(settled).toBe(false);
		await jest.advanceTimersByTimeAsync(1100);
		await hDone;
	});

	test('owner closes: the follower takes over and signs in (regression)', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		tabs.closeTab('A');
		await flush();
		await flush();
		expect(b.adapters.length).toBe(1);
		expect(b.adapters[0].register).toHaveBeenCalledTimes(1);
		expect(b.last().otherTab).toBeUndefined();
		expect(b.last().phoneTab).toBe('here');
		await jest.advanceTimersByTimeAsync(6000);
		expect(tabs.sent.some(x => x.tab === 'B' && x.m.t === 'beat')).toBe(true);
	});

	test('two followers: only one signs in when the owner closes', async () => {
		const c = loadTab('C', tabs);
		await connect(c);
		await jest.advanceTimersByTimeAsync(6000);
		tabs.closeTab('A');
		await flush();
		await flush();
		expect(b.adapters.length + c.adapters.length).toBe(1);
		expect(tabs.holders.get('modlix.call.fake')).toBe('B');
	});
});

describe('the placing watchdog and Retry', () => {
	test('no agent leg in 10 s: placeFailed, the phone signs in again, then a retry is offered', async () => {
		await a.session.expectOutbound(true);
		await jest.advanceTimersByTimeAsync(a.session.PLACE_WATCH_MS - 100);
		expect(a.last().placeFailed).toBeUndefined();
		await jest.advanceTimersByTimeAsync(200);
		expect(a.last().placeFailed).toBe('browserNotConnected');
		expect(display(a).placeFailed).toBe('browserNotConnected');
		await jest.advanceTimersByTimeAsync(100);
		expect(a.adapters.length).toBe(2);
		expect(a.adapters[0].disconnect).toHaveBeenCalled();
		expect(a.adapters[1].register).toHaveBeenCalled();
		expect(a.last().status).toBe('ready');
		expect(a.last().retryOffer).toBe(true);
		// Call again clears it.
		await a.session.expectOutbound(true);
		expect(a.last().placeFailed).toBeUndefined();
		expect(a.last().retryOffer).toBeUndefined();
		// The follower sees it too.
		await jest.advanceTimersByTimeAsync(10);
	});

	test('the leg rings in time: no watchdog', async () => {
		await a.session.expectOutbound(true);
		await jest.advanceTimersByTimeAsync(3000);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await jest.advanceTimersByTimeAsync(a.session.PLACE_WATCH_MS + 1000);
		expect(a.last().placeFailed).toBeUndefined();
		expect(a.adapters.length).toBe(1);
	});

	test('Expect off (placing failed) stops the watchdog; a call up is never repaired', async () => {
		await a.session.expectOutbound(true);
		await a.session.expectOutbound(false);
		await jest.advanceTimersByTimeAsync(a.session.PLACE_WATCH_MS + 1000);
		expect(a.adapters.length).toBe(1);
	});

	test('the watchdog note carries the exact call id and the tab facts', async () => {
		await a.session.expectOutbound(true);
		await a.session.expectOutbound(true, 'log-5');
		await jest.advanceTimersByTimeAsync(a.session.PLACE_WATCH_MS + 200);
		const n = noteCalls(a);
		expect(n.length).toBe(1);
		expect(n[0].args.callLogId).toBe('log-5');
		expect(n[0].args.note).toMatch(/placeWatchdog role=owner .*tabs=2/);
	});

	test('Retry (Connect again) signs a phone stuck registering in again, in place', async () => {
		a.adapters[0].emit({ status: 'registering' });
		await jest.advanceTimersByTimeAsync(5000);
		await connect(a);
		expect(a.adapters.length).toBe(1);
		await jest.advanceTimersByTimeAsync(a.session.REG_STUCK_MS);
		await connect(a);
		await jest.advanceTimersByTimeAsync(50);
		expect(a.adapters.length).toBe(2);
		expect(a.last().status).toBe('ready');
		expect(tabs.holders.get('modlix.call.fake')).toBe('A');
	});

	test('Connect on a healthy phone keeps the session (LZT-2141)', async () => {
		await connect(a);
		await jest.advanceTimersByTimeAsync(50);
		expect(a.adapters.length).toBe(1);
		expect(a.adapters[0].disconnect).not.toHaveBeenCalled();
	});
});

describe('Expect with no connection', () => {
	test('Expect off with no phone is a no-op (a page runs it for every call, also with calling off)', async () => {
		await a.session.disconnect();
		await expect(a.session.expectOutbound(false)).resolves.toMatchObject({ status: 'idle' });
		await expect(a.session.expectOutbound(true)).rejects.toThrow(/No call connection/);
	});
});

describe('kill switch', () => {
	test('without tabHealth nothing new runs and the state is as before', async () => {
		tabs = new FakeTabs();
		const x = loadTab('X', tabs);
		await connect(x, {});
		const y = loadTab('Y', tabs);
		await connect(y, {});
		await jest.advanceTimersByTimeAsync(60000);
		expect(tabs.sent.some(m => ['beat', 'ping', 'pong', 'here'].includes(m.m.t))).toBe(false);
		expect(x.last().phoneTab).toBeUndefined();
		expect(y.last().phoneTab).toBeUndefined();
		expect('phoneTab' in display(y)).toBe(false);
		// A click to call is relayed as before, with the old timeout.
		tabs.frozen.add('X');
		const p = y.session.expectOutbound(true);
		const done = expect(p).rejects.toThrow(/did not respond/);
		await jest.advanceTimersByTimeAsync(y.session.TAB_COMMAND_TIMEOUT_MS + 10);
		await done;
		await x.session.expectOutbound(true);
		await jest.advanceTimersByTimeAsync(60000);
		expect(x.adapters.length).toBe(1);
		expect(x.last().placeFailed).toBeUndefined();
	});

	test("localStorage 'modlix.call.tabHealth' = 'off' turns it off even when the page asks", async () => {
		window.localStorage.setItem('modlix.call.tabHealth', 'off');
		tabs = new FakeTabs();
		const x = loadTab('X', tabs);
		await connect(x);
		const y = loadTab('Y', tabs);
		await connect(y);
		await jest.advanceTimersByTimeAsync(30000);
		expect(tabs.sent.some(m => ['beat', 'ping', 'here'].includes(m.m.t))).toBe(false);
		expect(y.last().phoneTab).toBeUndefined();
	});
});

/** The constants, read from a tab's session module. */
function OWNER(t: Tab) {
	return {
		quiet: t.session.OWNER_QUIET_MS,
		pong: t.session.OWNER_PONG_MS,
		beat: t.session.OWNER_BEAT_MS,
		unsigned: t.session.OWNER_UNSIGNED_MS,
	};
}
export {};
