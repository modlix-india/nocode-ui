import {
	applyPctOfTotal,
	applyRunningTotal,
	applyStyleTransforms,
	applyTopN,
	chartAxes,
	OTHER_LABEL,
	trendLine,
} from '../reportTransform';
import { ReportSpec, ReportSuccess } from '../reportTypes';

const spec: ReportSpec = {
	v: 1,
	source: 'cases',
	measures: [
		{ fn: 'COUNT', as: 'n' },
		{ fn: 'AVG', field: 'v', as: 'avg' },
	],
	derived: [{ as: 'r', ratio: ['n', 'n'] }],
	groupBy: [{ field: 'rm', as: 'rm' }],
	view: { type: 'BAR', x: 'rm', y: ['n'] },
};

const out: ReportSuccess = {
	ok: true,
	columns: [
		{ key: 'rm', kind: 'DIMENSION', label: 'RM' },
		{ key: 'rm_label', hidden: true },
		{ key: 'n', kind: 'MEASURE', label: 'Bookings', format: 'NUMBER' },
		{ key: 'avg', kind: 'MEASURE', label: 'Avg', format: 'MONEY', currency: 'INR' },
		{ key: 'r', kind: 'MEASURE', label: 'Ratio' },
	],
	rows: [
		{ rm: 'a', rm_label: 'A', n: 10, avg: 5, r: 1 },
		{ rm: 'b', rm_label: 'B', n: 30, avg: 6, r: 1 },
		{ rm: 'c', rm_label: 'C', n: 20, avg: 7, r: 1 },
		{ rm: 'd', rm_label: 'D', n: 40, avg: 8, r: 1 },
	],
};

test('axes: view.x and view.y win, else first dimension and every measure', () => {
	const a = chartAxes(out, spec.view);
	expect(a.x!.key).toBe('rm');
	expect(a.ys.map(c => c.key)).toEqual(['n']);
	expect(chartAxes(out, { type: 'TABLE' }).ys.map(c => c.key)).toEqual(['n', 'avg', 'r']);
});

test('top N keeps the largest and folds the rest into Other', () => {
	const r = applyTopN(out, spec, chartAxes(out, spec.view), 2);
	expect(r.rows.map(e => e.rm_label)).toEqual(['B', 'D', OTHER_LABEL]);
	const other = r.rows[2];
	expect(other.n).toBe(30);
	// AVG has no meaningful Other; derived ratio is recomputed from the sums.
	expect(other.avg).toBeNull();
	expect(other.r).toBe(1);
	expect(applyTopN(out, spec, chartAxes(out, spec.view), 10)).toBe(out);
});

test('% of total turns the measure into a PERCENT column', () => {
	const r = applyPctOfTotal(out, chartAxes(out, spec.view));
	expect(r.rows.map(e => e.n)).toEqual([10, 30, 20, 40]);
	expect(r.columns.find(c => c.key === 'n')).toMatchObject({
		format: 'PERCENT',
		label: '% of Bookings',
	});
});

test('running total accumulates in row order, per series', () => {
	const r = applyRunningTotal(out, chartAxes(out, spec.view));
	expect(r.rows.map(e => e.n)).toEqual([10, 40, 60, 100]);
	const two: ReportSuccess = {
		ok: true,
		columns: [
			{ key: 'm', kind: 'DATE' },
			{ key: 's', kind: 'DIMENSION' },
			{ key: 'n', kind: 'MEASURE' },
		],
		rows: [
			{ m: 1, s: 'x', n: 1 },
			{ m: 1, s: 'y', n: 5 },
			{ m: 2, s: 'x', n: 2 },
			{ m: 2, s: 'y', n: 5 },
		],
	};
	expect(applyRunningTotal(two, chartAxes(two, undefined)).rows.map(e => e.n)).toEqual([
		1, 5, 3, 10,
	]);
});

test('pctOfTotal then runningTotal gives a cumulative share', () => {
	const r = applyStyleTransforms(out, spec, { pctOfTotal: true, runningTotal: true });
	expect(r.rows.map(e => e.n)).toEqual([10, 40, 60, 100]);
	expect(applyStyleTransforms(out, spec, {})).toBe(out);
});

test('trend line is least squares through the points', () => {
	expect(trendLine([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
	const t = trendLine([2, null, 6]);
	expect(t[0]).toBeCloseTo(2);
	expect(t[2]).toBeCloseTo(6);
	expect(trendLine([5])).toEqual([null]);
});
