import {
	applyDrill,
	bucketRange,
	drillCrumbs,
	effectiveSpec,
	markActions,
	nextLevel,
	valuesSpec,
} from '../reportSpecUtil';
import { ReportCatalog, ReportSpec } from '../reportTypes';

const catalog: ReportCatalog = {
	sources: {
		cases: {
			kind: 'STORAGE',
			fields: {
				productId: { kind: 'DIMENSION', label: 'Project' },
				assignedUserId: { kind: 'DIMENSION', label: 'RM' },
				bookedAt: { kind: 'DATE', label: 'Booked on' },
				email: { kind: 'DIMENSION', pii: true },
			},
		},
		money: { kind: 'FUNCTION' },
	},
};

const byMonth: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	groupBy: [{ field: 'bookedAt', as: 'month', bucket: 'MONTH' }],
	filters: [{ field: 'bookedAt', period: 'LAST_12_MONTHS' }],
	view: { type: 'LINE' },
};

test('bucket ranges are inclusive calendar days', () => {
	expect(bucketRange('2026-11-01', 'MONTH')).toEqual({ from: '2026-11-01', to: '2026-11-30' });
	expect(bucketRange('2026-02-01T00:00:00Z', 'MONTH')).toEqual({
		from: '2026-02-01',
		to: '2026-02-28',
	});
	expect(bucketRange('2026-10-01', 'QUARTER')).toEqual({ from: '2026-10-01', to: '2026-12-31' });
	expect(bucketRange('2026-11-16', 'WEEK')).toEqual({ from: '2026-11-16', to: '2026-11-22' });
	expect(bucketRange('2026-01-01', 'YEAR')).toEqual({ from: '2026-01-01', to: '2026-12-31' });
	expect(bucketRange('nope', 'DAY')).toBeUndefined();
	expect(nextLevel('MONTH')).toBe('WEEK');
	expect(nextLevel('DAY')).toBeUndefined();
});

test('a click on a date bucket offers Keep only (range) and Drill down, not Exclude', () => {
	const a = markActions(byMonth, {
		row: { month: '2026-11-01', month_label: 'Nov 2026', n: 3 },
		x: { key: 'month', label: 'Booked on', kind: 'DATE' },
	});
	expect(a.keep).toEqual([
		{
			field: 'bookedAt',
			period: 'CUSTOM',
			from: '2026-11-01',
			to: '2026-11-30',
			label: 'Booked on in Nov 2026',
		},
	]);
	expect(a.exclude).toBeUndefined();
	expect(a.excludeReason).toBeTruthy();
	expect(a.drill).toMatchObject({
		level: 'WEEK',
		from: '2026-11-01',
		to: '2026-11-30',
		label: 'Nov 2026',
	});
});

