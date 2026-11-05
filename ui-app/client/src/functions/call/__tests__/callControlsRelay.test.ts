/**
 * LZT-2166: the keypad and away controls run from any tab. A tab that does not hold the phone
 * sends them to the tab that does, and a tone the provider refuses comes back to the tab that
 * pressed it as the function's `error` event, never as `output`. The tab holding the phone runs
 * the real TeleCMI adapter over a fake PIOPIY SDK that refuses tones the way piopiyjs 0.26.6
 * does: an `error` event fired inside `sendDtmf`, before it returns.
 */
import { FunctionExecutionParameters } from '@fincity/kirun-js';

type Listener = (m: any) => void;

/** A lock and a channel shared by the tabs (as callTabs.test.ts). */
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

/** The PIOPIY SDK as far as the adapter uses it. */
class FakePiopiy {
	static instances: FakePiopiy[] = [];
	handlers = new Map<string, Array<(d: any) => void>>();
	/** What sendDtmf does: send (record the tone) or refuse with an SDK error event. */
	refuse?: { code: number; status: string };
	tones: string[] = [];
	login = jest.fn(() => Promise.resolve().then(() => this.fire('login', { code: 200 })));
	logout = jest.fn(() => Promise.resolve().then(() => this.fire('logout', {})));
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
	sendDtmf(tone: string) {
		if (this.refuse) this.fire('error', this.refuse);
		else this.tones.push(tone);
	}
}

interface Tab {
	name: string;
	session: typeof import('../session');
	fns: typeof import('../CallFunctions');
	fetches: number;
	last: () => any;
}

const writes: Record<string, any[]> = {};
const loaded: Tab[] = [];

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

