/**
 * CSV data import (CXZ-1780 CONTRACT 10, P1c), the pure part: parse a CSV in the browser, infer
 * each column's type (number, date, text), map columns onto the dataset storage's typed slots
 * (s1..s20 text, n1..n20 number, d1..d10 date) and convert rows for `<ns>.reportDatasetSave`.
 * No dependency: the parser is RFC 4180 (quoted fields, doubled quotes, line breaks inside
 * quotes, CRLF, a UTF-8 BOM) with the delimiter detected from the header line.
 */

export type DatasetColumnType = 'TEXT' | 'NUMBER' | 'DATE';

/** A column as `cxReportDataset.columns` stores it. */
export interface DatasetColumn {
	slot: string;
	label: string;
	type: DatasetColumnType;
	csvHeader: string;
}

/** A dataset as `<ns>.reportDatasetList` returns it. */
export interface DatasetInfo {
	_id: string;
	name: string;
	columns: DatasetColumn[];
	rowCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export const DATASET_LIMITS = {
	fileBytes: 10 * 1024 * 1024,
	rows: 50000,
	columns: 50,
	perUser: 20,
	nameMax: 60,
	labelMax: 60,
	textMax: 255,
	batch: 1000,
	slots: { TEXT: 20, NUMBER: 20, DATE: 10 } as Record<DatasetColumnType, number>,
};

const SLOT_PREFIX: Record<DatasetColumnType, string> = { TEXT: 's', NUMBER: 'n', DATE: 'd' };

export const TYPE_LABELS: Record<DatasetColumnType, string> = {
	TEXT: 'Text',
	NUMBER: 'Number',
	DATE: 'Date',
};

/** The catalog source id of a dataset (CONTRACT 10). */
export function datasetSourceId(datasetId: string): string {
	return `dataset:${datasetId}`;
}

export function isDatasetSource(source: string | undefined): boolean {
	return String(source ?? '').startsWith('dataset:');
}

export interface ParsedCsv {
	header: string[];
	rows: string[][];
	delimiter: string;
	/** More rows than the limit: only the first `DATASET_LIMITS.rows` are kept. */
	truncated: boolean;
}

function detectDelimiter(text: string): string {
	let firstLine = '';
	let inQuotes = false;
	for (let i = 0; i < text.length && i < 64 * 1024; i++) {
		const c = text[i];
		if (c === '"') inQuotes = !inQuotes;
		else if (!inQuotes && (c === '\n' || c === '\r')) break;
		firstLine += c;
	}
	const counts = [',', ';', '\t', '|'].map(d => {
		let n = 0;
		let q = false;
		for (const c of firstLine) {
			if (c === '"') q = !q;
			else if (!q && c === d) n++;
		}
		return [d, n] as const;
	});
	const best = counts.reduce((a, b) => (b[1] > a[1] ? b : a));
	return best[1] > 0 ? best[0] : ',';
}

/** Parses CSV text. Blank lines are skipped; rows are padded or cut to the header's width. */
export function parseCsv(input: string, maxRows = DATASET_LIMITS.rows): ParsedCsv {
	const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
	const delimiter = detectDelimiter(text);
	const records: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	let truncated = false;
	const endRow = () => {
		row.push(field);
		field = '';
		if (!(row.length === 1 && row[0].trim() === '')) records.push(row);
		row = [];
	};
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
			continue;
		}
		if (c === '"' && field === '') inQuotes = true;
		else if (c === delimiter) {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			endRow();
			if (records.length > maxRows + 1) {
				truncated = true;
				break;
			}
		} else field += c;
	}
	if (!truncated && (field !== '' || row.length)) endRow();
	if (records.length > maxRows + 1) {
		truncated = true;
		records.length = maxRows + 1;
	}
	const rawHeader = records.shift() ?? [];
	const header = uniqueHeaders(rawHeader);
	const rows = records.map(r =>
		r.length === header.length
			? r
			: r.length > header.length
				? r.slice(0, header.length)
				: [...r, ...Array(header.length - r.length).fill('')],
	);
	return { header, rows, delimiter, truncated };
}

