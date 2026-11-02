/**
 * One call shared by the tabs of a site: one tab signs in and holds the audio, the others mirror
 * its state and send Answer, Mute and Hangup to it; a closed or reloaded call tab ends the call
 * and the next load shows it as ended. Each "tab" is its own copy of the session module, wired
 * to a fake lock and channel shared between them.
 */

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

	/** The tab is gone (closed or reloaded): its lock and channels go with it. */
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
	out: FakeOut;
}

/** A tab's speaker: what it played, and whether the browser lets it play. */
class FakeOut {
	played: string[] = [];
	loop?: string;
	blocked = false;
	private unlocked?: () => void;
	async play(tone: string, loop: boolean) {
		this.loop = undefined;
		if (this.blocked) return 'blocked';
		this.played.push(loop ? tone : `${tone} once`);
		if (loop) this.loop = tone;
		return 'playing';
	}
	stop() {
		this.loop = undefined;
	}
	async unlock() {
		this.blocked = false;
		this.unlocked?.();
		return true;
	}
	onUnlocked(cb: () => void) {
		this.unlocked = cb;
	}
	setRingtone() {}
}

function loadTab(name: string, tabs: FakeTabs): Tab {
	let tab!: Tab;
	writes[name] = [];
	jest.isolateModules(() => {
		jest.doMock('../../../context/StoreContext', () => ({
			setData: (path: string, value: any) => writes[name].push({ path, value }),
		}));
		const registry = require('../registry');
		const tabsModule = require('../tabs');
		const session = require('../session');
		const adapters: FakeAdapter[] = [];
		registry.registerCallProvider('fake', () => {
			const a = new FakeAdapter();
			adapters.push(a);
			return a;
		});
		tabsModule.setTabSync(tabs.forTab(name));
		const out = new FakeOut();
		const sounds = require('../sounds');
		session.useCallSounds(new sounds.CallSounds(() => out));
		tab = {
			name,
			session,
			adapters,
			last: () => writes[name][writes[name].length - 1]?.value,
			out,
		};
	});
	loaded.push(tab);
	return tab;
}

const flush = async () => {
	for (let i = 0; i < 20; i++) await Promise.resolve();
};

async function connect(tab: Tab) {
	const p = tab.session.connect(
		'fake',
		{ user: 'agent', password: 'pw-1' },
		'Store.call',
		'_global',
	);
	await flush();
	return p;
}

let store: Record<string, string>;

beforeEach(() => {
	store = {};
	Object.defineProperty(window, 'sessionStorage', {
		configurable: true,
		value: {
			getItem: (k: string) => (k in store ? store[k] : null),
			setItem: (k: string, v: string) => {
				store[k] = String(v);
			},
			removeItem: (k: string) => {
				delete store[k];
			},
		},
	});
});

afterEach(async () => {
	// Every tab's unload hooks stay on the shared window: end each test with no call held.
	for (const t of loaded.splice(0)) await t.session.disconnect();
});

