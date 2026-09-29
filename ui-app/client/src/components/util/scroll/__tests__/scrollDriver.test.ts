import { clamp01, remap, scrollProgress, viewProgress } from '../scrollDriver';

describe('clamp01', () => {
	it('passes through the unit interval and clamps outside it', () => {
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(-3)).toBe(0);
		expect(clamp01(4)).toBe(1);
	});
});

describe('remap', () => {
	it('rescales a sub-range onto 0..1', () => {
		expect(remap(0.0, 0.2, 0.6)).toBe(0);
		expect(remap(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
		expect(remap(0.6, 0.2, 0.6)).toBe(1);
		expect(remap(0.9, 0.2, 0.6)).toBe(1);
	});

	it('degrades a zero-width range to a step instead of dividing by zero', () => {
		expect(remap(0.4, 0.5, 0.5)).toBe(0);
		expect(remap(0.5, 0.5, 0.5)).toBe(1);
	});

	it('treats an inverted range as zero-width rather than running backwards', () => {
		expect(remap(0.1, 0.8, 0.2)).toBe(0);
		expect(remap(0.9, 0.8, 0.2)).toBe(1);
	});
});

describe('scrollProgress', () => {
	it('measures position through the scrollable extent', () => {
		const m = { scrollSize: 2000, clientSize: 1000 };
		expect(scrollProgress({ ...m, scrollPos: 0 })).toBe(0);
		expect(scrollProgress({ ...m, scrollPos: 500 })).toBe(0.5);
		expect(scrollProgress({ ...m, scrollPos: 1000 })).toBe(1);
	});

	it('reports content that fits as fully through, not as zero', () => {
		// A container with nothing to scroll has completed its scroll. Zero
		// would leave anything driven by it pinned at its start state forever.
		expect(scrollProgress({ scrollPos: 0, scrollSize: 500, clientSize: 800 })).toBe(1);
		expect(scrollProgress({ scrollPos: 0, scrollSize: 800, clientSize: 800 })).toBe(1);
	});

	it('clamps overscroll rather than exceeding 1', () => {
		expect(scrollProgress({ scrollPos: 5000, scrollSize: 2000, clientSize: 1000 })).toBe(1);
		expect(scrollProgress({ scrollPos: -50, scrollSize: 2000, clientSize: 1000 })).toBe(0);
	});
});

describe('viewProgress', () => {
	const viewportSize = 800;

	it('reads 0 the moment before the target begins to enter', () => {
		expect(viewProgress({ targetStart: 800, targetSize: 200, viewportSize })).toBe(0);
	});

	it('reads 1 the moment after the target has completely left', () => {
		expect(viewProgress({ targetStart: -200, targetSize: 200, viewportSize })).toBe(1);
	});

	it('counts travel as viewport PLUS target, not viewport alone', () => {
		// Getting this wrong is what makes a reveal finish early. With a 200px
		// target the full sweep is 1000px, so the midpoint is at targetStart 300.
		expect(viewProgress({ targetStart: 300, targetSize: 200, viewportSize })).toBeCloseTo(0.5);
	});

	it('handles a target taller than the viewport', () => {
		// A 2000px section in an 800px viewport sweeps 2800px.
		const m = { targetSize: 2000, viewportSize };
		expect(viewProgress({ ...m, targetStart: 800 })).toBe(0);
		expect(viewProgress({ ...m, targetStart: -2000 })).toBe(1);
		expect(viewProgress({ ...m, targetStart: -600 })).toBeCloseTo(0.5);
	});

	it('clamps rather than reporting out of range while far off-screen', () => {
		expect(viewProgress({ targetStart: 9000, targetSize: 200, viewportSize })).toBe(0);
		expect(viewProgress({ targetStart: -9000, targetSize: 200, viewportSize })).toBe(1);
	});

	it('does not divide by zero on a collapsed viewport', () => {
		expect(viewProgress({ targetStart: 0, targetSize: 0, viewportSize: 0 })).toBe(0);
	});

	it('is axis agnostic: the same maths serves horizontal', () => {
		// The caller substitutes left/width for top/height; nothing here changes.
		expect(viewProgress({ targetStart: 1280, targetSize: 320, viewportSize: 1280 })).toBe(0);
		expect(viewProgress({ targetStart: -320, targetSize: 320, viewportSize: 1280 })).toBe(1);
	});
});
