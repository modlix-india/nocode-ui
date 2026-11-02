/**
 * Hidden tab call alerts in one tab, with a fake provider and a fake browser: the blinking title
 * and the notification while an incoming call rings in a hidden tab, both gone on answer,
 * decline, end or when the tab is shown; caller details from the page; the "Allow call alerts"
 * offer (never a prompt during a ring) and the calls that never alert.
 */
import { FunctionExecutionParameters } from '@fincity/kirun-js';

const writes: Array<{ path: string; value: any }> = [];
jest.mock('../../../context/StoreContext', () => ({
	setData: (path: string, value: any) => writes.push({ path, value }),
	getDataFromPath: (path: string) => (path === 'Store.auth.user.id' ? 110 : undefined),
}));

const resumePush = jest.fn(async () => {});
jest.mock('../../../util/pushRegistration', () => ({ resumePush: () => resumePush() }));

import { Alert, Answer, Connect, Hangup } from '..';
import {
	ALERT_KEY,
	AlertOut,
	AlertPermission,
	CallAlerts,
	createBrowserAlertOut,
	TITLE_BLINK_MS,
} from '../alerts';
import { registerCallProvider, unregisterCallProvider } from '../registry';
import * as session from '../session';
import { CallSounds, PlayResult, SoundOut } from '../sounds';
import { CallAdapter, CallStateListener } from '../types';

class FakeAdapter implements CallAdapter {
	listener: CallStateListener = () => {};
	load = jest.fn(async () => {});
	register = jest.fn(async () => {});
	answer = jest.fn();
	hangup = jest.fn();
	mute = jest.fn();
	disconnect = jest.fn();
	onStateChange(l: CallStateListener) {
		this.listener = l;
	}
	emit(patch: any) {
		this.listener(patch);
	}
}

class SilentOut implements SoundOut {
	async play(): Promise<PlayResult> {
		return 'playing';
	}
	stop() {}
	async unlock() {
		return true;
	}
	onUnlocked() {}
	setRingtone() {}
}

interface Note {
	title: string;
	body: string;
	tag: string;
	click: () => void;
	closed: boolean;
}

/** The browser as the alerts see it: visibility, the title, permission and notifications. */
class FakeBrowser implements AlertOut {
	isHidden = true;
	pageTitle = 'Deals - LeadZump';
	titles: string[] = [];
	perm: AlertPermission = 'granted';
	answer: AlertPermission = 'granted';
	requests = 0;
	notes: Note[] = [];
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
		this.titles.push(t);
	}
	permission() {
		return this.perm;
	}
	async request() {
		this.requests++;
		this.perm = this.answer;
		return this.answer;
	}
	notify(title: string, body: string, tag: string, click: () => void) {
		const n: Note = { title, body, tag, click, closed: false };
		this.notes.push(n);
		return {
			close: () => {
				n.closed = true;
			},
		};
	}
	open() {
		return this.notes.filter(n => !n.closed);
	}
}

let adapter: FakeAdapter;
let browser: FakeBrowser;
let alerts: CallAlerts;

function context(args: Record<string, any>) {
	return {
		getArguments: () => new Map(Object.entries(args)),
		getValuesMap: () => new Map([['Page.', { getPageName: () => 'shell' }]]),
	} as unknown as FunctionExecutionParameters;
}

async function exec(fn: any, args: Record<string, any> = {}) {
	const o = await fn.internalExecute(context(args));
	const er = o.allResults()[0];
	return { event: er.getName(), result: Object.fromEntries(er.getResult()) as any };
}

const flush = async () => {
	for (let i = 0; i < 20; i++) await Promise.resolve();
};
const last = () => writes[writes.length - 1].value;

async function ring(patch: any = {}) {
	adapter.emit({
		status: 'ringing',
		direction: 'inbound',
		callId: 'c1',
		from: '+919108489008',
		...patch,
	});
	await flush();
}

async function after(ms: number) {
	jest.advanceTimersByTime(ms);
	await flush();
}

async function connect() {
	await exec(new Connect(), {
		provider: 'fake',
		credentials: { userId: 'a', password: 'p' },
		statePath: 'Store.call',
	});
}

beforeEach(async () => {
	jest.useFakeTimers();
	await session.disconnect();
	localStorage.clear();
	writes.length = 0;
	browser = new FakeBrowser();
	session.useCallSounds(new CallSounds(() => new SilentOut()));
	alerts = session.useCallAlerts(new CallAlerts(() => browser));
	registerCallProvider('fake', () => (adapter = new FakeAdapter()));
	await connect();
});

afterEach(async () => {
	await session.disconnect();
	jest.useRealTimers();
});

afterAll(() => unregisterCallProvider('fake'));

