import { isDatasetSource } from './datasetModel';
import { reportSources } from './reportSpecUtil';
import { checkView, ResultShape } from './shapeRules';
import {
	Bucket,
	BUCKET_LABELS,
	CatalogField,
	MEASURE_FN_LABELS,
	MeasureFn,
	Period,
	PERIOD_LABELS,
	ReportCatalog,
	ReportFilter,
	ReportSpec,
	VIEW_TYPES,
	ViewType,
} from './reportTypes';

/**
 * The simple report builder's model (Kiran 2026-11-21, "list first, simple builder"): four plain
 * questions over one spec, Show (the first measure), By (the first group by), Period (one period
 * filter on a date) and Which records (the segment). Every change edits only its own part of the
 * spec; whatever the questions cannot show (a second measure, a colour split, other filters,
 * compare...) is kept as it is and listed so the builder opens More options. Pure, so the round
 * trip is tested.
 */

export interface Choice {
	value: string;
	label: string;
}

export const COUNT_CHOICE = 'COUNT';
export const NOTHING = '';

const BUCKET_ORDER: Bucket[] = ['MONTH', 'QUARTER', 'YEAR', 'WEEK', 'DAY'];

/** "Agreement value" -> "agreement value"; "RM" stays "RM". */
export function lowerFirst(s: string): string {
	if (!s) return s;
	if (s.length > 1 && s[1] === s[1].toUpperCase() && s[1] !== s[1].toLowerCase()) return s;
	return s[0].toLowerCase() + s.slice(1);
}

function fieldsOf(catalog: ReportCatalog | undefined, source: string) {
	return Object.entries(catalog?.sources?.[source]?.fields ?? {}).filter(([, f]) => !f.pii);
}

function byLabel(a: [string, CatalogField], b: [string, CatalogField]) {
	return (a[1].label ?? a[0]).localeCompare(b[1].label ?? b[0]);
}

/** What the source's records are called: the segment's label, else the source's. */
export function recordsLabel(
	spec: Pick<ReportSpec, 'source' | 'segment'>,
	catalog?: ReportCatalog,
) {
	const src = catalog?.sources?.[spec.source];
	const seg = spec.segment ? src?.segments?.[spec.segment]?.label : undefined;
	return lowerFirst(seg ?? src?.label ?? 'records');
}

/** Show: "Count of bookings", then each measure field with each of its functions. */
export function showChoices(spec: ReportSpec, catalog?: ReportCatalog): Choice[] {
	const out: Choice[] = [
		{ value: COUNT_CHOICE, label: `Count of ${recordsLabel(spec, catalog)}` },
	];
	for (const [k, f] of fieldsOf(catalog, spec.source)
		.filter(([, f]) => f.kind === 'MEASURE')
		.sort(byLabel)) {
		const fns = (f.fns?.length ? f.fns : ['SUM', 'AVG', 'MIN', 'MAX']) as MeasureFn[];
		for (const fn of fns) {
			if (fn === 'COUNT') continue;
			out.push({
				value: `${fn}:${k}`,
				label: `${MEASURE_FN_LABELS[fn]} of ${lowerFirst(f.label ?? k)}`,
			});
		}
	}
	return out;
}

/** By: nothing (one number), each dimension, each date by month / quarter / year / week / day. */
export function byChoices(spec: ReportSpec, catalog?: ReportCatalog): Choice[] {
	const fields = fieldsOf(catalog, spec.source);
	const out: Choice[] = [{ value: NOTHING, label: 'Nothing (one number)' }];
	for (const [k, f] of fields.filter(([, f]) => f.kind === 'DIMENSION').sort(byLabel))
		out.push({ value: `d:${k}`, label: f.label ?? k });
	for (const [k, f] of fields.filter(([, f]) => f.kind === 'DATE').sort(byLabel))
		for (const b of BUCKET_ORDER)
			out.push({
				value: `t:${k}:${b}`,
				label: `${BUCKET_LABELS[b]} of ${lowerFirst(f.label ?? k)}`,
			});
	return out;
}

