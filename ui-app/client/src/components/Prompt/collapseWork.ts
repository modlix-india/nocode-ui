/**
 * Collapse Work: the Prompt drawn as a question-and-answer chat whose working is
 * folded away (CXZ-1781).
 *
 * The agent writes around its tool calls ("Let me look that up.", then the
 * answer). In this mode a reply shows one line ("Thinking..." while it runs,
 * "Worked for 12s · 4 steps" after) that opens to the reasoning, tool rows and
 * that in-between text, and under it only the answer: the text written after
 * the last tool. A reply remembers where that last stretch of text begins.
 */

export const DEFAULT_THINKING_TEXT = 'Thinking...';
export const DEFAULT_ERROR_TEXT = 'Sorry, something went wrong. Please try again.';

/**
 * Where the answer starts once `incoming` is added to a reply.
 *
 * `before` is the reply's text before `incoming` (gap included), `afterTool`
 * whether a tool ran since the last text. Text after a tool starts a new answer;
 * blank text does not, so a stray newline cannot wipe the answer before it.
 * Returns undefined when the start does not move.
 */
export function answerStartAfter(
	before: string,
	incoming: string,
	afterTool: boolean,
): number | undefined {
	if (!afterTool || !incoming.trim()) return undefined;
	return before.length;
}

export interface CollapsibleReply {
	content: string;
	answerFrom?: number;
	failed?: boolean;
}

/**
 * A reply cut into its working (drawn inside the folded line) and its answer
 * (drawn under it). While it runs everything is working: the answer is only
 * known once no more tools follow. A failed reply's text all goes to the
 * working, and the answer is the friendly error.
 */
export function splitWork(
	msg: CollapsibleReply,
	live: boolean,
	errorText: string,
): { work: string; answer: string } {
	if (msg.failed) return { work: msg.content, answer: errorText || DEFAULT_ERROR_TEXT };
	if (live) return { work: msg.content, answer: '' };
	const from = msg.answerFrom ?? 0;
	return { work: msg.content.slice(0, from), answer: msg.content.slice(from).trim() };
}

/** "12s", "2m 5s". */
export function formatDuration(ms: number): string {
	const total = Math.max(0, Math.round(ms / 1000));
	if (total < 60) return `${total}s`;
	const m = Math.floor(total / 60);
	const s = total % 60;
	return s ? `${m}m ${s}s` : `${m}m`;
}

/** The folded line of a finished reply, in plain words: no tool names. */
export function workLabel(durationMs: number | undefined, steps: number): string {
	const bits: string[] = [];
	if (durationMs !== undefined) bits.push(`Worked for ${formatDuration(durationMs)}`);
	if (steps > 0) bits.push(`${steps} ${steps === 1 ? 'step' : 'steps'}`);
	if (!bits.length) return 'Details';
	if (durationMs === undefined) return `Worked through ${bits[0]}`;
	return bits.join(' · ');
}
