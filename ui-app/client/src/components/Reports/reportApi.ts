import axios from 'axios';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { ReportCatalog, ReportOutput, ReportSpec } from './reportTypes';

/**
 * Calls an app's report functions (`<ns>.reportRun`, `<ns>.reportCatalog`) the way the page
 * runtime calls any server function: `POST api/core/function/execute/<ns>/<name>` with the
 * signed in user's token. Relative on purpose, like functions/call/credentials.ts and
 * AutomationFlow/automationApi.ts: the gateway reads the app and client from the page's path.
 *
 * Every call goes through a `ReportTransport`, so a component can run against the fixtures
 * (shaped exactly like CONTRACT section 3) until the runner is live, and tests need no server.
 */

export const REPORT_TIMEOUT_MS = 15000;

export interface ReportTransport {
	/** Executes a server function; answers what `/function/execute` answers (its events). */
	call(fn: string, args: Record<string, any>): Promise<any>;
	/** Reads a personalization document; `{}` when there is none. Throws when it cannot read. */
	loadDoc(name: string): Promise<any>;
	/** Writes a personalization document. */
	saveDoc(name: string, doc: any): Promise<void>;
}

export class ReportCallError extends Error {
	readonly code: string;
	constructor(code: string, message: string) {
		super(message);
		this.code = code;
	}
}

export function splitFunctionName(fn: string): { namespace: string; name: string } {
	const dot = fn.lastIndexOf('.');
	const namespace = fn.slice(0, dot).trim();
	const name = fn.slice(dot + 1).trim();
	if (dot <= 0 || !name || !namespace)
		throw new ReportCallError('BAD_FUNCTION', `"${fn}" is not a Namespace.name function.`);
	return { namespace, name };
}

/** The results of the first `output` event of a server function execution. */
export function eventResults(data: any): Record<string, any> {
	const events = Array.isArray(data) ? data : [data];
	const ev = events.find(e => e?.name === 'output') ?? events[0];
	if (!ev || typeof ev !== 'object') throw new ReportCallError('EMPTY', 'Nothing came back.');
	if (ev.name === 'error')
		throw new ReportCallError(
			'SOURCE_FAILED',
			String(ev.result?.message ?? 'The report function refused.'),
		);
	return ev.result && typeof ev.result === 'object' ? ev.result : ev;
}

function authHeaders(): Record<string, string> {
	const h: Record<string, string> = {};
	const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
	if (token) h.Authorization = String(token);
	return h;
}

function appCode(): string {
	return String(getDataFromPath(`${STORE_PREFIX}.application.appCode`, []) ?? '');
}

/** The personalization document name for a dashboard (CONTRACT section 5). */
export function docName(dashboardName: string | undefined): string {
	const n = String(dashboardName ?? '').trim() || 'dashboard';
	return `reports_${n.replace(/[^A-Za-z0-9_-]/g, '_')}`;
}

function httpError(e: any, what: string): ReportCallError {
	if (e?.code === 'ECONNABORTED' || /timeout/i.test(String(e?.message)))
		return new ReportCallError('TIMEOUT', 'The report took too long.');
	const status = Number(e?.response?.status) || 0;
	const msg = e?.response?.data?.message;
	return new ReportCallError(
		status ? `HTTP_${status}` : 'NETWORK',
		typeof msg === 'string' && msg ? msg : `${what}${status ? ` (${status})` : ''}.`,
	);
}

export const serverTransport: ReportTransport = {
	async call(fn, args) {
		const { namespace, name } = splitFunctionName(fn);
		try {
			const response = await axios.post(
				`api/core/function/execute/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`,
				args ?? {},
				{ headers: authHeaders(), timeout: REPORT_TIMEOUT_MS },
			);
			return response.data;
		} catch (e: any) {
			throw httpError(e, 'The report could not be loaded');
		}
	},
	async loadDoc(name) {
		try {
			const r = await axios.get(`api/ui/personalization/${appCode()}/${name}`, {
				headers: authHeaders(),
			});
			return r.data ?? {};
		} catch (e: any) {
			throw httpError(e, 'Your dashboard could not be loaded');
		}
	},
	async saveDoc(name, doc) {
		await axios.post(`api/ui/personalization/${appCode()}/${name}`, doc, {
			headers: authHeaders(),
		});
	},
};

let fixtureTransport: Promise<ReportTransport> | undefined;

