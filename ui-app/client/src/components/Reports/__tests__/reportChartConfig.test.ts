import {
	buildChartConfig,
	ChartTheme,
	colorFor,
	gaugeParts,
	shortLabel,
	targetValue,
} from '../reportChartConfig';
import { ReportSuccess, ReportView } from '../reportTypes';

const theme: ChartTheme = {
	palette: ['#111111', '#222222', '#333333'],
	text: 'rgb(10, 10, 10)',
	muted: 'rgb(90, 90, 90)',
	grid: 'rgb(200, 200, 200)',
	surface: 'rgb(255, 255, 255)',
};

const oneDim: ReportSuccess = {
	ok: true,
	columns: [
		{ key: 'rm', kind: 'DIMENSION', label: 'RM' },
		{ key: 'rm_label', hidden: true },
		{ key: 'n', kind: 'MEASURE', label: 'Bookings', format: 'NUMBER' },
		{ key: 'v', kind: 'MEASURE', label: 'Value', format: 'MONEY', currency: 'INR' },
	],
	rows: [
		{ rm: 'a', rm_label: 'A', n: 2, v: 100 },
		{ rm: 'b', rm_label: 'B', n: 5, v: 400 },
		{ rm: 'c', rm_label: 'C', n: 3, v: 200 },
	],
};

const twoDims: ReportSuccess = {
	ok: true,
	columns: [
		{ key: 'm', kind: 'DATE', label: 'Month' },
		{ key: 'm_label', hidden: true },
		{ key: 'p', kind: 'DIMENSION', label: 'Project' },
		{ key: 'p_label', hidden: true },
		{ key: 'n', kind: 'MEASURE', label: 'Bookings' },
	],
	rows: [
		{ m: '2026-10-01', m_label: 'Oct 2026', p: 'x', p_label: 'X', n: 1 },
		{ m: '2026-10-01', m_label: 'Oct 2026', p: 'y', p_label: 'Y', n: 3 },
		{ m: '2026-11-01', m_label: 'Nov 2026', p: 'x', p_label: 'X', n: 2 },
		{ m: '2026-11-01', m_label: 'Nov 2026', p: 'y', p_label: 'Y', n: 2 },
	],
};

const build = (out: ReportSuccess, view: ReportView) =>
	buildChartConfig(out, view, theme, { locale: 'en-US' });

test('bar: one dataset per measure, two formats get a second axis, theme colours only', () => {
	const c = build(oneDim, { type: 'BAR' });
	expect(c.type).toBe('bar');
	expect(c.data.labels).toEqual(['A', 'B', 'C']);
	expect(c.data.datasets.map(d => d.label)).toEqual(['Bookings', 'Value']);
	expect(c.data.datasets[0].backgroundColor).toBe('#111111');
	expect(c.data.datasets[1].yAxisID).toBe('y1');
	expect(c.options.scales.y1.position).toBe('right');
	expect(c.needs).toEqual({ dataLabels: false, annotation: false });
});

test('switching view.type changes only the drawing (same data)', () => {
	const hbar = build(oneDim, { type: 'HBAR', y: ['n'] });
	expect(hbar.options.indexAxis).toBe('y');
	const line = build(oneDim, { type: 'SMOOTH_LINE', y: ['n'] });
	expect(line.type).toBe('line');
	expect(line.data.datasets[0].tension).toBe(0.4);
	const step = build(oneDim, { type: 'STEP_LINE', y: ['n'] });
	expect(step.data.datasets[0].stepped).toBe('middle');
	const area = build(oneDim, { type: 'AREA', y: ['n'] });
	expect(area.data.datasets[0].fill).toBe('origin');
	const pie = build(oneDim, { type: 'PIE', y: ['n'] });
	expect(pie.type).toBe('pie');
	expect(pie.data.datasets[0].backgroundColor).toEqual(['#111111', '#222222', '#333333']);
	expect(build(oneDim, { type: 'DOUGHNUT' }).type).toBe('doughnut');
	for (const c of [hbar, line, step, area, pie])
		expect(c.data.datasets[0].data).toEqual([2, 5, 3]);
});

