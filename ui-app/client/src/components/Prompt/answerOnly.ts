/**
 * Answer Only: the Prompt drawn as a plain question-and-answer chat (CXZ-1781).
 *
 * The agent writes around its tool calls ("Let me look that up.", then the
 * answer). In this mode the tool calls are not drawn, so only the text written
 * after the last tool is the answer; what came before it was the agent talking
 * about its work. A reply remembers where that last stretch of text begins.
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

/** The text an Answer Only reply shows. */
export function answerOnlyText(
	msg: { content: string; answerFrom?: number; failed?: boolean },
	errorText: string,
): string {
	if (msg.failed) return errorText || DEFAULT_ERROR_TEXT;
	return msg.content.slice(msg.answerFrom ?? 0).trim();
}
