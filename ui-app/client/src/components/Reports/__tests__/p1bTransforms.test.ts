import { buildChartConfig, ChartTheme } from '../reportChartConfig';
import { measureColumns, visibleColumns } from '../reportFormat';
import {
	applyDrill,
	compareBlocker,
	drillCrumbs,
	effectiveSpec,
	hierarchyNext,
	markActions,
	recordsSpec,
} from '../reportSpecUtil';
import { kpiDelta, normalizeCompare } from '../reportTransform';
import { FIXTURE_CATALOG, fixtureRun } from '../fixtures/reportFixtures';
import { ReportSpec, ReportSuccess } from '../reportTypes';

const theme: ChartTheme = {
	palette: ['#111111', '#222222', '#333333'],
	text: 'rgb(10, 10, 10)',
	muted: 'rgb(90, 90, 90)',
	grid: 'rgb(200, 200, 200)',
	surface: 'rgb(255, 255, 255)',
};

const byProject: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	groupBy: [{ field: 'productId', as: 'p' }],
	filters: [{ field: 'bookedAt', period: 'THIS_QUARTER' }],
	view: { type: 'BAR', x: 'p' },
};
const P_COL = { key: 'p', label: 'Project', kind: 'DIMENSION' };

describe('hierarchy drill (CONTRACT 8.1)', () => {
	test('the next level of a catalog hierarchy, only when the source has it', () => {
		expect(hierarchyNext(FIXTURE_CATALOG, 'cases', 'productId')).toEqual({ next: 'unitId', hierarchy: 'location' });
		expect(hierarchyNext(FIXTURE_CATALOG, 'cases', 'stageGroup')?.next).toBe('status');
		expect(hierarchyNext(FIXTURE_CATALOG, 'cases', 'unitId')).toBeUndefined();
		expect(hierarchyNext(FIXTURE_CATALOG, 'moneySummary', 'productId')).toBeUndefined();
	});

	test('a click offers the drill; applying it replaces the field and keeps only the clicked value', () => {
		const a = markActions(byProject, { row: { p: 'p1', p_label: 'Tower A' }, x: P_COL as any }, FIXTURE_CATALOG);
		expect(a.drill).toEqual({ kind: 'hierarchy', field: 'productId', as: 'p', next: 'unitId', value: 'p1', label: 'Tower A' });
		const d = applyDrill(byProject, [a.drill!]);
		expect(d.groupBy).toEqual([{ field: 'unitId', as: 'p' }]);
		expect(d.filters).toEqual([
			{ field: 'bookedAt', period: 'THIS_QUARTER' },
			{ field: 'productId', op: 'EQ', values: ['p1'] },
		]);
		expect(d.view.x).toBe('p');
		expect(drillCrumbs(byProject, [a.drill!], FIXTURE_CATALOG)).toEqual(['All project', 'Tower A']);
		// Without the catalog there is no hierarchy: no drill.
		expect(markActions(byProject, { row: { p: 'p1' }, x: P_COL as any }).drill).toBeUndefined();
	});

	test('no drill once the filters are at the cap', () => {
		const full = { ...byProject, filters: Array.from({ length: 8 }, (_, i) => ({ field: 'status', op: 'NE' as const, values: [i] })) };
		expect(markActions(full, { row: { p: 'p1' }, x: P_COL as any }, FIXTURE_CATALOG).drill).toBeUndefined();
	});

	test('date and hierarchy steps apply in order', () => {
		const spec: ReportSpec = {
			...byProject,
			groupBy: [
				{ field: 'bookedAt', bucket: 'MONTH', as: 'm' },
				{ field: 'productId', as: 'p' },
			],
		};
		const d = applyDrill(spec, [
			{ kind: 'date', field: 'bookedAt', as: 'm', from: '2026-11-01', to: '2026-11-30', level: 'WEEK', label: 'Nov 2026' },
			{ kind: 'hierarchy', field: 'productId', as: 'p', next: 'unitId', value: 'p2', label: 'Tower B' },
		]);
		expect(d.groupBy).toEqual([
			{ field: 'bookedAt', bucket: 'WEEK', as: 'm' },
			{ field: 'unitId', as: 'p' },
		]);
		expect(d.filters).toEqual([
			{ field: 'bookedAt', period: 'CUSTOM', from: '2026-11-01', to: '2026-11-30' },
			{ field: 'productId', op: 'EQ', values: ['p2'] },
		]);
		expect(d.view.drill).toEqual({ field: 'bookedAt', level: 'WEEK' });
	});
});

