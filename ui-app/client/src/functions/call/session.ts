import { duplicate } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { AlertPermission, CallAlerts } from './alerts';
import { getAuthWatch, inDesigner } from './auth';
import { CredentialError, callServerFunction, fetchCredentials } from './credentials';
import { CallDisplay, computeDisplay, DisplayTicker, sameDisplay } from './display';
import { getCallProvider } from './registry';
import { CallSounds, localStore, Tone, userKey } from './sounds';
import { getTabSync, TabChannel } from './tabs';
import * as view from './view';
import {
	CallAdapter,
	CallAdapterFactory,
	CallCredentials,
	CallState,
	CallStatePatch,
} from './types';

/**
 * The one call connection of this page session. Module level on purpose: a provider SDK holds
 * one registration per tab, and navigating between pages must not drop a call.
 *
 * Every change is written, whole, to the statePath given to Connect. Credentials go to the
 * adapter's register and nowhere else: not into the state, not into any storage.
 *
 * Tabs: a provider keeps one registration per agent, so when every tab of the site signed in,
 * opening a second tab or reloading one logged the call tab out and dropped its call. Now one tab
 * (the "owner", holding a Web Lock) signs in and holds the audio. The other tabs ("followers")
 * do not sign in: they mirror the owner's state (with `otherTab: true`) and send Answer, Mute and
 * Hangup to it over a BroadcastChannel. When the owner tab closes, a follower takes over the sign
 * in. A browser without Web Locks or BroadcastChannel keeps the old one tab behaviour.
 *
 * A full reload cannot keep a WebRTC call: the owner warns before unload while a call is up, ends
 * the call on the way out (so the customer is not left on a silent line), and the reloaded tab
 * shows that call as ended (`endReason: 'pageClosed'`) instead of a stale "in call".
 *
 * Sounds (sounds.ts): the tab holding the call plays the incoming ring, the ring back and the end
 * tone, from every page, for calls the provider rings in this browser. If that tab cannot play
 * sound (the browser wants a tap first) and the user taps "enable sound" in another tab, that
 * tab plays instead (`soundTab`).
 *
 * Alerts (alerts.ts): while an incoming call rings and the tab holding it is hidden, its title
 * blinks with the caller and, when notifications are already allowed, a browser notification
 * shows. Only the tab holding the call does this, never a follower.
 *
 * Credentials (LZT-2162): Connect can name a server function (`credentialsFunction`) that the
 * engine asks for the agent's credential just before it signs in, so the credential never passes
 * through the page. Only the tab that signs in asks; a follower keeps a way to ask (a closure),
 * never the value, and asks again when it takes over.
 *
 * Sign out (LZT-2163): the session watches the sign in itself (auth.ts) and signs the phone out
 * when the user signs out here or in another tab of the site, or a different user signs in, even
 * while the phone is still signing in. The page's logout buttons are not the only way out.
 *
 * Editor canvas (LZT-2164): in the AppBuilder editor nothing signs in and the controls do nothing.
 *
 * Display (LZT-2161): the call bar's values (phase, number, ring and talk clocks, the end, the
 * line, the recording) are computed once, here (display.ts), from this state and the server's
 * report, and written whole to the display path Connect names (`displayPath`, for example
 * `Store.callDisplay`) on every change and once a second while a clock runs. The page binds its
 * labels to it and computes nothing. Without a displayPath nothing is written, so a page that
 * does not bind to it costs nothing.
 *
 * One clock per call (LZT-2256): the tab holding the call stamps the server call it bound and the
 * far end's answer into the state (`callLogId`, `talkAt`). Every other tab, including one opened
 * mid call, binds to that server call and counts from that answer, never from its own first
 * report (the user's newest call row may be another call, and a tab only hears of the call when
 * it opens).
 */

export const REGISTER_TIMEOUT_MS = 30000;
/** How long a follower waits for the owner tab to carry out Answer, Mute or Hangup. */
export const TAB_COMMAND_TIMEOUT_MS = 8000;
/** How long a new follower waits for the owner tab's state before it shows `ready`. */
export const TAB_HELLO_MS = 400;
export const LEAVE_WARNING = 'Leaving or reloading this page ends the call.';
/** sessionStorage key: the call this tab dropped when it closed or reloaded. */
export const LOST_CALL_KEY = 'modlix.call.lost';
const LOST_CALL_MAX_AGE_MS = 15 * 60 * 1000;

/** LZT-2762 tab health: the owner announces itself, a follower that hears nothing asks. */
export const OWNER_BEAT_MS = 5000;
export const OWNER_QUIET_MS = 12000;
export const OWNER_PONG_MS = 3000;
export const OWNER_CHECK_MS = 2000;
export const RELAY_TIMEOUT_MS = 5000;
export const RELAY_TIMEOUT_EXPECT_MS = 2000;
export const CLICK_PROBE_MS = 1500;
export const OWNER_UNSIGNED_MS = 10000;
/** A phone `registering` this long after a drop is stuck: Retry signs it in again. */
export const REG_STUCK_MS = 20000;
/** After Expect, how long the agent's own leg has to ring the browser phone. */
export const PLACE_WATCH_MS = 10000;
export const TAB_HERE_MS = 30000;
/** localStorage flag for support: 'off' turns tab health off in this browser. */
export const TAB_HEALTH_KEY = 'modlix.call.tabHealth';
/**
 * LZT-2762 step 2 (resign and take over), behind tab health and its own flag: 'on' in this
 * browser's localStorage turns it on while it is being tested; 'off' always turns it off.
 */
export const TAKEOVER_KEY = 'modlix.call.takeover';
/** The phone tab gives the phone up when it has been signed out, dropped or stuck connecting this long. */
export const RESIGN_AFTER_MS = 10000;
/** How long a tab that gave the phone up waits before it queues for the lock again, by try. */
export const RESIGN_REQUEUE_MS = [20000, 60000, 180000];
/** After this many resigns without the phone staying up, a tab stops giving it up. */
export const RESIGN_MAX = 3;
/** The longest a tab waits for its phone to sign out before it lets the lock go. */
export const RESIGN_SIGNOUT_MS = 3000;
/** "Use this tab": how long the tab holding the phone has to answer before it counts as frozen. */
export const USE_THIS_TAB_WAIT_MS = 5000;

export const OWNER_DEAD_MESSAGE =
	'Your browser phone is in another tab that is not responding, and it cannot be released from here. Close that tab or restart the browser, then reload this tab and call again.';
export const OWNER_NOT_SIGNED_MESSAGE =
	'Your browser phone is not ready in another tab. Use that tab or reload this one.';

type OwnerHealth = 'ok' | 'checking' | 'stale' | 'notSignedIn';

interface Health {
	// owner side
	unsignedSince: number;
	regSince: number;
	lastStatus?: string;
	drops: Array<{ at: number; what: string }>;
	followers: Map<string, number>;
	beatTimer?: ReturnType<typeof setInterval>;
	placeTimer?: ReturnType<typeof setTimeout>;
	repairing?: boolean;
	resigning?: boolean;
	// follower side
	askTimer?: ReturnType<typeof setTimeout>;
	lastAt: number;
	lastBeat?: any;
	beatSeen: boolean;
	checking: boolean;
	stale: boolean;
	state: OwnerHealth;
	since: number;
	checkTimer?: ReturnType<typeof setInterval>;
	hereTimer?: ReturnType<typeof setInterval>;
	pongTimer?: ReturnType<typeof setTimeout>;
	probes: Map<string, (m: any) => void>;
}

type Role = 'solo' | 'owner' | 'follower';

interface Session {
	provider: string;
	adapter?: CallAdapter;
	statePath: string;
	/** Where the display values go (LZT-2161); '' when Connect named none (nothing is written). */
	displayPath: string;
	/** The display last written, so a repeat is not written again. */
	display?: CallDisplay;
	pageName: string;
	state: CallState;
	/** Bumped on every Connect, so events from a replaced adapter are ignored. */
	generation: number;
	role: Role;
	lockName?: string;
	channel?: TabChannel;
	cancelWait?: () => void;
	/**
	 * How to get the credentials when this tab signs in (now, after a takeover, back from away):
	 * a closure, so the value is never a field of the session (LZT-2162).
	 */
	source: () => Promise<CallCredentials>;
	/** Which phone this session is (provider and a digest of the credentials), see sameSession. */
	identity: string;
	/** The signed in user at Connect ('' when unknown); another user means sign out (LZT-2163). */
	user: string;
	factory: CallAdapterFactory;
	/**
	 * LZT-2731: the browser phone's own end is the end of an incoming call (see serverEnd). Off
	 * unless the page asked for it in Connect.
	 */
	sdkFirst?: boolean;
	/** LZT-2762: tab health is on for this session (see applyTabHealth). */
	tabHealth?: boolean;
	health?: Health;
	/** How many times this tab gave the phone up without it staying up since (RESIGN_MAX). */
	resigns?: number;
	resignAt?: number;
	signingIn?: boolean;
	/** `Namespace.name` of the server function that stores a diagnostics note on a call row. */
	noteFunction?: string;
	pending: Map<string, { resolve: () => void; reject: (e: Error) => void; timer: any }>;
	gotOwnerState?: () => void;
	/** A follower while it waits for the owner's first state (a new tab or a reload). */
	joining?: boolean;
	/**
	 * A follower that opened after a call had ended: that ended call (callId and endedAt) is not
	 * shown here. Its summary belonged to the tabs that were open during the call.
	 */
	skipEnded?: string;
}

let active: Session | undefined;
let generation = 0;
/** When the call now up in this tab began (epoch ms), and which server call it is (see liveFrame). */
let callSince = 0;
let boundLog: string | undefined;
let endTimer: ReturnType<typeof setTimeout> | undefined;
/** After the server says the call ended, how long the browser phone gets to say so itself. */
export const SERVER_END_GRACE_MS = 2000;
/**
 * With `sdkFirst`, for an incoming call: how long the browser phone gets to say the call ended
 * after the server did, before the server's end hangs up (a hang up the SDK lost, LZT-2731).
 */
export const SERVER_END_FLOOR_MS = 30000;
let commandSeq = 0;

/** This tab, for `soundTab`. */
export const TAB_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let sounds = new CallSounds();
wireSounds();

function wireSounds() {
	sounds.onBlocked = () =>
		Promise.resolve().then(() => {
			const s = active;
			if (s && s.role !== 'follower' && !!s.state.audioBlocked !== sounds.isBlocked())
				write(s);
		});
}

let alerts = new CallAlerts();

/** For tests: the hidden tab alerts this tab uses. */
export function useCallAlerts(c: CallAlerts): CallAlerts {
	alerts.reset();
	alerts = c;
	return c;
}

/** For tests: the sound controller this tab uses. */
export function useCallSounds(c: CallSounds): CallSounds {
	sounds.reset();
	sounds = c;
	wireSounds();
	return c;
}

export class CallError extends Error {}

function idleState(): CallState {
	return { status: 'idle', muted: false };
}

/** The sound, alert and view fields the tab holding the call adds to every state it writes. */
function withSound(state: CallState): CallState {
	return {
		...state,
		soundOn: state.soundOn ?? sounds.isOn(),
		audioBlocked: sounds.isBlocked(),
		alertsOffer: alerts.canOffer(),
		collapsed: state.collapsed ?? view.isCollapsed(),
	};
}

function soundHere(session: Session): boolean {
	if (session.role === 'follower') return session.state.soundTab === TAB_ID;
	return !session.state.soundTab;
}

/**
 * Runs one listener of a state change on its own (LZT-2167): this runs inside the provider SDK's
 * callbacks and the tab channel's handler, where a throw would break the SDK or leave the other
 * listeners (the page, the other tabs, the sounds, the alerts) a state behind.
 */
function guard(f: () => void) {
	try {
		f();
	} catch (e) {
		console.error('A call state listener failed', e);
	}
}

