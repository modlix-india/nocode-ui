import { formatMeasure, labelOf, toNumber, FormatOptions, currencyOf } from './reportFormat';
import { Axes, chartAxes, CMP_SUFFIX, OTHER_KEY, trendLine } from './reportTransform';
import { ReportColumn, ReportStyle, ReportSuccess, ReportView, ViewType } from './reportTypes';

/**
 * Turns a runner output (after the client transforms) into a chart.js config for every P1a
 * canvas view. Pure, so it is tested without a canvas.
 *
 * Colours come from the theme (`Theme.chart{Scheme}DataColor1..12`, the variables the Chart
 * component paints with) and are passed in already resolved, with the text and grid colours
 * read from the widget's own theme variables. Nothing here names a colour.
 */

export interface ChartTheme {
	palette: string[];
	text: string;
	muted: string;
	grid: string;
	/** The card background, for labels drawn inside coloured marks. */
	surface: string;
	font?: string;
}

export interface ReportChartConfig {
	type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'matrix' | 'treemap';
	data: { labels: string[]; datasets: any[] };
	options: any;
	/** Which lazy plugins and chart types the config needs (Chart/chartjs/lazyPlugins.ts). */
	needs: ChartNeeds;
}

export interface ChartNeeds {
	dataLabels: boolean;
	annotation: boolean;
	zoom?: boolean;
	matrix?: boolean;
	treemap?: boolean;
}

export interface ChartBuildOptions {
	locale?: string;
	/** Catalog default currency. */
	currency?: string;
	/** Smaller fonts, thinner marks (density compact, or a small tile). */
	compact?: boolean;
	/** Zoom and pan on the X axis (time charts, chartjs-plugin-zoom). */
	zoom?: boolean;
	/** The run compared periods: draw `<m>_cmp` as a ghost series named with this label. */
	compareLabel?: string;
}

