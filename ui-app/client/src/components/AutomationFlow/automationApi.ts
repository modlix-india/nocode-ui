import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { OptionsRef, PickOption } from './automationTypes';

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

/** Options for a picker, fetched once per function per page load. Never rejects: no options is an empty list. */
export function loadOptions(ref: OptionsRef | undefined, appCode?: string): Promise<PickOption[]> {
	if (!ref?.namespace || !ref?.name) return Promise.resolve([]);
	const key = `${appCode ?? ''}:${ref.namespace}.${ref.name}`;
	if (!optionsCache.has(key)) {
		const p = axios
			.post(
				`api/core/function/execute/${encodeURIComponent(ref.namespace)}/${encodeURIComponent(ref.name)}`,
				{},
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