class HiddenBrowser {
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

function loadTab(name: string, tabs: FakeTabs): Tab {
	let tab!: Tab;
	writes[name] = [];
	jest.isolateModules(() => {
		jest.doMock('../../../context/StoreContext', () => ({
			setData: (path: string, value: any) => writes[name].push({ path, value }),
		}));
		const registry = require('../registry');
		const { createTelecmiAdapter } = require('../telecmiAdapter');
		registry.registerCallProvider('telecmi', () =>
			createTelecmiAdapter({ loadSdk: async () => FakePiopiy }),
		);
		require('../tabs').setTabSync(tabs.forTab(name));
		const session = require('../session');
		const sounds = require('../sounds');
		session.useCallSounds(new sounds.CallSounds(() => new QuietOut()));
		const alerts = require('../alerts');
		session.useCallAlerts(new alerts.CallAlerts(() => new HiddenBrowser()));
		const t = {
			name,
			session,
			fns: require('../CallFunctions'),
			fetches: 0,
			last: () => writes[name][writes[name].length - 1]?.value,
		} as Tab;
		require('../credentials').setCredentialFetcher(async () => {
			t.fetches++;
			return { enabled: true, credential: `pw-${name}-${t.fetches}`, providerUserId: '5001_33' };
		});
		tab = t;
	});
	loaded.push(tab);
	return tab;
}

const flush = async () => {
	for (let i = 0; i < 40; i++) await Promise.resolve();
};

async function connect(tab: Tab) {
	const p = tab.session.connect('telecmi', undefined, 'Store.call', '_global', {
		credentialsFunction: 'LeadZumpV2.callAgentCredential',
	});
	await flush();
	return p;
}

function context(args: Record<string, any>) {
	return {
		getArguments: () => new Map(Object.entries(args)),
		getValuesMap: () => new Map([['Page.', { getPageName: () => '_global' }]]),
	} as unknown as FunctionExecutionParameters;
}

async function exec(fn: any, args: Record<string, any>) {
	const out = await fn.internalExecute(context(args));
	const er = out.allResults()[0];
	return { event: er.getName(), result: Object.fromEntries(er.getResult()) as any };
}

/** Tab A holds the phone with a connected call; tab B follows it. */
async function callUp() {
	const tabs = new FakeTabs();
	const a = loadTab('A', tabs);
	const b = loadTab('B', tabs);
	expect((await connect(a)).status).toBe('ready');
	await connect(b);
	const sdk = FakePiopiy.instances[FakePiopiy.instances.length - 1];
	sdk.fire('inComingCall', { call_id: 'c1', from: '919740485795' });
	sdk.fire('answered', { call_id: 'c1' });
	await flush();
	expect(b.last()).toMatchObject({ status: 'connected', otherTab: true });
	return { a, b, sdk };
}

beforeEach(() => {
	FakePiopiy.instances = [];
});

afterEach(async () => {
	for (const t of loaded.splice(0)) await t.session.disconnect();
	try {
		localStorage.clear();
	} catch {
		// No storage here.
	}
});

describe('LZT-2166: keypad and away from any tab', () => {
	test('a key pressed in a follower tab is sent by the tab holding the call', async () => {
		const { b, sdk } = await callUp();
		const r = await exec(new b.fns.SendDTMF(), { digit: '4' });
		expect(r.event).toBe('output');
		expect(sdk.tones).toEqual(['4']);
	});

	test.each([
		[1002, 'dtmf not allowed'],
		[1002, 'call not found'],
		[1005, 'invalid dtmf type'],
	])(
		'a key the SDK refuses (%s, %s) is an error in the tab that pressed it, never output',
		async (code, status) => {
			const { a, b, sdk } = await callUp();
			sdk.refuse = { code, status };
			const r = await exec(new b.fns.SendDTMF(), { digit: '9' });
			expect(r.event).toBe('error');
			expect(r.result.error).toBe(`TeleCMI would not send that key: ${status}`);
			expect(sdk.tones).toEqual([]);
			// The call goes on in both tabs; only the error is added.
			expect(a.last()).toMatchObject({
				status: 'connected',
				error: `TeleCMI would not send that key: ${status}`,
			});
			expect(b.last()).toMatchObject({ status: 'connected' });
		},
	);

	test('the same refusal in the tab holding the call is an error too', async () => {
		const { a, sdk } = await callUp();
		sdk.refuse = { code: 1002, status: 'dtmf not allowed' };
		const r = await exec(new a.fns.SendDTMF(), { digit: '1' });
		expect(r.event).toBe('error');
		expect(r.result.error).toBe('TeleCMI would not send that key: dtmf not allowed');
	});

	test('away from a follower signs the phone out in the tab holding it; available signs in again', async () => {
		const { a, b, sdk } = await callUp();
		// Refused while the call is up, from either tab.
		let r = await exec(new b.fns.Availability(), { available: false });
		expect(r.event).toBe('error');
		expect(r.result.error).toBe('Finish the call before going away.');

		sdk.fire('hangup', {});
		await flush();
		r = await exec(new b.fns.Availability(), { available: false });
		expect(r.event).toBe('output');
		await flush();
		expect(sdk.logout).toHaveBeenCalledTimes(1);
		expect(a.last()).toMatchObject({ status: 'idle', away: true });
		expect(b.last()).toMatchObject({ status: 'idle', away: true, otherTab: true });

		r = await exec(new b.fns.Availability(), { available: true });
		expect(r.event).toBe('output');
		await flush();
		// A fresh credential and a new phone, in the tab that holds the lock.
		expect(a.fetches).toBe(2);
		expect(b.fetches).toBe(0);
		expect(FakePiopiy.instances).toHaveLength(2);
		expect(FakePiopiy.instances[1].login).toHaveBeenCalledWith('5001_33', 'pw-A-2', expect.any(String));
		expect(a.last().status).toBe('ready');
		expect(a.last().away).toBeUndefined();
		expect(b.last()).toMatchObject({ status: 'ready', otherTab: true });
		// The credential never reaches a state any tab writes.
		expect(JSON.stringify(writes)).not.toContain('pw-A');
	});
});
