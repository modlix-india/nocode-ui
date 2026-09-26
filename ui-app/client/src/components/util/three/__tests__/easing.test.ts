import {
	DEFAULT_EASING,
	EASINGS,
	EASING_NAMES,
	OVERSHOOTING_EASINGS,
	ease,
	easingFor,
} from '../easing';

describe('easing set', () => {
	it.each(EASING_NAMES)('%s is anchored at both ends', name => {
		// A track that does not finish exactly on its keyframe value leaves the
		// object a hair off its mark, which reads as a rendering bug.
		expect(EASINGS[name](0)).toBeCloseTo(0, 5);
		expect(EASINGS[name](1)).toBeCloseTo(1, 5);
	});

	it.each(EASING_NAMES)('%s produces a finite number across the range', name => {
		for (let t = 0; t <= 1.0001; t += 0.05) {
			expect(Number.isFinite(EASINGS[name](t))).toBe(true);
		}
	});

	it('keeps non-overshooting easings inside 0..1', () => {
		for (const name of EASING_NAMES) {
			if (OVERSHOOTING_EASINGS.has(name)) continue;
			for (let t = 0; t <= 1.0001; t += 0.05) {
				const v = EASINGS[name](t);
				expect(v).toBeGreaterThanOrEqual(-1e-6);
				expect(v).toBeLessThanOrEqual(1 + 1e-6);
			}
		}
	});

	it('marks exactly the easings that actually leave the range', () => {
		for (const name of EASING_NAMES) {
			let escaped = false;
			for (let t = 0; t <= 1.0001; t += 0.01) {
				const v = EASINGS[name](t);
				if (v < -1e-6 || v > 1 + 1e-6) escaped = true;
			}
			expect(escaped).toBe(OVERSHOOTING_EASINGS.has(name));
		}
	});

	it('is monotonic where it claims to be', () => {
		for (const name of EASING_NAMES) {
			if (OVERSHOOTING_EASINGS.has(name)) continue;
			let prev = -Infinity;
			for (let t = 0; t <= 1.0001; t += 0.02) {
				const v = EASINGS[name](t);
				expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
				prev = v;
			}
		}
	});
});

describe('easingFor', () => {
	it('falls back instead of throwing on a name from a hand-edited document', () => {
		expect(easingFor('noSuchEasing')).toBe(EASINGS[DEFAULT_EASING]);
		expect(easingFor(undefined)).toBe(EASINGS[DEFAULT_EASING]);
		expect(easingFor('')).toBe(EASINGS[DEFAULT_EASING]);
	});

	it('resolves a real name', () => {
		expect(easingFor('linear')).toBe(EASINGS.linear);
	});
});

describe('ease', () => {
	it('interpolates between the endpoints', () => {
		expect(ease(0, 100, 0, 'linear')).toBe(0);
		expect(ease(0, 100, 0.25, 'linear')).toBeCloseTo(25);
		expect(ease(0, 100, 1, 'linear')).toBe(100);
	});

	it('handles a descending range', () => {
		expect(ease(100, 0, 0.25, 'linear')).toBeCloseTo(75);
	});

	it('clamps t so a progress signal past its range cannot run the value away', () => {
		expect(ease(0, 100, 5, 'linear')).toBe(100);
		expect(ease(0, 100, -5, 'linear')).toBe(0);
	});
});