test('funnel sorts largest first; lollipop adds point markers; combo puts the second measure on a line', () => {
	expect(build(oneDim, { type: 'FUNNEL', y: ['n'] }).data.labels).toEqual(['B', 'C', 'A']);
	const lol = build(oneDim, { type: 'LOLLIPOP', y: ['n'] });
	expect(lol.data.datasets.length).toBe(2);
	expect(lol.data.datasets[1]).toMatchObject({ type: 'line', showLine: false });
	const combo = build(oneDim, { type: 'COMBO' });
	expect(combo.data.datasets[0].type).toBe('bar');
	expect(combo.data.datasets[1]).toMatchObject({ type: 'line', yAxisID: 'y1' });
});

test('scatter plots measure against measure', () => {
	const s = build(oneDim, { type: 'SCATTER' });
	expect(s.type).toBe('scatter');
	expect(s.data.datasets[0].data[1]).toEqual({ x: 5, y: 400 });
});

test('stacked and 100% stacked pivot the second dimension into series', () => {
	const st = build(twoDims, { type: 'STACKED_BAR' });
	expect(st.data.labels).toEqual(['Oct 2026', 'Nov 2026']);
	expect(st.data.datasets.map(d => d.label)).toEqual(['X', 'Y']);
	expect(st.options.scales.x.stacked).toBe(true);
	const p = build(twoDims, { type: 'STACKED_BAR_100' });
	expect(p.data.datasets[0].data).toEqual([25, 50]);
	expect(p.options.scales.y.max).toBe(100);
	const sa = build(twoDims, { type: 'STACKED_AREA' });
	expect(sa.data.datasets[0].fill).toBe('stack');
});

test('style: legend, gridlines, log scale, begin at zero, axis titles, swap axes, series colours', () => {
	const c = build(oneDim, {
		type: 'BAR',
		y: ['n'],
		style: {
			legend: 'right',
			gridlines: 'none',
			logScale: true,
			xTitle: 'People',
			yTitle: 'Count',
			swapAxes: true,
			seriesColors: { n: 2 },
		},
	});
	expect(c.options.plugins.legend.position).toBe('right');
	expect(c.options.indexAxis).toBe('y');
	expect(c.options.scales.x.type).toBe('logarithmic');
	expect(c.options.scales.x.grid.display).toBe(false);
	expect(c.options.scales.y.title.text).toBe('People');
	expect(c.data.datasets[0].backgroundColor).toBe('#333333');
	expect(
		build(oneDim, { type: 'BAR', style: { beginAtZero: false } }).options.scales.y.beginAtZero,
	).toBe(false);
	expect(
		build(oneDim, { type: 'BAR', style: { legend: 'none' } }).options.plugins.legend.display,
	).toBe(false);
	expect(colorFor(theme, undefined, 'k', 4)).toBe('#222222');
});

test('data labels and reference lines ask for their lazy plugins', () => {
	const c = build(oneDim, {
		type: 'BAR',
		y: ['n'],
		style: {
			dataLabels: 'outside',
			referenceLines: [{ value: 4, label: 'Target', measure: 'n' }],
		},
	});
	expect(c.needs).toEqual({ dataLabels: true, annotation: true });
	expect(c.options.plugins.datalabels).toMatchObject({ anchor: 'end', align: 'end' });
	expect(
		c.options.plugins.datalabels.formatter(1500, { dataset: c.data.datasets[0], dataIndex: 0 }),
	).toBe('1.5K');
	const ref = c.options.plugins.annotation.annotations.ref0;
	expect(ref).toMatchObject({ type: 'line', scaleID: 'y', value: 4 });
	expect(ref.label.content).toBe('Target: 4');
	expect(build(oneDim, { type: 'BAR' }).options.plugins.datalabels).toEqual({ display: false });
});

