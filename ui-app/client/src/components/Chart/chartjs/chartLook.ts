import type { Chart as ChartJS, Plugin } from 'chart.js';

/**
 * Opt-in chart looks (`chartLook`) and the "now" marker / callout tags.
 *
 * - `dotMatrix`: every bar becomes a column of round dots on a faint dot lattice. Projected
 *   points (after `projectedFrom`, or a whole data set in `projectedDataSets`) are hollow.
 * - `isometric`: every bar becomes an extruded prism (lit front, shaded side, top face);
 *   projected ones are outlined and hatched.
 * - `wave`: every data set becomes its own ridge (a ridgeline chart): smooth line, faint fill,
 *   its own baseline row, labelled on the left with its name and total. Projected parts dotted.
 * - `nowMarker`: a dotted vertical line at an x with a small rounded tag at the top.
 * - `callouts`: small tags (a coloured dot and mono text) pointing at a value.
 *
 * Nothing here runs unless one of those properties is set: `applyLookToData` and
 * `applyLookToOptions` hand back the very objects they were given, and the plugin (registered
 * once, like the gradient plugin) returns at once for a chart whose options carry no look.
 * Every colour comes from the theme chart palette and chart text colour; the plugin itself
 * holds no colour of its own.
 */

export type ChartLook = 'default' | 'dotMatrix' | 'isometric' | 'wave';

export interface ChartNowMarker {
	/** The x: a label, or a position (0 based) when the labels do not contain it. */
	value: number | string;
	label?: string;
}

export interface ChartCallout {
	/** The x: a label, or a position (0 based). */
	x: number | string;
	label: string;
	/** The data set (1 for the first) whose value the tag points at. Empty: the top of the stack. */
	dataSet?: number;
	/** Theme chart palette position (1 to 12) for the dot. Empty: the data set's own colour. */
	paletteIndex?: number;
}

export interface ChartLookProperties {
	chartLook?: ChartLook | string;
	/** The x from which points count as projected (hollow / hatched / dotted). */
	projectedFrom?: number | string;
	/** Data set positions (1 for the first, comma separated) drawn as projected throughout. */
	projectedDataSets?: string | number;
	nowMarker?: ChartNowMarker;
	callouts?: ChartCallout[];
	/** Horizontal bars: the looks are drawn for vertical charts only, so they fall back. */
	invertAxis?: boolean;
}

export interface LookTheme {
	/** Theme.chart{Scheme}DataColor1..12 */
	palette: string[];
	/** Chart text colour (Theme.chartFontColor or the component's colour). */
	textColor?: string;
	/** Grid line colour from the theme, for the lattice and ridge baselines. */
	gridColor?: string;
	/** Axis colour from the theme. */
	axisColor?: string;
}

/** What the plugin reads from `options.plugins.chartLook`. */
export interface LookPluginOptions {
	look: ChartLook;
	projectedFromIndex?: number;
	projectedDataSets: number[];
	nowIndex?: number;
	nowLabel?: string;
	callouts: Array<{ index: number; label: string; dataSet?: number; color?: string }>;
	textColor: string;
	gridColor: string;
	axisColor: string;
}

const LOOKS: ChartLook[] = ['dotMatrix', 'isometric', 'wave'];
const MONO =
	'600 10.5px ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Consolas, monospace';
const MONO_SMALL =
	'500 9.5px ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Consolas, monospace';
/** Ridge height as a share of a row: above 1 the peaks rise into the row above. */
const WAVE_AMPLITUDE = 1.2;
const WAVE_LABEL_WIDTH = 120;

export function lookOf(p: ChartLookProperties | undefined): ChartLook {
	const l = p?.chartLook as ChartLook;
	return LOOKS.includes(l) ? l : 'default';
}

/**
 * The look actually drawn for this chart. The looks need a vertical chart with an x axis:
 * a horizontal, radial, radar or map chart keeps its normal drawing.
 */
export function effectiveLook(p: ChartLookProperties | undefined, chartJsType: string): ChartLook {
	const look = lookOf(p);
	if (look === 'default' || p?.invertAxis) return 'default';
	if (look === 'wave') return chartJsType === 'bar' || chartJsType === 'line' ? look : 'default';
	return chartJsType === 'bar' ? look : 'default';
}

