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
	hold = jest.fn();
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
	browser: FakeBrowser;
}

/** A tab's view of the browser for the hidden tab alerts. */
class FakeBrowser {
	isHidden = true;
	pageTitle = 'Deals';
	perm = 'granted';
	requests = 0;
	notes: Array<{ body: string; closed: boolean }> = [];
	private visibility?: () => void;
	hidden() {
		return this.isHidden;
	}
	onVisibility(cb: () => void) {
		this.visibility = cb;
	}
	setHidden(h: boolean) {
		this.isHidden = h;
		this.visibility?.();
	}
	title() {
		return this.pageTitle;
	}
	setTitle(t: string) {
		this.pageTitle = t;
	}
	permission() {
		return this.perm;
	}
	async request() {
		this.requests++;
		this.perm = 'granted';
		return 'granted';
	}
	notify(_: string, body: string) {
		const n = { body, closed: false };
		this.notes.push(n);
		return {
			close: () => {
				n.closed = true;
			},
		};
	}
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
		const browser = new FakeBrowser();
		const alerts = require('../alerts');
		session.useCallAlerts(new alerts.CallAlerts(() => browser));
		tab = {
			name,
			session,
			adapters,
			last: () => writes[name][writes[name].length - 1]?.value,
			out,
			browser,
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
			alertsOffer: false,
			collapsed: false,
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

describe('call sounds and alerts across tabs', () => {
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

	test('only the hidden call tab alerts; Answer in the other tab ends its alerts', async () => {
		const { a, b, sdk } = await twoTabs();
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+9198' });
		await later(1000);
		expect(a.browser.pageTitle).toBe('Incoming call: +9198');
		expect(a.browser.notes).toEqual([{ body: '+9198', closed: false }]);
		expect(b.browser.pageTitle).toBe('Deals');
		expect(b.browser.notes).toEqual([]);

		await b.session.answer();
		await flush();
		expect(a.browser.pageTitle).toBe('Deals');
		expect(a.browser.notes).toEqual([{ body: '+9198', closed: true }]);
	});

	test('"Allow call alerts" in the other tab asks once and drops the offer in every tab', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		a.browser.perm = 'default';
		b.browser.perm = 'default';
		await connect(a);
		await connect(b);
		expect(a.last()).toMatchObject({ alertsOffer: true });
		expect(b.last()).toMatchObject({ alertsOffer: true });

		await b.session.callAlert({ allow: true });
		// The permission is the site's, shared by its tabs.
		a.browser.perm = 'granted';
		await flush();
		expect(b.browser.requests).toBe(1);
		expect(a.browser.requests).toBe(0);
		expect(a.last().alertsOffer).toBe(false);
		expect(b.last().alertsOffer).toBe(false);
	});
});

describe('the ended call summary across tabs (LZT-2119)', () => {
	async function endedMissedCall() {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		const sdk = a.adapters[0];
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'm1', from: '+919108489008' });
		sdk.emit({ status: 'ended' });
		await flush();
		expect(a.last()).toMatchObject({ status: 'ended', callId: 'm1' });
		expect(b.last()).toMatchObject({ status: 'ended', callId: 'm1', otherTab: true });
		return { tabs, a, b, sdk };
	}

	test('Close in the tab that does not hold the call clears the summary in every tab', async () => {
		const { a, b, sdk } = await endedMissedCall();
		await b.session.hangup(undefined, true);
		await flush();
		expect(b.last()).toMatchObject({ status: 'ready', otherTab: true });
		expect(b.last().callId).toBeUndefined();
		expect(a.last()).toMatchObject({ status: 'ready' });
		expect(a.last().callId).toBeUndefined();
		expect(sdk.hangup).not.toHaveBeenCalled();
	});

	test('Close in the tab holding the call clears it in the other tabs too, and keeps the sound setting', async () => {
		const { a, b } = await endedMissedCall();
		await a.session.sound({ on: false });
		await flush();
		await a.session.hangup(undefined, true);
		await flush();
		expect(a.last()).toMatchObject({ status: 'ready', soundOn: false });
		expect(b.last()).toMatchObject({ status: 'ready', soundOn: false, otherTab: true });
	});

