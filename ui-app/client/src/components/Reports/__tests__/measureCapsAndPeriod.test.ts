/**
 * CONTRACT 8.7 follow-ups in the UI: the per view measure cap (TABLE 6, other views 3, from the
 * runner's ViewTypes), the dashboard period into a function source with periodParams, a ratio's
 * scale and label, and the runner's inline value labels.
 */
import { fixtureTransport } from '../fixtures/reportFixtures';
import { formatMeasure, labelOf } from '../reportFormat';
import { clearCatalogCache, loadMeasureCaps, ReportTransport } from '../reportApi';
import { effectiveSpec } from '../reportSpecUtil';
import { applyTopN } from '../reportTransform';
import { ReportCatalog, ReportSpec } from '../reportTypes';
import {
	addToShelf,
	COUNT_FIELD,
	emptyShelves,
	itemOfField,
	shelvesToSpec,
	specToShelves,
} from '../shelves';
import { checkView, measureCap, setMeasureCaps, shapeOf, suggestView } from '../shapeRules';
import { tidySpec } from '../ui/ReportEditorView';

const six: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: ['a', 'b', 'c', 'd', 'e', 'f'].map(k => ({ fn: 'SUM', field: k, as: k })),
	groupBy: [{ field: 'rm', as: 'rm' }],
	view: { type: 'TABLE', x: 'rm' },
};
const CAT: ReportCatalog = {
	sources: {
		cases: {
			kind: 'STORAGE',
			fields: Object.fromEntries(
				['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(k => [k, { kind: 'MEASURE', label: k }]),
			) as any,
		},
	},
};

afterEach(() => setMeasureCaps(undefined));

describe('measure caps', () => {
	it('without the runner every view takes 3; ViewTypes sets TABLE 6', async () => {
		expect(measureCap('TABLE')).toBe(3);
		clearCatalogCache();
		await loadMeasureCaps(fixtureTransport);
		expect(measureCap('TABLE')).toBe(6);
		expect(measureCap('BAR')).toBe(3);
		// A runner without measureCaps (or a failed call) leaves 3.
		setMeasureCaps(undefined);
		const old: ReportTransport = {
			...fixtureTransport,
			async call() {
				return [{ name: 'output', result: { result: { v: 1, types: [] } } }];
			},
		};
		await loadMeasureCaps(old);
		expect(measureCap('TABLE')).toBe(3);
	});

	it('a chart with more than 3 measures does not fit, with the reason; a table with 6 does', () => {
		setMeasureCaps({ TABLE: 6, other: 3 });
		const shape = shapeOf(six, CAT);
		expect(checkView('TABLE', shape).ok).toBe(true);
		expect(checkView('BAR', shape)).toEqual({
			type: 'BAR',
			ok: false,
			reason: 'Only a table takes more than 3 measures (up to 6); this column has 6.',
		});
		expect(suggestView(shape)).toBe('TABLE');
		// tidySpec turns a chart that cannot hold them into a table, keeping every measure.
		const t = tidySpec({ ...six, view: { type: 'BAR', x: 'rm' } }, CAT);
		expect(t.view.type).toBe('TABLE');
		expect(t.measures).toHaveLength(6);
		// Derived measures do not count toward the cap.
		const three = {
			...six,
			measures: six.measures!.slice(0, 3),
			derived: [{ as: 'r', ratio: ['a', 'b'] as [string, string] }],
		};
		expect(checkView('GROUPED_BAR', shapeOf(three, CAT)).reason ?? '').not.toMatch(
			/Only a table/,
		);
	});

	it('the shelves hold up to the cap given and never cut a 6 measure spec', () => {
		setMeasureCaps({ TABLE: 6, other: 3 });
		const sh = specToShelves(six, CAT);
		const back = shelvesToSpec(sh, six);
		expect(back.measures).toHaveLength(6);
		let s = emptyShelves();
		for (const f of ['a', 'b', 'c', 'd', 'e', 'f'])
			s = (
				addToShelf(
					s,
					'rows',
					itemOfField(f, CAT.sources.cases.fields![f]),
					undefined,
					6,
				) as any
			).shelves;
		expect(s.rows).toHaveLength(6);
		expect(addToShelf(s, 'rows', itemOfField(COUNT_FIELD, undefined), undefined, 6)).toEqual({
			ok: false,
			reason: 'At most 6 measures',
		});
	});
});

describe('period into a function source (R2)', () => {
	const cat = (periodParams?: any): ReportCatalog => ({
		sources: {
			funnel: {
				kind: 'FUNCTION',
				function: 'Lz.crmFunnel',
				...(periodParams ? { periodParams } : {}),
			},
		},
	});
	const spec: ReportSpec = { v: 1, source: 'funnel', view: { type: 'TABLE' } };

	it('with periodParams the dashboard period goes in as the one filter', () => {
		const e = effectiveSpec(spec, {
			catalog: cat({ from: 'dateFrom', to: 'dateTo' }),
			dashboard: { period: 'LAST_30_DAYS' },
		});
		expect(e.spec.filters).toEqual([{ field: 'period', period: 'LAST_30_DAYS' }]);
		expect(e.skipped).toEqual([]);
		const named = effectiveSpec(
			{ ...spec, filters: [{ field: 'when', period: 'THIS_MONTH' }] },
			{
				catalog: cat({ from: 'a', field: 'when' }),
				dashboard: { period: 'CUSTOM', from: '2026-01-01', to: '2026-01-31' },
			},
		);
		expect(named.spec.filters).toEqual([
			{ field: 'when', period: 'CUSTOM', from: '2026-01-01', to: '2026-01-31' },
		]);
	});

	it('without periodParams nothing changes (skipped, as today)', () => {
		const e = effectiveSpec(spec, { catalog: cat(), dashboard: { period: 'LAST_30_DAYS' } });
		expect(e.spec.filters).toBeUndefined();
		expect(e.skipped).toEqual(['Period']);
	});
});

describe('ratio scale and inline labels (R5, R6)', () => {
	it('an "Other" row recomputes a scaled ratio', () => {
		const spec: ReportSpec = {
			v: 1,
			source: 'ads',
			measures: [
				{ fn: 'SUM', field: 'spend', as: 'spend' },
				{ fn: 'SUM', field: 'impressions', as: 'imp' },
			],
			derived: [{ as: 'cpm', label: 'CPM', ratio: ['spend', 'imp'], scale: 1000 }],
			groupBy: [{ field: 'campaign', as: 'c' }],
			view: { type: 'TABLE', x: 'c', y: ['spend'] },
		};
		const rows = [
			{ c: 'a', spend: 100, imp: 1000, cpm: 100 },
			{ c: 'b', spend: 50, imp: 1000, cpm: 50 },
			{ c: 'x', spend: 10, imp: 2000, cpm: 5 },
			{ c: 'y', spend: 30, imp: 2000, cpm: 15 },
		];
		const out = applyTopN(
			{
				ok: true,
				columns: [
					{ key: 'c', kind: 'DIMENSION' },
					{ key: 'spend', kind: 'MEASURE' },
					{ key: 'imp', kind: 'MEASURE' },
					{ key: 'cpm', kind: 'MEASURE', label: 'CPM', format: 'MONEY' },
				],
				rows,
			},
			spec,
			{ x: { key: 'c' } as any, ys: [{ key: 'spend' } as any] },
			2,
		);
		const other = out.rows.find(r => r.c !== 'a' && r.c !== 'b')!;
		// (10 + 30) x 1000 / (2000 + 2000)
		expect(other.cpm).toBe(10);
	});

	it('the runner answers inline labels as <as>_label; they show as returned', () => {
		expect(labelOf({ src: 'META_CTWA', src_label: 'Click to WhatsApp' }, 'src')).toBe(
			'Click to WhatsApp',
		);
		expect(labelOf({ lvl: 0, lvl_label: 'Campaign level' }, 'lvl')).toBe('Campaign level');
		expect(labelOf({ src: null, src_label: 'Not set' }, 'src')).toBe('Not set');
		expect(labelOf({ src: 'RAW' }, 'src')).toBe('RAW');
	});

	it('a scaled ratio formats by its column: CPM as money, a small count ratio keeps its digits', () => {
		const cpm: any = { key: 'cpm', kind: 'MEASURE', format: 'MONEY', currency: 'INR' };
		expect(formatMeasure(10.5321, cpm, {}, { locale: 'en-IN', compact: true })).toBe('₹10.53');
		expect(formatMeasure(245.6, cpm, {}, { locale: 'en-IN' })).toBe('₹245.6');
		const ctr: any = { key: 'ctr', kind: 'MEASURE', format: 'NUMBER' };
		expect(formatMeasure(0.0234, ctr, {}, { locale: 'en-IN', compact: true })).toBe('0.0234');
		expect(formatMeasure(0.5, ctr, {}, { locale: 'en-IN', compact: true })).toBe('0.5');
		expect(formatMeasure(1234.5, ctr, {}, { locale: 'en-IN', compact: true })).toBe('1.2K');
	});
});