export const PERIOD_CHOICES: Period[] = [
	'THIS_MONTH',
	'LAST_MONTH',
	'THIS_QUARTER',
	'LAST_QUARTER',
	'THIS_FY',
	'LAST_FY',
	'LAST_7_DAYS',
	'LAST_30_DAYS',
	'LAST_90_DAYS',
	'LAST_12_MONTHS',
	'TODAY',
	'CUSTOM',
];

/** The date the Period question filters on: the spec's own period filter, the segment's date, the first date. */
export function periodField(spec: ReportSpec, catalog?: ReportCatalog): string | undefined {
	const own = (spec.filters ?? []).find(f => !!f.period);
	if (own) return own.field;
	const src = catalog?.sources?.[spec.source];
	const segDate = spec.segment ? src?.segments?.[spec.segment]?.dateField : undefined;
	if (segDate && src?.fields?.[segDate]) return segDate;
	const dates = fieldsOf(catalog, spec.source).filter(([, f]) => f.kind === 'DATE');
	const g = spec.groupBy?.find(x => dates.some(([k]) => k === x.field));
	return g?.field ?? dates.sort(byLabel)[0]?.[0];
}

export interface SimpleState {
	show: string;
	by: string;
	period: Period | '';
	from?: string;
	to?: string;
	segment: string;
	/** Parts the questions cannot show (More options opens on them); plain words. */
	unsupported: string[];
	/** Kept options the questions do not show but that need no attention (sort, style...). */
	inUse: string[];
}

function measureValue(m: { fn: MeasureFn; field?: string; segment?: string } | undefined) {
	if (!m || m.fn === 'COUNT') return COUNT_CHOICE;
	return `${m.fn}:${m.field ?? ''}`;
}

function groupValue(
	g: { field: string; bucket?: Bucket } | undefined,
	catalog: ReportCatalog | undefined,
	source: string,
) {
	if (!g) return NOTHING;
	const kind = catalog?.sources?.[source]?.fields?.[g.field]?.kind;
	if (kind === 'DATE' || g.bucket) return `t:${g.field}:${g.bucket ?? ''}`;
	return `d:${g.field}`;
}

export function simpleState(spec: ReportSpec, catalog?: ReportCatalog): SimpleState {
	const pf = periodField(spec, catalog);
	const filters = spec.filters ?? [];
	const periodFilter = filters.find(f => f.period && f.field === pf);
	const unsupported: string[] = [];
	if ((spec.measures?.length ?? 0) > 1) unsupported.push('more than one value');
	if (spec.measures?.[0]?.segment) unsupported.push('a value for some records only');
	if (spec.derived?.length) unsupported.push('a calculation');
	if ((spec.groupBy?.length ?? 0) > 1) unsupported.push('a colour split');
	if (spec.groupBy?.[0]?.fy) unsupported.push('financial year buckets');
	if (filters.some(f => f !== periodFilter)) unsupported.push('filters');
	if (spec.compare) unsupported.push('a comparison');
	const inUse: string[] = [];
	if (spec.sort?.length) inUse.push('sort');
	if (spec.limit) inUse.push(`top ${spec.limit}`);
	if (spec.view.style && Object.keys(spec.view.style).length) inUse.push('style');
	return {
		show: measureValue(spec.measures?.[0]),
		by: groupValue(spec.groupBy?.[0], catalog, spec.source),
		period: (periodFilter?.period as Period) ?? '',
		from: periodFilter?.from,
		to: periodFilter?.to,
		segment: spec.segment ?? '',
		unsupported,
		inUse,
	};
}

function uniqueKey(base: string, taken: Set<string>): string {
	const clean = base.replace(/[^A-Za-z0-9_]/g, '_') || 'm';
	let k = clean;
	for (let i = 2; taken.has(k); i++) k = `${clean}_${i}`;
	return k;
}

function clone(spec: ReportSpec): ReportSpec {
	return JSON.parse(JSON.stringify(spec));
}

