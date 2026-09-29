import { createSceneDocument, validateSceneDocument, type SceneDocument } from '../sceneDocument';
import { presetScene } from '../presets';
import {
	addInteraction,
	addKey,
	addLight,
	addObject,
	addShader,
	addTrack,
	duplicateObject,
	removeKey,
	removeLight,
	removeObject,
	removeShader,
	removeTrack,
	renameObject,
	setKey,
	trackTargets,
	undeclaredUniforms,
	updateCamera,
	updateInteraction,
	updateObject,
} from '../sceneEdits';

const base = (): SceneDocument =>
	createSceneDocument({
		objects: [
			{ id: 'hero', name: 'Hero', source: { kind: 'primitive', shape: 'box' } },
			{ id: 'prop', name: 'Prop', source: { kind: 'primitive', shape: 'sphere' } },
		],
		timeline: {
			driver: 'scroll',
			tracks: [
				{
					target: 'objects.hero.rotation.y',
					ease: 'linear',
					keys: [
						{ t: 0, v: 0 },
						{ t: 1, v: 90 },
					],
				},
				{
					target: 'objects.prop.position.y',
					ease: 'linear',
					keys: [
						{ t: 0, v: 0 },
						{ t: 1, v: 1 },
					],
				},
			],
		},
		interactions: [{ on: 'click', targetId: 'hero', event: 'doThing' }],
	} as unknown as Partial<SceneDocument>);

describe('edits never mutate the document handed in', () => {
	// The whole undo model is an array of documents. One in-place edit and
	// every earlier entry in that array silently becomes the current state,
	// so undo appears to do nothing.
	it.each([
		['addObject', (d: SceneDocument) => addObject(d).doc],
		['removeObject', (d: SceneDocument) => removeObject(d, 'hero')],
		['updateObject', (d: SceneDocument) => updateObject(d, 'hero', { name: 'X' })],
		['renameObject', (d: SceneDocument) => renameObject(d, 'hero', 'star')],
		['addLight', (d: SceneDocument) => addLight(d).doc],
		['updateCamera', (d: SceneDocument) => updateCamera(d, { fov: 10 })],
		['addTrack', (d: SceneDocument) => addTrack(d, 'camera.position.z')],
		['removeTrack', (d: SceneDocument) => removeTrack(d, 0)],
		['setKey', (d: SceneDocument) => setKey(d, 0, 0, { v: 5 })],
		['addInteraction', (d: SceneDocument) => addInteraction(d)],
	])('%s', (_name, op) => {
		const before = base();
		const snapshot = JSON.stringify(before);
		op(before);
		expect(JSON.stringify(before)).toBe(snapshot);
	});
});

describe('removeObject', () => {
	it('takes the tracks that addressed it', () => {
		// A track pointing at a deleted object makes validateSceneDocument
		// report an error about something the author can no longer select, so
		// it is not fixable from the editor.
		const next = removeObject(base(), 'hero');
		expect(next.timeline.tracks.map(t => t.target)).toEqual(['objects.prop.position.y']);
	});

	it('takes the interactions that targeted it', () => {
		expect(removeObject(base(), 'hero').interactions).toEqual([]);
	});

	it('leaves other objects and their tracks alone', () => {
		const next = removeObject(base(), 'hero');
		expect(next.objects.map(o => o.id)).toEqual(['prop']);
		// `toContain` with an asymmetric matcher does NOT do a substring check
		// on each element, it compares the matcher itself, so it passes on any
		// array. Spelled out so the assertion is real.
		expect(validateSceneDocument(next).filter(e => e.includes('hero'))).toEqual([]);
	});
});

describe('renameObject', () => {
	it('carries track targets across', () => {
		// Renaming without this leaves the timeline pointing at nothing, and
		// the only symptom is that the object quietly stops animating.
		const next = renameObject(base(), 'hero', 'star');
		expect(next.timeline.tracks[0].target).toBe('objects.star.rotation.y');
	});

	it('carries interaction targets across', () => {
		expect(renameObject(base(), 'hero', 'star').interactions[0].targetId).toBe('star');
	});

	it('refuses a name already taken, rather than merging two objects', () => {
		const next = renameObject(base(), 'hero', 'prop');
		expect(next.objects.map(o => o.id)).toEqual(['hero', 'prop']);
	});

	it('refuses an empty or whitespace name', () => {
		expect(renameObject(base(), 'hero', '   ').objects[0].id).toBe('hero');
	});
});

