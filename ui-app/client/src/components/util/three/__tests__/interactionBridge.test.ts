import { createSceneDocument } from '../sceneDocument';
import {
	easeToward,
	hitEventArgs,
	isInside,
	matchInteractions,
	needsClickRaycast,
	needsHoverRaycast,
	resolveSceneObjectId,
	toNDC,
	toPageNDC,
} from '../interactionBridge';

const rect = { left: 0, top: 0, width: 800, height: 600 };

describe('toNDC', () => {
	it('puts the centre at the origin', () => {
		expect(toNDC({ clientX: 400, clientY: 300 }, rect)).toEqual({ x: 0, y: 0 });
	});

	it('flips Y, because WebGL counts up and the DOM counts down', () => {
		// Top of the canvas is +1 in NDC even though it is y=0 in the DOM.
		// Without the flip every pick is mirrored about the horizontal centre.
		expect(toNDC({ clientX: 400, clientY: 0 }, rect).y).toBe(1);
		expect(toNDC({ clientX: 400, clientY: 600 }, rect).y).toBe(-1);
	});

	it('maps the horizontal axis without flipping it', () => {
		expect(toNDC({ clientX: 0, clientY: 300 }, rect).x).toBe(-1);
		expect(toNDC({ clientX: 800, clientY: 300 }, rect).x).toBe(1);
	});

	it('accounts for a canvas that is not at the page origin', () => {
		const offset = { left: 100, top: 50, width: 800, height: 600 };
		expect(toNDC({ clientX: 500, clientY: 350 }, offset)).toEqual({ x: 0, y: 0 });
	});

	it('does not divide by zero on a collapsed canvas', () => {
		expect(
			toNDC({ clientX: 10, clientY: 10 }, { left: 0, top: 0, width: 0, height: 0 }),
		).toEqual({ x: 0, y: 0 });
	});
});

describe('toPageNDC', () => {
	// A 400x300 canvas centred at (720, 250) in a 1440x900 window.
	const canvas = { left: 520, top: 100, width: 400, height: 300 };
	const viewport = { width: 1440, height: 900 };

	it('is zero at the canvas centre', () => {
		expect(toPageNDC({ clientX: 720, clientY: 250 }, canvas, viewport)).toEqual({ x: 0, y: 0 });
	});

	it('measures in half-viewports, so leaving the canvas does not saturate it', () => {
		// 200px right of centre is the canvas edge: toNDC would say 1, this says 200/720.
		const p = toPageNDC({ clientX: 920, clientY: 250 }, canvas, viewport);
		expect(p.x).toBeCloseTo(200 / 720);
	});

	it('flips Y like toNDC, and clamps far pointers to -1..1', () => {
		expect(toPageNDC({ clientX: 720, clientY: 0 }, canvas, viewport).y).toBeCloseTo(250 / 450);
		const far = toPageNDC({ clientX: 0, clientY: 900 }, canvas, viewport);
		expect(far.x).toBeCloseTo(-1);
		expect(far.y).toBeCloseTo(-1);
	});

	it('does not divide by zero on a collapsed viewport', () => {
		expect(toPageNDC({ clientX: 10, clientY: 10 }, canvas, { width: 0, height: 0 })).toEqual({
			x: 0,
			y: 0,
		});
	});
});

describe('easeToward', () => {
	it('moves part of the way, and does not overshoot', () => {
		const p = easeToward({ x: 0, y: 0 }, { x: 1, y: -1 }, 0.1, 4);
		expect(p.x).toBeGreaterThan(0);
		expect(p.x).toBeLessThan(1);
		expect(p.y).toBeCloseTo(-p.x);
	});

	it('is framerate independent: two half steps equal one whole step', () => {
		const once = easeToward({ x: 0, y: 0 }, { x: 1, y: 0 }, 0.2, 4);
		const twice = easeToward(
			easeToward({ x: 0, y: 0 }, { x: 1, y: 0 }, 0.1, 4),
			{ x: 1, y: 0 },
			0.1,
			4,
		);
		expect(twice.x).toBeCloseTo(once.x, 10);
	});

	it('ignores a negative delta rather than moving away', () => {
		expect(easeToward({ x: 0.5, y: 0 }, { x: 1, y: 0 }, -1, 4).x).toBe(0.5);
	});
});

