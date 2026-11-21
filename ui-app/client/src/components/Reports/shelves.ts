import { cloneSpec } from './reportSpecUtil';
import {
	Bucket,
	CatalogField,
	MeasureFn,
	ReportCatalog,
	ReportFilter,
	ReportGroupBy,
	ReportMeasure,
	ReportSpec,
	SPEC_CAPS,
} from './reportTypes';

/**
 * The shelves editor's model (CONTRACT 8.3, plan 9D): Columns, Rows, Color, Size, Label and
 * Filters over one spec. Every change goes shelves -> spec; opening an editor goes spec ->
 * shelves. Pure, so the mapping is tested.
 *
 * - Columns / Rows hold the X dimension and the measures drawn (Y). The usual way round is the
 *   dimension on Columns and measures on Rows; the other way round (dimension on Rows, measures
 *   on Columns) lies the chart down (`view.style.swapAxes`).
 * - Color: a second dimension, drawn as the series (stacks, groups, lines).
 * - Size: a measure added to the result (tooltips and tables; a treemap's areas), not drawn as
 *   its own series.
 * - Label: data labels on, for the measure on the shelf.
 * - Filters: the spec's filters.
 * Caps: 2 dimensions, 3 measures, 8 filters (the runner's; the editor never sends more).
 */

export type ShelfName = 'columns' | 'rows' | 'color' | 'size' | 'label' | 'filters';
export const SHELF_ORDER: ShelfName[] = ['columns', 'rows', 'color', 'size', 'label', 'filters'];
export const SHELF_LABELS: Record<ShelfName, string> = {
	columns: 'Columns',
	rows: 'Rows',
	color: 'Color',
	size: 'Size',
	label: 'Label',
	filters: 'Filters',
};

/** The field key of "Number of records" (COUNT, no field). */
export const COUNT_FIELD = '__count';

export type ItemKind = 'DIMENSION' | 'DATE' | 'MEASURE';

export interface ShelfItem {
	kind: ItemKind;
	/** Catalog field, or COUNT_FIELD. */
	field: string;
	fn?: MeasureFn;
	bucket?: Bucket;
	segment?: string;
	/** The result key, kept across edits so view.x / view.y / sort keep pointing at it. */
	as?: string;
}

export interface Shelves {
	columns: ShelfItem[];
	rows: ShelfItem[];
	color: ShelfItem[];
	size: ShelfItem[];
	label: ShelfItem[];
	filters: ReportFilter[];
}

export function emptyShelves(): Shelves {
	return { columns: [], rows: [], color: [], size: [], label: [], filters: [] };
}

function uniqueAs(base: string, taken: Set<string>): string {
	const clean = base.replace(/[^A-Za-z0-9_]/g, '_') || 'm';
	let k = clean;
	for (let i = 2; taken.has(k); i++) k = `${clean}_${i}`;
	return k;
}

/** A result key for a measure: `count`, `sum_agreementValue`, ... */
export function measureKey(fn: MeasureFn, field: string | undefined, taken: Set<string>) {
	return uniqueAs(
		fn === 'COUNT' ? 'count' : `${fn.toLowerCase()}_${field && field !== COUNT_FIELD ? field : ''}`,
		taken,
	);
}

/** The shelf item for a catalog field (measures start with their first allowed function). */
export function itemOfField(field: string, f: CatalogField | undefined): ShelfItem {
	if (field === COUNT_FIELD) return { kind: 'MEASURE', field, fn: 'COUNT' };
	if (f?.kind === 'MEASURE') return { kind: 'MEASURE', field, fn: f.fns?.[0] ?? 'SUM' };
	if (f?.kind === 'DATE') return { kind: 'DATE', field, bucket: 'MONTH' };
	return { kind: 'DIMENSION', field };
}

export function isMeasure(i: ShelfItem) {
	return i.kind === 'MEASURE';
}

