import {
	checkImport,
	csvCell,
	exportFileName,
	importIntoDoc,
	parseReportFile,
	pdfDocument,
	pdfItem,
	pdfTarget,
	PDF_CAPS,
	reportFile,
	toCsv,
	exportPdf,
} from '../reportExport';
import { emptyDoc } from '../dashboardModel';
import { DASHBOARD_CAPS, ReportOutput, ReportSpec } from '../reportTypes';

const spec: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	view: { type: 'KPI' },
};

describe('CSV (CONTRACT 8.2)', () => {
	test('cells: numbers raw, text quoted when needed, quotes doubled, formulas kept as text', () => {
		expect(csvCell(1234567.5)).toBe('1234567.5');
		expect(csvCell(-3)).toBe('-3');
		expect(csvCell(null)).toBe('');
		expect(csvCell(undefined)).toBe('');
		expect(csvCell(NaN)).toBe('');
		expect(csvCell('plain')).toBe('plain');
		expect(csvCell('a,b')).toBe('"a,b"');
		expect(csvCell('say "hi"')).toBe('"say ""hi"""');
		expect(csvCell('two\nlines')).toBe('"two\nlines"');
		expect(csvCell(' padded')).toBe('" padded"');
		expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)");
		expect(csvCell('@cmd')).toBe("'@cmd");
		expect(csvCell('-x')).toBe("'-x");
		expect(csvCell('-5 units')).toBe('-5 units');
		expect(csvCell('2026-11-17')).toBe('2026-11-17');
	});

	test('a result: labels as headers, dimension labels, raw measures and ISO dates', () => {
		const csv = toCsv({
			columns: [
				{ key: 'rm', label: 'RM', kind: 'DIMENSION' },
				{ key: 'rm_label', hidden: true },
				{ key: 'month', label: 'Month', kind: 'DATE' },
				{ key: 'value', label: 'Agreement value', kind: 'MEASURE', format: 'MONEY' },
				{ key: 'secret', label: 'Hidden', hidden: true },
			],
			rows: [
				{ rm: 'u1', rm_label: 'Asha, R', month: '2026-11-01', value: 45000000, secret: 1 },
				{ rm: 'u2', month: '2026-12-01' },
			],
		});
		expect(csv).toBe(
			'RM,Month,Agreement value\r\n"Asha, R",2026-11-01,45000000\r\nu2,2026-12-01,\r\n',
		);
	});

	test('file names: widget name and date, unsafe characters out', () => {
		expect(exportFileName('Sales / performance', 'csv', new Date(2026, 10, 21))).toBe(
			'Sales performance 2026-11-21.csv',
		);
		expect(exportFileName('', 'pdf', new Date(2026, 0, 2))).toBe('report 2026-01-02.pdf');
	});
});

describe('PDF document (CONTRACT 8.2)', () => {
	const out = {
		columns: [
			{ key: 'rm', label: 'RM', kind: 'DIMENSION' },
			{ key: 'n', label: 'Bookings', kind: 'MEASURE' },
		],
		rows: Array.from({ length: 250 }, (_, i) => ({ rm: `u${i}`, n: i * 1000 })),
	};

	test('an item: formatted rows, at most 200, numbers right aligned', () => {
		const item = pdfItem('Sales', 'This quarter', out, { locale: 'en-IN' }, 'data:image/png;base64,AA');
		expect(item.rows.length).toBe(PDF_CAPS.rows);
		expect(item.columns).toEqual([
			{ key: 'rm', label: 'RM' },
			{ key: 'n', label: 'Bookings', align: 'right' },
		]);
		expect(item.rows[2]).toEqual({ rm: 'u2', n: '2,000' });
		expect(item.image).toBe('data:image/png;base64,AA');
	});

	test('the document: 24 items at most; too big drops images first, then refuses', () => {
		const items = Array.from({ length: 30 }, (_, i) => pdfItem(`W${i}`, undefined, out, {}));
		const d = pdfDocument('Dashboard', items, { now: new Date('2026-11-21T10:00:00Z') });
		expect(d.ok).toBe(true);
		if (d.ok) {
			expect(d.document.items.length).toBe(PDF_CAPS.items);
			expect(d.document.generatedAt).toBe('2026-11-21T10:00:00.000Z');
		}
		const big = 'data:image/png;base64,' + 'A'.repeat(5 * 1024 * 1024);
		const two = pdfDocument('D', [
			pdfItem('a', '', out, {}, big),
			pdfItem('b', '', out, {}, big),
		]);
		expect(two.ok && two.document.items.map(i => !!i.image)).toEqual([true, false]);
		expect(pdfDocument('D', []).ok).toBe(false);
	});

	test('the answer: a file record url, a data URL or base64 at any depth', () => {
		expect(pdfTarget({ fileData: { url: '/api/files/x.pdf', fileName: 'r.pdf' } })).toEqual({
			kind: 'url',
			url: '/api/files/x.pdf',
			fileName: 'r.pdf',
		});
		expect(pdfTarget({ result: 'data:application/pdf;base64,JVBER' })).toEqual({
			kind: 'url',
			url: 'data:application/pdf;base64,JVBER',
		});
		expect(pdfTarget({ pdf: 'JVBERi0xLjQK' })).toEqual({ kind: 'base64', data: 'JVBERi0xLjQK' });
		expect(pdfTarget({ nothing: 1 })).toBeUndefined();
	});

	test('exportPdf calls <ns>.reportPdf with the document and reports a missing PDF', async () => {
		const call = jest.fn(async () => [{ name: 'output', result: { ok: true } }]);
		const t = { call, loadDoc: async () => ({}), saveDoc: async () => {} };
		const d = pdfDocument('X', [pdfItem('a', '', out, {})]);
		if (!d.ok) throw new Error('no document');
		expect(await exportPdf(t, 'CxZump.reportPdf', d.document, 'x.pdf')).toBe(
			'The PDF did not come back.',
		);
		expect(call).toHaveBeenCalledWith('CxZump.reportPdf', { document: d.document });
		expect(await exportPdf(t, '', d.document, 'x.pdf')).toMatch(/not set up/);
	});
});