function validCallouts(c: any): ChartCallout[] {
	if (!Array.isArray(c)) return [];
	return c.filter(e => e && e.x !== undefined && e.x !== null && e.x !== '' && e.label);
}

function hasNow(p: ChartLookProperties | undefined): boolean {
	const v = p?.nowMarker?.value;
	return v !== undefined && v !== null && v !== '';
}

/** True when any look property is set; false means every function here is a no-op. */
export function lookWanted(p: ChartLookProperties | undefined): boolean {
	return lookOf(p) !== 'default' || hasNow(p) || validCallouts(p?.callouts).length > 0;
}

/** A label or a 0 based position, as a position into `labels`. */
export function resolveIndex(x: any, labels: any[] | undefined): number | undefined {
	if (x === undefined || x === null || x === '') return undefined;
	if (Array.isArray(labels)) {
		const at = labels.findIndex(l => l === x || String(l) === String(x));
		if (at >= 0) return at;
	}
	const n = Number(x);
	return Number.isFinite(n) ? Math.round(n) : undefined;
}

export function parsePositions(v: any): number[] {
	if (v === undefined || v === null || v === '') return [];
	return String(v)
		.split(',')
		.map(s => Number(s.trim()))
		.filter(n => Number.isInteger(n) && n >= 1)
		.map(n => n - 1);
}

// ---------------------------------------------------------------- colour helpers

export function parseColor(c: any): [number, number, number, number] | undefined {
	if (typeof c !== 'string') return undefined;
	const s = c.trim();
	if (s.startsWith('#')) {
		let h = s.slice(1);
		if (h.length === 3 || h.length === 4) h = [...h].map(ch => ch + ch).join('');
		if (h.length !== 6 && h.length !== 8) return undefined;
		const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
		if ([0, 2, 4].some(i => Number.isNaN(n(i)))) return undefined;
		return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
	}
	const m = /^rgba?\(([^)]+)\)$/i.exec(s);
	if (m) {
		const parts = m[1]
			.split(/[\s,/]+/)
			.filter(Boolean)
			.map(Number);
		if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return undefined;
		return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
	}
	return undefined;
}

/** The colour at an alpha; a colour that cannot be parsed comes back as it is. */
export function withAlpha(c: string, a: number): string {
	const p = parseColor(c);
	if (!p) return c;
	return `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${+(p[3] * a).toFixed(3)})`;
}

