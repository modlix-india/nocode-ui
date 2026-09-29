import { parseTrackTarget, sampleTrack } from '../sceneRuntime';
import type { TimelineTrack } from '../sceneDocument';

const track = (keys: Array<{ t: number; v: number }>, ease = 'linear'): TimelineTrack =>
	({ target: 'objects.a.rotation.y', keys, ease }) as TimelineTrack;

describe('parseTrackTarget', () => {
	it('splits an object path', () => {
		expect(parseTrackTarget('objects.hero.rotation.y')).toEqual({
			root: 'objects',
			id: 'hero',
			path: ['rotation', 'y'],
		});
	});

	it('splits a shader uniform path', () => {
		expect(parseTrackTarget('shaders.aurora.uSpeed')).toEqual({
			root: 'shaders',
			id: 'aurora',
			path: ['uSpeed'],
		});
	});

	it('treats camera as having no id, since there is only one', () => {
		expect(parseTrackTarget('camera.position.z')).toEqual({
			root: 'camera',
			id: '',
			path: ['position', 'z'],
		});
	});

	it('rejects a path it cannot address rather than guessing', () => {
		expect(parseTrackTarget('')).toBeNull();
		expect(parseTrackTarget('objects')).toBeNull();
		expect(parseTrackTarget('lights.a.intensity')).toBeNull();
		expect(parseTrackTarget('nonsense')).toBeNull();
	});

	it('tolerates stray dots from a hand-written document', () => {
		expect(parseTrackTarget('objects..hero.rotation')).toEqual({
			root: 'objects',
			id: 'hero',
			path: ['rotation'],
		});
	});
});

describe('sampleTrack', () => {
	const two = track([
		{ t: 0, v: 0 },
		{ t: 1, v: 100 },
	]);

	it('interpolates linearly between two keys', () => {
		expect(sampleTrack(two, 0)).toBe(0);
		expect(sampleTrack(two, 0.5)).toBeCloseTo(50);
		expect(sampleTrack(two, 1)).toBe(100);
	});

	it('holds at the endpoints rather than extrapolating past them', () => {
		// Progress can exceed the range when a scroll driver overshoots; running
		// the value on would fling the object off screen.
		expect(sampleTrack(two, -5)).toBe(0);
		expect(sampleTrack(two, 5)).toBe(100);
	});

	it('picks the right segment with more than two keys', () => {
		const t = track([
			{ t: 0, v: 0 },
			{ t: 0.5, v: 10 },
			{ t: 1, v: 20 },
		]);
		expect(sampleTrack(t, 0.25)).toBeCloseTo(5);
		expect(sampleTrack(t, 0.5)).toBeCloseTo(10);
		expect(sampleTrack(t, 0.75)).toBeCloseTo(15);
	});

	it('holds before the first key and after the last when they are inset', () => {
		const t = track([
			{ t: 0.3, v: 7 },
			{ t: 0.7, v: 9 },
		]);
		expect(sampleTrack(t, 0)).toBe(7);
		expect(sampleTrack(t, 0.1)).toBe(7);
		expect(sampleTrack(t, 0.9)).toBe(9);
		expect(sampleTrack(t, 1)).toBe(9);
	});

	it('applies the easing curve', () => {
		const eased = track(
			[
				{ t: 0, v: 0 },
				{ t: 1, v: 100 },
			],
			'easeInQuad',
		);
		// t^2 at the midpoint is 0.25, not 0.5.
		expect(sampleTrack(eased, 0.5)).toBeCloseTo(25);
	});

	it('returns null for an empty track instead of NaN', () => {
		expect(sampleTrack(track([]), 0.5)).toBeNull();
	});

	it('returns the constant for a single-key track', () => {
		expect(sampleTrack(track([{ t: 0.4, v: 42 }]), 0.9)).toBe(42);
	});

	it('does not divide by zero on two keys at the same position', () => {
		const t = track([
			{ t: 0.5, v: 1 },
			{ t: 0.5, v: 2 },
		]);
		expect(Number.isFinite(sampleTrack(t, 0.5) as number)).toBe(true);
	});

	it('handles a descending track', () => {
		const t = track([
			{ t: 0, v: 100 },
			{ t: 1, v: 0 },
		]);
		expect(sampleTrack(t, 0.25)).toBeCloseTo(75);
	});
});
