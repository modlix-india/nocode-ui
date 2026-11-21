import { formatMeasure, labelOf, toNumber, FormatOptions, currencyOf } from './reportFormat';
import { Axes, chartAxes, trendLine } from './reportTransform';
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
	type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
	data: { labels: string[]; datasets: any[] };
	options: any;
	/** Which lazy plugins the config needs (Chart/chartjs/lazyPlugins.ts). */
	needs: { dataLabels: boolean; annotation: boolean };
}

export interface ChartBuildOptions {
	locale?: string;
	/** Catalog default currency. */
	currency?: string;
	/** Smaller fonts, thinner marks (density compact, or a small tile). */
	compact?: boolean;
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
			const raw = v && typeof v === 'object' && 'y' in v ? v.y : v;
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
	let type: ReportChartConfig['type'] = 'bar';
	if (LINE_FAMILY.has(t)) type = 'line';
	else if (t === 'PIE') type = 'pie';
	else if (t === 'DOUGHNUT' || t === 'GAUGE') type = 'doughnut';
	else if (t === 'SCATTER') type = 'scatter';

	let labels: string[] = [];
	let datasets: any[] = [];
	const needs = {
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
				const raw = t === 'SCATTER' ? ctx.raw?.y : ctx.raw;
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

	return { type, data: { labels, datasets }, options, needs };
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
