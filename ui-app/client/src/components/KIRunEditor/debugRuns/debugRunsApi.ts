import axios from 'axios';
import { ExecutionLog } from '@fincity/kirun-js';
import { LOCAL_STORE_PREFIX } from '../../../constants';
import { getDataFromPath } from '../../../context/StoreContext';

/**
 * Stored server function debug runs (core keeps the runs made with the x-debug header).
 * The three calls below follow the core contract:
 *   GET api/core/functions/debugRuns/days  -> [{day, runs, errored}], newest day first
 *   GET api/core/functions/debugRuns       -> Spring page of run rows, newest first
 *   GET api/core/functions/debugRuns/{id}  -> the row plus `log` (an ExecutionLog)
 */

const BASE = '/api/core/functions/debugRuns';

export interface DebugRunDay {
	day: string;
	runs: number;
	errored: number;
}

export interface DebugRunRow {
	id: string;
	debugId: string;
	appCode: string;
	clientCode: string;
	namespace?: string | null;
	name: string;
	userName?: string;
	userId?: string | number;
	draft?: boolean;
	errored?: boolean;
	stepCount?: number;
	startedAt?: string | number;
	finishedAt?: string | number;
	durationMs?: number;
	logBytes?: number;
}

export interface DebugRunPage {
	content: DebugRunRow[];
	totalElements: number;
	number: number;
	size: number;
}

export interface DebugRunFunction {
	appCode: string;
	/** Left out when the function has no namespace. */
	namespace?: string;
	name: string;
	clientCode?: string;
}

/**
 * Why a call failed, as `kind` on the thrown error: 'noAccess' for a 403, 'unavailable' for a 404
 * on the list calls (this server does not store debug runs yet). A plain field rather than Error
 * subclasses, so callers need no imports to tell them apart.
 */
export type DebugRunsErrorKind = 'noAccess' | 'unavailable';

function failure(kind: DebugRunsErrorKind) {
	return Object.assign(new Error(kind), { kind });
}

function headers() {
	const h: Record<string, string> = {};
	const authToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
	if (authToken) h.Authorization = authToken;
	return h;
}

async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
	try {
		const clean: Record<string, any> = {};
		for (const [k, v] of Object.entries(params ?? {}))
			if (v !== undefined && v !== null && v !== '') clean[k] = v;
		const res = await axios.get(url, { params: clean, headers: headers() });
		return res.data as T;
	} catch (e: any) {
		if (e?.response?.status === 403) throw failure('noAccess');
		if (e?.response?.status === 404 && !/\/debugRuns\/(?!days)[^/]+$/.test(url))
			throw failure('unavailable');
		throw e;
	}
}

export function fetchDebugRunDays(fn: DebugRunFunction): Promise<DebugRunDay[]> {
	return get<DebugRunDay[]>(`${BASE}/days`, { ...fn }).then(d => d ?? []);
}

export function fetchDebugRuns(
	fn: DebugRunFunction,
	day: string,
	page: number,
	size: number,
	debugId?: string,
): Promise<DebugRunPage> {
	return get<DebugRunPage>(BASE, { ...fn, day, page, size, debugId });
}

export function fetchDebugRun(id: string): Promise<DebugRunRow & { log?: any }> {
	return get<DebugRunRow & { log?: any }>(`${BASE}/${encodeURIComponent(id)}`);
}

export interface StoredRunView {
	row: DebugRunRow;
	log: ExecutionLog;
	/** Names of steps whose values core cut short. */
	truncatedSteps: string[];
	/** True when core cut the whole log short (row size cap). */
	logTruncated: boolean;
	/** True when any argument or result shows the "****" mask. */
	hasMasked: boolean;
}

function walk(entries: any[], visit: (e: any) => void) {
	for (const e of entries ?? []) {
		visit(e);
		if (Array.isArray(e?.children)) walk(e.children, visit);
	}
}

function containsMask(v: any, depth = 0): boolean {
	if (v === '****') return true;
	if (!v || typeof v !== 'object' || depth > 20) return false;
	return Object.values(v).some(x => containsMask(x, depth + 1));
}

/** Turns the stored log (plain JSON) into what the KIRun editor's debug view reads. */
export function toStoredRunView(data: DebugRunRow & { log?: any }): StoredRunView {
	const raw = data.log ?? {};
	const logs = Array.isArray(raw) ? raw : Array.isArray(raw.logs) ? raw.logs : [];
	const truncatedSteps: string[] = [];
	let hasMasked = false;
	walk(logs, e => {
		if (e?.truncated) truncatedSteps.push(e.statementName ?? e.functionName ?? '?');
		if (!hasMasked && (containsMask(e?.arguments) || containsMask(e?.result))) hasMasked = true;
	});
	const { log: _ignored, ...row } = data;
	return {
		row,
		truncatedSteps,
		logTruncated: !!raw.truncated,
		hasMasked,
		log: {
			executionId: raw.executionId ?? data.debugId ?? data.id,
			startTime: raw.startTime ?? 0,
			endTime: raw.endTime,
			errored: !!(raw.errored ?? data.errored),
			logs,
			definitions: new Map(Object.entries(raw.definitions ?? {})),
		} as ExecutionLog,
	};
}