function renameKey(spec: ReportSpec, from: string | undefined, to: string) {
	if (!from || from === to) return;
	if (spec.view.y) spec.view.y = spec.view.y.map(k => (k === from ? to : k));
	if (spec.view.x === from) spec.view.x = to;
	if (spec.sort) spec.sort = spec.sort.map(s => (s.by === from ? { ...s, by: to } : s));
}

/** Show: replaces the first measure only (the others stay). */
export function applyShow(spec: ReportSpec, value: string): ReportSpec {
	const next = clone(spec);
	const old = next.measures?.[0];
	const [fnPart, field] = value === COUNT_CHOICE ? ['COUNT', undefined] : value.split(':');
	const fn = fnPart as MeasureFn;
	const same = old && old.fn === fn && (old.field ?? undefined) === (field || undefined);
	if (same) return next;
	const taken = new Set([
		...(next.measures ?? []).slice(1).map(m => m.as),
		...(next.derived ?? []).map(d => d.as),
		...(next.groupBy ?? []).map(g => g.as),
	]);
	const as = uniqueKey(fn === 'COUNT' ? 'count' : `${fn.toLowerCase()}_${field}`, taken);
	const m = fn === 'COUNT' ? { fn, as } : { fn, field, as };
	next.measures = [m, ...(next.measures ?? []).slice(1)];
	renameKey(next, old?.as, as);
	if (!next.view.y?.length) next.view.y = [as];
	return next;
}

/** By: replaces the first group by only (a colour split stays). */
export function applyBy(spec: ReportSpec, value: string): ReportSpec {
	const next = clone(spec);
	const old = next.groupBy?.[0];
	const rest = (next.groupBy ?? []).slice(1);
	if (value === NOTHING) {
		next.groupBy = rest.length ? rest : undefined;
		if (!next.groupBy) delete next.groupBy;
		if (old && next.view.x === old.as) delete next.view.x;
		if (old && next.sort) {
			next.sort = next.sort.filter(s => s.by !== old.as);
			if (!next.sort.length) delete next.sort;
		}
		return next;
	}
	const [kind, field, bucket] = value.split(':');
	const g: { field: string; as: string; bucket?: Bucket } = { field, as: '' };
	if (kind === 't' && bucket) g.bucket = bucket as Bucket;
	const taken = new Set([
		...rest.map(x => x.as),
		...(next.measures ?? []).map(m => m.as),
		...(next.derived ?? []).map(d => d.as),
	]);
	g.as = old && old.field === field ? old.as : uniqueKey(field, taken);
	next.groupBy = [g, ...rest];
	renameKey(next, old?.as, g.as);
	next.view.x = g.as;
	return next;
}

/** Period: sets, changes or clears the one period filter on the period date (other filters stay). */
export function applyPeriod(
	spec: ReportSpec,
	catalog: ReportCatalog | undefined,
	period: Period | '',
	from?: string,
	to?: string,
): ReportSpec {
	const next = clone(spec);
	const field = periodField(next, catalog);
	if (!field) return next;
	const filters = (next.filters ?? []).filter(f => !(f.period && f.field === field));
	const at = (next.filters ?? []).findIndex(f => f.period && f.field === field);
	if (period) {
		const f: ReportFilter = { field, period };
		if (period === 'CUSTOM') {
			if (from) f.from = from;
			if (to) f.to = to;
		}
		filters.splice(at >= 0 ? at : filters.length, 0, f);
	}
	if (filters.length) next.filters = filters;
	else delete next.filters;
	return next;
}

/** Which records: the segment ('' = all). */
export function applySegment(spec: ReportSpec, segment: string): ReportSpec {
	const next = clone(spec);
	if (segment) next.segment = segment;
	else delete next.segment;
	return next;
}