function write(session: Session) {
	if (session.role !== 'follower') {
		session.state = withSound(session.state);
		if (session.tabHealth) {
			trackStatus(session);
			session.state = { ...session.state, ...healthFields(session) };
		}
	}
	const state = session.state;
	guard(() => setData(session.statePath, duplicate(state), session.pageName));
	if (session.role === 'owner')
		guard(() => session.channel?.post({ t: 'state', state: duplicate(state) }));
	guard(() => sounds.update(state, soundHere(session)));
	guard(() => alerts.update(state, session.role !== 'follower'));
	guard(() => writeDisplay(session));
}

/** A follower shows the state it mirrors; nothing goes to the other tabs. */
function show(session: Session) {
	const state = shown(session);
	guard(() => setData(session.statePath, duplicate(state), session.pageName));
	guard(() => sounds.update(state, soundHere(session)));
	guard(() => alerts.update(state, false));
	guard(() => writeDisplay(session));
}

// ---------------------------------------------------------------- display (LZT-2161)

/**
 * Whether the server's report is about the call this state shows: the server call bound to it
 * (see bindable), else one first heard around when this call came up. Nothing else decides it,
 * so a late frame of an earlier call never reaches the display.
 */
function liveBelongs(state: CallState): boolean {
	if (!live) return false;
	if (!IN_CALL.has(state.status) && state.status !== 'ended') return false;
	const bound = boundId();
	if (bound) return bound === live.callLogId;
	return heardAsThisCall(live.callLogId, IN_CALL.has(state.status));
}

/**
 * The server call bound to the call up here: this tab's own binding when it holds the call, else
 * the one the tab holding the call stamped into its state (LZT-2256). A follower used to guess it
 * from what it heard first, and a tab opened mid call first hears the user's newest call row,
 * which may be another call: its clock then counted from that tab's opening.
 */
function boundId(): string | undefined {
	if (boundLog) return boundLog;
	const s = active;
	return s?.role === 'follower' && s.state.callLogId ? s.state.callLogId : undefined;
}

/**
 * The tab holding the call stamps the server call it bound and the far end's answer into the
 * call state, so every tab shows the same call and counts from the same answer (LZT-2256). Only
 * a change is written; the state write rewrites the display. True when it wrote.
 */
function stampCall(session: Session, d: CallDisplay): boolean {
	if (session.role === 'follower' || !IN_CALL.has(session.state.status)) return false;
	const state = session.state;
	if ((state.talkAt ?? 0) === d.talkStartedAt && (state.callLogId ?? '') === d.callLogId)
		return false;
	session.state = { ...state, talkAt: d.talkStartedAt, callLogId: d.callLogId };
	write(session);
	// The other tabs get this call's server report too, in case theirs is about another call.
	const report = live;
	if (report && d.callLogId && report.callLogId === d.callLogId)
		guard(() => session.channel?.post({ t: 'live', live: duplicate(report) }));
	return true;
}

/** Writes the display values when they changed, and keeps the 1 s clock running only while needed. */
function writeDisplay(session: Session) {
	if (!session.displayPath) return;
	const d = computeDisplay(shown(session), live, liveBelongs(session.state), Date.now());
	// The stamp wrote the state, and that write wrote the display.
	if (stampCall(session, d)) return;
	if (!sameDisplay(session.display, d)) {
		session.display = d;
		setData(session.displayPath, duplicate(d), session.pageName);
	}
	ticker.update(d);
}

const ticker = new DisplayTicker(() => {
	const s = active;
	if (s) guard(() => writeDisplay(s));
	else ticker.stop();
});

/** Same keys with the same values: a repeated provider event that changes nothing. */
function sameState(a: CallState, b: CallState): boolean {
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	for (const k of Array.from(keys)) if ((a as any)[k] !== (b as any)[k]) return false;
	return true;
}

const IN_CALL = new Set(['ringing', 'connected']);

/** Which ended call a state shows, so a tab can tell "that same ended call" from a new one. */
function endedKey(state: CallState): string {
	return `${state.callId ?? ''}|${state.endedAt ?? ''}`;
}

/** The state with no call in it (ready), keeping the user's sound and alert settings. */
function withoutCall(state: CallState): CallState {
	const next: CallState = { status: 'ready', muted: false };
	if (state.soundOn !== undefined) next.soundOn = state.soundOn;
	if (state.audioBlocked !== undefined) next.audioBlocked = state.audioBlocked;
	if (state.alertsOffer !== undefined) next.alertsOffer = state.alertsOffer;
	if (state.soundTab !== undefined) next.soundTab = state.soundTab;
	if (state.collapsed !== undefined) next.collapsed = state.collapsed;
	if (state.away) next.away = true;
	return next;
}

/**
 * Close on an ended call's summary: the call leaves the state (status `ready`) in every tab, so
 * the summary does not come back in another tab, on another page or after a reload.
 */
function dismissEnded(session: Session, callId?: string) {
	if (session.state.status !== 'ended') return;
	if (callId && session.state.callId && callId !== session.state.callId) return;
	session.state = withoutCall(session.state);
	write(session);
}

/**
 * How long after the page says it is placing a call (Expect) the next ringing call is taken as
 * the agent's own leg of it. Click to call rings the agent's browser first, and the provider SDK
 * reports that leg as an incoming call.
 */
export const OUTBOUND_CLAIM_MS = 20000;
let expectUntil = 0;
/** The agent's own leg now up: its callId, or '' when the provider gave none. */
let ownLeg: string | undefined;

/**
 * LZT-2731: the server call (callLogId) the page says this browser call is, when it knows it: the
 * id the click to call function returned for an outgoing call, the id in the push for an incoming
 * one. An exact id beats the time windows (heardAsThisCall, bindable) that otherwise decide which
 * server call is the call up here, and those windows stay the way for a call the page gave no id
 * for. `call` is the callSince it attached to ('undefined' while no call has come up for it yet).
 */
interface ExpectedLog {
	id: string;
	/** When the page told the engine (epoch ms). */
	at: number;
	/** The callSince of the call it attached to. */
	call?: number;
}
let expectedLog: ExpectedLog | undefined;
/** The binding in boundLog came from an expected id (not from a time window), and since when. */
let boundExact = false;
let boundAt = 0;
/** How long an id waits for its call to come up here before it is dropped as stale. */
export const EXPECTED_LOG_TTL_MS = 30000;
/** An id told after its call came up still binds it when the call came up this recently (outgoing). */
export const EXPECTED_LOG_LATE_MS = 20000;
/** The same for an incoming call, which the push and the ring reach the page about together. */
export const EXPECTED_LOG_LATE_IN_MS = 5000;
/**
 * An exact binding whose server call this tab never heard of within this long gives way to the
 * time windows again (a wrong or lost id must not leave the call with no server call at all).
 */
export const EXPECTED_LOG_WAIT_MS = 15000;

function bindExact(id: string, session: Session) {
	boundLog = id;
	boundExact = true;
	boundAt = Date.now();
	heldBack.delete(id);
	if (expectedLog) expectedLog.call = callSince;
	// What the tab stamped from the call it had taken this one for never carries over to it.
	const stamped = session.state.callLogId;
	if ((stamped || session.state.talkAt) && stamped !== id) {
		const { talkAt, callLogId, ...rest } = session.state;
		session.state = rest;
		write(session);
	}
	guard(() => writeDisplay(session));
}

/** A call has just come up here: an id told before it (and not stale) is its server call. */
function adoptExpected(session: Session) {
	const e = expectedLog;
	if (!e) return;
	if (e.call === undefined && Date.now() - e.at <= EXPECTED_LOG_TTL_MS) {
		boundLog = e.id;
		boundExact = true;
		boundAt = Date.now();
		e.call = callSince;
		return;
	}
	// Told for an earlier call, or too long ago: it never binds this one.
	expectedLog = undefined;
}

/**
 * The page says which server call the call here is. Before the call came up here the id waits for
 * it (EXPECTED_LOG_TTL_MS); when the call is already up, the id arrived after it (the server
 * function answers after the agent's leg rang), so it binds that call, unless the call is already
 * bound to another id this way. A call bound by a time window is rebound to the id.
 */
function setExpectedLog(session: Session, id: string) {
	const now = Date.now();
	expectedLog = { id, at: now };
	if (session.role === 'follower' || !IN_CALL.has(session.state.status)) return;
	// A call is up and this id does not belong to it (another call's push, or a call that is not
	// the one just placed): it must not wait to bind the next call.
	const inbound = session.state.direction === 'inbound';
	const bound = boundExact && boundLog !== id ? boundLog : undefined;
	const keeps = !!bound && (heard.has(bound) || now - boundAt <= EXPECTED_LOG_WAIT_MS);
	const late = inbound ? EXPECTED_LOG_LATE_IN_MS : EXPECTED_LOG_LATE_MS;
	if (keeps || (inbound && session.state.status !== 'ringing') || callSince < now - late) {
		expectedLog = undefined;
		return;
	}
	bindExact(id, session);
}

/**
 * The agent's own leg of a call being placed (LZT-2160): the first ring after Expect is marked
 * outbound, and a later event of that leg never turns it back into an incoming call.
 */
function ownLegPatch(
	session: Session,
	prev: CallState,
	patch: CallStatePatch,
): { patch: CallStatePatch; own: boolean } {
	if (
		session.role !== 'follower' &&
		patch.status === 'ringing' &&
		!IN_CALL.has(prev.status) &&
		Date.now() < expectUntil
	) {
		expectUntil = 0;
		ownLeg = patch.callId ?? '';
		return { patch: { ...patch, direction: 'outbound' }, own: true };
	}
	const sameLeg = !patch.callId || ownLeg === '' || patch.callId === ownLeg;
	if (
		patch.direction === 'inbound' &&
		ownLeg !== undefined &&
		IN_CALL.has(prev.status) &&
		sameLeg
	) {
		const { direction, ...rest } = patch;
		return { patch: rest, own: false };
	}
	return { patch, own: false };
}

/** Merges an adapter's report into the state, with the rules every provider shares. */
function apply(session: Session, reported: CallStatePatch) {
	const prev = session.state;
	const { patch, own } = ownLegPatch(session, prev, reported);
	let next: CallState = { ...prev, ...patch };

	// A new call starts clean: no mute, start time or error left from the last one.
	const newCall =
		patch.status === 'ringing' &&
		(!IN_CALL.has(prev.status) ||
			(patch.callId && prev.callId && patch.callId !== prev.callId));
	if (newCall) {
		next = {
			status: 'ringing',
			muted: false,
			callId: patch.callId,
			direction: patch.direction ?? prev.direction,
			from: patch.from,
			to: patch.to,
			soundOn: prev.soundOn,
			soundTab: prev.soundTab,
			collapsed: prev.collapsed,
			ringAt: Date.now(),
		};
	}

	if (next.status === 'connected' && prev.status !== 'connected' && !next.startedAt)
		next.startedAt = Date.now();
	if (next.status === 'ended') {
		next.muted = false;
		next.held = false;
		if (IN_CALL.has(prev.status) && !next.endedAt) next.endedAt = Date.now();
	}

	// A repeated provider event (TeleCMI repeats some, Exotel sends every one twice) is not news:
	// the state and everything that follows it change once (LZT-2167).
	if (!own && sameState(prev, next)) return;

	if (IN_CALL.has(next.status) && (!IN_CALL.has(prev.status) || newCall)) {
		callSince = Date.now();
		boundLog = undefined;
		boundExact = false;
		adoptExpected(session);
		// The stamps of the last call never carry over to this one (LZT-2256).
		delete next.talkAt;
		delete next.callLogId;
	}

	if (!IN_CALL.has(next.status)) {
		boundLog = undefined;
		boundExact = false;
		// An id that belonged to the call now over never binds another call.
		if (expectedLog?.call !== undefined) expectedLog = undefined;
		if (endTimer) clearTimeout(endTimer);
		endTimer = undefined;
		ownLeg = undefined;
	}
	// The own leg rings back (never in) until the far end answers, and is answered here at once.
	if (own) next.ringBack = true;
	if (IN_CALL.has(next.status)) {
		delete next.placeFailed;
		delete next.retryOffer;
		clearPlaceWatch(session);
	}

	session.state = next;
	write(session);
	if (own) void answerOwnLeg(session);
}