describe('one call across tabs', () => {
	test('only the first tab signs in; the second mirrors its state', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);

		expect((await connect(a)).status).toBe('ready');
		expect(a.adapters).toHaveLength(1);

		const sb = await connect(b);
		expect(b.adapters).toHaveLength(0);
		expect(sb).toMatchObject({ status: 'ready', otherTab: true });

		a.adapters[0].emit({
			status: 'ringing',
			direction: 'inbound',
			callId: 'c1',
			from: '+9198',
		});
		a.adapters[0].emit({ status: 'connected' });
		await flush();
		expect(a.last()).toMatchObject({ status: 'connected', callId: 'c1' });
		expect(a.last().otherTab).toBeUndefined();
		expect(b.last()).toMatchObject({
			status: 'connected',
			callId: 'c1',
			startedAt: a.last().startedAt,
			otherTab: true,
		});
		expect(JSON.stringify(writes)).not.toContain('pw-1');
	});

	test('a tab opened during a call gets the call, and Answer, Mute and Hangup there act on the call tab', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const sdk = a.adapters[0];
		sdk.answer.mockImplementation(() => sdk.emit({ status: 'connected' }));
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+9198' });

		const b = loadTab('B', tabs);
		expect(await connect(b)).toMatchObject({ status: 'ringing', callId: 'c1', otherTab: true });

		await b.session.answer();
		expect(sdk.answer).toHaveBeenCalledWith('c1');
		await flush();
		expect(b.last()).toMatchObject({ status: 'connected', otherTab: true });

		await b.session.mute(true);
		expect(sdk.mute).toHaveBeenCalledWith(true);
		await flush();
		expect(a.last().muted).toBe(true);
		expect(b.last().muted).toBe(true);

		await b.session.hangup();
		expect(sdk.hangup).toHaveBeenCalledWith('c1');
		await flush();
		expect(a.last()).toMatchObject({ status: 'ended', muted: false });
		expect(typeof a.last().endedAt).toBe('number');
		expect(b.last()).toMatchObject({ status: 'ended', otherTab: true });
	});

	test("the call tab's refusal comes back to the other tab as the error", async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const b = loadTab('B', tabs);
		await connect(b);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await flush();
		a.adapters[0].answer.mockImplementation(() => {
			throw new Error('sdk refused');
		});
		await expect(b.session.answer()).rejects.toThrow('sdk refused');
	});

	test('no answer from the call tab: a clear error after the timeout', async () => {
		jest.useFakeTimers();
		try {
			const tabs = new FakeTabs();
			const a = loadTab('A', tabs);
			const pa = connect(a);
			await jest.advanceTimersByTimeAsync(10);
			await pa;
			a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			a.adapters[0].emit({ status: 'connected' });
			const b = loadTab('B', tabs);
			const pb = connect(b);
			await jest.advanceTimersByTimeAsync(10);
			await pb;
			// The call tab is frozen: its channel no longer answers.
			for (const c of tabs.channels) if (c.tab === 'A') c.on = () => {};
			const h = b.session.hangup();
			const done = expect(h).rejects.toThrow(/Open the tab with the call/);
			await jest.advanceTimersByTimeAsync(b.session.TAB_COMMAND_TIMEOUT_MS + 1);
			await done;
		} finally {
			jest.useRealTimers();
		}
	});

	test('a second tab reloading does not sign in again, so the call stays up', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		await connect(loadTab('B', tabs));

		tabs.closeTab('B');
		const b2 = loadTab('B', tabs);
		expect(await connect(b2)).toMatchObject({
			status: 'connected',
			callId: 'c1',
			otherTab: true,
		});
		expect(b2.adapters).toHaveLength(0);
		expect(a.adapters[0].disconnect).not.toHaveBeenCalled();
	});

	test('the call tab closing: the call ends, another tab signs in and shows it as ended', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		const b = loadTab('B', tabs);
		await connect(b);

		tabs.closeTab('A');
		await flush();
		expect(b.adapters).toHaveLength(1);
		expect(b.adapters[0].register).toHaveBeenCalled();
		expect(b.last()).toMatchObject({ status: 'ended', callId: 'c1', endReason: 'pageClosed' });
		expect(b.last().otherTab).toBeUndefined();

		// The next call there starts clean.
		b.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c2' });
		expect(b.last()).toEqual({
			status: 'ringing',
			direction: 'inbound',
			callId: 'c2',
			from: undefined,
			to: undefined,
			muted: false,
			soundOn: true,
			audioBlocked: false,
		});
	});
});

