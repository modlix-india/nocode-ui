import {
	isScrollDriven,
	rangeValue,
	REDUCED_MOTION_PROGRESS,
	scrubDelay,
	timelineValue,
	type AnimationEntry,
} from '../scrollAnimation';

const entry = (o: Partial<AnimationEntry> = {}): AnimationEntry => ({
	animationName: '_fadeInUp',
	animationDuration: 600,
	...o,
});

describe('isScrollDriven', () => {
	/**
	 * `timeline` defaulting to absent-or-'none' is the ONLY thing keeping this
	 * change safe: no page definition stored today carries the key, so every
	 * existing animation has to resolve to its current clock-driven behaviour.
	 */
	it('treats an absent timeline as clock-driven', () => {
		expect(isScrollDriven(entry())).toBe(false);
	});

	it('treats an explicit none as clock-driven', () => {
		expect(isScrollDriven(entry({ timeline: 'none' }))).toBe(false);
	});

	it.each(['view', 'scroll'])('treats %s as scroll-driven', t => {
		expect(isScrollDriven(entry({ timeline: t }))).toBe(true);
	});
});

describe('timelineValue', () => {
	it('defaults to the block axis', () => {
		expect(timelineValue(entry({ timeline: 'view' }))).toBe('view(block)');
	});

	it('supports the inline axis, which is the point of having an axis', () => {
		expect(timelineValue(entry({ timeline: 'view', axis: 'inline' }))).toBe('view(inline)');
		expect(timelineValue(entry({ timeline: 'scroll', axis: 'inline' }))).toBe(
			'scroll(nearest inline)',
		);
	});

	it('gives view() an axis but NEVER a scroller', () => {
		// view() is always measured against the element's own nearest
		// scrollport. A scroller inside it is invalid, the whole declaration is
		// dropped, and the animation silently stops being scroll-driven.
		const v = timelineValue(entry({ timeline: 'view', scroller: 'root', axis: 'block' }));
		expect(v).toBe('view(block)');
		expect(v).not.toMatch(/root|nearest|self/);
	});

	it('passes the scroller through for scroll()', () => {
		expect(timelineValue(entry({ timeline: 'scroll', scroller: 'root' }))).toBe(
			'scroll(root block)',
		);
		expect(timelineValue(entry({ timeline: 'scroll', scroller: 'self' }))).toBe(
			'scroll(self block)',
		);
	});

	it('falls back to nearest for an unknown scroller rather than emitting it', () => {
		// An unrecognised keyword would make the whole declaration invalid.
		expect(timelineValue(entry({ timeline: 'scroll', scroller: 'nonsense' }))).toBe(
			'scroll(nearest block)',
		);
	});
});

describe('rangeValue', () => {
	it('says normal for the full range, so nothing is emitted needlessly', () => {
		expect(rangeValue(entry({ rangeStart: 0, rangeEnd: 1 }))).toBe('normal');
		expect(rangeValue(entry())).toBe('normal');
	});

	it('emits plain percentages, which mean the same under scroll() and view()', () => {
		// Keyword ranges like `entry 0% cover 30%` have no JS-fallback
		// equivalent, so using them would guarantee the two paths diverge.
		expect(rangeValue(entry({ rangeStart: 0.2, rangeEnd: 0.8 }))).toBe('20% 80%');
	});

	it('clamps a range outside 0..1', () => {
		expect(rangeValue(entry({ rangeStart: -1, rangeEnd: 4 }))).toBe('normal');
		expect(rangeValue(entry({ rangeStart: 0.5, rangeEnd: 9 }))).toBe('50% 100%');
	});
});

describe('scrubDelay', () => {
	it('is NEGATIVE, because a positive delay postpones rather than seeks', () => {
		expect(scrubDelay(entry({ animationDuration: 1000 }), 0.25)).toBe('-250ms');
	});

	it('is zero at the start and the full duration at the end', () => {
		expect(scrubDelay(entry({ animationDuration: 800 }), 0)).toBe('0ms');
		expect(scrubDelay(entry({ animationDuration: 800 }), 1)).toBe('-800ms');
	});

	it('clamps progress rather than seeking past the animation', () => {
		expect(scrubDelay(entry({ animationDuration: 500 }), 3)).toBe('-500ms');
		expect(scrubDelay(entry({ animationDuration: 500 }), -2)).toBe('0ms');
	});

	it('survives a zero duration instead of producing -0ms or NaN', () => {
		// A duration of 0 is the property's own default, so it reaches here
		// whenever an author sets a timeline before setting a duration.
		expect(scrubDelay(entry({ animationDuration: 0 }), 0.5)).toBe('-0.5ms');
		expect(scrubDelay(entry({ animationDuration: undefined }), 0.5)).toBe('-0.5ms');
	});
});

describe('reduced motion lands on the END frame', () => {
	it('is 1, not 0', () => {
		// A reveal's first frame is usually "invisible". Pinning to 0 would hide
		// the content from exactly the people who asked for less motion, which
		// is a worse outcome than the motion was.
		expect(REDUCED_MOTION_PROGRESS).toBe(1);
	});
});
