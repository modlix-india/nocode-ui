import {
	SCENE_DOCUMENT_VERSION,
	createSceneDocument,
	isSceneDocumentValid,
	normalizeSceneDocument,
	resetIdSequenceForTests,
	validateSceneDocument,
	vec3,
} from '../sceneDocument';

beforeEach(() => resetIdSequenceForTests());

describe('normalizeSceneDocument: never throws', () => {
	it.each([
		['undefined', undefined],
		['null', null],
		['a number', 42],
		['a string', 'not a scene'],
		['an array', [1, 2, 3]],
		['an empty object', {}],
		['nested nonsense', { objects: 'no', lights: 7, timeline: 'later' }],
	])('survives %s', (_label, input) => {
		const doc = normalizeSceneDocument(input);
		expect(doc.version).toBe(SCENE_DOCUMENT_VERSION);
		expect(Array.isArray(doc.objects)).toBe(true);
		expect(Array.isArray(doc.lights)).toBe(true);
	});

	it('drops non-object entries in arrays instead of keeping holes', () => {
		const doc = normalizeSceneDocument({ objects: [null, 'x', { name: 'Real' }] });
		expect(doc.objects).toHaveLength(3);
		expect(doc.objects.map(o => o.name)).toEqual(['Object', 'Object', 'Real']);
	});
});

describe('vec3', () => {
	it('accepts an array', () => {
		expect(vec3([1, 2, 3], [0, 0, 0])).toEqual([1, 2, 3]);
	});

	it('accepts an {x,y,z} object, which is what hand-written JSON tends to use', () => {
		expect(vec3({ x: 1, y: 2, z: 3 }, [0, 0, 0])).toEqual([1, 2, 3]);
	});

	it('fills missing components from the fallback rather than with NaN', () => {
		expect(vec3([1], [7, 8, 9])).toEqual([1, 8, 9]);
		expect(vec3({ y: 5 }, [7, 8, 9])).toEqual([7, 5, 9]);
	});

	it('parses numeric strings, since JSON from a form carries them', () => {
		expect(vec3(['1.5', '2', '3'], [0, 0, 0])).toEqual([1.5, 2, 3]);
	});

	it('rejects a non-finite value instead of propagating NaN into the scene', () => {
		expect(vec3([NaN, Infinity, 3], [0, 0, 0])).toEqual([0, 0, 3]);
	});

	it('does not alias the fallback array between calls', () => {
		const fallback: [number, number, number] = [0, 0, 0];
		const a = vec3(undefined, fallback);
		a[0] = 99;
		expect(vec3(undefined, fallback)).toEqual([0, 0, 0]);
	});
});

describe('normalizeSceneDocument: coercion', () => {
	it('clamps values into their legal range rather than passing them to three', () => {
		const doc = normalizeSceneDocument({
			renderer: { dprCap: 99, exposure: -5 },
			camera: { fov: 400, near: 0 },
			lights: [{ intensity: -3 }],
		});
		expect(doc.renderer.dprCap).toBe(4);
		expect(doc.renderer.exposure).toBe(0);
		expect(doc.camera.fov).toBe(179);
		expect(doc.camera.near).toBeGreaterThan(0);
		expect(doc.lights[0].intensity).toBe(0);
	});

	it('falls back on an unknown enum value instead of passing it through', () => {
		const doc = normalizeSceneDocument({
			lights: [{ type: 'laser' }],
			objects: [{ source: { kind: 'voxel', shape: 'dodecahedron' } }],
			timeline: { driver: 'gravity' },
			interactions: [{ on: 'longpress', event: 'e' }],
		});
		expect(doc.lights[0].type).toBe('directional');
		expect(doc.objects[0].source.kind).toBe('primitive');
		expect(doc.objects[0].source.shape).toBe('box');
		expect(doc.timeline.driver).toBe('time');
		expect(doc.interactions[0].on).toBe('click');
	});

	it('turns on transparency when opacity implies it', () => {
		// Opacity below 1 with transparent false renders fully opaque, which
		// reads as the opacity setting having been ignored.
		const doc = normalizeSceneDocument({ objects: [{ material: { opacity: 0.4 } }] });
		expect(doc.objects[0].material.transparent).toBe(true);
	});

	it('respects an explicit transparent:false even with low opacity', () => {
		const doc = normalizeSceneDocument({
			objects: [{ material: { opacity: 0.4, transparent: false } }],
		});
		expect(doc.objects[0].material.transparent).toBe(false);
	});

	it('generates ids so tracks and interactions have something to address', () => {
		const doc = normalizeSceneDocument({ objects: [{}, {}], shaders: [{}] });
		const ids = doc.objects.map(o => o.id);
		expect(ids.every(Boolean)).toBe(true);
		expect(new Set(ids).size).toBe(2);
		expect(doc.shaders[0].id).toBeTruthy();
	});

	it('preserves ids that were given', () => {
		const doc = normalizeSceneDocument({ objects: [{ id: 'hero' }] });
		expect(doc.objects[0].id).toBe('hero');
	});

	it('sorts timeline keys, because out-of-order keys interpolate backwards', () => {
		const doc = normalizeSceneDocument({
			timeline: {
				tracks: [
					{
						target: 'objects.a.rotation.y',
						keys: [
							{ t: 1, v: 10 },
							{ t: 0, v: 0 },
							{ t: 0.5, v: 5 },
						],
					},
				],
			},
		});
		expect(doc.timeline.tracks[0].keys.map(k => k.t)).toEqual([0, 0.5, 1]);
	});
});