	test('a tab opened or reloaded after the call ended shows no summary, even when the call tab writes again', async () => {
		const { tabs, a, b } = await endedMissedCall();
		tabs.closeTab('B');
		await b.session.disconnect();
		const b2 = loadTab('B2', tabs);
		expect(await connect(b2)).toMatchObject({ status: 'ready', otherTab: true });
		expect(b2.last().callId).toBeUndefined();

		// The call tab rewrites the same ended call (a sound toggle): still nothing in the new tab.
		await a.session.sound({ on: false });
		await flush();
		expect(a.last()).toMatchObject({ status: 'ended', callId: 'm1' });
		expect(b2.last()).toMatchObject({ status: 'ready', soundOn: false });

		// The next call shows everywhere as usual.
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'n2' });
		await flush();
		expect(b2.last()).toMatchObject({ status: 'ringing', callId: 'n2', otherTab: true });
	});

	test('Close with dismiss never hangs up a call that started meanwhile', async () => {
		const { a, b, sdk } = await endedMissedCall();
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'n2' });
		await flush();
		await b.session.hangup(undefined, true);
		await a.session.hangup(undefined, true);
		await flush();
		expect(sdk.hangup).not.toHaveBeenCalled();
		expect(a.last()).toMatchObject({ status: 'ringing', callId: 'n2' });
		expect(b.last()).toMatchObject({ status: 'ringing', callId: 'n2' });
	});
});

describe('one ring per call across tabs (LZT-2125)', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		localStorage.clear();
	});
	afterEach(() => jest.useRealTimers());

	const later = async (ms: number) => {
		jest.advanceTimersByTime(ms);
		await flush();
	};

	test('a call placed from the tab that took the sounds rings back there only, never in the call tab', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		const sdk = a.adapters[0];
		// The call tab cannot play; the user enabled sound in the other tab.
		a.out.blocked = true;
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'w1' });
		await later(1000);
		await b.session.sound({ unlock: true });
		await flush();
		sdk.emit({ status: 'ended' });
		await later(1000);
		a.out.blocked = false;
		a.out.played = [];
		b.out.played = [];

		// Click to call from B: the browser leg rings and B answers it at once with ringBack.
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'o1' });
		await flush();
		await b.session.answer(undefined, true);
		sdk.emit({ status: 'connected' });
		await later(5000);
		expect(b.out.loop).toBe('ringBack');
		expect(a.out.played).toEqual([]);
		expect(a.out.loop).toBeUndefined();
	});
});

