import {
	datasetFunctions,
	deleteDataset,
	listDatasets,
	renameDataset,
	saveDataset,
} from '../datasetApi';
import {
	assignSlots,
	batches,
	convertRows,
	DraftColumn,
	draftColumns,
	guessDayOrder,
	inferColumn,
	nameError,
	nameFromFile,
	parseCsv,
	parseDate,
	parseNumber,
} from '../datasetModel';
import { fixtureTransport, resetFixtureDatasets } from '../fixtures/reportFixtures';
import { errorText, ReportTransport } from '../reportApi';
import { bySize, valuesSpec } from '../reportSpecUtil';

describe('parseCsv', () => {
	it('reads quotes, doubled quotes, line breaks in quotes, CRLF and a BOM', () => {
		const csv = parseCsv(
			'﻿Name,Note,Amount\r\n"Rao, A","He said ""hi""",10\r\n"B","two\nlines",20\r\n',
		);
		expect(csv.header).toEqual(['Name', 'Note', 'Amount']);
		expect(csv.rows).toEqual([
			['Rao, A', 'He said "hi"', '10'],
			['B', 'two\nlines', '20'],
		]);
		expect(csv.delimiter).toBe(',');
	});
	it('detects semicolons and tabs, pads short rows, cuts long ones, skips blank lines', () => {
		expect(parseCsv('a;b\n1;2\n').delimiter).toBe(';');
		const t = parseCsv('a\tb\tc\n1\n\n1\t2\t3\t4');
		expect(t.delimiter).toBe('\t');
		expect(t.rows).toEqual([
			['1', '', ''],
			['1', '2', '3'],
		]);
	});
	it('names empty and repeated headers', () => {
		expect(parseCsv('Amount,,amount\n1,2,3').header).toEqual([
			'Amount',
			'Column 2',
			'amount 2',
		]);
	});
	it('marks a file over the row limit', () => {
		const text = 'a\n' + Array.from({ length: 12 }, (_, i) => i).join('\n');
		expect(parseCsv(text, 10).truncated).toBe(true);
		expect(parseCsv(text, 12).truncated).toBe(false);
	});
});

describe('values', () => {
	it('numbers', () => {
		expect(parseNumber('1,234.50')).toBe(1234.5);
		expect(parseNumber('-12')).toBe(-12);
		expect(parseNumber('(40)')).toBe(-40);
		expect(parseNumber('.5')).toBe(0.5);
		expect(parseNumber('12,34')).toBeUndefined();
		expect(parseNumber('45%')).toBeUndefined();
		expect(parseNumber('abc')).toBeUndefined();
		expect(parseNumber('')).toBeUndefined();
	});
	it('dates as 19 character ISO text', () => {
		expect(parseDate('2026-10-05')).toBe('2026-10-05T00:00:00');
		expect(parseDate('2026-10-05T14:30:00Z')).toBe('2026-10-05T14:30:00');
		expect(parseDate('05/10/2026')).toBe('2026-10-05T00:00:00');
		expect(parseDate('05/10/2026', 'MDY')).toBe('2026-05-10T00:00:00');
		expect(parseDate('5-Oct-2026')).toBe('2026-10-05T00:00:00');
		expect(parseDate('2026/10/05')).toBe('2026-10-05T00:00:00');
		expect(parseDate('31/02/2026')).toBeUndefined();
		expect(parseDate('hello')).toBeUndefined();
	});
	it('day order from the values', () => {
		expect(guessDayOrder(['13/01/2026', '02/03/2026'])).toBe('DMY');
		expect(guessDayOrder(['01/13/2026', '02/03/2026'])).toBe('MDY');
		expect(guessDayOrder(['01/02/2026'], 'MDY')).toBe('MDY');
	});
	it('column types: all numbers, else all dates, else text; empties ignored', () => {
		expect(inferColumn(['1', '', '2.5']).type).toBe('NUMBER');
		expect(inferColumn(['2026-01-01', '']).type).toBe('DATE');
		expect(inferColumn(['1', 'x']).type).toBe('TEXT');
		expect(inferColumn(['', '']).type).toBe('TEXT');
	});
});