/** What a shelf takes: Color only dimensions, Size and Label only measures. */
export function accepts(shelf: ShelfName, item: ShelfItem): boolean {
	if (shelf === 'color') return !isMeasure(item);
	if (shelf === 'size' || shelf === 'label') return isMeasure(item);
	return true;
}

function sameMeasure(a: ShelfItem, b: ShelfItem) {
	return (
		a.kind === 'MEASURE' &&
		b.kind === 'MEASURE' &&
		a.field === b.field &&
		(a.fn ?? 'COUNT') === (b.fn ?? 'COUNT') &&
		(a.segment ?? '') === (b.segment ?? '')
	);
}

/** The distinct measures the shelves name (Columns, Rows, then Size, then Label). */
export function shelfMeasures(sh: Shelves): ShelfItem[] {
	const out: ShelfItem[] = [];
	for (const i of [...sh.rows, ...sh.columns, ...sh.size, ...sh.label])
		if (isMeasure(i) && !out.some(o => sameMeasure(o, i))) out.push(i);
	return out;
}

/** The dimensions, X first (Columns, then Rows), then Color. */
export function shelfDimensions(sh: Shelves): ShelfItem[] {
	return [...sh.columns, ...sh.rows, ...sh.color].filter(i => !isMeasure(i));
}

/**
 * Puts an item on a shelf (at `index`, default the end). Color, Size and Label hold one item
 * (a new one replaces it). Refused, with the reason, past 2 dimensions or 3 measures.
 */
export function addToShelf(
	sh: Shelves,
	shelf: Exclude<ShelfName, 'filters'>,
	item: ShelfItem,
	index?: number,
): { ok: true; shelves: Shelves } | { ok: false; reason: string } {
	if (!accepts(shelf, item))
		return {
			ok: false,
			reason: shelf === 'color' ? 'Color takes a dimension' : `${SHELF_LABELS[shelf]} takes a measure`,
		};
	const next: Shelves = { ...sh, [shelf]: [...sh[shelf]] };
	if (shelf === 'color' || shelf === 'size' || shelf === 'label') next[shelf] = [item];
	else {
		const list = next[shelf];
		list.splice(index === undefined ? list.length : Math.max(0, index), 0, item);
	}
	if (shelfDimensions(next).length > SPEC_CAPS.groupBy)
		return { ok: false, reason: `At most ${SPEC_CAPS.groupBy} dimensions` };
	if (shelfMeasures(next).length > SPEC_CAPS.measures)
		return { ok: false, reason: `At most ${SPEC_CAPS.measures} measures` };
	return { ok: true, shelves: next };
}

export function removeFromShelf(sh: Shelves, shelf: ShelfName, index: number): Shelves {
	return { ...sh, [shelf]: (sh[shelf] as any[]).filter((_, i) => i !== index) };
}

/** Moves an item between shelves (or within one); refused like addToShelf. */
export function moveOnShelves(
	sh: Shelves,
	from: { shelf: Exclude<ShelfName, 'filters'>; index: number },
	to: Exclude<ShelfName, 'filters'>,
	index?: number,
): { ok: true; shelves: Shelves } | { ok: false; reason: string } {
	const item = sh[from.shelf][from.index];
	if (!item) return { ok: false, reason: 'Nothing to move' };
	const without = removeFromShelf(sh, from.shelf, from.index);
	const at = from.shelf === to && index !== undefined && index > from.index ? index - 1 : index;
	return addToShelf(without, to, item, at);
}

export function replaceOnShelf(
	sh: Shelves,
	shelf: Exclude<ShelfName, 'filters'>,
	index: number,
	item: ShelfItem,
): Shelves {
	return { ...sh, [shelf]: sh[shelf].map((e, i) => (i === index ? item : e)) };
}

function dimItem(spec: ReportSpec, catalog: ReportCatalog | undefined, g: ReportGroupBy): ShelfItem {
	const f = catalog?.sources?.[spec.source]?.fields?.[g.field];
	const date = !!g.bucket || f?.kind === 'DATE';
	return {
		kind: date ? 'DATE' : 'DIMENSION',
		field: g.field,
		as: g.as,
		...(date ? { bucket: g.bucket ?? 'MONTH' } : {}),
	};
}

