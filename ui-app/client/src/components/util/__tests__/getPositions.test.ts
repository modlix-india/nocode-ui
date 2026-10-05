import getPositions from '../getPositions';

const rect = (x: number, y: number, width: number, height: number) =>
	({ x, y, width, height, left: x, top: y, right: x + width, bottom: y + height }) as DOMRect;

function setViewport(width: number, height: number) {
	Object.defineProperty(document.documentElement, 'clientWidth', {
		configurable: true,
		value: width,
	});
	Object.defineProperty(document.documentElement, 'clientHeight', {
		configurable: true,
		value: height,
	});
}

describe('getPositions horizontal clamp', () => {
	// leadzump's notification bell on a 375px phone: a 362px panel anchored bottom-end to a
	// trigger whose right edge is at 324 started at x = -50.
	it('slides an end-anchored panel back inside the left edge', () => {
		setViewport(375, 812);
		const { coords, tipStyle } = getPositions(
			'bottom-end' as any,
			rect(298, 14, 26, 26),
			rect(0, 0, 362, 500),
		)!;
		const right = (coords as any).right;
		expect(375 - right - 362).toBe(8);
		// The tip moves left by as much as the panel moved right, so it still sits under the bell.
		const unclampedTip = 13 + (362 - 26);
		expect(tipStyle).toEqual({ left: `${unclampedTip - (51 - 5)}px` });
	});

	it('leaves an end-anchored panel that already fits where it was', () => {
		setViewport(1440, 900);
		const { coords, tipStyle } = getPositions(
			'bottom-end' as any,
			rect(1300, 14, 26, 26),
			rect(0, 0, 362, 500),
		)!;
		expect(coords).toEqual({ top: 40, right: 1440 - 1300 - 26 });
		expect(tipStyle).toEqual({ left: `${13 + (362 - 26)}px` });
	});

	it('keeps a start-anchored panel off the right edge', () => {
		setViewport(375, 812);
		const { coords } = getPositions(
			'bottom-start' as any,
			rect(200, 14, 26, 26),
			rect(0, 0, 300, 200),
		)!;
		expect((coords as any).left).toBe(375 - 300 - 8);
	});

	it('keeps a centred panel off the left edge and shifts its tip', () => {
		setViewport(375, 812);
		const { coords, tipStyle } = getPositions(
			'bottom' as any,
			rect(10, 14, 20, 20),
			rect(0, 0, 200, 100),
		)!;
		expect((coords as any).left).toBe(8);
		expect(tipStyle).toEqual({ left: `calc(50% - ${8 - (20 - 100)}px)` });
	});
});
