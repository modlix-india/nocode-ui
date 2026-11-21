import { labelOf } from './reportFormat';
import {
	Bucket,
	DashboardFilters,
	DRILL_LEVELS,
	BUCKET_LABELS,
	CatalogSource,
	ReportCatalog,
	ReportColumn,
	ReportFilter,
	ReportSpec,
	SessionFilter,
	SPEC_CAPS,
} from './reportTypes';

/**
 * Spec changes the explore actions and the dashboard filter bar make. Everything here is
 * session state sent as extra `filters` (CONTRACT section 1: never saved unless the user
 * saves); the stored spec is never touched.
 */

export function cloneSpec<T>(v: T): T {
	return v === undefined ? v : JSON.parse(JSON.stringify(v));
}

/** The group by behind a result column (`as`), if the spec has one. */
export function groupByOf(spec: ReportSpec | undefined, key: string | undefined) {
	if (!spec || !key) return undefined;
	return spec.groupBy?.find(g => g.as === key);
}

function pad(n: number) {
	return String(n).padStart(2, '0');
}

function isoDay(d: Date) {
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** First and last calendar day of the bucket that starts at `start` (inclusive, ISO dates). */
export function bucketRange(
	start: string,
	bucket: Bucket,
): { from: string; to: string } | undefined {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(start ?? ''));
	if (!m) return undefined;
	const from = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
	const end = new Date(from.getTime());
	switch (bucket) {
		case 'YEAR':
			end.setUTCFullYear(end.getUTCFullYear() + 1);
			break;
		case 'QUARTER':
			end.setUTCMonth(end.getUTCMonth() + 3);
			break;
		case 'MONTH':
			end.setUTCMonth(end.getUTCMonth() + 1);
			break;
		case 'WEEK':
			end.setUTCDate(end.getUTCDate() + 7);
			break;
		default:
			end.setUTCDate(end.getUTCDate() + 1);
	}
	end.setUTCDate(end.getUTCDate() - 1);
	return { from: isoDay(from), to: isoDay(end) };
}

export function nextLevel(bucket: Bucket | undefined): Bucket | undefined {
	if (!bucket) return undefined;
	const i = DRILL_LEVELS.indexOf(bucket);
	return i < 0 || i >= DRILL_LEVELS.length - 1 ? undefined : DRILL_LEVELS[i + 1];
}

/**
 * One drill step. A date step (`kind` empty or 'date'): the bucket clicked and the finer level
 * shown inside it. A hierarchy step (CONTRACT 8.1): the group by moves from `field` to the next
 * level `next`, with an EQ filter on the clicked `value`.
 */
export interface DrillStep {
	kind?: 'date' | 'hierarchy';
	field: string;
	as: string;
	/** Date step: the level that was clicked (MONTH) and its range. */
	from?: string;
	to?: string;
	level?: Bucket;
	/** Hierarchy step: the next level's field and the clicked key. */
	next?: string;
	value?: any;
	/** "Nov 2026", "Tower A". */
	label: string;
}

/** What a click on a mark offers: the X (and series) value behind it. */
export interface MarkTarget {
	row: Record<string, any>;
	x?: ReportColumn;
	series?: ReportColumn;
	/** Present when the clicked dataset is one series value of a pivot. */
	seriesValue?: any;
}

export interface MarkActions {
	keep?: SessionFilter[];
	exclude?: SessionFilter[];
	/** Why Exclude is not offered. */
	excludeReason?: string;
	drill?: DrillStep;
}

/** The next level of a catalog hierarchy after `field`, if the source has it (CONTRACT 8.1). */
export function hierarchyNext(
	catalog: ReportCatalog | undefined,
	source: string | undefined,
	field: string,
): { next: string; hierarchy: string } | undefined {
	const fields = source ? catalog?.sources?.[source]?.fields : undefined;
	for (const [name, h] of Object.entries(catalog?.hierarchies ?? {})) {
		const levels = Array.isArray(h?.levels) ? h.levels : [];
		const i = levels.indexOf(field);
		if (i < 0 || i >= levels.length - 1) continue;
		const next = levels[i + 1];
		if (fields?.[next] && !fields[next].pii) return { next, hierarchy: name };
	}
	return undefined;
}

