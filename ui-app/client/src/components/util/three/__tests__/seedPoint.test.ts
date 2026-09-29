import { seedPoint } from '../sceneRuntime';

/** Deterministic RNG, so a statistical assertion cannot flake. */
function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function sample(distribution: string, n = 20000) {
	const rnd = mulberry32(12345);
	const out: [number, number, number] = [0, 0, 0];
	const pts: Array<[number, number, number]> = [];
	for (let i = 0; i < n; i++) {
		seedPoint(distribution, rnd, out);
		pts.push([out[0], out[1], out[2]]);
	}
	return pts;
}

const radius = (p: number[]) => Math.hypot(p[0], p[1], p[2]);
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe('seedPoint: containment', () => {
	it('keeps sphere points inside the unit sphere', () => {
		const rs = sample('sphere').map(radius);
		expect(Math.max(...rs)).toBeLessThanOrEqual(1.0001);
	});

	it('puts shell points ON the unit sphere, not inside it', () => {
		const rs = sample('shell').map(radius);
		expect(Math.min(...rs)).toBeGreaterThan(0.999);
		expect(Math.max(...rs)).toBeLessThan(1.001);
	});

	it('keeps box points inside the unit cube', () => {
		for (const p of sample('box')) {
			for (const c of p) {
				expect(Math.abs(c)).toBeLessThanOrEqual(1.0001);
			}
		}
	});

	it('keeps disc points flat and within the unit circle', () => {
		for (const p of sample('disc')) {
			expect(Math.hypot(p[0], p[1])).toBeLessThanOrEqual(1.0001);
			// Given a slight thickness so the disc is not a zero-volume plane.
			expect(Math.abs(p[2])).toBeLessThan(0.05);
		}
	});

	it('falls back to the sphere on an unknown distribution rather than emitting NaN', () => {
		const pts = sample('noSuchDistribution', 200);
		expect(pts.every(p => p.every(Number.isFinite))).toBe(true);
		expect(Math.max(...pts.map(radius))).toBeLessThanOrEqual(1.0001);
	});
});

describe('seedPoint: density is actually uniform', () => {
	/**
	 * These are the assertions that catch the classic bug. Dropping the cbrt
	 * from the sphere, or the sqrt from the disc, still produces points inside
	 * the right shape, so every containment test above keeps passing while the
	 * cloud visibly bunches at the centre. Only the mean radius shows it.
	 */

	it('sphere: mean radius approaches 3/4, the volume-uniform value', () => {
		// A raw uniform radius would give 1/2 instead.
		expect(mean(sample('sphere').map(radius))).toBeCloseTo(0.75, 1);
	});

	it('disc: mean radius approaches 2/3, the area-uniform value', () => {
		// A raw uniform radius would give 1/2 instead.
		const rs = sample('disc').map(p => Math.hypot(p[0], p[1]));
		expect(mean(rs)).toBeCloseTo(0.667, 1);
	});

	it('sphere: directions are not bunched at the poles', () => {
		// acos(2v-1) is what makes this uniform. A uniform phi would push the
		// mean |z| well above half the mean radius.
		const pts = sample('sphere');
		const meanAbsZ = mean(pts.map(p => Math.abs(p[2])));
		const meanR = mean(pts.map(radius));
		expect(meanAbsZ / meanR).toBeCloseTo(0.5, 1);
	});

	it('shell: spreads over the whole sphere, not a band', () => {
		const zs = sample('shell').map(p => p[2]);
		// z of a uniform spherical shell is uniform on -1..1, so mean ~0.
		expect(mean(zs)).toBeCloseTo(0, 1);
		expect(Math.min(...zs)).toBeLessThan(-0.95);
		expect(Math.max(...zs)).toBeGreaterThan(0.95);
	});
});

describe('seedPoint: contract', () => {
	it("writes into the caller's array rather than allocating per point", () => {
		// buildPoints reuses one scratch array across up to 200k points.
		const out: [number, number, number] = [9, 9, 9];
		seedPoint('box', mulberry32(1), out);
		expect(out.some(v => v !== 9)).toBe(true);
		expect(out).toHaveLength(3);
	});
});
