import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';

/**
 * A server-sent event stream that signs in the way the rest of the app does.
 *
 * This replaces `new EventSource(url, { withCredentials: true })`. EventSource cannot set a
 * header, so the only credential it can carry is the `Authorization` COOKIE, and security sets
 * that cookie only when the login asked for it. Everyone signed in with the token in
 * LocalStore alone got a 401 on every stream, so live updates never arrived for them, and
 * while 401s still carried `WWW-Authenticate: Basic` the browser answered that 401 with its
 * native "Sign in" dialog over the app (QA-0369, stage /deals, the shell's WhatsApp stream).
 *
 * fetch can send `Authorization: <LocalStore.AuthToken>`, the same header FetchData and
 * SendData send, and still includes cookies, so a cookie session keeps working too.
 *
 * Behaves like EventSource where it matters to pages: `data` is handed over as the raw string,
 * multi-line `data:` fields are joined with "\n", an unnamed event is a `message`, `id:` is
 * sent back as `Last-Event-ID` on reconnect and `retry:` sets the reconnect delay. Unlike
 * EventSource it keeps retrying after an error status, backing off up to a minute and reading
 * the token again each time, so a stream opened before sign-in (or across a token refresh)
 * recovers on its own.
 */

export interface StreamMessage {
	type: string;
	data: string;
	lastEventId: string;
}

const DEFAULT_RETRY_MS = 3000;
const MAX_BACKOFF_MS = 60000;

/** The text/event-stream wire format, fed in arbitrary chunks. Pure, for tests. */
export class EventStreamParser {
	private buffer = '';
	private data: string[] = [];
	private type = '';
	private started = false;

	lastEventId = '';
	retry: number | undefined;

	constructor(lastEventId = '') {
		this.lastEventId = lastEventId;
	}

	feed(chunk: string): StreamMessage[] {
		let text = this.buffer + chunk;
		if (!this.started && text.length) {
			if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
			this.started = true;
		}

		const out: StreamMessage[] = [];
		let start = 0;
		for (let i = 0; i < text.length; i++) {
			const c = text[i];
			if (c !== '\n' && c !== '\r') continue;
			// A CR at the very end may be the first half of a CRLF split across chunks.
			if (c === '\r' && i + 1 >= text.length) break;
			const line = text.slice(start, i);
			if (c === '\r' && text[i + 1] === '\n') i++;
			start = i + 1;
			this.line(line, out);
		}
		this.buffer = text.slice(start);
		return out;
	}

	private line(line: string, out: StreamMessage[]) {
		if (line === '') {
			if (this.data.length) {
				out.push({
					type: this.type || 'message',
					data: this.data.join('\n'),
					lastEventId: this.lastEventId,
				});
			}
			this.data = [];
			this.type = '';
			return;
		}
		if (line.startsWith(':')) return;

		const colon = line.indexOf(':');
		const field = colon < 0 ? line : line.slice(0, colon);
		let value = colon < 0 ? '' : line.slice(colon + 1);
		if (value.startsWith(' ')) value = value.slice(1);

		if (field === 'event') this.type = value;
		else if (field === 'data') this.data.push(value);
		else if (field === 'id') {
			if (!value.includes('\0')) this.lastEventId = value;
		} else if (field === 'retry') {
			if (/^\d+$/.test(value)) this.retry = Number(value);
		}
	}
}

/** The token, read the way FetchData reads it: prefix resolved, JSON un-stringified. */
function authToken(): string | undefined {
	try {
		return getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []) || undefined;
	} catch {
		return undefined;
	}
}

/** Only this origin gets the token; a stream on another host gets cookies at most. */
function isSameOrigin(url: string): boolean {
	try {
		return new URL(url, globalThis.location?.href).origin === globalThis.location?.origin;
	} catch {
		return false;
	}
}

export interface EventStreamOptions {
	/** Event types to deliver, as `addEventListener` names on an EventSource. */
	eventNames: string[];
	onMessage: (message: StreamMessage) => void;
	onError?: (error: unknown) => void;
	/** For tests. */
	fetchImpl?: typeof fetch;
	getToken?: () => string | undefined;
	setTimer?: (fn: () => void, ms: number) => unknown;
	clearTimer?: (handle: unknown) => void;
}

/** Opens the stream and keeps it open. Returns the function that closes it for good. */
export function openEventStream(url: string, options: EventStreamOptions): () => void {
	const {
		eventNames,
		onMessage,
		onError,
		fetchImpl = (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
		getToken = authToken,
		setTimer = (fn, ms) => setTimeout(fn, ms),
		clearTimer = handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
	} = options;

	const wanted = new Set(eventNames);
	let closed = false;
	let controller: AbortController | undefined;
	let timer: unknown;
	let failures = 0;
	let retryMs = DEFAULT_RETRY_MS;
	let lastEventId = '';

	const schedule = () => {
		if (closed) return;
		const delay = failures ? Math.min(retryMs * 2 ** (failures - 1), MAX_BACKOFF_MS) : retryMs;
		timer = setTimer(() => {
			timer = undefined;
			void connect();
		}, delay);
	};

	const connect = async () => {
		if (closed) return;
		controller = new AbortController();

		const headers: Record<string, string> = { Accept: 'text/event-stream' };
		const token = isSameOrigin(url) ? getToken() : undefined;
		if (token) headers.Authorization = token;
		if (lastEventId) headers['Last-Event-ID'] = lastEventId;

		try {
			const response = await fetchImpl(url, {
				headers,
				credentials: 'include',
				cache: 'no-store',
				signal: controller.signal,
			});

			if (!response.ok || !response.body) {
				failures++;
				onError?.(new Error(`SSE ${url} answered ${response.status}`));
				schedule();
				return;
			}

			failures = 0;
			const parser = new EventStreamParser(lastEventId);
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			for (;;) {
				const { done, value } = await reader.read();
				if (done || closed) break;
				for (const message of parser.feed(decoder.decode(value, { stream: true }))) {
					if (closed) break;
					if (wanted.has(message.type)) onMessage(message);
				}
				lastEventId = parser.lastEventId;
				if (parser.retry !== undefined) retryMs = parser.retry;
			}
		} catch (error) {
			if (closed) return;
			failures++;
			onError?.(error);
		}
		schedule();
	};

	void connect();

	return () => {
		closed = true;
		if (timer !== undefined) clearTimer(timer);
		controller?.abort();
	};
}