describe('widget / dashboard file (CONTRACT 8.2)', () => {
	const file = reportFile(
		'CxZump',
		[
			{ id: 'a', name: 'One', spec, refreshMin: 5 },
			{ id: 'b', name: 'Two', spec: { ...spec, source: 'gone' } },
		],
		[
			{ id: 'b', x: 0, y: 0, w: 6, h: 4 },
			{ id: 'a', x: 6, y: 0, w: 3, h: 2, isNew: true },
			{ id: 'zzz', x: 0, y: 4, w: 3, h: 2 },
		],
	);

	test('export: specs only (no data, no defaultId), layout of the widgets in it', () => {
		expect(file.kind).toBe('modlix.reports');
		expect(file.widgets.a).toEqual({ name: 'One', spec, refreshMin: 5 });
		expect(file.layout).toEqual([
			{ id: 'b', x: 0, y: 0, w: 6, h: 4 },
			{ id: 'a', x: 6, y: 0, w: 3, h: 2 },
		]);
	});

	test('import refuses a wrong kind, another app, or no widgets', () => {
		expect(parseReportFile('nope', 'CxZump')).toEqual({ ok: false, error: 'This is not a reports file.' });
		expect(parseReportFile(JSON.stringify({ ...file, kind: 'x' }), 'CxZump').ok).toBe(false);
		const other = parseReportFile(JSON.stringify(file), 'LeadZump');
		expect(other.ok).toBe(false);
		expect(!other.ok && other.error).toMatch(/another app/);
		expect(parseReportFile(JSON.stringify({ ...file, widgets: { x: { name: 'bad' } } }), 'CxZump').ok).toBe(false);
		expect(parseReportFile(JSON.stringify(file), 'cxzump').ok).toBe(true);
	});

	test('each spec is dry run; failures are kept with the reason under new ids', async () => {
		const parsed = parseReportFile(JSON.stringify(file), 'CxZump');
		if (!parsed.ok) throw new Error(parsed.error);
		const dry = jest.fn(
			async (s: ReportSpec): Promise<ReportOutput> =>
				s.source === 'gone'
					? { ok: false, error: { code: 'UNKNOWN_SOURCE', message: 'Unknown source gone' } }
					: { ok: true, columns: [], rows: [] },
		);
		const verdicts = await checkImport(parsed.file, dry, e => e.message ?? e.code);
		expect(verdicts).toEqual([
			{ id: 'a', name: 'One', ok: true },
			{ id: 'b', name: 'Two', ok: false, reason: 'Unknown source gone' },
		]);
		const doc = { ...emptyDoc(), widgets: { a: { name: 'Mine', spec } } };
		const r = importIntoDoc(doc, parsed.file, verdicts, { toDashboard: true });
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.imported).toBe(2);
		expect(r.doc.widgets.a.name).toBe('Mine');
		const fresh = Object.entries(r.doc.widgets).filter(([id]) => id !== 'a');
		expect(fresh.map(([, w]) => [w.name, w.importError])).toEqual([
			['Two', 'Unknown source gone'],
			['One', undefined],
		]);
		expect(r.doc.layout.length).toBe(2);
		expect(r.doc.layout.find(l => l.id === fresh[0][0])).toMatchObject({ w: 6, h: 4 });
	});

	test('caps: a full library takes nothing', () => {
		const widgets = Object.fromEntries(
			Array.from({ length: DASHBOARD_CAPS.saved }, (_, i) => [`w${i}`, { name: 'x', spec }]),
		);
		const parsed = parseReportFile(JSON.stringify(file), 'CxZump');
		if (!parsed.ok) throw new Error(parsed.error);
		const r = importIntoDoc({ ...emptyDoc(), widgets }, parsed.file, []);
		expect(r.ok).toBe(false);
	});
});
