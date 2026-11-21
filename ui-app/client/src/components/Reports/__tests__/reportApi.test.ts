import {
	clearCatalogCache,
	docName,
	errorText,
	eventResults,
	loadCatalog,
	ReportTransport,
	runReport,
	splitFunctionName,
} from '../reportApi';
import { fixtureRun, fixtureTransport, FIXTURE_CATALOG } from '../fixtures/reportFixtures';

const fake = (answer: any): ReportTransport & { calls: any[] } => {
	const calls: any[] = [];
	return {
		calls,
		call: async (fn, args) => {
			calls.push([fn, args]);
			if (answer instanceof Error) throw answer;
			return typeof answer === 'function' ? answer(fn, args) : answer;
		},
		loadDoc: async () => ({}),
		saveDoc: async () => {},
	};
};

const spec: any = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	view: { type: 'KPI' },
};

beforeEach(() => clearCatalogCache());

test('function names and personalization doc names', () => {
	expect(splitFunctionName('CxZump.reportRun')).toEqual({
		namespace: 'CxZump',
		name: 'reportRun',
	});
	expect(() => splitFunctionName('nodot')).toThrow();
	expect(docName('dashboard')).toBe('reports_dashboard');
	expect(docName('')).toBe('reports_dashboard');
	expect(docName('my board')).toBe('reports_my_board');
});

test('the run answer is read from the output event, whatever the output is named', async () => {
	const out = { ok: true, columns: [{ key: 'n', kind: 'MEASURE' }], rows: [{ n: 4 }] };
	const t = fake([{ name: 'output', result: { result: out } }]);
	const r = await runReport(t, 'CxZump.reportRun', spec, { force: true });
	expect(r).toEqual(out);
	expect(t.calls[0]).toEqual(['CxZump.reportRun', { spec, force: true, dryRun: false }]);
	expect(eventResults([{ name: 'output', result: { x: 1 } }])).toEqual({ x: 1 });
});

test('runner errors and transport failures come back as ok:false, never thrown', async () => {
	const bad = fake([
		{
			name: 'output',
			result: {
				result: {
					ok: false,
					error: { code: 'BAD_VIEW', message: 'no', path: 'view.type' },
				},
			},
		},
	]);
	expect(await runReport(bad, 'A.b', spec)).toEqual({
		ok: false,
		error: { code: 'BAD_VIEW', message: 'no', path: 'view.type' },
	});
	const down = fake(new Error('boom'));
	const r = await runReport(down, 'A.b', spec);
	expect(r.ok).toBe(false);
	expect(await runReport(down, '', spec)).toMatchObject({
		ok: false,
		error: { code: 'BAD_FUNCTION' },
	});
});

test('a run that takes too long times out with TIMEOUT', async () => {
	const slow: ReportTransport = {
		call: () => new Promise(() => {}),
		loadDoc: async () => ({}),
		saveDoc: async () => {},
	};
	const r = await runReport(slow, 'A.b', spec, { timeoutMs: 20 });
	expect(r).toMatchObject({ ok: false, error: { code: 'TIMEOUT' } });
	expect(errorText((r as any).error)).toMatch(/too long/);
});

test('the catalog is loaded once per function; a failure is not cached', async () => {
	const t = fake([{ name: 'output', result: { result: FIXTURE_CATALOG } }]);
	const a = await loadCatalog(t, 'CxZump.reportCatalog');
	await loadCatalog(t, 'CxZump.reportCatalog');
	expect(a.locale).toBe('en-IN');
	expect(t.calls.length).toBe(1);
	const f = fake(new Error('down'));
	await expect(loadCatalog(f, 'X.reportCatalog')).rejects.toThrow();
	await expect(loadCatalog(f, 'X.reportCatalog')).rejects.toThrow();
	expect(f.calls.length).toBe(2);
});

describe('fixtures follow CONTRACT section 3', () => {
	test('a group by result carries key, hidden label, measures with format and currency', () => {
		const d = FIXTURE_CATALOG.defaults!.find(e => e.id === 'salesPerformance')!;
		const r = fixtureRun(d.spec);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.columns).toEqual([
			{ key: 'rm', label: 'RM', kind: 'DIMENSION' },
			{ key: 'rm_label', hidden: true },
			{ key: 'bookings', label: 'Bookings', kind: 'MEASURE', format: 'NUMBER' },
			{
				key: 'value',
				label: 'Agreement value',
				kind: 'MEASURE',
				format: 'MONEY',
				currency: 'INR',
			},
		]);
		expect(r.rows[0]).toEqual(
			expect.objectContaining({ rm: expect.any(String), rm_label: expect.any(String) }),
		);
		expect(r.rows.length).toBeLessThanOrEqual(10);
		expect(typeof r.refreshedAt).toBe('string');
	});

	test('date buckets: ISO start in the key, a readable label', () => {
		const d = FIXTURE_CATALOG.defaults!.find(e => e.id === 'customerAcquisition')!;
		const r = fixtureRun(d.spec);
		if (!r.ok) throw new Error('fixture failed');
		expect(r.rows[0].month).toMatch(/^\d{4}-\d{2}-01$/);
		expect(r.rows[0].month_label).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
	});

	test('validation errors and dry runs', () => {
		expect(fixtureRun({ ...spec, view: { type: 'PIE' } })).toMatchObject({
			ok: false,
			error: { code: 'BAD_VIEW', path: 'view.type' },
		});
		expect(
			fixtureRun({
				...spec,
				groupBy: [{ field: 'customerEmail', as: 'e' }],
				view: { type: 'TABLE' },
			}),
		).toMatchObject({ ok: false, error: { code: 'PII_GROUP' } });
		const dry = fixtureRun(spec, true);
		expect(dry).toMatchObject({ ok: true, rows: [] });
	});

	test('the fixture transport answers like /function/execute', async () => {
		const r = await runReport(fixtureTransport, 'CxZump.reportRun', spec);
		expect(r.ok).toBe(true);
		expect((await loadCatalog(fixtureTransport, 'CxZump.reportCatalog')).quickFilters).toEqual([
			'productId',
			'assignedUserId',
		]);
	});
});