/**
 * Answers the agent's own leg in the tab holding the phone: no round trip to the tab the call was
 * placed from, so a busy or hidden tab can no longer leave it ringing until it fails.
 */
async function answerOwnLeg(session: Session) {
	const id = session.state.callId;
	try {
		await ensureMicrophone();
		if (active === session && session.state.status === 'ringing' && session.state.callId === id)
			await session.adapter!.answer(id);
	} catch (e) {
		if (active === session && IN_CALL.has(session.state.status))
			apply(session, { error: e instanceof Error ? e.message : String(e) });
	}
}

/**
 * The page is placing a call (`on` true) or the placing failed (`on` false). With `on`, the next
 * call that rings within OUTBOUND_CLAIM_MS is the agent's own leg of it.
 */
export async function expectOutbound(on = true, callLogId?: string): Promise<CallState> {
	if (inDesigner()) return designerState();
	// Placing is over (or never began) and there is no phone: nothing to undo (a page runs Expect off
	// for every call it places, also with browser calling off).
	if (!on && !active) return idleState();
	const session = current();
	const id = callLogId ? String(callLogId).trim() : '';
	if (id) {
		// LZT-2731: only tells which server call the call here is; the claim window is not touched.
		if (session.role === 'follower') {
			await toOwner(session, 'expect', { on, callLogId: id }, expectTimeout(session));
			if (on && session.tabHealth) void sendNote(session, id, 'placedFromFollower');
			return session.state;
		}
		if (on) setExpectedLog(session, id);
		else if (expectedLog?.id === id) expectedLog = undefined;
		return session.state;
	}
	// The microphone is asked for at the press, in the tab the user pressed Call in (LZT-2208).
	// Asked first when the agent's own leg rang, in the tab holding the phone (often one in the
	// background), the browser's prompt waited unseen while TeleCMI rang that leg, so the first
	// call on a new phone or after a one-time permission ran out was never answered. Not awaited:
	// the call is placed meanwhile; a refused microphone still fails the answer as before.
	if (on) ensureMicrophone().catch(() => undefined);
	if (session.role === 'follower') {
		if (on && session.tabHealth) await ensureOwnerReady(session);
		await toOwner(session, 'expect', { on }, expectTimeout(session));
		return session.state;
	}
	expectUntil = on ? Date.now() + OUTBOUND_CLAIM_MS : 0;
	if (session.tabHealth) armPlaceWatch(session, on);
	return session.state;
}

function current(): Session {
	if (!active) throw new CallError('No call connection. Run UIEngine.Call.Connect first.');
	return active;
}

function fail(session: Session, error: unknown, fatal = false): never {
	const message = error instanceof Error ? error.message : String(error ?? 'Call failed');
	if (session.role === 'follower') {
		session.state = { ...session.state, error: message };
		write(session);
	} else apply(session, fatal ? { status: 'error', error: message } : { error: message });
	throw error instanceof CallError ? error : new CallError(message);
}

