/**
 * @jest-environment jsdom
 */
import {
	SymlogScale,
	buildSymlogTickValues,
	niceSymlogBound,
	symexp,
	symlog,
} from '../symlogScale';

describe('symlog transform', () => {
	it('maps 0 to 0 and is symmetric', () => {
		expect(symlog(0)).toBe(0);
		expect(symlog(9)).toBeCloseTo(1);
		expect(symlog(99)).toBeCloseTo(2);
		expect(symlog(-99)).toBeCloseTo(-2);
	});

	it('symexp inverts symlog', () => {
		for (const v of [0, 0.5, 1, 7, 1513, -42]) expect(symexp(symlog(v))).toBeCloseTo(v, 6);
	});
});

describe('niceSymlogBound', () => {
	it('rounds up to 1, 2, 3 or 5 times a power of ten', () => {
		expect(niceSymlogBound(1513)).toBe(2000);
		expect(niceSymlogBound(12)).toBe(20);
		expect(niceSymlogBound(2.5)).toBe(3);
		expect(niceSymlogBound(4.2)).toBe(5);
		expect(niceSymlogBound(1000)).toBe(1000);
		expect(niceSymlogBound(0.3)).toBe(0.3);
		expect(niceSymlogBound(7)).toBe(10);
	});

	it('leaves zero and negatives alone', () => {
		expect(niceSymlogBound(0)).toBe(0);
		expect(niceSymlogBound(-5)).toBe(-5);
	});
});

describe('buildSymlogTickValues', () => {
	it('places 0, then 1 and 3 per decade, then the max', () => {
		expect(buildSymlogTickValues(0, 2000)).toEqual([0, 1, 3, 10, 30, 100, 300, 1000, 2000]);
	});

	it('drops a decade tick that would sit on top of the bound', () => {
		// 1000 and 1100 are 0.04 decades apart: keep the real max only
		expect(buildSymlogTickValues(0, 1100)).toEqual([0, 1, 3, 10, 30, 100, 300, 1100]);
	});

	it('mirrors ticks for negative values', () => {
		expect(buildSymlogTickValues(-30, 30)).toEqual([-30, -10, -3, -1, 0, 1, 3, 10, 30]);
	});

	it('handles a range inside (0, 1)', () => {
		expect(buildSymlogTickValues(0, 0.5)).toEqual([0, 0.5]);
	});

	it('returns nothing for non finite bounds', () => {
		expect(buildSymlogTickValues(0, Infinity)).toEqual([]);
	});
});

describe('SymlogScale', () => {
	function makeScale(min: number, max: number, extra: Record<string, any> = {}) {
		const scale: any = new SymlogScale({
			id: 'y',
			type: 'symlog',
			ctx: {} as any,
			chart: { options: {} } as any,
		});
		scale.options = {
			bounds: 'ticks',
			reverse: false,
			position: 'left',
			offset: false,
			ticks: {},
			grid: {},
			...extra,
		};
		scale.axis = 'y';
		scale.min = min;
		scale.max = max;
		scale.top = 0;
		scale.bottom = 100;
		scale.left = 0;
		scale.right = 50;
		scale.width = 50;
		scale.height = 100;
		scale.ticks = scale.buildTicks();
		scale.configure();
		return scale;
	}

	it('registers under the id symlog', () => {
		expect(SymlogScale.id).toBe('symlog');
	});

	it('rounds the max up to a nice bound and builds ticks from 0', () => {
		const scale = makeScale(0, 1513);
		expect(scale.max).toBe(2000);
		expect(scale.ticks.map((t: any) => t.value)).toEqual([
			0, 1, 3, 10, 30, 100, 300, 1000, 2000,
		]);
	});

	it('keeps a user max', () => {
		const scale = makeScale(0, 1513, { bounds: 'ticks', max: 1513 });
		scale._userMax = 1513;
		scale.max = 1513;
		scale.ticks = scale.buildTicks();
		scale.configure();
		expect(scale.max).toBe(1513);
	});

	it('places 0 at the bottom and the max at the top (y axis grows upwards)', () => {
		const scale = makeScale(0, 999);
		expect(scale.max).toBe(1000);
		expect(scale.getPixelForValue(0)).toBeCloseTo(100);
		expect(scale.getPixelForValue(1000)).toBeCloseTo(0);
		// 9 is one decade of three (log10(1 + 9) = 1 of log10(1001) ~ 3)
		expect(scale.getPixelForValue(9)).toBeCloseTo(100 - 100 / Math.log10(1001));
	});

	it('round trips pixel and value', () => {
		const scale = makeScale(0, 1513);
		for (const v of [0, 1, 12, 400, 1513]) {
			expect(scale.getValueForPixel(scale.getPixelForValue(v))).toBeCloseTo(v, 6);
		}
	});

	it('returns NaN for missing values', () => {
		const scale = makeScale(0, 10);
		expect(scale.getPixelForValue(null)).toBeNaN();
		expect(scale.getPixelForValue(undefined)).toBeNaN();
	});

	it('formats ticks with grouping', () => {
		const scale = makeScale(0, 1513);
		const callback = (SymlogScale.defaults as any).ticks.callback;
		expect(callback.call(scale, 1000)).toBe(new Intl.NumberFormat().format(1000));
		expect(callback.call(scale, 0)).toBe('0');
	});
});