/** Header names trimmed, never empty, never repeated ("Amount", "Amount 2"). */
function uniqueHeaders(raw: string[]): string[] {
	const seen = new Set<string>();
	return raw.map((h, i) => {
		const base = h.trim() || `Column ${i + 1}`;
		let name = base;
		for (let n = 2; seen.has(name.toLowerCase()); n++) name = `${base} ${n}`;
		seen.add(name.toLowerCase());
		return name;
	});
}

const NUMBER_RE = /^[-+]?(\d{1,3}(,\d{3})+|\d+)?(\.\d+)?$/;

/** A number from CSV text ("1,234.50", "-12", "45%" is not one); undefined when it is not. */
export function parseNumber(raw: string): number | undefined {
	let s = raw.trim();
	if (!s) return undefined;
	if (/^\(.*\)$/.test(s)) s = `-${s.slice(1, -1)}`;
	if (!NUMBER_RE.test(s) || !/\d/.test(s)) return undefined;
	const n = Number(s.replace(/,/g, ''));
	return Number.isFinite(n) ? n : undefined;
}

export type DayOrder = 'DMY' | 'MDY';

const ISO_RE =
	/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const YMD_SLASH_RE = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
const DMY_RE = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const NAMED_RE = /^(\d{1,2})[ -]([A-Za-z]{3,9})[ ,-]*(\d{4})$/;

function pad(n: number) {
	return String(n).padStart(2, '0');
}

