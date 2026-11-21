import { addItem } from './dashboardLayout';
import { CAP_MESSAGES, DEFAULT_TILE, DocResult, newWidgetId } from './dashboardModel';
import { eventResults, ReportTransport } from './reportApi';
import { formatCell, FormatOptions, visibleColumns } from './reportFormat';
import { cloneSpec } from './reportSpecUtil';
import {
	DASHBOARD_CAPS,
	DashboardDoc,
	LayoutItem,
	ReportColumn,
	ReportOutput,
	ReportSpec,
	ReportSuccess,
	SavedWidget,
} from './reportTypes';

/**
 * Export and import (CONTRACT 8.2): CSV from rows the widget holds or a records export run,
 * PDF through the app's `<ns>.reportPdf(document)` (pdf-render, never a third-party API), and
 * the widget / dashboard file (specs only, never data). Pure where it can be, so it is tested
 * without a browser download.
 */

// ---------------------------------------------------------------------------------------------
// CSV

/** Leading characters a spreadsheet would run as a formula. */
const FORMULA_START = /^[=+@\t\r]|^-(?!\d)/;

/** One CSV cell: numbers raw, text quoted when it holds a comma, quote or line break. */
export function csvCell(v: any): string {
	if (v === null || v === undefined) return '';
	if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
	if (typeof v === 'boolean') return v ? 'true' : 'false';
	let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
	// A text cell a spreadsheet would evaluate is kept as text.
	if (FORMULA_START.test(s)) s = `'${s}`;
	return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * The CSV of a result (CONTRACT 8.2): headers are the column labels; measure values raw
 * (unformatted numbers), dates as the ISO value the runner gave, a dimension with a lookup as
 * its label (its key alone means nothing to a reader).
 */
export function toCsv(out: Pick<ReportSuccess, 'columns' | 'rows'>): string {
	const cols = visibleColumns(out);
	const lines = [cols.map(c => csvCell(c.label ?? c.key)).join(',')];
	for (const r of out.rows ?? []) {
		lines.push(
			cols
				.map(c => {
					if (c.kind !== 'MEASURE') {
						const l = r[`${c.key}_label`];
						if (l !== undefined && l !== null && l !== '') return csvCell(l);
					}
					return csvCell(r[c.key]);
				})
				.join(','),
		);
	}
	return lines.join('\r\n') + '\r\n';
}

function pad(n: number) {
	return String(n).padStart(2, '0');
}

/** "Sales performance 2026-11-21.csv": the widget name and today's date. */
export function exportFileName(name: string | undefined, ext: string, now = new Date()): string {
	const base =
		String(name ?? '')
			.replace(/[\\/:*?"<>|]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim() || 'report';
	const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	return `${base} ${day}.${ext}`;
}

/** Hands a file to the browser as a download. */
export function downloadBlob(blob: Blob, fileName: string) {
	if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function downloadText(text: string, fileName: string, mime: string) {
	// The byte order mark lets a spreadsheet read UTF-8 names (Hindi, accents) correctly.
	const body = mime.startsWith('text/csv') ? '﻿' + text : text;
	downloadBlob(new Blob([body], { type: mime }), fileName);
}

// ---------------------------------------------------------------------------------------------
// PDF

export const PDF_CAPS = { items: 24, rows: 200, bytes: 8 * 1024 * 1024 };

export interface PdfColumn {
	key: string;
	label: string;
	/** Numbers line up on the right. */
	align?: 'left' | 'right';
}

export interface PdfItem {
	name: string;
	subtitle?: string;
	/** The chart as a PNG data URL (canvas views). */
	image?: string;
	columns: PdfColumn[];
	/** Values as the screen shows them (formatted text). */
	rows: Array<Record<string, string>>;
}

export interface PdfDocument {
	title: string;
	subtitle?: string;
	generatedAt: string;
	locale?: string;
	items: PdfItem[];
}

/** One widget for the PDF: its chart image and up to 200 rows, formatted like the screen. */
export function pdfItem(
	name: string,
	subtitle: string | undefined,
	out: Pick<ReportSuccess, 'columns' | 'rows'> | undefined,
	fmt: FormatOptions,
	image?: string,
): PdfItem {
	const cols: ReportColumn[] = out ? visibleColumns(out) : [];
	return {
		name,
		...(subtitle ? { subtitle } : {}),
		...(image ? { image } : {}),
		columns: cols.map(c => ({
			key: c.key,
			label: c.label ?? c.key,
			...(c.kind === 'MEASURE' ? { align: 'right' as const } : {}),
		})),
		rows: (out?.rows ?? [])
			.slice(0, PDF_CAPS.rows)
			.map(r => Object.fromEntries(cols.map(c => [c.key, formatCell(r, c, fmt)]))),
	};
}

/** The document for `<ns>.reportPdf`, within the caps (24 items, 200 rows each, 8 MB). */
export function pdfDocument(
	title: string,
	items: PdfItem[],
	opts?: { subtitle?: string; locale?: string; now?: Date },
): { ok: true; document: PdfDocument } | { ok: false; error: string } {
	if (!items.length) return { ok: false, error: 'Nothing to export yet.' };
	const document: PdfDocument = {
		title,
		...(opts?.subtitle ? { subtitle: opts.subtitle } : {}),
		generatedAt: (opts?.now ?? new Date()).toISOString(),
		...(opts?.locale ? { locale: opts.locale } : {}),
		items: items
			.slice(0, PDF_CAPS.items)
			.map(i => ({ ...i, rows: i.rows.slice(0, PDF_CAPS.rows) })),
	};
	let size = JSON.stringify(document).length;
	// Too big: drop chart images from the end until it fits; the tables stay.
	for (let i = document.items.length - 1; size > PDF_CAPS.bytes && i >= 0; i--) {
		if (!document.items[i].image) continue;
		delete document.items[i].image;
		size = JSON.stringify(document).length;
	}
	if (size > PDF_CAPS.bytes) return { ok: false, error: 'This is too much for one PDF.' };
	return { ok: true, document };
}

export type PdfTarget =
	| { kind: 'url'; url: string; fileName?: string }
	| { kind: 'base64'; data: string; fileName?: string };

const URL_KEYS = ['url', 'fileUrl', 'downloadUrl', 'location', 'path', 'filePath'];
const DATA_KEYS = ['base64', 'content', 'data', 'pdf', 'file'];

/**
 * Where the PDF is in the app function's answer. The platform's PDF calls answer a file record
 * (`fileData` with a url, like CoreServices.File.TemplateToPdf) or base64 / a data URL; any of
 * those, at any depth, is accepted.
 */
export function pdfTarget(results: any, depth = 0): PdfTarget | undefined {
	if (depth > 4 || results === null || results === undefined) return undefined;
	if (typeof results === 'string') {
		const s = results.trim();
		if (/^data:application\/pdf/i.test(s)) return { kind: 'url', url: s };
		if (/^JVBER/.test(s)) return { kind: 'base64', data: s };
		if (/^(https?:\/\/|\/?api\/)/.test(s)) return { kind: 'url', url: s };
		return undefined;
	}
	if (typeof results !== 'object') return undefined;
	const fileName =
		typeof results.fileName === 'string'
			? results.fileName
			: typeof results.name === 'string' && /\.pdf$/i.test(results.name)
				? results.name
				: undefined;
	for (const k of DATA_KEYS) {
		const v = results[k];
		if (typeof v === 'string') {
			const t = pdfTarget(v, depth + 1);
			if (t) return { ...t, fileName: t.fileName ?? fileName };
		}
	}
	for (const k of URL_KEYS) {
		const v = results[k];
		if (typeof v === 'string' && v && (/^(https?:|data:|\/|api\/)/.test(v) || k === 'url'))
			return { kind: 'url', url: v, fileName };
	}
	for (const v of Object.values(results)) {
		// Any string that is plainly a PDF (a data URL or base64 of one).
		if (typeof v === 'string' && /^(data:application\/pdf|JVBER)/i.test(v.trim())) {
			const t = pdfTarget(v, depth + 1);
			if (t) return { ...t, fileName: t.fileName ?? fileName };
		}
		if (v && typeof v === 'object') {
			const t = pdfTarget(v, depth + 1);
			if (t) return { ...t, fileName: t.fileName ?? fileName };
		}
	}
	return undefined;
}

export function base64Blob(data: string, mime: string): Blob {
	const bin = atob(data.replace(/\s+/g, ''));
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new Blob([bytes], { type: mime });
}

/** Runs `<ns>.reportPdf(document)` and downloads the PDF. Answers an error text, or '' when done. */
export async function exportPdf(
	transport: ReportTransport,
	pdfFunction: string,
	document: PdfDocument,
	fileName: string,
): Promise<string> {
	if (!pdfFunction) return 'PDF export is not set up for this app.';
	try {
		const data = await transport.call(pdfFunction, { document });
		let results: any = eventResults(data);
		// The app wrapper may hand the core's answer one level down.
		if (results && results.ok === undefined && results.result?.ok !== undefined)
			results = results.result;
		if (results?.ok === false)
			return results.error?.code === 'TOO_LARGE'
				? 'This is too much for one PDF.'
				: results.error?.message || 'The PDF could not be made.';
		const target = pdfTarget(results);
		if (!target) return 'The PDF did not come back.';
		const name =
			target.fileName && /\.pdf$/i.test(target.fileName) ? target.fileName : fileName;
		if (target.kind === 'base64') {
			downloadBlob(base64Blob(target.data, 'application/pdf'), name);
			return '';
		}
		const inline = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(target.url);
		if (inline && inline[2]) {
			downloadBlob(base64Blob(inline[3], inline[1] || 'application/pdf'), name);
			return '';
		}
		if (/^data:/.test(target.url) || !transport.fetchFile) {
			const a = window.document.createElement('a');
			a.href = target.url;
			a.download = name;
			a.target = '_blank';
			a.rel = 'noopener';
			a.click();
			return '';
		}
		downloadBlob(await transport.fetchFile(target.url), name);
		return '';
	} catch (e: any) {
		return e?.message || 'The PDF could not be made.';
	}
}

/** A canvas as a PNG data URL on the card colour (a transparent PNG prints black in some viewers). */
export function canvasPng(canvas: HTMLCanvasElement | undefined, background?: string): string {
	if (!canvas) return '';
	try {
		const c = document.createElement('canvas');
		c.width = canvas.width;
		c.height = canvas.height;
		const ctx = c.getContext('2d');
		if (!ctx) return '';
		if (background) {
			ctx.fillStyle = background;
			ctx.fillRect(0, 0, c.width, c.height);
		}
		ctx.drawImage(canvas, 0, 0);
		return c.toDataURL('image/png');
	} catch {
		return '';
	}
}

// ---------------------------------------------------------------------------------------------
// Widget / dashboard file

export const REPORT_FILE_KIND = 'modlix.reports';

export interface ReportFileWidget {
	name: string;
	spec: ReportSpec;
	refreshMin?: number;
}

export interface ReportFile {
	kind: typeof REPORT_FILE_KIND;
	v: 1;
	app: string;
	widgets: Record<string, ReportFileWidget>;
	layout: LayoutItem[];
}

/** The file for some widgets (specs only: no data, no defaultId). */
export function reportFile(
	app: string,
	widgets: Array<{ id: string; name: string; spec: ReportSpec; refreshMin?: number }>,
	layout?: LayoutItem[],
): ReportFile {
	const ids = new Set(widgets.map(w => w.id));
	return {
		kind: REPORT_FILE_KIND,
		v: 1,
		app,
		widgets: Object.fromEntries(
			widgets.map(w => [
				w.id,
				{
					name: w.name,
					spec: cloneSpec(w.spec),
					...(w.refreshMin ? { refreshMin: w.refreshMin } : {}),
				},
			]),
		),
		layout: (layout ?? [])
			.filter(l => ids.has(l.id))
			.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })),
	};
}

function isSpecLike(v: any): v is ReportSpec {
	return !!v && typeof v === 'object' && typeof v.source === 'string' && !!v.view?.type;
}

/** Reads a file: refused when it is not a reports file or is for another app. */
export function parseReportFile(
	text: string,
	app: string,
): { ok: true; file: ReportFile } | { ok: false; error: string } {
	let raw: any;
	try {
		raw = JSON.parse(text);
	} catch {
		return { ok: false, error: 'This is not a reports file.' };
	}
	if (!raw || raw.kind !== REPORT_FILE_KIND)
		return { ok: false, error: 'This is not a reports file.' };
	if (raw.v !== 1) return { ok: false, error: 'This reports file is from a newer version.' };
	if (String(raw.app ?? '').toLowerCase() !== String(app ?? '').toLowerCase())
		return {
			ok: false,
			error: `This file is for another app (${String(raw.app ?? 'unknown')}).`,
		};
	const widgets: Record<string, ReportFileWidget> = {};
	for (const [id, w] of Object.entries<any>(raw.widgets ?? {})) {
		if (!w || typeof w !== 'object' || !isSpecLike(w.spec)) continue;
		widgets[id] = {
			name: typeof w.name === 'string' && w.name.trim() ? w.name.trim() : 'Imported widget',
			spec: w.spec,
			refreshMin: Number.isFinite(w.refreshMin) ? w.refreshMin : 0,
		};
	}
	if (!Object.keys(widgets).length) return { ok: false, error: 'The file has no widgets.' };
	const layout: LayoutItem[] = (Array.isArray(raw.layout) ? raw.layout : []).filter(
		(l: any) => l && typeof l.id === 'string' && widgets[l.id],
	);
	return { ok: true, file: { kind: REPORT_FILE_KIND, v: 1, app: raw.app, widgets, layout } };
}

export interface ImportVerdict {
	id: string;
	name: string;
	ok: boolean;
	reason?: string;
}

/** Each spec checked with a dry run against the importer's catalog (CONTRACT 8.2). */
export async function checkImport(
	file: ReportFile,
	dryRun: (spec: ReportSpec) => Promise<ReportOutput>,
	reasonOf: (error: { code: string; message?: string }) => string,
): Promise<ImportVerdict[]> {
	const out: ImportVerdict[] = [];
	for (const [id, w] of Object.entries(file.widgets)) {
		const r = await dryRun(w.spec);
		out.push(
			r.ok
				? { id, name: w.name, ok: true }
				: { id, name: w.name, ok: false, reason: reasonOf(r.error) },
		);
	}
	return out;
}

/**
 * Puts imported widgets into the library under new ids (nothing is overwritten); with
 * `toDashboard` also on the dashboard in the file's order. A widget the dry run refused is kept
 * with its reason (`importError`). Caps apply: what does not fit is left out and counted.
 */
export function importIntoDoc(
	doc: DashboardDoc,
	file: ReportFile,
	verdicts: ImportVerdict[],
	opts?: { toDashboard?: boolean },
): DocResult & { imported?: number; left?: number } {
	const byId = new Map(verdicts.map(v => [v.id, v]));
	const order = [
		...file.layout.map(l => l.id),
		...Object.keys(file.widgets).filter(id => !file.layout.some(l => l.id === id)),
	];
	const widgets = { ...doc.widgets };
	let layout = doc.layout;
	let imported = 0;
	let left = 0;
	for (const fid of order) {
		const w = file.widgets[fid];
		if (!w) continue;
		if (Object.keys(widgets).length >= DASHBOARD_CAPS.saved) {
			left++;
			continue;
		}
		const id = newWidgetId(widgets);
		const v = byId.get(fid);
		const saved: SavedWidget = {
			name: w.name,
			spec: cloneSpec(w.spec),
			refreshMin: w.refreshMin ?? 0,
			...(v && !v.ok ? { importError: v.reason || 'Not available' } : {}),
		};
		widgets[id] = saved;
		imported++;
		if (opts?.toDashboard && layout.length < DASHBOARD_CAPS.onDashboard) {
			const tile = file.layout.find(l => l.id === fid);
			layout = addItem(layout, id, tile?.w ?? DEFAULT_TILE.w, tile?.h ?? DEFAULT_TILE.h);
		}
	}
	if (!imported) return { ok: false, error: CAP_MESSAGES.saved };
	return { ok: true, doc: { ...doc, widgets, layout }, imported, left };
}

/** Reads a picked file as text. */
export function readFileText(file: File): Promise<string> {
	if (typeof file.text === 'function') return file.text();
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result ?? ''));
		r.onerror = () => reject(r.error);
		r.readAsText(file);
	});
}