function measureItem(m: ReportMeasure): ShelfItem {
	return {
		kind: 'MEASURE',
		field: m.fn === 'COUNT' || !m.field ? COUNT_FIELD : m.field,
		fn: m.fn,
		as: m.as,
		...(m.segment ? { segment: m.segment } : {}),
	};
}

/** Opening a spec in the shelves editor. */
export function specToShelves(spec: ReportSpec, catalog?: ReportCatalog): Shelves {
	const sh = emptyShelves();
	const swap = !!spec.view?.style?.swapAxes;
	const dims = (spec.groupBy ?? []).map(g => dimItem(spec, catalog, g));
	const x = (spec.view?.x && dims.find(d => d.as === spec.view.x)) || dims[0];
	const ms = (spec.measures ?? []).map(measureItem);
	const yKeys = spec.view?.y?.length ? new Set(spec.view.y) : undefined;
	let drawn = yKeys ? ms.filter(m => yKeys.has(m.as!)) : ms;
	let rest = yKeys ? ms.filter(m => !yKeys.has(m.as!)) : [];
	// view.y naming only calculations (a rate): the measures behind it sit on the value shelf.
	if (!drawn.length) {
		drawn = rest;
		rest = [];
	}
	const valueShelf = swap ? sh.columns : sh.rows;
	if (x) (swap ? sh.rows : sh.columns).push(x);
	sh.color = dims.filter(d => d !== x).slice(0, 1);
	valueShelf.push(...drawn);
	const labels = !!spec.view?.style?.dataLabels && spec.view.style.dataLabels !== 'off';
	if (labels) {
		const l = rest.length ? rest.shift() : drawn[0];
		if (l) sh.label = [l];
	}
	if (rest.length) sh.size = [rest.shift()!];
	valueShelf.push(...rest);
	sh.filters = cloneSpec(spec.filters ?? []);
	return sh;
}

/**
 * The spec for the shelves, keeping what the shelves do not hold (source, segment, sort, limit,
 * calculations, compare, view type and the rest of the style). Keys of items that stayed are
 * kept, so view.x / view.y / sort still point at them.
 */
