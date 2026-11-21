/**
 * The shapes the report components exchange with an app's `reportCatalog` and `reportRun`
 * server functions (CXZ-1780 CONTRACT.md sections 1 to 3). The runner (CoreServices.Report.Run)
 * owns validation; these types only describe what the UI reads and writes.
 */

/** P1a view types, in the order the "Show me" picker lists them (CONTRACT section 1). */
export const VIEW_TYPES = [
	'KPI',
	'GAUGE',
	'BULLET',
	'TABLE',
	'LIST',
	'CROSSTAB',
	'BAR',
	'HBAR',
	'GROUPED_BAR',
	'STACKED_BAR',
	'STACKED_BAR_100',
	'LOLLIPOP',
	'FUNNEL',
	'LINE',
	'SMOOTH_LINE',
	'STEP_LINE',
	'AREA',
	'STACKED_AREA',
	'COMBO',
	'SCATTER',
	'PIE',
	'DOUGHNUT',
] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

export const VIEW_LABELS: Record<ViewType, string> = {
	KPI: 'Number',
	GAUGE: 'Gauge',
	BULLET: 'Bullet',
	TABLE: 'Table',
	LIST: 'List',
	CROSSTAB: 'Crosstab',
	BAR: 'Column',
	HBAR: 'Bar',
	GROUPED_BAR: 'Grouped columns',
	STACKED_BAR: 'Stacked columns',
	STACKED_BAR_100: '100% stacked',
	LOLLIPOP: 'Lollipop',
	FUNNEL: 'Funnel',
	LINE: 'Line',
	SMOOTH_LINE: 'Smooth line',
	STEP_LINE: 'Step line',
	AREA: 'Area',
	STACKED_AREA: 'Stacked area',
	COMBO: 'Column and line',
	SCATTER: 'Scatter',
	PIE: 'Pie',
	DOUGHNUT: 'Donut',
};

/** Views drawn on a canvas by chart.js (PNG download, click menu, legend). */
export const CANVAS_VIEWS = new Set<ViewType>([
	'GAUGE',
	'BAR',
	'HBAR',
	'GROUPED_BAR',
	'STACKED_BAR',
	'STACKED_BAR_100',
	'LOLLIPOP',
	'FUNNEL',
	'LINE',
	'SMOOTH_LINE',
	'STEP_LINE',
	'AREA',
	'STACKED_AREA',
	'COMBO',
	'SCATTER',
	'PIE',
	'DOUGHNUT',
]);

export const RADIAL_VIEWS = new Set<ViewType>(['PIE', 'DOUGHNUT', 'GAUGE']);

export type MeasureFn = 'COUNT' | 'COUNT_DISTINCT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
export const MEASURE_FNS: MeasureFn[] = ['COUNT', 'COUNT_DISTINCT', 'SUM', 'AVG', 'MIN', 'MAX'];
export const MEASURE_FN_LABELS: Record<MeasureFn, string> = {
	COUNT: 'Count',
	COUNT_DISTINCT: 'Count distinct',
	SUM: 'Sum',
	AVG: 'Average',
	MIN: 'Minimum',
	MAX: 'Maximum',
};
/** Functions whose values add up across groups ("Other", running totals, % of total). */
export const ADDITIVE_FNS = new Set<MeasureFn>(['COUNT', 'SUM']);

export type Bucket = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
/** Coarse to fine: the date drill order (CONTRACT section 1, `view.drill`). */
export const DRILL_LEVELS: Bucket[] = ['YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY'];
export const BUCKET_LABELS: Record<Bucket, string> = {
	DAY: 'Day',
	WEEK: 'Week',
	MONTH: 'Month',
	QUARTER: 'Quarter',
	YEAR: 'Year',
};