describe('isInside', () => {
	it('accepts a point on the canvas and rejects one outside it', () => {
		expect(isInside({ clientX: 400, clientY: 300 }, rect)).toBe(true);
		expect(isInside({ clientX: -5, clientY: 300 }, rect)).toBe(false);
		expect(isInside({ clientX: 400, clientY: 900 }, rect)).toBe(false);
	});
});

describe('resolveSceneObjectId', () => {
	it('walks up from a deep glTF child to the node the author named', () => {
		// A model hit lands on a sub-mesh. Reporting that would give the page
		// an id it has never heard of.
		const root = { userData: { sceneObjectId: 'hero' }, parent: null };
		const mid = { userData: {}, parent: root };
		const leaf = { userData: {}, parent: mid };
		expect(resolveSceneObjectId(leaf)).toBe('hero');
	});

	it('returns the id on the hit itself when it carries one', () => {
		expect(resolveSceneObjectId({ userData: { sceneObjectId: 'a' }, parent: null })).toBe('a');
	});

	it('returns undefined rather than throwing when nothing is named', () => {
		expect(resolveSceneObjectId({ userData: {}, parent: null })).toBeUndefined();
		expect(resolveSceneObjectId(null)).toBeUndefined();
	});
});

describe('matchInteractions', () => {
	const doc = createSceneDocument({
		lights: [{ type: 'ambient' }],
		objects: [{ id: 'a' }, { id: 'b' }],
		interactions: [
			{ on: 'click', targetId: 'a', event: 'evA' },
			{ on: 'click', targetId: '', event: 'evAnywhere' },
			{ on: 'hover', targetId: 'b', event: 'evHoverB' },
			{ on: 'click', targetId: 'a', event: '' },
		],
	} as any);

	it('matches an object-targeted interaction', () => {
		const got = matchInteractions(doc, 'click', 'a').map(i => i.event);
		expect(got).toContain('evA');
	});

	it('an empty targetId means anywhere on the canvas', () => {
		// This is how a background shader gets a click handler with no objects.
		expect(matchInteractions(doc, 'click', undefined).map(i => i.event)).toEqual([
			'evAnywhere',
		]);
	});

	it("does not fire another object's handler", () => {
		expect(matchInteractions(doc, 'click', 'b').map(i => i.event)).toEqual(['evAnywhere']);
	});

	it('ignores a different gesture', () => {
		expect(matchInteractions(doc, 'hover', 'a')).toEqual([]);
	});

	it('skips an interaction with no event function wired', () => {
		expect(matchInteractions(doc, 'click', 'a').every(i => !!i.event)).toBe(true);
	});
});

describe('raycast gating', () => {
	const base = { lights: [{ type: 'ambient' }], objects: [{ id: 'a' }] };

	it('does not raycast on hover when nothing listens for hover', () => {
		// Raycasting every pointermove is the easy way to drop a page to 30fps.
		const doc = createSceneDocument({
			...base,
			interactions: [{ on: 'click', targetId: 'a', event: 'e' }],
		} as any);
		expect(needsHoverRaycast(doc)).toBe(false);
	});

	it('raycasts on hover when something listens', () => {
		const doc = createSceneDocument({
			...base,
			interactions: [{ on: 'hover', targetId: 'a', event: 'e' }],
		} as any);
		expect(needsHoverRaycast(doc)).toBe(true);
	});

	it('does not raycast a click that targets the whole canvas', () => {
		const doc = createSceneDocument({
			...base,
			interactions: [{ on: 'click', targetId: '', event: 'e' }],
		} as any);
		expect(needsClickRaycast(doc)).toBe(false);
	});
});

describe('hitEventArgs', () => {
	const doc = createSceneDocument({
		lights: [{ type: 'ambient' }],
		objects: [{ id: 'hero', name: 'Hero Mesh' }],
	} as any);

	it('binds the id and name a KIRun function can branch on', () => {
		const args = hitEventArgs(doc, 'hero', { point: { x: 1, y: 2, z: 3 }, distance: 9 });
		expect(args).toEqual({
			objectId: 'hero',
			objectName: 'Hero Mesh',
			point: { x: 1, y: 2, z: 3 },
			distance: 9,
		});
	});

	it('reports nulls rather than undefined fields when there is no hit geometry', () => {
		expect(hitEventArgs(doc, 'hero')).toEqual({
			objectId: 'hero',
			objectName: 'Hero Mesh',
			point: null,
			distance: null,
		});
	});

	it('does not invent a name for an id the document has lost', () => {
		expect(hitEventArgs(doc, 'ghost').objectName).toBe('');
	});
});
