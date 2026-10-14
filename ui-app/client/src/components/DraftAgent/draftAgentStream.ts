/**
 * The smallest client for the agent's chat stream, for the floating prompt and
 * the button, which show one line of what the agent is doing rather than a
 * transcript. The docked and windowed modes use the full Prompt component and
 * do not go through here.
 *
 * Same wire format as Prompt's: `event:` and `data:` lines, a blank line between
 * events, JSON in `data`.
 */

export type StreamEvent = { type: string; data: any };

/** Split a buffer into complete events plus the unfinished tail. Pure, for tests. */
export function parseSSE(
	buffer: string,
	carryType = 'message',
): { events: StreamEvent[]; rest: string; type: string } {
	const lines = buffer.split('\n');
	const rest = lines.pop() ?? '';
	const events: StreamEvent[] = [];
	let type = carryType;
	for (const raw of lines) {
		const line = raw.replace(/\r$/, '');
		if (line.startsWith('event:')) type = line.slice(6).trim();
		else if (line.startsWith('data:')) {
			const text = line.slice(5).trim();
			if (!text) continue;
			try {
				events.push({ type, data: JSON.parse(text) });
			} catch {
				events.push({ type, data: { text } });
			}
		} else if (line === '') type = 'message';
	}
	return { events, rest, type };
}

export async function streamChat(opts: {
	endpoint: string;
	headers: Record<string, string>;
	body: any;
	signal: AbortSignal;
	onEvent: (e: StreamEvent) => void;
}): Promise<number> {
	const res = await fetch(opts.endpoint, {
		method: 'POST',
		headers: opts.headers,
		body: JSON.stringify(opts.body),
		signal: opts.signal,
	});
	if (!res.ok || !res.body) return res.status;
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let type = 'message';
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const parsed = parseSSE(buffer, type);
		buffer = parsed.rest;
		type = parsed.type;
		parsed.events.forEach(opts.onEvent);
	}
	if (buffer.trim()) parseSSE(buffer + '\n\n', type).events.forEach(opts.onEvent);
	return res.status;
}

/** The last sentence or so of the agent's reply, for a one-line status. */
export function tailOf(text: string, max = 140): string {
	const clean = (text ?? '')
		.replace(/[*_`#>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (clean.length <= max) return clean;
	return '...' + clean.slice(clean.length - max + 3).replace(/^\S*\s/, '');
}
