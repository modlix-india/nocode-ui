/**
 * A page asks the chat to start a new conversation (the AdZump craft's "Start over").
 *
 * Opt-in through the New Chat Binding (bindingPath5): the page writes a value there, the
 * chat starts a new conversation exactly as its own New chat button does, and clears the
 * path so the same ask never fires twice (a reload, a re-render). Without the binding
 * nothing changes.
 *
 * Any truthy value asks once: `true`, a timestamp, a non-empty string. Empty values
 * (undefined, null, false, '', 0) are the cleared state and ask nothing.
 */
export function newChatAsked(value: unknown): boolean {
	if (value === undefined || value === null || value === false) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (typeof value === 'number') return value !== 0 && !Number.isNaN(value);
	return true;
}