export const PERIODS = [
	'TODAY',
	'YESTERDAY',
	'THIS_WEEK',
	'THIS_MONTH',
	'LAST_MONTH',
	'LAST_7_DAYS',
	'LAST_30_DAYS',
	'LAST_90_DAYS',
	'THIS_QUARTER',
	'LAST_QUARTER',
	'THIS_FY',
	'LAST_FY',
	'LAST_12_MONTHS',
	'ALL_TIME',
	'CUSTOM',
] as const;
export type Period = (typeof PERIODS)[number];
export const PERIOD_LABELS: Record<Period, string> = {
	TODAY: 'Today',
	YESTERDAY: 'Yesterday',
	THIS_WEEK: 'This week',
	THIS_MONTH: 'This month',
	LAST_MONTH: 'Last month',
	LAST_7_DAYS: 'Last 7 days',
	LAST_30_DAYS: 'Last 30 days',
	LAST_90_DAYS: 'Last 90 days',
	THIS_QUARTER: 'This quarter',
	LAST_QUARTER: 'Last quarter',
	THIS_FY: 'This financial year',
	LAST_FY: 'Last financial year',
	LAST_12_MONTHS: 'Last 12 months',
	ALL_TIME: 'All time',
	CUSTOM: 'Custom dates',
};

export const FILTER_OPS = [
	'EQ',
	'NE',
	'IN',
	'NOT_IN',
	'GT',
	'GTE',
	'LT',
	'LTE',
	'BETWEEN',
	'IS_NULL',
	'NOT_NULL',
] as const;
export type FilterOp = (typeof FILTER_OPS)[number];
export const FILTER_OP_LABELS: Record<FilterOp, string> = {
	EQ: 'is',
	NE: 'is not',
	IN: 'is one of',
	NOT_IN: 'is none of',
	GT: 'more than',
	GTE: 'at least',
	LT: 'less than',
	LTE: 'at most',
	BETWEEN: 'between',
	IS_NULL: 'is empty',
	NOT_NULL: 'is not empty',
};

/** Spec caps the runner enforces; the editor enforces them too so a user never meets TOO_MANY. */
export const SPEC_CAPS = { measures: 3, groupBy: 2, filters: 8 };

export interface ReportMeasure {
	fn: MeasureFn;
	field?: string;
	as: string;
	/** A conditional measure: only the records of this segment (e.g. converted EOIs). */
	segment?: string;
}

export interface ReportDerived {
	as: string;
	ratio?: [string, string];
	difference?: [string, string];
	percent?: [string, string];
}

export interface ReportGroupBy {
	field: string;
	as: string;
	bucket?: Bucket;
	fy?: boolean;
}

export interface ReportFilter {
	field: string;
	op?: FilterOp;
	values?: any[];
	period?: Period;
	from?: string;
	to?: string;
}

export interface NumberFormatStyle {
	style?: 'compact' | 'full' | 'percent';
	decimals?: number;
}

export interface ReferenceLine {
	value: number;
	label?: string;
	measure?: string;
}

/** `view.style` (CONTRACT section 1): theme first, named choices only, never CSS. */
export interface ReportStyle {
	palette?: string;
	seriesColors?: Record<string, number>;
	dataLabels?: 'off' | 'inside' | 'outside' | 'end';
	legend?: 'top' | 'bottom' | 'left' | 'right' | 'none';
	xTitle?: string;
	yTitle?: string;
	beginAtZero?: boolean;
	logScale?: boolean;
	gridlines?: 'both' | 'x' | 'y' | 'none';
	numberFormat?: NumberFormatStyle;
	topN?: number;
	pctOfTotal?: boolean;
	runningTotal?: boolean;
	referenceLines?: ReferenceLine[];
	trendLine?: boolean;
	fill?: boolean;
	swapAxes?: boolean;
	density?: 'comfortable' | 'compact';
	target?: number | string;
}

export interface ReportDrill {
	field: string;
	level: Bucket;
}

export interface ReportView {
	type: ViewType;
	x?: string;
	y?: string[];
	title?: string;
	style?: ReportStyle;
	drill?: ReportDrill;
}

export interface ReportSpec {
	v: 1;
	source: string;
	segment?: string;
	measures?: ReportMeasure[];
	derived?: ReportDerived[];
	groupBy?: ReportGroupBy[];
	filters?: ReportFilter[];
	sort?: Array<{ by: string; dir: 'ASC' | 'DESC' }>;
	limit?: number;
	params?: Record<string, any>;
	view: ReportView;
}

export type ColumnFormat = 'NUMBER' | 'MONEY' | 'PERCENT' | 'DATE' | 'TEXT' | string;