describe('cross-filter, records, compare (CONTRACT 8.1)', () => {
	test('Filter dashboard applies where the source has the field, else "Not applied"', () => {
		const cross = [{ field: 'productId', op: 'EQ' as const, values: ['p1'], label: 'Project is Tower A' }];
		const e = effectiveSpec(byProject, { catalog: FIXTURE_CATALOG, cross });
		expect(e.spec.filters).toContainEqual({ field: 'productId', op: 'EQ', values: ['p1'] });
		expect(e.skipped).toEqual([]);
		const fn = effectiveSpec({ v: 1, source: 'moneySummary', view: { type: 'KPI' } }, { catalog: FIXTURE_CATALOG, cross });
		expect(fn.skipped).toEqual(['Project is Tower A']);
		expect(fn.spec.filters).toBeUndefined();
		// A date range replaces the field's period.
		const range = [{ field: 'bookedAt', period: 'CUSTOM' as const, from: '2026-11-01', to: '2026-11-30' }];
		expect(effectiveSpec(byProject, { catalog: FIXTURE_CATALOG, cross: range }).spec.filters).toEqual([range[0]]);
	});

	test('a records request: source, segment, filters and the clicked mark, no measures', () => {
		const r = recordsSpec(
			{ ...byProject, segment: 'bookings' },
			[{ field: 'productId', op: 'EQ', values: ['p1'], label: 'Project is Tower A' }],
			2,
			100,
		);
		expect(r).toEqual({
			v: 1,
			source: 'cases',
			segment: 'bookings',
			filters: [
				{ field: 'bookedAt', period: 'THIS_QUARTER' },
				{ field: 'productId', op: 'EQ', values: ['p1'] },
			],
			records: { page: 2, size: 100 },
			view: { type: 'TABLE' },
		});
		expect(recordsSpec(byProject, undefined, 0, 5000, true).records).toEqual({ page: 0, size: 5000, export: true });
	});

	test('compare needs one period that is not All time, and no function source', () => {
		expect(compareBlocker(byProject, FIXTURE_CATALOG)).toBeUndefined();
		expect(compareBlocker({ ...byProject, filters: [] }, FIXTURE_CATALOG)).toBe('Set a date range to compare');
		expect(compareBlocker({ ...byProject, filters: [{ field: 'bookedAt', period: 'ALL_TIME' }] }, FIXTURE_CATALOG)).toBe('All time cannot be compared');
		expect(compareBlocker({ v: 1, source: 'moneySummary', view: { type: 'KPI' } }, FIXTURE_CATALOG)).toBe('This report cannot be compared');
	});

	test('compare columns: shown in tables, never drawn; KPI delta direction', () => {
		const out = fixtureRun({ ...byProject, compare: { to: 'PREVIOUS_PERIOD' } }) as ReportSuccess;
		expect(out.ok).toBe(true);
		const n = normalizeCompare(out, 'Previous period');
		expect(visibleColumns(n).map(c => c.key)).toEqual(['p', 'n', 'n_cmp', 'n_delta_pct']);
		expect(measureColumns(n).map(c => c.key)).toEqual(['n']);
		expect(n.columns.find(c => c.key === 'n_cmp')?.label).toBe('Count (previous period)');
		expect(n.columns.find(c => c.key === 'n_delta_pct')?.format).toBe('PERCENT');
		const same = fixtureRun(byProject) as ReportSuccess;
		expect(normalizeCompare(same)).toBe(same);
		expect(kpiDelta({ n_delta_pct: 12.5 }, 'n')).toEqual({ pct: 12.5, dir: 'up' });
		expect(kpiDelta({ n_delta_pct: -3 }, 'n')?.dir).toBe('down');
		expect(kpiDelta({}, 'n')).toBeUndefined();
	});

	test('the fixture runner refuses compare over All time (BAD_PERIOD)', () => {
		const r = fixtureRun({ ...byProject, filters: [{ field: 'bookedAt', period: 'ALL_TIME' }], compare: { to: 'PREVIOUS_PERIOD' } });
		expect(r.ok === false && r.error.code).toBe('BAD_PERIOD');
	});
});

