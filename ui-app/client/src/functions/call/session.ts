import { duplicate } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { AlertPermission, CallAlerts } from './alerts';
import { getCallProvider } from './registry';
import { CallSounds, Tone } from './sounds';
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

type Role = 'solo' | 'owner' | 'follower';

interface Session {
	provider: string;
	adapter?: CallAdapter;
	statePath: string;
	pageName: string;
	state: CallState;
	/** Bumped on every Connect, so events from a replaced adapter are ignored. */
	generation: number;
	role: Role;
	lockName?: string;
	channel?: TabChannel;
	cancelWait?: () => void;
	/** A follower keeps them, in memory only, to sign in if the owner tab goes away. */
	credentials?: CallCredentials;
	/** Which phone this session is (provider and a digest of the credentials), see sameSession. */
	identity: string;
	factory?: CallAdapterFactory;
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

function write(session: Session) {
	if (session.role !== 'follower') session.state = withSound(session.state);
	setData(session.statePath, duplicate(session.state), session.pageName);
	if (session.role === 'owner')
		session.channel?.post({ t: 'state', state: duplicate(session.state) });
	sounds.update(session.state, soundHere(session));
	alerts.update(session.state, session.role !== 'follower');
}

/** A follower shows the state it mirrors; nothing goes to the other tabs. */
function show(session: Session) {
	setData(session.statePath, duplicate(session.state), session.pageName);
	sounds.update(session.state, soundHere(session));
	alerts.update(session.state, false);
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
	if (patch.direction === 'inbound' && ownLeg !== undefined && IN_CALL.has(prev.status) && sameLeg) {
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
		};
	}

	if (next.status === 'connected' && prev.status !== 'connected' && !next.startedAt)
		next.startedAt = Date.now();
	if (next.status === 'ended') {
		next.muted = false;
		next.held = false;
		if (IN_CALL.has(prev.status) && !next.endedAt) next.endedAt = Date.now();
	}

