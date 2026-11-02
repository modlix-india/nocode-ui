import { duplicate } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { getCallProvider } from './registry';
import { CallSounds, Tone } from './sounds';
import { getTabSync, TabChannel } from './tabs';
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
	factory?: CallAdapterFactory;
	pending: Map<string, { resolve: () => void; reject: (e: Error) => void; timer: any }>;
	gotOwnerState?: () => void;
}

let active: Session | undefined;
let generation = 0;
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

/** The sound fields the tab holding the call adds to every state it writes. */
function withSound(state: CallState): CallState {
	return { ...state, soundOn: state.soundOn ?? sounds.isOn(), audioBlocked: sounds.isBlocked() };
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
}

/** A follower shows the state it mirrors; nothing goes to the other tabs. */
function show(session: Session) {
	setData(session.statePath, duplicate(session.state), session.pageName);
	sounds.update(session.state, soundHere(session));
}

const IN_CALL = new Set(['ringing', 'connected']);

/** Merges an adapter's report into the state, with the rules every provider shares. */
function apply(session: Session, patch: CallStatePatch) {
	const prev = session.state;
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
		};
	}

	if (next.status === 'connected' && prev.status !== 'connected' && !next.startedAt)
		next.startedAt = Date.now();
	if (next.status === 'ended') {
		next.muted = false;
		if (IN_CALL.has(prev.status) && !next.endedAt) next.endedAt = Date.now();
	}

	session.state = next;
	write(session);
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
	if (session.role === 'owner') {
		if (m.t === 'hello') session.channel?.post({ t: 'state', state: duplicate(session.state) });
		else if (m.t === 'cmd') runForTab(session, m);
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
		session.state = { ...m.state, otherTab: true };
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
		else if (m.op === 'hangup') await hangup(m.callId || undefined);
		else if (m.op === 'mute') await mute(!!m.on);
		else if (m.op === 'answering') {
			sounds.quietFor(m.callId || undefined);
			if (m.ringBack) setRingBack(session, true);
		} else if (m.op === 'unquiet') sounds.unquiet();
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

/** The owner tab went away: this follower signs in and holds calls from now on. */
async function takeOver(session: Session) {
	if (active !== session || session.role !== 'follower') {
		if (session.lockName) getTabSync()?.release(session.lockName);
		return;
	}
	session.cancelWait = undefined;
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
				session.channel?.post({ t: 'hello' });
			});
			session.gotOwnerState = undefined;
			if (active !== session) return session.state;
			if (session.state.soundOn === undefined)
				session.state = { ...session.state, soundOn: sounds.isOn(), audioBlocked: false };
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
		if (session.role === 'follower') toOwner(session, 'unquiet', {}).catch(() => undefined);
		fail(session, e);
	}
	return session.state;
}

export async function hangup(callId?: string): Promise<CallState> {
	const session = current();
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
		session.state = idleState();
		setData(session.statePath, duplicate(session.state), session.pageName);
	}
	return session.state;
}

// ---------------------------------------------------------------- sounds

function setRingBack(session: Session, on: boolean) {
	if (!IN_CALL.has(session.state.status) || !!session.state.ringBack === on) return;
	session.state = { ...session.state, ringBack: on };
	write(session);
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

/** For tests. */
export function activeCallState(): CallState | undefined {
	return active?.state;
}
