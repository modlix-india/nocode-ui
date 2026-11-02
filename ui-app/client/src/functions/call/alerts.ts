import { isNativeShell } from '../../util/pushGate';
import { INCOMING_RING_DELAY_MS, localStore, userKey } from './sounds';
import { CallState } from './types';

/**
 * Call alerts for a hidden tab: while an incoming call rings in the tab that holds the call and
 * that tab is hidden (another tab or app is in front), the page title blinks with the caller and,
 * when the user has already allowed notifications for the site, a browser notification shows the
 * caller (and the deal, when the page told us). Clicking the notification brings the tab forward.
 * Both go the moment the call is answered, declined or ends, or the tab is shown again.
 *
 * Driven by the call session on every state change, like the sounds: only the tab that holds the
 * call alerts, and only for calls the provider rings in THIS browser (a call routed to a phone
 * never reaches the browser SDK). The leg of a call the user placed (`ringBack`) never alerts.
 *
 * Permission: the engine never asks during a ring. While the site has no answer yet ("default"),
 * the state carries `alertsOffer: true` so the call card can offer "Allow call alerts" once; that
 * click asks the browser (the same prompt UIEngine.EnablePushNotifications uses) and, when
 * allowed, registers push the way a resumed sign in does, so the push setting never asks again.
 * Inside the Modlix mobile app there are no browser notifications: the phone has push.
 */

/** localStorage key prefix; the user id follows. Holds 'asked' once the offer was answered. */
export const ALERT_KEY = 'modlix.call.alerts';
export const ALERT_TITLE = 'Incoming call';
/** The page title swaps between the call and the page's own title this often. */
export const TITLE_BLINK_MS = 1000;
/** Caller details sent before the ring reaches this browser stay usable this long. */
export const INFO_MAX_AGE_MS = 30000;

export type AlertPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface AlertNote {
	close(): void;
}

/** What the controller needs from the browser. Tests pass a fake. */
export interface AlertOut {
	hidden(): boolean;
	/** Runs when the tab is hidden or shown. */
	onVisibility(cb: () => void): void;
	title(): string;
	setTitle(title: string): void;
	permission(): AlertPermission;
	/** Asks the browser; call it from a click. */
	request(): Promise<AlertPermission>;
	/** Shows a notification; undefined when the browser refuses. */
	notify(title: string, body: string, tag: string, onClick: () => void): AlertNote | undefined;
}

function iconHref(): string | undefined {
	try {
		const link = document.querySelector<HTMLLinkElement>(
			'link[rel~="icon"], link[rel="apple-touch-icon"]',
		);
		return link?.href || undefined;
	} catch {
		return undefined;
	}
}

export function createBrowserAlertOut(): AlertOut {
	let listening = false;
	const N = () =>
		typeof window === 'undefined' ? undefined : ((window as any).Notification as any);
	return {
		hidden: () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
		onVisibility(cb) {
			if (listening || typeof document === 'undefined') return;
			listening = true;
			document.addEventListener('visibilitychange', cb);
		},
		title: () => (typeof document === 'undefined' ? '' : document.title),
		setTitle(t) {
			if (typeof document !== 'undefined') document.title = t;
		},
		permission() {
			const n = N();
			if (!n || isNativeShell()) return 'unsupported';
			return (n.permission as AlertPermission) ?? 'default';
		},
		async request() {
			const n = N();
			if (!n || isNativeShell()) return 'unsupported';
			if (n.permission !== 'default') return n.permission as AlertPermission;
			// Asked first, while the click still counts (as EnablePushNotifications does). The
			// callback form also works in older Safari.
			const answer = await new Promise<AlertPermission>(resolve => {
				const p = n.requestPermission((r: AlertPermission) => resolve(r));
				p?.then?.((r: AlertPermission) => resolve(r));
			});
			if (answer === 'granted')
				// The same answer turns push on: register this browser now, as a sign in would.
				import(/* webpackChunkName: "PushRegistration" */ '../../util/pushRegistration')
					.then(m => m.resumePush())
					.catch(() => undefined);
			return answer;
		},
		notify(title, body, tag, onClick) {
			const n = N();
			if (!n || n.permission !== 'granted') return undefined;
			try {
				const note = new n(title, {
					body,
					tag,
					icon: iconHref(),
					requireInteraction: true,
				});
				note.onclick = () => {
					onClick();
					try {
						note.close();
					} catch {
						// Already gone.
					}
				};
				return note as AlertNote;
			} catch {
				// Some browsers (Chrome on Android) only notify through a service worker.
				return undefined;
			}
		},
	};
}

/** What the page knows about the caller (the call's own data only has the number). */
export interface CallerInfo {
	caller?: string;
	deal?: string;
}

export class CallAlerts {
	private out?: AlertOut;
	private readonly makeOut: () => AlertOut;
	private last?: CallState;
	private here = false;
	private ring?: { callId?: string; since: number };
	private quiet?: { callId?: string };
	private info?: CallerInfo & { at: number };
	private timer?: ReturnType<typeof setTimeout>;
	private blink?: ReturnType<typeof setInterval>;
	private original = '';
	/** The title this controller set last; anything else means the page changed it. */
	private shown?: string;
	private note?: AlertNote;
	private noteText?: string;
	/** The call a notification was shown for: once per call. */
	private notified?: string;

	constructor(makeOut: () => AlertOut = createBrowserAlertOut) {
		this.makeOut = makeOut;
	}