describe('slots', () => {
	const csv = parseCsv('City,Amount,On,Units\nPune,10,2026-01-02,3\nGoa,x,2026-02-03,4\n');
	const drafts = draftColumns(csv);
	it('draft columns carry the inferred type', () => {
		expect(drafts.map(d => [d.csvHeader, d.type])).toEqual([
			['City', 'TEXT'],
			['Amount', 'TEXT'],
			['On', 'DATE'],
			['Units', 'NUMBER'],
		]);
	});
	it('assigns typed slots and converts rows (bad numbers empty, counted)', () => {
		const ds = drafts.map(d =>
			d.csvHeader === 'Amount' ? { ...d, type: 'NUMBER' as const } : d,
		);
		const r = assignSlots(ds);
		if (!r.ok) throw new Error(r.error);
		expect(r.columns.map(c => c.slot)).toEqual(['s1', 'n1', 'd1', 'n2']);
		const out = convertRows(csv.rows, r.columns);
		expect(out.rows).toEqual([
			['Pune', 10, '2026-01-02T00:00:00', 3],
			['Goa', null, '2026-02-03T00:00:00', 4],
		]);
		expect(out.stats.bad).toEqual({ Amount: 1 });
	});
	it('a replace keeps the slot of a column with the same header and type; new ones never reuse an old slot', () => {
		const prev = [
			{ slot: 'n1', label: 'Units', type: 'NUMBER' as const, csvHeader: 'Units' },
			{ slot: 'n2', label: 'Old', type: 'NUMBER' as const, csvHeader: 'Gone' },
			{ slot: 's1', label: 'City', type: 'TEXT' as const, csvHeader: 'city' },
		];
		const ds = drafts.map(d =>
			d.csvHeader === 'Amount' ? { ...d, type: 'NUMBER' as const } : d,
		);
		const r = assignSlots(ds, prev);
		if (!r.ok) throw new Error(r.error);
		expect(Object.fromEntries(r.columns.map(c => [c.csvHeader, c.slot]))).toEqual({
			City: 's1',
			Amount: 'n3',
			On: 'd1',
			Units: 'n1',
		});
	});
	it('refuses too many of a type, no columns, empty or repeated labels', () => {
		const many: DraftColumn[] = Array.from({ length: 11 }, (_, i) => ({
			csvHeader: `D${i}`,
			index: i,
			label: `D${i}`,
			type: 'DATE',
			inferred: 'DATE',
			order: 'DMY',
		}));
		expect(assignSlots(many)).toMatchObject({ ok: false });
		expect(assignSlots(drafts.map(d => ({ ...d, type: 'SKIP' as const })))).toMatchObject({
			ok: false,
		});
		expect(assignSlots(drafts.map(d => ({ ...d, label: 'Same' })))).toMatchObject({
			ok: false,
		});
		expect(assignSlots(drafts.map((d, i) => (i ? d : { ...d, label: ' ' })))).toMatchObject({
			ok: false,
		});
	});
	it('batches of 1000, one empty part for no rows', () => {
		expect(batches(Array(2500).fill(0)).map(b => b.length)).toEqual([1000, 1000, 500]);
		expect(batches([])).toEqual([[]]);
	});
	it('names', () => {
		expect(nameFromFile('bookings_oct.csv')).toBe('bookings oct');
		expect(nameError('', [])).toBeTruthy();
		expect(nameError('Sales', [{ _id: 'a', name: 'sales', columns: [] }])).toBeTruthy();
		expect(nameError('Sales', [{ _id: 'a', name: 'sales', columns: [] }], 'a')).toBe('');
	});
});

test('rows with no value in any kept column are left out (the app refuses them)', () => {
	const csv = parseCsv('A,B\n1,x\n,\n2,\n');
	const r = assignSlots(draftColumns(csv));
	if (!r.ok) throw new Error(r.error);
	const out = convertRows(csv.rows, r.columns);
	expect(out.rows).toEqual([
		[1, 'x'],
		[2, null],
	]);
	expect(out.stats.empty).toBe(1);
});

test('rename is a part 0 save (metadata only), never a save without part', async () => {
	const calls: any[] = [];
	const t: ReportTransport = {
		...fixtureTransport,
		async call(fn, args) {
			calls.push(args);
			return [{ name: 'output', result: { dataset: { _id: 'd1' } } }];
		},
	};
	await renameDataset(t, datasetFunctions('CxZump')!, { _id: 'd1', name: 'a', columns: [] }, 'b');
	expect(calls[0]).toMatchObject({ datasetId: 'd1', name: 'b', part: 0, parts: 0, rows: [] });
});