function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return Promise.race([
		p,
		new Promise<T>((_, reject) => {
			timer = setTimeout(() => reject(new CallError(message)), ms);
		}),
	]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------- the call lost on unload

function storage(): Storage | undefined {
	try {
		return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
	} catch {
		return undefined;
	}
}

let unloadHooked = false;

function hookUnload() {
	if (unloadHooked || typeof window === 'undefined' || !window.addEventListener) return;
	unloadHooked = true;
	window.addEventListener('beforeunload', onBeforeUnload);
	window.addEventListener('pagehide', onPageHide);
}

function holdsCall(session: Session | undefined): session is Session {
	return !!session && session.role !== 'follower' && IN_CALL.has(session.state.status);
}

function onBeforeUnload(e: BeforeUnloadEvent) {
	if (!holdsCall(active)) return undefined;
	// Browsers show their own wording; the text is kept for the ones that still use it.
	e.preventDefault();
	e.returnValue = LEAVE_WARNING;
	return LEAVE_WARNING;
}

function onPageHide() {
	const session = active;
	if (session?.role === 'follower' && session.state.soundTab === TAB_ID)
		session.channel?.post({ t: 'cmd', id: `gone-${TAB_ID}`, op: 'soundGone', tab: TAB_ID });
	if (!holdsCall(session)) return;
	const endedAt = Date.now();
	const { callId, direction, from, to, startedAt } = session.state;
	try {
		storage()?.setItem(
			LOST_CALL_KEY,
			JSON.stringify({ callId, direction, from, to, startedAt, endedAt }),
		);
	} catch {
		// Storage full or blocked: the reloaded tab then just shows no call.
	}
	session.channel?.post({
		t: 'state',
		state: {
			...duplicate(session.state),
			status: 'ended',
			muted: false,
			endedAt,
			endReason: 'pageClosed',
		},
	});
	// The audio dies with the page; end the call now so the customer is not left on a dead line.
	try {
		session.adapter?.hangup(callId);
	} catch {
		// Nothing more can be done while the page goes away.
	}
}

/** The call this tab dropped by closing or reloading: shown once as ended, never as live. */
function restoreLost(session: Session) {
	const s = storage();
	let lost: any;
	try {
		const raw = s?.getItem(LOST_CALL_KEY);
		if (!raw) return;
		s?.removeItem(LOST_CALL_KEY);
		lost = JSON.parse(raw);
	} catch {
		return;
	}
	if (!lost || typeof lost.endedAt !== 'number') return;
	if (Date.now() - lost.endedAt > LOST_CALL_MAX_AGE_MS) return;
	if (IN_CALL.has(session.state.status) || active !== session) return;
	const state: CallState = {
		...(session.role === 'follower' ? { otherTab: true } : {}),
		status: 'ended',
		muted: false,
		callId: lost.callId,
		direction: lost.direction,
		from: lost.from,
		to: lost.to,
		startedAt: lost.startedAt,
		endedAt: lost.endedAt,
		endReason: 'pageClosed',
	};
	// A follower shows it without telling the owner: the call belonged to this tab.
	session.state = state;
	if (session.role === 'follower') show(session);
	else write(session);
}

// ---------------------------------------------------------------- tabs

function onTabMessage(session: Session, m: any) {
	if (active !== session || !m || typeof m !== 'object') return;
	if (m.t === 'live') {
		// What the server said about the call (answered, ended): every tab shows the same.
		if (m.live) applyLive(m.live, false);
		return;
	}
	if (session.tabHealth && session.role === 'follower') {
		ownerMessage(session, m);
		if (m.t === 'resignDenied' && m.tab === TAB_ID) askAnswered(session);
		if (m.t === 'resigned') askAnswered(session);
	}
	if (session.tabHealth && session.role === 'owner') {
		if (m.t === 'ping') {
			session.channel?.post({ t: 'pong', id: m.id, ...beatFields(session) });
			return;
		}
		if (m.t === 'here' && m.tab && session.health) {
			session.health.followers.set(String(m.tab), Date.now());
			return;
		}
		if (m.t === 'resign' && takeoverOn()) {
			// Another tab asked for the phone ("Use this tab"): given up unless a call is up.
			if (IN_CALL.has(session.state.status))
				session.channel?.post({ t: 'resignDenied', reason: 'inCall', tab: m.tab });
			else void resign(session, 'asked');
			return;
		}
	}
	if (session.role === 'owner') {
		if (m.t === 'hello') {
			session.channel?.post({ t: 'state', state: duplicate(session.state) });
			if (live) session.channel?.post({ t: 'live', live: duplicate(live) });
		} else if (m.t === 'cmd') runForTab(session, m);
		return;
	}
	if (session.role !== 'follower') return;
	if (m.t === 'state' && m.state) {
		// A lost call shown in this tab stays until the owner has a call of its own.
		if (
			session.state.endReason === 'pageClosed' &&
			!session.state.otherTab &&
			!IN_CALL.has(m.state.status)
		)
			return session.gotOwnerState?.();
		// A call that ended before this tab opened is not shown here (no summary after a reload).
		if (session.joining && m.state.status === 'ended') session.skipEnded = endedKey(m.state);
		// When the call tab's call came up, as the call tab counts it (see heldOther).
		if (
			IN_CALL.has(m.state.status) &&
			(!IN_CALL.has(session.state.status) || m.state.callId !== session.state.callId)
		)
			callSince = Date.now();
		session.state =
			m.state.status === 'ended' && session.skipEnded === endedKey(m.state)
				? { ...withoutCall(m.state), otherTab: true }
				: { ...m.state, otherTab: true };
		show(session);
		session.gotOwnerState?.();
	} else if (m.t === 'reply' && session.pending.has(m.id)) {
		const p = session.pending.get(m.id)!;
		session.pending.delete(m.id);
		clearTimeout(p.timer);
		if (m.ok) p.resolve();
		else p.reject(new CallError(m.error || 'The call tab could not do that.'));
	}
}

async function runForTab(session: Session, m: any) {
	let error: string | undefined;
	try {
		if (m.op === 'answer') await answer(m.callId || undefined, !!m.ringBack);
		else if (m.op === 'hangup') {
			// Every tab may ask for the same hangup (the server said the call ended): once is enough.
			if (IN_CALL.has(session.state.status)) await hangup(m.callId || undefined);
		} else if (m.op === 'dismiss') dismissEnded(session, m.callId || undefined);
		else if (m.op === 'mute') await mute(!!m.on);
		else if (m.op === 'hold') await hold(!!m.on);
		else if (m.op === 'expect') await expectOutbound(m.on !== false, m.callLogId || undefined);
		else if (m.op === 'dtmf') await sendDtmf(String(m.digit ?? ''));
		else if (m.op === 'repair') void repairSignIn(session);
		else if (m.op === 'available') await setAvailability(m.on !== false);
		else if (m.op === 'view') {
			if (typeof m.collapsed === 'boolean') setView(session, m.collapsed);
		} else if (m.op === 'answering') {
			sounds.quietFor(m.callId || undefined);
			alerts.quietFor(m.callId || undefined);
			if (m.ringBack) setRingBack(session, true);
		} else if (m.op === 'unquiet') {
			sounds.unquiet();
			alerts.unquiet();
		} else if (m.op === 'alerts') write(session);
		else if (m.op === 'sound') {
			if (typeof m.on === 'boolean') setSoundOn(session, m.on);
			if (typeof m.ringBack === 'boolean') setRingBack(session, m.ringBack);
		} else if (m.op === 'soundHere' && m.tab) {
			session.state = { ...session.state, soundTab: String(m.tab) };
			write(session);
		} else if (m.op === 'soundGone') {
			if (session.state.soundTab && session.state.soundTab === m.tab) {
				session.state = { ...session.state, soundTab: undefined };
				write(session);
			}
		} else error = `Unknown call command ${m.op}`;
	} catch (e: any) {
		error = e?.message ?? String(e);
	}
	session.channel?.post({ t: 'reply', id: m.id, ok: !error, error });
}

function toOwner(
	session: Session,
	op: string,
	args: Record<string, any>,
	timeoutMs?: number,
): Promise<void> {
	const id = `${Date.now()}-${++commandSeq}-${Math.random().toString(36).slice(2, 8)}`;
	return new Promise<void>((resolve, reject) => {
		const timer = setTimeout(
			() => {
				session.pending.delete(id);
				if (session.tabHealth) markChecking(session);
				reject(
					new CallError(
						'The tab with the call did not respond. Open the tab with the call to control it.',
					),
				);
			},
			timeoutMs ?? (session.tabHealth ? RELAY_TIMEOUT_MS : TAB_COMMAND_TIMEOUT_MS),
		);
		session.pending.set(id, { resolve, reject, timer });
		session.channel?.post({ t: 'cmd', id, op, ...args });
	});
}

function closeTabs(session: Session) {
	stopHealth(session);
	session.cancelWait?.();
	session.cancelWait = undefined;
	for (const p of Array.from(session.pending.values())) {
		clearTimeout(p.timer);
		p.reject(new CallError('Disconnected.'));
	}
	session.pending.clear();
	session.channel?.close();
	session.channel = undefined;
	if (session.lockName) getTabSync()?.release(session.lockName);
}

// ---------------------------------------------------------------- tab health (LZT-2762)

/**
 * Tab health. The tab holding the phone (owner) announces itself every OWNER_BEAT_MS over the tab
 * channel and answers a `ping` from its message handler (message handlers are not throttled in a
 * hidden tab, timers are). A follower that hears nothing for OWNER_QUIET_MS pings; no pong in
 * OWNER_PONG_MS means the owner is stale. A click to call from a follower probes first and never
 * places a call against a stale or signed out owner. Nothing here takes the lock from an owner.
 * Off unless Connect gets `tabHealth` true, and off in a browser with the TAB_HEALTH_KEY flag.
 */

const SIGNED = new Set(['ready', 'ringing', 'connected', 'ended']);
let hiddenSince = 0;
let visHooked = false;
let probeSeq = 0;

function tabHealthOff(): boolean {
	try {
		return localStore()?.getItem(TAB_HEALTH_KEY) === 'off';
	} catch {
		return false;
	}
}

function isHidden(): boolean {
	return typeof document !== 'undefined' && !!document.hidden;
}

function hookVisibility() {
	if (visHooked || typeof document === 'undefined' || !document.addEventListener) return;
	visHooked = true;
	hiddenSince = isHidden() ? Date.now() : 0;
	document.addEventListener('visibilitychange', () => {
		hiddenSince = isHidden() ? Date.now() : 0;
		const s = active;
		if (s?.tabHealth && s.role === 'follower' && !isHidden()) guard(() => checkOwner(s));
	});
}

function newHealth(): Health {
	return {
		unsignedSince: 0,
		regSince: 0,
		drops: [],
		followers: new Map(),
		lastAt: Date.now(),
		beatSeen: false,
		checking: false,
		stale: false,
		state: 'ok',
		since: Date.now(),
		probes: new Map(),
	};
}

function stopTimers(h: Health) {
	if (h.beatTimer) clearInterval(h.beatTimer);
	if (h.checkTimer) clearInterval(h.checkTimer);
	if (h.hereTimer) clearInterval(h.hereTimer);
	if (h.pongTimer) clearTimeout(h.pongTimer);
	if (h.placeTimer) clearTimeout(h.placeTimer);
	if (h.askTimer) clearTimeout(h.askTimer);
	h.beatTimer = h.checkTimer = h.hereTimer = h.pongTimer = h.placeTimer = h.askTimer = undefined;
}

function stopHealth(session: Session) {
	if (session.health) stopTimers(session.health);
	session.health?.probes.clear();
}

/** Switches tab health on or off for this session as the page asked (and the kill switch allows). */
function applyTabHealth(session: Session, options: ConnectOptions) {
	if (options.noteFunction !== undefined)
		session.noteFunction = options.noteFunction.trim() || undefined;
	const on = options.tabHealth === true && !tabHealthOff();
	if (on === !!session.tabHealth) return;
	if (!on) {
		stopHealth(session);
		session.tabHealth = false;
		session.health = undefined;
		return;
	}
	session.tabHealth = true;
	session.health = newHealth();
	hookVisibility();
	if (session.role === 'owner') startOwnerHealth(session);
	else if (session.role === 'follower') startFollowerHealth(session);
}

// owner side

function startOwnerHealth(session: Session) {
	const h = session.health!;
	stopTimers(h);
	h.followers.clear();
	h.lastStatus = undefined;
	if (!session.channel) return;
	const beat = () =>
		guard(() => {
			session.channel?.post({ t: 'beat', ...beatFields(session) });
			maybeResign(session);
		});
	beat();
	h.beatTimer = setInterval(beat, OWNER_BEAT_MS);
}

/** Keeps when the phone last left the signed in states, and the drops, from the status it shows. */
function trackStatus(session: Session) {
	const h = session.health;
	if (!h) return;
	const st = session.state.status;
	const now = Date.now();
	if (st !== h.lastStatus) {
		if (h.lastStatus && (st === 'registering' || st === 'error')) {
			h.drops.push({ at: now, what: st });
			if (h.drops.length > 8) h.drops.shift();
		}
		h.regSince = st === 'registering' ? now : 0;
		h.lastStatus = st;
	}
	if (SIGNED.has(st) || session.state.away) h.unsignedSince = 0;
	else if (!h.unsignedSince) h.unsignedSince = now;
}

function beatFields(session: Session) {
	const h = session.health!;
	trackStatus(session);
	const now = Date.now();
	for (const [tab, at] of Array.from(h.followers.entries()))
		if (now - at > 2 * TAB_HERE_MS + 10000) h.followers.delete(tab);
	const signedIn = SIGNED.has(session.state.status);
	const away = !!session.state.away;
	return {
		at: now,
		tab: TAB_ID,
		status: session.state.status,
		signedIn,
		away,
		unsignedSince: signedIn || away ? 0 : h.unsignedSince,
		regSince: h.regSince,
		drops: h.drops.slice(-8),
		hidden: isHidden(),
		hiddenSince,
		tabs: h.followers.size + 1,
	};
}

function healthFields(session: Session): Partial<CallState> {
	const h = session.health;
	if (session.role !== 'follower' || !h) return { phoneTab: 'here', ownerHealth: 'ok' };
	return {
		phoneTab: h.state === 'stale' || h.state === 'notSignedIn' ? 'stale' : 'other',
		ownerHealth: h.state,
		ownerSince: h.since,
	};
}

/** The state this tab shows: a follower adds what it knows of the tab holding the phone. */
function shown(session: Session): CallState {
	return session.tabHealth && session.role === 'follower'
		? { ...session.state, ...healthFields(session) }
		: session.state;
}

// follower side

function startFollowerHealth(session: Session) {
	const h = session.health!;
	stopTimers(h);
	h.lastAt = Date.now();
	h.stale = false;
	h.checking = false;
	h.state = 'ok';
	h.since = Date.now();
	if (!session.channel) return;
	h.checkTimer = setInterval(() => guard(() => checkOwner(session)), OWNER_CHECK_MS);
	const here = () => guard(() => session.channel?.post({ t: 'here', tab: TAB_ID }));
	here();
	h.hereTimer = setInterval(here, TAB_HERE_MS);
}

function recompute(session: Session) {
	const h = session.health;
	if (!h) return;
	const now = Date.now();
	const b = h.lastBeat;
	let next: OwnerHealth;
	if (h.stale) next = 'stale';
	else if (
		b &&
		!b.signedIn &&
		!b.away &&
		b.unsignedSince > 0 &&
		now - b.unsignedSince >= OWNER_UNSIGNED_MS
	)
		next = 'notSignedIn';
	else if (h.checking) next = 'checking';
	else next = 'ok';
	if (next === h.state) return;
	h.state = next;
	h.since = now;
	if (active === session && session.role === 'follower') show(session);
}

/** Anything the tab holding the phone posted: proof it is alive. */
function ownerMessage(session: Session, m: any) {
	if (m.t !== 'state' && m.t !== 'beat' && m.t !== 'pong' && m.t !== 'reply') return;
	const h = session.health;
	if (!h) return;
	h.lastAt = Date.now();
	h.stale = false;
	h.checking = false;
	if (h.pongTimer) clearTimeout(h.pongTimer);
	h.pongTimer = undefined;
	if (m.t === 'beat' || m.t === 'pong') {
		h.lastBeat = m;
		h.beatSeen = true;
	}
	for (const f of Array.from(h.probes.values())) f(m);
	recompute(session);
}

function checkOwner(session: Session) {
	const h = session.health;
	if (!h || active !== session || session.role !== 'follower' || h.checking) return;
	recompute(session);
	if (Date.now() - h.lastAt >= OWNER_QUIET_MS) ping(session);
}

function ping(session: Session, id = `${TAB_ID}-${++probeSeq}`) {
	const h = session.health!;
	h.checking = true;
	recompute(session);
	session.channel?.post({ t: 'ping', id });
	// An owner of an older bundle never answers a ping but does answer hello with its state.
	if (!h.beatSeen) session.channel?.post({ t: 'hello' });
	if (h.pongTimer) clearTimeout(h.pongTimer);
	h.pongTimer = setTimeout(() => {
		h.pongTimer = undefined;
		h.checking = false;
		h.stale = true;
		recompute(session);
	}, OWNER_PONG_MS);
}

/** A relay to the owner timed out: ask it directly whether it is there. */
function markChecking(session: Session) {
	if (session.role === 'follower' && session.health && !session.health.checking) ping(session);
}

/** Asks the owner now; answers what it said within `ms` (nothing in time is `stale`). */
function probeOwner(
	session: Session,
	ms = CLICK_PROBE_MS,
): Promise<'ok' | 'stale' | 'notSignedIn'> {
	const h = session.health!;
	const id = `${TAB_ID}-p${++probeSeq}`;
	return new Promise(resolve => {
		const done = (r: 'ok' | 'stale' | 'notSignedIn') => {
			clearTimeout(timer);
			h.probes.delete(id);
			resolve(r);
		};
		const timer = setTimeout(() => {
			h.stale = true;
			h.checking = false;
			recompute(session);
			done('stale');
		}, ms);
		h.probes.set(id, m => {
			if (m.t === 'pong' && m.id === id) done(m.signedIn || m.away ? 'ok' : 'notSignedIn');
			else if (m.t === 'state' && !h.beatSeen) done('ok');
		});
		session.channel?.post({ t: 'ping', id });
		if (!h.beatSeen) session.channel?.post({ t: 'hello' });
	});
}

function expectTimeout(session: Session): number | undefined {
	return session.tabHealth ? RELAY_TIMEOUT_EXPECT_MS : undefined;
}

/** Before a click to call from a follower: no call is placed against a dead or signed out owner. */
async function ensureOwnerReady(session: Session) {
	const r = await probeOwner(session);
	if (r === 'ok') return;
	bufferNote(describe(session, `probeFailed:${r}`));
	if (r === 'notSignedIn')
		toOwner(session, 'repair', {}, RELAY_TIMEOUT_EXPECT_MS).catch(() => undefined);
	throw new CallError(r === 'stale' ? OWNER_DEAD_MESSAGE : OWNER_NOT_SIGNED_MESSAGE);
}

// resign and take over (LZT-2762 step 2)

function takeoverOn(): boolean {
	try {
		const v = localStore()?.getItem(TAKEOVER_KEY);
		return v === 'on';
	} catch {
		return false;
	}
}

/**
 * The tab holding the phone gives it up when it cannot keep it up: signed out, dropped or stuck
 * connecting for RESIGN_AFTER_MS after it had been signed in, and another tab is there to take
 * it. A phoneless owner breaks every tab at once (a follower only waits for the lock). Never
 * during a call, and never more than RESIGN_MAX times in a row.
 */
function maybeResign(session: Session) {
	const h = session.health;
	if (!h || !takeoverOn() || active !== session || session.role !== 'owner') return;
	if (h.resigning || h.repairing || session.signingIn) return;
	// A phone that stayed signed in for 10 minutes since the last resign starts the count again.
	if (
		session.resigns &&
		SIGNED.has(session.state.status) &&
		Date.now() - (session.resignAt ?? 0) > 600000
	)
		session.resigns = 0;
	if (IN_CALL.has(session.state.status) || session.state.away) return;
	if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
	if ((session.resigns ?? 0) >= RESIGN_MAX) return;
	trackStatus(session);
	// Only a phone that was signed in and then dropped: a first sign in is waited for.
	if (!h.drops.length || h.followers.size === 0) return;
	const down =
		!SIGNED.has(session.state.status) &&
		h.unsignedSince > 0 &&
		Date.now() - h.unsignedSince >= RESIGN_AFTER_MS;
	if (down) void resign(session, 'unsigned');
}

/**
 * Signs the phone out (bounded), stops announcing, lets the lock go and queues for it again after
 * a wait that grows with every try. The next tab in the queue gets the lock and signs the phone in
 * through the same path as when a tab closes. The phone is signed out BEFORE the lock goes, so two
 * tabs are never signed in at once.
 */
async function resign(session: Session, why: string) {
	const h = session.health;
	const tabs = getTabSync();
	if (!h || !tabs || !session.lockName || active !== session || session.role !== 'owner') return;
	if (h.resigning || IN_CALL.has(session.state.status)) return;
	h.resigning = true;
	const lockName = session.lockName;
	const tries = session.resigns ?? 0;
	session.resigns = tries + 1;
	session.resignAt = Date.now();
	bufferNote(describe(session, `resign:${why}`));
	const adapter = session.adapter;
	session.adapter = undefined;
	stopTimers(h);
	await Promise.race([release(adapter), new Promise(r => setTimeout(r, RESIGN_SIGNOUT_MS))]);
	if (active !== session) return;
	session.role = 'follower';
	session.state = { status: 'registering', muted: false, otherTab: true };
	session.channel?.post({ t: 'resigned', tab: TAB_ID });
	tabs.release(lockName);
	startFollowerHealth(session);
	h.resigning = false;
	session.joining = true;
	show(session);
	const wait = RESIGN_REQUEUE_MS[Math.min(tries, RESIGN_REQUEUE_MS.length - 1)];
	const timer = setTimeout(() => {
		if (active === session && session.role === 'follower')
			session.cancelWait = tabs.waitLead(lockName, () => takeOver(session));
		session.channel?.post({ t: 'hello' });
	}, wait);
	session.cancelWait = () => clearTimeout(timer);
	session.channel?.post({ t: 'hello' });
}

/** "Use this tab": asks the tab holding the phone to give it up; no answer in time = it is frozen. */
function useThisTab(session: Session) {
	const h = session.health;
	if (!h || h.askTimer) return;
	session.channel?.post({ t: 'resign', tab: TAB_ID });
	h.askTimer = setTimeout(() => {
		h.askTimer = undefined;
		if (active !== session || session.role !== 'follower') return;
		// The tab did not answer: it is frozen, and its lock cannot be taken without a second phone.
		bufferNote(describe(session, 'useThisTab:noAnswer'));
		session.state = { ...session.state, error: OWNER_DEAD_MESSAGE };
		show(session);
	}, USE_THIS_TAB_WAIT_MS);
}

/**
 * For a button that says "Use this tab": asks the tab holding the phone to give it up. Nothing
 * happens in the tab that holds the phone, when the flag is off or tab health is off.
 */
export function useThisPhone(): boolean {
	const session = active;
	if (!session?.tabHealth || session.role !== 'follower' || !takeoverOn()) return false;
	useThisTab(session);
	return true;
}

function askAnswered(session: Session) {
	const h = session.health;
	if (h?.askTimer) clearTimeout(h.askTimer);
	if (h) h.askTimer = undefined;
}

// repair, Retry and the placing watchdog

/** Signs this tab's phone out and in again, in place (the lock stays). Never during a call. */
async function repairSignIn(session: Session) {
	const h = session.health;
	if (!h || active !== session || session.role === 'follower' || h.repairing) return;
	if (session.signingIn || IN_CALL.has(session.state.status) || session.state.away) return;
	h.repairing = true;
	try {
		const adapter = session.adapter;
		session.adapter = undefined;
		session.state = {
			...withoutCall(session.state),
			status: 'registering',
			...(session.state.placeFailed ? { placeFailed: session.state.placeFailed } : {}),
		};
		write(session);
		await release(adapter);
		if (active !== session) return;
		await signIn(session);
	} catch {
		// signIn wrote the error state.
	} finally {
		h.repairing = false;
	}
}

/** A Connect for the phone this tab already has: a stuck phone is signed in again (Retry). */
function retryIfStuck(session: Session) {
	const h = session.health;
	if (!h) return;
	if (session.role === 'follower') {
		if (takeoverOn() && (h.state === 'stale' || h.state === 'notSignedIn')) {
			// "Use this tab": ask the tab holding the phone to give it up.
			useThisTab(session);
			return;
		}
		if (h.state === 'notSignedIn')
			toOwner(session, 'repair', {}, RELAY_TIMEOUT_EXPECT_MS).catch(() => undefined);
		return;
	}
	const stuck =
		session.state.status === 'registering' &&
		h.regSince > 0 &&
		Date.now() - h.regSince >= REG_STUCK_MS;
	if (stuck || session.state.placeFailed) void repairSignIn(session);
}

function clearPlaceWatch(session: Session) {
	const h = session.health;
	if (h?.placeTimer) clearTimeout(h.placeTimer);
	if (h) h.placeTimer = undefined;
}

function armPlaceWatch(session: Session, on: boolean) {
	const h = session.health;
	if (!h) return;
	clearPlaceWatch(session);
	if (!on) return;
	if (session.state.placeFailed || session.state.retryOffer) {
		const { placeFailed, retryOffer, ...rest } = session.state;
		session.state = rest;
		write(session);
	}
	h.placeTimer = setTimeout(() => {
		h.placeTimer = undefined;
		placeTripped(session);
	}, PLACE_WATCH_MS);
}

/** The agent's own leg did not ring the browser phone in time: say so, sign in again, offer a retry. */
function placeTripped(session: Session) {
	if (active !== session || session.role === 'follower') return;
	if (IN_CALL.has(session.state.status) || expectUntil === 0) return;
	session.state = { ...session.state, placeFailed: 'browserNotConnected', retryOffer: false };
	write(session);
	void sendNote(session, expectedLog?.id, 'placeWatchdog');
	void repairSignIn(session).then(() => {
		if (active === session && session.state.placeFailed && !IN_CALL.has(session.state.status)) {
			session.state = { ...session.state, retryOffer: true };
			write(session);
		}
	});
}

// diagnostics

const pendingNotes: string[] = [];

function bufferNote(text: string) {
	pendingNotes.push(text);
	if (pendingNotes.length > 5) pendingNotes.shift();
}

function describe(session: Session, ev: string): string {
	const h = session.health;
	const now = Date.now();
	const clock = (ms: number) => new Date(ms).toTimeString().slice(0, 8);
	const follower = session.role === 'follower';
	const b = h?.lastBeat;
	const drops: Array<{ at: number; what: string }> = (follower ? b?.drops : h?.drops) ?? [];
	const signed = follower
		? b
			? b.signedIn
				? 1
				: 0
			: '?'
		: SIGNED.has(session.state.status)
			? 1
			: 0;
	const tabs = follower ? (b?.tabs ?? '?') : h ? h.followers.size + 1 : 1;
	return [
		`${clock(now)} ${ev}`,
		`role=${session.role}`,
		`tab=${TAB_ID.slice(-4)}`,
		`owner=${follower ? h?.state : 'self'}`,
		`beatAge=${b ? Math.round((now - b.at) / 1000) + 's' : 'none'}`,
		`signedIn=${signed}`,
		`drops=${drops.map(d => `${clock(d.at)} ${d.what}`).join(',') || 'none'}`,
		`hidden=${isHidden() ? Math.round((now - hiddenSince) / 1000) + 's' : 0}`,
		`tabs=${tabs}`,
		`online=${typeof navigator !== 'undefined' && navigator.onLine === false ? 0 : 1}`,
	].join(' ');
}

/** Stores a diagnostics note on the call row (no row yet: kept for the next note). Never throws. */
async function sendNote(session: Session, callLogId: string | undefined, ev: string) {
	const text = describe(session, ev);
	if (!session.noteFunction || !callLogId) return bufferNote(text);
	const note = [...pendingNotes.splice(0), text].join(' | ').slice(-400);
	try {
		await callServerFunction(session.noteFunction, { callLogId: String(callLogId), note });
	} catch {
		// Diagnostics only.
	}
}

/** Whether a tab still answers as the call tab within TAB_HELLO_MS. */
function ownerAnswers(session: Session): Promise<boolean> {
	return new Promise<boolean>(resolve => {
		const timer = setTimeout(() => {
			session.gotOwnerState = undefined;
			resolve(false);
		}, TAB_HELLO_MS);
		session.gotOwnerState = () => {
			clearTimeout(timer);
			session.gotOwnerState = undefined;
			resolve(true);
		};
		session.channel?.post({ t: 'hello' });
	});
}

/** How long a follower that found the call tab still there waits before it queues for the lock again. */
export const STEP_BACK_MS = 5000;

/** Gives the lock back to the tab that still holds the call and queues for it again later. */
function stepBack(session: Session) {
	const tabs = getTabSync();
	if (active !== session || !session.lockName || !tabs) return;
	const lockName = session.lockName;
	tabs.release(lockName);
	const timer = setTimeout(() => {
		if (active === session && session.role === 'follower')
			session.cancelWait = tabs.waitLead(lockName, () => takeOver(session));
	}, STEP_BACK_MS);
	session.cancelWait = () => clearTimeout(timer);
}

/** The owner tab went away: this follower signs in and holds calls from now on. */
async function takeOver(session: Session) {
	if (active !== session || session.role !== 'follower') {
		if (session.lockName) getTabSync()?.release(session.lockName);
		return;
	}
	session.cancelWait = undefined;
	// A free lock alone does not prove the call tab is gone (AB-1013): a tab that still answers
	// holds the call, so this one gives the lock back and keeps following, and never signs in
	// over it (the provider keeps one sign in per agent and the newest drops the call).
	if (IN_CALL.has(session.state.status) && (await ownerAnswers(session)))
		return stepBack(session);
	if (active !== session || session.role !== 'follower') return;
	const { otherTab, ...rest } = session.state;
	// This tab holds the call now and plays its sounds itself.
	if (rest.soundTab === TAB_ID) rest.soundTab = undefined;
	// The call (if any) was in the tab that went away: it is over, show it as ended.
	let ended: CallState | undefined;
	if (IN_CALL.has(rest.status))
		ended = {
			...rest,
			status: 'ended',
			muted: false,
			endedAt: Date.now(),
			endReason: 'pageClosed',
		};
	else if (rest.status === 'ended') ended = rest;
	session.role = 'owner';
	session.state = ended ?? { status: 'registering', muted: false };
	if (session.tabHealth) startOwnerHealth(session);
	write(session);
	try {
		await signIn(session);
	} catch {
		// signIn wrote the error state.
		return;
	}
	// Signed in: keep showing how the last call ended until the next one starts.
	if (ended && active === session && session.state.status === 'ready') {
		session.state = { ...ended, error: undefined };
		write(session);
	}
}

// ---------------------------------------------------------------- sign in

/** How many times a sign in asks for the credentials before it gives up (LZT-2167). */
export const CREDENTIAL_ATTEMPTS = 3;
/** The wait between those asks: rides out a briefly unreachable server. */
export const CREDENTIAL_RETRY_MS = 5000;

/**
 * The credentials for this sign in. A network blip or a 5xx is asked again a few times, so a
 * takeover after a short outage does not leave every tab without a phone; a refusal (calling not
 * turned on, not allowed) is not.
 */
async function credentialsFor(session: Session): Promise<CallCredentials> {
	for (let attempt = 1; ; attempt++) {
		try {
			return await session.source();
		} catch (e) {
			const transient = e instanceof CredentialError && !e.permanent;
			if (!transient || attempt >= CREDENTIAL_ATTEMPTS) throw e;
		}
		await new Promise(resolve => setTimeout(resolve, CREDENTIAL_RETRY_MS));
		if (active !== session) throw new CallError('Disconnected before sign in finished.');
	}
}

/** Thrown inside signIn when a Disconnect or a newer Connect replaced the session meanwhile. */
class Replaced extends CallError {}

/** localStorage key prefix; the user id follows. Holds 'away' while the agent chose away. */
export const AWAY_KEY = 'modlix.call.away';

function awayRemembered(): boolean {
	try {
		return localStore()?.getItem(userKey(AWAY_KEY)) === 'away';
	} catch {
		return false;
	}
}

function rememberAway(on: boolean) {
	try {
		if (on) localStore()?.setItem(userKey(AWAY_KEY), 'away');
		else localStore()?.removeItem(userKey(AWAY_KEY));
	} catch {
		// Storage blocked: the choice lasts while this tab holds the phone.
	}
}

/**
 * Signs this tab's phone in: the credentials, the provider's SDK, the sign in. Every await can
 * be overtaken by a Disconnect (a sign out) or a newer Connect, and the SDK load and the
 * microphone are unbounded, so each step checks the session is still the one running and a phone
 * made after the session ended is signed out at once (LZT-2167, LZT-2163).
 */
async function signIn(session: Session): Promise<void> {
	session.signingIn = true;
	try {
		return await signInInner(session);
	} finally {
		session.signingIn = false;
	}
}

async function signInInner(session: Session): Promise<void> {
	if (awayRemembered()) {
		const base =
			session.state.status === 'registering' ? withoutCall(session.state) : session.state;
		session.state = { ...base, status: base.status === 'ended' ? 'ended' : 'idle', away: true };
		write(session);
		return;
	}
	const live = () => active === session && session.generation !== -1;
	let adapter: CallAdapter | undefined;
	try {
		const credentials = await credentialsFor(session);
		if (!live()) throw new Replaced('Disconnected before sign in finished.');
		adapter = await session.factory();
		if (!live()) {
			// Made after the session ended: nothing else will ever release it.
			await release(adapter);
			throw new Replaced('Disconnected before sign in finished.');
		}
		session.adapter = adapter;
		const mine = adapter;
		adapter.onStateChange(patch => {
			if (active === session && session.adapter === mine && session.generation === generation)
				guard(() => apply(session, patch));
		});
		await adapter.load();
		if (!live()) throw new Replaced('Disconnected before sign in finished.');
		await withTimeout(
			adapter.register(credentials),
			REGISTER_TIMEOUT_MS,
			'The call provider did not confirm the sign in.',
		);
	} catch (error) {
		// Replaced: the Disconnect released the adapter it found; this one keeps nothing.
		if (!live()) throw error;
		// The adapter may hold a half open connection; release it, keep the error state.
		await release(session.adapter);
		const message = error instanceof Error ? error.message : String(error);
		session.state = { status: 'error', muted: false, error: message };
		write(session);
		closeTabs(session);
		active = undefined;
		session.generation = -1;
		throw error instanceof CallError ? error : new CallError(message);
	}

	if (active === session && session.state.status === 'registering')
		apply(session, { status: 'ready', error: undefined });
	if (active === session) sounds.prefetch();
}

async function release(adapter: CallAdapter | undefined) {
	try {
		await adapter?.disconnect();
	} catch {
		// Nothing more to release.
	}
}

/** Same keys in any order give the same text; values only, no key is dropped. */
function stableText(v: any): string {
	if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'undefined';
	if (Array.isArray(v)) return `[${v.map(stableText).join(',')}]`;
	return `{${Object.keys(v)
		.sort()
		.map(k => `${JSON.stringify(k)}:${stableText(v[k])}`)
		.join(',')}}`;
}

/** The provider and a digest of the credentials (FNV-1a), so the password itself is not kept. */
function identityOf(provider: string, credentials: CallCredentials): string {
	const text = stableText(credentials);
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return `${provider}:${(h >>> 0).toString(36)}:${text.length}`;
}

/**
 * A Connect for the phone this tab already has (same provider and credentials, not failed). The
 * page runs Connect from a Timer, and a Timer fires once per mount, so any remount of the shell
 * ran it again. Signing out and in again released the tab lock to another tab, which signed in
 * too, and the provider keeps one sign in per agent: the newest logged the call tab out and
 * dropped its call (LZT-2141, AB-1012). Such a Connect now keeps the session as it is.
 */
function sameSession(session: Session, identity: string): boolean {
	return (
		session.identity === identity &&
		session.generation !== -1 &&
		session.state.status !== 'error'
	);
}

export interface ConnectOptions {
	/**
	 * `Namespace.name` of the server function the engine asks for the agent's credential, just
	 * before this tab signs in (LZT-2162). `credentials` then holds only extra settings, if any.
	 */
	credentialsFunction?: string;
	/** The arguments that function is called with. */
	credentialsArgs?: Record<string, any>;
	/** Where the call bar's display values are written (LZT-2161), for example `Store.callDisplay`. */
	displayPath?: string;
	/**
	 * LZT-2731: true when the browser phone's own events end an incoming call, so the server's
	 * report of its end no longer hangs the call up after SERVER_END_GRACE_MS (only after
	 * SERVER_END_FLOOR_MS as a floor). Absent or false: unchanged.
	 */
	sdkFirst?: boolean;
	/**
	 * LZT-2762: the tabs check each other (owner beat, follower ping), a click to call from a
	 * follower is refused when the phone's tab is dead or not signed in, a placed call whose
	 * browser leg never rings signs the phone in again, and Retry re-signs a stuck phone. Absent or
	 * false: unchanged. `localStorage['modlix.call.tabHealth'] = 'off'` turns it off here.
	 */
	tabHealth?: boolean;
	/** `Namespace.name` of the function that stores a diagnostics note on a call row. */
	noteFunction?: string;
}

let authStop: (() => void) | undefined;

/**
 * Started by the first Connect and kept: the session can begin and end many times. A sign out
 * here or in another tab, or a different user signing in, signs the phone out (LZT-2163).
 */
function watchAuth() {
	if (authStop) return;
	authStop = getAuthWatch()?.watch(elsewhere => {
		const session = active;
		if (!session) return;
		const now = getAuthWatch()?.user() ?? '';
		if (elsewhere || (session.user !== '' && now !== session.user))
			disconnect().catch(() => undefined);
	});
}

/** The state the editor canvas gets: nothing signs in there and no control reaches a phone. */
function designerState(): CallState {
	return active ? duplicate(active.state) : idleState();
}

export async function connect(
	provider: string,
	credentials: CallCredentials | undefined,
	statePath: string,
	pageName: string,
	options: ConnectOptions = {},
): Promise<CallState> {
	// The editor canvas never signs a real phone in (LZT-2164).
	if (inDesigner()) return designerState();
	if (!statePath?.trim()) throw new CallError('statePath is required.');
	const factory = getCallProvider(provider);
	if (!factory) throw new CallError(`Unknown call provider "${provider}".`);
	const fn = options.credentialsFunction?.trim() || undefined;
	if (fn && credentials !== undefined && credentials !== null && typeof credentials !== 'object')
		throw new CallError('credentials must be an object.');
	if (!fn && (!credentials || typeof credentials !== 'object'))
		throw new CallError('credentials or credentialsFunction is required.');

	const name = provider.trim().toLowerCase();
	const user = getAuthWatch()?.user() ?? '';
	const extra: CallCredentials =
		credentials && typeof credentials === 'object' ? credentials : {};
	const args = options.credentialsArgs ?? {};
	// Fetched: the same function, arguments and user are the same phone, without asking for it.
	const identity = fn
		? identityOf(name, { fn, args, extra, user })
		: identityOf(name, credentials!);
	if (active && sameSession(active, identity)) {
		const session = active;
		session.sdkFirst = options.sdkFirst === true;
		applyTabHealth(session, options);
		if (session.tabHealth) retryIfStuck(session);
		const displayPath = options.displayPath?.trim() ?? '';
		if (
			session.statePath !== statePath ||
			session.pageName !== pageName ||
			session.displayPath !== displayPath
		) {
			session.statePath = statePath;
			session.displayPath = displayPath;
			session.pageName = pageName;
			session.display = undefined;
			show(session);
		}
		return duplicate(session.state);
	}

	if (active) {
		if (IN_CALL.has(active.state.status))
			throw new CallError('A call is in progress. Hang up before connecting again.');
		await disconnect();
	}

	// Held in this closure, never in a field: a follower keeps no credential, only the way to
	// ask for one when it takes over.
	const source = fn
		? async () => ({ ...extra, ...(await fetchCredentials(name, fn, args)) })
		: async () => credentials!;

	const session: Session = {
		provider: name,
		statePath,
		displayPath: options.displayPath?.trim() ?? '',
		pageName,
		state: { status: 'registering', muted: false },
		generation: ++generation,
		role: 'solo',
		pending: new Map(),
		identity,
		user,
		source,
		factory,
		...(options.sdkFirst === true ? { sdkFirst: true } : {}),
	};
	active = session;
	watchAuth();

	hookUnload();
	const tabs = getTabSync();
	if (!tabs) applyTabHealth(session, options);
	if (tabs) {
		const lockName = `modlix.call.${session.provider}`;
		const lead = await tabs.tryLead(lockName);
		if (active !== session) {
			if (lead) tabs.release(lockName);
			throw new CallError('Replaced by a newer Connect.');
		}
		session.lockName = lockName;
		session.role = lead ? 'owner' : 'follower';
		session.channel = tabs.open(lockName, m => guard(() => onTabMessage(session, m)));
		applyTabHealth(session, options);
		if (!lead) {
			session.state = { status: 'ready', muted: false, otherTab: true };
			await new Promise<void>(resolve => {
				const timer = setTimeout(resolve, TAB_HELLO_MS);
				session.gotOwnerState = () => {
					clearTimeout(timer);
					resolve();
				};
				session.joining = true;
				session.channel?.post({ t: 'hello' });
			});
			session.joining = false;
			session.gotOwnerState = undefined;
			if (active !== session) return session.state;
			if (session.state.soundOn === undefined)
				session.state = {
					...session.state,
					soundOn: sounds.isOn(),
					audioBlocked: false,
					alertsOffer: alerts.canOffer(),
				};
			show(session);
			restoreLost(session);
			session.cancelWait = tabs.waitLead(lockName, () => takeOver(session));
			return session.state;
		}
	}

	write(session);
	await signIn(session);
	if (active === session) restoreLost(session);
	return session.state;
}

function checkCallId(session: Session, callId?: string) {
	if (callId && session.state.callId && callId !== session.state.callId)
		throw new CallError(`No call with id ${callId}.`);
}

/**
 * Asks for the microphone before a call is answered, so a blocked or missing microphone is a
 * clear error up front instead of an SDK media failure after the provider saw the answer
 * (a click to call agent leg would then be answered with no audio, or left ringing).
 */
export async function ensureMicrophone(): Promise<void> {
	const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
	if (!devices?.getUserMedia) return;
	let stream: MediaStream;
	try {
		stream = await devices.getUserMedia({ audio: true });
	} catch (e: any) {
		const name = e?.name ?? '';
		if (name === 'NotAllowedError' || name === 'SecurityError')
			throw new CallError('The microphone is blocked for this site');
		if (name === 'NotFoundError' || name === 'OverconstrainedError')
			throw new CallError('No microphone was found');
		throw new CallError(
			`The microphone could not be opened${e?.message ? ': ' + e.message : ''}`,
		);
	}
	stream.getTracks().forEach(t => t.stop());
}

/**
 * Answers the ringing call. `ringBack`: this is the browser leg of a call the user placed (click
 * to call rings the browser first), so the ring back plays until the far end answers.
 */
export async function answer(callId?: string, ringBack = false): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	if (session.state.status !== 'ringing' || session.state.direction !== 'inbound')
		throw new CallError('No incoming call to answer.');
	checkCallId(session, callId);
	const id = callId || session.state.callId;
	// The ring stops at the press, not when the provider confirms.
	sounds.quietFor(id);
	alerts.quietFor(id);
	if (session.role === 'follower')
		toOwner(session, 'answering', { callId: id, ringBack }).catch(() => undefined);
	else if (ringBack) setRingBack(session, true);
	try {
		// Asked here, in the tab the user looks at; the permission then holds for the call tab too.
		await ensureMicrophone();
		if (session.role === 'follower') await toOwner(session, 'answer', { callId, ringBack });
		else await session.adapter!.answer(id);
	} catch (e) {
		sounds.unquiet();
		alerts.unquiet();
		if (session.role === 'follower') toOwner(session, 'unquiet', {}).catch(() => undefined);
		fail(session, e);
	}
	return session.state;
}

