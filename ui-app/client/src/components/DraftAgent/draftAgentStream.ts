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

/**
 * How a run that this client was following came to an end, from where it sat.
 *
 * - `done`: the stream said the run was over (a `done` event, or a replay that
 *   says nothing is running).
 * - `over`: the connection dropped and the run had finished by the time we
 *   asked again (`/attach` answered 404), so its end was not seen here.
 * - `lost`: the connection dropped and could not be rejoined. The run itself
 *   may well still be going on the server.
 * - `http`: the opening POST was refused; `status` says how.
 */
export type RunOutcome = 'done' | 'over' | 'lost' | 'http';

export const REATTACH_ATTEMPTS = 3;

/**
 * Start a chat turn and stay with it to the end, rejoining if the connection drops.
 *
 * The agent's run lives on the server, not on this connection. A socket that dies
 * mid-read (Chrome: `TypeError: network error`, Safari: `Load failed`), or a proxy
 * that closes a long stream, used to surface as "network error" with Dismiss on
 * the floating prompt while the run carried on and finished in the background
 * (QA-0464). The docked Prompt already rejoins through `/attach`, which replays
 * the turn so far and then streams the rest; this is the same for the floating
 * prompt and the button.
 *
 * A replay starts with `replay_start`, so `onEvent` sees it and can reset what it
 * has accumulated rather than showing the same text twice.
 */
export async function followRun(opts: {
	endpoint: string;
	baseUrl: string;
	headers: () => Record<string, string>;
	body: any;
	signal: AbortSignal;
	onEvent: (e: StreamEvent) => void;
	sessionId: () => string | null;
	onReconnecting?: (attempt: number) => void;
	backoffMs?: number;
}): Promise<{ status: number; outcome: RunOutcome }> {
	let ended = false;
	const onEvent = (e: StreamEvent) => {
		if (e.type === 'done') ended = true;
		if (e.type === 'replay_end' && e.data?.running === false) ended = true;
		opts.onEvent(e);
	};
	const isAbort = (e: any) => e?.name === 'AbortError' || opts.signal.aborted;

	let status = 0;
	try {
		status = await streamChat({
			endpoint: opts.endpoint,
			headers: opts.headers(),
			body: opts.body,
			signal: opts.signal,
			onEvent,
		});
	} catch (e) {
		if (isAbort(e)) throw e;
		// The connection, not the run. Fall through to rejoin it.
	}
	if (status >= 400) return { status, outcome: 'http' };
	if (ended) return { status, outcome: 'done' };

	const backoff = opts.backoffMs ?? 1000;
	for (let attempt = 1; attempt <= REATTACH_ATTEMPTS; attempt++) {
		const sid = opts.sessionId();
		// A brand new chat that dropped before the server named it: nothing to
		// rejoin by.
		if (!sid) break;
		opts.onReconnecting?.(attempt);
		await new Promise(resolve => setTimeout(resolve, backoff * attempt));
		if (opts.signal.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
		let attachStatus = 0;
		try {
			attachStatus = await streamChat({
				endpoint: `${opts.baseUrl}/attach`,
				headers: opts.headers(),
				body: { session_id: sid },
				signal: opts.signal,
				onEvent,
			});
		} catch (e) {
			if (isAbort(e)) throw e;
			continue;
		}
		// 404 is the ordinary answer for "that run is over".
		if (attachStatus === 404) return { status: status || 200, outcome: 'over' };
		if (ended) return { status: status || 200, outcome: 'done' };
	}
	return { status: status || 200, outcome: 'lost' };
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
