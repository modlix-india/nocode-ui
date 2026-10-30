/**
 * What the page hears when the chat on screen changes.
 *
 * A page that shows things beside the chat (a plan, the places it targets) has to
 * follow the conversation: opening another chat from the list, starting a new
 * one, or reopening one after a reload must swap what is beside it. The chat's
 * session id goes to the Session Binding and the On Session Change event fires.
 *
 * Not on the first render with no chat open: nothing changed yet, and a page
 * that opened with something of its own beside the chat (a plan named in the
 * address) would otherwise clear it before the user did anything. Reopening a
 * chat at load (Initial Session Id, a run being rejoined) is a change from no
 * chat to that one, so it is heard.
 */
export type SessionChange = { value: string; fire: boolean };

export const NOT_SEEN = Symbol('not seen');

export function sessionChange(
	previous: string | null | typeof NOT_SEEN,
	next: string | null,
): SessionChange | undefined {
	if (previous === NOT_SEEN) return next ? { value: next, fire: true } : undefined;
	if ((previous ?? null) === (next ?? null)) return undefined;
	return { value: next ?? '', fire: true };
}