	if (IN_CALL.has(next.status) && (!IN_CALL.has(prev.status) || newCall)) {
		callSince = Date.now();
		boundLog = undefined;
	}
	if (!IN_CALL.has(next.status)) {
		boundLog = undefined;
		if (endTimer) clearTimeout(endTimer);
		endTimer = undefined;
		ownLeg = undefined;
	}
	// The own leg rings back (never in) until the far end answers, and is answered here at once.
	if (own) next.ringBack = true;

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
export async function expectOutbound(on = true): Promise<CallState> {
	const session = current();
	if (session.role === 'follower') {
		await toOwner(session, 'expect', { on });
		return session.state;
	}
	expectUntil = on ? Date.now() + OUTBOUND_CLAIM_MS : 0;
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
		else if (m.op === 'expect') await expectOutbound(m.on !== false);
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

function toOwner(session: Session, op: string, args: Record<string, any>): Promise<void> {
	const id = `${Date.now()}-${++commandSeq}-${Math.random().toString(36).slice(2, 8)}`;
	return new Promise<void>((resolve, reject) => {
		const timer = setTimeout(() => {
			session.pending.delete(id);
			reject(
				new CallError(
					'The tab with the call did not respond. Open the tab with the call to control it.',
				),
			);
		}, TAB_COMMAND_TIMEOUT_MS);
		session.pending.set(id, { resolve, reject, timer });
		session.channel?.post({ t: 'cmd', id, op, ...args });
	});
}

function closeTabs(session: Session) {
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
	if (IN_CALL.has(session.state.status) && (await ownerAnswers(session))) return stepBack(session);
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
	write(session);
	const credentials = session.credentials!;
	const factory = session.factory!;
	session.credentials = undefined;
	try {
		await signIn(session, factory, credentials);
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

async function signIn(session: Session, factory: CallAdapterFactory, credentials: CallCredentials) {
	try {
		session.adapter = await factory();
		session.adapter.onStateChange(patch => {
			if (active === session && session.generation === generation) apply(session, patch);
		});
		await session.adapter.load();
		await withTimeout(
			session.adapter.register(credentials),
			REGISTER_TIMEOUT_MS,
			'The call provider did not confirm the sign in.',
		);
	} catch (error) {
		if (active !== session) throw error;
		// The adapter may hold a half open connection; release it, keep the error state.
		try {
			await session.adapter?.disconnect();
		} catch {
			// Nothing more to release.
		}
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
	return session.identity === identity && session.generation !== -1 && session.state.status !== 'error';
}

export async function connect(
	provider: string,
	credentials: CallCredentials,
	statePath: string,
	pageName: string,
): Promise<CallState> {
	if (!statePath?.trim()) throw new CallError('statePath is required.');
	const factory = getCallProvider(provider);
	if (!factory) throw new CallError(`Unknown call provider "${provider}".`);
	if (!credentials || typeof credentials !== 'object')
		throw new CallError('credentials are required.');

	const identity = identityOf(provider.trim().toLowerCase(), credentials);
	if (active && sameSession(active, identity)) {
		const session = active;
		if (session.statePath !== statePath || session.pageName !== pageName) {
			session.statePath = statePath;
			session.pageName = pageName;
			show(session);
		}
		return duplicate(session.state);
	}

	if (active) {
		if (IN_CALL.has(active.state.status))
			throw new CallError('A call is in progress. Hang up before connecting again.');
		await disconnect();
	}

	const session: Session = {
		provider: provider.trim().toLowerCase(),
		statePath,
		pageName,
		state: { status: 'registering', muted: false },
		generation: ++generation,
		role: 'solo',
		pending: new Map(),
		identity,
	};
	active = session;

	hookUnload();
	const tabs = getTabSync();
	if (tabs) {
		const lockName = `modlix.call.${session.provider}`;
		const lead = await tabs.tryLead(lockName);
		if (active !== session) {
			if (lead) tabs.release(lockName);
			throw new CallError('Replaced by a newer Connect.');
		}
		session.lockName = lockName;
		session.role = lead ? 'owner' : 'follower';
		session.channel = tabs.open(lockName, m => onTabMessage(session, m));
		if (!lead) {
			session.credentials = credentials;
			session.factory = factory;
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
	await signIn(session, factory, credentials);
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

export async function disconnect(): Promise<CallState> {
	const session = active;
	if (!session) return idleState();
	active = undefined;
	session.generation = -1;
	try {
		await session.adapter?.disconnect();
	} finally {
		closeTabs(session);
		sounds.reset();
		alerts.reset();
		session.state = idleState();
		setData(session.statePath, duplicate(session.state), session.pageName);
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
const heard = new Map<string, { first: number; ended: boolean }>();
const HEARD_MAX = 50;

function hear(report: LiveReport) {
	const h = heard.get(report.callLogId);
	if (h) {
		if (report.terminal) h.ended = true;
		return;
	}
	heard.set(report.callLogId, { first: report.at, ended: report.terminal });
	if (heard.size > HEARD_MAX) heard.delete(heard.keys().next().value!);
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

/** The report after `next` arrives, or `prev` itself when `next` adds nothing. */
export function mergeLive(prev: LiveReport | undefined, next: LiveReport): LiveReport {
	if (olderCall(prev, next)) return prev!;
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

function applyLive(report: LiveReport, own: boolean) {
	const merged = mergeLive(live, report);
	hear(report);
	const changed = !sameLive(live, merged);
	live = merged;
	// Written again even when nothing changed: the page may have written its own view meanwhile.
	setData(livePath, duplicate(merged), livePage);
	if (changed) active?.channel?.post({ t: 'live', live: duplicate(merged) });
	serverEnd(report, merged);
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
	if (!boundLog && bindable(report, merged)) boundLog = report.callLogId;
	if (!merged.terminal || !boundLog || boundLog !== merged.callLogId || endTimer) return;
	endTimer = setTimeout(() => {
		endTimer = undefined;
		void endByServer(session);
	}, SERVER_END_GRACE_MS);
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