describe('reload of the tab holding the call', () => {
	test('warns before unload only while a call is up in this tab', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const ev = () => {
			const e = new Event('beforeunload', { cancelable: true }) as any;
			window.dispatchEvent(e);
			return e;
		};
		expect(ev().defaultPrevented).toBe(false);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		a.adapters[0].emit({ status: 'connected' });
		const e = ev();
		expect(e.defaultPrevented).toBe(true);
		a.adapters[0].emit({ status: 'ended' });
		await a.session.disconnect();
	});

	test('on the way out the call is hung up and remembered; after the reload it shows as ended', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c9', from: '+91' });
		a.adapters[0].emit({ status: 'connected' });
		const startedAt = a.last().startedAt;

		window.dispatchEvent(new Event('pagehide'));
		expect(a.adapters[0].hangup).toHaveBeenCalledWith('c9');
		expect(JSON.parse(store[a.session.LOST_CALL_KEY])).toMatchObject({
			callId: 'c9',
			startedAt,
		});
		await a.session.disconnect();
		tabs.closeTab('A');

		const a2 = loadTab('A', tabs);
		const s = await connect(a2);
		expect(s).toMatchObject({
			status: 'ended',
			callId: 'c9',
			from: '+91',
			startedAt,
			endReason: 'pageClosed',
		});
		expect(s.endedAt).toBeGreaterThanOrEqual(startedAt);
		expect(store[a.session.LOST_CALL_KEY]).toBeUndefined();
		await a2.session.disconnect();
	});
});

describe('call sounds across tabs', () => {
	const later = async (ms: number) => {
		jest.advanceTimersByTime(ms);
		await flush();
	};

	beforeEach(() => {
		jest.useFakeTimers();
		localStorage.clear();
	});
	afterEach(() => jest.useRealTimers());

	async function twoTabs() {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		return { a, b, sdk: a.adapters[0] };
	}

	test('only the tab holding the call rings; Answer in the other tab stops it', async () => {
		const { a, b, sdk } = await twoTabs();
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await later(1000);
		expect(a.out.loop).toBe('incoming');
		expect(b.out.played).toEqual([]);

		const p = b.session.answer();
		await flush();
		expect(a.out.loop).toBeUndefined();
		await p;
		expect(sdk.answer).toHaveBeenCalled();
		sdk.emit({ status: 'connected' });
		sdk.emit({ status: 'ended' });
		await later(1000);
		expect(a.out.played).toEqual(['incoming', 'end once']);
		expect(b.out.played).toEqual([]);
	});

	test('sound off in another tab silences the call tab, and every tab shows it', async () => {
		const { a, b, sdk } = await twoTabs();
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await later(1000);
		await b.session.sound({ on: false });
		await flush();
		expect(a.out.loop).toBeUndefined();
		expect(a.last()).toMatchObject({ status: 'ringing', soundOn: false });
		expect(b.last()).toMatchObject({ status: 'ringing', soundOn: false });
	});

	test('the leg of a call placed from the other tab rings back, not in, until the far end answers', async () => {
		const { a, b, sdk } = await twoTabs();
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await flush();
		await b.session.answer(undefined, true);
		sdk.emit({ status: 'connected' });
		await later(3000);
		expect(a.out.played).toEqual(['ringBack']);
		expect(a.out.loop).toBe('ringBack');
		expect(b.last()).toMatchObject({ status: 'connected', ringBack: true });

		await b.session.sound({ ringBack: false });
		await flush();
		expect(a.out.loop).toBeUndefined();
		expect(b.out.played).toEqual([]);
	});

	test('the call tab cannot play: a tap in another tab moves the sounds there', async () => {
		const { a, b, sdk } = await twoTabs();
		a.out.blocked = true;
		b.out.blocked = true;
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await flush();
		await later(1000);
		expect(a.last()).toMatchObject({ audioBlocked: true });
		expect(b.last()).toMatchObject({ audioBlocked: true, otherTab: true });

		await b.session.sound({ unlock: true });
		await flush();
		expect(b.out.loop).toBe('incoming');
		expect(a.out.loop).toBeUndefined();
		expect(b.last()).toMatchObject({ audioBlocked: false, soundTab: b.session.TAB_ID });

		sdk.emit({ status: 'ended' });
		await flush();
		expect(b.out.played).toEqual(['incoming', 'end once']);
		expect(a.out.played).toEqual([]);
	});
});
