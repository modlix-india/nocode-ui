import { valuesSpec } from './reportSpecUtil';
import type { PickOption } from './ui/common';
import { ReportCatalog, ReportSpec } from './reportTypes';
import { labelOf } from './reportFormat';

/**
 * Cascading quick filters (ADZ-2164). A catalog may say that a quick filter's choices depend
 * on other quick filters (`quickFilterDepends`: `{ adAccountId: ['platform'] }`). The choices
 * of such a filter are then only the values that exist together with what is picked in the
 * filters it depends on, and a pick that no longer fits is dropped. A catalog without the
 * key behaves as before: every filter lists all its values.
 */

export type QuickPicks = Record<string, any[]>;

/** The quick filters `field` depends on, in catalog order, only ones that are quick filters. */
export function quickDepends(catalog: ReportCatalog | undefined, field: string): string[] {
	const wanted = catalog?.quickFilterDepends?.[field];
	if (!Array.isArray(wanted)) return [];
	const known = new Set(catalog?.quickFilters ?? []);
	return (catalog?.quickFilters ?? []).filter(
		f => f !== field && known.has(f) && wanted.includes(f),
	);
}

/** The fields among `quickDepends` that carry a pick right now. */
function activeDepends(catalog: ReportCatalog | undefined, field: string, quick?: QuickPicks) {
	return quickDepends(catalog, field).filter(f => !!quick?.[f]?.length);
}

/**
 * A key that changes exactly when the choices of `field` change: what the filters it depends
 * on hold. A filter with no dependency always has the same key.
 */
export function quickOptionsKey(
	catalog: ReportCatalog | undefined,
	field: string,
	quick?: QuickPicks,
): string {
	return JSON.stringify(
		activeDepends(catalog, field, quick).map(f => [f, (quick?.[f] ?? []).map(String).sort()]),
	);
}

/**
 * The spec behind the choices of a quick filter: `valuesSpec`, narrowed by the picks of the
 * filters it depends on (only those the values source also has).
 */
export function quickValuesSpec(
	catalog: ReportCatalog | undefined,
	field: string,
	quick?: QuickPicks,
): ReportSpec | undefined {
	const vs = valuesSpec(catalog, field);
	if (!vs) return undefined;
	const fields = catalog?.sources?.[vs.source]?.fields ?? {};
	const filters = activeDepends(catalog, field, quick)
		.filter(f => !!fields[f] && !fields[f].pii)
		.map(f => ({ field: f, op: 'IN' as const, values: quick![f] }));
	return filters.length ? { ...vs, filters } : vs;
}

/** Fields whose choices depend on `field` (the ones to re-check when `field` changes). */
export function quickDependents(catalog: ReportCatalog | undefined, field: string): string[] {
	return (catalog?.quickFilters ?? []).filter(f => quickDepends(catalog, f).includes(field));
}

/**
 * The picks after `changed` was edited: every pick of a dependent filter that is not among
 * that filter's choices under the new picks is dropped, and so on down the chain (a product
 * depends on an ad account which depends on a platform). `load` returns the choices of one
 * field under the given picks. If a load fails the picks of that field are kept: the choices
 * list shows the same error and nothing is lost silently.
 */
export async function pruneQuick(
	catalog: ReportCatalog | undefined,
	quick: QuickPicks,
	changed: string,
	load: (field: string, quick: QuickPicks) => Promise<PickOption[]>,
): Promise<{ quick: QuickPicks; dropped: Record<string, any[]> }> {
	let next = { ...quick };
	const dropped: Record<string, any[]> = {};
	const seen = new Set<string>([changed]);
	let queue = quickDependents(catalog, changed);
	while (queue.length) {
		const field = queue.shift()!;
		if (seen.has(field)) continue;
		seen.add(field);
		const picked = next[field] ?? [];
		if (picked.length) {
			try {
				const ok = new Set((await load(field, next)).map(o => String(o.value)));
				const keep = picked.filter(v => ok.has(String(v)));
				if (keep.length !== picked.length) {
					dropped[field] = picked.filter(v => !ok.has(String(v)));
					next = { ...next, [field]: keep };
				}
			} catch {
				// keep the picks of this field
			}
		}
		queue = [...queue, ...quickDependents(catalog, field)];
	}
	return { quick: next, dropped };
}

/** The function that lists the choices of `field` with its connected assets, if the catalog has one. */
export function quickOptionsFunction(
	catalog: ReportCatalog | undefined,
	field: string,
): string | undefined {
	const fn = catalog?.quickFilterOptions?.[field];
	return typeof fn === 'string' && fn.includes('.') ? fn : undefined;
}

/**
 * The choices of a quick filter from the runner's rows (values that have data) and the connected
 * assets (ADZ-2164): every connected asset is listed, the ones without a row are flagged
 * `noData`; a value with rows that is not connected (an archived product) is kept. Order: the
 * ones with data in the runner's order, then the ones without data by name. Two assets with the
 * same name get their external id appended so they can be told apart.
 */
export function mergeQuickOptions(
	rows: Array<Record<string, any>>,
	connected: Array<Record<string, any>>,
): PickOption[] {
	const withData = new Map<string, PickOption>();
	rows.forEach(row => {
		const key = String(row.k);
		if (!withData.has(key)) withData.set(key, { value: row.k, label: labelOf(row, 'k') });
	});
	const assets = connected.filter(a => a?._id !== undefined && a._id !== null && a._id !== '');
	const names = new Map<string, number>();
	assets.forEach(a => {
		const n = String(a.name ?? a._id);
		names.set(n, (names.get(n) ?? 0) + 1);
	});
	const seen = new Set<string>();
	const noData: PickOption[] = [];
	assets.forEach(a => {
		const key = String(a._id);
		if (seen.has(key)) return;
		seen.add(key);
		const name = String(a.name ?? a._id);
		const label =
			(names.get(name) ?? 0) > 1 && a.externalId ? `${name} (${a.externalId})` : name;
		const hit = withData.get(key);
		if (hit) withData.set(key, { value: hit.value, label });
		else noData.push({ value: a._id, label, noData: true });
	});
	noData.sort((a, b) => a.label.localeCompare(b.label));
	return [...withData.values(), ...noData];
}