export function shelvesToSpec(sh: Shelves, base: ReportSpec): ReportSpec {
	const next = cloneSpec(base);
	const dims = shelfDimensions(sh).slice(0, SPEC_CAPS.groupBy);
	const ms = shelfMeasures(sh).slice(0, SPEC_CAPS.measures);
	const oldMeasureKeys = new Set((base.measures ?? []).map(m => m.as));

	const takenDims = new Set<string>();
	next.groupBy = dims.map(d => {
		const as = d.as && !takenDims.has(d.as) ? d.as : uniqueAs(d.field, takenDims);
		takenDims.add(as);
		return { field: d.field, as, ...(d.kind === 'DATE' ? { bucket: d.bucket ?? 'MONTH' } : {}) };
	});
	if (!next.groupBy.length) delete next.groupBy;

	const takenMs = new Set<string>([...takenDims]);
	const keys: Array<[ShelfItem, string]> = [];
	next.measures = ms.map(m => {
		const fn: MeasureFn = m.field === COUNT_FIELD ? 'COUNT' : (m.fn ?? 'SUM');
		const as = m.as && !takenMs.has(m.as) ? m.as : measureKey(fn, m.field, takenMs);
		takenMs.add(as);
		keys.push([m, as]);
		return {
			fn,
			...(fn !== 'COUNT' && m.field !== COUNT_FIELD ? { field: m.field } : {}),
			as,
			...(m.segment ? { segment: m.segment } : {}),
		};
	});
	const asOf = (i: ShelfItem) => keys.find(([k]) => sameMeasure(k, i))?.[1];
	if (!next.measures.length) delete next.measures;
	const measureKeys = new Set(next.measures?.map(m => m.as) ?? []);

	// Calculations stay only while both their measures do.
	if (next.derived) {
		next.derived = next.derived.filter(d => {
			const pair = d.ratio ?? d.difference ?? d.percent;
			return !!pair && measureKeys.has(pair[0]) && measureKeys.has(pair[1]);
		});
		if (!next.derived.length) delete next.derived;
	}
	const derivedKeys = new Set((next.derived ?? []).map(d => d.as));

	const view = { ...next.view };
	const style = { ...(view.style ?? {}) };
	// The dimension on Rows (none on Columns) lies the chart down.
	const xOnRows = !sh.columns.some(i => !isMeasure(i)) && sh.rows.some(i => !isMeasure(i));
	if (xOnRows) style.swapAxes = true;
	else delete style.swapAxes;
	if (sh.label.length)
		style.dataLabels =
			style.dataLabels && style.dataLabels !== 'off' ? style.dataLabels : 'outside';
	else delete style.dataLabels;
	if (Object.keys(style).length) view.style = style;
	else delete view.style;

	if (next.groupBy?.[0]) view.x = next.groupBy[0].as;
	else delete view.x;

	const drawn = [
		...new Set(
			[...sh.rows, ...sh.columns]
				.filter(isMeasure)
				.map(asOf)
				.filter((k): k is string => !!k),
		),
	];
	const drawnSet = new Set(drawn);
	let y: string[];
	if (base.view?.y?.length) {
		// Keep the order (and the calculations) the widget showed; drop what left the value
		// shelves; add measures new in this edit.
		y = base.view.y.filter(k => derivedKeys.has(k) || drawnSet.has(k));
		y.push(...drawn.filter(k => !y.includes(k) && !oldMeasureKeys.has(k)));
	} else y = drawn.length < measureKeys.size ? drawn : [];
	if (y.length) view.y = y;
	else delete view.y;
	next.view = view;

	next.filters = sh.filters.slice(0, SPEC_CAPS.filters);
	if (!next.filters.length) delete next.filters;
	return next;
}

/** The filter a field starts with when dropped on Filters. */
export function filterOfField(field: string, f: CatalogField | undefined): ReportFilter {
	if (f?.kind === 'DATE') return { field, period: 'THIS_MONTH' };
	if (f?.kind === 'MEASURE') return { field, op: 'GT', values: [0] };
	return { field, op: 'IN', values: [] };
}

// ---------------------------------------------------------------------------------------------
// Undo / redo for the editing session

export interface History<T> {
	past: T[];
	present: T;
	future: T[];
	/** The last change's group (typing a name is one step, not one per key). */
	group?: string;
}

export const HISTORY_LIMIT = 100;

export function historyInit<T>(present: T): History<T> {
	return { past: [], present, future: [] };
}

function same(a: any, b: any) {
	return JSON.stringify(a) === JSON.stringify(b);
}

/** A new present; with the same `group` as the last change it replaces that step. */
export function historyPush<T>(h: History<T>, next: T, group?: string): History<T> {
	if (same(h.present, next)) return h;
	if (group && h.group === group && h.past.length)
		return { past: h.past, present: next, future: [], group };
	return {
		past: [...h.past, h.present].slice(-HISTORY_LIMIT),
		present: next,
		future: [],
		group,
	};
}

export function historyUndo<T>(h: History<T>): History<T> {
	if (!h.past.length) return h;
	return {
		past: h.past.slice(0, -1),
		present: h.past[h.past.length - 1],
		future: [h.present, ...h.future],
	};
}

export function historyRedo<T>(h: History<T>): History<T> {
	if (!h.future.length) return h;
	return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}

/** Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) redo. */
export function historyKey(e: {
	key: string;
	metaKey?: boolean;
	ctrlKey?: boolean;
	shiftKey?: boolean;
}): 'undo' | 'redo' | undefined {
	if (!e.metaKey && !e.ctrlKey) return undefined;
	const k = e.key.toLowerCase();
	if (k === 'z') return e.shiftKey ? 'redo' : 'undo';
	if (k === 'y' && e.ctrlKey) return 'redo';
	return undefined;
}
