import { FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import {
	applyBy,
	applyPeriod,
	applySegment,
	applyShow,
	autoName,
	byChoices,
	describeSpec,
	periodField,
	showChoices,
	simpleState,
	suggestedViews,
} from '../simpleForm';
import { ReportSpec } from '../reportTypes';

const C = FIXTURE_CATALOG;
const base: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'count' }],
	view: { type: 'KPI' },
};

describe('simple builder model', () => {
	it('choices in plain words from the catalog', () => {
		const shows = showChoices({ ...base, segment: 'bookings' }, C).map(c => c.label);
		expect(shows[0]).toBe('Count of bookings');
		expect(shows).toContain('Sum of agreement value');
		const bys = byChoices(base, C).map(c => c.label);
		expect(bys[0]).toBe('Nothing (one number)');
		expect(bys).toContain('RM');
		expect(bys).toContain('Month of booked on');
	});

	it('round trip: Show, By, Period, Which records build the spec and read back', () => {
		let s = applySegment(base, 'bookings');
		s = applyShow(s, 'SUM:agreementValue');
		s = applyBy(s, 'd:assignedUserId');
		s = applyPeriod(s, C, 'THIS_QUARTER');
		expect(s).toMatchObject({
			segment: 'bookings',
			measures: [{ fn: 'SUM', field: 'agreementValue' }],
			groupBy: [{ field: 'assignedUserId' }],
			filters: [{ field: periodField(s, C), period: 'THIS_QUARTER' }],
		});
		expect(s.view.x).toBe(s.groupBy![0].as);
		expect(s.view.y).toEqual([s.measures![0].as]);
		const st = simpleState(s, C);
		expect(st).toMatchObject({
			show: 'SUM:agreementValue',
			by: 'd:assignedUserId',
			period: 'THIS_QUARTER',
			segment: 'bookings',
			unsupported: [],
		});
		expect(describeSpec(s, C)).toBe('Sum of agreement value by RM, this quarter');
		expect(autoName(s, C)).toBe('Sum of agreement value by RM');
		// Back to one number: the group by and its sort go, the rest stays.
		const one = applyBy({ ...s, sort: [{ by: s.groupBy![0].as, dir: 'ASC' }] }, '');
		expect(one.groupBy).toBeUndefined();
		expect(one.sort).toBeUndefined();
		expect(one.filters).toEqual(s.filters);
		// A date by month; custom dates.
		const m = applyPeriod(
			applyBy(base, 't:bookedAt:MONTH'),
			C,
			'CUSTOM',
			'2026-01-01',
			'2026-03-31',
		);
		expect(m.groupBy).toEqual([{ field: 'bookedAt', as: 'bookedAt', bucket: 'MONTH' }]);
		expect(describeSpec(m, C)).toMatch(
			/^Count of cases by month of booked on, 1 Jan 2026 to 31 Mar 2026$/,
		);
		expect(applyPeriod(m, C, '').filters).toBeUndefined();
	});

	it('never drops what the questions cannot show', () => {
		const rich: ReportSpec = {
			v: 1,
			source: 'cases',
			measures: [
				{ fn: 'COUNT', as: 'n' },
				{ fn: 'SUM', field: 'agreementValue', as: 'v' },
			],
			groupBy: [
				{ field: 'assignedUserId', as: 'rm' },
				{ field: 'productId', as: 'p' },
			],
			filters: [
				{ field: 'status', op: 'IN', values: ['OPEN'] },
				{ field: 'bookedAt', period: 'THIS_FY' },
			],
			sort: [{ by: 'n', dir: 'DESC' }],
			limit: 5,
			compare: { to: 'PREVIOUS_PERIOD' },
			view: { type: 'STACKED_BAR', x: 'rm', y: ['n'], style: { legend: 'bottom' } },
		};
		const st = simpleState(rich, C);
		expect(st.unsupported).toEqual([
			'more than one value',
			'a colour split',
			'filters',
			'a comparison',
		]);
		expect(st.inUse).toEqual(['sort', 'top 5', 'style']);
		const s = applyPeriod(
			applyBy(applyShow(rich, 'COUNT_DISTINCT:assignedUserId'), 'd:status'),
			C,
			'LAST_FY',
		);
		expect(s.measures![1]).toEqual(rich.measures![1]);
		expect(s.groupBy![1]).toEqual(rich.groupBy![1]);
		expect(s.filters![0]).toEqual(rich.filters![0]);
		expect(s.filters![1]).toEqual({ field: 'bookedAt', period: 'LAST_FY' });
		expect(s.compare).toEqual(rich.compare);
		expect(s.limit).toBe(5);
		expect(s.view.style).toEqual(rich.view.style);
		// The keys that pointed at the old first measure follow the new one.
		expect(s.view.y).toEqual([s.measures![0].as]);
		expect(s.sort![0].by).toBe(s.measures![0].as);
	});

	it('suggested chart types fit the shape, at most 6, the current one kept', () => {
		expect(suggestedViews({ groupBy: 0, measures: 1 }, 'KPI')).toContain('KPI');
		const byRm = suggestedViews({ groupBy: 1, measures: 1, firstIsDate: false }, 'BAR');
		expect(byRm.length).toBeLessThanOrEqual(6);
		expect(byRm).toContain('BAR');
		expect(byRm).not.toContain('KPI');
		expect(byRm).not.toContain('LINE');
		expect(suggestedViews({ groupBy: 1, measures: 1, firstIsDate: true }, 'LINE')).toContain(
			'LINE',
		);
		expect(suggestedViews({ groupBy: 1, measures: 1, firstIsDate: false }, 'FUNNEL')).toContain(
			'FUNNEL',
		);
	});

	it('plain words for a rate and a function source', () => {
		const rate: ReportSpec = {
			v: 1,
			source: 'cases',
			segment: 'eois',
			measures: [
				{ fn: 'COUNT', as: 'conv', segment: 'bookings' },
				{ fn: 'COUNT', as: 'all' },
			],
			derived: [{ as: 'rate', ratio: ['conv', 'all'] }],
			view: { type: 'KPI', y: ['rate'] },
		};
		expect(describeSpec(rate, C)).toBe('Count of bookings out of count of EOIs');
		const fn: ReportSpec = {
			v: 1,
			source: 'moneySummary',
			view: { type: 'KPI', y: ['collected'] },
		};
		const src = C.sources.moneySummary as any;
		const label = src.columns?.collected?.label;
		expect(describeSpec(fn, C)).toBe(label ? `${label} from money summary` : 'Money summary');
	});
});
test('a report on a deleted dataset reads plainly, not as raw field names', () => {
	const gone: ReportSpec = {
		v: 1,
		source: 'dataset:abc',
		measures: [{ fn: 'SUM', field: 'n1', as: 'n1' }],
		groupBy: [{ field: 'd1', as: 'd1', bucket: 'MONTH' }],
		view: { type: 'LINE' },
	};
	expect(describeSpec(gone, C)).toBe('On data that was deleted');
	// A source the catalog does not know and that is not a dataset keeps its words.
	expect(describeSpec({ ...gone, source: 'nope' }, C)).toMatch(/^Sum of n1/);
});
