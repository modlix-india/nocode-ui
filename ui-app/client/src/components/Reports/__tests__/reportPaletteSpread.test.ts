import { colorFor, type ChartTheme } from '../reportChartConfig';
import { reportStyleProperties, REPORT_PALETTE_SPREAD_VAR } from '../reportStyle';

const palette = [
	'#000',
	'#111',
	'#222',
	'#333',
	'#444',
	'#555',
	'#666',
	'#777',
	'#888',
	'#999',
	'#aaa',
	'#bbb',
];
const theme = (spread?: boolean): ChartTheme => ({
	palette,
	text: '#t',
	muted: '',
	grid: '',
	surface: '',
	spread,
});

describe('report palette spread (Theme.reportPaletteSpread)', () => {
	it('spreads series across the palette by default, as before', () => {
		expect([0, 1].map(i => colorFor(theme(), undefined, undefined, i, 2))).toEqual([
			'#000',
			'#666',
		]);
		expect([0, 1].map(i => colorFor(theme(true), undefined, undefined, i, 2))).toEqual([
			'#000',
			'#666',
		]);
	});

	it('takes the palette in order when the theme turns the spread off', () => {
		expect([0, 1, 2].map(i => colorFor(theme(false), undefined, undefined, i, 3))).toEqual([
			'#000',
			'#111',
			'#222',
		]);
	});

	it('still honours a picked series colour', () => {
		expect(colorFor(theme(false), { seriesColors: { s: 5 } } as any, 's', 0, 2)).toBe('#555');
	});

	it('declares the variable with default true and no CSS property', () => {
		const v = reportStyleProperties('.x').find(p => p.n === REPORT_PALETTE_SPREAD_VAR)!;
		expect(v.dv).toBe('true');
		expect((v as any).cp).toBeUndefined();
	});
});
