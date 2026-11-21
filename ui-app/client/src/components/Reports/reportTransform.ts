import { dimensionColumns, measureColumns, toNumber } from './reportFormat';
import {
	ADDITIVE_FNS,
	ReportColumn,
	ReportSpec,
	ReportStyle,
	ReportSuccess,
	ReportView,
} from './reportTypes';

/**
 * Client side value transforms from `view.style` (CONTRACT section 1). They change what is
 * drawn, never the query: switching them on and off needs no re-run.
 *
 * Order: top N with "Other" first, then % of total, then running total (so both together
 * give a cumulative share).
 */

export const OTHER_KEY = '__other__';
export const OTHER_LABEL = 'Other';

export interface Axes {
	x?: ReportColumn;
	ys: ReportColumn[];
	series?: ReportColumn;
}

/** X is `view.x`, else the first dimension; Y is `view.y`, else every measure; a second dimension is the series. */
export function chartAxes(out: Pick<ReportSuccess, 'columns'>, view: ReportView | undefined): Axes {
	const dims = dimensionColumns(out);
	const measures = measureColumns(out);
	const byKey = new Map(out.columns.map(c => [c.key, c]));
	const x = (view?.x && byKey.get(view.x)) || dims[0];
	const y = (view?.y ?? [])
		.map(k => byKey.get(k))
		.filter((c): c is ReportColumn => !!c && c.kind === 'MEASURE');
	const ys = y.length ? y : measures;
	const series = dims.find(d => d.key !== x?.key);
	return { x, ys, series };
}

/** Whether a measure's values add up (COUNT and SUM). Unknown measures (function sources) are taken as additive. */
export function isAdditive(spec: ReportSpec | undefined, key: string): boolean {
	const m = spec?.measures?.find(e => e.as === key);
	if (m) return ADDITIVE_FNS.has(m.fn);
	if (spec?.derived?.some(d => d.as === key)) return false;
	return true;
}

function recomputeDerived(spec: ReportSpec | undefined, row: Record<string, any>) {
	for (const d of spec?.derived ?? []) {
		const pair = d.ratio ?? d.difference ?? d.percent;
		if (!pair) continue;
		const a = toNumber(row[pair[0]]);
		const b = toNumber(row[pair[1]]);
		if (a === undefined || b === undefined) {
			row[d.as] = null;
			continue;
		}
		if (d.difference) row[d.as] = a - b;
		else if (b === 0) row[d.as] = null;
		else row[d.as] = d.percent ? (100 * a) / b : a / b;
	}
}

/**
 * Keeps the N largest X values (by the first Y measure, summed across series) and folds the
 * rest into one "Other" X value. Additive measures are summed into Other; derived measures
 * are recomputed from the summed operands; AVG / MIN / MAX have no meaningful Other (null).
 */
export function applyTopN(
	out: ReportSuccess,
	spec: ReportSpec | undefined,
	axes: Axes,
	n: number | undefined,
): ReportSuccess {
	const { x, ys, series } = axes;
	if (!n || n < 1 || !x || !ys.length) return out;
	const by = ys[0].key;
	const totals = new Map<string, number>();
	const order: string[] = [];
	for (const r of out.rows) {
		const k = String(r[x.key]);
		if (!totals.has(k)) order.push(k);
		totals.set(k, (totals.get(k) ?? 0) + (toNumber(r[by]) ?? 0));
	}
	if (order.length <= n) return out;
	const keep = new Set(
		[...order].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0)).slice(0, n),
	);
	const measures = out.columns.filter(c => c.kind === 'MEASURE').map(c => c.key);
	const kept: Array<Record<string, any>> = [];
	const other = new Map<string, Record<string, any>>();
	for (const r of out.rows) {
		if (keep.has(String(r[x.key]))) {
			kept.push(r);
			continue;
		}
		const sk = series ? String(r[series.key]) : '';
		let o = other.get(sk);
		if (!o) {
			o = { [x.key]: OTHER_KEY, [`${x.key}_label`]: OTHER_LABEL };
			if (series) {
				o[series.key] = r[series.key];
				if (r[`${series.key}_label`] !== undefined)
					o[`${series.key}_label`] = r[`${series.key}_label`];
			}
			if (r.currency !== undefined) o.currency = r.currency;
			for (const m of measures)
				o[m] = isAdditive(spec, m) && !m.endsWith(DELTA_SUFFIX) ? 0 : null;
			other.set(sk, o);
		}
		for (const m of measures) if (o[m] !== null) o[m] = (o[m] ?? 0) + (toNumber(r[m]) ?? 0);
	}
	const others = [...other.values()];
	others.forEach(o => recomputeDerived(spec, o));
	return { ...out, rows: [...kept, ...others] };
}

/** Each Y measure as a share of its column total (0 to 100); the column becomes PERCENT. */
export function applyPctOfTotal(out: ReportSuccess, axes: Axes): ReportSuccess {
	const keys = new Set(axes.ys.map(c => c.key));
	if (!keys.size) return out;
	const totals = new Map<string, number>();
	for (const r of out.rows)
		for (const k of keys) totals.set(k, (totals.get(k) ?? 0) + (toNumber(r[k]) ?? 0));
	return {
		...out,
		columns: out.columns.map(c =>
			keys.has(c.key)
				? {
						...c,
						format: 'PERCENT',
						label: `% of ${c.label ?? c.key}`,
						currency: undefined,
					}
				: c,
		),
		rows: out.rows.map(r => {
			const next = { ...r };
			for (const k of keys) {
				const t = totals.get(k) ?? 0;
				const v = toNumber(r[k]);
				next[k] = v === undefined || t === 0 ? null : (100 * v) / t;
			}
			return next;
		}),
	};
}

