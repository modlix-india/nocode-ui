import {
	applyChartOptIns,
	clickPayload,
	dataLabelsConfig,
	referenceLineConfig,
	wantedPlugins,
} from '../chartOptIn';
import { propertiesDefinition } from '../../chartProperties';

const theme = { palette: ['#aaaaaa', '#bbbbbb'], axisColor: '#cccccc', textColor: '#dddddd' };

describe('Chart opt-in props leave existing charts unchanged', () => {
	test('the new properties default to off', () => {
		const byName = new Map(propertiesDefinition.map(p => [p.name, p]));
		expect(byName.get('dataLabels')!.defaultValue).toBe('off');
		expect(byName.get('referenceLines')!.defaultValue).toBeUndefined();
		expect(byName.get('onDataClick')!.defaultValue).toBeUndefined();
	});

	test('nothing set: no plugin is wanted and the options object is returned as it is', () => {
		const options = { plugins: { legend: { display: true } } };
		const props = { dataLabels: 'off' as const, referenceLines: undefined };
		expect(wantedPlugins(props)).toEqual({ dataLabels: false, annotation: false });
		expect(applyChartOptIns(options, props, theme, () => {})).toBe(options);
		expect(applyChartOptIns(options, {}, theme)).toBe(options);
		// A click handler without the event set changes nothing either.
		expect(applyChartOptIns(options, { onDataClick: '' }, theme, () => {})).toBe(options);
	});

	test('bad reference lines are ignored', () => {
		expect(
			wantedPlugins({ referenceLines: [{ value: 'x' } as any, null as any] }).annotation,
		).toBe(false);
	});
});

describe('opted in', () => {
	test('data labels', () => {
		const o = applyChartOptIns(
			{ plugins: {} },
			{ dataLabels: 'inside', numberLocale: 'en-IN' },
			theme,
		);
		expect(wantedPlugins({ dataLabels: 'inside' }).dataLabels).toBe(true);
		expect(o.plugins.datalabels).toMatchObject({
			anchor: 'center',
			align: 'center',
			color: '#dddddd',
		});
		expect(o.plugins.datalabels.formatter(4500000)).toBe('45,00,000');
		expect(o.plugins.datalabels.formatter({ x: 1, y: 2 })).toBe('2');
		expect(dataLabelsConfig('end')).toMatchObject({ anchor: 'end', align: 'start' });
		expect(dataLabelsConfig('outside')).toMatchObject({ anchor: 'end', align: 'end' });
	});

	test('reference lines use theme colours, flip with an inverted chart', () => {
		const a = referenceLineConfig(
			[
				{ value: 10, label: 'Target', paletteIndex: 2 },
				{ value: '5', axis: 'x' },
			],
			theme,
			false,
		);
		expect(a.referenceLine0).toMatchObject({
			type: 'line',
			scaleID: 'y',
			value: 10,
			borderColor: '#bbbbbb',
		});
		expect(a.referenceLine0.label.content).toBe('Target');
		expect(a.referenceLine1).toMatchObject({ scaleID: 'x', value: 5, borderColor: '#cccccc' });
		expect(referenceLineConfig([{ value: 1 }], theme, true).referenceLine0.scaleID).toBe('x');
		const o = applyChartOptIns({}, { referenceLines: [{ value: 3 }] }, theme);
		expect(o.plugins.annotation.annotations.referenceLine0.value).toBe(3);
	});

	test('onDataClick sets the click handler and a pointer cursor over marks', () => {
		const fn = jest.fn();
		const o = applyChartOptIns({ plugins: {} }, { onDataClick: 'ev' }, theme, fn);
		expect(o.onClick).toBe(fn);
		const target = { style: { cursor: '' } };
		o.onHover({ native: { target } }, [{}]);
		expect(target.style.cursor).toBe('pointer');
		o.onHover({ native: { target } }, []);
		expect(target.style.cursor).toBe('');
	});

	test('the click payload is {datasetIndex, index, label, x, y, row}', () => {
		const data = {
			labels: ['Jan', 'Feb'],
			datasets: [
				{ data: [3, 7] },
				{
					data: [
						{ x: 1, y: 9 },
						{ x: 2, y: 4 },
					],
				},
			],
		};
		const rows = [
			{ m: 'Jan', n: 3 },
			{ m: 'Feb', n: 7 },
		];
		expect(clickPayload([{ datasetIndex: 0, index: 1 }], data, rows)).toEqual({
			datasetIndex: 0,
			index: 1,
			label: 'Feb',
			x: 'Feb',
			y: 7,
			row: { m: 'Feb', n: 7 },
		});
		expect(clickPayload([{ datasetIndex: 1, index: 0 }], data, undefined)).toEqual({
			datasetIndex: 1,
			index: 0,
			label: 'Jan',
			x: 1,
			y: 9,
			row: null,
		});
		expect(clickPayload([], data, rows)).toBeUndefined();
	});
});
