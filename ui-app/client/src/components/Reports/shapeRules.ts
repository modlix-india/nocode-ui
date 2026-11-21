import {
	ReportCatalog,
	ReportSpec,
	ReportSuccess,
	VIEW_LABELS,
	VIEW_TYPES,
	ViewType,
} from './reportTypes';

/**
 * "Show me": which view types fit a result's shape (CONTRACT section 1, shape rules).
 *
 * KEEP IN STEP: this table mirrors the runner's BAD_VIEW check in nocode-saas-rust
 * (CoreServices.Report.Validate, workstream A). The contract says the UI picker and the
 * runner must agree; when one changes, change the other and CONTRACT.md together.
 *
 * Counting, as read from the contract:
 * - groupBy = `spec.groupBy.length` (a FUNCTION source has none in its spec: its visible
 *   dimension columns in the result are counted instead);
 * - measures = `spec.measures.length + spec.derived.length` (every MEASURE column the result
 *   carries; for a FUNCTION source, its MEASURE columns).
 *
 * Rules:
 * - KPI / GAUGE / BULLET: one row (no group by).
 * - PIE / DOUGHNUT / FUNNEL / LOLLIPOP / BAR / HBAR: exactly one group by.
 * - STACKED_BAR / STACKED_BAR_100 / STACKED_AREA / CROSSTAB: two group bys and one measure.
 * - COMBO / SCATTER: two measures (exactly two).
 * - GROUPED_BAR: not named in the contract's rules; read from plan section 9A as one group by
 *   with two or more measures, or two group bys with one measure.
 * - LINE / SMOOTH_LINE / STEP_LINE / AREA: one group by (a date bucket preferred, any
 *   dimension allowed) or two (the second is the series).
 * - TABLE / LIST: any shape.
 * - HEATMAP (P1b, CONTRACT 8.1): two group bys and one measure.
 * - TREEMAP (P1b): one or two group bys and one measure.
 * - WATERFALL (P1b): one group by and one measure (the running change).
 */

export interface ResultShape {
	groupBy: number;
	measures: number;
	/** The first group by is a date bucket (lines read best over time). */
	firstIsDate?: boolean;
}

export interface ViewFit {
	type: ViewType;
	ok: boolean;
	/** Why it does not fit, in plain words; a hint when it fits but reads poorly. */
	reason?: string;
}

interface Rule {
	groupBy?: number[];
	measures?: number[];
	/** Minimum measure count when `measures` is not an exact list. */
	minMeasures?: number;
	reason: string;
	/** Alternative shape (GROUPED_BAR). */
	or?: { groupBy: number[]; measures: number[] };
}

const ONE_ROW = 'needs a single number: remove the group by';
const ONE_DIM = 'needs exactly one group by';
const TWO_DIMS_ONE_MEASURE = 'needs two group bys and one measure';
const TWO_MEASURES = 'needs exactly two measures';
const LINE_DIMS = 'needs one group by (a date works best) or two';

export const SHAPE_RULES: Record<ViewType, Rule> = {
	KPI: { groupBy: [0], minMeasures: 1, reason: ONE_ROW },
	GAUGE: { groupBy: [0], minMeasures: 1, reason: ONE_ROW },
	BULLET: { groupBy: [0], minMeasures: 1, reason: ONE_ROW },
	PIE: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	DOUGHNUT: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	FUNNEL: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	LOLLIPOP: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	BAR: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	HBAR: { groupBy: [1], minMeasures: 1, reason: ONE_DIM },
	STACKED_BAR: { groupBy: [2], measures: [1], reason: TWO_DIMS_ONE_MEASURE },
	STACKED_BAR_100: { groupBy: [2], measures: [1], reason: TWO_DIMS_ONE_MEASURE },
	STACKED_AREA: { groupBy: [2], measures: [1], reason: TWO_DIMS_ONE_MEASURE },
	CROSSTAB: { groupBy: [2], measures: [1], reason: TWO_DIMS_ONE_MEASURE },
	COMBO: { measures: [2], reason: TWO_MEASURES },
	SCATTER: { measures: [2], reason: TWO_MEASURES },
	GROUPED_BAR: {
		groupBy: [1],
		minMeasures: 2,
		or: { groupBy: [2], measures: [1] },
		reason: 'needs one group by and two measures, or two group bys and one measure',
	},
	LINE: { groupBy: [1, 2], minMeasures: 1, reason: LINE_DIMS },
	SMOOTH_LINE: { groupBy: [1, 2], minMeasures: 1, reason: LINE_DIMS },
	STEP_LINE: { groupBy: [1, 2], minMeasures: 1, reason: LINE_DIMS },
	AREA: { groupBy: [1, 2], minMeasures: 1, reason: LINE_DIMS },
	TABLE: { reason: '' },
	LIST: { reason: '' },
	HEATMAP: { groupBy: [2], measures: [1], reason: TWO_DIMS_ONE_MEASURE },
	TREEMAP: {
		groupBy: [1, 2],
		measures: [1],
		reason: 'needs one or two group bys and one measure',
	},
	WATERFALL: { groupBy: [1], measures: [1], reason: 'needs one group by and one measure' },
};