describe('dataset functions (sample data transport)', () => {
	beforeEach(() => resetFixtureDatasets());
	const fns = datasetFunctions('CxZump')!;
	const columns = [{ slot: 'n1', label: 'Units', type: 'NUMBER' as const, csvHeader: 'Units' }];

	it('saves in parts with progress, lists, replaces (same id), deletes', async () => {
		const progress: number[] = [];
		const rows = Array.from({ length: 2300 }, (_, i) => [i]);
		const id = await saveDataset(fixtureTransport, fns, { name: 'Units', columns, rows }, p =>
			progress.push(p.part),
		);
		expect(progress).toEqual([0, 1, 2, 3]);
		let list = await listDatasets(fixtureTransport, fns);
		expect(list.map(d => [d._id, d.name, d.rowCount])).toEqual([[id, 'Units', 2300]]);
		const again = await saveDataset(fixtureTransport, fns, {
			datasetId: id,
			name: 'Units',
			columns,
			rows: rows.slice(0, 10),
		});
		expect(again).toBe(id);
		list = await listDatasets(fixtureTransport, fns);
		expect(list[0].rowCount).toBe(10);
		await deleteDataset(fixtureTransport, fns, id);
		expect(await listDatasets(fixtureTransport, fns)).toEqual([]);
	});

	it('reads the app answers: output {dataset, saved}; an error event is thrown with its message', async () => {
		const t: ReportTransport = {
			...fixtureTransport,
			async call(fn) {
				if (/Save$/.test(fn))
					return [
						{
							name: 'output',
							result: { dataset: { _id: 'x9', rowCount: 1 }, saved: 1 },
						},
					];
				if (/List$/.test(fn))
					return [
						{
							name: 'output',
							result: {
								datasets: [{ _id: 'x9', name: 'N', columns: [], rowCount: 1 }],
							},
						},
					];
				return [
					{
						name: 'error',
						result: {
							status: 404,
							reason: 'NOT_FOUND',
							message: 'That dataset is not there any more.',
						},
					},
				];
			},
		};
		expect(await saveDataset(t, fns, { name: 'N', columns, rows: [[1]] })).toBe('x9');
		expect((await listDatasets(t, fns)).map(d => d._id)).toEqual(['x9']);
		await expect(deleteDataset(t, fns, 'x9')).rejects.toThrow(
			'That dataset is not there any more.',
		);
	});

	it('a failed part names itself and carries the id made so far', async () => {
		let n = 0;
		const flaky: ReportTransport = {
			...fixtureTransport,
			async call(fn, args) {
				if (/Save$/.test(fn) && ++n === 2) throw new Error('boom');
				return fixtureTransport.call(fn, args);
			},
		};
		const rows = Array.from({ length: 1500 }, (_, i) => [i]);
		await expect(saveDataset(flaky, fns, { name: 'X', columns, rows })).rejects.toMatchObject({
			message: 'Part 2 of 2 did not save: boom',
			datasetId: 'ds1',
		});
	});

	it('an unknown dataset source reads as deleted; datasets never become the default source', () => {
		expect(errorText({ code: 'UNKNOWN_SOURCE' }, 'dataset:x')).toMatch(/^Dataset deleted/);
		expect(errorText({ code: 'UNKNOWN_SOURCE', message: 'm' }, 'cases')).toBe('m');
		const sources: Array<[string, any]> = [
			['dataset:a', { fields: { a: {}, b: {}, c: {}, d: {} } }],
			['cases', { fields: { a: {} } }],
		];
		expect(sources.sort(bySize)[0][0]).toBe('cases');
	});

	it('filter values come from the edited dataset, not another one with the same slot', () => {
		const catalog: any = {
			sources: {
				'dataset:a': { kind: 'STORAGE', fields: { s1: { kind: 'DIMENSION' } } },
				'dataset:b': { kind: 'STORAGE', fields: { s1: { kind: 'DIMENSION' }, s2: {} } },
			},
		};
		expect(valuesSpec(catalog, 's1', 'dataset:a')?.source).toBe('dataset:a');
		expect(valuesSpec(catalog, 's1', 'dataset:b')?.source).toBe('dataset:b');
	});
});

test('a run on a source whose data just changed skips the runner cache', async () => {
	const { markSourceChanged, runReport } = await import('../reportApi');
	const calls: any[] = [];
	const t: ReportTransport = {
		...fixtureTransport,
		async call(_fn, args) {
			calls.push(args);
			return [{ name: 'output', result: { result: { ok: true, columns: [], rows: [] } } }];
		},
	};
	const spec: any = { v: 1, source: 'dataset:zz', view: { type: 'TABLE' } };
	await runReport(t, 'CxZump.reportRun', spec);
	markSourceChanged('dataset:zz');
	await runReport(t, 'CxZump.reportRun', spec);
	await runReport(t, 'CxZump.reportRun', { ...spec, source: 'cases' });
	expect(calls.map(c => c.force)).toEqual([false, true, false]);
});