	private browser(): AlertOut {
		if (!this.out) {
			this.out = this.makeOut();
			this.out.onVisibility(() => this.refresh());
		}
		return this.out;
	}

	/** True while the site has no notification answer and the user was not offered one yet. */
	canOffer(): boolean {
		if (this.browser().permission() !== 'default') return false;
		try {
			return localStore()?.getItem(userKey(ALERT_KEY)) !== 'asked';
		} catch {
			return true;
		}
	}

	/**
	 * The user answered the offer. `ask` (from a click): asks the browser when it has no answer
	 * yet. Either way the offer is not shown again for this user in this browser.
	 */
	async allow(ask: boolean): Promise<AlertPermission> {
		try {
			localStore()?.setItem(userKey(ALERT_KEY), 'asked');
		} catch {
			// Storage blocked: the offer comes back on the next page load.
		}
		const out = this.browser();
		if (!ask || out.permission() !== 'default') return out.permission();
		return out.request();
	}

	/** The page's caller details for the call ringing now (or about to). */
	setInfo(info: CallerInfo) {
		const caller = info.caller?.trim() || undefined;
		const deal = info.deal?.trim() || undefined;
		this.info = { caller, deal, at: Date.now() };
		this.refresh();
	}

	/** Answer was pressed for this call: no alerts while the provider confirms. */
	quietFor(callId: string | undefined) {
		this.quiet = { callId };
		this.refresh();
	}

	unquiet() {
		this.quiet = undefined;
		this.refresh();
	}

	/** The call state changed in this tab. `here`: this tab holds the call. */
	update(state: CallState | undefined, here: boolean) {
		this.last = state;
		this.here = here;
		const incoming =
			state?.status === 'ringing' && state.direction === 'inbound' && !state.ringBack;
		if (incoming) {
			if (!this.ring || this.ring.callId !== state!.callId) {
				const now = Date.now();
				this.ring = { callId: state!.callId, since: now };
				this.notified = undefined;
				if (this.info && now - this.info.at > INFO_MAX_AGE_MS) this.info = undefined;
			}
		} else if (this.ring) {
			// The ring is over: the page's caller details belonged to it.
			this.ring = undefined;
			this.info = undefined;
		}
		if (
			this.quiet &&
			(!incoming ||
				(this.quiet.callId && state!.callId && this.quiet.callId !== state!.callId))
		)
			this.quiet = undefined;
		this.refresh();
	}

	private caller(): string {
		return this.info?.caller || this.last?.from?.trim() || '';
	}

	private alertTitle(): string {
		const c = this.caller();
		return c ? `${ALERT_TITLE}: ${c}` : ALERT_TITLE;
	}

	/** Starts, keeps or stops the alerts for the last state and the tab's visibility. */
	refresh() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
		if (!this.here || !this.ring || this.quiet) return this.stop();
		// The same short wait as the ring: the leg of a placed call is answered at once.
		const due = this.ring.since + INCOMING_RING_DELAY_MS;
		const now = Date.now();
		if (due > now) {
			this.timer = setTimeout(() => this.refresh(), due - now);
			return;
		}
		const out = this.browser();
		if (!out.hidden()) return this.stop();
		this.startBlink();
		this.showNote();
	}

	private startBlink() {
		if (this.blink) return;
		const out = this.browser();
		this.original = out.title();
		this.shown = undefined;
		let onCall = false;
		const tick = () => {
			const now = out.title();
			// The page set its own title meanwhile (a navigation): that one comes back after.
			if (this.shown !== undefined && now !== this.shown) this.original = now;
			onCall = !onCall;
			const next = onCall ? this.alertTitle() : this.original;
			this.shown = next;
			out.setTitle(next);
		};
		tick();
		this.blink = setInterval(tick, TITLE_BLINK_MS);
	}

	private stopBlink() {
		if (!this.blink) return;
		clearInterval(this.blink);
		this.blink = undefined;
		const out = this.browser();
		if (out.title() === this.shown) out.setTitle(this.original);
		this.shown = undefined;
	}

	private showNote() {
		const out = this.browser();
		if (out.permission() !== 'granted') return;
		const key = this.ring?.callId ?? 'ring';
		const lines = [this.caller() || 'Unknown caller'];
		if (this.info?.deal) lines.push(this.info.deal);
		const body = lines.join('\n');
		// Once per call; again only to add what the page told us after it showed.
		if (this.notified === key && (!this.note || this.noteText === body)) return;
		this.notified = key;
		this.noteText = body;
		// The same tag replaces the earlier notification instead of adding one.
		this.note = out.notify(ALERT_TITLE, body, `modlix-call-${key}`, () => {
			try {
				window.focus();
			} catch {
				// Not allowed here: the click still showed the browser.
			}
			this.note = undefined;
			this.refresh();
		});
	}

	private closeNote() {
		const n = this.note;
		this.note = undefined;
		if (!n) return;
		try {
			n.close();
		} catch {
			// Already gone.
		}
	}

	private stop() {
		this.stopBlink();
		this.closeNote();
	}

	/** Stops everything (Disconnect). */
	reset() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
		this.last = undefined;
		this.here = false;
		this.ring = undefined;
		this.quiet = undefined;
		this.info = undefined;
		this.notified = undefined;
		this.stop();
	}

	/** For tests: whether the title is blinking and a notification is open. */
	alerting(): { title: boolean; note: boolean } {
		return { title: !!this.blink, note: !!this.note };
	}
}