/** Whether a colour is dark (so text drawn on it should be light). Unknown: dark. */
export function isDark(c: string | undefined): boolean {
	const p = parseColor(c);
	if (!p) return true;
	const lum = (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
	return lum < 0.55;
}

/** A neutral to draw on top of a colour: white on dark, black on light. Not a hue. */
function onColor(c: string): string {
	return isDark(c) ? '#FFFFFF' : '#000000';
}

/** The colour a data set paints at a point, before the look hid it. */
function colorAt(ds: any, i: number, fallback: string): string {
	const pick = (v: any) => (Array.isArray(v) ? v[i % Math.max(v.length, 1)] : v);
	const c = pick(ds.lookColor) ?? pick(ds.backgroundColor) ?? pick(ds.borderColor);
	if (typeof c !== 'string' || c.startsWith('url(') || c === 'transparent') return fallback;
	return c;
}

function numberAt(v: any): number {
	const raw = v && typeof v === 'object' && !Array.isArray(v) ? v.y : v;
	const n = Number(raw);
	return Number.isFinite(n) ? n : 0;
}

// ---------------------------------------------------------------- data

const HIDDEN = 'rgba(0, 0, 0, 0)';

/**
 * The chart data reshaped for the look. Default look: the same object.
 * dotMatrix / isometric hide the bars (they still lay out, hover and click) and keep their
 * colours in `lookColor` for the plugin. wave turns every data set into a ridge row.
 */
export function applyLookToData(
	data: any,
	p: ChartLookProperties | undefined,
	theme: LookTheme,
	chartJsType: string,
): any {
	const look = effectiveLook(p, chartJsType);
	if (look === 'default' || !data?.datasets) return data;
	const palette = theme.palette ?? [];
	const fb = (i: number) => palette[i % 12] || theme.textColor || '#888888';

	if (look === 'dotMatrix' || look === 'isometric') {
		return {
			...data,
			datasets: data.datasets.map((ds: any, di: number) => {
				if (ds.type && ds.type !== 'bar') return ds;
				const n = Array.isArray(ds.data) ? ds.data.length : 0;
				const lookColor = Array.from({ length: Math.max(n, 1) }, (_, i) =>
					colorAt(ds, i, fb(di)),
				);
				return {
					...ds,
					lookColor,
					backgroundColor: HIDDEN,
					borderColor: HIDDEN,
					hoverBackgroundColor: HIDDEN,
					hoverBorderColor: HIDDEN,
					borderWidth: 0,
				};
			}),
		};
	}

	// wave: one ridge per data set, the first on top.
	const labels = data.labels;
	const projectedSets = new Set(parsePositions(p?.projectedDataSets));
	const fromIdx = projectedFromIndex(p, labels);
	const rows = data.datasets.length;
	return {
		...data,
		datasets: data.datasets.map((ds: any, di: number) => {
			const raw = (Array.isArray(ds.data) ? ds.data : []).map(numberAt);
			const max = Math.max(...raw.map(Math.abs), 0) || 1;
			const base = rows - 1 - di;
			const color = colorAt(ds, 0, fb(di));
			const whole = projectedSets.has(di);
			const dashed = (i: number) => whole || (fromIdx !== undefined && i >= fromIdx);
			const shaped = (Array.isArray(ds.data) ? ds.data : []).map((v: any, i: number) => {
				const y = base + (raw[i] / max) * WAVE_AMPLITUDE;
				return v && typeof v === 'object' && !Array.isArray(v) ? { ...v, y } : y;
			});
			return {
				...ds,
				type: 'line',
				data: shaped,
				lookRaw: raw,
				lookBase: base,
				lookColor: color,
				borderColor: color,
				backgroundColor: withAlpha(color, 0.07),
				borderWidth: 1.5,
				fill: { value: base },
				tension: 0.4,
				cubicInterpolationMode: 'monotone',
				pointRadius: 0,
				pointHoverRadius: 3,
				pointHitRadius: 8,
				pointBackgroundColor: color,
				pointBorderColor: color,
				pointHoverBackgroundColor: color,
				pointHoverBorderColor: color,
				stack: undefined,
				yAxisID: 'y',
				segment: {
					borderDash: (ctx: any) => (dashed(ctx.p1DataIndex) ? [2, 3] : undefined),
					backgroundColor: (ctx: any) =>
						dashed(ctx.p1DataIndex) ? HIDDEN : withAlpha(color, 0.07),
				},
			};
		}),
	};
}

function projectedFromIndex(p: ChartLookProperties | undefined, labels: any[]): number | undefined {
	const explicit = resolveIndex(p?.projectedFrom, labels);
	if (explicit !== undefined) return explicit;
	// With a now marker and no explicit start, everything after "now" is projected.
	const now = hasNow(p) ? resolveIndex(p!.nowMarker!.value, labels) : undefined;
	return now === undefined ? undefined : now + 1;
}

// ---------------------------------------------------------------- options

/** The options with the look merged in; the same object when no look property is set. */
export function applyLookToOptions(
	options: any,
	p: ChartLookProperties | undefined,
	theme: LookTheme,
	labels: any[] | undefined,
	chartJsType: string,
): any {
	if (!lookWanted(p)) return options;
	const look = effectiveLook(p, chartJsType);
	const textColor = theme.textColor || theme.axisColor || theme.palette?.[0] || '#888888';
	const gridColor = theme.gridColor || withAlpha(textColor, 0.18);
	const axisColor = theme.axisColor || textColor;
	const nowIndex = hasNow(p) ? resolveIndex(p!.nowMarker!.value, labels) : undefined;

	const lookOptions: LookPluginOptions = {
		look,
		projectedFromIndex: projectedFromIndex(p, labels ?? []),
		projectedDataSets: parsePositions(p?.projectedDataSets),
		nowIndex,
		nowLabel: p?.nowMarker?.label,
		callouts: validCallouts(p?.callouts)
			.map(c => {
				const idx = Number(c.paletteIndex);
				return {
					index: resolveIndex(c.x, labels)!,
					label: String(c.label),
					dataSet: parsePositions(c.dataSet)[0],
					color:
						Number.isFinite(idx) && idx >= 1 && theme.palette?.[idx - 1]
							? theme.palette[idx - 1]
							: undefined,
				};
			})
			.filter(c => c.index !== undefined),
		textColor,
		gridColor,
		axisColor,
	};

	const next: any = {
		...options,
		plugins: { ...(options?.plugins ?? {}), chartLook: lookOptions },
	};
	const scales: any = { ...(options?.scales ?? {}) };
	const quiet = (s: any) => ({ ...(s ?? {}), grid: { ...(s?.grid ?? {}), display: false } });

	if (look === 'dotMatrix' || look === 'isometric') {
		scales.x = quiet(scales.x);
		scales.y = quiet(scales.y);
		if (scales.y1) scales.y1 = quiet(scales.y1);
		next.scales = scales;
	} else if (look === 'wave') {
		scales.x = quiet(scales.x);
		scales.y = {
			...quiet(scales.y),
			display: false,
			stacked: false,
			min: -0.15,
			max: undefined,
			suggestedMax: undefined,
		};
		delete scales.y1;
		next.scales = scales;
		const tooltip = options?.plugins?.tooltip ?? {};
		const existing = tooltip.callbacks?.label;
		next.plugins.tooltip = {
			...tooltip,
			callbacks: {
				...(tooltip.callbacks ?? {}),
				// The drawn value is the row position; the tooltip shows the real one, through
				// the chart's own label callback when it has one.
				label: (ctx: any) => {
					const v = ctx.dataset?.lookRaw?.[ctx.dataIndex];
					if (typeof existing === 'function')
						return existing({
							...ctx,
							raw: v,
							parsed: { ...(ctx.parsed ?? {}), y: v },
							formattedValue: String(v ?? ''),
						});
					return `${ctx.dataset?.label ?? ''}: ${v ?? ''}`;
				},
			},
		};
		next.plugins.legend = { ...(options?.plugins?.legend ?? {}), display: false };
	}

	const pad = { ...padOf(options?.layout?.padding) };
	if (look === 'wave') pad.left += WAVE_LABEL_WIDTH;
	if (nowIndex !== undefined || lookOptions.callouts.length) pad.top += 24;
	if (look === 'isometric') pad.right += 12;
	next.layout = { ...(options?.layout ?? {}), padding: pad };
	return next;
}

function padOf(p: any): { top: number; right: number; bottom: number; left: number } {
	if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p };
	return {
		top: Number(p?.top) || 0,
		right: Number(p?.right) || 0,
		bottom: Number(p?.bottom) || 0,
		left: Number(p?.left) || 0,
	};
}