/** Cumulative sums of each Y measure in row order (per series value when there is one). */
export function applyRunningTotal(out: ReportSuccess, axes: Axes): ReportSuccess {
	const keys = axes.ys.map(c => c.key);
	if (!keys.length) return out;
	const acc = new Map<string, number>();
	return {
		...out,
		columns: out.columns.map(c =>
			keys.includes(c.key) ? { ...c, label: `Running ${c.label ?? c.key}` } : c,
		),
		rows: out.rows.map(r => {
			const sk = axes.series ? String(r[axes.series.key]) : '';
			const next = { ...r };
			for (const k of keys) {
				const id = sk + '\u0000' + k;
				const v = (acc.get(id) ?? 0) + (toNumber(r[k]) ?? 0);
				acc.set(id, v);
				next[k] = v;
			}
			return next;
		}),
	};
}

/** All style transforms, in order. Returns the same object when none applies. */
export function applyStyleTransforms(
	out: ReportSuccess,
	spec: ReportSpec | undefined,
	style: ReportStyle | undefined,
): ReportSuccess {
	if (!style) return out;
	let res = out;
	if (style.topN) res = applyTopN(res, spec, chartAxes(res, spec?.view), style.topN);
	if (style.pctOfTotal) res = applyPctOfTotal(res, chartAxes(res, spec?.view));
	if (style.runningTotal) res = applyRunningTotal(res, chartAxes(res, spec?.view));
	return res;
}

/** Least squares line through the points (index, value); nulls are skipped. */
export function trendLine(values: Array<number | null | undefined>): Array<number | null> {
	const pts: Array<[number, number]> = [];
	values.forEach((v, i) => {
		const n = toNumber(v);
		if (n !== undefined) pts.push([i, n]);
	});
	if (pts.length < 2) return values.map(() => null);
	const len = pts.length;
	const sx = pts.reduce((a, p) => a + p[0], 0);
	const sy = pts.reduce((a, p) => a + p[1], 0);
	const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0);
	const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
	const den = len * sxx - sx * sx;
	if (den === 0) return values.map(() => null);
	const slope = (len * sxy - sx * sy) / den;
	const intercept = (sy - slope * sx) / len;
	return values.map((_, i) => intercept + slope * i);
}

export const CMP_SUFFIX = '_cmp';
export const DELTA_SUFFIX = '_delta_pct';

/**
 * Compare (CONTRACT 8.1): the runner adds `<m>_cmp` and `<m>_delta_pct` to the rows (and maybe
 * columns). Those columns are marked `role: 'compare'` so tables show them but charts and KPI
 * tiles never draw them as measures; a column the runner left out is added when rows hold it.
 * Without compare keys the output comes back unchanged (same object).
 */
export function normalizeCompare(out: ReportSuccess, compareLabel?: string): ReportSuccess {
	const base = out.columns.filter(
		c =>
			c.kind === 'MEASURE' &&
			!c.compareOf &&
			!c.deltaOf &&
			!c.key.endsWith(CMP_SUFFIX) &&
			!c.key.endsWith(DELTA_SUFFIX),
	);
	const byKey = new Map(out.columns.map(c => [c.key, c]));
	const has = (k: string) => out.rows.some(r => r[k] !== undefined) || byKey.has(k);
	const extra: ReportColumn[] = [];
	const marked = new Set<string>();
	const word = compareLabel ? ` (${compareLabel.toLowerCase()})` : ' (before)';
	for (const m of base) {
		const ck = m.key + CMP_SUFFIX;
		const dk = m.key + DELTA_SUFFIX;
		if (has(ck)) {
			marked.add(ck);
			if (!byKey.has(ck))
				extra.push({ ...m, key: ck, label: `${m.label ?? m.key}${word}`, role: 'compare' });
		}
		if (has(dk)) {
			marked.add(dk);
			if (!byKey.has(dk))
				extra.push({
					key: dk,
					label: `${m.label ?? m.key} change`,
					kind: 'MEASURE',
					format: 'PERCENT',
					role: 'compare',
				});
		}
	}
	// Columns the runner tagged count whatever their key.
	for (const c of out.columns) if (c.compareOf || c.deltaOf) marked.add(c.key);
	if (!marked.size) return out;
	const columns = out.columns.map(c =>
		marked.has(c.key) && c.role !== 'compare'
			? {
					...c,
					role: 'compare' as const,
					...(c.deltaOf || c.key.endsWith(DELTA_SUFFIX)
						? { format: c.format ?? 'PERCENT' }
						: {}),
				}
			: c,
	);
	// Each measure followed by its compare columns, so a table reads "now, before, change".
	const ordered: ReportColumn[] = [];
	const all = [...columns, ...extra];
	for (const c of all) {
		if (c.role === 'compare') continue;
		ordered.push(c);
		for (const k of [c.key + CMP_SUFFIX, c.key + DELTA_SUFFIX]) {
			const cc = all.find(e => e.key === k);
			if (cc) ordered.push(cc);
		}
		for (const cc of all)
			if ((cc.compareOf === c.key || cc.deltaOf === c.key) && !ordered.includes(cc))
				ordered.push(cc);
	}
	for (const c of all) if (c.role === 'compare' && !ordered.includes(c)) ordered.push(c);
	return { ...out, columns: ordered };
}

/** A KPI delta: the change in percent and its direction, when the run compared periods. */
export function kpiDelta(
	row: Record<string, any> | undefined,
	key: string,
): { pct: number; dir: 'up' | 'down' | 'flat' } | undefined {
	const v = toNumber(row?.[key + DELTA_SUFFIX]);
	if (v === undefined) return undefined;
	return { pct: v, dir: v > 0 ? 'up' : v < 0 ? 'down' : 'flat' };
}