describe('hidden tab', () => {
	test('the title blinks with the caller and a notification shows; Answer ends both', async () => {
		await ring();
		expect(alerts.alerting()).toEqual({ title: false, note: false });
		await after(1000);
		expect(browser.pageTitle).toBe('Incoming call: +919108489008');
		expect(browser.open()).toEqual([
			expect.objectContaining({
				title: 'Incoming call',
				body: '+919108489008',
				tag: 'modlix-call-c1',
			}),
		]);
		await after(TITLE_BLINK_MS);
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		await after(TITLE_BLINK_MS);
		expect(browser.pageTitle).toBe('Incoming call: +919108489008');

		await exec(new Answer(), {});
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		expect(browser.open()).toEqual([]);
		adapter.emit({ status: 'connected' });
		await after(5000);
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		expect(browser.notes).toHaveLength(1);
	});

	test('decline and the caller hanging up end the alerts', async () => {
		await ring();
		await after(1000);
		await exec(new Hangup(), {});
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		expect(browser.open()).toEqual([]);

		await ring({ callId: 'c2' });
		await after(1000);
		expect(browser.open()).toHaveLength(1);
		adapter.emit({ status: 'ended' });
		await flush();
		expect(alerts.alerting()).toEqual({ title: false, note: false });
		expect(browser.pageTitle).toBe('Deals - LeadZump');
	});

	test('a failed answer (microphone blocked) brings the title back', async () => {
		const gum = jest.fn(async () => {
			throw Object.assign(new Error('no'), { name: 'NotAllowedError' });
		});
		Object.defineProperty(navigator, 'mediaDevices', {
			configurable: true,
			value: { getUserMedia: gum },
		});
		try {
			await ring();
			await after(1000);
			const r = await exec(new Answer(), {});
			expect(r.event).toBe('error');
			await flush();
			expect(alerts.alerting().title).toBe(true);
		} finally {
			Object.defineProperty(navigator, 'mediaDevices', {
				configurable: true,
				value: undefined,
			});
		}
	});

	test('a page that changes its own title meanwhile gets that title back', async () => {
		await ring();
		await after(1000);
		// A navigation in the hidden tab sets the new page's title.
		browser.pageTitle = 'Tasks - LeadZump';
		await after(TITLE_BLINK_MS);
		expect(browser.pageTitle).toBe('Tasks - LeadZump');
		await after(TITLE_BLINK_MS);
		expect(browser.pageTitle).toBe('Incoming call: +919108489008');
		adapter.emit({ status: 'ended' });
		await flush();
		expect(browser.pageTitle).toBe('Tasks - LeadZump');
	});

	test('clicking the notification brings the tab forward', async () => {
		const focus = jest.spyOn(window, 'focus').mockImplementation(() => {});
		await ring();
		await after(1000);
		browser.notes[0].click();
		expect(focus).toHaveBeenCalled();
		browser.setHidden(false);
		expect(alerts.alerting()).toEqual({ title: false, note: false });
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		focus.mockRestore();
	});
});

describe('visibility', () => {
	test('a visible tab does nothing; hidden during the ring it starts, shown again it stops', async () => {
		browser.isHidden = false;
		await ring();
		await after(1000);
		expect(browser.titles).toEqual([]);
		expect(browser.notes).toEqual([]);

		browser.setHidden(true);
		expect(browser.pageTitle).toBe('Incoming call: +919108489008');
		expect(browser.open()).toHaveLength(1);

		browser.setHidden(false);
		expect(browser.pageTitle).toBe('Deals - LeadZump');
		expect(browser.open()).toEqual([]);

		// Hidden again: the title blinks again, but the notification showed once for this call.
		browser.setHidden(true);
		expect(alerts.alerting().title).toBe(true);
		expect(browser.notes).toHaveLength(1);
	});
});

describe('caller details from the page', () => {
	test('the name goes in the title and the deal in the notification', async () => {
		await ring();
		await exec(new Alert(), { caller: 'New Customer', deal: 'Deal D0000003681, Namma Mane' });
		await after(1000);
		expect(browser.pageTitle).toBe('Incoming call: New Customer');
		expect(browser.open()).toEqual([
			expect.objectContaining({ body: 'New Customer\nDeal D0000003681, Namma Mane' }),
		]);
	});

	test('details that arrive after the notification replace it under the same tag', async () => {
		await ring();
		await after(1000);
		await exec(new Alert(), { caller: 'New Customer', deal: 'Deal D0000003681' });
		expect(browser.notes.map(n => [n.tag, n.body])).toEqual([
			['modlix-call-c1', '+919108489008'],
			['modlix-call-c1', 'New Customer\nDeal D0000003681'],
		]);
		await after(TITLE_BLINK_MS * 2);
		expect(browser.titles).toContain('Incoming call: New Customer');
	});

	test("the last call's details never show for the next one", async () => {
		await ring();
		await exec(new Alert(), { caller: 'First Caller' });
		adapter.emit({ status: 'ended' });
		await ring({ callId: 'c2', from: '+918000000000' });
		await after(1000);
		expect(browser.pageTitle).toBe('Incoming call: +918000000000');
	});

	test('no number and no details: a plain title and "Unknown caller"', async () => {
		await ring({ from: undefined });
		await after(1000);
		expect(browser.pageTitle).toBe('Incoming call');
		expect(browser.open()[0].body).toBe('Unknown caller');
	});
});

