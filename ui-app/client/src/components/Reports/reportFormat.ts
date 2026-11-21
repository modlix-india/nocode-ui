import { NumberFormatStyle, ReportColumn, ReportSuccess } from './reportTypes';

/**
 * Value formatting for report widgets, all through Intl.
 *
 * - The locale is the tenant's, from the catalog (`locale`, e.g. "en-IN"); compact numbers then
 *   come out as the locale writes them (1.5L, 4.5Cr for en-IN; 150K, 45M for en-US). There is
 *   no country constant here: an empty locale is the browser's.
 * - Money is always shown in the currency the runner names, on the column (`currency`) or, when
 *   a result was split by currency, on the row (the runner adds a `currency` column then). A
 *   money value with no known currency is a plain number rather than a guessed currency.
 * - `numberFormat` is the widget's `view.style.numberFormat`: compact, full or percent, with
 *   0 to 4 decimals. Percent multiplies a plain ratio by 100; a PERCENT column (already 0 to
 *   100, from a `percent` derived measure or "% of total") is shown as it is.
 */

export const EMPTY_VALUE = '-';

export interface FormatOptions {
	/** BCP 47 locale from the catalog. Empty: the browser's. */
	locale?: string;
	/** The widget's number format; without one, `compact` below decides. */
	numberFormat?: NumberFormatStyle;
	/** Short form for big numbers when no number format is set (KPI tiles, axes). */
	compact?: boolean;
	/** IANA zone for DATE values (catalog `timeZone`). */
	timeZone?: string;
	/** The catalog's default currency, for money the runner named no currency for. */
	currency?: string;
}

export function toNumber(v: any): number | undefined {
	if (v === null || v === undefined || v === '') return undefined;
	const n = typeof v === 'number' ? v : Number(v);
	return Number.isFinite(n) ? n : undefined;
}

export function currencyOf(column: ReportColumn | undefined, row?: Record<string, any>) {
	const c = row?.currency ?? column?.currency;
	return typeof c === 'string' && /^[A-Za-z]{3}$/.test(c) ? c.toUpperCase() : undefined;
}

function clampDecimals(d: number | undefined): number | undefined {
	if (d === undefined || d === null || !Number.isFinite(d)) return undefined;
	return Math.max(0, Math.min(4, Math.round(d)));
}

function intl(locale: string | undefined, o: Intl.NumberFormatOptions, n: number): string {
	try {
		return new Intl.NumberFormat(locale || undefined, o).format(n);
	} catch {
		try {
			return new Intl.NumberFormat(undefined, o).format(n);
		} catch {
			return String(n);
		}
	}
}

interface Resolved {
	style: 'compact' | 'full' | 'percent';
	decimals?: number;
}

function resolveStyle(opts?: FormatOptions): Resolved {
	const nf = opts?.numberFormat;
	if (nf?.style) return { style: nf.style, decimals: clampDecimals(nf.decimals) };
	return { style: opts?.compact ? 'compact' : 'full', decimals: clampDecimals(nf?.decimals) };
}

function digits(r: Resolved, n: number, fallbackMax: number): Intl.NumberFormatOptions {
	if (r.decimals !== undefined)
		return r.style === 'compact'
			? { maximumFractionDigits: r.decimals }
			: { minimumFractionDigits: r.decimals, maximumFractionDigits: r.decimals };
	if (r.style === 'compact') return { maximumFractionDigits: Math.abs(n) >= 1000 ? 1 : 2 };
	return { maximumFractionDigits: fallbackMax };
}

export function formatNumber(value: any, opts?: FormatOptions): string {
	const n = toNumber(value);
	if (n === undefined) return EMPTY_VALUE;
	const r = resolveStyle(opts);
	if (r.style === 'percent') return formatPercent(n * 100, opts);
	return intl(
		opts?.locale,
		{
			notation: r.style === 'compact' ? 'compact' : 'standard',
			...digits(r, n, 2),
		},
		n,
	);
}