describe('addObject', () => {
	it('never collides with an id already in the document', () => {
		let doc = createSceneDocument();
		const ids: string[] = [];
		for (let i = 0; i < 5; i++) {
			const r = addObject(doc, 'primitive', 'box');
			doc = r.doc;
			ids.push(r.id);
		}
		expect(new Set(ids).size).toBe(5);
		expect(doc.objects.length).toBe(5);
	});

	it('produces a document that still validates', () => {
		const { doc } = addObject(createSceneDocument(), 'primitive', 'sphere');
		// A lightless scene is a legitimate warning; the point is the object
		// itself does not introduce an error.
		expect(validateSceneDocument(doc).filter(e => e.includes('sphere'))).toEqual([]);
	});
});

describe('keys stay ordered', () => {
	it('re-sorts after a key is dragged past its neighbour', () => {
		// sampleTrack walks keys in order and assumes they ascend. Out of order
		// they interpolate backwards over part of the range, which reads as the
		// easing being wrong rather than the keys being wrong.
		const next = setKey(base(), 0, 0, { t: 0.9 });
		expect(next.timeline.tracks[0].keys.map(k => k.t)).toEqual([0.9, 1]);
	});

	it('clamps a key time into 0..1', () => {
		expect(setKey(base(), 0, 0, { t: -3 }).timeline.tracks[0].keys[0].t).toBe(0);
		expect(setKey(base(), 0, 1, { t: 7 }).timeline.tracks[0].keys[1].t).toBe(1);
	});

	it('inserts an added key in order', () => {
		const next = addKey(base(), 0, 0.5, 45);
		expect(next.timeline.tracks[0].keys.map(k => k.t)).toEqual([0, 0.5, 1]);
	});

	it('will not take a track below two keys', () => {
		// One key is a constant: a track that does nothing while still
		// appearing in the panel as though it does.
		const next = removeKey(base(), 0, 0);
		expect(next.timeline.tracks[0].keys.length).toBe(2);
	});
});

describe('addTrack', () => {
	it('refuses a duplicate target rather than animating one thing twice', () => {
		const next = addTrack(base(), 'objects.hero.rotation.y');
		expect(next.timeline.tracks.length).toBe(2);
	});

	it('refuses an empty target', () => {
		expect(addTrack(base(), '').timeline.tracks.length).toBe(2);
	});
});

describe('trackTargets', () => {
	it('offers only targets parseTrackTarget can actually address', () => {
		// A mistyped target is dropped in silence: the track stays in the
		// document, shows in the panel, and animates nothing.
		for (const t of trackTargets(base())) {
			expect(t.value).toMatch(/^(objects\.[^.]+|camera|shaders\.[^.]+)\./);
		}
	});

	it('covers every object in the document', () => {
		const values = trackTargets(base()).map(t => t.value);
		expect(values).toContain('objects.hero.rotation.y');
		expect(values).toContain('objects.prop.scale.z');
		expect(values).toContain('camera.position.z');
	});

	it('offers a shader preset its numeric uniforms and not its colours', () => {
		const values = trackTargets(presetScene('waves')).map(t => t.value);
		expect(values.some(v => v.endsWith('uSpeed'))).toBe(true);
		// A colour is three numbers; a track writes one, so it cannot drive it.
		expect(values.some(v => v.endsWith('uColorA'))).toBe(false);
	});
});

describe('undeclaredUniforms', () => {
	const shader = (fragment: string) => ({ id: 's', fragment, vertex: '', uniforms: [] }) as any;

	it('finds a uniform the source declares but the document does not carry', () => {
		expect(undeclaredUniforms(shader('uniform float uWobble;\nvoid main(){}'))).toEqual([
			'uWobble',
		]);
	});

	it('ignores the uniforms the runtime binds for every shader', () => {
		// Adding a document uniform named uTime would shadow the live one with
		// a frozen value, so offering it is worse than missing it.
		const src = [
			'uniform float uTime;',
			'uniform vec2 uResolution;',
			'uniform vec2 uPointer;',
			'uniform float uPointerActive;',
			'uniform float uProgress;',
			'void main(){}',
		].join('\n');
		expect(undeclaredUniforms(shader(src))).toEqual([]);
	});

	it('does not report one the document already declares', () => {
		const s = shader('uniform float uWobble;');
		s.uniforms = [{ name: 'uWobble', type: 'float', value: 1 }];
		expect(undeclaredUniforms(s)).toEqual([]);
	});

	it('reports each name once even when both stages declare it', () => {
		const s = shader('uniform float uWobble;');
		s.vertex = 'uniform float uWobble;';
		expect(undeclaredUniforms(s)).toEqual(['uWobble']);
	});
});

