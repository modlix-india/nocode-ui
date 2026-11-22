import {
	addToShelf,
	COUNT_FIELD,
	emptyShelves,
	historyInit,
	historyKey,
	historyPush,
	historyRedo,
	historyUndo,
	itemOfField,
	moveOnShelves,
	shelvesToSpec,
	specToShelves,
} from '../shelves';
import { FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportSpec } from '../reportTypes';

const F = FIXTURE_CATALOG.sources.cases.fields!;
const base: ReportSpec = { v: 1, source: 'cases', view: { type: 'TABLE' } };
const item = (f: string) => itemOfField(f, F[f]);

describe('shelves -> spec (CONTRACT 8.3)', () => {
	test('a dimension on Columns and a measure on Rows: one group by, one measure, x set', () => {
		let sh = emptyShelves();
		sh = (addToShelf(sh, 'columns', item('assignedUserId')) as any).shelves;
		sh = (addToShelf(sh, 'rows', item('agreementValue')) as any).shelves;
		const s = shelvesToSpec(sh, base);
		expect(s.groupBy).toEqual([{ field: 'assignedUserId', as: 'assignedUserId' }]);
		expect(s.measures).toEqual([
			{ fn: 'SUM', field: 'agreementValue', as: 'sum_agreementValue' },
		]);
		expect(s.view.x).toBe('assignedUserId');
		expect(s.view.y).toBeUndefined();
		expect(s.view.style).toBeUndefined();
	});

	test('a date gets a month bucket; Color is the series; COUNT has no field', () => {
		let sh = emptyShelves();
		sh = (addToShelf(sh, 'columns', item('bookedAt')) as any).shelves;
		sh = (addToShelf(sh, 'color', item('productId')) as any).shelves;
		sh = (addToShelf(sh, 'rows', itemOfField(COUNT_FIELD, undefined)) as any).shelves;
		const s = shelvesToSpec(sh, base);
		expect(s.groupBy).toEqual([
			{ field: 'bookedAt', as: 'bookedAt', bucket: 'MONTH' },
			{ field: 'productId', as: 'productId' },
		]);
		expect(s.measures).toEqual([{ fn: 'COUNT', as: 'count' }]);
	});

	test('the dimension on Rows lies the chart down; Label turns data labels on; Size adds an undrawn measure', () => {
		let sh = emptyShelves();
		sh = (addToShelf(sh, 'rows', item('assignedUserId')) as any).shelves;
		sh = (addToShelf(sh, 'columns', itemOfField(COUNT_FIELD, undefined)) as any).shelves;
		sh = (addToShelf(sh, 'size', item('paidAmount')) as any).shelves;
		sh = (addToShelf(sh, 'label', itemOfField(COUNT_FIELD, undefined)) as any).shelves;
		const s = shelvesToSpec(sh, base);
		expect(s.view.style).toEqual({ swapAxes: true, dataLabels: 'outside' });
		expect(s.measures!.map(m => m.as)).toEqual(['count', 'sum_paidAmount']);
		expect(s.view.y).toEqual(['count']);
	});

	test('shelves refuse what they cannot hold and the caps', () => {
		const sh = emptyShelves();
		expect(addToShelf(sh, 'color', item('agreementValue'))).toEqual({
			ok: false,
			reason: 'Color takes a dimension',
		});
		expect(addToShelf(sh, 'size', item('productId'))).toEqual({
			ok: false,
			reason: 'Size takes a measure',
		});
		let two = (addToShelf(sh, 'columns', item('productId')) as any).shelves;
		two = (addToShelf(two, 'color', item('stageGroup')) as any).shelves;
		expect(addToShelf(two, 'rows', item('status'))).toEqual({
			ok: false,
			reason: 'At most 2 dimensions',
		});
		let three = sh;
		for (const f of ['agreementValue', 'paidAmount', COUNT_FIELD])
			three = (addToShelf(three, 'rows', itemOfField(f, F[f])) as any).shelves;
		expect(
			addToShelf(three, 'rows', { kind: 'MEASURE', field: 'paidAmount', fn: 'AVG' }),
		).toEqual({
			ok: false,
			reason: 'At most 3 measures (a table takes up to 6)',
		});
	});

	test('moving a pill between shelves', () => {
		let sh = emptyShelves();
		sh = (addToShelf(sh, 'columns', item('productId')) as any).shelves;
		const r = moveOnShelves(sh, { shelf: 'columns', index: 0 }, 'rows');
		expect(r.ok && r.shelves.rows[0].field).toBe('productId');
		expect(r.ok && r.shelves.columns).toEqual([]);
		expect(moveOnShelves(sh, { shelf: 'columns', index: 0 }, 'size').ok).toBe(false);
	});
});

