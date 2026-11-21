import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { EventStreamParser } from '../SSEventListener/authedEventStream';
import { ReportSpec } from './reportTypes';

/**
 * The AI report builder's client (CONTRACT 11, P2): `POST <aiEndpoint>` (SSE) with
 * `{prompt, spec?, group?, groups?, history?}`; events `status`, `question` {question, options},
 * `spec` {spec, summary, group?}, `error` {message}, `done`. Events come as named SSE events
 * (`event: spec` + `data: {...}`, the nocode-ai agents' wire format); an unnamed event whose
 * data carries `type` is read the same way.
 */

export const DEFAULT_AI_ENDPOINT = '/api/ai/reports/{app}/build';
export const AI_TIMEOUT_MS = 90000;

/** The group the builder suggests: an existing one (`id`) or a new label (`new`: made only on the user's confirm). */
export interface AiGroup {
	id?: string;
	label: string;
	kind?: string;
	new?: boolean;
}

export interface AiPeriod {
	from?: string;
	to?: string;
	label?: string;
}

export type AiEvent =
	| { type: 'status'; message: string }
	| { type: 'question'; question: string; options: string[] }
	| {
			type: 'spec';
			spec: ReportSpec;
			summary: string;
			group?: AiGroup;
			period?: AiPeriod;
	  }
	| { type: 'error'; message: string; code?: string }
	| { type: 'done'; info?: Record<string, any> };

export interface AiTurn {
	role: 'user' | 'assistant';
	text: string;
}

export interface AiRequest {
	prompt: string;
	spec?: ReportSpec;
	group?: string;
	groups?: Array<{ id: string; label: string; kind?: string }>;
	history?: AiTurn[];
}

/** The endpoint for an app: `{app}` replaced by the app code. */
export function aiUrl(template: string | undefined, appCode?: string): string {
	const app = appCode ?? String(getDataFromPath(`${STORE_PREFIX}.application.appCode`, []) ?? '');
	return (template?.trim() || DEFAULT_AI_ENDPOINT).split('{app}').join(encodeURIComponent(app));
}

function isSpec(v: any): v is ReportSpec {
	return !!v && typeof v === 'object' && typeof v.source === 'string' && !!v.view?.type;
}

function toGroup(v: any): AiGroup | undefined {
	if (!v) return undefined;
	if (typeof v === 'string') return { id: v, label: v };
	if (typeof v !== 'object') return undefined;
	const label = String(v.label ?? v.id ?? '').trim();
	if (!label) return undefined;
	return v.new
		? { label, new: true }
		: { id: v.id ? String(v.id) : undefined, label, kind: v.kind };
}

/** One SSE message as an AiEvent; undefined for anything else (pings, unknown types). */
export function toAiEvent(type: string, data: string): AiEvent | undefined {
	let d: any = {};
	if (data) {
		try {
			d = JSON.parse(data);
		} catch {
			d = { message: data };
		}
	}
	const t = type && type !== 'message' ? type : String(d?.type ?? d?.event ?? '');
	const p = d?.data && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : d;
	switch (t) {
		case 'status': {
			const message = String(p.message ?? p.text ?? p.status ?? '').trim();
			return message ? { type: 'status', message } : undefined;
		}
		case 'question': {
			const question = String(p.question ?? p.text ?? '').trim();
			const options = Array.isArray(p.options)
				? p.options.map((o: any) => String(o?.label ?? o)).filter(Boolean)
				: [];
			return question ? { type: 'question', question, options } : undefined;
		}
		case 'spec': {
			if (!isSpec(p.spec)) return { type: 'error', message: 'The AI answer had no report.' };
			const g = toGroup(p.group);
			const period =
				p.period && typeof p.period === 'object'
					? {
							from: p.period.from,
							to: p.period.to,
							label: p.period.label ? String(p.period.label) : undefined,
						}
					: undefined;
			return {
				type: 'spec',
				spec: p.spec,
				summary: String(p.summary ?? ''),
				...(g ? { group: g } : {}),
				...(period ? { period } : {}),
			};
		}
		case 'error':
			return {
				type: 'error',
				message: String(p.message ?? p.error ?? 'The AI could not build this report.'),
				...(p.code ? { code: String(p.code) } : {}),
			};
		case 'done':
			return { type: 'done', ...(p && Object.keys(p).length ? { info: p } : {}) };
		default:
			return undefined;
	}
}