// ---------------------------------------------------------------- drawing

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	const rr = Math.min(r, h / 2, w / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.lineTo(x + w - rr, y);
	ctx.arcTo(x + w, y, x + w, y + rr, rr);
	ctx.lineTo(x + w, y + h - rr);
	ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
	ctx.lineTo(x + rr, y + h);
	ctx.arcTo(x, y + h, x, y + h - rr, rr);
	ctx.lineTo(x, y + rr);
	ctx.arcTo(x, y, x + rr, y, rr);
	ctx.closePath();
}

function isProjected(o: LookPluginOptions, datasetIndex: number, index: number): boolean {
	if (o.projectedDataSets.includes(datasetIndex)) return true;
	return o.projectedFromIndex !== undefined && index >= o.projectedFromIndex;
}

interface BarPiece {
	datasetIndex: number;
	index: number;
	x: number;
	y: number;
	base: number;
	width: number;
	color: string;
}

/** Every visible bar of the chart, with the colour the look keeps for it. */
function barPieces(chart: ChartJS): BarPiece[] {
	const out: BarPiece[] = [];
	chart.data.datasets.forEach((ds: any, di) => {
		const meta = chart.getDatasetMeta(di);
		if (!meta || meta.hidden || !chart.isDatasetVisible(di) || meta.type !== 'bar') return;
		meta.data.forEach((el: any, i) => {
			const { x, y, base, width } = el.getProps(['x', 'y', 'base', 'width'], true);
			if (![x, y, base, width].every(Number.isFinite)) return;
			out.push({
				datasetIndex: di,
				index: i,
				x,
				y,
				base,
				width,
				color: colorAt(ds, i, '#888888'),
			});
		});
	});
	return out;
}