describe('P1b chart configs', () => {
	const run = (spec: ReportSpec) => normalizeCompare(fixtureRun(spec) as ReportSuccess, 'Previous period');

	test('compare draws a faded ghost series per measure (not for a pivot)', () => {
		const out = run({ ...byProject, compare: { to: 'PREVIOUS_PERIOD' } });
		const c = buildChartConfig(out, byProject.view, theme, { compareLabel: 'Previous period' });
		expect(c.data.datasets.map(d => d.label)).toEqual(['Count', 'Count (previous period)']);
		const ghost = c.data.datasets[1];
		expect(ghost._ghost).toBe(true);
		expect(ghost.backgroundColor).toBe('rgba(17, 17, 17, 0.3)');
		expect(ghost.data).toEqual(out.rows.map(r => r.n_cmp));
		const plain = buildChartConfig(out, byProject.view, theme);
		expect(plain.data.datasets.length).toBe(1);
		const line = buildChartConfig(out, { ...byProject.view, type: 'LINE' }, theme, { compareLabel: 'Previous period' });
		expect(line.data.datasets[1].borderDash).toEqual([5, 4]);
	});

	test('HEATMAP: a matrix of X by Y, shaded by value, needs the matrix chunk', () => {
		const spec: ReportSpec = { ...byProject, groupBy: [{ field: 'productId', as: 'p' }, { field: 'stageGroup', as: 's' }], view: { type: 'HEATMAP', x: 'p' } };
		const out = run(spec);
		const c = buildChartConfig(out, spec.view, theme);
		expect(c.type).toBe('matrix');
		expect(c.needs.matrix).toBe(true);
		expect(c.options.scales.x.labels).toEqual(['Tower A', 'Tower B', 'Lake View', 'Garden Court']);
		expect(c.options.scales.y.labels).toEqual(['Enquiry', 'Booking', 'Agreement', 'Handover']);
		const ds = c.data.datasets[0];
		expect(ds.data[0]).toEqual({ x: 'Tower A', y: 'Enquiry', v: out.rows[0].n });
		const max = Math.max(...out.rows.map(r => r.n));
		const top = out.rows.findIndex(r => r.n === max);
		expect(ds.backgroundColor({ raw: ds.data[top] })).toBe('rgba(17, 17, 17, 1)');
		expect(ds.width({ chart: { chartArea: { width: 402 } } })).toBe(402 / 4 - 2);
	});

	test('TREEMAP: areas by the measure, grouped by one or two dimensions, needs the treemap chunk', () => {
		const one = run({ ...byProject, view: { type: 'TREEMAP', x: 'p' } });
		const c = buildChartConfig(one, { type: 'TREEMAP', x: 'p' }, theme);
		expect(c.type).toBe('treemap');
		expect(c.needs.treemap).toBe(true);
		const ds = c.data.datasets[0];
		expect(ds.key).toBe('__v');
		expect(ds.groups).toEqual(['__g0']);
		expect(ds.data[0].__g0).toBe('Tower A');
		const leaf = ds._leafOf({ _data: { children: [ds.data[1]] } });
		expect(leaf.p).toBe('p2');
		const spec2: ReportSpec = { ...byProject, groupBy: [{ field: 'productId', as: 'p' }, { field: 'stageGroup', as: 's' }], view: { type: 'TREEMAP', x: 'p' } };
		const two = buildChartConfig(run(spec2), spec2.view, theme);
		expect(two.data.datasets[0].groups).toEqual(['__g0', '__g1']);
		expect(two.data.datasets[0].captions.display).toBe(true);
	});

	test('WATERFALL: floating bars of the running change and a total; labels show the change', () => {
		const out: ReportSuccess = {
			ok: true,
			columns: [P_COL as any, { key: 'n', label: 'Change', kind: 'MEASURE' }],
			rows: [
				{ p: 'a', n: 10 },
				{ p: 'b', n: -4 },
				{ p: 'c', n: 6 },
			],
		};
		const c = buildChartConfig(out, { type: 'WATERFALL', x: 'p', style: { dataLabels: 'outside' } }, theme);
		expect(c.type).toBe('bar');
		expect(c.data.labels).toEqual(['a', 'b', 'c', 'Total']);
		const ds = c.data.datasets[0];
		expect(ds.data).toEqual([
			[0, 10],
			[10, 6],
			[6, 12],
			[0, 12],
		]);
		expect(ds.backgroundColor).toEqual(['#111111', '#222222', '#111111', theme.muted]);
		expect(c.options.plugins.datalabels.formatter([10, 6], { dataset: ds, dataIndex: 1 })).toBe('-4');
		expect(c.options.plugins.tooltip.callbacks.label({ dataset: ds, dataIndex: 1, raw: [10, 6] })).toBe('Change: -4');
	});

	test('zoom only when asked, on more than two categories', () => {
		const spec: ReportSpec = { ...byProject, groupBy: [{ field: 'bookedAt', bucket: 'MONTH', as: 'm' }], view: { type: 'LINE', x: 'm' } };
		const out = run(spec);
		const z = buildChartConfig(out, spec.view, theme, { zoom: true });
		expect(z.needs.zoom).toBe(true);
		expect(z.options.plugins.zoom.zoom.wheel).toEqual({ enabled: true, modifierKey: 'ctrl' });
		expect(z.options.plugins.zoom.pan.enabled).toBe(false);
		expect(buildChartConfig(out, spec.view, theme).needs.zoom).toBeUndefined();
		expect(buildChartConfig(out, spec.view, theme).options.plugins.zoom).toBeUndefined();
	});
});