export function withAlpha(color: string, alpha: number): string {
	const c = (color ?? '').trim();
	const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c);
	if (hex) {
		let h = hex[1];
		if (h.length === 3)
			h = h
				.split('')
				.map(x => x + x)
				.join('');
		const r = Number.parseInt(h.slice(0, 2), 16);
		const g = Number.parseInt(h.slice(2, 4), 16);
		const b = Number.parseInt(h.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(c);
	if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
	return c;
}

/**
 * A palette colour, honouring `style.seriesColors` ({measureOrSeries: paletteIndex}).
 * With `count` (how many series or slices share the chart) the picks are spread across the
 * palette rather than taken side by side: theme palettes run in families (several blues, then
 * reds), so neighbours look alike.
 */
export function colorFor(
	theme: ChartTheme,
	style: ReportStyle | undefined,
	key: string | undefined,
	i: number,
	count?: number,
): string {
	const p = theme.palette.filter(Boolean);
	if (!p.length) return theme.text;
	const pick = key !== undefined ? style?.seriesColors?.[key] : undefined;
	let idx = i;
	if (Number.isFinite(pick)) idx = Number(pick);
	else if (count && count > 1 && count <= p.length) idx = Math.floor((i * p.length) / count);
	return p[((idx % p.length) + p.length) % p.length];
}

/** Long category labels are cut on the axis; the tooltip title keeps the full text. */
export const AXIS_LABEL_MAX = 18;
export function shortLabel(v: any): string {
	const s = v === null || v === undefined ? '' : String(v);
	return s.length > AXIS_LABEL_MAX ? s.slice(0, AXIS_LABEL_MAX - 1) + '\u2026' : s;
}

function num(v: any): number | null {
	const n = toNumber(v);
	return n === undefined ? null : n;
}

function niceCeil(v: number): number {
	if (!Number.isFinite(v) || v <= 0) return 1;
	const p = Math.pow(10, Math.floor(Math.log10(v)));
	for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
	return 10 * p;
}

/** BULLET / GAUGE target: a number, or a measure key read from the (single) row. */
export function targetValue(
	style: ReportStyle | undefined,
	row: Record<string, any> | undefined,
): number | undefined {
	const t = style?.target;
	if (t === undefined || t === null || t === '') return undefined;
	if (typeof t === 'number') return t;
	const asNum = toNumber(t);
	if (asNum !== undefined) return asNum;
	return toNumber(row?.[t]);
}

/** Gauge: the value and the scale end (target, else a round number above the value). */
export function gaugeParts(out: ReportSuccess, view: ReportView) {
	const { ys } = chartAxes(out, view);
	const row = out.rows[0] ?? {};
	const m = ys[0];
	// The runner leaves a null value out of the row: missing is "no value", drawn as empty.
	const raw = m ? toNumber(row[m.key]) : undefined;
	const value = raw ?? 0;
	const target = targetValue(view.style, row);
	const max = target && target > 0 ? Math.max(target, value) : niceCeil(value);
	return { value, max, target, column: m, row, missing: raw === undefined };
}

interface Pivot {
	labels: string[];
	xKeys: string[];
	sKeys: string[];
	sLabels: string[];
	cell: Map<string, Record<string, any>>;
}

function pivot(rows: Array<Record<string, any>>, x: ReportColumn, series: ReportColumn): Pivot {
	const xKeys: string[] = [];
	const xLabel = new Map<string, string>();
	const sKeys: string[] = [];
	const sLabel = new Map<string, string>();
	const cell = new Map<string, Record<string, any>>();
	for (const r of rows) {
		const xk = String(r[x.key]);
		const sk = String(r[series.key]);
		if (!xLabel.has(xk)) {
			xKeys.push(xk);
			xLabel.set(xk, labelOf(r, x.key));
		}
		if (!sLabel.has(sk)) {
			sKeys.push(sk);
			sLabel.set(sk, labelOf(r, series.key));
		}
		cell.set(xk + '\u0000' + sk, r);
	}
	return {
		labels: xKeys.map(k => xLabel.get(k)!),
		xKeys,
		sKeys,
		sLabels: sKeys.map(k => sLabel.get(k)!),
		cell,
	};
}

const BAR_FAMILY = new Set<ViewType>([
	'BAR',
	'HBAR',
	'GROUPED_BAR',
	'STACKED_BAR',
	'STACKED_BAR_100',
	'LOLLIPOP',
	'FUNNEL',
	'COMBO',
	'WATERFALL',
]);
const LINE_FAMILY = new Set<ViewType>(['LINE', 'SMOOTH_LINE', 'STEP_LINE', 'AREA', 'STACKED_AREA']);

function lineDataset(t: ViewType, color: string, style: ReportStyle | undefined, n: number) {
	const area = t === 'AREA' || t === 'STACKED_AREA' || !!style?.fill;
	return {
		type: 'line',
		borderColor: color,
		backgroundColor: area ? withAlpha(color, 0.2) : color,
		fill: area ? (t === 'STACKED_AREA' ? 'stack' : 'origin') : false,
		tension: t === 'SMOOTH_LINE' ? 0.4 : t === 'STEP_LINE' ? 0 : 0.2,
		stepped: t === 'STEP_LINE' ? 'middle' : false,
		pointRadius: n > 40 ? 0 : 3,
		pointHoverRadius: 5,
		borderWidth: 2,
	};
}

function barDataset(color: string, compact: boolean) {
	return {
		type: 'bar',
		backgroundColor: color,
		borderColor: color,
		borderRadius: compact ? 2 : 4,
		maxBarThickness: compact ? 28 : 48,
	};
}

/** Data label placement for chartjs-plugin-datalabels. */
export function dataLabelOptions(
	position: ReportStyle['dataLabels'],
	theme: ChartTheme,
	format: (v: any, ctx: any) => string,
	radial: boolean,
): any {
	if (!position || position === 'off') return { display: false };
	const base = {
		display: 'auto',
		clamp: true,
		font: { size: 11, weight: 600 },
		formatter: (v: any, ctx: any) => {
			// A floating bar (waterfall) is [start, end]: its label is the change.
			const raw = Array.isArray(v)
				? (toNumber(v[1]) ?? 0) - (toNumber(v[0]) ?? 0)
				: v && typeof v === 'object' && 'y' in v
					? v.y
					: v;
			return raw === null || raw === undefined ? '' : format(raw, ctx);
		},
	};
	if (position === 'inside')
		return { ...base, anchor: 'center', align: 'center', color: theme.surface };
	if (position === 'end')
		return { ...base, anchor: 'end', align: 'start', color: theme.surface, offset: 2 };
	return {
		...base,
		anchor: 'end',
		align: radial ? 'end' : 'end',
		offset: radial ? 6 : 2,
		color: theme.text,
	};
}

/** Reference lines for chartjs-plugin-annotation, on the value axis of their measure. */
export function referenceLineAnnotations(
	lines: ReportStyle['referenceLines'],
	theme: ChartTheme,
	valueAxis: string,
	axisOf: (measure?: string) => string,
	format: (v: number, measure?: string) => string,
): Record<string, any> {
	const out: Record<string, any> = {};
	(lines ?? []).forEach((l, i) => {
		const v = toNumber(l?.value);
		if (v === undefined) return;
		const scaleID = l.measure ? axisOf(l.measure) : valueAxis;
		out[`ref${i}`] = {
			type: 'line',
			scaleID,
			value: v,
			borderColor: theme.muted,
			borderWidth: 1.5,
			borderDash: [6, 4],
			label: {
				display: true,
				content: `${l.label ? l.label + ': ' : ''}${format(v, l.measure)}`,
				position: 'end',
				backgroundColor: theme.surface,
				color: theme.text,
				font: { size: 11 },
				padding: 3,
			},
		};
	});
	return out;
}

export function buildChartConfig(
	out: ReportSuccess,
	view: ReportView,
	theme: ChartTheme,
	opts?: ChartBuildOptions,
): ReportChartConfig {
	const t = view.type;
	const style = view.style ?? {};
	const compact = !!opts?.compact || style.density === 'compact';
	const axes: Axes = chartAxes(out, view);
	const { x, ys, series } = axes;
	const rows = out.rows ?? [];
	const fmtOpts: FormatOptions = {
		locale: opts?.locale,
		currency: opts?.currency,
		numberFormat: style.numberFormat,
	};
	const colByKey = new Map(out.columns.map(c => [c.key, c]));
	const fmt = (
		col: ReportColumn | undefined,
		v: any,
		row?: Record<string, any>,
		compactAxis = false,
	) =>
		formatMeasure(
			v,
			col,
			row,
			compactAxis && !style.numberFormat ? { ...fmtOpts, compact: true } : fmtOpts,
		);

	const radial = t === 'PIE' || t === 'DOUGHNUT' || t === 'GAUGE';
	if ((t === 'HEATMAP' || t === 'TREEMAP') && x && ys.length)
		return t === 'HEATMAP'
			? heatmapConfig(out, axes, style, theme, compact, fmt)
			: treemapConfig(out, axes, style, theme, compact, fmt);
	let type: ReportChartConfig['type'] = 'bar';
	if (LINE_FAMILY.has(t)) type = 'line';
	else if (t === 'PIE') type = 'pie';
	else if (t === 'DOUGHNUT' || t === 'GAUGE') type = 'doughnut';
	else if (t === 'SCATTER') type = 'scatter';

	let labels: string[] = [];
	let datasets: any[] = [];
	const needs: ChartNeeds = {
		dataLabels: !!style.dataLabels && style.dataLabels !== 'off',
		annotation: false,
	};

	if (t === 'GAUGE') {
		const g = gaugeParts(out, view);
		datasets = [
			{
				label: g.column?.label ?? g.column?.key ?? '',
				data: [g.value, Math.max(0, g.max - g.value)],
				backgroundColor: [colorFor(theme, style, g.column?.key, 0), theme.grid],
				borderWidth: 0,
				circumference: 180,
				rotation: 270,
				cutout: '72%',
				_column: g.column,
				_rows: [g.row, g.row],
			},
		];
		labels = [g.column?.label ?? '', ''];
		const options = baseOptions(theme, true, compact);
		options.plugins.legend.display = false;
		options.plugins.tooltip = { enabled: false };
		options.plugins.datalabels = { display: false };
		return {
			type,
			data: { labels, datasets },
			options,
			needs: { dataLabels: false, annotation: false },
		};
	}

	if (!ys.length || (!x && t !== 'SCATTER')) {
		return {
			type,
			data: { labels, datasets },
			options: baseOptions(theme, radial, compact),
			needs,
		};
	}

	if (t === 'PIE' || t === 'DOUGHNUT') {
		const m = ys[0];
		labels = rows.map(r => labelOf(r, x!.key));
		datasets = [
			{
				label: m.label ?? m.key,
				data: rows.map(r => num(r[m.key])),
				backgroundColor: rows.map((r, i) =>
					colorFor(theme, style, String(r[x!.key]), i, rows.length),
				),
				borderColor: theme.surface,
				borderWidth: 1,
				_column: m,
				_rows: rows,
				_xKeys: rows.map(r => r[x!.key]),
			},
		];
	} else if (t === 'SCATTER') {
		const [mx, my] = ys;
		const groups = series ? pivot(rows, x ?? series, series) : undefined;
		const point = (r: Record<string, any>) => ({
			x: num(r[mx.key]),
			y: num(r[my?.key ?? mx.key]),
		});
		if (groups && series) {
			datasets = groups.sKeys.map((sk, i) => {
				const rs = rows.filter(r => String(r[series.key]) === sk);
				const c = colorFor(theme, style, sk, i, groups.sKeys.length);
				return {
					label: groups.sLabels[i],
					data: rs.map(point),
					backgroundColor: c,
					borderColor: c,
					pointRadius: compact ? 3 : 5,
					_rows: rs,
					_column: my ?? mx,
				};
			});
		} else {
			const c = colorFor(theme, style, my?.key, 0);
			datasets = [
				{
					label: `${mx.label ?? mx.key} / ${my?.label ?? my?.key ?? ''}`,
					data: rows.map(point),
					backgroundColor: c,
					borderColor: c,
					pointRadius: compact ? 3 : 5,
					_rows: rows,
					_column: my ?? mx,
				},
			];
		}
	} else if (series && (ys.length === 1 || t.startsWith('STACKED') || t === 'GROUPED_BAR')) {
		// Pivot: one dataset per series value, X in first-seen order.
		const m = ys[0];
		const p = pivot(rows, x!, series);
		labels = p.labels;
		let values = p.sKeys.map(sk =>
			p.xKeys.map(xk => {
				const r = p.cell.get(xk + '\u0000' + sk);
				return r ? num(r[m.key]) : null;
			}),
		);
		if (t === 'STACKED_BAR_100') {
			const totals = p.xKeys.map((_, xi) =>
				values.reduce((a, s) => a + Math.abs(s[xi] ?? 0), 0),
			);
			values = values.map(s =>
				s.map((v, xi) => (v === null || !totals[xi] ? null : (100 * v) / totals[xi])),
			);
		}
		datasets = p.sKeys.map((sk, i) => {
			const color = colorFor(theme, style, sk, i, p.sKeys.length);
			const rs = p.xKeys.map(xk => p.cell.get(xk + '\u0000' + sk) ?? { [series.key]: sk });
			const shape =
				type === 'line'
					? lineDataset(t, color, style, labels.length)
					: barDataset(color, compact);
			return {
				...shape,
				label: p.sLabels[i],
				data: values[i],
				_column: t === 'STACKED_BAR_100' ? { ...m, format: 'PERCENT' } : m,
				_rawColumn: m,
				_rows: rs,
				_seriesKey: sk,
				_xKeys: p.xKeys,
			};
		});
	} else if (t === 'WATERFALL') {
		const m = ys[0];
		let acc = 0;
		const ranges: Array<[number, number]> = [];
		const colors: string[] = [];
		const up = colorFor(theme, style, 'increase', 0, 2);
		const down = colorFor(theme, style, 'decrease', 1, 2);
		for (const r of rows) {
			const v = num(r[m.key]) ?? 0;
			ranges.push([acc, acc + v]);
			colors.push(v < 0 ? down : up);
			acc += v;
		}
		const totalRow = { [x!.key]: OTHER_KEY, [`${x!.key}_label`]: 'Total', [m.key]: acc };
		ranges.push([0, acc]);
		colors.push(theme.muted || up);
		labels = [...rows.map(r => labelOf(r, x!.key)), 'Total'];
		datasets = [
			{
				...barDataset(up, compact),
				label: m.label ?? m.key,
				data: ranges,
				backgroundColor: colors,
				borderColor: colors,
				borderSkipped: false,
				_column: m,
				_rows: [...rows, totalRow],
				_xKeys: [...rows.map(r => r[x!.key]), OTHER_KEY],
				_waterfall: true,
			},
		];
	} else {
		let rs = rows;
		if (t === 'FUNNEL')
			rs = [...rows].sort((a, b) => (num(b[ys[0].key]) ?? 0) - (num(a[ys[0].key]) ?? 0));
		labels = rs.map(r => labelOf(r, x!.key));
		const formats = new Set(ys.map(m => m.format ?? 'NUMBER'));
		const twoAxes =
			t === 'COMBO' || (ys.length > 1 && formats.size > 1 && !t.startsWith('STACKED'));
		datasets = ys.map((m, i) => {
			const color = colorFor(theme, style, m.key, i, ys.length);
			const asLine = type === 'line' || (t === 'COMBO' && i > 0);
			let shape: any = asLine
				? lineDataset(type === 'line' ? t : 'LINE', color, style, labels.length)
				: barDataset(color, compact);
			if (t === 'FUNNEL' && i === 0)
				shape = {
					...shape,
					backgroundColor: rs.map((r, j) =>
						colorFor(theme, style, String(r[x!.key]), j, rs.length),
					),
				};
			if (t === 'LOLLIPOP') shape = { ...shape, maxBarThickness: 3, borderRadius: 0 };
			const onSecond =
				twoAxes &&
				i > 0 &&
				(t === 'COMBO' || (m.format ?? 'NUMBER') !== (ys[0].format ?? 'NUMBER'));
			return {
				...shape,
				label: m.label ?? m.key,
				data: rs.map(r => num(r[m.key])),
				_column: m,
				_rows: rs,
				_xKeys: rs.map(r => r[x!.key]),
				...(onSecond ? { yAxisID: 'y1' } : {}),
				// Combo: the line is drawn over the bars. Elsewhere the legend keeps the y order.
				...(t === 'COMBO' ? { order: i > 0 ? 0 : 1 } : {}),
			};
		});
		if (t === 'LOLLIPOP') {
			datasets.push(
				...ys.map((m, i) => {
					const color = colorFor(theme, style, m.key, i, ys.length);
					return {
						type: 'line',
						label: m.label ?? m.key,
						data: rs.map(r => num(r[m.key])),
						showLine: false,
						pointRadius: compact ? 4 : 6,
						pointHoverRadius: 7,
						backgroundColor: color,
						borderColor: color,
						_column: m,
						_rows: rs,
						_xKeys: rs.map(r => r[x!.key]),
						_marker: true,
					};
				}),
			);
		}
	}

	if (opts?.compareLabel && !radial && t !== 'SCATTER' && t !== 'WATERFALL')
		datasets.push(...ghostDatasets(datasets, series, opts.compareLabel, labels.length));

	if (style.trendLine && !radial && t !== 'SCATTER' && datasets[0]) {
		const first = datasets[0];
		datasets.push({
			type: 'line',
			label: `Trend (${first.label})`,
			data: trendLine(first.data),
			borderColor: theme.muted,
			backgroundColor: theme.muted,
			borderDash: [4, 4],
			borderWidth: 1.5,
			pointRadius: 0,
			pointHoverRadius: 0,
			fill: false,
			tension: 0,
			yAxisID: first.yAxisID,
			_column: first._column,
			_trend: true,
			datalabels: { display: false },
		});
	}

	const options = baseOptions(theme, radial, compact);
	// HBAR and FUNNEL lie down by nature; "swap axes" turns any bar or line view over.
	const natural = t === 'HBAR' || t === 'FUNNEL';
	const swappable = (BAR_FAMILY.has(t) || LINE_FAMILY.has(t)) && t !== 'COMBO';
	const horizontal = natural !== (swappable && !!style.swapAxes);
	if (horizontal) options.indexAxis = 'y';

	// Tooltips list every measure of the row, also the ones not drawn.
	const allMeasures = out.columns.filter(c => c.kind === 'MEASURE' && !c.hidden);
	options.plugins.tooltip = {
		callbacks: {
			label: (ctx: any) => {
				const ds = ctx.dataset ?? {};
				const row = ds._rows?.[ctx.dataIndex];
				let raw = t === 'SCATTER' ? ctx.raw?.y : ctx.raw;
				if (Array.isArray(raw)) raw = (toNumber(raw[1]) ?? 0) - (toNumber(raw[0]) ?? 0);
				const v = fmt(ds._column, raw, row);
				if (t === 'STACKED_BAR_100' && ds._rawColumn && row)
					return `${ds.label}: ${v} (${fmt(ds._rawColumn, row[ds._rawColumn.key], row)})`;
				return radial ? `${ctx.label}: ${v}` : `${ds.label}: ${v}`;
			},
			afterBody: (items: any[]) => {
				const first = items?.[0];
				if (!first || series) return [];
				const ds = first.dataset ?? {};
				const row = ds._rows?.[first.dataIndex];
				if (!row) return [];
				const drawn = new Set(
					(first.chart?.data?.datasets ?? [])
						.map((d: any) => d._column?.key)
						.filter(Boolean),
				);
				return allMeasures
					.filter(c => !drawn.has(c.key))
					.map(c => `${c.label ?? c.key}: ${fmt(c, row[c.key], row)}`);
			},
		},
	};

	const legend = style.legend;
	options.plugins.legend.display =
		legend === 'none' ? false : radial || datasets.filter(d => !d._marker).length > 1;
	if (legend && legend !== 'none') options.plugins.legend.position = legend;
	if (t === 'LOLLIPOP')
		options.plugins.legend.labels.filter = (item: any, data: any) =>
			!data.datasets[item.datasetIndex]?._marker;

	const valueAxis = horizontal ? 'x' : 'y';
	const catAxis = horizontal ? 'y' : 'x';
	const firstCol = datasets[0]?._column ?? ys[0];

	if (needs.dataLabels) {
		options.plugins.datalabels = dataLabelOptions(
			style.dataLabels,
			theme,
			(v, ctx) => {
				const ds = ctx?.dataset ?? {};
				if (ds._trend) return '';
				return fmt(ds._column ?? firstCol, v, ds._rows?.[ctx?.dataIndex], true);
			},
			radial,
		);
	} else {
		options.plugins.datalabels = { display: false };
	}

	if (!radial) {
		const grid = style.gridlines ?? 'y';
		const showValueGrid = grid === 'both' || grid === (horizontal ? 'x' : 'y');
		const showCatGrid = grid === 'both' || grid === (horizontal ? 'y' : 'x');
		const stacked = t === 'STACKED_BAR' || t === 'STACKED_BAR_100' || t === 'STACKED_AREA';
		const tickFmt = (col: ReportColumn | undefined) => (v: any) =>
			fmt(
				col,
				v,
				col?.format === 'MONEY' ? { currency: currencyOf(col, rows[0]) } : undefined,
				true,
			);
		const font = { size: compact ? 10 : 12 };
		const catScale: any =
			t === 'SCATTER'
				? {
						type: 'linear',
						ticks: { color: theme.muted, font, callback: tickFmt(ys[0]) },
						grid: { display: showCatGrid, color: theme.grid },
						border: { color: theme.grid },
						...(style.xTitle
							? { title: { display: true, text: style.xTitle, color: theme.muted } }
							: {}),
					}
				: {
						stacked,
						ticks: {
							color: theme.muted,
							font,
							autoSkip: true,
							maxRotation: 45,
							callback(this: any, v: any) {
								return shortLabel(
									this?.getLabelForValue ? this.getLabelForValue(v) : v,
								);
							},
						},
						grid: { display: showCatGrid, color: theme.grid },
						border: { color: theme.grid },
						...(style.xTitle
							? { title: { display: true, text: style.xTitle, color: theme.muted } }
							: {}),
					};
		const valueScale: any = {
			type: style.logScale ? 'logarithmic' : 'linear',
			stacked,
			beginAtZero: style.logScale ? false : style.beginAtZero !== false,
			...(t === 'STACKED_BAR_100' ? { max: 100 } : {}),
			ticks: {
				color: theme.muted,
				font,
				callback: tickFmt(t === 'SCATTER' ? (ys[1] ?? ys[0]) : firstCol),
			},
			grid: { display: showValueGrid, color: theme.grid },
			border: { display: false },
			...(style.yTitle
				? { title: { display: true, text: style.yTitle, color: theme.muted } }
				: {}),
		};
		options.scales = horizontal
			? { [catAxis]: catScale, [valueAxis]: valueScale }
			: { x: catScale, y: valueScale };
		const second = datasets.find(d => d.yAxisID === 'y1' && !d._trend);
		if (second) {
			// The second value axis: on the right of a vertical chart, along the top of a
			// horizontal one (so a count is not flattened against an amount).
			const id = horizontal ? 'x1' : 'y1';
			options.scales[id] = {
				type: style.logScale ? 'logarithmic' : 'linear',
				position: horizontal ? 'top' : 'right',
				beginAtZero: style.logScale ? false : style.beginAtZero !== false,
				ticks: { color: theme.muted, font, callback: tickFmt(second._column) },
				grid: { display: false },
				border: { display: false },
			};
			if (horizontal)
				datasets.forEach(d => {
					if (d.yAxisID === 'y1') d.xAxisID = 'x1';
					delete d.yAxisID;
				});
		}
		const lines = style.referenceLines?.filter(l => toNumber(l?.value) !== undefined) ?? [];
		if (lines.length) {
			needs.annotation = true;
			const axisOf = (measure?: string) => {
				const ds = datasets.find(d => d._column?.key === measure);
				if (ds?.yAxisID === 'y1') return 'y1';
				return ds?.xAxisID === 'x1' ? 'x1' : valueAxis;
			};
			options.plugins.annotation = {
				annotations: referenceLineAnnotations(
					lines,
					theme,
					valueAxis,
					axisOf,
					(v, measure) =>
						fmt(measure ? colByKey.get(measure) : firstCol, v, rows[0], true),
				),
			};
		}
	}

	if (opts?.zoom && !radial && t !== 'SCATTER' && labels.length > 2) {
		needs.zoom = true;
		options.plugins.zoom = zoomOptions(horizontal ? 'y' : 'x');
	}

	return { type, data: { labels, datasets }, options, needs };
}

/**
 * Zoom and pan along the category axis (chartjs-plugin-zoom 2.2): Ctrl + wheel or pinch zooms;
 * pan starts off and is switched on once zoomed (ReportChart), so a finger on a phone still
 * scrolls the page over an unzoomed chart.
 */
export function zoomOptions(mode: 'x' | 'y') {
	return {
		limits: { [mode]: { minRange: 2 } },
		pan: { enabled: false, mode },
		zoom: {
			wheel: { enabled: true, modifierKey: 'ctrl' },
			pinch: { enabled: true },
			mode,
		},
	};
}

/**
 * Compare (CONTRACT 8.3): one ghost series per drawn measure that has `<m>_cmp` values, in a
 * faded version of the measure's colour (dashed for lines), named "<measure> (<period>)".
 * A pivot (one dataset per series value) gets none: twice the series would not read.
 */
export function ghostDatasets(
	datasets: any[],
	series: ReportColumn | undefined,
	compareLabel: string,
	n: number,
): any[] {
	if (series && datasets.some(d => d._seriesKey !== undefined)) return [];
	const out: any[] = [];
	for (const d of datasets) {
		if (d._marker || d._trend || d._ghost || !d._column || !Array.isArray(d._rows)) continue;
		const ck = d._column.key + CMP_SUFFIX;
		if (!d._rows.some((r: any) => r?.[ck] !== undefined)) continue;
		const color = Array.isArray(d.borderColor) ? d.borderColor[0] : d.borderColor;
		const line = d.type === 'line';
		out.push({
			...d,
			label: `${d.label} (${compareLabel.toLowerCase()})`,
			data: d._rows.slice(0, n).map((r: any) => num(r?.[ck])),
			backgroundColor: line ? withAlpha(color, 0.12) : withAlpha(color, 0.3),
			borderColor: withAlpha(color, line ? 0.55 : 0.5),
			...(line ? { borderDash: [5, 4], pointRadius: 0, fill: false } : {}),
			_column: { ...d._column, key: ck },
			_ghost: true,
			datalabels: { display: false },
		});
	}
	return out;
}

type Fmt = (col: ReportColumn | undefined, v: any, row?: Record<string, any>, compactAxis?: boolean) => string;

/** HEATMAP (chartjs-chart-matrix 3.1): X by the first group by, Y by the second, shade by value. */
function heatmapConfig(
	out: ReportSuccess,
	axes: Axes,
	style: ReportStyle,
	theme: ChartTheme,
	compact: boolean,
	fmt: Fmt,
): ReportChartConfig {
	const { x, ys, series } = axes;
	const m = ys[0];
	const rows = out.rows ?? [];
	const ycol = series ?? x!;
	const p = pivot(rows, x!, ycol);
	const max = Math.max(0, ...rows.map(r => Math.abs(num(r[m.key]) ?? 0))) || 1;
	const base = colorFor(theme, style, m.key, 0);
	const font = { size: compact ? 10 : 12 };
	const options = baseOptions(theme, false, compact);
	options.interaction = { mode: 'nearest', intersect: true };
	options.plugins.legend.display = false;
	options.plugins.datalabels = { display: false };
	options.plugins.tooltip = {
		callbacks: {
			title: (items: any[]) => {
				const r = items?.[0]?.dataset?._rows?.[items[0].dataIndex];
				return r ? `${labelOf(r, x!.key)} / ${labelOf(r, ycol.key)}` : '';
			},
			label: (ctx: any) => {
				const r = ctx.dataset?._rows?.[ctx.dataIndex];
				return `${m.label ?? m.key}: ${fmt(m, ctx.raw?.v, r)}`;
			},
		},
	};
	const cat = (labels: string[]) => ({
		type: 'category',
		labels,
		offset: true,
		grid: { display: false },
		border: { display: false },
		ticks: {
			color: theme.muted,
			font,
			callback(this: any, v: any) {
				return shortLabel(this?.getLabelForValue ? this.getLabelForValue(v) : v);
			},
		},
	});
	options.scales = { x: cat(p.labels), y: cat(p.sLabels) };
	return {
		type: 'matrix',
		data: {
			labels: p.labels,
			datasets: [
				{
					label: m.label ?? m.key,
					data: rows.map(r => ({
						x: labelOf(r, x!.key),
						y: labelOf(r, ycol.key),
						v: num(r[m.key]),
					})),
					backgroundColor: (ctx: any) => {
						const v = Math.abs(toNumber(ctx?.raw?.v) ?? 0);
						return withAlpha(base, 0.1 + 0.9 * (v / max));
					},
					borderColor: theme.surface,
					borderWidth: 1,
					width: ({ chart }: any) =>
						Math.max(1, (chart?.chartArea?.width ?? 0) / Math.max(1, p.xKeys.length) - 2),
					height: ({ chart }: any) =>
						Math.max(1, (chart?.chartArea?.height ?? 0) / Math.max(1, p.sKeys.length) - 2),
					_column: m,
					_rows: rows,
					_perRowSeries: !!series,
				},
			],
		},
		options,
		needs: { dataLabels: false, annotation: false, matrix: true },
	};
}

/** TREEMAP (chartjs-chart-treemap 5.0): areas by the measure, nested by the second group by. */
function treemapConfig(
	out: ReportSuccess,
	axes: Axes,
	style: ReportStyle,
	theme: ChartTheme,
	compact: boolean,
	fmt: Fmt,
): ReportChartConfig {
	const { x, ys, series } = axes;
	const m = ys[0];
	const rows = out.rows ?? [];
	const tree: Array<Record<string, any>> = rows.map(r => ({
		...r,
		__g0: labelOf(r, x!.key),
		...(series ? { __g1: labelOf(r, series.key) } : {}),
		__v: Math.max(0, num(r[m.key]) ?? 0),
	}));
	const tops = [...new Set(tree.map(r => r.__g0))];
	const topIndex = new Map(tops.map((g, i) => [g, i]));
	const keyOf = new Map(tree.map(r => [r.__g0, String(r[x!.key])]));
	const colorOf = (g: string) =>
		colorFor(theme, style, keyOf.get(g), topIndex.get(g) ?? 0, tops.length);
	const leafOf = (raw: any): any => {
		const d = raw?._data ?? {};
		return Array.isArray(d.children) && d.children.length ? d.children[0] : d;
	};
	const groupOf = (raw: any): string => {
		const leaf = leafOf(raw);
		return String(leaf?.__g0 ?? raw?.g ?? '');
	};
	const options = baseOptions(theme, true, compact);
	options.plugins.legend.display = false;
	options.plugins.datalabels = { display: false };
	options.plugins.tooltip = {
		callbacks: {
			title: () => '',
			label: (ctx: any) => {
				const raw = ctx.raw ?? {};
				const leaf = leafOf(raw);
				const name = raw.g ?? leaf?.__g1 ?? leaf?.__g0 ?? '';
				return `${name}: ${fmt(m, raw.v, leaf)}`;
			},
		},
	};
	return {
		type: 'treemap',
		data: {
			labels: [],
			datasets: [
				{
					label: m.label ?? m.key,
					data: tree,
					key: '__v',
					groups: series ? ['__g0', '__g1'] : ['__g0'],
					spacing: 1,
					borderWidth: 1,
					borderColor: theme.surface,
					backgroundColor: (ctx: any) => {
						if (ctx?.type !== 'data') return 'transparent';
						const c = colorOf(groupOf(ctx.raw));
						return series && ctx.raw?.l === 0 ? withAlpha(c, 0.35) : c;
					},
					labels: {
						display: true,
						color: theme.surface,
						font: { size: compact ? 10 : 12 },
						overflow: 'fit',
						formatter: (ctx: any) => {
							const raw = ctx?.raw ?? {};
							return [String(raw.g ?? ''), fmt(m, raw.v, leafOf(raw), true)];
						},
					},
					captions: {
						display: !!series,
						color: theme.text,
						font: { size: compact ? 10 : 12, weight: 600 },
					},
					_column: m,
					_rows: tree,
					_treemap: true,
					_leafOf: leafOf,
				},
			],
		},
		options,
		needs: { dataLabels: false, annotation: false, treemap: true },
	};
}

function baseOptions(theme: ChartTheme, radial: boolean, compact: boolean): any {
	return {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 300 },
		color: theme.text,
		font: theme.font ? { family: theme.font } : undefined,
		layout: { padding: compact ? 2 : 6 },
		...(radial ? {} : { interaction: { mode: 'index', intersect: false } }),
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					color: theme.text,
					boxWidth: compact ? 8 : 10,
					boxHeight: compact ? 8 : 10,
					usePointStyle: true,
					font: { size: compact ? 10 : 12 },
				},
			},
		},
	};
}