export function formatMoney(value: any, currency: string | undefined, opts?: FormatOptions) {
	const n = toNumber(value);
	if (n === undefined) return EMPTY_VALUE;
	const r = resolveStyle(opts);
	if (!currency || r.style === 'percent') return formatNumber(n, opts);
	return intl(
		opts?.locale,
		{
			style: 'currency',
			currency,
			notation: r.style === 'compact' ? 'compact' : 'standard',
			minimumFractionDigits: 0,
			...digits(r, n, Math.abs(n) >= 1000 ? 0 : 2),
		},
		n,
	);
}

/** A value already in percent units (0 to 100). */
export function formatPercent(value: any, opts?: FormatOptions) {
	const n = toNumber(value);
	if (n === undefined) return EMPTY_VALUE;
	const d = clampDecimals(opts?.numberFormat?.decimals);
	return intl(
		opts?.locale,
		{
			style: 'percent',
			...(d !== undefined
				? { minimumFractionDigits: d, maximumFractionDigits: d }
				: { maximumFractionDigits: 1 }),
		},
		n / 100,
	);
}

export function formatDate(value: any, opts?: FormatOptions) {
	if (value === null || value === undefined || value === '') return EMPTY_VALUE;
	const s = String(value);
	const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s);
	const d = new Date(dateOnly ? s + 'T00:00:00Z' : s);
	if (Number.isNaN(d.getTime())) return s;
	try {
		return new Intl.DateTimeFormat(opts?.locale || undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			// A bare date is a calendar day: show it as written, in UTC.
			timeZone: dateOnly ? 'UTC' : opts?.timeZone || undefined,
		}).format(d);
	} catch {
		return d.toDateString();
	}
}

/** One measure value as text, honouring the column format and the widget's number format. */
export function formatMeasure(
	value: any,
	column: ReportColumn | undefined,
	row?: Record<string, any>,
	opts?: FormatOptions,
): string {
	switch (column?.format) {
		case 'MONEY':
			return formatMoney(
				value,
				currencyOf(column, row) ?? currencyOf({ key: '', currency: opts?.currency }),
				opts,
			);
		case 'PERCENT':
			return formatPercent(value, opts);
		default:
			return formatNumber(value, opts);
	}
}

/** One cell, as text. Dimensions with a lookup show `<key>_label` (CONTRACT section 3). */
export function formatCell(
	row: Record<string, any>,
	column: ReportColumn,
	opts?: FormatOptions,
): string {
	if (column.kind === 'MEASURE') return formatMeasure(row[column.key], column, row, opts);
	const label = row[`${column.key}_label`];
	if (label !== undefined && label !== null && label !== '') return String(label);
	const v = row[column.key];
	if (column.format === 'DATE' || column.kind === 'DATE') return formatDate(v, opts);
	if (column.format === 'MONEY' || column.format === 'NUMBER' || column.format === 'PERCENT')
		return formatMeasure(v, column, row, opts);
	if (v === null || v === undefined || v === '') return EMPTY_VALUE;
	return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

/** Columns a person sees: not hidden, not a `_label` companion. */
export function visibleColumns(out: Pick<ReportSuccess, 'columns'>): ReportColumn[] {
	const keys = new Set(out.columns.map(c => c.key));
	return out.columns.filter(
		c =>
			!c.hidden &&
			!(c.key.endsWith('_label') && keys.has(c.key.substring(0, c.key.length - 6))),
	);
}

export function measureColumns(out: Pick<ReportSuccess, 'columns'>) {
	return visibleColumns(out).filter(c => c.kind === 'MEASURE');
}

export function dimensionColumns(out: Pick<ReportSuccess, 'columns'>) {
	return visibleColumns(out).filter(c => c.kind !== 'MEASURE');
}

/** "Updated 10:42", in the viewer's clock (24 hour). */
export function updatedLabel(refreshedAt: string | number | Date | undefined): string {
	if (!refreshedAt) return '';
	const d = refreshedAt instanceof Date ? refreshedAt : new Date(refreshedAt);
	if (Number.isNaN(d.getTime())) return '';
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `Updated ${hh}:${mm}`;
}

/** The text for a row's dimension value: its label when the runner resolved one. */
export function labelOf(row: Record<string, any>, key: string): string {
	const l = row[`${key}_label`];
	if (l !== undefined && l !== null && l !== '') return String(l);
	const v = row[key];
	return v === undefined || v === null || v === '' ? EMPTY_VALUE : String(v);
}
