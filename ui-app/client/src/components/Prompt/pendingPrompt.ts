/**
 * What a page left at the Prompt's Pending Prompt Binding (bindingPath3) for the
 * chat to send.
 *
 * Either a plain string, sent and shown as it is, or `{ text, display }`: `text`
 * goes to the agent and `display` is the user's bubble. A page hands over the
 * second shape when the message is written for the model rather than by the
 * person, such as AdZump's setup panel brief behind "Draft the campaign"
 * (ADZ-2307): the agent still reads the whole brief, the chat shows the button the
 * person pressed.
 */
export interface PendingPrompt {
	text: string;
	display?: string;
}

export function readPendingPrompt(value: any): PendingPrompt | undefined {
	if (typeof value === 'string') return value.trim() ? { text: value } : undefined;
	if (!value || typeof value !== 'object') return undefined;
	const text = typeof value.text === 'string' ? value.text : '';
	if (!text.trim()) return undefined;
	const display =
		typeof value.display === 'string' && value.display.trim() ? value.display : undefined;
	return display ? { text, display } : { text };
}
