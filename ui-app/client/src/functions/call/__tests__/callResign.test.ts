/**
 * LZT-2762 step 2 of Shiva's plan (resign and take over): behind tabHealth and the takeover flag, a
 * phone tab that cannot keep its phone up signs it out, lets the lock go and queues again; another
 * tab takes the lock and signs the phone in; "Use this tab" asks the phone tab to give it up. Each "tab" is its own copy
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

const TAKEOVER = 'modlix.call.takeover';
const LOCK = 'modlix.call.fake';
const dropPhone = (t: Tab) => t.adapters[t.adapters.length - 1].emit({ status: 'registering' });

describe('resign and take over', () => {
	beforeEach(async () => {
		window.localStorage.setItem(TAKEOVER, 'on');
		await jest.advanceTimersByTimeAsync(6000);
	});

	test('a phone that dropped and stays down for 10 s is given up: the other tab takes it', async () => {
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(
			a.session.RESIGN_AFTER_MS + 2 * a.session.OWNER_BEAT_MS,
		);
		await flush();
		await flush();
		expect(a.adapters[0].disconnect).toHaveBeenCalled();
		expect(tabs.sent.some(x => x.tab === 'A' && x.m.t === 'resigned')).toBe(true);
		expect(tabs.holders.get(LOCK)).toBe('B');
		expect(b.adapters.length).toBe(1);
		expect(b.adapters[0].register).toHaveBeenCalledTimes(1);
		expect(b.last().phoneTab).toBe('here');
		// A follows now and is not signed in.
		expect(a.last().otherTab).toBe(true);
		expect(a.adapters.length).toBe(1);
	});

	test('the old phone is signed out before the new one signs in (never two at once)', async () => {
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(
			a.session.RESIGN_AFTER_MS + 2 * a.session.OWNER_BEAT_MS,
		);
		await flush();
		await flush();
		const out = a.adapters[0].disconnect.mock.invocationCallOrder[0];
		const signIn = b.adapters[0].register.mock.invocationCallOrder[0];
		expect(out).toBeDefined();
		expect(signIn).toBeDefined();
		expect(out).toBeLessThan(signIn);
	});

	test('the resigned tab queues again only after its wait, behind the tab that took over', async () => {
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(
			a.session.RESIGN_AFTER_MS + 2 * a.session.OWNER_BEAT_MS,
		);
		await flush();
		expect(tabs.waiters.get(LOCK)?.filter(w => w.tab === 'A' && !w.cancelled).length ?? 0).toBe(
			0,
		);
		await jest.advanceTimersByTimeAsync(a.session.RESIGN_REQUEUE_MS[0] + 100);
		expect(tabs.waiters.get(LOCK)?.some(w => w.tab === 'A' && !w.cancelled)).toBe(true);
		expect(tabs.holders.get(LOCK)).toBe('B');
	});

	test('no resign during a call', async () => {
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		dropPhone(a);
		a.adapters[0].emit({ status: 'connected' });
		await jest.advanceTimersByTimeAsync(40000);
		expect(tabs.sent.some(x => x.m.t === 'resigned')).toBe(false);
		expect(tabs.holders.get(LOCK)).toBe('A');
	});

	test('no resign when no other tab is there to take the phone', async () => {
		tabs.frozen.add('B');
		await jest.advanceTimersByTimeAsync(a.session.TAB_HERE_MS * 3);
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(40000);
		expect(tabs.sent.some(x => x.m.t === 'resigned')).toBe(false);
	});

	test('with the flag off nothing resigns', async () => {
		window.localStorage.removeItem(TAKEOVER);
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(40000);
		expect(tabs.sent.some(x => x.m.t === 'resigned')).toBe(false);
		expect(tabs.holders.get(LOCK)).toBe('A');
	});

	test('a short drop that comes back in time is not given up', async () => {
		dropPhone(a);
		await jest.advanceTimersByTimeAsync(4000);
		a.adapters[0].emit({ status: 'ready' });
		await jest.advanceTimersByTimeAsync(40000);
		expect(tabs.sent.some(x => x.m.t === 'resigned')).toBe(false);
	});

	test('"Use this tab" (Connect again in a follower) makes a stuck owner give the phone up', async () => {
		dropPhone(a);
		// The owner is not signed in for 10 s: the follower shows it, and the agent presses Retry.
		await jest.advanceTimersByTimeAsync(a.session.OWNER_UNSIGNED_MS + 2000);
		expect(b.last().ownerHealth).toBe('notSignedIn');
		await connect(b);
		await jest.advanceTimersByTimeAsync(a.session.OWNER_BEAT_MS);
		await flush();
		await flush();
		expect(tabs.sent.some(x => x.tab === 'B' && x.m.t === 'resign')).toBe(true);
		expect(tabs.holders.get(LOCK)).toBe('B');
		expect(b.adapters.length).toBe(1);
	});

	test('"Use this tab" with a frozen owner: no answer in 5 s says to close that tab, no second phone', async () => {
		tabs.frozen.add('A');
		await jest.advanceTimersByTimeAsync(
			a.session.OWNER_QUIET_MS + a.session.OWNER_PONG_MS + 3000,
		);
		expect(b.last().ownerHealth).toBe('stale');
		await connect(b);
		expect(tabs.sent.some(x => x.tab === 'B' && x.m.t === 'resign')).toBe(true);
		await jest.advanceTimersByTimeAsync(a.session.USE_THIS_TAB_WAIT_MS + 100);
		expect(b.last().error).toMatch(/not responding/);
		expect(tabs.holders.get(LOCK)).toBe('A');
		expect(b.adapters.length).toBe(0);
	});

	test('"Use this tab" while the owner is on a call is refused and the call stays', async () => {
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		await jest.advanceTimersByTimeAsync(a.session.OWNER_BEAT_MS);
		expect(b.session.useThisPhone()).toBe(true);
		await jest.advanceTimersByTimeAsync(200);
		expect(tabs.sent.some(x => x.tab === 'A' && x.m.t === 'resignDenied')).toBe(true);
		expect(tabs.holders.get(LOCK)).toBe('A');
		expect(a.adapters[0].disconnect).not.toHaveBeenCalled();
	});
});
export {};