export interface ReportColumn {
	key: string;
	label?: string;
	kind?: 'DIMENSION' | 'DATE' | 'MEASURE' | string;
	format?: ColumnFormat;
	currency?: string;
	hidden?: boolean;
}

export interface ReportPeriod {
	from?: string;
	to?: string;
	label?: string;
}

export interface ReportSuccess {
	ok: true;
	columns: ReportColumn[];
	rows: Array<Record<string, any>>;
	truncated?: boolean;
	period?: ReportPeriod;
	refreshedAt?: string;
	cached?: boolean;
	/**
	 * The runner's "Show me" verdict per view type for this result (CoreServices.Report.Run,
	 * shape.rs). Preferred over the UI's own table when present.
	 */
	fits?: Record<string, { ok: boolean; reason?: string }>;
}

export interface ReportErrorBody {
	code: string;
	message?: string;
	path?: string;
}

export interface ReportError {
	ok: false;
	error: ReportErrorBody;
}

export type ReportOutput = ReportSuccess | ReportError;

export interface CatalogField {
	kind: 'DIMENSION' | 'DATE' | 'MEASURE';
	label?: string;
	fns?: MeasureFn[];
	format?: ColumnFormat;
	currencyField?: string;
	/** A fixed currency for a money field (instead of `currencyField`). */
	currency?: string;
	pii?: boolean;
	authority?: string;
	stringDate?: boolean;
	lookup?: { source?: string; key?: string; label?: string; type?: string };
}

export interface CatalogSource {
	kind: 'STORAGE' | 'FUNCTION';
	label?: string;
	storage?: string;
	function?: string;
	scope?: string;
	authority?: string;
	fields?: Record<string, CatalogField>;
	segments?: Record<string, { label?: string; condition?: any }>;
	columns?: Record<string, any>;
	resultPath?: string;
	/** FUNCTION sources: default params, and the ones a spec (or a dashboard filter) may set. */
	params?: Record<string, any>;
	allowedParams?: string[];
	/** Only there to resolve labels for other sources: never offered as report data. */
	lookupOnly?: boolean;
}

export interface CatalogDefault {
	id: string;
	name: string;
	spec: ReportSpec;
	authorityAny?: string[];
	authorityAll?: string[];
	layout?: { w?: number; h?: number };
	refreshMin?: number;
}

export interface ReportCatalog {
	v?: number;
	app?: string;
	timeZone?: string;
	locale?: string;
	/** Default currency for money values the runner did not name one for. */
	currency?: string;
	fyStartMonth?: number;
	ai?: boolean;
	quickFilters?: string[];
	sources: Record<string, CatalogSource>;
	defaults?: CatalogDefault[];
}

/** One saved widget in the personalization document (CONTRACT section 5). */
export interface SavedWidget {
	name: string;
	/** For an unedited default this is a snapshot only: the catalog's current spec is used. */
	spec: ReportSpec;
	refreshMin?: number;
	/** The catalog default this widget follows (by reference until edited). */
	defaultId?: string;
	/** Set once the user changed a default's spec or name: it is their own widget from then on. */
	edited?: boolean;
}

export interface LayoutItem {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	/** A default shipped after this dashboard was set up: "New" badge with Keep / Remove. */
	isNew?: boolean;
}

/** `reports_<name>` personalization document (CONTRACT section 5). */
export interface DashboardDoc {
	widgets: Record<string, SavedWidget>;
	layout: LayoutItem[];
	seenDefaults: string[];
}

/** Caps on the personalization document (CONTRACT section 5). */
export const DASHBOARD_CAPS = { onDashboard: 24, saved: 100 };

/** Auto refresh choices in minutes; 0 is off (the default). */
export const REFRESH_CHOICES = [0, 5, 15, 30, 60];

/** A filter the dashboard or an explore click adds for this session only (never saved). */
export interface SessionFilter extends ReportFilter {
	/** Plain words for the chip: "Project is Tower A". */
	label?: string;
}

/** The dashboard filter bar's state, applied to every widget for the session. */
export interface DashboardFilters {
	period?: Period;
	from?: string;
	to?: string;
	quick?: Record<string, any[]>;
}