/**
 * `dismiss`: Close on an ended call's summary. Clears that ended call in every tab of the site
 * and never hangs anything up: a call that started meanwhile is left alone.
 */
export async function hangup(callId?: string, dismiss = false): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	if (dismiss) {
		if (session.state.status !== 'ended') return session.state;
		if (session.role !== 'follower') {
			dismissEnded(session, callId);
			return session.state;
		}
		const lostHere = session.state.endReason === 'pageClosed' && !session.state.otherTab;
		const id = callId || session.state.callId;
		if (!lostHere) session.skipEnded = endedKey(session.state);
		// Shown at once here; the call tab clears it for every other tab.
		session.state = { ...withoutCall(session.state), otherTab: true };
		show(session);
		if (!lostHere) toOwner(session, 'dismiss', { callId: id }).catch(() => undefined);
		return session.state;
	}
	if (!IN_CALL.has(session.state.status)) throw new CallError('No call to hang up.');
	checkCallId(session, callId);
	if (session.role === 'follower') {
		try {
			await toOwner(session, 'hangup', { callId });
		} catch (e) {
			fail(session, e);
		}
		return session.state;
	}
	try {
		await session.adapter!.hangup(callId || session.state.callId);
	} catch (e) {
		fail(session, e);
	}
	// Some SDKs report the end later, or not at all for a local hangup.
	if (IN_CALL.has(session.state.status)) apply(session, { status: 'ended' });
	return session.state;
}