describe('calls that never alert', () => {
	test('the leg of a call the user placed (answered at once with ringBack)', async () => {
		await ring();
		await exec(new Answer(), { ringBack: true });
		adapter.emit({ status: 'connected' });
		await after(5000);
		expect(browser.titles).toEqual([]);
		expect(browser.notes).toEqual([]);
	});

	test('a call the browser dials (outbound ringing)', async () => {
		await ring({ direction: 'outbound' });
		await after(5000);
		expect(browser.titles).toEqual([]);
		expect(browser.notes).toEqual([]);
	});

	test('Disconnect stops the alerts', async () => {
		await ring();
		await after(1000);
		await session.disconnect();
		expect(alerts.alerting()).toEqual({ title: false, note: false });
		expect(browser.pageTitle).toBe('Deals - LeadZump');
	});
});

describe('permission', () => {
	test('not decided: no prompt during a ring, the title still blinks, the state offers alerts', async () => {
		browser.perm = 'default';
		await ring();
		await after(1000);
		expect(browser.requests).toBe(0);
		expect(browser.notes).toEqual([]);
		expect(alerts.alerting().title).toBe(true);
		expect(last()).toMatchObject({ status: 'ringing', alertsOffer: true });
	});

	test('"Allow call alerts" asks once; the offer is gone for this user, even after a reload', async () => {
		browser.perm = 'default';
		adapter.emit({ status: 'ringing', direction: 'inbound', callId: 'c1' });
		adapter.emit({ status: 'connected' });
		await flush();
		expect(last()).toMatchObject({ status: 'connected', alertsOffer: true });

		const r = await exec(new Alert(), { allow: true });
		expect(r.event).toBe('output');
		expect(r.result.state).toMatchObject({ alertPermission: 'granted' });
		expect(browser.requests).toBe(1);
		expect(last().alertsOffer).toBe(false);
		expect(localStorage.getItem(`${ALERT_KEY}.110`)).toBe('asked');

		// Declined at the prompt: still never offered again.
		browser.perm = 'default';
		await session.disconnect();
		await connect();
		expect(last().alertsOffer).toBe(false);
	});

	test('"Not now" (allow false) asks nothing and hides the offer', async () => {
		browser.perm = 'default';
		await session.disconnect();
		await connect();
		expect(last()).toMatchObject({ alertsOffer: true });
		await exec(new Alert(), { allow: 'false' });
		expect(browser.requests).toBe(0);
		expect(last().alertsOffer).toBe(false);
	});

	test('already answered (allowed by push, or blocked): no offer, no prompt', async () => {
		for (const perm of ['granted', 'denied', 'unsupported'] as AlertPermission[]) {
			browser.perm = perm;
			await session.disconnect();
			await connect();
			expect(last().alertsOffer).toBe(false);
			const r = await exec(new Alert(), { allow: true });
			expect(r.result.state.alertPermission).toBe(perm);
		}
		expect(browser.requests).toBe(0);
	});

	test('denied: the title still blinks, no notification', async () => {
		browser.perm = 'denied';
		await ring();
		await after(1000);
		expect(alerts.alerting()).toEqual({ title: true, note: false });
	});
});

describe('browser alerts', () => {
	const realNotification = (window as any).Notification;
	afterEach(() => {
		(window as any).Notification = realNotification;
	});

	test('no Notification in this browser: unsupported, nothing asked', async () => {
		delete (window as any).Notification;
		const out = createBrowserAlertOut();
		expect(out.permission()).toBe('unsupported');
		expect(await out.request()).toBe('unsupported');
		expect(out.notify('Incoming call', 'x', 't', () => {})).toBeUndefined();
	});

	test('asks only while undecided, notifies only when granted; a click focuses and closes', async () => {
		const shown: any[] = [];
		class N {
			static permission = 'default';
			static requestPermission = jest.fn(async () => {
				N.permission = 'granted';
				return 'granted';
			});
			onclick?: () => void;
			close = jest.fn();
			constructor(
				public title: string,
				public opts: any,
			) {
				shown.push(this);
			}
		}
		(window as any).Notification = N;
		const out = createBrowserAlertOut();
		expect(out.permission()).toBe('default');
		expect(out.notify('Incoming call', 'x', 't', () => {})).toBeUndefined();
		expect(await out.request()).toBe('granted');
		expect(await out.request()).toBe('granted');
		expect(N.requestPermission).toHaveBeenCalledTimes(1);
		// The same answer registers push, as a sign in with permission granted would.
		await flush();
		expect(resumePush).toHaveBeenCalledTimes(1);

		const click = jest.fn();
		out.notify('Incoming call', 'New Customer', 'modlix-call-c1', click);
		expect(shown[0]).toMatchObject({
			title: 'Incoming call',
			opts: { body: 'New Customer', tag: 'modlix-call-c1', requireInteraction: true },
		});
		shown[0].onclick();
		expect(click).toHaveBeenCalled();
		expect(shown[0].close).toHaveBeenCalled();
	});

	test('the title and the visibility come from the document', () => {
		const out = createBrowserAlertOut();
		document.title = 'Deals';
		out.setTitle('Incoming call: x');
		expect(out.title()).toBe('Incoming call: x');
		expect(out.hidden()).toBe(false);
	});
});
