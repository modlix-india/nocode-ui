import { SoftphoneState } from '../../softphone/types';

/**
 * Which page events a state change should fire.
 *
 * Separate from the component because it is the part with edges in it, and edges are where the
 * bugs are: firing "call ended" at mount because no call is in progress, or firing "incoming call"
 * again on every unrelated state change during a call, are both wrong in ways a page author would
 * see - a wrap-up form popping open on page load, a ringing toast that will not go away.
 */
export type SoftphoneTransition =
	'registrationChange' | 'incomingCall' | 'callConnected' | 'callEnded' | 'error';

/**
 * `previous` is undefined on the very first callback from the registry.
 *
 * That callback carries the current state rather than a change, so nothing should fire for it.
 */
export function detectTransitions(
	previous: SoftphoneState | undefined,
	next: SoftphoneState,
): SoftphoneTransition[] {
	if (!previous) return [];

	const transitions: SoftphoneTransition[] = [];

	if (previous.registered !== next.registered) transitions.push('registrationChange');

	// Inbound only. `inCall` turns true for the agent's own outbound call the moment its leg
	// starts ringing, so without the direction check a page that opens a ringing toast, plays a
	// ringtone or pops an accept dialog does all of it to the agent who just pressed Call.
	if (!previous.inCall && next.inCall && next.direction !== 'outbound')
		transitions.push('incomingCall');

	// Keyed on `startedAt` appearing rather than on `inCall`, because an outbound call is already
	// `inCall` while it rings. `startedAt` is written once, when audio actually starts.
	if (!previous.startedAt && next.startedAt) transitions.push('callConnected');

	if (previous.inCall && !next.inCall) transitions.push('callEnded');

	// Identity, not truthiness: the same error object surviving an unrelated state change is not a
	// new failure, and re-firing would show the agent the same message repeatedly.
	if (next.lastError && next.lastError !== previous.lastError) transitions.push('error');

	return transitions;
}

/**
 * Which parts of the state actually changed.
 *
 * The store notifies a listener when the path written is that path *or an ancestor of it*, so
 * writing the whole `Store.softphone` object notifies everything bound to any `Store.softphone.*`
 * path - a page's caller-id label re-renders because the mute flag moved. Writing only the keys
 * that changed keeps each binding independent, which is what makes a per-second value like a call
 * timer affordable at all.
 *
 * Reference comparison is enough: the registry replaces `lastError` and `lastCall` wholesale when
 * they change and leaves the same object in place when they do not.
 */
export function changedKeys(
	previous: SoftphoneState | undefined,
	next: SoftphoneState,
): Array<keyof SoftphoneState> {
	if (!previous) return Object.keys(next) as Array<keyof SoftphoneState>;

	// The union of both key sets, not just the new one. Optional fields like `from` and
	// `startedAt` are absent from the initial state rather than present-and-undefined, and
	// `stop()` resets to it - so a key the previous state had and this one does not still needs
	// writing, or a stale caller id survives the call that owned it.
	const keys = new Set([...Object.keys(previous), ...Object.keys(next)]) as Set<
		keyof SoftphoneState
	>;

	return [...keys].filter(key => previous[key] !== next[key]);
}

/**
 * Turns a count of seconds into a clock.
 *
 * `MM:SS` up to an hour, then `HH:MM:SS`. A support call really can run past sixty minutes, and
 * `61:04` for an hour and a minute reads as a mistake.
 */
export function formatDuration(totalSeconds: number): string {
	const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;

	const hours = Math.floor(safe / 3600);
	const minutes = Math.floor((safe % 3600) / 60);
	const seconds = safe % 60;

	const mm = String(minutes).padStart(2, '0');
	const ss = String(seconds).padStart(2, '0');

	return hours > 0 ? `${String(hours).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** What a page reads to show a live call timer. */
export interface CallElapsed {
	seconds: number;
	formatted: string;
}

/** Elapsed connected time, from the instant audio started. Zero for anything unparseable. */
export function elapsedSince(startedAt: string | undefined, now = Date.now()): CallElapsed {
	const startedMs = startedAt ? Date.parse(startedAt) : NaN;
	const seconds = Number.isFinite(startedMs)
		? Math.max(0, Math.round((now - startedMs) / 1000))
		: 0;

	return { seconds, formatted: formatDuration(seconds) };
}