export async function mute(on: boolean): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	if (session.state.status !== 'connected') throw new CallError('No connected call to mute.');
	if (session.role === 'follower') {
		try {
			await toOwner(session, 'mute', { on: !!on });
		} catch (e) {
			fail(session, e);
		}
		return session.state;
	}
	try {
		await session.adapter!.mute(!!on);
	} catch (e) {
		fail(session, e);
	}
	apply(session, { muted: !!on });
	return session.state;
}

export async function hold(on: boolean): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	if (session.state.status !== 'connected') throw new CallError('No connected call to hold.');
	if (session.role === 'follower') {
		try {
			await toOwner(session, 'hold', { on: !!on });
		} catch (e) {
			fail(session, e);
		}
		return session.state;
	}
	if (!session.adapter?.hold) throw new CallError('This provider cannot hold a call.');
	try {
		await session.adapter.hold(!!on);
	} catch (e) {
		fail(session, e);
		return session.state;
	}
	apply(session, { held: !!on });
	return session.state;
}

const DTMF_KEY = /^[0-9*#]$/;

/**
 * Sends one keypad tone on the connected call (LZT-2166), to work through the far end's menu.
 * From any tab: a follower sends it to the tab holding the call. A key the provider refuses is
 * an error, never reported as sent.
 */
export async function sendDtmf(digit: string): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	const key = String(digit ?? '').trim();
	if (!DTMF_KEY.test(key))
		throw new CallError(`"${key}" is not a keypad key: use one of 0 to 9, * or #.`);
	if (session.state.status !== 'connected')
		throw new CallError('No connected call to send a key on.');
	if (session.role === 'follower') {
		try {
			await toOwner(session, 'dtmf', { digit: key });
		} catch (e) {
			fail(session, e);
		}
		return session.state;
	}
	if (!session.adapter?.sendDtmf) throw new CallError('This provider cannot send keypad tones.');
	try {
		await session.adapter.sendDtmf(key);
	} catch (e) {
		fail(session, e);
	}
	return session.state;
}

