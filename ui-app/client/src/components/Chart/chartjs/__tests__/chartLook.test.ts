import {
	applyLookToData,
	applyLookToOptions,
	chartLookPlugin,
	dotGeometry,
	effectiveLook,
	isDark,
	lookWanted,
	parseColor,
	parsePositions,
	resolveIndex,
	withAlpha,
} from '../chartLook';
import { propertiesDefinition } from '../../chartProperties';

const theme = {
	palette: ['#111111', '#D4F04A', '#E54A23', '#444444'],
	textColor: '#151719',
	gridColor: 'rgba(0,0,0,0.12)',
	axisColor: '#999999',
};

const barData = () => ({
	labels: ['00', '01', '02', '03'],
	datasets: [
		{
			label: 'Done',
			data: [4, 6, 2, 0],
			backgroundColor: ['#111111', '#111111', '#111111', '#111111'],
		},
		{ label: 'Failed', data: [0, 1, 0, 0], backgroundColor: '#E54A23' },
	],
});

describe('chart looks leave existing charts unchanged', () => {
	test('the new properties default to off', () => {
		const byName = new Map(propertiesDefinition.map(p => [p.name, p]));
		expect(byName.get('chartLook')!.defaultValue).toBe('default');
		for (const n of ['projectedFrom', 'projectedDataSets', 'nowMarker', 'callouts'])
			expect(byName.get(n)!.defaultValue).toBeUndefined();
	});

	test('nothing set: data and options come back as the same objects', () => {
		const data = barData();
		const options = { plugins: { legend: { display: true } }, scales: { x: {}, y: {} } };
		for (const p of [undefined, {}, { chartLook: 'default' }, { chartLook: 'nonsense' }]) {
			expect(lookWanted(p as any)).toBe(false);
			expect(applyLookToData(data, p as any, theme, 'bar')).toBe(data);
			expect(applyLookToOptions(options, p as any, theme, data.labels, 'bar')).toBe(options);
		}
		// Empty marker and bad callouts are no look either.
		expect(
			lookWanted({ nowMarker: { value: '' }, callouts: [{ x: 1 } as any, null as any] }),
		).toBe(false);
	});

	test('the plugin does nothing for a chart without a look', () => {
		const ctx = mockCtx();
		const chart: any = { options: { plugins: {} }, ctx };
		draw('beforeDatasetsDraw', chart);
		draw('afterDatasetsDraw', chart);
		expect(ctx.calls).toHaveLength(0);
	});

	test('looks fall back where they cannot draw', () => {
		expect(effectiveLook({ chartLook: 'dotMatrix' }, 'pie')).toBe('default');
		expect(effectiveLook({ chartLook: 'isometric' }, 'line')).toBe('default');
		expect(effectiveLook({ chartLook: 'wave' }, 'line')).toBe('wave');
		expect(effectiveLook({ chartLook: 'wave' }, 'radar')).toBe('default');
		expect(effectiveLook({ chartLook: 'dotMatrix', invertAxis: true }, 'bar')).toBe('default');
		const data = barData();
		expect(applyLookToData(data, { chartLook: 'dotMatrix' }, theme, 'pie')).toBe(data);
	});
});