describe('what the server says about the call, the same in every tab (LZT-2122, LZT-2119)', () => {
	const frame = (status: string, at: number, extra: any = {}) => ({
		callLogId: 'L1',
		dealId: 'D1',
		direction: 'outbound',
		status,
		terminal: false,
		at,
		...extra,
	});
	const callOf = (t: Tab) =>
		[...writes[t.name]].reverse().find(w => w.path === 'Store.call')?.value;
	const liveOf = (t: Tab) =>
		[...writes[t.name]].reverse().find(w => w.path === 'Store.callLive')?.value;

	test('a frame that only one tab received reaches every tab, with one answeredAt', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		const c = loadTab('C', tabs);
		await connect(a);
		await connect(b);
		await connect(c);

		// Only tab C (the one in front) got the frame; A and B were in the background.
		c.session.liveFrame(frame('IN_PROGRESS', 5000));
		await flush();
		for (const t of [a, b, c])
			expect(liveOf(t)).toMatchObject({
				callLogId: 'L1',
				status: 'IN_PROGRESS',
				answeredAt: 5000,
			});

		// The same frame arrives later in the other tabs: nothing moves, answeredAt stays the first.
		a.session.liveFrame(frame('IN_PROGRESS', 5400));
		b.session.liveFrame(frame('IN_PROGRESS', 5900));
		await flush();
		for (const t of [a, b, c]) expect(liveOf(t).answeredAt).toBe(5000);
	});

	test('the end reaches every tab and a late in-progress frame never walks it back', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		a.session.liveFrame(frame('IN_PROGRESS', 1000));
		a.session.liveFrame(frame('COMPLETED', 9000, { terminal: true, talkDuration: 8 }));
		await flush();
		expect(liveOf(b)).toMatchObject({ status: 'COMPLETED', terminal: true, talkDuration: 8 });
		b.session.liveFrame(frame('IN_PROGRESS', 9500));
		await flush();
		expect(liveOf(b)).toMatchObject({ terminal: true, answeredAt: 1000 });
		expect(liveOf(a)).toMatchObject({ terminal: true });
	});

	test('a new tab asks the call tab and gets what the server already said', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.session.liveFrame(frame('IN_PROGRESS', 2000));
		const b = loadTab('B', tabs);
		await connect(b);
		await flush();
		expect(liveOf(b)).toMatchObject({ status: 'IN_PROGRESS', answeredAt: 2000 });
	});

	test('a different call replaces the report; a frame without a call id is ignored', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		a.session.liveFrame(frame('COMPLETED', 3000, { terminal: true }));
		a.session.liveFrame({ status: 'IN_PROGRESS', at: 4000 });
		a.session.liveFrame(frame('RINGING', 6000, { callLogId: 'L2' }));
		await flush();
		expect(liveOf(b)).toMatchObject({
			callLogId: 'L2',
			status: 'RINGING',
			terminal: false,
			answeredAt: 0,
		});
	});

	test('without a connection the frame is written in this tab only', () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		a.session.liveFrame(frame('IN_PROGRESS', 700), 'Store.callLive');
		expect(liveOf(a)).toMatchObject({ status: 'IN_PROGRESS', answeredAt: 700 });
	});

	test('every tab asking to hang up the ended call leaves no error in the other tabs', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		const b = loadTab('B', tabs);
		await connect(a);
		await connect(b);
		const sdk = a.adapters[0];
		sdk.emit({ status: 'ringing', direction: 'outbound', callId: 'c1' });
		sdk.emit({ status: 'connected' });
		await flush();
		// The server said it ended: tab A hangs up, then tab B asks for the same hangup a moment late.
		// B asks while A's hangup is still on its way: the call tab has ended it by then and says ok.
		sdk.hangup.mockImplementation(() => sdk.emit({ status: 'ended' }));
		const pa = a.session.hangup();
		const pb = b.session.hangup();
		await Promise.all([pa, pb]);
		await flush();
		expect(b.last().error).toBeUndefined();
		expect(b.last().status).toBe('ended');
		expect(sdk.hangup).toHaveBeenCalledTimes(1);
	});

	test('the call tab ends a call the server says is over when the phone never reports it', async () => {
		jest.useFakeTimers();
		try {
			const tabs = new FakeTabs();
			const a = loadTab('A', tabs);
			const b = loadTab('B', tabs);
			const pa = connect(a);
			await jest.advanceTimersByTimeAsync(10);
			await pa;
			const pb = connect(b);
			await jest.advanceTimersByTimeAsync(500);
			await pb;
			const sdk = a.adapters[0];
			sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			sdk.emit({ status: 'connected' });
			const now = Date.now();
			// An end of an earlier call, before this call was bound to a server call: nothing happens.
			b.session.liveFrame(frame('COMPLETED', now, { callLogId: 'OLD', terminal: true }));
			await jest.advanceTimersByTimeAsync(5000);
			expect(callOf(a).status).toBe('connected');

			// The customer answers (a frame the background tab got), then hangs up: another tab heard it.
			b.session.liveFrame(frame('IN_PROGRESS', now + 100));
			b.session.liveFrame(
				frame('COMPLETED', now + 9000, { terminal: true, talkDuration: 8 }),
			);
			await jest.advanceTimersByTimeAsync(1500);
			expect(callOf(a).status).toBe('connected');
			await jest.advanceTimersByTimeAsync(1000);
			expect(sdk.hangup).toHaveBeenCalledWith('c1');
			expect(callOf(a).status).toBe('ended');
			expect(callOf(b).status).toBe('ended');
			expect(typeof callOf(a).endedAt).toBe('number');
		} finally {
			jest.useRealTimers();
		}
	});

	test('an end the phone reports first cancels the server end; a late end of another call never ends a new call', async () => {
		jest.useFakeTimers();
		try {
			const tabs = new FakeTabs();
			const a = loadTab('A', tabs);
			const pa = connect(a);
			await jest.advanceTimersByTimeAsync(10);
			await pa;
			const sdk = a.adapters[0];
			sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
			sdk.emit({ status: 'connected' });
			a.session.liveFrame(frame('IN_PROGRESS', Date.now()));
			a.session.liveFrame(frame('COMPLETED', Date.now(), { terminal: true }));
			sdk.emit({ status: 'ended' });
			await jest.advanceTimersByTimeAsync(3000);
			expect(sdk.hangup).not.toHaveBeenCalled();

			// A second call: the first call's repeated end (TeleCMI sends a second CDR) does nothing to it.
			sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c2' });
			sdk.emit({ status: 'connected' });
			a.session.liveFrame(frame('IN_PROGRESS', Date.now(), { callLogId: 'L2' }));
			a.session.liveFrame(frame('COMPLETED', Date.now(), { terminal: true }));
			await jest.advanceTimersByTimeAsync(3000);
			expect(callOf(a).status).toBe('connected');
		} finally {
			jest.useRealTimers();
		}
	});
});