/**
 * Away (`available` false) signs the browser phone out, so the provider sends the agent's calls to
 * their phone instead (on TeleCMI, the follow me number), without closing any tab (LZT-2166).
 * Available signs it in again, with a fresh credential. The choice is remembered for the user in
 * this browser and shows in every tab as `away`. Refused during a call: it would drop it.
 */
export async function setAvailability(available: boolean): Promise<CallState> {
	if (inDesigner()) return designerState();
	const session = current();
	if (session.role === 'follower') {
		if (!!session.state.away === !available) return session.state;
		try {
			await toOwner(session, 'available', { on: available });
		} catch (e) {
			fail(session, e);
		}
		return session.state;
	}
	if (!available) {
		if (session.state.away) return session.state;
		if (IN_CALL.has(session.state.status))
			throw new CallError('Finish the call before going away.');
		rememberAway(true);
		const adapter = session.adapter;
		session.adapter = undefined;
		session.state = { ...withoutCall(session.state), status: 'idle', away: true };
		write(session);
		await release(adapter);
		return session.state;
	}
	if (!session.state.away && session.state.status !== 'idle') return session.state;
	rememberAway(false);
	const { away, ...rest } = withoutCall(session.state);
	session.state = { ...rest, status: 'registering' };
	write(session);
	await signIn(session);
	return session.state;
}

export async function disconnect(): Promise<CallState> {
	const session = active;
	if (!session) return idleState();
	active = undefined;
	session.generation = -1;
	try {
		await session.adapter?.disconnect();
	} finally {
		closeTabs(session);
		expectedLog = undefined;
		boundExact = false;
		sounds.reset();
		alerts.reset();
		session.state = idleState();
		setData(session.statePath, duplicate(session.state), session.pageName);
		ticker.stop();
		if (session.displayPath)
			guard(() =>
				setData(
					session.displayPath,
					computeDisplay(session.state, undefined, false, Date.now()),
					session.pageName,
				),
			);
	}
	return session.state;
}

// ---------------------------------------------------------------- what the server says

/**
 * What the server reports about the call this user is on (answered by the customer, ended), as
 * the page receives it from the server's event stream. Every tab of the site has its own stream,
 * and a tab that is in the background, was just opened or reconnected can miss a frame, so the
 * tabs used to disagree (one "in call", one still "dialling"). Now each tab that receives a
 * frame merges it here and tells the other tabs over the channel, so all of them show the same.
 * The merge only moves forward (ringing, in progress, ended) and never walks a call back.
 */
export interface LiveReport {
	callLogId: string;
	dealId?: string;
	direction?: string;
	status: string;
	terminal: boolean;
	talkDuration?: number;
	/** Epoch ms when a tab received the frame. */
	at: number;
	/** Epoch ms of the first frame that said the call was in progress, 0 until then. */
	answeredAt?: number;
	/** Seconds the call rang, when the server knows it. */
	ringDuration?: number;
	/** The calling connection and caller id line the call used (for Redial on the same line). */
	connectionName?: string;
	callerId?: string;
	customerDialCode?: string;
	customerPhoneNumber?: string;
	/** The stored recording, once the server has it. */
	recordingFile?: string;
	provider?: string;
}

/** What the server adds about a call as it goes; a frame without one keeps the one already known. */
const LIVE_DETAILS = [
	'ringDuration',
	'connectionName',
	'callerId',
	'customerDialCode',
	'customerPhoneNumber',
	'recordingFile',
	'provider',
] as const;

const DEFAULT_LIVE_PATH = 'Store.callLive';

let live: LiveReport | undefined;
let livePath = DEFAULT_LIVE_PATH;
let livePage = '_global';

function liveRank(r: LiveReport): number {
	return r.terminal ? 3 : r.status === 'IN_PROGRESS' ? 2 : 1;
}

/**
 * The calls the server reported, by callLogId: when this tab first heard of each and whether it
 * ended. TeleCMI sends a call's final record again about five minutes later (with the recording),
 * and leg events reach the page on the next 30 s tick, so frames of an earlier call keep arriving
 * while the next one is up (LZT-2156).
 */
const heard = new Map<string, { first: number; ended: boolean; endedAt?: number }>();
const HEARD_MAX = 50;

function hear(report: LiveReport) {
	const h = heard.get(report.callLogId);
	if (h) {
		if (report.terminal && !h.ended) {
			h.ended = true;
			h.endedAt = report.at;
		}
		return;
	}
	heard.set(report.callLogId, {
		first: report.at,
		ended: report.terminal,
		...(report.terminal ? { endedAt: report.at } : {}),
	});
	if (heard.size > HEARD_MAX) heard.delete(heard.keys().next().value!);
}

/**
 * Whether a server call no binding names is taken as the call up here: first heard around when
 * this call came up (FIRST_FRAME_EARLY_MS), and not over already (LZT-2208). An earlier call
 * heard within that window, a click to call attempt that ended a few seconds before the agent
 * pressed Call again, or an earlier call whose record first reached this tab as its end (TeleCMI
 * events reach the page in batches, up to half a minute late), was taken as the new call, so the
 * new call showed as ended at once and the shell hung it up two seconds after it rang.
 * `inCall`: the call is still up here; once it ended, its own final record, heard after it came
 * up, is its end.
 */
function heardAsThisCall(callLogId: string, inCall: boolean): boolean {
	const h = heard.get(callLogId);
	if (!h || h.first < callSince - FIRST_FRAME_EARLY_MS) return false;
	if (h.endedAt === undefined) return true;
	if (h.endedAt < callSince) return false;
	return !(inCall && h.endedAt === h.first);
}

/** Within this, a call still reported as going on is taken as the current one. */
const CURRENT_CALL_MS = 10 * 60 * 1000;

/**
 * A frame of another call that must not replace the current report: a call heard of before the
 * current one, or the end of a call this tab never followed while the current call goes on.
 */
function olderCall(prev: LiveReport | undefined, next: LiveReport): boolean {
	if (!prev || prev.callLogId === next.callLogId) return false;
	const p = heard.get(prev.callLogId);
	const n = heard.get(next.callLogId);
	if (n) return !!p && n.first < p.first;
	return next.terminal && !prev.terminal && next.at - prev.at < CURRENT_CALL_MS;
}

/**
 * Calls whose frames arrived while another call was up, with the callSince of the call that was
 * up then (LZT-2169). The TeleCMI browser phone refuses a second call while one is up (its SDK
 * ends any second incoming session at once), but the server still reports that call: its frames
 * and the 4 s poll of the newest call log replaced the report of the call going on, so the call
 * summary showed the second caller and the first call's own end was then dropped as older.
 */
const heldBack = new Map<string, number>();

/** How early a call's first frame may come before the browser rings or dials for it. */
const FIRST_FRAME_EARLY_MS = 20000;

/**
 * Whether `prev` is the call up in this browser (ringing, connected, or just ended and showing
 * its summary). With no call connection, a call the server says is in progress.
 */
function callUp(prev: LiveReport): boolean {
	const state = active?.state;
	if (!state) return prev.status === 'IN_PROGRESS';
	if (!IN_CALL.has(state.status) && state.status !== 'ended') return false;
	const bound = boundId();
	if (bound) return bound === prev.callLogId;
	return heardAsThisCall(prev.callLogId, IN_CALL.has(state.status));
}

/**
 * A frame of another call while the call in `prev` is up: it never replaces that call's report.
 * Such a call stays held back until this browser has a newer call of its own (then it may be
 * that call); with no call connection, until the server says it is in progress.
 */
function heldOther(prev: LiveReport | undefined, next: LiveReport): boolean {
	if (!prev || prev.callLogId === next.callLogId) return false;
	const answered = next.status === 'IN_PROGRESS' && !next.terminal;
	const held = heldBack.get(next.callLogId);
	if (held !== undefined) {
		if (active ? held === callSince : !answered) return true;
		heldBack.delete(next.callLogId);
		return false;
	}
	if (prev.terminal || !callUp(prev)) return false;
	if (!active && (answered || next.at - prev.at >= CURRENT_CALL_MS)) return false;
	heldBack.set(next.callLogId, callSince);
	if (heldBack.size > HEARD_MAX) heldBack.delete(heldBack.keys().next().value!);
	return true;
}

