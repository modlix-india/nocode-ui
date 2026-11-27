/**
 * LZT-2762 step 1 of Shiva's plan (no echo): behind tabHealth, only the tab holding the phone
 * (owner) shares the server's call reports with the other tabs, a follower never posts them on,
 * and a report that did not change is not written to the store again. Each "tab" is its own copy
 * of the session module over a fake lock and channel.
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

const frame = (status: string, extra: Record<string, any> = {}) => ({
	callLogId: 'log-1',
	status,
	terminal: false,
	talkDuration: 0,
	at: Date.now(),
	...extra,
});
const liveWrites = (t: Tab) => writes[t.name].filter(x => x.path === 'Store.callLive');
const liveSent = (tab: string) => tabs.sent.filter(x => x.tab === tab && x.m.t === 'live');

describe('no echo of the live report', () => {
	test('a follower applies its own frame and never posts it to the other tabs', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		b.session.liveFrame(frame('RINGING'));
		await jest.advanceTimersByTimeAsync(50);
		expect(liveWrites(b).length).toBe(1);
		expect(liveSent('B').length).toBe(0);
		// The owner did not hear it from B, so it has not written anything.
		expect(liveWrites(a).length).toBe(0);
	});

	test('the owner posts a changed report once, the follower applies it and does not post it on', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		a.session.liveFrame(frame('RINGING'));
		await jest.advanceTimersByTimeAsync(50);
		expect(liveSent('A').length).toBe(1);
		expect(liveWrites(a).length).toBe(1);
		// B got it over the channel: written once, nothing posted back.
		expect(liveWrites(b).length).toBe(1);
		expect(liveWrites(b)[0].value.status).toBe('RINGING');
		expect(liveSent('B').length).toBe(0);
		// A later change posts again, once.
		a.session.liveFrame(frame('IN_PROGRESS', { answeredAt: Date.now() }));
		await jest.advanceTimersByTimeAsync(50);
		expect(liveSent('A').length).toBe(2);
		expect(liveSent('B').length).toBe(0);
		expect(liveWrites(b).length).toBe(2);
	});

	test('the same report again is not written again and not posted again', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		const f = frame('RINGING');
		a.session.liveFrame(f);
		await jest.advanceTimersByTimeAsync(50);
		const wrote = liveWrites(a).length;
		const wroteB = liveWrites(b).length;
		const sent = liveSent('A').length;
		for (let i = 0; i < 4; i++) {
			a.session.liveFrame({ ...f });
			b.session.liveFrame({ ...f });
		}
		await jest.advanceTimersByTimeAsync(50);
		expect(liveWrites(a).length).toBe(wrote);
		expect(liveSent('A').length).toBe(sent);
		// B had the owner's report; its own repeats only write once, for its own first sight of them.
		expect(liveWrites(b).length).toBeLessThanOrEqual(wroteB + 1);
		expect(liveSent('B').length).toBe(0);
	});

	test('a hang up in four tabs is not an echo storm: the owner posts it once', async () => {
		const c = loadTab('C', tabs);
		await connect(c);
		const d = loadTab('D', tabs);
		await connect(d);
		await jest.advanceTimersByTimeAsync(6000);
		const before = tabs.sent.length;
		const end = frame('COMPLETED', { terminal: true, talkDuration: 8 });
		for (const t of [a, b, c, d]) t.session.liveFrame({ ...end });
		await jest.advanceTimersByTimeAsync(200);
		const live = tabs.sent.slice(before).filter(x => x.m.t === 'live');
		expect(live.map(x => x.tab)).toEqual(['A']);
		for (const t of [a, b, c, d]) expect(liveWrites(t).length).toBeLessThanOrEqual(2);
	});

	test('a change still reaches a tab that missed its own frame', async () => {
		await jest.advanceTimersByTimeAsync(6000);
		a.session.liveFrame(frame('RINGING'));
		await jest.advanceTimersByTimeAsync(50);
		expect(liveWrites(b).at(-1)?.value.status).toBe('RINGING');
	});

	test('with tab health off the old behaviour stays: written every time, followers post on', async () => {
		for (const t of loaded.splice(0)) await t.session.disconnect();
		tabs = new FakeTabs();
		const x = loadTab('X', tabs);
		await connect(x, { tabHealth: false });
		const y = loadTab('Y', tabs);
		await connect(y, { tabHealth: false });
		await jest.advanceTimersByTimeAsync(1000);
		const f = frame('RINGING');
		y.session.liveFrame(f);
		y.session.liveFrame({ ...f });
		await jest.advanceTimersByTimeAsync(50);
		expect(liveWrites(y).length).toBeGreaterThanOrEqual(2);
		expect(liveSent('Y').length).toBe(1);
		// The other tab re-posts what it heard: the echo that step 2 removes (only behind tabHealth).
		expect(liveSent('X').length).toBeGreaterThanOrEqual(1);
	});
});
export {};