/** The transport a component uses: the server's, or (preview with sample data) the fixtures'. */
export function transportFor(useFixtures: boolean | undefined): Promise<ReportTransport> {
	if (!useFixtures) return Promise.resolve(serverTransport);
	fixtureTransport ??= import(
		/* webpackChunkName: "report-fixtures" */ './fixtures/reportFixtures'
	).then(m => m.fixtureTransport);
	return fixtureTransport;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const h = setTimeout(
			() => reject(new ReportCallError('TIMEOUT', 'The report took too long.')),
			ms,
		);
		p.then(
			v => {
				clearTimeout(h);
				resolve(v);
			},
			e => {
				clearTimeout(h);
				reject(e);
			},
		);
	});
}

function pickOutput(results: Record<string, any>): any {
	if ('ok' in results) return results;
	for (const k of ['result', 'output', 'report']) {
		const v = results[k];
		if (v && typeof v === 'object' && 'ok' in v) return v;
	}
	const only = Object.values(results).find(v => v && typeof v === 'object' && 'ok' in v);
	return only ?? results;
}

export function defaultRunFunction(appNamespace: string | undefined) {
	return appNamespace ? `${appNamespace}.reportRun` : '';
}

export function defaultCatalogFunction(appNamespace: string | undefined) {
	return appNamespace ? `${appNamespace}.reportCatalog` : '';
}

/** Runs a spec. Never throws: every failure comes back as `{ok:false, error}`. */
export async function runReport(
	transport: ReportTransport,
	runFunction: string,
	spec: ReportSpec,
	opts?: { force?: boolean; dryRun?: boolean; timeoutMs?: number },
): Promise<ReportOutput> {
	try {
		if (!runFunction) throw new ReportCallError('BAD_FUNCTION', 'No report function is set.');
		const data = await withTimeout(
			transport.call(runFunction, { spec, force: !!opts?.force, dryRun: !!opts?.dryRun }),
			opts?.timeoutMs ?? REPORT_TIMEOUT_MS,
		);
		const out = pickOutput(eventResults(data));
		if (out?.ok === true) {
			return {
				...out,
				columns: Array.isArray(out.columns) ? out.columns : [],
				rows: Array.isArray(out.rows) ? out.rows : [],
			};
		}
		if (out?.ok === false)
			return {
				ok: false,
				error: {
					code: String(out.error?.code ?? 'SOURCE_FAILED'),
					message: out.error?.message,
					path: out.error?.path,
				},
			};
		return {
			ok: false,
			error: { code: 'BAD_OUTPUT', message: 'The report returned nothing.' },
		};
	} catch (e: any) {
		return {
			ok: false,
			error: {
				code: e instanceof ReportCallError ? e.code : 'SOURCE_FAILED',
				message: e?.message,
			},
		};
	}
}

const catalogCache = new Map<string, Promise<ReportCatalog>>();

/** Loads the catalog (already trimmed to the caller by the app), once per function per page load. */
export function loadCatalog(
	transport: ReportTransport,
	catalogFunction: string,
): Promise<ReportCatalog> {
	if (!catalogFunction)
		return Promise.reject(new ReportCallError('BAD_FUNCTION', 'No catalog function is set.'));
	const key = `${transport === serverTransport ? 's' : 'f'}:${catalogFunction}`;
	let p = catalogCache.get(key);
	if (!p) {
		p = (async () => {
			const data = await withTimeout(transport.call(catalogFunction, {}), REPORT_TIMEOUT_MS);
			const results = eventResults(data);
			const cat =
				results.sources !== undefined
					? results
					: [results.result, results.catalog, ...Object.values(results)].find(
							v => v && typeof v === 'object' && v.sources,
						);
			if (!cat) throw new ReportCallError('BAD_OUTPUT', 'The catalog came back empty.');
			return cat as ReportCatalog;
		})();
		p.catch(() => catalogCache.delete(key));
		catalogCache.set(key, p);
	}
	return p;
}

/** For tests: forget cached catalogs. */
export function clearCatalogCache() {
	catalogCache.clear();
}

/** Plain words for an error code, for the widget's error state. */
export function errorText(error: { code: string; message?: string } | undefined): string {
	if (!error) return 'Something went wrong.';
	switch (error.code) {
		case 'TIMEOUT':
			return 'This report took too long. Try again.';
		case 'FORBIDDEN_FIELD':
			return 'You do not have access to part of this report.';
		case 'SCOPE_REQUIRED':
			return 'This report is not available for your access.';
		case 'NETWORK':
			return 'Could not reach the server. Check your connection.';
		case 'BAD_VIEW':
			return error.message || 'This chart type does not fit the data.';
		default:
			return error.message || `The report could not be loaded (${error.code}).`;
	}
}