describe('many tabs (LZT-2141)', () => {
	test('six tabs: one sign in, and live frames in every tab do not multiply into a storm', async () => {
		const tabs = new FakeTabs();
		let posts = 0;
		const orig = tabs.forTab.bind(tabs);
		tabs.forTab = (name: string) => {
			const t = orig(name);
			const open = t.open;
			t.open = (n: string, on: Listener) => {
				const ch = open(n, on);
				return {
					...ch,
					post: (m: any) => {
						posts++;
						ch.post(m);
					},
				};
			};
			return t;
		};
		const six = ['A', 'B', 'C', 'D', 'E', 'F'].map(n => loadTab(n, tabs));
		for (const t of six) await connect(t);
		expect(
			six.map(t => t.adapters.reduce((n, a) => n + a.register.mock.calls.length, 0)),
		).toEqual([1, 0, 0, 0, 0, 0]);
		posts = 0;
		// The server stream reaches every tab with every frame, as the page does (4 s poll too).
		for (let i = 0; i < 10; i++) {
			for (const t of six)
				t.session.liveFrame({
					callLogId: 'L1',
					status: 'IN_PROGRESS',
					terminal: false,
					at: 5000 + i * 1000,
				} as any);
			await flush();
		}
		expect(posts).toBeLessThan(200);
	});
});

describe('hold and the call bar view across tabs', () => {
	afterEach(() => localStorage.clear());

	test('Hold in a tab without the call acts on the call tab, and every tab shows it', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const sdk = a.adapters[0];
		sdk.emit({ status: 'ringing', direction: 'inbound', callId: 'c1', from: '+9198' });
		sdk.emit({ status: 'connected' });

		const b = loadTab('B', tabs);
		await connect(b);
		await b.session.hold(true);
		expect(sdk.hold).toHaveBeenCalledWith(true);
		await flush();
		expect(a.last().held).toBe(true);
		expect(b.last().held).toBe(true);

		await b.session.hold(false);
		await flush();
		expect(a.last().held).toBe(false);
		expect(b.last().held).toBe(false);
	});

	test('collapsing the bar in one tab collapses it in every tab', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		const b = loadTab('B', tabs);
		await connect(b);
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		await flush();

		b.session.setCallView({ collapsed: true });
		expect(b.last().collapsed).toBe(true);
		await flush();
		expect(a.last().collapsed).toBe(true);

		a.session.setCallView({ collapsed: false });
		await flush();
		expect(a.last().collapsed).toBe(false);
		expect(b.last().collapsed).toBe(false);
	});

	test('a tab opened after the bar was collapsed starts collapsed', async () => {
		const tabs = new FakeTabs();
		const a = loadTab('A', tabs);
		await connect(a);
		a.session.setCallView({ collapsed: true });
		a.adapters[0].emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });

		const c = loadTab('C', tabs);
		expect(await connect(c)).toMatchObject({
			status: 'ringing',
			collapsed: true,
			otherTab: true,
		});
	});
});