function fmtDate(iso: string | undefined): string {
	if (!iso) return '?';
	const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
	if (isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** A spec in plain words: "Count of bookings by RM, this quarter". */
export function describeSpec(spec: ReportSpec, catalog?: ReportCatalog): string {
	const src = catalog?.sources?.[spec.source];
	// The data was deleted: its field names ("n1", "d1") mean nothing now, so say so in plain words.
	if (!src && catalog?.sources && isDatasetSource(spec.source)) return 'On data that was deleted';
	if (src?.kind === 'FUNCTION' || !spec.measures?.length) {
		// A function source: the value shown, from where ("Agreement value from money summary").
		const y = spec.view.y?.[0];
		const col = y ? (src?.columns?.[y]?.label as string | undefined) : undefined;
		const from = src?.label ?? 'a list of records';
		return col ? `${col} from ${lowerFirst(from)}` : from;
	}
	const field = (k: string) => lowerFirst(src?.fields?.[k]?.label ?? k);
	const phrase = (m: { fn: MeasureFn; field?: string; segment?: string }) => {
		if (m.fn !== 'COUNT') return `${MEASURE_FN_LABELS[m.fn]} of ${field(m.field ?? '')}`;
		return `Count of ${recordsLabel({ source: spec.source, segment: m.segment ?? spec.segment }, catalog)}`;
	};
	const m = spec.measures[0];
	// A rate drawn alone: "Count of converted EOIs out of count of EOIs".
	const shown =
		spec.view.y?.length === 1 ? spec.derived?.find(d => d.as === spec.view.y![0]) : undefined;
	const pair = shown?.ratio ?? shown?.percent;
	const byKey = (k: string) => spec.measures!.find(x => x.as === k);
	let text: string;
	if (pair && byKey(pair[0]) && byKey(pair[1]))
		text = `${phrase(byKey(pair[0])!)} out of ${lowerFirst(phrase(byKey(pair[1])!))}`;
	else {
		text = phrase(m);
		if (spec.measures.length > 1) text += ` and ${spec.measures.length - 1} more`;
	}
	const g = spec.groupBy?.[0];
	if (g) {
		const dim = src?.fields?.[g.field]?.label ?? g.field;
		text += g.bucket
			? ` by ${BUCKET_LABELS[g.bucket].toLowerCase()} of ${lowerFirst(dim)}`
			: ` by ${dim}`;
		const c = spec.groupBy?.[1];
		if (c) text += ` and ${src?.fields?.[c.field]?.label ?? c.field}`;
	}
	const p = (spec.filters ?? []).find(f => !!f.period);
	if (p?.period === 'CUSTOM') text += `, ${fmtDate(p.from)} to ${fmtDate(p.to)}`;
	else if (p?.period) text += `, ${PERIOD_LABELS[p.period].toLowerCase()}`;
	return text;
}

/** A name for a new report: the plain words without the period. */
export function autoName(spec: ReportSpec, catalog?: ReportCatalog): string {
	const words = describeSpec(spec, catalog).split(', ')[0];
	return words.length > 60 ? words.slice(0, 60) : words;
}

const PREFERRED: ViewType[] = [
	'KPI',
	'BAR',
	'HBAR',
	'LINE',
	'PIE',
	'TABLE',
	'AREA',
	'DOUGHNUT',
	'STACKED_BAR',
	'GROUPED_BAR',
	'SCATTER',
	'GAUGE',
	'LIST',
	'TREEMAP',
	'FUNNEL',
	'HEATMAP',
	'COMBO',
	'CROSSTAB',
];

/** Up to `n` chart types that fit the shape cleanly, the current one always among them. */
export function suggestedViews(shape: ResultShape, current: ViewType, n = 6): ViewType[] {
	const fits = (t: ViewType) => {
		const f = checkView(t, shape);
		return f.ok && !f.reason;
	};
	const order = [...PREFERRED, ...VIEW_TYPES.filter(t => !PREFERRED.includes(t))];
	const out = order.filter(fits).slice(0, n);
	if (!out.includes(current) && checkView(current, shape).ok) {
		if (out.length >= n) out[n - 1] = current;
		else out.push(current);
	}
	return out;
}

/** Sources a simple report can be built on (not lookup only), app data first then the user's. */
export function simpleSources(catalog?: ReportCatalog) {
	return reportSources(catalog);
}