describe('a drilled or kept range never reaches outside the range it was clicked in', () => {
	// Oct 2026 drilled to weeks: the filter on the date field is the month's own range.
	const inOct: ReportSpec = {
		...byMonth,
		groupBy: [{ field: 'bookedAt', as: 'month', bucket: 'WEEK' }],
		filters: [{ field: 'bookedAt', period: 'CUSTOM', from: '2026-10-01', to: '2026-10-31' }],
	};
	const x = { key: 'month', label: 'Booked on', kind: 'DATE' as const };

	test('the last week of a month drills to the days of that month only', () => {
		// The week of 26 Oct runs to 1 Nov, and 1 Nov is a November day: it must not show.
		const a = markActions(inOct, { row: { month: '2026-10-26', n: 228 }, x });
		expect(a.drill).toMatchObject({ level: 'DAY', from: '2026-10-26', to: '2026-10-31' });
		expect(a.keep![0]).toMatchObject({ from: '2026-10-26', to: '2026-10-31' });
		const d = applyDrill(inOct, [a.drill!]);
		expect(d.filters).toContainEqual({
			field: 'bookedAt',
			period: 'CUSTOM',
			from: '2026-10-26',
			to: '2026-10-31',
		});
	});

	test('the first week of a month starts on the first day of that month', () => {
		// The week of 28 Sep holds 1 to 4 Oct inside October: Keep only must not widen back into September.
		const a = markActions(inOct, { row: { month: '2026-09-28', n: 40 }, x });
		expect(a.drill).toMatchObject({ level: 'DAY', from: '2026-10-01', to: '2026-10-04' });
		expect(a.keep![0]).toMatchObject({ from: '2026-10-01', to: '2026-10-04' });
	});

	test('a week inside the month is not changed', () => {
		const a = markActions(inOct, { row: { month: '2026-10-12', n: 5 }, x });
		expect(a.drill).toMatchObject({ from: '2026-10-12', to: '2026-10-18' });
	});

	test('a quarter drilled to months, and a year to quarters, stay inside their parent', () => {
		const q = (bucket: 'QUARTER' | 'MONTH', from: string, to: string): ReportSpec => ({
			...byMonth,
			groupBy: [{ field: 'bookedAt', as: 'month', bucket }],
			filters: [{ field: 'bookedAt', period: 'CUSTOM', from, to }],
		});
		// A whole year: every quarter keeps its own full range.
		const year = markActions(q('QUARTER', '2026-01-01', '2026-12-31'), {
			row: { month: '2026-10-01', n: 1 },
			x,
		});
		expect(year.drill).toMatchObject({ level: 'MONTH', from: '2026-10-01', to: '2026-12-31' });
		// A part year (from 1 Mar): the first quarter is cut to March, not January.
		const part = markActions(q('QUARTER', '2026-03-01', '2026-12-31'), {
			row: { month: '2026-01-01', n: 1 },
			x,
		});
		expect(part.drill).toMatchObject({ level: 'MONTH', from: '2026-03-01', to: '2026-03-31' });
	});

	test('a named period carries no dates, so the bucket range is left whole', () => {
		const a = markActions(byMonth, { row: { month: '2026-11-01', n: 3 }, x });
		expect(a.drill).toMatchObject({ from: '2026-11-01', to: '2026-11-30' });
	});

	test('children of a drilled week add up to the week: the day ranges tile the clamped range', () => {
		const week = markActions(inOct, { row: { month: '2026-10-26', n: 228 }, x }).drill!;
		const days = applyDrill(inOct, [week]).filters!.find(f => f.period === 'CUSTOM')!;
		const span =
			(Date.parse(days.to as string) - Date.parse(days.from as string)) / 86400000 + 1;
		expect(span).toBe(6); // 26, 27, 28, 29, 30, 31 Oct
	});
});

test('a click on a dimension offers Keep only and Exclude; a series click keeps both values', () => {
	const spec: ReportSpec = {
		...byMonth,
		groupBy: [
			{ field: 'assignedUserId', as: 'rm' },
			{ field: 'productId', as: 'p' },
		],
	};
	const a = markActions(spec, {
		row: { rm: 'u1', rm_label: 'Asha', p: 'p1', p_label: 'Tower A' },
		x: { key: 'rm', label: 'RM' },
		series: { key: 'p', label: 'Project' },
		seriesValue: 'p1',
	});
	expect(a.keep!.map(f => [f.field, f.op, f.values])).toEqual([
		['assignedUserId', 'EQ', ['u1']],
		['productId', 'EQ', ['p1']],
	]);
	expect(a.exclude).toEqual([
		{ field: 'assignedUserId', op: 'NE', values: ['u1'], label: 'RM is not Asha' },
	]);
	expect(a.drill).toBeUndefined();
});

test('drill changes the bucket inside the clicked range; crumbs lead back', () => {
	const step = {
		field: 'bookedAt',
		as: 'month',
		from: '2026-11-01',
		to: '2026-11-30',
		level: 'WEEK' as const,
		label: 'Nov 2026',
	};
	const d = applyDrill(byMonth, [step]);
	expect(d.groupBy![0].bucket).toBe('WEEK');
	expect(d.filters).toContainEqual({
		field: 'bookedAt',
		period: 'CUSTOM',
		from: '2026-11-01',
		to: '2026-11-30',
	});
	expect(d.view.drill).toEqual({ field: 'bookedAt', level: 'WEEK' });
	expect(byMonth.groupBy![0].bucket).toBe('MONTH');
	expect(drillCrumbs(byMonth, [step])).toEqual(['All months', 'Nov 2026']);
});