describe('lights', () => {
	it('adds and removes without disturbing anything else', () => {
		const { doc, id } = addLight(base(), 'point');
		expect(doc.lights.map(l => l.id)).toContain(id);
		expect(removeLight(doc, id).lights.map(l => l.id)).not.toContain(id);
		expect(doc.objects.length).toBe(2);
	});

	it('gives an ambient light a gentler default than a directional one', () => {
		// An ambient at directional strength flattens every scene it is added
		// to, which reads as the light being broken.
		expect(addLight(base(), 'ambient').doc.lights.at(-1)!.intensity).toBeLessThan(
			addLight(base(), 'directional').doc.lights.at(-1)!.intensity,
		);
	});
});

describe('duplicateObject', () => {
	const base = () => {
		const { doc } = addObject(createSceneDocument(), 'primitive', 'sphere');
		let d = addTrack(doc, 'objects.sphere.rotation.y');
		d = addKey(d, 0, 0.5, 90);
		d = addInteraction(d);
		d = updateInteraction(d, 0, { targetId: 'sphere', on: 'click', event: 'doThing' });
		return d;
	};

	it('gives the copy a free id rather than reusing the original', () => {
		const { doc, id } = duplicateObject(base(), 'sphere');
		expect(id).not.toBe('sphere');
		expect(doc.objects.map(o => o.id)).toEqual(['sphere', id]);
	});

	it('copies the animation with it', () => {
		// A copy that arrives motionless beside a spinning original reads as
		// the duplicate being broken, not as a deliberate omission.
		const { doc, id } = duplicateObject(base(), 'sphere');
		const copied = doc.timeline.tracks.find(t => t.target === `objects.${id}.rotation.y`);
		expect(copied).toBeDefined();
		expect(copied!.keys).toEqual(
			doc.timeline.tracks.find(t => t.target === 'objects.sphere.rotation.y')!.keys,
		);
	});

	it('copies the interactions with it', () => {
		const { doc, id } = duplicateObject(base(), 'sphere');
		expect(doc.interactions.filter(i => i.targetId === id)).toHaveLength(1);
		expect(doc.interactions.find(i => i.targetId === id)!.event).toBe('doThing');
	});

	it('offsets the copy so it is not hidden inside the original', () => {
		const { doc, id } = duplicateObject(base(), 'sphere');
		const a = doc.objects.find(o => o.id === 'sphere')!;
		const b = doc.objects.find(o => o.id === id)!;
		expect(b.transform.position).not.toEqual(a.transform.position);
	});

	it('shares nothing with the original', () => {
		const { doc, id } = duplicateObject(base(), 'sphere');
		const b = doc.objects.find(o => o.id === id)!;
		b.transform.position[1] = 99;
		expect(doc.objects.find(o => o.id === 'sphere')!.transform.position[1]).toBe(0);
	});

	it('does nothing for an id that is not there', () => {
		const before = base();
		expect(duplicateObject(before, 'ghost').doc).toBe(before);
	});
});

describe('addShader', () => {
	it('points an object at the new shader, or it renders nowhere', () => {
		const { doc } = addObject(createSceneDocument(), 'primitive', 'box');
		const r = addShader(doc, 'box');
		expect(r.doc.objects.find(o => o.id === 'box')!.material.shaderId).toBe(r.id);
	});

	it('starts from source that compiles', () => {
		// An empty fragment shader fails to compile, so the first thing the
		// author would meet is an error in code they did not write.
		const { doc } = addShader(createSceneDocument());
		const src = doc.shaders[0].fragment;
		expect(src).toContain('gl_FragColor');
		expect(src).toContain('void main');
	});

	it('does not collide with a shader already there', () => {
		let d = addShader(createSceneDocument()).doc;
		const second = addShader(d);
		expect(second.id).not.toBe(d.shaders[0].id);
		expect(second.doc.shaders).toHaveLength(2);
	});
});

describe('removeShader', () => {
	it('releases the objects that used it', () => {
		// An unknown shaderId falls back to a standard material silently, so
		// an object left pointing at a deleted shader still renders and the
		// author has no way to tell why it changed.
		const { doc } = addObject(createSceneDocument(), 'primitive', 'box');
		const added = addShader(doc, 'box');
		const after = removeShader(added.doc, added.id);
		expect(after.shaders).toHaveLength(0);
		expect(after.objects.find(o => o.id === 'box')!.material.shaderId).toBe('');
	});

	it('drops the tracks that addressed its uniforms', () => {
		const added = addShader(createSceneDocument());
		const withTrack = addTrack(added.doc, `shaders.${added.id}.uSpeed`);
		expect(removeShader(withTrack, added.id).timeline.tracks).toHaveLength(0);
	});
});
