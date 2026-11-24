import {
	countLinkOf,
	fillLink,
	isRowKey,
	linkProps,
	listValues,
	markLinkOf,
	placeholdersOf,
	rowLinkOf,
	singleValues,
} from '../reportLinks';
import { FIXTURE_CATALOG } from '../fixtures/reportFixtures';
import { ReportSpec } from '../reportTypes';

const COUNT = '/cases?dash=BOOKING&product={filter.productId}&from={period.from}&to={period.to}';

describe('link placeholders (CONTRACT 8.0)', () => {
	test('row keys, filter values and the period are filled; unknown ones are empty', () => {
		expect(placeholdersOf(COUNT)).toEqual(['filter.productId', 'period.from', 'period.to']);
		expect(
			fillLink(COUNT, {
				filters: { productId: 'p1' },
				period: { from: '2026-10-01T00:00:00Z', to: '2026-12-31' },
			}),
		).toBe('/cases?dash=BOOKING&product=p1&from=2026-10-01&to=2026-12-31');
		// Old page behaviour: empty stays empty in the URL.
		expect(fillLink(COUNT, {})).toBe('/cases?dash=BOOKING&product=&from=&to=');
		expect(fillLink('/x/{nope}/{period.other}', { row: { a: 1 } })).toBe('/x//');
	});

	test('values are URI encoded; a query string in the template stays', () => {
		expect(fillLink('/caseView/{caseId}?tab=Requests', { row: { caseId: 'a b/c' } })).toBe(
			'/caseView/a%20b%2Fc?tab=Requests',
		);
	});

	test('a row missing a key its link needs is not a link', () => {
		const link = { path: '/caseView/{caseId}?tab=Money' };
		expect(rowLinkOf(link, { caseId: 'c1' })).toBe('/caseView/c1?tab=Money');
		expect(rowLinkOf(link, { title: 'no case' })).toBeUndefined();
		expect(rowLinkOf(link, { caseId: '' })).toBeUndefined();
		expect(rowLinkOf(undefined, { caseId: 'c1' })).toBeUndefined();
		// Filter and period placeholders may be empty; only row keys gate the link.
		expect(rowLinkOf({ path: '/c/{_id}?p={filter.productId}' }, { _id: 'x' })).toBe('/c/x?p=');
	});

	test('single values: EQ / IN with one value and set params; two values or two filters are none', () => {
		const spec: ReportSpec = {
			v: 1,
			source: 'cases',
			params: { productId: 'p9', page: 0, blank: '' },
			filters: [
				{ field: 'assignedUserId', op: 'IN', values: ['u1'] },
				{ field: 'stageGroup', op: 'IN', values: ['A', 'B'] },
				{ field: 'unitId', op: 'EQ', values: ['x'] },
				{ field: 'unitId', op: 'NE', values: ['y'] },
				{ field: 'bookedAt', period: 'THIS_MONTH' },
			],
			view: { type: 'KPI' },
		};
		expect(singleValues(spec)).toEqual({ productId: 'p9', page: 0, assignedUserId: 'u1' });
	});

	test('a KPI count link: the default widget first, else its segment', () => {
		const kpi = FIXTURE_CATALOG.defaults![0].spec;
		expect(countLinkOf(FIXTURE_CATALOG, kpi, 'totalBookings')?.path).toBe(COUNT);
		expect(countLinkOf(FIXTURE_CATALOG, kpi)?.path).toBe(COUNT);
		expect(countLinkOf(FIXTURE_CATALOG, { ...kpi, segment: 'eois' })).toBeUndefined();
		expect(countLinkOf(FIXTURE_CATALOG, { ...kpi, segment: undefined })).toBeUndefined();
	});

	test('period as epoch seconds in the catalog zone, and every selected value of a field', () => {
		const path = '/deals?datePair={period.fromEpoch},{period.toEpoch}&p={filters.productId}';
		expect(placeholdersOf(path)).toEqual([
			'period.fromEpoch',
			'period.toEpoch',
			'filters.productId',
		]);
		// 2026-10-26 00:00 and 2026-11-24 23:59:59 in Asia/Kolkata (UTC+5:30).
		expect(
			fillLink(path, {
				period: { from: '2026-10-26', to: '2026-11-24' },
				timeZone: 'Asia/Kolkata',
				lists: { productId: ['a', 'b'] },
			}),
		).toBe('/deals?datePair=1792953000,1795544999&p=a%2Cb');
		// No period or no list: empty, never a half pair.
		expect(fillLink(path, {})).toBe('/deals?datePair=,&p=');
		expect(isRowKey('filters.productId')).toBe(false);
		const spec: ReportSpec = {
			v: 1,
			source: 'cases',
			filters: [
				{ field: 'productId', op: 'IN', values: ['a', 'b'] },
				{ field: 'assignedUserId', op: 'EQ', values: ['u1'] },
				{ field: 'bookedAt', period: 'THIS_MONTH' },
				{ field: 'unitId', op: 'EQ', values: ['x'] },
				{ field: 'unitId', op: 'NE', values: ['y'] },
			],
			view: { type: 'KPI' },
		};
		expect(listValues(spec)).toEqual({ productId: ['a', 'b'], assignedUserId: ['u1'] });
	});

	test('a chart mark opens the default widget markLink, else the source row link', () => {
		const cat: any = {
			defaults: [{ id: 'bySource', markLink: { path: '/deals?source={source}' } }],
		};
		const src = { link: { path: '/dealProfile/{code}' } };
		expect(markLinkOf(cat, src, 'bySource')?.path).toBe('/deals?source={source}');
		expect(markLinkOf(cat, src, 'other')?.path).toBe('/dealProfile/{code}');
		expect(markLinkOf(cat, src)?.path).toBe('/dealProfile/{code}');
		expect(markLinkOf(cat, undefined, 'bySource')?.path).toBe('/deals?source={source}');
	});

	test('keyboard: Enter and Space open, other keys do not; Ctrl opens a new tab', () => {
		const nav = jest.fn();
		const p: any = linkProps('/x', nav, 'Open');
		expect(p.role).toBe('link');
		expect(p.tabIndex).toBe(0);
		const ev = (key: string, extra: any = {}) => ({
			key,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
			...extra,
		});
		p.onKeyDown(ev('a'));
		expect(nav).not.toHaveBeenCalled();
		p.onKeyDown(ev('Enter'));
		p.onKeyDown(ev(' ', { ctrlKey: true }));
		p.onClick({ stopPropagation: jest.fn(), metaKey: true });
		expect(nav.mock.calls).toEqual([
			['/x', false],
			['/x', true],
			['/x', true],
		]);
		expect(linkProps(undefined, nav)).toEqual({});
	});
});