test('dashboard period replaces the spec period; quick filters only where the source has the field', () => {
	const e = effectiveSpec(byMonth, {
		catalog,
		dashboard: { period: 'THIS_FY', quick: { productId: ['p1'], unknown: ['x'] } },
		session: [{ field: 'assignedUserId', op: 'NE', values: ['u9'], label: 'RM is not X' }],
	});
	expect(e.spec.filters).toEqual([
		{ field: 'bookedAt', period: 'THIS_FY' },
		{ field: 'productId', op: 'IN', values: ['p1'] },
		{ field: 'assignedUserId', op: 'NE', values: ['u9'] },
	]);
	expect(e.skipped).toEqual(['unknown']);
	expect(byMonth.filters).toEqual([{ field: 'bookedAt', period: 'LAST_12_MONTHS' }]);
});

test('a quick filter the card source lacks is named by the label the bar shows, not the field id', () => {
	const cat: ReportCatalog = {
		quickFilters: ['productTemplateId', 'assignedUserId', 'source'],
		sources: {
			deals: {
				kind: 'STORAGE',
				fields: {
					productTemplateId: { kind: 'DIMENSION', label: 'Template' },
					assignedUserId: { kind: 'DIMENSION', label: 'Owner' },
					source: { kind: 'DIMENSION', label: 'Source' },
				},
			},
			calls: { kind: 'STORAGE', fields: { callAt: { kind: 'DATE', label: 'Call time' } } },
		},
	};
	const onCalls: ReportSpec = {
		v: 1,
		source: 'calls',
		measures: [{ fn: 'COUNT', as: 'n' }],
		view: { type: 'KPI', y: ['n'] },
	};
	const e = effectiveSpec(onCalls, {
		catalog: cat,
		dashboard: {
			quick: { productTemplateId: ['t1'], assignedUserId: ['u1'], source: ['web'] },
		},
	});
	expect(e.skipped).toEqual(['Template', 'Owner', 'Source']);
	expect(e.spec.filters).toBeUndefined();
});

test('a spec without a period gets one on its date field; function sources are left alone', () => {
	const noPeriod = { ...byMonth, filters: [] };
	expect(
		effectiveSpec(noPeriod, {
			catalog,
			dashboard: { period: 'CUSTOM', from: '2026-01-01', to: '2026-01-31' },
		}).spec.filters,
	).toEqual([{ field: 'bookedAt', period: 'CUSTOM', from: '2026-01-01', to: '2026-01-31' }]);
	const fn: ReportSpec = { v: 1, source: 'money', view: { type: 'TABLE' } };
	expect(
		effectiveSpec(fn, { catalog, dashboard: { period: 'TODAY', quick: { productId: ['p'] } } })
			.spec,
	).toEqual(fn);
});

test('the 8 filter cap is kept; extras are reported', () => {
	const full = {
		...byMonth,
		filters: Array.from({ length: 7 }, () => ({
			field: 'productId',
			op: 'NE' as const,
			values: ['z'],
		})),
	};
	const e = effectiveSpec(full, {
		catalog,
		session: [
			{ field: 'productId', op: 'EQ', values: ['a'], label: 'one' },
			{ field: 'productId', op: 'EQ', values: ['b'], label: 'two' },
		],
	});
	expect(e.spec.filters!.length).toBe(8);
	expect(e.skipped).toEqual(['two']);
});

test('quick filter values come from a one group by count; never a PII field', () => {
	expect(valuesSpec(catalog, 'productId')).toMatchObject({
		source: 'cases',
		groupBy: [{ field: 'productId', as: 'k' }],
		measures: [{ fn: 'COUNT', as: 'n' }],
	});
	expect(valuesSpec(catalog, 'email')).toBeUndefined();
});