function zeroPixel(chart: ChartJS): number {
	const y: any = chart.scales.y;
	if (!y) return chart.chartArea.bottom;
	const z = y.getPixelForValue(0);
	return Number.isFinite(z)
		? Math.min(Math.max(z, chart.chartArea.top), chart.chartArea.bottom)
		: chart.chartArea.bottom;
}

/** Dot size and step for the dot matrix, from the narrowest bar. */
export function dotGeometry(barWidth: number): { r: number; step: number } {
	const d = Math.max(3, Math.min(barWidth * 0.82, 11));
	return { r: d / 2, step: d * 1.28 };
}

function drawLattice(chart: ChartJS, o: LookPluginOptions, step: number) {
	const { ctx, chartArea } = chart;
	const xs = columnCentres(chart);
	if (!xs.length) return;
	ctx.save();
	ctx.fillStyle = o.gridColor;
	const zero = zeroPixel(chart);
	for (const x of xs)
		for (let y = zero - step / 2; y > chartArea.top; y -= step) {
			circle(ctx, x, y, 0.9);
			ctx.fill();
		}
	ctx.restore();
}

function columnCentres(chart: ChartJS): number[] {
	const xScale: any = chart.scales.x;
	const labels = chart.data.labels ?? [];
	if (!xScale || !labels.length) return [];
	return labels.map((_, i) => xScale.getPixelForValue(i)).filter(Number.isFinite);
}

function drawDots(chart: ChartJS, o: LookPluginOptions) {
	const pieces = barPieces(chart);
	if (!pieces.length) return;
	const { r, step } = dotGeometry(Math.min(...pieces.map(p => p.width)));
	drawLattice(chart, o, step);
	const zero = zeroPixel(chart);
	const ctx = chart.ctx;
	ctx.save();
	for (const p of pieces) {
		const r0 = Math.round(Math.abs(zero - p.base) / step);
		const r1 = Math.round(Math.abs(zero - p.y) / step);
		const up = p.y <= p.base;
		const hollow = isProjected(o, p.datasetIndex, p.index);
		for (let k = Math.min(r0, r1); k < Math.max(r0, r1); k++) {
			const cy = up ? zero - step / 2 - k * step : zero + step / 2 + k * step;
			if (hollow) {
				circle(ctx, p.x, cy, r - 0.75);
				ctx.strokeStyle = p.color;
				ctx.lineWidth = 1.2;
				ctx.stroke();
			} else {
				circle(ctx, p.x, cy, r);
				ctx.fillStyle = p.color;
				ctx.fill();
			}
		}
	}
	ctx.restore();
}

function hatch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	ctx.beginPath();
	for (let k = -h; k < w + h; k += 4) {
		ctx.moveTo(x + k, y + h);
		ctx.lineTo(x + k + h, y);
	}
	ctx.stroke();
	ctx.restore();
}

