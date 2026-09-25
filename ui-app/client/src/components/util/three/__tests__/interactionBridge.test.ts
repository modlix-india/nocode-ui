import { createSceneDocument } from '../sceneDocument';
import {
	hitEventArgs,
	isInside,
	matchInteractions,
	needsClickRaycast,
	needsHoverRaycast,
	resolveSceneObjectId,
	toNDC,
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