describe('helpers', () => {
	test('colours', () => {
		expect(parseColor('#abc')).toEqual([170, 187, 204, 1]);
		expect(parseColor('#11223380')![3]).toBeCloseTo(0.502, 2);
		expect(parseColor('rgba(1, 2, 3, 0.5)')).toEqual([1, 2, 3, 0.5]);
		expect(parseColor('red')).toBeUndefined();
		expect(withAlpha('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
		expect(withAlpha('red', 0.5)).toBe('red');
		expect(isDark('#151719')).toBe(true);
		expect(isDark('#E2E4E6')).toBe(false);
	});

	test('positions and x lookups', () => {
		expect(parsePositions('2, 3,x,0')).toEqual([1, 2]);
		expect(parsePositions(undefined)).toEqual([]);
		expect(resolveIndex('02', ['00', '01', '02'])).toBe(2);
		expect(resolveIndex(1, ['00', '01'])).toBe(1);
		expect(resolveIndex('', ['00'])).toBeUndefined();
	});

	test('dot size follows the bar width, within limits', () => {
		expect(dotGeometry(100).r).toBe(5.5);
		expect(dotGeometry(1).r).toBe(1.5);
	});
});

describe('dot grid and prisms', () => {
	test('bars are hidden and their colours kept for the plugin', () => {
		const out = applyLookToData(barData(), { chartLook: 'dotMatrix' }, theme, 'bar');
		expect(out.datasets[0].backgroundColor).toBe('rgba(0, 0, 0, 0)');
		expect(out.datasets[0].borderWidth).toBe(0);
		expect(out.datasets[0].lookColor).toEqual(['#111111', '#111111', '#111111', '#111111']);
		expect(out.datasets[1].lookColor).toEqual(['#E54A23', '#E54A23', '#E54A23', '#E54A23']);
	});

	test('a gradient colour falls back to the theme palette', () => {
		const d = barData();
		(d.datasets[1] as any).backgroundColor = 'url(#gradient_12)';
		const out = applyLookToData(d, { chartLook: 'isometric' }, theme, 'bar');
		expect(out.datasets[1].lookColor[0]).toBe('#D4F04A');
	});

	test('options: grids off, plugin options, room for the tag', () => {
		const o = applyLookToOptions(
			{ scales: { x: { grid: { display: true } }, y: {} }, layout: { padding: 4 } },
			{
				chartLook: 'dotMatrix',
				nowMarker: { value: '02', label: 'NOW 02:10' },
				projectedDataSets: '2',
				callouts: [{ x: '01', label: 'slower', paletteIndex: 3 }],
			},
			theme,
			['00', '01', '02', '03'],
			'bar',
		);
		expect(o.scales.x.grid.display).toBe(false);
		expect(o.scales.y.grid.display).toBe(false);
		expect(o.layout.padding).toEqual({ top: 28, right: 4, bottom: 4, left: 4 });
		expect(o.plugins.chartLook).toMatchObject({
			look: 'dotMatrix',
			nowIndex: 2,
			nowLabel: 'NOW 02:10',
			projectedFromIndex: 3,
			projectedDataSets: [1],
			callouts: [{ index: 1, label: 'slower', color: '#E54A23' }],
			textColor: '#151719',
		});
	});

	test('dots: one column per value, hollow when projected', () => {
		const ctx = mockCtx();
		const chart = fakeBarChart(ctx, { look: 'dotMatrix', projectedFromIndex: 1 });
		draw('afterDatasetsDraw', chart);
		// width 10 -> dot 8.2, step 10.496; 100px -> 10 dots, 50px -> 5 dots.
		const arcs = ctx.calls.filter(c => c[0] === 'arc');
		const big = arcs.filter(c => c[3] > 1); // lattice dots have r 0.9
		expect(big).toHaveLength(15);
		const strokes = ctx.calls.filter(c => c[0] === 'stroke');
		expect(strokes).toHaveLength(5); // the projected (second) bar
	});

	test('prisms draw faces and hatch projected bars', () => {
		const ctx = mockCtx();
		const chart = fakeBarChart(ctx, { look: 'isometric', projectedFromIndex: 1 });
		draw('afterDatasetsDraw', chart);
		expect(ctx.calls.filter(c => c[0] === 'fillRect')).toHaveLength(1);
		expect(ctx.calls.some(c => c[0] === 'clip')).toBe(true);
		expect(ctx.calls.filter(c => c[0] === 'createLinearGradient')).toHaveLength(1);
	});

	test('now marker draws a dotted line and a tag', () => {
		const ctx = mockCtx();
		const chart = fakeBarChart(ctx, { look: 'default', nowIndex: 1, nowLabel: 'NOW' });
		draw('afterDatasetsDraw', chart);
		expect(ctx.calls.some(c => c[0] === 'setLineDash' && (c[1] as number[]).length === 2)).toBe(
			true,
		);
		expect(ctx.calls.some(c => c[0] === 'fillText' && c[1] === 'NOW')).toBe(true);
	});
});

describe('ridges', () => {
	test('each data set becomes its own row, first on top, raw values kept', () => {
		const out = applyLookToData(
			barData(),
			{ chartLook: 'wave', projectedFrom: '02' },
			theme,
			'bar',
		);
		expect(out.datasets.map((d: any) => d.lookBase)).toEqual([1, 0]);
		expect(out.datasets[0].type).toBe('line');
		expect(out.datasets[0].lookRaw).toEqual([4, 6, 2, 0]);
		expect(out.datasets[0].data[1]).toBeCloseTo(1 + 1.2);
		expect(out.datasets[1].fill).toEqual({ value: 0 });
		const dash = out.datasets[0].segment.borderDash;
		expect(dash({ p1DataIndex: 1 })).toBeUndefined();
		expect(dash({ p1DataIndex: 2 })).toEqual([2, 3]);
	});

	test('options hide the value axis and the legend, tooltips show raw values', () => {
		const o = applyLookToOptions(
			{ plugins: { legend: { display: true } }, scales: { x: {}, y: { stacked: true } } },
			{ chartLook: 'wave' },
			theme,
			['a', 'b'],
			'bar',
		);
		expect(o.scales.y.display).toBe(false);
		expect(o.scales.y.stacked).toBe(false);
		expect(o.plugins.legend.display).toBe(false);
		expect(o.layout.padding.left).toBe(120);
		const label = o.plugins.tooltip.callbacks.label;
		expect(label({ dataset: { label: 'Runs', lookRaw: [7, 9] }, dataIndex: 1 })).toBe(
			'Runs: 9',
		);
	});
});

// ------------------------------------------------------------------ fakes

interface MockCtx {
	calls: any[][];
	[k: string]: any;
}

function draw(hook: 'beforeDatasetsDraw' | 'afterDatasetsDraw', chart: any) {
	(chartLookPlugin as any)[hook](chart, {}, {});
}

function mockCtx(): MockCtx {
	const calls: any[][] = [];
	const ctx: any = new Proxy(
		{ calls, measureText: (t: string) => ({ width: t.length * 6 }) },
		{
			get(target: any, prop: string) {
				if (prop in target) return target[prop];
				return (...args: any[]) => {
					calls.push([prop, ...args]);
					if (prop === 'createLinearGradient') return { addColorStop: () => {} };
					return undefined;
				};
			},
			set(target: any, prop: string, value: any) {
				target[prop] = value;
				return true;
			},
		},
	);
	return ctx;
}

function fakeBarChart(ctx: any, look: any) {
	const bars = [
		{ x: 50, y: 100, base: 200, width: 10 },
		{ x: 80, y: 150, base: 200, width: 10 },
	];
	const el = (b: any) => ({ getProps: () => b });
	return {
		ctx,
		chartArea: { top: 20, bottom: 200, left: 30, right: 300 },
		data: { labels: ['a', 'b'], datasets: [{ lookColor: ['#111111', '#111111'] }] },
		options: {
			plugins: {
				chartLook: {
					projectedDataSets: [],
					callouts: [],
					textColor: '#151719',
					gridColor: '#cccccc',
					axisColor: '#999999',
					...look,
				},
			},
		},
		scales: {
			x: { getPixelForValue: (i: number) => [50, 80][i] },
			y: { getPixelForValue: () => 200 },
		},
		isDatasetVisible: () => true,
		getDatasetMeta: () => ({ hidden: false, type: 'bar', data: bars.map(el) }),
	} as any;
}