function drawPrisms(chart: ChartJS, o: LookPluginOptions) {
	const pieces = barPieces(chart);
	if (!pieces.length) return;
	// Stacked segments at one x share a prism; side by side bars each get their own.
	const columns = new Map<string, BarPiece[]>();
	for (const p of pieces) {
		const key = `${Math.round(p.x)}`;
		const list = columns.get(key) ?? [];
		list.push(p);
		columns.set(key, list);
	}
	const ctx = chart.ctx;
	const sorted = [...columns.values()].sort((a, b) => a[0].x - b[0].x);
	ctx.save();
	ctx.lineJoin = 'round';
	for (const col of sorted) {
		const w = col[0].width;
		const left = col[0].x - w / 2;
		const right = left + w;
		const dx = Math.max(3, w * 0.42);
		const dy = -Math.max(2, w * 0.28);
		const top = Math.min(...col.map(p => Math.min(p.y, p.base)));
		const bottom = Math.max(...col.map(p => Math.max(p.y, p.base)));
		if (bottom - top < 0.5) continue;
		const topPiece = col.reduce((a, b) =>
			Math.min(b.y, b.base) < Math.min(a.y, a.base) ? b : a,
		);
		const projected = col.every(p => isProjected(o, p.datasetIndex, p.index));
		const ink = topPiece.color;

		// Side face (shaded).
		ctx.beginPath();
		ctx.moveTo(right, top);
		ctx.lineTo(right + dx, top + dy);
		ctx.lineTo(right + dx, bottom + dy);
		ctx.lineTo(right, bottom);
		ctx.closePath();
		if (!projected) {
			ctx.fillStyle = withAlpha(ink, 0.26);
			ctx.fill();
		}
		ctx.strokeStyle = withAlpha(ink, projected ? 0.45 : 0.55);
		ctx.lineWidth = 0.8;
		ctx.setLineDash(projected ? [2, 2] : []);
		ctx.stroke();

		// Front face, one band per stacked segment (lit: lighter at the top).
		for (const p of col) {
			const y0 = Math.min(p.y, p.base);
			const h = Math.abs(p.base - p.y);
			if (h < 0.5) continue;
			const segProjected = isProjected(o, p.datasetIndex, p.index);
			if (segProjected) {
				ctx.strokeStyle = withAlpha(p.color, 0.4);
				ctx.lineWidth = 0.6;
				ctx.setLineDash([]);
				hatch(ctx, left, y0, w, h);
			} else {
				const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
				g.addColorStop(0, withAlpha(p.color, 0.06));
				g.addColorStop(1, withAlpha(p.color, 0.16));
				ctx.fillStyle = g;
				ctx.fillRect(left, y0, w, h);
			}
		}
		ctx.beginPath();
		ctx.rect(left, top, w, bottom - top);
		ctx.strokeStyle = withAlpha(ink, projected ? 0.45 : 0.6);
		ctx.lineWidth = 0.8;
		ctx.setLineDash(projected ? [2, 2] : []);
		ctx.stroke();

		// Top face, in the top segment's colour.
		ctx.beginPath();
		ctx.moveTo(left, top);
		ctx.lineTo(right, top);
		ctx.lineTo(right + dx, top + dy);
		ctx.lineTo(left + dx, top + dy);
		ctx.closePath();
		if (!projected) {
			const accent = col.length > 1 && topPiece !== col[0];
			ctx.fillStyle = withAlpha(ink, accent ? 0.85 : 0.1);
			ctx.fill();
		}
		ctx.stroke();
	}
	ctx.restore();
}

function drawWaveFrame(chart: ChartJS, o: LookPluginOptions) {
	const { ctx, chartArea } = chart;
	const yScale: any = chart.scales.y;
	if (!yScale) return;
	ctx.save();
	chart.data.datasets.forEach((ds: any, di) => {
		if (!chart.isDatasetVisible(di) || ds.lookBase === undefined) return;
		const y = yScale.getPixelForValue(ds.lookBase);
		if (!Number.isFinite(y)) return;
		ctx.strokeStyle = o.gridColor;
		ctx.lineWidth = 1;
		ctx.setLineDash([1, 3]);
		ctx.beginPath();
		ctx.moveTo(chartArea.left, y);
		ctx.lineTo(chartArea.right, y);
		ctx.stroke();
		ctx.setLineDash([]);
		// Name and total on the left of the row.
		const total = (ds.lookRaw ?? []).reduce((a: number, b: number) => a + b, 0);
		const x = chartArea.left - WAVE_LABEL_WIDTH + 4;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = o.textColor;
		ctx.font = '500 12px ' + chartFamily(chart);
		ctx.fillText(String(ds.label ?? ''), x, y - 12, WAVE_LABEL_WIDTH - 10);
		ctx.font = MONO_SMALL;
		ctx.fillStyle = withAlpha(o.textColor, 0.6);
		ctx.fillText(formatTotal(total), x, y + 1, WAVE_LABEL_WIDTH - 10);
	});
	ctx.restore();
}

function formatTotal(n: number): string {
	try {
		return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
	} catch {
		return String(n);
	}
}

function chartFamily(chart: ChartJS): string {
	const f: any = (chart.options as any)?.font ?? (chart as any).constructor?.defaults?.font;
	return f?.family || 'sans-serif';
}

function xPixel(chart: ChartJS, index: number): number | undefined {
	const xScale: any = chart.scales.x;
	if (!xScale) return undefined;
	const v = xScale.getPixelForValue(index);
	return Number.isFinite(v) ? v : undefined;
}

