// What a toast shows for whatever reaches `addMessage`:
// - a plain string (or number), shown as it is;
// - an error body from a service: Java's `{ message, debugMessage, stackTrace, exceptionId }`,
//   or a Rust unit's coded body, which adds `code`, `action` (what to do next) and `params`;
// - the error event of FetchData / SendData / DeleteData passed whole (`{ data, headers,
//   status }`), or an axios error thrown by a remote function call (`error.response`);
// - anything else thrown (an Error), shown by its `message`.
//
// A service that answers with an empty or non-JSON body (Java's Spring Security 401 and 403, a
// proxy's 502, 503 or 504) leaves nothing to show. When the status is known, those get a default
// text. The texts are the platform's catalogue texts, word for word (nocode-saas-rust:
// COMMON.SIGNED_OUT, COMMON.FORBIDDEN, COMMON.INTERNAL_ERROR, COMMON.ERROR, GW.SERVICE_STARTING,
// GW.SERVICE_TIMEOUT), so a person reads the same words whichever service failed.

export interface MessageDetails {
	/** The main line. */
	text?: string | number;
	/** What to do next, shown under the text. */
	action?: string;
	/** The error id support looks up (`exceptionId`). */
	errorId?: string;
	debugMessage?: string;
	stackTrace?: string;
}

interface StatusText {
	text: string;
	action?: string;
}

const SERVICE_RESTARTING: StatusText = {
	text: 'The service is restarting. Try again in a few seconds.',
};

const STATUS_TEXTS: Record<number, StatusText> = {
	401: { text: "You're signed out. Please sign in again." },
	403: {
		text: "You don't have access to this.",
		action: 'If you think you should, ask an owner of your organisation.',
	},
	502: SERVICE_RESTARTING,
	503: SERVICE_RESTARTING,
	504: { text: 'The service took too long to answer.', action: 'Try again.' },
};

const SERVER_ERROR: StatusText = {
	text: 'Something went wrong on our side.',
	action: 'Try again in a moment.',
};

/** For an error toast that would otherwise be empty. */
const NOTHING_TO_SAY: StatusText = {
	text: 'Your request could not be completed.',
	action: 'Try again in a moment.',
};

/** The default text for an error status that came without a readable body. */
export function textForStatus(status: unknown): StatusText | undefined {
	if (typeof status !== 'number') return undefined;
	if (STATUS_TEXTS[status]) return STATUS_TEXTS[status];
	if (status >= 500 && status < 600) return SERVER_ERROR;
	return undefined;
}

/**
 * The `data` of FetchData / SendData / DeleteData's error event. A body that says nothing (none
 * at all, empty, or an HTML page from a proxy) becomes `{ message, action, status }` from the
 * status, so a page that shows `Steps.X.error.data.message` reads the words the toast would.
 * Any other body, JSON or text, is passed on as it came.
 */
export function errorEventData(data: unknown, status: unknown): unknown {
	const blank =
		data === undefined ||
		data === null ||
		(typeof data === 'string' && (data.trim() === '' || data.trimStart().startsWith('<')));
	if (!blank) return data;
	const byStatus = textForStatus(status) ?? NOTHING_TO_SAY;
	const out: Record<string, any> = { message: byStatus.text };
	if (byStatus.action) out.action = byStatus.action;
	if (typeof status === 'number') out.status = status;
	return out;
}

function isObject(v: unknown): v is Record<string, any> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function filled(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}

/** A value React can show as text. */
function printable(v: unknown): string | number | undefined {
	return typeof v === 'string' || typeof v === 'number' ? v : undefined;
}

interface Unwrapped {
	body: unknown;
	status?: number;
	/** What to show when neither the body nor the status says anything (axios's own text). */
	fallback?: string;
}

/** The body and status inside an axios error or a FetchData-style error event. */
function unwrap(msg: Record<string, any>): Unwrapped | undefined {
	if (
		msg.isAxiosError === true ||
		(isObject(msg.response) && typeof msg.response.status === 'number')
	) {
		return {
			body: msg.response?.data,
			status: msg.response?.status,
			fallback: filled(msg.message),
		};
	}
	if (typeof msg.status === 'number' && 'data' in msg && !('message' in msg)) {
		return { body: msg.data, status: msg.status };
	}
	return undefined;
}

export function messageDetails(msg: any, type?: string): MessageDetails {
	const details = describe(msg);
	if (type === 'ERROR' && (details.text === undefined || String(details.text).trim() === '')) {
		return {
			...details,
			text: NOTHING_TO_SAY.text,
			action: details.action ?? NOTHING_TO_SAY.action,
		};
	}
	return details;
}

function describe(msg: any): MessageDetails {
	// `Steps.fetch.error` reaches a page's Message step as the event's Map.
	if (msg instanceof Map) msg = Object.fromEntries(msg);
	if (!isObject(msg)) return { text: printable(msg) };

	const wrapped = unwrap(msg);
	const body = wrapped ? wrapped.body : msg;
	const fields = isObject(body) ? body : {};
	// Spring's own error body (`{ timestamp, status, error, path }`, a gateway's 503) carries
	// its status but no message.
	const status =
		wrapped?.status ?? (typeof fields.status === 'number' ? fields.status : undefined);

	const details: MessageDetails = {
		errorId: filled(fields.exceptionId),
		debugMessage: filled(fields.debugMessage),
		stackTrace: filled(fields.stackTrace),
	};

	const message = filled(fields.message);
	if (message) return { ...details, text: message, action: filled(fields.action) };

	const byStatus = textForStatus(status);
	if (byStatus) return { ...details, text: byStatus.text, action: byStatus.action };

	if (wrapped) return { ...details, text: wrapped.fallback };
	return { ...details, text: printable(msg.message) };
}

/** Puts `text` on the clipboard; `false` when the browser would not. */
export async function copyText(text: string): Promise<boolean> {
	if (globalThis.navigator?.clipboard?.writeText) {
		try {
			await globalThis.navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Refused (an insecure origin, no permission): try the older way below.
		}
	}
	return copyWithSelection(text);
}

// The older way, for pages served over plain http (local hosts), where browsers leave
// `navigator.clipboard` out. `execCommand` is deprecated but still the only way there.
function copyWithSelection(text: string): boolean {
	if (typeof document === 'undefined') return false;
	const area = document.createElement('textarea');
	area.value = text;
	area.setAttribute('readonly', '');
	area.style.position = 'fixed';
	area.style.opacity = '0';
	document.body.appendChild(area);
	area.select();
	let copied = false;
	try {
		copied = document.execCommand?.('copy') ?? false;
	} catch {
		copied = false;
	}
	area.remove();
	return copied;
}
