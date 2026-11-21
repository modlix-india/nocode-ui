import { checkView, fitOf, shapeOf, suggestView, viewFits, SHAPE_RULES } from '../shapeRules';
import { ReportSpec, VIEW_TYPES, ViewType } from '../reportTypes';

const ok = (t: ViewType, groupBy: number, measures: number) =>
	checkView(t, { groupBy, measures }).ok;

describe('shape rules (CONTRACT section 1)', () => {
	test('every view type (P1a and P1b) has a rule', () => {
		for (const t of VIEW_TYPES) expect(SHAPE_RULES[t]).toBeDefined();
		expect(VIEW_TYPES.length).toBe(25);
	});

	test('P1b: HEATMAP 2 group bys + 1 measure, TREEMAP 1 or 2 + 1, WATERFALL 1 + 1 (CONTRACT 8.1)', () => {
		expect(ok('HEATMAP', 2, 1)).toBe(true);
		expect(ok('HEATMAP', 1, 1)).toBe(false);
		expect(ok('HEATMAP', 2, 2)).toBe(false);
		expect(ok('TREEMAP', 1, 1)).toBe(true);
		expect(ok('TREEMAP', 2, 1)).toBe(true);
		expect(ok('TREEMAP', 0, 1)).toBe(false);
		expect(ok('TREEMAP', 1, 2)).toBe(false);
		expect(ok('WATERFALL', 1, 1)).toBe(true);
		expect(ok('WATERFALL', 2, 1)).toBe(false);
		expect(ok('WATERFALL', 1, 2)).toBe(false);
		expect(checkView('HEATMAP', { groupBy: 1, measures: 1 }).reason).toBe(
			'Heatmap needs two group bys and one measure',
		);
		expect(checkView('WATERFALL', { groupBy: 0, measures: 1 }).reason).toBe(
			'Waterfall needs one group by and one measure',
		);
		expect(checkView('TREEMAP', { groupBy: 0, measures: 1 }).reason).toBe(
			'Treemap needs one or two group bys and one measure',
		);
	});

	test('KPI / GAUGE / BULLET need one row', () => {
		for (const t of ['KPI', 'GAUGE', 'BULLET'] as ViewType[]) {
			expect(ok(t, 0, 1)).toBe(true);
			expect(ok(t, 1, 1)).toBe(false);
		}
	});

	test('PIE / DOUGHNUT / FUNNEL / LOLLIPOP / BAR / HBAR need exactly one group by', () => {
		for (const t of ['PIE', 'DOUGHNUT', 'FUNNEL', 'LOLLIPOP', 'BAR', 'HBAR'] as ViewType[]) {
			expect(ok(t, 1, 1)).toBe(true);
			expect(ok(t, 0, 1)).toBe(false);
			expect(ok(t, 2, 1)).toBe(false);
		}
	});

	test('STACKED_* and CROSSTAB need two group bys and one measure', () => {
		for (const t of [
			'STACKED_BAR',
			'STACKED_BAR_100',
			'STACKED_AREA',
			'CROSSTAB',
		] as ViewType[]) {
			expect(ok(t, 2, 1)).toBe(true);
			expect(ok(t, 2, 2)).toBe(false);
			expect(ok(t, 1, 1)).toBe(false);
		}
	});

	test('COMBO / SCATTER need two measures', () => {
		for (const t of ['COMBO', 'SCATTER'] as ViewType[]) {
			expect(ok(t, 1, 2)).toBe(true);
			expect(ok(t, 1, 1)).toBe(false);
			expect(ok(t, 1, 3)).toBe(false);
		}
	});

	test('line family takes one or two group bys, hints when the first is not a date', () => {
		for (const t of ['LINE', 'SMOOTH_LINE', 'STEP_LINE', 'AREA'] as ViewType[]) {
			expect(ok(t, 1, 1)).toBe(true);
			expect(ok(t, 2, 1)).toBe(true);
			expect(ok(t, 0, 1)).toBe(false);
		}
		const hint = checkView('LINE', { groupBy: 1, measures: 1, firstIsDate: false });
		expect(hint.ok).toBe(true);
		expect(hint.reason).toMatch(/date/);
	});

	test('TABLE / LIST fit any shape; failures carry a plain reason', () => {
		expect(ok('TABLE', 0, 1)).toBe(true);
		expect(ok('LIST', 2, 3)).toBe(true);
		const pie = checkView('PIE', { groupBy: 0, measures: 1 });
		expect(pie.reason).toBe('Pie needs exactly one group by');
		expect(pie.reason).not.toMatch(/—/);
	});

	test('viewFits lists all types in picker order', () => {
		const fits = viewFits({ groupBy: 1, measures: 1 });
		expect(fits.map(f => f.type)).toEqual([...VIEW_TYPES]);
		expect(fits.find(f => f.type === 'KPI')!.ok).toBe(false);
	});

	test('shapeOf counts derived measures and reads a FUNCTION result from its columns', () => {
		const spec: ReportSpec = {
			v: 1,
			source: 'cases',
			measures: [{ fn: 'COUNT', as: 'n' }],
			derived: [{ as: 'r', ratio: ['n', 'n'] }],
			groupBy: [{ field: 'bookedAt', as: 'm', bucket: 'MONTH' }],
			view: { type: 'LINE' },
		};
		expect(shapeOf(spec)).toEqual({ groupBy: 1, measures: 2, firstIsDate: true });
		const fn = shapeOf(
			{ v: 1, source: 'money', view: { type: 'TABLE' } },
			{ sources: { money: { kind: 'FUNCTION' } } },
			{
				columns: [
					{ key: 'kind', kind: 'DIMENSION' },
					{ key: 'kind_label', hidden: true },
					{ key: 'amount', kind: 'MEASURE' },
				],
			},
		);
		expect(fn).toEqual({ groupBy: 1, measures: 1, firstIsDate: false });
	});

	test('suggestView', () => {
		expect(suggestView({ groupBy: 0, measures: 1 })).toBe('KPI');
		expect(suggestView({ groupBy: 1, measures: 1, firstIsDate: true })).toBe('LINE');
		expect(suggestView({ groupBy: 1, measures: 1 })).toBe('BAR');
		expect(suggestView({ groupBy: 2, measures: 1 })).toBe('STACKED_BAR');
	});
});

describe('the runner verdict (Run output `fits`) wins when present', () => {
	test('a runner refusal and its reason are used; types it does not name fall back to the table', () => {
		const runner = {
			BAR: {
				ok: false,
				reason: 'Bar needs exactly 1 group by and at least 1 measure; this report has 0 group by and 1 measure.',
			},
			KPI: { ok: true },
		};
		const fits = viewFits({ groupBy: 1, measures: 1 }, runner);
		expect(fits.find(f => f.type === 'BAR')).toEqual({
			type: 'BAR',
			ok: false,
			reason: runner.BAR.reason,
		});
		expect(fits.find(f => f.type === 'KPI')!.ok).toBe(true);
		expect(fits.find(f => f.type === 'PIE')!.ok).toBe(true);
		expect(
			fitOf('LINE', { groupBy: 1, measures: 1, firstIsDate: false }, { LINE: { ok: true } })
				.reason,
		).toMatch(/date/);
	});
});