function tag(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	text: string,
	bg: string,
	fg: string,
	dot?: string,
	border?: string,
) {
	ctx.font = MONO;
	const padX = 7;
	const dotW = dot ? 10 : 0;
	const w = ctx.measureText(text).width + padX * 2 + dotW;
	const h = 18;
	const x = cx - w / 2;
	const y = cy - h / 2;
	roundRect(ctx, x, y, w, h, 6);
	ctx.fillStyle = bg;
	ctx.fill();
	if (border) {
		ctx.strokeStyle = border;
		ctx.lineWidth = 1;
		ctx.stroke();
	}
	if (dot) {
		circle(ctx, x + padX + 3, cy, 3);
		ctx.fillStyle = dot;
		ctx.fill();
	}
	ctx.fillStyle = fg;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, x + padX + dotW, cy + 0.5);
	return { x, y, w, h };
}

function drawNow(chart: ChartJS, o: LookPluginOptions) {
	if (o.nowIndex === undefined) return;
	const x = xPixel(chart, o.nowIndex);
	if (x === undefined) return;
	const { ctx, chartArea } = chart;
	ctx.save();
	ctx.strokeStyle = withAlpha(o.textColor, 0.75);
	ctx.lineWidth = 1;
	ctx.setLineDash([2, 3]);
	ctx.beginPath();
	ctx.moveTo(x, chartArea.top - 4);
	ctx.lineTo(x, chartArea.bottom);
	ctx.stroke();
	ctx.setLineDash([]);
	circle(ctx, x, chartArea.bottom, 3.5);
	ctx.fillStyle = o.textColor;
	ctx.fill();
	if (o.nowLabel) tag(ctx, x, chartArea.top - 14, o.nowLabel, o.textColor, onColor(o.textColor));
	ctx.restore();
}

/** The pixel a callout points at: a data set's value, or the top of the stack. */
function calloutAnchor(
	chart: ChartJS,
	index: number,
	dataSet?: number,
): { x: number; y: number } | undefined {
	let best: { x: number; y: number } | undefined;
	chart.data.datasets.forEach((_, di) => {
		if (dataSet !== undefined && di !== dataSet) return;
		if (!chart.isDatasetVisible(di)) return;
		const el: any = chart.getDatasetMeta(di)?.data?.[index];
		if (!el) return;
		const { x, y } = el.getProps(['x', 'y'], true);
		if (!Number.isFinite(x) || !Number.isFinite(y)) return;
		if (!best || y < best.y) best = { x, y };
	});
	return best;
}

function drawCallouts(chart: ChartJS, o: LookPluginOptions) {
	if (!o.callouts.length) return;
	const { ctx, chartArea } = chart;
	const surface = isDark(o.textColor) ? '#FFFFFF' : '#000000';
	ctx.save();
	for (const c of o.callouts) {
		const a = calloutAnchor(chart, c.index, c.dataSet);
		if (!a) continue;
		const ds: any = chart.data.datasets[c.dataSet ?? 0];
		const dot = c.color ?? (ds ? colorAt(ds, c.index, o.textColor) : o.textColor);
		const ty = Math.max(chartArea.top - 14 + 22, a.y - 28);
		const box = tag(
			ctx,
			a.x,
			ty,
			c.label,
			withAlpha(surface, 0.92),
			o.textColor,
			dot,
			withAlpha(o.textColor, 0.14),
		);
		ctx.strokeStyle = withAlpha(o.textColor, 0.45);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(a.x, box.y + box.h);
		ctx.lineTo(a.x, a.y - 3);
		ctx.stroke();
	}
	ctx.restore();
}

function optionsOf(chart: ChartJS): LookPluginOptions | undefined {
	const o = (chart.options as any)?.plugins?.chartLook;
	return o && typeof o === 'object' && o.look ? (o as LookPluginOptions) : undefined;
}

/**
 * Registered once with the other chart.js pieces. A chart without `plugins.chartLook` in its
 * options is left alone in every hook.
 */
export const chartLookPlugin: Plugin = {
	id: 'chartLook',
	beforeDatasetsDraw(chart: ChartJS) {
		const o = optionsOf(chart);
		if (!o) return;
		if (o.look === 'wave') drawWaveFrame(chart, o);
	},
	afterDatasetsDraw(chart: ChartJS) {
		const o = optionsOf(chart);
		if (!o) return;
		if (o.look === 'dotMatrix') drawDots(chart, o);
		else if (o.look === 'isometric') drawPrisms(chart, o);
		drawNow(chart, o);
		drawCallouts(chart, o);
	},
};