test('trend line is an extra dashed dataset; tooltips list measures not drawn', () => {
	const c = build(oneDim, { type: 'BAR', y: ['n'], style: { trendLine: true } });
	const trend = c.data.datasets[c.data.datasets.length - 1];
	expect(trend._trend).toBe(true);
	expect(trend.data.length).toBe(3);
	const items = [{ dataset: c.data.datasets[0], dataIndex: 1, chart: { data: c.data } }];
	expect(c.options.plugins.tooltip.callbacks.afterBody(items)).toEqual(['Value: ₹400']);
	expect(
		c.options.plugins.tooltip.callbacks.label({
			dataset: c.data.datasets[0],
			dataIndex: 1,
			raw: 5,
		}),
	).toBe('Bookings: 5');
});

test('gauge is a half doughnut against the target', () => {
	const kpi: ReportSuccess = {
		ok: true,
		columns: [{ key: 'n', kind: 'MEASURE', label: 'N' }],
		rows: [{ n: 60 }],
	};
	const g = build(kpi, { type: 'GAUGE', style: { target: 80 } });
	expect(g.type).toBe('doughnut');
	expect(g.data.datasets[0].data).toEqual([60, 20]);
	expect(g.data.datasets[0].circumference).toBe(180);
	expect(gaugeParts(kpi, { type: 'GAUGE' }).max).toBe(100);
	expect(targetValue({ target: 'n' }, { n: 7 })).toBe(7);
	expect(targetValue({}, {})).toBeUndefined();
});

test('keys the runner left out (null values) are skipped points, not zeros', () => {
	const sparse: ReportSuccess = {
		ok: true,
		columns: oneDim.columns,
		rows: [
			{ rm: 'a', rm_label: 'A', n: 2 },
			{ rm: 'b', rm_label: 'B' },
			{ rm: 'c', rm_label: 'C', n: 3, v: 9 },
		],
	};
	const c = build(sparse, { type: 'BAR' });
	expect(c.data.datasets[0].data).toEqual([2, null, 3]);
	expect(c.data.datasets[1].data).toEqual([null, null, 9]);
	const kpi: ReportSuccess = { ok: true, columns: [{ key: 'n', kind: 'MEASURE' }], rows: [{}] };
	expect(gaugeParts(kpi, { type: 'GAUGE' })).toMatchObject({ value: 0, missing: true });
});

test('series colours are spread across the palette; seriesColors still wins', () => {
	const wide: ChartTheme = {
		...theme,
		palette: Array.from({ length: 12 }, (_, i) => `#0000${String(i).padStart(2, '0')}`),
	};
	const c = buildChartConfig(oneDim, { type: 'BAR' }, wide, { locale: 'en-US' });
	expect(c.data.datasets.map(d => d.backgroundColor)).toEqual(['#000000', '#000006']);
	const own = buildChartConfig(oneDim, { type: 'BAR', style: { seriesColors: { v: 1 } } }, wide, {
		locale: 'en-US',
	});
	expect(own.data.datasets[1].backgroundColor).toBe('#000001');
	expect(colorFor(wide, undefined, 'k', 2, 4)).toBe('#000006');
});

test('long category labels are cut on the axis, the label itself stays whole', () => {
	const long: ReportSuccess = {
		...oneDim,
		rows: [{ rm: 'a', rm_label: 'zz.cxinvitee.dg12um@example.com', n: 1, v: 1 }],
	};
	const c = build(long, { type: 'BAR', y: ['n'] });
	expect(c.data.labels).toEqual(['zz.cxinvitee.dg12um@example.com']);
	const tick = c.options.scales.x.ticks.callback.call(
		{ getLabelForValue: () => c.data.labels[0] },
		0,
	);
	expect(tick).toBe('zz.cxinvitee.dg12…');
	expect(shortLabel('Asha Rao')).toBe('Asha Rao');
});
