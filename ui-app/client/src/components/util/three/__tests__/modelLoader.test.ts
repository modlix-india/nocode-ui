import { fitTransform } from '../modelLoader';

const v = (x: number, y: number, z: number) => ({ x, y, z });
const ORIGIN = v(0, 0, 0);

/**
 * glTF carries no agreed unit. The same chair arrives 0.9 units tall from one
 * exporter and 900 from another, and a camera framed for one shows a speck or
 * an interior wall for the other. Without this normalisation a builder who
 * drops in a model sees an empty canvas with nothing to tell them why.
 *
 * three itself is not imported: it is ESM and this project's Jest transform
 * handles only TypeScript, so importing it fails before any test runs. What is
 * tested here is the decision, which is the part that is ours.
 */
describe('fitTransform', () => {
	it('scales a tiny model up to the target size', () => {
		const { scale } = fitTransform(v(0.002, 0.001, 0.001), ORIGIN, 2);
		expect(0.002 * scale).toBeCloseTo(2, 6);
	});

	it('scales a huge model down to the target size', () => {
		const { scale } = fitTransform(v(900, 400, 400), ORIGIN, 2);
		expect(900 * scale).toBeCloseTo(2, 6);
	});

	it('fits the LARGEST axis, so nothing is ever cropped', () => {
		// Fitting the average, or whichever axis came first, would leave a long
		// thin model running off both sides of the frame.
		const { scale } = fitTransform(v(1, 1, 10), ORIGIN, 2);
		expect(10 * scale).toBeCloseTo(2, 6);
		expect(1 * scale).toBeLessThan(2);
	});

	it('finds the largest axis wherever it sits', () => {
		for (const size of [v(9, 1, 1), v(1, 9, 1), v(1, 1, 9)]) {
			expect(fitTransform(size, ORIGIN, 3).scale).toBeCloseTo(3 / 9, 6);
		}
	});

	it('passes the centre through, so an off-origin model can be recentred', () => {
		const { center } = fitTransform(v(2, 2, 2), v(50, -10, 3), 2);
		expect(center).toEqual([50, -10, 3]);
	});

	it('leaves a degenerate model alone instead of scaling by infinity', () => {
		// An empty group, or a file containing only lights, has a zero-sized
		// box. targetSize/0 is Infinity, and one Infinity in a matrix takes the
		// whole scene down rather than just this object.
		const { scale, center } = fitTransform(ORIGIN, v(4, 4, 4), 2);
		expect(scale).toBe(1);
		expect(Number.isFinite(scale)).toBe(true);
		// The centre is dropped too: recentring by a measured centre that came
		// from an empty box would move a later-arriving child off screen.
		expect(center).toEqual([0, 0, 0]);
	});

	it('survives a NaN or Infinite bound rather than poisoning the matrix', () => {
		// A malformed file can produce these, and they propagate silently
		// through every matrix multiply that follows.
		expect(fitTransform(v(NaN, 1, 1), ORIGIN).scale).toBe(1);
		expect(fitTransform(v(Infinity, 1, 1), ORIGIN).scale).toBe(1);
	});

	it('honours a non-default target size', () => {
		expect(4 * fitTransform(v(4, 1, 1), ORIGIN, 8).scale).toBeCloseTo(8, 6);
	});

	it('defaults to a target of 2, which is what the camera presets assume', () => {
		expect(fitTransform(v(4, 1, 1), ORIGIN).scale).toBeCloseTo(0.5, 6);
	});
});