const LINE_FAMILY = new Set<ViewType>(['LINE', 'SMOOTH_LINE', 'STEP_LINE', 'AREA', 'STACKED_AREA']);

function matches(
	rule: { groupBy?: number[]; measures?: number[]; minMeasures?: number },
	s: ResultShape,
) {
	if (rule.groupBy && !rule.groupBy.includes(s.groupBy)) return false;
	if (rule.measures && !rule.measures.includes(s.measures)) return false;
	if (rule.minMeasures !== undefined && s.measures < rule.minMeasures) return false;
	return true;
}

/** Whether one view type fits a shape, with the reason when it does not. */
export function checkView(type: ViewType, shape: ResultShape): ViewFit {
	const rule = SHAPE_RULES[type];
	if (!rule) return { type, ok: false, reason: 'is not a known view' };
	const ok = matches(rule, shape) || (!!rule.or && matches(rule.or, shape));
	if (!ok) return { type, ok, reason: `${VIEW_LABELS[type]} ${rule.reason}` };
	if (LINE_FAMILY.has(type) && shape.groupBy >= 1 && shape.firstIsDate === false)
		return { type, ok, reason: 'Reads best over a date' };
	return { type, ok };
}

/**
 * Every P1a view type with whether it fits, in picker order. `runner` is the Run output's
 * `fits`: when it has a verdict for a type that verdict wins (the runner's table is the one
 * BAD_VIEW uses); types it does not name fall back to the table above.
 */
export function viewFits(
	shape: ResultShape,
	runner?: Record<string, { ok: boolean; reason?: string }>,
): ViewFit[] {
	return VIEW_TYPES.map(t => fitOf(t, shape, runner));
}

/** One type's verdict: the runner's when it gave one, else this table's. */
export function fitOf(
	type: ViewType,
	shape: ResultShape,
	runner?: Record<string, { ok: boolean; reason?: string }>,
): ViewFit {
	const r = runner?.[type];
	if (r && typeof r.ok === 'boolean') {
		if (!r.ok) return { type, ok: false, reason: r.reason || checkView(type, shape).reason };
		// Keep the UI's "reads best over a date" hint on a type the runner allows.
		const local = checkView(type, shape);
		return { type, ok: true, reason: local.ok ? local.reason : undefined };
	}
	return checkView(type, shape);
}

/** The shape of a spec (and, for a FUNCTION source, of the result it produced). */
export function shapeOf(
	spec: ReportSpec | undefined,
	catalog?: ReportCatalog,
	out?: Pick<ReportSuccess, 'columns'>,
): ResultShape {
	const source = spec ? catalog?.sources?.[spec.source] : undefined;
	const isFunction =
		source?.kind === 'FUNCTION' || (!!spec && !spec.measures?.length && !spec.groupBy?.length);
	if (isFunction && out) {
		const visible = out.columns.filter(c => !c.hidden && !c.key.endsWith('_label'));
		const dims = visible.filter(c => c.kind !== 'MEASURE' && c.key !== 'currency');
		return {
			groupBy: dims.length,
			measures: visible.filter(c => c.kind === 'MEASURE').length,
			firstIsDate: dims[0] ? dims[0].kind === 'DATE' : undefined,
		};
	}
	const groupBy = spec?.groupBy ?? [];
	let firstIsDate: boolean | undefined = undefined;
	if (groupBy[0]) {
		const f = source?.fields?.[groupBy[0].field];
		firstIsDate = !!groupBy[0].bucket || f?.kind === 'DATE';
	}
	return {
		groupBy: groupBy.length,
		measures: (spec?.measures?.length ?? 0) + (spec?.derived?.length ?? 0),
		firstIsDate,
	};
}

/** The best view for a shape when the current one does not fit (editor default). */
export function suggestView(shape: ResultShape): ViewType {
	if (shape.groupBy === 0) return 'KPI';
	if (shape.groupBy === 2) return shape.measures === 1 ? 'STACKED_BAR' : 'TABLE';
	if (shape.firstIsDate) return 'LINE';
	return 'BAR';
}