/** The Keep only / Exclude / Drill down choices for a click on a mark. */
export function markActions(
	spec: ReportSpec | undefined,
	target: MarkTarget,
	catalog?: ReportCatalog,
): MarkActions {
	const res: MarkActions = {};
	if (!spec || !target.x) return res;
	const gx = groupByOf(spec, target.x.key);
	if (!gx) return res;
	const value = target.row[target.x.key];
	const text = labelOf(target.row, target.x.key);
	const xLabel = target.x.label ?? gx.field;
	if (value === undefined || value === '__other__') return res;
	if (gx.bucket) {
		const range = bucketRange(value, gx.bucket);
		if (range) {
			res.keep = [
				{
					field: gx.field,
					period: 'CUSTOM',
					from: range.from,
					to: range.to,
					label: `${xLabel} in ${text}`,
				},
			];
			res.excludeReason = 'A date range cannot be excluded';
			const level = nextLevel(gx.bucket);
			if (level)
				res.drill = {
					kind: 'date',
					field: gx.field,
					as: gx.as,
					from: range.from,
					to: range.to,
					level,
					label: text,
				};
		}
	} else {
		res.keep = [{ field: gx.field, op: 'EQ', values: [value], label: `${xLabel} is ${text}` }];
		res.exclude = [
			{ field: gx.field, op: 'NE', values: [value], label: `${xLabel} is not ${text}` },
		];
		const h = hierarchyNext(catalog, spec.source, gx.field);
		if (h && (spec.filters?.length ?? 0) < SPEC_CAPS.filters)
			res.drill = {
				kind: 'hierarchy',
				field: gx.field,
				as: gx.as,
				next: h.next,
				value,
				label: text,
			};
	}
	const gs = target.series ? groupByOf(spec, target.series.key) : undefined;
	if (gs && !gs.bucket && target.seriesValue !== undefined && res.keep) {
		const sLabel = labelOf(target.row, target.series!.key);
		res.keep.push({
			field: gs.field,
			op: 'EQ',
			values: [target.seriesValue],
			label: `${target.series!.label ?? gs.field} is ${sLabel}`,
		});
	}
	return res;
}

/**
 * The spec with the drill steps applied in order: a date step puts the finer bucket on that
 * group by inside the clicked range; a hierarchy step moves the group by to the next level and
 * keeps only the clicked value of the level above.
 */
export function applyDrill(spec: ReportSpec, steps: DrillStep[]): ReportSpec {
	if (!steps.length) return spec;
	const next = cloneSpec(spec);
	let lastDate: DrillStep | undefined;
	for (const st of steps) {
		if (st.kind === 'hierarchy') {
			if (!st.next) continue;
			next.groupBy = (next.groupBy ?? []).map(g =>
				g.as === st.as ? { field: st.next!, as: g.as } : g,
			);
			next.filters = [
				...(next.filters ?? []),
				{ field: st.field, op: 'EQ', values: [st.value] },
			];
			continue;
		}
		if (!st.level) continue;
		lastDate = st;
		next.groupBy = (next.groupBy ?? []).map(g =>
			g.as === st.as ? { ...g, bucket: st.level } : g,
		);
		next.filters = withPeriod(next.filters, {
			field: st.field,
			period: 'CUSTOM',
			from: st.from,
			to: st.to,
		});
	}
	if (lastDate?.level)
		next.view = { ...next.view, drill: { field: lastDate.field, level: lastDate.level } };
	return next;
}

/**
 * Puts a date range on a field, REPLACING a period filter the field already has: the runner
 * applies one period per field, so a second one added beside "Last 12 months" was ignored and a
 * drill into Nov 2026 still showed the whole year. A drill or "Keep only" range always lies
 * inside the period it was clicked in, so replacing loses nothing.
 */
export function withPeriod(filters: ReportFilter[] | undefined, f: ReportFilter): ReportFilter[] {
	const list = filters ?? [];
	const i = list.findIndex(e => e.field === f.field && !!e.period);
	if (i < 0) return [...list, f];
	return list.map((e, j) => (j === i ? f : e));
}

