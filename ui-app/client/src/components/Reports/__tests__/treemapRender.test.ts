import { Chart, registerables } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { fixtureRun } from '../fixtures/reportFixtures';
import { buildChartConfig, ChartTheme } from '../reportChartConfig';
import { ReportSpec, ReportSuccess } from '../reportTypes';

/**
 * The treemap chunk is chartjs-chart-treemap 4.2.2 (5.0.x was two days old when pinned). These
 * render the config buildChartConfig makes through the real controller on a canvas whose 2d
 * context is a stub (jsdom has none), so a version change that breaks the layout, the
 * rectangles' `_data` / `g` / `l` / `v`, or a re-run with new rows fails here.
 */

Chart.register(...registerables, TreemapController, TreemapElement);

const theme: ChartTheme = {
	palette: ['#111111', '#222222', '#333333'],
	text: 'rgb(10, 10, 10)',
	muted: 'rgb(90, 90, 90)',
	grid: 'rgb(200, 200, 200)',
	surface: 'rgb(255, 255, 255)',
};

function stubCanvas(): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = 400;
	canvas.height = 300;
	const noop = () => undefined;
	const ctx: any = new Proxy(
		{
			canvas,
			measureText: (t: string) => ({ width: String(t).length * 6 }),
			getLineDash: () => [],
			createLinearGradient: () => ({ addColorStop: noop }),
		},
		{
			get(target: any, key) {
				if (key in target) return target[key];
				return noop;
			},
			set(target: any, key, value) {
				target[key] = value;
				return true;
			},
		},
	);
	(canvas as any).getContext = () => ctx;
	document.body.appendChild(canvas);
	return canvas;
}

function render(cfg: any): Chart {
	return new Chart(stubCanvas(), {
		type: cfg.type,
		data: cfg.data,
		options: { ...cfg.options, responsive: false, animation: false },
	} as any);
}

const spec = (two: boolean): ReportSpec => ({
	v: 1,
	source: 'cases',
	measures: [{ fn: 'COUNT', as: 'n' }],
	groupBy: two
		? [
				{ field: 'productId', as: 'p' },
				{ field: 'stageGroup', as: 's' },
			]
		: [{ field: 'productId', as: 'p' }],
	filters: [{ field: 'bookedAt', period: 'THIS_QUARTER' }],
	view: { type: 'TREEMAP', x: 'p' },
});

function run(s: ReportSpec): ReportSuccess {
	const out = fixtureRun(s);
	if (!out.ok) throw new Error('fixture run failed');
	return out;
}

describe('treemap on chartjs-chart-treemap 4.2.2', () => {
	test('one group by: one rectangle per project, sized by the measure, colours and labels resolve', () => {
		const out = run(spec(false));
		const cfg = buildChartConfig(out, spec(false).view, theme);
		const chart = render(cfg);
		const ds: any = chart.data.datasets[0];
		const rects = ds.data as any[];
		expect(rects.length).toBe(out.rows.length);
		const total = out.rows.reduce((a, r) => a + (r.n as number), 0);
		expect(rects.reduce((a, r) => a + r.v, 0)).toBe(total);
		for (const r of rects) {
			expect(r.w).toBeGreaterThan(0);
			expect(r.h).toBeGreaterThan(0);
			expect(typeof r.g).toBe('string');
			expect(r.l).toBe(0);
			expect(ds._leafOf(r).__g0).toBe(r.g);
		}
		expect(chart.getDatasetMeta(0).data.length).toBe(rects.length);
		const bg = ds.backgroundColor({ type: 'data', raw: rects[0] });
		expect(bg).toMatch(/^#|^rgb/);
		const label = ds.labels.formatter({ raw: rects[0] });
		expect(label[0]).toBe(rects[0].g);
		chart.destroy();
	});

	test('two group bys: parents with captions and children per stage group', () => {
		const out = run(spec(true));
		const cfg = buildChartConfig(out, spec(true).view, theme);
		const chart = render(cfg);
		const rects = (chart.data.datasets[0] as any).data as any[];
		const parents = rects.filter(r => r.l === 0);
		const children = rects.filter(r => r.l === 1);
		expect(parents.length).toBe(new Set(out.rows.map(r => r.p)).size);
		expect(children.length).toBe(out.rows.length);
		chart.destroy();
	});

	test('a new run (same dataset object, new rows) lays out the new rows', () => {
		const out = run(spec(false));
		const cfg = buildChartConfig(out, spec(false).view, theme);
		const chart = render(cfg);
		const fewer: ReportSuccess = { ...out, rows: out.rows.slice(0, 1) };
		const next = buildChartConfig(fewer, spec(false).view, theme);
		// What react-chartjs-2 does on new props: assign onto the dataset it already has.
		Object.assign(chart.data.datasets[0], next.data.datasets[0]);
		chart.update();
		const rects = (chart.data.datasets[0] as any).data as any[];
		expect(rects.length).toBe(1);
		// Laid out (a rectangle, not the raw row) from the new row.
		expect(rects[0].w).toBeGreaterThan(0);
		expect(rects[0].v).toBe(fewer.rows[0].n);
		expect(rects[0]._data).toBeDefined();
		chart.destroy();
	});
});