/**
 * Streams one build. Calls `onEvent` for every event and resolves when the stream ends
 * (a `done` is sent last even when the server closes without one). Never throws: a failure is
 * an `error` event.
 */
export async function streamReportBuild(
	endpoint: string,
	body: AiRequest,
	onEvent: (e: AiEvent) => void,
	opts: { signal?: AbortSignal; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<void> {
	const fetchImpl = opts.fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);
	let ended = false;
	const emit = (e: AiEvent) => {
		if (ended) return;
		if (e.type === 'done') ended = true;
		onEvent(e);
	};
	if (!fetchImpl) {
		emit({ type: 'error', message: 'This browser cannot reach the AI.' });
		emit({ type: 'done' });
		return;
	}
	const ctl = new AbortController();
	const abort = () => ctl.abort();
	opts.signal?.addEventListener('abort', abort);
	const timer = setTimeout(abort, opts.timeoutMs ?? AI_TIMEOUT_MS);
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
		};
		const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
		if (token) headers.Authorization = String(token);
		const res = await fetchImpl(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			credentials: 'include',
			cache: 'no-store',
			signal: ctl.signal,
		});
		if (!res.ok || !res.body) {
			let message = `The AI did not answer (${res.status}).`;
			if (res.status === 404) {
				emit({
					type: 'error',
					message: 'The AI report builder is not available here yet.',
				});
				return;
			}
			try {
				const j = await res.json();
				if (typeof j?.detail === 'string') message = j.detail;
				else if (typeof j?.message === 'string') message = j.message;
			} catch {
				/* not JSON */
			}
			emit({ type: 'error', message });
			return;
		}
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		const parser = new EventStreamParser();
		for (;;) {
			const { done, value } = await reader.read();
			const msgs = parser.feed(
				done ? decoder.decode() + '\n\n' : decoder.decode(value, { stream: true }),
			);
			for (const m of msgs) {
				const e = toAiEvent(m.type, m.data);
				if (e) emit(e);
			}
			if (done || ended) break;
		}
	} catch (e: any) {
		if (opts.signal?.aborted) return;
		emit({
			type: 'error',
			message:
				e?.name === 'AbortError'
					? 'The AI took too long. Try again.'
					: 'Could not reach the AI. Check your connection.',
		});
	} finally {
		clearTimeout(timer);
		opts.signal?.removeEventListener('abort', abort);
		emit({ type: 'done' });
	}
}

/** `?spec=<base64url JSON>` (the CXZump assistant's link, CONTRACT 11) as a spec. */
export function specFromQuery(search: string | undefined): ReportSpec | undefined {
	const raw = new URLSearchParams(search ?? '').get('spec');
	if (!raw) return undefined;
	try {
		let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
		while (b64.length % 4) b64 += '=';
		const bin = atob(b64);
		const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
		const v = JSON.parse(new TextDecoder().decode(bytes));
		return isSpec(v) ? { ...v, v: 1 } : undefined;
	} catch {
		try {
			const v = JSON.parse(raw);
			return isSpec(v) ? { ...v, v: 1 } : undefined;
		} catch {
			return undefined;
		}
	}
}

/** A spec as `?spec=` text (base64url of the UTF-8 JSON). */
export function specToQuery(spec: ReportSpec): string {
	const bytes = new TextEncoder().encode(JSON.stringify(spec));
	let bin = '';
	bytes.forEach(b => (bin += String.fromCharCode(b)));
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
