import { SoftphoneState } from '../../softphone/types';
import { ComponentProperty } from '../../types/common';

/** Pure helpers for `LazySoftphone`, kept out of the component so they test without a page. */

/** Which page events a state change should fire. */
export type SoftphoneTransition =
	'registrationChange' | 'incomingCall' | 'callConnected' | 'callEnded' | 'error';

/** `previous` is undefined on the registry's first callback, which is state, not a change. */
export function detectTransitions(
	previous: SoftphoneState | undefined,
	next: SoftphoneState,
): SoftphoneTransition[] {
	if (!previous) return [];

	const transitions: SoftphoneTransition[] = [];

	if (previous.registered !== next.registered) transitions.push('registrationChange');

	// Inbound only: `inCall` also turns true while the agent's own outbound leg rings.
	if (!previous.inCall && next.inCall && next.direction !== 'outbound')
		transitions.push('incomingCall');

	// On `startedAt`, not `inCall`: an outbound call is already `inCall` while it rings.
	if (!previous.startedAt && next.startedAt) transitions.push('callConnected');

	if (previous.inCall && !next.inCall) transitions.push('callEnded');

	// Identity, not truthiness: the same error surviving a state change is not a new one.
	if (next.lastError && next.lastError !== previous.lastError) transitions.push('error');

	return transitions;
}

/**
 * The store notifies bindings on the written path and its ancestors, so writing only changed keys
 * keeps each binding independent. Reference comparison suffices: the registry replaces
 * `lastError` and `lastCall` wholesale.
 */
export function changedKeys(
	previous: SoftphoneState | undefined,
	next: SoftphoneState,
): Array<keyof SoftphoneState> {
	if (!previous) return Object.keys(next) as Array<keyof SoftphoneState>;

	// Both key sets: optional fields are absent, not undefined, after a reset, and a key that
	// disappeared still needs writing.
	const keys = new Set([...Object.keys(previous), ...Object.keys(next)]) as Set<
		keyof SoftphoneState
	>;

	return [...keys].filter(key => previous[key] !== next[key]);
}

/** `MM:SS` up to an hour, then `HH:MM:SS`. */
export function formatDuration(totalSeconds: number): string {
	const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;

	const hours = Math.floor(safe / 3600);
	const minutes = Math.floor((safe % 3600) / 60);
	const seconds = safe % 60;

	const mm = String(minutes).padStart(2, '0');
	const ss = String(seconds).padStart(2, '0');

	return hours > 0 ? `${String(hours).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

export interface CallElapsed {
	seconds: number;
	formatted: string;
}

/** Zero for anything unparseable. */
export function elapsedSince(startedAt: string | undefined, now = Date.now()): CallElapsed {
	const startedMs = startedAt ? Date.parse(startedAt) : NaN;
	const seconds = Number.isFinite(startedMs)
		? Math.max(0, Math.round((now - startedMs) / 1000))
		: 0;

	return { seconds, formatted: formatDuration(seconds) };
}

/**
 * Whether the connection is bound to something not yet resolved. An empty connection means "the
 * agent's own", so starting early would start twice once the binding resolves.
 *
 * Read from the raw definition: a blank property has no `location`. A binding that stays empty
 * (including `''`, which bypasses `getData`'s fallback) deliberately never starts the phone.
 */
export function awaitingConnectionBinding(
	property: ComponentProperty<string> | undefined,
	resolved: string | undefined,
): boolean {
	if (resolved) return false;

	const location = property?.location;
	if (!location) return false;

	return location.type === 'EXPRESSION'
		? !!location.expression?.trim()
		: !!location.value?.trim();
}
