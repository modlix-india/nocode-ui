import { buildChartConfig, ChartTheme } from '../reportChartConfig';
import { applyReportChartLook, reportLookFor } from '../reportChartLook';
import { reportStyleProperties, REPORT_CHART_LOOK_VAR } from '../reportStyle';
import { ReportSuccess, ReportView } from '../reportTypes';
import { processStyleDefinition } from '../../../util/styleProcessor';

const base: ChartTheme = {
	palette: ['#151719', '#D4F04A', '#E54A23'],
	text: 'rgb(21, 23, 25)',
	muted: 'rgb(120, 120, 120)',
	grid: 'rgb(220, 220, 220)',
	surface: 'rgb(255, 255, 255)',
};
const withLook = (look?: string): ChartTheme => ({ ...base, look });

const months: ReportSuccess = {
	ok: true,
	columns: [
		{ key: 'm', kind: 'DIMENSION', label: 'Month' },
		{ key: 'm_label', hidden: true },
		{ key: 'n', kind: 'MEASURE', label: 'Bookings', format: 'NUMBER' },
	],
	rows: [
		{ m: 'a', m_label: 'Jan', n: 2000 },
		{ m: 'b', m_label: 'Feb', n: 5000 },
		{ m: 'c', m_label: 'Mar', n: 3000 },
	],
};

const build = (view: ReportView, theme: ChartTheme = base) =>
	buildChartConfig(months, view, theme, { locale: 'en-US' });

describe('the theme variable', () => {
	test('declared on every report component, default "default", never written to the CSS', () => {
		const props = reportStyleProperties('.comp.compReportWidget');
		const v = props.find(p => p.n === REPORT_CHART_LOOK_VAR)!;
		expect(REPORT_CHART_LOOK_VAR).toBe('reportChartLook');
		expect(v).toMatchObject({ dn: 'Chart Look', dv: 'default' });
		expect(v.cp).toBeUndefined();
		expect(v.sel).toBeUndefined();
		const css = processStyleDefinition(
			'.comp.compReportWidget',
			props,
			new Map([[REPORT_CHART_LOOK_VAR, 'dotMatrix']]),
			undefined,
		);
		expect(css).not.toContain('dotMatrix');
	});
});

describe('no look: every chart exactly as today', () => {
	for (const look of [undefined, '', 'default', 'something else'])
		test(`look ${JSON.stringify(look)}`, () => {
			for (const type of ['BAR', 'LINE', 'PIE', 'DOUGHNUT', 'HBAR'] as const) {
				const c = build({ type });
				expect(applyReportChartLook(c, withLook(look))).toBe(c);
			}
		});
});

describe('the widget chart type decides', () => {
	test('pie, doughnut, scatter and horizontal bars keep their drawing under every look', () => {
		for (const look of ['dotMatrix', 'isometric', 'wave'])
			for (const type of ['PIE', 'DOUGHNUT', 'HBAR'] as const) {
				const c = build({ type });
				expect(applyReportChartLook(c, withLook(look))).toBe(c);
			}
		// Swapped axes lie a bar chart down: no look either.
		const swapped = build({ type: 'BAR', style: { swapAxes: true } });
		expect(swapped.options.indexAxis).toBe('y');
		expect(applyReportChartLook(swapped, withLook('dotMatrix'))).toBe(swapped);
	});

	test('a line chart takes the wave look only', () => {
		const line = build({ type: 'LINE' });
		expect(line.type).toBe('line');
		expect(applyReportChartLook(line, withLook('dotMatrix'))).toBe(line);
		expect(applyReportChartLook(line, withLook('isometric'))).toBe(line);
		expect(reportLookFor(line, 'wave')).toBe('wave');
	});

	test('wave keeps its hands off a chart with a trend line or a compared period', () => {
		const c = build({ type: 'BAR' });
		const trend = {
			...c,
			data: { ...c.data, datasets: [...c.data.datasets, { _trend: true }] },
		};
		expect(reportLookFor(trend, 'wave')).toBe('default');
		expect(reportLookFor(trend, 'dotMatrix')).toBe('dotMatrix');
	});
});

describe('a vertical bar chart in a look', () => {
	test('dotMatrix: bars hidden, palette colours kept, plugin options from the widget theme', () => {
		const c = build({ type: 'BAR' });
		const out = applyReportChartLook(c, withLook('dotMatrix'));
		expect(out).not.toBe(c);
		expect(out.type).toBe('bar');
		expect(out.needs).toBe(c.needs);
		expect(out.data.datasets[0].backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(out.data.datasets[0].lookColor[0]).toBe('#151719');
		expect(out.options.plugins.chartLook).toMatchObject({
			look: 'dotMatrix',
			textColor: 'rgb(21, 23, 25)',
			gridColor: 'rgb(220, 220, 220)',
		});
		expect(out.options.scales.x.grid.display).toBe(false);
		// The widget's own tooltip stays.
		expect(out.options.plugins.tooltip.callbacks.label).toBe(
			c.options.plugins.tooltip.callbacks.label,
		);
		// The input config is not changed.
		expect(c.data.datasets[0].backgroundColor).toBe('#151719');
	});

	test('isometric', () => {
		const out = applyReportChartLook(build({ type: 'BAR' }), withLook('isometric'));
		expect(out.options.plugins.chartLook.look).toBe('isometric');
	});

	test('wave: the widget tooltip formats the real value, not the row position', () => {
		const c = build({ type: 'BAR' });
		const out = applyReportChartLook(c, withLook('wave'));
		const ds = out.data.datasets[0];
		expect(ds.type).toBe('line');
		expect(ds.lookRaw).toEqual([2000, 5000, 3000]);
		const text = out.options.plugins.tooltip.callbacks.label({
			dataset: ds,
			dataIndex: 1,
			raw: ds.data[1],
			parsed: { y: ds.data[1] },
		});
		// Formatted by the widget (a bare fallback would say 5000).
		expect(text).toBe('Bookings: 5,000');
	});
});
