import { WantedPlugins } from './lazyPlugins';

/**
 * The Chart component's opt-in extras (CXZ-1780): a click event, data labels and reference
 * lines. Every one is off unless its property is set, and with none set the chart options are
 * returned untouched (same object), so every existing chart draws exactly as before.
 */

export type DataLabelPosition = 'off' | 'inside' | 'outside' | 'end';

export interface ChartReferenceLine {
	value: number | string;
	label?: string;
	/** 'y' (default: a horizontal line across a vertical chart) or 'x'. */
	axis?: 'x' | 'y';
	/** Theme chart palette position, 1 to 12. Empty: the axis colour. */
	paletteIndex?: number;
}

export interface ChartOptInProperties {
	onDataClick?: string;
	dataLabels?: DataLabelPosition;
	referenceLines?: ChartReferenceLine[];
	numberLocale?: string;
	invertAxis?: boolean;
	data?: any;
}

export interface OptInTheme {
	/** Theme chart palette (Theme.chart{Scheme}DataColor1..12). */
	palette: string[];
	/** Axis / text colour from the theme. */
	axisColor?: string;
	textColor?: string;
}

/** The payload `onDataClick` writes to the selection binding (CONTRACT section 5). */
export interface DataClickPayload {
	datasetIndex: number;
	index: number;
	label: any;
	x: any;
	y: any;
	row: any;
}

export function wantedPlugins(p: ChartOptInProperties | undefined): WantedPlugins {
	return {
		dataLabels: !!p?.dataLabels && p.dataLabels !== 'off',
		annotation: validLines(p?.referenceLines).length > 0,
	};
}

function validLines(lines: any): ChartReferenceLine[] {
	if (!Array.isArray(lines)) return [];
	return lines.filter(
		l => l && l.value !== '' && l.value !== null && Number.isFinite(Number(l.value)),
	);
}

function formatter(locale: string | undefined) {
	return (v: any) => {
		const raw = v && typeof v === 'object' ? (v.y ?? v.r ?? v.x) : v;
		if (raw === null || raw === undefined || Array.isArray(raw)) return '';
		const n = Number(raw);
		if (!Number.isFinite(n)) return String(raw);
		try {
			return new Intl.NumberFormat(locale || undefined, { maximumFractionDigits: 2 }).format(
				n,
			);
		} catch {
			return String(n);
		}
	};
}

export function dataLabelsConfig(position: DataLabelPosition, locale?: string, textColor?: string) {
	const base: any = {
		display: 'auto',
		clamp: true,
		font: { weight: 600 },
		formatter: formatter(locale),
	};
	if (textColor) base.color = textColor;
	if (position === 'inside') return { ...base, anchor: 'center', align: 'center' };
	if (position === 'end') return { ...base, anchor: 'end', align: 'start', offset: 2 };
	return { ...base, anchor: 'end', align: 'end', offset: 2 };
}

export function referenceLineConfig(
	lines: ChartReferenceLine[] | undefined,
	theme: OptInTheme,
	horizontalChart: boolean,
) {
	const annotations: Record<string, any> = {};
	validLines(lines).forEach((l, i) => {
		const axis = l.axis === 'x' ? 'x' : 'y';
		// On a horizontal (inverted) chart the value axis is x: a "y" line follows the values.
		const scaleID = horizontalChart ? (axis === 'y' ? 'x' : 'y') : axis;
		const idx = Number(l.paletteIndex);
		const color =
			Number.isFinite(idx) && idx >= 1 && theme.palette[idx - 1]
				? theme.palette[idx - 1]
				: (theme.axisColor ?? theme.textColor);
		annotations[`referenceLine${i}`] = {
			type: 'line',
			scaleID,
			value: Number(l.value),
			borderColor: color,
			borderWidth: 1.5,
			borderDash: [6, 4],
			label: l.label
				? {
						display: true,
						content: l.label,
						position: 'end',
						color: theme.textColor,
						backgroundColor: 'transparent',
						font: { size: 11 },
					}
				: { display: false },
		};
	});
	return annotations;
}

/** The options with the opted-in extras merged in; the same object when none is set. */
export function applyChartOptIns(
	options: any,
	p: ChartOptInProperties | undefined,
	theme: OptInTheme,
	onClick?: (event: any, elements: any[], chart: any) => void,
): any {
	const w = wantedPlugins(p);
	const click = !!p?.onDataClick && !!onClick;
	if (!w.dataLabels && !w.annotation && !click) return options;
	const plugins = { ...(options?.plugins ?? {}) };
	if (w.dataLabels)
		plugins.datalabels = dataLabelsConfig(p!.dataLabels!, p!.numberLocale, theme.textColor);
	if (w.annotation)
		plugins.annotation = {
			annotations: referenceLineConfig(p!.referenceLines, theme, !!p!.invertAxis),
		};
	const next: any = { ...options, plugins };
	if (click) {
		next.onClick = onClick;
		next.onHover = (event: any, elements: any[]) => {
			const t = event?.native?.target as HTMLElement | undefined;
			if (t?.style) t.style.cursor = elements?.length ? 'pointer' : '';
		};
	}
	return next;
}

/** What was clicked, from chart.js' active elements. Undefined when the click hit no mark. */
export function clickPayload(
	elements: Array<{ datasetIndex: number; index: number }> | undefined,
	data: { labels?: any[]; datasets?: Array<{ data?: any[] }> } | undefined,
	sourceData: any,
): DataClickPayload | undefined {
	const el = elements?.[0];
	if (!el) return undefined;
	const { datasetIndex, index } = el;
	const raw = data?.datasets?.[datasetIndex]?.data?.[index];
	const label = data?.labels?.[index];
	const isPoint = raw && typeof raw === 'object' && !Array.isArray(raw);
	return {
		datasetIndex,
		index,
		label: label ?? null,
		x: isPoint ? (raw.x ?? label ?? null) : (label ?? null),
		y: isPoint ? (raw.y ?? null) : (raw ?? null),
		row: Array.isArray(sourceData) ? (sourceData[index] ?? null) : null,
	};
}