export function drillCrumbs(
	spec: ReportSpec | undefined,
	steps: DrillStep[],
	catalog?: ReportCatalog,
): string[] {
	if (!steps.length || !spec) return [];
	const first = groupByOf(spec, steps[0].as);
	const top =
		steps[0].kind === 'hierarchy'
			? `All ${fieldLabel(catalog, steps[0].field).toLowerCase()}`
			: first?.bucket
				? `All ${BUCKET_LABELS[first.bucket].toLowerCase()}s`
				: 'All';
	return [top, ...steps.map(s => s.label)];
}

export interface EffectiveSpec {
	spec: ReportSpec;
	/** Filters that did not fit (cap or field unknown to this widget's source), in plain words. */
	skipped: string[];
}

function hasField(catalog: ReportCatalog | undefined, spec: ReportSpec, field: string) {
	const src = catalog?.sources?.[spec.source];
	if (!src) return false;
	if (src.kind === 'FUNCTION') return false;
	return !!src.fields?.[field];
}

/**
 * The spec a widget runs with: its own, then the dashboard filters (period replaces every
 * period filter the spec has; quick filters AND in where the source has the field), then the
 * explore filters (Keep only / Exclude), all within the 8 filter cap.
 */
export function effectiveSpec(
	spec: ReportSpec,
	opts: {
		catalog?: ReportCatalog;
		dashboard?: DashboardFilters;
		session?: SessionFilter[];
		drill?: DrillStep[];
		/** "Filter dashboard" clicks on other widgets (CONTRACT 8.1); applied where the source has the field. */
		cross?: SessionFilter[];
	},
): EffectiveSpec {
	const skipped: string[] = [];
	let next = cloneSpec(spec);
	const d = opts.dashboard;
	const isFunction = opts.catalog?.sources?.[spec.source]?.kind === 'FUNCTION';
	if (d?.period && isFunction) skipped.push('Period');
	if (d?.period && !isFunction) {
		const periodFilter = (field: string): ReportFilter =>
			d.period === 'CUSTOM'
				? { field, period: 'CUSTOM', from: d.from, to: d.to }
				: { field, period: d.period };
		const filters = next.filters ?? [];
		if (filters.some(f => f.period)) {
			next.filters = filters.map(f => (f.period ? periodFilter(f.field) : f));
		} else {
			// Only a date the spec itself names: catalog field order is not kept, so "the
			// first date field" would be a different field on another load.
			const dateField = next.groupBy?.find(g => g.bucket)?.field;
			if (dateField) next.filters = [...filters, periodFilter(dateField)];
			else skipped.push('Period');
		}
	}
	const extra: SessionFilter[] = [];
	const src = opts.catalog?.sources?.[spec.source];
	for (const [field, values] of Object.entries(d?.quick ?? {})) {
		if (!values?.length) continue;
		// A function source takes a quick filter as a parameter it allows, one value only.
		if (isFunction) {
			if (allowedParams(src).includes(field) && values.length === 1)
				next.params = { ...(next.params ?? {}), [field]: values[0] };
			else skipped.push(fieldLabel(opts.catalog, field));
			continue;
		}
		if (!hasField(opts.catalog, spec, field)) {
			skipped.push(opts.catalog?.sources?.[spec.source]?.fields?.[field]?.label ?? field);
			continue;
		}
		extra.push({ field, op: 'IN', values });
	}
	for (const f of opts.cross ?? []) {
		if (!hasField(opts.catalog, spec, f.field)) {
			skipped.push(f.label ?? fieldLabel(opts.catalog, f.field));
			continue;
		}
		if (f.period && (next.filters ?? []).some(e => e.field === f.field && e.period)) {
			const { label: _l, ...plain } = f;
			next.filters = withPeriod(next.filters, plain);
		} else extra.push(f);
	}
	// A session date range (Keep only on a date) replaces that field's period, as a drill does.
	for (const f of opts.session ?? []) {
		if (f.period && (next.filters ?? []).some(e => e.field === f.field && e.period)) {
			const { label: _l, ...plain } = f;
			next.filters = withPeriod(next.filters, plain);
		} else extra.push(f);
	}
	const room = SPEC_CAPS.filters - (next.filters?.length ?? 0);
	if (extra.length > room) {
		extra.slice(Math.max(0, room)).forEach(f => skipped.push(f.label ?? f.field));
	}
	const fit = extra.slice(0, Math.max(0, room)).map(({ label: _l, ...f }) => f);
	if (fit.length) next.filters = [...(next.filters ?? []), ...fit];
	if (opts.drill?.length) next = applyDrill(next, opts.drill);
	return { spec: next, skipped };
}

