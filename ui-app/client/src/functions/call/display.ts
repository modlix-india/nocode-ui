/**
 * The call bar's display values, computed once, in the engine (LZT-2161).
 *
 * The popup, the pill, the bottom bar and the summary each used to derive the phase and the
 * timers from `Store.call` (the browser phone) and `Store.callLive` (the server's report) in
 * their own expressions, with the staleness rule `callLive.at >= call.startedAt - 60000` written
 * by hand into a dozen of them. One that missed it, or one `... + null`, kept a timer running
 * after the customer hung up (LZT-2124), redrew the summary of the last call after a reload
 * (LZT-2119), or blanked the shell, which remounted the Timer that runs Connect.
 *
 * Here the same rules live in one pure function. The session writes its result, whole, to the
 * display path (default `Store.callDisplay`) whenever the call state or the server's report
 * changes, and once a second while a clock runs. Every label binds to it and computes nothing.
 *
 * Rules:
 * - Binding: the server's report counts only when the session says it belongs to the call up in
 *   this browser (`liveBound`); an unbound report of an earlier call never reaches the display.
 * - Clock: times are epoch ms stamped by the tab that holds the call and shared in its state, so
 *   every tab shows the same seconds. The ring runs from the first ring to the answer; the talk
 *   time from the far end answering: the server's answer for a call the agent placed (the
 *   agent's own leg connects first), the phone's connect for an incoming call.
 * - End: the earlier of the phone's end and the server's end fixes `endedAt` and `final`; the
 *   seconds never move after it. The provider's own durations, once reported, win.
 * - Never null: every field is always present with a typed empty value.
 */
import { CallState } from './types';

export type CallPhase =
	| 'off'
	| 'ready'
	| 'away'
	| 'dialling'
	| 'ringing'
	| 'talking'
	| 'held'
	| 'ended'
	| 'error';

/** What the server reports about a call (the session's merged LiveReport), as far as shown. */
export interface DisplayLive {
	callLogId: string;
	dealId?: string;
	provider?: string;
	direction?: string;
	status: string;
	terminal: boolean;
	talkDuration?: number;
	/** Epoch ms of the latest frame. */
	at: number;
	/** Epoch ms when the customer answered, 0 until then. */
	answeredAt?: number;
	ringDuration?: number;
	connectionName?: string;
	callerId?: string;
	customerDialCode?: string;
	customerPhoneNumber?: string;
	recordingFile?: string;
}

export interface CallDisplay {
	/** The browser call and the server call it is bound to; '' when none. */
	callId: string;
	callLogId: string;
	/** The deal and the provider of the bound server call ('' until the server reports them). */
	dealId: string;
	provider: string;
	phase: CallPhase;
	/** A call the agent placed (the agent's own leg, or the bound server call says outbound). */
	outbound: boolean;
	/** The far end: the server's customer number, else (incoming) the number the phone reports. */
	number: string;
	ringStartedAt: number;
	ringSec: number;
	ringText: string;
	talkStartedAt: number;
	talkSec: number;
	/** '' until the far end answers. */
	talkText: string;
	endedAt: number;
	/** The call ended: every clock is frozen. */
	final: boolean;
	/** `pageClosed` when the call ended because the tab holding it closed or reloaded, else ''. */
	endReason: string;
	/** The line the bound server call used (for Redial on the same line). */
	connectionName: string;
	callerId: string;
	recordingFile: string;
	muted: boolean;
	held: boolean;
	/** This tab only mirrors the call; its audio is in another tab. */
	otherTab: boolean;
	/** The text to show for the last failure, or ''. */
	error: string;
}

const CLOCK_PHASES = new Set<CallPhase>(['dialling', 'ringing', 'talking', 'held']);