describe('validateSceneDocument', () => {
	const lit = { lights: [{ type: 'ambient' }] };

	it('accepts a minimal well-formed scene', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a', source: { kind: 'primitive' } }],
		} as any);
		expect(validateSceneDocument(doc)).toEqual([]);
		expect(isSceneDocumentValid(doc)).toBe(true);
	});

	it('reports an empty scene', () => {
		expect(validateSceneDocument(createSceneDocument()).join(' ')).toMatch(/no objects/i);
	});

	it('catches the black-render case: geometry with nothing lighting it', () => {
		const doc = createSceneDocument({
			environment: { preset: '' },
			lights: [],
			objects: [{ id: 'a', source: { kind: 'primitive' } }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/lights this scene/i);
	});

	it('does not demand light for points or shader-driven objects', () => {
		const doc = createSceneDocument({
			environment: { preset: '' },
			lights: [],
			objects: [{ id: 'p', source: { kind: 'points' } }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).not.toMatch(/lights this scene/i);
	});

	it('catches a gltf object with no url', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a', name: 'Hero', source: { kind: 'gltf' } }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/gltf source with no url/i);
	});

	it('catches duplicate object ids, which silently orphan the second', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'dup' }, { id: 'dup' }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/share the id 'dup'/);
	});

	it('catches a dangling shader reference', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a', name: 'Hero', material: { shaderId: 'ghost' } }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/shader 'ghost'/);
	});

	it('catches a shader with no entry point', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			shaders: [{ id: 's', fragment: 'gl_FragColor = vec4(1.0);' }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/void main/i);
	});

	it('catches an empty fragment shader before it renders black', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			shaders: [{ id: 's', fragment: '  ' }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/no fragment source/i);
	});

	it('catches a track pointing at an object that does not exist', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			timeline: {
				tracks: [
					{
						target: 'objects.ghost.rotation.y',
						keys: [
							{ t: 0, v: 0 },
							{ t: 1, v: 1 },
						],
					},
				],
			},
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/object 'ghost'/);
	});

	it('catches a track with a single key, which cannot animate', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			timeline: { tracks: [{ target: 'objects.a.rotation.y', keys: [{ t: 0, v: 0 }] }] },
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/at least two keys/i);
	});

	it('catches an interaction with no event function', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			interactions: [{ on: 'click', targetId: 'a' }],
		} as any);
		expect(validateSceneDocument(doc).join(' ')).toMatch(/names no event/i);
	});

	it('allows an interaction with no targetId, meaning anywhere on the canvas', () => {
		const doc = createSceneDocument({
			...lit,
			objects: [{ id: 'a' }],
			interactions: [{ on: 'click', event: 'ev1' }],
		} as any);
		expect(validateSceneDocument(doc)).toEqual([]);
	});
});

describe('round trip', () => {
	it('is stable: normalising twice changes nothing', () => {
		const once = createSceneDocument({
			lights: [{ type: 'ambient' }],
			objects: [{ id: 'a', source: { kind: 'primitive', shape: 'sphere' } }],
			timeline: {
				tracks: [
					{
						target: 'objects.a.rotation.y',
						keys: [
							{ t: 0, v: 0 },
							{ t: 1, v: 6.28 },
						],
					},
				],
			},
		} as any);
		expect(normalizeSceneDocument(JSON.parse(JSON.stringify(once)))).toEqual(once);
	});
});