function validYmd(y: number, m: number, d: number): boolean {
	if (m < 1 || m > 12 || d < 1 || y < 1000) return false;
	return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function iso(y: number, m: number, d: number, h = 0, mi = 0, s = 0): string | undefined {
	if (!validYmd(y, m, d) || h > 23 || mi > 59 || s > 59) return undefined;
	return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}`;
}

/**
 * A date from CSV text as `YYYY-MM-DDTHH:mm:ss` (19 characters, the d1..d10 slots), or undefined.
 * Accepts ISO (time optional; a zone is dropped, the wall time kept), YYYY/MM/DD, DD/MM/YYYY or
 * MM/DD/YYYY by `order` (also with - or .), and "5 Oct 2026".
 */
export function parseDate(raw: string, order: DayOrder = 'DMY'): string | undefined {
	const s = raw.trim();
	if (!s) return undefined;
	let m = ISO_RE.exec(s);
	if (m) return iso(+m[1], +m[2], +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
	m = YMD_SLASH_RE.exec(s);
	if (m) return iso(+m[1], +m[2], +m[3]);
	m = DMY_RE.exec(s);
	if (m) {
		const [a, b] = [+m[1], +m[2]];
		const [d, mo] = order === 'DMY' ? [a, b] : [b, a];
		return iso(+m[3], mo, d, +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
	}
	m = NAMED_RE.exec(s);
	if (m) {
		const mo = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()) + 1;
		return mo ? iso(+m[3], mo, +m[1]) : undefined;
	}
	return undefined;
}

/** DD/MM unless a value proves MM/DD (a second part above 12 and no first part above 12). */
export function guessDayOrder(values: string[], fallback: DayOrder = 'DMY'): DayOrder {
	let firstOver = false;
	let secondOver = false;
	for (const v of values) {
		const m = DMY_RE.exec(v.trim());
		if (!m) continue;
		if (+m[1] > 12) firstOver = true;
		if (+m[2] > 12) secondOver = true;
	}
	if (secondOver && !firstOver) return 'MDY';
	if (firstOver && !secondOver) return 'DMY';
	return fallback;
}

export interface ColumnGuess {
	type: DatasetColumnType;
	order: DayOrder;
	/** Non-empty values in the sample. */
	filled: number;
}

/** A type for a column from its values: every non-empty value a number, else a date, else text. */
export function inferColumn(values: string[], fallbackOrder: DayOrder = 'DMY'): ColumnGuess {
	const sample = values.filter(v => v.trim() !== '');
	const order = guessDayOrder(sample, fallbackOrder);
	if (!sample.length) return { type: 'TEXT', order, filled: 0 };
	if (sample.every(v => parseNumber(v) !== undefined))
		return { type: 'NUMBER', order, filled: sample.length };
	if (sample.every(v => parseDate(v, order) !== undefined))
		return { type: 'DATE', order, filled: sample.length };
	return { type: 'TEXT', order, filled: sample.length };
}

/** A column the user is setting up in the import dialog. */
export interface DraftColumn {
	csvHeader: string;
	/** Index in the CSV row. */
	index: number;
	label: string;
	/** `SKIP` leaves the column out. */
	type: DatasetColumnType | 'SKIP';
	inferred: DatasetColumnType;
	order: DayOrder;
}

/** Draft columns for a parsed CSV; the type inference reads up to 2000 rows. */
export function draftColumns(csv: ParsedCsv, fallbackOrder: DayOrder = 'DMY'): DraftColumn[] {
	const sample = csv.rows.slice(0, 2000);
	return csv.header.map((h, index) => {
		const g = inferColumn(
			sample.map(r => r[index] ?? ''),
			fallbackOrder,
		);
		return {
			csvHeader: h,
			index,
			label: h.slice(0, DATASET_LIMITS.labelMax),
			type: g.type,
			inferred: g.type,
			order: g.order,
		};
	});
}

/**
 * Typed slots for the kept columns. On a replace the previous columns keep their slot when the
 * CSV header and type match, so widgets on the dataset keep working.
 */
export function assignSlots(
	drafts: DraftColumn[],
	previous?: DatasetColumn[],
):
	| { ok: true; columns: Array<DatasetColumn & { index: number; order: DayOrder }> }
	| { ok: false; error: string } {
	const kept = drafts.filter(d => d.type !== 'SKIP') as Array<
		DraftColumn & { type: DatasetColumnType }
	>;
	if (!kept.length) return { ok: false, error: 'Keep at least one column.' };
	if (kept.length > DATASET_LIMITS.columns)
		return { ok: false, error: `At most ${DATASET_LIMITS.columns} columns. Skip some.` };
	for (const t of ['TEXT', 'NUMBER', 'DATE'] as DatasetColumnType[]) {
		const n = kept.filter(k => k.type === t).length;
		if (n > DATASET_LIMITS.slots[t])
			return {
				ok: false,
				error: `At most ${DATASET_LIMITS.slots[t]} ${TYPE_LABELS[t].toLowerCase()} columns (${n} now). Skip some or change their type.`,
			};
	}
	const used = new Set<string>();
	const slotOf = new Map<DraftColumn, string>();
	for (const k of kept) {
		const prev = previous?.find(
			p =>
				p.type === k.type &&
				p.csvHeader.toLowerCase() === k.csvHeader.toLowerCase() &&
				!used.has(p.slot),
		);
		if (prev) {
			used.add(prev.slot);
			slotOf.set(k, prev.slot);
		}
	}
	// Free slots: never one a previous column held (a widget on it would read new data).
	const reserved = new Set([...(previous ?? []).map(p => p.slot), ...used]);
	for (const k of kept) {
		if (slotOf.has(k)) continue;
		let slot = '';
		for (let i = 1; i <= DATASET_LIMITS.slots[k.type]; i++) {
			const s = `${SLOT_PREFIX[k.type]}${i}`;
			if (!reserved.has(s)) {
				slot = s;
				break;
			}
		}
		if (!slot)
			for (let i = 1; i <= DATASET_LIMITS.slots[k.type]; i++) {
				const s = `${SLOT_PREFIX[k.type]}${i}`;
				if (!used.has(s)) {
					slot = s;
					break;
				}
			}
		used.add(slot);
		reserved.add(slot);
		slotOf.set(k, slot);
	}
	const labels = new Set<string>();
	for (const k of kept) {
		const l = k.label.trim().toLowerCase();
		if (!l) return { ok: false, error: `Give the column ${k.csvHeader} a label.` };
		if (labels.has(l))
			return { ok: false, error: `Two columns are labelled ${k.label.trim()}.` };
		labels.add(l);
	}
	return {
		ok: true,
		columns: kept.map(k => ({
			slot: slotOf.get(k)!,
			label: k.label.trim().slice(0, DATASET_LIMITS.labelMax),
			type: k.type,
			csvHeader: k.csvHeader.slice(0, 255),
			index: k.index,
			order: k.order,
		})),
	};
}

export interface ConvertStats {
	/** Values that did not read as their column's type (sent empty), per label. */
	bad: Record<string, number>;
	/** Text values cut to 255 characters. */
	cut: number;
	/** Rows with no value in any kept column: left out (the app refuses empty rows). */
	empty: number;
}

/** Rows in column order for `reportDatasetSave`: numbers, ISO dates, text; empty is null. */
export function convertRows(
	rows: string[][],
	columns: Array<DatasetColumn & { index: number; order: DayOrder }>,
): { rows: Array<Array<string | number | null>>; stats: ConvertStats } {
	const stats: ConvertStats = { bad: {}, cut: 0, empty: 0 };
	const all = rows.map(r =>
		columns.map(c => {
			const raw = (r[c.index] ?? '').trim();
			if (!raw) return null;
			if (c.type === 'NUMBER') {
				const n = parseNumber(raw);
				if (n === undefined) stats.bad[c.label] = (stats.bad[c.label] ?? 0) + 1;
				return n ?? null;
			}
			if (c.type === 'DATE') {
				const d = parseDate(raw, c.order);
				if (d === undefined) stats.bad[c.label] = (stats.bad[c.label] ?? 0) + 1;
				return d ?? null;
			}
			if (raw.length > DATASET_LIMITS.textMax) {
				stats.cut++;
				return raw.slice(0, DATASET_LIMITS.textMax);
			}
			return raw;
		}),
	);
	const out = all.filter(r => r.some(v => v !== null));
	stats.empty = all.length - out.length;
	return { rows: out, stats };
}

/** How many values of a draft column would not read as the picked type (for the preview). */
export function badCount(csv: ParsedCsv, d: DraftColumn): number {
	if (d.type === 'SKIP' || d.type === 'TEXT') return 0;
	let n = 0;
	for (const r of csv.rows) {
		const v = (r[d.index] ?? '').trim();
		if (!v) continue;
		if (
			d.type === 'NUMBER' ? parseNumber(v) === undefined : parseDate(v, d.order) === undefined
		)
			n++;
	}
	return n;
}

/** Rows in parts of `size` (at least one part, so an empty CSV still saves its columns). */
export function batches<T>(rows: T[], size = DATASET_LIMITS.batch): T[][] {
	if (!rows.length) return [[]];
	const out: T[][] = [];
	for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
	return out;
}

export function nameError(name: string, others: DatasetInfo[], selfId?: string): string {
	const n = name.trim();
	if (!n) return 'Give the data a name.';
	if (n.length > DATASET_LIMITS.nameMax)
		return `A name can have at most ${DATASET_LIMITS.nameMax} characters.`;
	if (others.some(d => d._id !== selfId && d.name.trim().toLowerCase() === n.toLowerCase()))
		return 'You already have data with this name.';
	return '';
}

/** A dataset name from a file name: "bookings_oct.csv" -> "bookings oct". */
export function nameFromFile(fileName: string): string {
	return (
		fileName
			.replace(/\.[^.]+$/, '')
			.replace(/[_]+/g, ' ')
			.trim()
			.slice(0, DATASET_LIMITS.nameMax) || 'My data'
	);
}

/**
 * The catalog source the app lists for a dataset (CONTRACT 10), as the sample data transport
 * builds it: field keys are the slots; text is a dimension, numbers measures, dates stringDate.
 */
export function datasetCatalogSource(ds: DatasetInfo) {
	const fields: Record<string, any> = {};
	for (const c of ds.columns)
		fields[c.slot] =
			c.type === 'NUMBER'
				? {
						kind: 'MEASURE',
						label: c.label,
						fns: ['COUNT', 'COUNT_DISTINCT', 'SUM', 'AVG', 'MIN', 'MAX'],
					}
				: c.type === 'DATE'
					? { kind: 'DATE', label: c.label, stringDate: true }
					: { kind: 'DIMENSION', label: c.label };
	return {
		kind: 'STORAGE' as const,
		storage: 'cxReportDatasetRow',
		label: ds.name,
		scope: 'REQUIRED',
		fields,
		records: { fields: ds.columns.map(c => c.slot) },
	};
}