describe('catalog details from the CXZump catalog (workstream C)', () => {
	const cx: ReportCatalog = {
		currency: 'INR',
		sources: {
			approvals: {
				kind: 'STORAGE',
				label: 'Approvals',
				fields: { productId: { kind: 'DIMENSION' } },
			},
			cases: {
				kind: 'STORAGE',
				label: 'Cases',
				fields: {
					productId: { kind: 'DIMENSION' },
					openedAt: { kind: 'DATE' },
					bookedAt: { kind: 'DATE' },
				},
			},
			products: {
				kind: 'STORAGE',
				lookupOnly: true,
				fields: {
					productId: { kind: 'DIMENSION' },
					a: { kind: 'DIMENSION' },
					b: { kind: 'DIMENSION' },
					c: { kind: 'DIMENSION' },
				},
			},
			money: { kind: 'FUNCTION', allowedParams: ['productId'], params: { productId: '' } },
		},
	};

	test('quick filter values come from the main source, never a lookupOnly one, whatever the key order', () => {
		expect(valuesSpec(cx, 'productId')!.source).toBe('cases');
		const reversed: ReportCatalog = {
			...cx,
			sources: Object.fromEntries(Object.entries(cx.sources).reverse()),
		};
		expect(valuesSpec(reversed, 'productId')!.source).toBe('cases');
	});

	test('no period filter and no date group by: the period is reported, not guessed', () => {
		const spec: ReportSpec = {
			v: 1,
			source: 'cases',
			measures: [{ fn: 'COUNT', as: 'n' }],
			view: { type: 'KPI' },
		};
		const e = effectiveSpec(spec, { catalog: cx, dashboard: { period: 'THIS_MONTH' } });
		expect(e.spec.filters).toBeUndefined();
		expect(e.skipped).toEqual(['Period']);
	});

	test('a function source takes one quick filter value as an allowed param', () => {
		const spec: ReportSpec = {
			v: 1,
			source: 'money',
			params: { productId: '' },
			view: { type: 'KPI', y: ['cases'] },
		};
		expect(
			effectiveSpec(spec, { catalog: cx, dashboard: { quick: { productId: ['p1'] } } }).spec
				.params,
		).toEqual({ productId: 'p1' });
		const two = effectiveSpec(spec, {
			catalog: cx,
			dashboard: { quick: { productId: ['p1', 'p2'] }, period: 'TODAY' },
		});
		expect(two.spec.params).toEqual({ productId: '' });
		expect(two.skipped).toEqual(['Period', 'productId']);
	});
});

test('a drill or a Keep only date range replaces the field period (the runner keeps one per field)', () => {
	const step = {
		field: 'bookedAt',
		as: 'month',
		from: '2026-11-01',
		to: '2026-11-30',
		level: 'WEEK' as const,
		label: 'Nov 2026',
	};
	expect(applyDrill(byMonth, [step]).filters).toEqual([
		{ field: 'bookedAt', period: 'CUSTOM', from: '2026-11-01', to: '2026-11-30' },
	]);
	const keep = effectiveSpec(byMonth, {
		catalog,
		session: [
			{
				field: 'bookedAt',
				period: 'CUSTOM',
				from: '2026-11-01',
				to: '2026-11-30',
				label: 'Booked on in Nov 2026',
			},
		],
	});
	expect(keep.spec.filters).toEqual([
		{ field: 'bookedAt', period: 'CUSTOM', from: '2026-11-01', to: '2026-11-30' },
	]);
});