function pad2(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

/** `mm:ss`, minutes not capped (the ring). */
export function ringClock(sec: number): string {
	const s = Math.max(0, Math.floor(sec));
	return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

/** `mm:ss`, or `h:mm:ss` from an hour (the talk time), as the shell showed it. */
export function talkClock(sec: number): string {
	const s = Math.max(0, Math.floor(sec));
	const h = Math.floor(s / 3600);
	const mmss = `${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
	return h > 0 ? `${h}:${mmss}` : mmss;
}

const num = (v: any): number => {
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? n : 0;
};

const str = (v: any): string => (v === undefined || v === null ? '' : String(v));

function customerNumber(live: DisplayLive | undefined): string {
	const phone = str(live?.customerPhoneNumber).trim();
	if (!phone || phone.startsWith('+')) return phone;
	const code = str(live?.customerDialCode).replace(/^\+/, '').trim();
	return code ? `+${code} ${phone}` : phone;
}

/** The earliest of the given epoch ms that are set, or 0. */
function earliest(...times: number[]): number {
	const set = times.filter(t => t > 0);
	return set.length ? Math.min(...set) : 0;
}

const seconds = (from: number, to: number) =>
	from > 0 && to > from ? Math.floor((to - from) / 1000) : 0;

type DisplayState = CallState & { ringAt?: number };

/**
 * When the far end answered. For a call the agent placed only the server knows: the agent's own
 * leg connects first and rings back. For an incoming call the phone's connect is the answer.
 */
function talkStart(s: DisplayState, lv: DisplayLive | undefined, outbound: boolean): number {
	if (!outbound) return s.status === 'connected' || s.status === 'ended' ? num(s.startedAt) : 0;
	if (!lv) return 0;
	if (num(lv.answeredAt)) return num(lv.answeredAt);
	return lv.status === 'IN_PROGRESS' && !lv.terminal ? num(lv.at) : 0;
}

/** The provider's own figure once the call ended, else the computed one. */
function providerOr(final: boolean, lv: DisplayLive | undefined, reported: any, computed: number) {
	return final && lv?.terminal && num(reported) > 0 ? Math.floor(num(reported)) : computed;
}

function phaseOf(s: DisplayState, final: boolean, outbound: boolean, answered: boolean): CallPhase {
	const inCall = s.status === 'ringing' || s.status === 'connected';
	if (s.status === 'error') return 'error';
	if (s.status === 'ended' || (inCall && final)) return 'ended';
	if (s.status === 'ringing') return outbound ? 'dialling' : 'ringing';
	if (s.status === 'connected') {
		if (outbound && !answered) return 'dialling';
		return s.held ? 'held' : 'talking';
	}
	if (s.away) return 'away';
	return s.status === 'ready' ? 'ready' : 'off';
}

/** The fields of a call, all empty when no call is up or showing its end. */
function callFields(
	s: DisplayState,
	lv: DisplayLive | undefined,
	outbound: boolean,
	now: number,
): Omit<CallDisplay, 'phase' | 'muted' | 'held' | 'otherTab' | 'error' | 'callLogId' | 'dealId' | 'provider'> {
	const ringStartedAt = num(s.ringAt);
	const talkStartedAt = talkStart(s, lv, outbound);
	const serverEnd = lv?.terminal ? num(lv.at) : 0;
	const endedAt = earliest(s.status === 'ended' ? num(s.endedAt) : 0, serverEnd);
	const final = s.status === 'ended' || serverEnd > 0;
	// An end with no time (a call that never came up) freezes at the last time known, never `now`.
	const until = final ? endedAt || Math.max(ringStartedAt, talkStartedAt) : now;
	const talkSec = providerOr(final, lv, lv?.talkDuration, seconds(talkStartedAt, until));
	const ringSec = providerOr(
		final,
		lv,
		lv?.ringDuration,
		seconds(ringStartedAt, talkStartedAt || until),
	);
	return {
		callId: str(s.callId),
		outbound,
		number: customerNumber(lv) || (outbound ? '' : str(s.from)),
		ringStartedAt,
		ringSec,
		ringText: ringClock(ringSec),
		talkStartedAt,
		talkSec,
		talkText: talkStartedAt > 0 ? talkClock(talkSec) : '',
		endedAt,
		final,
		endReason: final ? str(s.endReason) : '',
		connectionName: str(lv?.connectionName),
		callerId: str(lv?.callerId),
		recordingFile: str(lv?.recordingFile),
	};
}

const NO_CALL = {
	callId: '',
	outbound: false,
	number: '',
	ringStartedAt: 0,
	ringSec: 0,
	ringText: '',
	talkStartedAt: 0,
	talkSec: 0,
	talkText: '',
	endedAt: 0,
	final: false,
	endReason: '',
	connectionName: '',
	callerId: '',
	recordingFile: '',
};

/**
 * The display values for one moment. `state` is the call state this tab shows, `live` the
 * server's merged report, `liveBound` whether that report belongs to the call in `state`, and
 * `now` the clock (epoch ms). Pure: the same inputs give the same output in every tab.
 */
export function computeDisplay(
	state: DisplayState | undefined,
	live: DisplayLive | undefined,
	liveBound: boolean,
	now: number,
): CallDisplay {
	const s: DisplayState = state ?? { status: 'idle', muted: false };
	const inCall = s.status === 'ringing' || s.status === 'connected';
	const shown = inCall || s.status === 'ended';
	// The server's report counts only for the call up here or just ended here.
	const lv = liveBound && shown ? live : undefined;
	const outbound =
		s.direction === 'outbound' || !!s.ringBack || str(lv?.direction).toLowerCase() === 'outbound';
	const call = shown ? callFields(s, lv, outbound, now) : NO_CALL;
	return {
		...call,
		callLogId: str(lv?.callLogId),
		dealId: str(lv?.dealId),
		provider: str(lv?.provider),
		phase: phaseOf(s, call.final, outbound, call.talkStartedAt > 0),
		muted: inCall && !!s.muted,
		held: inCall && !!s.held,
		otherTab: !!s.otherTab,
		error: str(s.error),
	};
}

/** Same values in every field: nothing to write. */
export function sameDisplay(a: CallDisplay | undefined, b: CallDisplay): boolean {
	if (!a) return false;
	for (const k of Object.keys(b) as Array<keyof CallDisplay>) if (a[k] !== b[k]) return false;
	return true;
}

/** Whether the display has a clock that moves: only while a call is up and not over. */
export function clockRuns(d: CallDisplay): boolean {
	return CLOCK_PHASES.has(d.phase) && !d.final;
}

export const DISPLAY_TICK_MS = 1000;

/**
 * One 1 s interval for the engine, running only while a clock runs. The session calls `update`
 * after each display it writes; `tick` recomputes and writes the display again.
 */
export class DisplayTicker {
	private timer: ReturnType<typeof setInterval> | undefined;

	constructor(
		private readonly tick: () => void,
		private readonly every: (f: () => void, ms: number) => ReturnType<typeof setInterval> = (
			f,
			ms,
		) => setInterval(f, ms),
		private readonly cancel: (t: ReturnType<typeof setInterval>) => void = t =>
			clearInterval(t),
	) {}

	update(d: CallDisplay) {
		if (clockRuns(d)) {
			if (!this.timer) this.timer = this.every(() => this.tick(), DISPLAY_TICK_MS);
		} else this.stop();
	}

	running(): boolean {
		return !!this.timer;
	}

	stop() {
		if (this.timer) this.cancel(this.timer);
		this.timer = undefined;
	}
}