/** The report after `next` arrives, or `prev` itself when `next` adds nothing. */
export function mergeLive(prev: LiveReport | undefined, next: LiveReport): LiveReport {
	// The call bound to the call up here is never held back behind another call (LZT-2256).
	const bound = boundId();
	const isBound = !!bound && next.callLogId === bound && prev?.callLogId !== bound;
	if (!isBound && (olderCall(prev, next) || heldOther(prev, next))) return prev!;
	const same = !!prev && prev.callLogId === next.callLogId;
	if (same && liveRank(next) < liveRank(prev!)) return prev!;
	const answeredFrom = [
		next.status === 'IN_PROGRESS' ? next.at : 0,
		same ? (prev!.answeredAt ?? 0) : 0,
		next.answeredAt ?? 0,
	].filter(x => x > 0);
	const merged: LiveReport = {
		...next,
		at: same ? Math.max(prev!.at, next.at) : next.at,
		answeredAt: answeredFrom.length ? Math.min(...answeredFrom) : 0,
	};
	if (same && liveRank(next) === liveRank(prev!) && next.status !== 'IN_PROGRESS') {
		// A repeat of what is known: keep the first frame's time so nothing moves.
		merged.at = prev!.at;
	}
	if (same)
		for (const k of LIVE_DETAILS)
			if (merged[k] === undefined && prev![k] !== undefined) (merged as any)[k] = prev![k];
	return merged;
}

function sameLive(a: LiveReport | undefined, b: LiveReport): boolean {
	return (
		!!a &&
		a.callLogId === b.callLogId &&
		a.status === b.status &&
		a.terminal === b.terminal &&
		(a.talkDuration ?? 0) === (b.talkDuration ?? 0) &&
		(a.answeredAt ?? 0) === (b.answeredAt ?? 0) &&
		a.at === b.at &&
		LIVE_DETAILS.every(k => a[k] === b[k])
	);
}

/** What was last written to the live path (and where), so an unchanged report is not written again. */
let liveWritten: { key: string; report: LiveReport } | undefined;

/**
 * LZT-2762 step 1 (behind tabHealth): the tabs stop echoing the server's call reports.
 * - Only the tab holding the phone (owner) posts a report to the other tabs; a follower only
 *   applies what it hears or gets from its own stream and never posts it on (a follower that
 *   posted made every tab re-post, one hang-up became a storm of writes and renders).
 * - The report is written to the store only when it changed (`sameLive`), not on every message.
 */
function applyLive(report: LiveReport, own: boolean) {
	const merged = mergeLive(live, report);
	hear(report);
	const changed = !sameLive(live, merged);
	live = merged;
	const session = active;
	const quiet = session?.tabHealth === true;
	const key = `${livePath}|${livePage}`;
	if (!quiet || changed || liveWritten?.key !== key || !sameLive(liveWritten.report, merged)) {
		// With tab health off it is written again even when nothing changed (the old behaviour).
		setData(livePath, duplicate(merged), livePage);
		liveWritten = { key, report: duplicate(merged) };
	}
	if (changed && (!quiet || session?.role !== 'follower'))
		session?.channel?.post({ t: 'live', live: duplicate(merged) });
	serverEnd(report, merged);
	if (session) guard(() => writeDisplay(session));
	return own ? merged : undefined;
}

/**
 * The call tab ends its side of a call the server says is over, when the browser phone did not
 * (an outgoing call the customer ended: the phone SDK does not always report it). The server's
 * call is told from the engine's call by the first frame that was not an end and arrived while
 * this call was up; only an end of THAT call counts, never a late end of an earlier one.
 */
function serverEnd(report: LiveReport, merged: LiveReport) {
	const session = active;
	if (!session || session.role === 'follower' || !IN_CALL.has(session.state.status)) return;
	if (
		boundExact &&
		boundLog &&
		!heard.has(boundLog) &&
		Date.now() - boundAt > EXPECTED_LOG_WAIT_MS
	) {
		// The id the page gave never showed up: the time windows decide, as for a call with no id.
		boundLog = undefined;
		boundExact = false;
		expectedLog = undefined;
	}
	if (!boundLog && bindable(report, merged)) {
		boundLog = report.callLogId;
		boundExact = false;
	}
	if (!merged.terminal || !boundLog || boundLog !== merged.callLogId || endTimer) return;
	// LZT-2731: with sdkFirst an incoming call ends on the browser phone's own end; the server's
	// end waits SERVER_END_FLOOR_MS (the phone's end clears the timer) so a lost BYE cannot keep
	// the card up for good. An outgoing call (and the agent's own leg of a click to call, which
	// is marked outbound) keeps the short grace: the SDK does not always report the customer
	// ending it.
	const wait =
		session.sdkFirst === true && session.state.direction === 'inbound'
			? SERVER_END_FLOOR_MS
			: SERVER_END_GRACE_MS;
	endTimer = setTimeout(() => {
		endTimer = undefined;
		void endByServer(session);
	}, wait);
}

/**
 * The server's call is the call up in the browser: a frame not an end, of a call first heard of
 * around when this call came up, that has not ended already. A leftover frame of the call before
 * (a leg event on the next tick, the final record sent again) once got bound, and its end then
 * hung up the new call (LZT-2156).
 */
function bindable(report: LiveReport, merged: LiveReport): boolean {
	if (report.terminal || merged.callLogId !== report.callLogId) return false;
	const h = heard.get(report.callLogId);
	return !!h && !h.ended && h.first >= callSince - 5000 && report.at >= callSince - 5000;
}

async function endByServer(session: Session) {
	if (active !== session || session.role === 'follower') return;
	if (!IN_CALL.has(session.state.status) || boundLog !== live?.callLogId) return;
	try {
		await session.adapter?.hangup(session.state.callId);
	} catch {
		// The phone may already be gone: the card still has to end.
	}
	if (active === session && IN_CALL.has(session.state.status))
		apply(session, { status: 'ended' });
}

/** `UIEngine.Call.Live`: the page received a `call` frame from the server. */
export function liveFrame(
	report: Partial<LiveReport> & { callLogId?: string },
	path?: string,
	pageName?: string,
): CallState {
	if (path?.trim()) livePath = path.trim();
	if (pageName) livePage = pageName;
	if (report.callLogId) {
		const status = String(report.status ?? '');
		applyLive(
			{
				callLogId: String(report.callLogId),
				dealId: report.dealId,
				direction: report.direction,
				status,
				terminal: report.terminal === true || (report.terminal as any) === 'true',
				talkDuration: Number(report.talkDuration ?? 0) || 0,
				at: Number(report.at) || Date.now(),
				answeredAt: Number(report.answeredAt ?? 0) || 0,
				...liveDetails(report),
			},
			true,
		);
	}
	return active?.state ?? idleState();
}

/** The details a frame carries, typed; blanks and nulls are left out. */
function liveDetails(report: Partial<LiveReport>): Partial<LiveReport> {
	const out: Partial<LiveReport> = {};
	const ring = Number(report.ringDuration);
	if (report.ringDuration !== undefined && report.ringDuration !== null && !Number.isNaN(ring))
		out.ringDuration = ring;
	for (const k of LIVE_DETAILS) {
		if (k === 'ringDuration') continue;
		const v = report[k];
		if (v !== undefined && v !== null && String(v) !== '') (out as any)[k] = String(v);
	}
	return out;
}

/** For tests. */
export function liveReport(): LiveReport | undefined {
	return live;
}

// ---------------------------------------------------------------- sounds

function setRingBack(session: Session, on: boolean) {
	if (!IN_CALL.has(session.state.status) || !!session.state.ringBack === on) return;
	session.state = { ...session.state, ringBack: on };
	write(session);
}

// ---------------------------------------------------------------- call bar view

function setView(session: Session, collapsed: boolean) {
	view.setCollapsed(collapsed);
	if (session.state.collapsed === collapsed) return;
	session.state = { ...session.state, collapsed };
	write(session);
}

/**
 * Collapses the call bar to its pill or expands it, for this user in every tab of the site. The
 * choice is remembered in this browser, so a tab opened later starts the same way.
 */
export function setCallView(opts: { collapsed?: boolean }): CallState {
	const session = active;
	if (typeof opts.collapsed === 'boolean') {
		if (!session) view.setCollapsed(opts.collapsed);
		else if (session.role !== 'follower') setView(session, opts.collapsed);
		else {
			view.setCollapsed(opts.collapsed);
			session.state = { ...session.state, collapsed: opts.collapsed };
			show(session);
			toOwner(session, 'view', { collapsed: opts.collapsed }).catch(() => undefined);
		}
	}
	return active?.state ?? { ...idleState(), collapsed: view.isCollapsed() };
}

function setSoundOn(session: Session, on: boolean) {
	sounds.setOn(on);
	if (session.state.soundOn === on) return;
	session.state = { ...session.state, soundOn: on };
	write(session);
}

export interface SoundOptions {
	/** Turns call sounds on or off for this user, on every page and tab. */
	on?: boolean;
	/** Lets audio play now; call it from a click ("Tap to enable sound"). */
	unlock?: boolean;
	/** true: the call here is the leg of a call the user placed; false: the far end answered. */
	ringBack?: boolean;
	/** Plays a tone with no call (test page): incoming, ringBack, end or stop. */
	preview?: string;
	/** The incoming ring file, when not the default. */
	ringtone?: string;
}

const PREVIEWS = new Set(['incoming', 'ringBack', 'end', 'stop']);

export async function sound(opts: SoundOptions): Promise<CallState> {
	if (opts.preview && !PREVIEWS.has(opts.preview))
		throw new CallError(
			`Unknown preview "${opts.preview}": use incoming, ringBack, end or stop.`,
		);
	if (opts.ringtone) sounds.setRingtone(opts.ringtone);
	const session = active;
	if (typeof opts.on === 'boolean') {
		if (!session) sounds.setOn(opts.on);
		else if (session.role !== 'follower') setSoundOn(session, opts.on);
		else {
			sounds.setOn(opts.on);
			session.state = { ...session.state, soundOn: opts.on };
			show(session);
			toOwner(session, 'sound', { on: opts.on }).catch(() => undefined);
		}
	}
	if (typeof opts.ringBack === 'boolean' && session) {
		if (session.role !== 'follower') setRingBack(session, opts.ringBack);
		else if (IN_CALL.has(session.state.status) && !!session.state.ringBack !== opts.ringBack)
			toOwner(session, 'sound', { ringBack: opts.ringBack }).catch(() => undefined);
	}
	if (opts.unlock) {
		const ok = await sounds.unlock();
		const s = active;
		// This tab can play and the call tab cannot: the call's sounds move here.
		if (ok && s?.role === 'follower' && s.state.audioBlocked && s.state.soundTab !== TAB_ID)
			toOwner(s, 'soundHere', { tab: TAB_ID }).catch(() => undefined);
	}
	if (opts.preview) await sounds.previewTone(opts.preview as Tone | 'stop');
	return active?.state ?? { ...idleState(), soundOn: sounds.isOn() };
}

// ---------------------------------------------------------------- hidden tab alerts

export interface AlertOptions {
	/** The caller's name (or number) for the call ringing now, as the page knows it. */
	caller?: string;
	/** A line about the caller's deal for the notification. */
	deal?: string;
	/**
	 * true (from a click, "Allow call alerts"): asks the browser to show notifications when it
	 * has no answer yet. false: the user declined the offer. Either way it is not offered again.
	 */
	allow?: boolean;
}

export async function callAlert(
	opts: AlertOptions,
): Promise<CallState & { alertPermission?: AlertPermission }> {
	if (opts.caller !== undefined || opts.deal !== undefined)
		alerts.setInfo({ caller: opts.caller, deal: opts.deal });
	let permission: AlertPermission | undefined;
	if (typeof opts.allow === 'boolean') {
		permission = await alerts.allow(opts.allow);
		const s = active;
		if (s && s.role !== 'follower') write(s);
		else if (s) {
			s.state = { ...s.state, alertsOffer: alerts.canOffer() };
			show(s);
			// The call tab rewrites its state, so every tab drops the offer.
			toOwner(s, 'alerts', {}).catch(() => undefined);
		}
	}
	const state = active?.state ?? { ...idleState(), alertsOffer: alerts.canOffer() };
	return permission ? { ...state, alertPermission: permission } : state;
}

/** For tests. */
export function activeCallState(): CallState | undefined {
	return active?.state;
}