describe('spec -> shelves -> spec keeps the spec', () => {
	const specs: ReportSpec[] = FIXTURE_CATALOG.defaults!.map(d => d.spec);
	specs.push({
		v: 1,
		source: 'cases',
		measures: [
			{ fn: 'COUNT', as: 'eois' },
			{ fn: 'COUNT', as: 'converted', segment: 'eois' },
		],
		derived: [{ as: 'rate', percent: ['converted', 'eois'] }],
		view: { type: 'KPI', y: ['rate'] },
	});
	specs.push({
		v: 1,
		source: 'cases',
		measures: [{ fn: 'SUM', field: 'agreementValue', as: 'value' }],
		groupBy: [
			{ field: 'bookedAt', bucket: 'QUARTER', as: 'q' },
			{ field: 'productId', as: 'p' },
		],
		view: { type: 'STACKED_BAR', x: 'q', style: { swapAxes: true, dataLabels: 'inside' } },
	});
	test.each(specs.map(s => [s.view.title ?? s.view.type, s]))('%s', (_, spec) => {
		const s = spec as ReportSpec;
		expect(shelvesToSpec(specToShelves(s, FIXTURE_CATALOG), s)).toEqual(s);
	});

	test('a measure leaving the value shelves leaves view.y; a new one joins it', () => {
		const sales = FIXTURE_CATALOG.defaults!.find(d => d.id === 'salesPerformance')!.spec;
		const sh = specToShelves(sales, FIXTURE_CATALOG);
		expect(sh.columns.map(i => i.as)).toEqual(['rm']);
		expect(sh.rows.map(i => i.as)).toEqual(['bookings', 'value']);
		const moved = moveOnShelves(sh, { shelf: 'rows', index: 1 }, 'size');
		if (!moved.ok) throw new Error(moved.reason);
		expect(shelvesToSpec(moved.shelves, sales).view.y).toEqual(['bookings']);
		const added = addToShelf(sh, 'rows', item('paidAmount'));
		if (!added.ok) throw new Error(added.reason);
		expect(shelvesToSpec(added.shelves, sales).view.y).toEqual([
			'bookings',
			'value',
			'sum_paidAmount',
		]);
	});
});

describe('undo / redo (CONTRACT 8.3)', () => {
	test('push, undo, redo; a new change drops the redo trail; same value is no step', () => {
		let h = historyInit(1);
		h = historyPush(h, 2);
		h = historyPush(h, 3);
		h = historyPush(h, 3);
		expect(h.past).toEqual([1, 2]);
		h = historyUndo(h);
		expect(h.present).toBe(2);
		h = historyUndo(h);
		h = historyUndo(h);
		expect(h.present).toBe(1);
		h = historyRedo(h);
		expect(h.present).toBe(2);
		h = historyPush(h, 9);
		expect(h.future).toEqual([]);
		expect(historyRedo(h)).toBe(h);
	});

	test('typing (one group) is one step', () => {
		let h = historyInit('');
		for (const v of ['M', 'My', 'My n']) h = historyPush(h, v, 'name');
		expect(h.past).toEqual(['']);
		h = historyPush(h, 'other');
		expect(historyUndo(historyUndo(h)).present).toBe('');
	});

	test('keys: Ctrl/Cmd+Z undo, with Shift redo, Ctrl+Y redo', () => {
		expect(historyKey({ key: 'z', ctrlKey: true })).toBe('undo');
		expect(historyKey({ key: 'Z', metaKey: true, shiftKey: true })).toBe('redo');
		expect(historyKey({ key: 'y', ctrlKey: true })).toBe('redo');
		expect(historyKey({ key: 'z' })).toBeUndefined();
	});
});
