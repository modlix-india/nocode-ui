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

	if (!previous.inCall && next.inCall) transitions.push('incomingCall');

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
 * Whether this tab should play the ringtone.
 *
 * Only the tab holding the call rings. Several tabs playing the same tone milliseconds apart is
 * worse than one, and this is the tab the call audio comes out of anyway.
 *
 * Outbound calls do not ring the agent: they asked for the call, and the tone they want is the
 * ringback from the far end, which the provider's own audio supplies.
 */
export function shouldRing(state: SoftphoneState, ringtoneUrl: string | undefined): boolean {
	return !!ringtoneUrl && state.isLeader && state.direction !== 'outbound';
}