describe('a quick filter on a field the card already filters (LZT-2700)', () => {
	const cat: ReportCatalog = {
		quickFilters: ['productTemplateId', 'productId', 'assignedUserId'],
		sources: {
			deals: {
				kind: 'STORAGE',
				fields: {
					createdAt: { kind: 'DATE', label: 'Created on' },
					productTemplateId: { kind: 'DIMENSION', label: 'Template' },
					productId: { kind: 'DIMENSION', label: 'Product' },
					assignedUserId: { kind: 'DIMENSION', label: 'Owner' },
				},
			},
			calls: { kind: 'STORAGE', fields: { callAt: { kind: 'DATE', label: 'Call time' } } },
		},
	};
	const own = (extra: ReportSpec['filters'] = []): ReportSpec => ({
		v: 1,
		source: 'deals',
		measures: [{ fn: 'COUNT', as: 'n' }],
		filters: [{ field: 'createdAt', period: 'LAST_30_DAYS' }, ...extra],
		view: { type: 'KPI', y: ['n'] },
	});
	const oldest = { field: 'productTemplateId', op: 'EQ' as const, value: 't-old' };

	test('an app default: the quick template replaces the card own template filter', () => {
		const e = effectiveSpec(own([oldest]), {
			catalog: cat,
			appDefault: true,
			dashboard: { quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toEqual([
			{ field: 'createdAt', period: 'LAST_30_DAYS' },
			{ field: 'productTemplateId', op: 'IN', values: ['t-new'] },
		]);
		expect(e.skipped).toEqual([]);
	});

	test('an app default replaces a NOT_NULL fallback filter too, and keeps the period', () => {
		const e = effectiveSpec(own([{ field: 'productTemplateId', op: 'NOT_NULL' }]), {
			catalog: cat,
			appDefault: true,
			dashboard: { period: 'TODAY', quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toEqual([
			{ field: 'createdAt', period: 'TODAY' },
			{ field: 'productTemplateId', op: 'IN', values: ['t-new'] },
		]);
	});

	test('no quick pick (All): the card own template filter stays', () => {
		const picks: Array<Record<string, any[]> | undefined> = [
			undefined,
			{},
			{ productTemplateId: [] },
		];
		for (const quick of picks) {
			const e = effectiveSpec(own([oldest]), {
				catalog: cat,
				appDefault: true,
				dashboard: { period: 'TODAY', quick },
			});
			expect(e.spec.filters).toEqual([{ field: 'createdAt', period: 'TODAY' }, oldest]);
		}
	});

	test('a card without its own filter on the field gets the quick one', () => {
		const e = effectiveSpec(own(), {
			catalog: cat,
			appDefault: true,
			dashboard: { quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toEqual([
			{ field: 'createdAt', period: 'LAST_30_DAYS' },
			{ field: 'productTemplateId', op: 'IN', values: ['t-new'] },
		]);
	});

	test('Product and Owner behave the same way, and only the picked field is replaced', () => {
		const spec = own([
			oldest,
			{ field: 'productId', op: 'EQ', value: 'p-old' },
			{ field: 'assignedUserId', op: 'EQ', value: 'u-old' },
		]);
		const e = effectiveSpec(spec, {
			catalog: cat,
			appDefault: true,
			dashboard: { quick: { productId: ['p1', 'p2'], assignedUserId: ['u1'] } },
		});
		expect(e.spec.filters).toEqual([
			{ field: 'createdAt', period: 'LAST_30_DAYS' },
			oldest,
			{ field: 'productId', op: 'IN', values: ['p1', 'p2'] },
			{ field: 'assignedUserId', op: 'IN', values: ['u1'] },
		]);
		const none = effectiveSpec(spec, { catalog: cat, appDefault: true, dashboard: {} });
		expect(none.spec.filters).toEqual(spec.filters);
	});

	test('a user-built or edited widget keeps its own filter and the quick pick narrows it (AND)', () => {
		const e = effectiveSpec(own([oldest]), {
			catalog: cat,
			dashboard: { quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toEqual([
			{ field: 'createdAt', period: 'LAST_30_DAYS' },
			oldest,
			{ field: 'productTemplateId', op: 'IN', values: ['t-new'] },
		]);
	});

	test('a card whose source lacks the field keeps its filters and reports Not applied', () => {
		const onCalls: ReportSpec = {
			v: 1,
			source: 'calls',
			measures: [{ fn: 'COUNT', as: 'n' }],
			filters: [oldest],
			view: { type: 'KPI', y: ['n'] },
		};
		const e = effectiveSpec(onCalls, {
			catalog: cat,
			appDefault: true,
			dashboard: { quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toEqual([oldest]);
		expect(e.skipped).toEqual(['Template']);
	});

	test('the replaced filter frees room under the 8 filter cap', () => {
		const filler = Array.from({ length: 6 }, (_, i) => ({
			field: 'productId',
			op: 'NE' as const,
			values: [`z${i}`],
		}));
		const e = effectiveSpec(own([oldest, ...filler]), {
			catalog: cat,
			appDefault: true,
			dashboard: { quick: { productTemplateId: ['t-new'] } },
		});
		expect(e.spec.filters).toHaveLength(8);
		expect(e.skipped).toEqual([]);
	});
});
