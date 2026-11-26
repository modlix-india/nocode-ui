import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { AutomationDoc, Catalog, CheckReport, OptionsRef, PickOption } from './automationTypes';

/**
 * The two calls the flow view makes on its own: the options a picker offers
 * (a server function answering `[{label, value}]`) and, for the chat's
 * function panel, a function definition.
 *
 * Relative URLs on purpose, as `functions/call/credentials.ts` does: the
 * gateway reads the app and client from the page's own path.
 */

function headers(appCode?: string): Record<string, string> {
	const h: Record<string, string> = {};
	const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
	if (token) h.Authorization = String(token);
	if (appCode) h.appCode = appCode;
	return h;
}

/**
 * The list inside a function's answer. `/function/execute` answers its events,
 * `[{name, result: {<output>: value}}]`; an options function names its output
 * freely, so the first array found (preferring `options`, `result`, `list`) is it.
 */
export function optionsFromResponse(data: any): PickOption[] {
	const toOptions = (arr: any[]): PickOption[] =>
		arr
			.filter(e => e !== undefined && e !== null)
			.map(e =>
				typeof e === 'object'
					? {
							label: String(e.label ?? e.name ?? e.value ?? ''),
							value: e.value ?? e.id ?? e.name,
						}
					: { label: String(e), value: e },
			);
	if (
		Array.isArray(data) &&
		data.length &&
		data.every(e => e && typeof e === 'object' && 'label' in e)
	)
		return toOptions(data);
	const events: any[] = Array.isArray(data) ? data : data ? [data] : [];
	for (const ev of events) {
		const result = ev?.result ?? ev;
		if (Array.isArray(result)) return toOptions(result);
		if (!result || typeof result !== 'object') continue;
		for (const k of ['options', 'result', 'list', 'values']) {
			const v = result[k];
			if (Array.isArray(v)) return toOptions(v);
			if (v && typeof v === 'object')
				for (const inner of Object.values(v))
					if (Array.isArray(inner)) return toOptions(inner);
		}
		for (const v of Object.values(result)) if (Array.isArray(v)) return toOptions(v);
	}
	return [];
}

const optionsCache = new Map<string, Promise<PickOption[]>>();

/** A stable text for an args object: keys sorted, so the same args always give the same cache key. */
export function stableArgs(args?: Record<string, any>): string {
	if (!args) return '';
	const keys = Object.keys(args).sort();
	return keys.length ? JSON.stringify(keys.map(k => [k, args[k]])) : '';
}

/**
 * Options for a picker, fetched once per function (and per args) per page load.
 * `args` is the request body (a dependent field sends its sibling's value);
 * none means `{}`. Never rejects: no options is an empty list.
 */
export function loadOptions(
	ref: OptionsRef | undefined,
	appCode?: string,
	args?: Record<string, any>,
): Promise<PickOption[]> {
	if (!ref?.namespace || !ref?.name) return Promise.resolve([]);
	const argKey = stableArgs(args);
	const key = `${appCode ?? ''}:${ref.namespace}.${ref.name}${argKey ? `|${argKey}` : ''}`;
	if (!optionsCache.has(key)) {
		const p = axios
			.post(
				`api/core/function/execute/${encodeURIComponent(ref.namespace)}/${encodeURIComponent(ref.name)}`,
				args ?? {},
				{ headers: headers(appCode) },
			)
			.then(r => optionsFromResponse(r.data))
			.catch(() => {
				// A failed fetch is retried the next time a picker asks, not cached.
				optionsCache.delete(key);
				return [] as PickOption[];
			});
		optionsCache.set(key, p);
	}
	return optionsCache.get(key)!;
}

/**
 * A KIRun function definition by namespace and name, the way the KIRun editor's
 * repositories find one (`/api/{core|ui}/functions/repositoryFind`): server
 * functions from core, page and UI functions from ui.
 */
export async function fetchFunctionDefinition(
	namespace: string,
	name: string,
	isServer: boolean,
	appCode?: string,
): Promise<any | undefined> {
	const server = isServer ? 'core' : 'ui';
	const response = await axios.get(`api/${server}/functions/repositoryFind`, {
		params: { appCode, namespace, name, includeKIRunRepos: isServer },
		headers: headers(appCode),
	});
	return response.data?.definition ?? undefined;
}

const catalogCache = new Map<string, Promise<Catalog | undefined>>();

/**
 * The app's catalog, for a flow whose page binds none (the AppBuilder workspace
 * editor). Asks for every function too (`functions=all`): the server lists them
 * only for a builder. Fetched once per app and client per page load; a failure
 * is not cached and answers undefined.
 */
export function loadCatalog(appCode: string, clientCode?: string): Promise<Catalog | undefined> {
	const key = `${appCode}:${clientCode ?? ''}`;
	if (!catalogCache.has(key)) {
		const params: Record<string, string> = { appCode, functions: 'all' };
		if (clientCode) params.clientCode = clientCode;
		const p = (async () => {
			try {
				const r = await axios.get('api/core/automations/catalog', {
					params,
					headers: headers(),
				});
				if (!r?.data) catalogCache.delete(key);
				return r?.data as Catalog | undefined;
			} catch {
				catalogCache.delete(key);
				return undefined;
			}
		})();
		catalogCache.set(key, p);
	}
	return catalogCache.get(key)!;
}

/** The server's soundness check of a document (`POST /api/core/automations/check`). Never rejects. */
export async function checkAutomation(doc: AutomationDoc): Promise<CheckReport | undefined> {
	try {
		const r = await axios.post('api/core/automations/check', doc, { headers: headers() });
		return r?.data as CheckReport | undefined;
	} catch {
		return undefined;
	}
}