/** The spec behind a quick filter's choices: a one group by count of that field. */
export function valuesSpec(
	catalog: ReportCatalog | undefined,
	field: string,
): ReportSpec | undefined {
	const entry = reportSources(catalog)
		.filter(([, s]) => s.kind !== 'FUNCTION' && !!s.fields?.[field] && !s.fields[field].pii)
		.sort(bySize)[0];
	if (!entry) return undefined;
	return {
		v: 1,
		source: entry[0],
		measures: [{ fn: 'COUNT', as: 'n' }],
		groupBy: [{ field, as: 'k' }],
		sort: [{ by: 'n', dir: 'DESC' }],
		limit: 200,
		view: { type: 'TABLE' },
	};
}

/** Sources a user may report on (not `lookupOnly`), in a stable order (catalog order is not kept). */
export function reportSources(catalog: ReportCatalog | undefined): Array<[string, CatalogSource]> {
	return Object.entries(catalog?.sources ?? {})
		.filter(([, s]) => s && !s.lookupOnly)
		.sort((a, b) => (a[1].label ?? a[0]).localeCompare(b[1].label ?? b[0]));
}

/** Most fields first, then by key: the main source of an app (e.g. cases) wins, every time. */
export function bySize(a: [string, CatalogSource], b: [string, CatalogSource]): number {
	const d = Object.keys(b[1].fields ?? {}).length - Object.keys(a[1].fields ?? {}).length;
	return d || a[0].localeCompare(b[0]);
}

/** A label for a catalog field, falling back to its key. */
export function fieldLabel(catalog: ReportCatalog | undefined, field: string): string {
	for (const s of Object.values(catalog?.sources ?? {})) {
		const f = s.fields?.[field];
		if (f?.label) return f.label;
	}
	return field;
}

/** A stable key for a spec (for the 10 s forced refresh guard and caches). */
export function specKey(spec: ReportSpec | undefined): string {
	return spec ? JSON.stringify(spec) : '';
}

/**
 * A records page request (CONTRACT 8.1) for what a widget shows: its source, segment and
 * effective filters, plus a clicked mark's Keep only filters, within the filter cap.
 */
export function recordsSpec(
	eff: ReportSpec,
	extra: SessionFilter[] | undefined,
	page: number,
	size: number,
	exportAll?: boolean,
): ReportSpec {
	let filters = [...(eff.filters ?? [])];
	for (const f of extra ?? []) {
		const { label: _l, ...plain } = f;
		if (plain.period) filters = withPeriod(filters, plain);
		else if (filters.length < SPEC_CAPS.filters) filters.push(plain);
	}
	return {
		v: 1,
		source: eff.source,
		...(eff.segment ? { segment: eff.segment } : {}),
		...(filters.length ? { filters } : {}),
		records: { page, size, ...(exportAll ? { export: true } : {}) },
		view: { type: 'TABLE' },
	};
}

/** Why a spec cannot compare periods, or undefined when it can (CONTRACT 8.1: one period, not ALL_TIME). */
export function compareBlocker(
	spec: ReportSpec | undefined,
	catalog: ReportCatalog | undefined,
): string | undefined {
	if (!spec) return 'Nothing to compare';
	if (catalog?.sources?.[spec.source]?.kind === 'FUNCTION')
		return 'This report cannot be compared';
	const periods = (spec.filters ?? []).filter(f => f.period);
	if (!periods.length) return 'Set a date range to compare';
	if (periods.some(f => f.period === 'ALL_TIME')) return 'All time cannot be compared';
	// The runner compares one period (BAD_PERIOD otherwise).
	if (periods.length > 1) return 'Compare needs a single date range';
	return undefined;
}

/**
 * The parameters a function source lets a spec (or a dashboard filter) set: `allowedParams`,
 * else the keys of the catalog's `params` (CONTRACT 7: function-source `params` = allowed params).
 */
export function allowedParams(src: CatalogSource | undefined): string[] {
	if (Array.isArray(src?.allowedParams)) return src!.allowedParams;
	const p = src?.params;
	if (Array.isArray(p)) return p.map(String);
	return p && typeof p === 'object' ? Object.keys(p) : [];
}
