/**
 * Every edit the Scene Editor can make, as pure functions on a SceneDocument.
 *
 * All of them return a NEW document and never mutate the one handed in. That is
 * what lets the editor's undo history be nothing more than an array of
 * documents: no command objects, no inverse operations, no replay. The SVG
 * editor next door keeps an array of markup strings for exactly the same
 * reason, and it is the cheapest correct undo there is.
 *
 * Kept out of the editor folder so the runtime, the tests and the AppBuilder
 * agent's future `patch_scene` tool can all reach the same operations rather
 * than each growing their own.
 */

import {
	createSceneDocument,
	normalizeSceneDocument,
	type LightType,
	type PrimitiveShape,
	type SceneDocument,
	type SceneLight,
	type SceneObject,
	type SceneShader,
	type TimelineTrack,
} from './sceneDocument';

/** A structural copy, so an edit cannot reach back into the previous document. */
function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * A readable id that is unique within this document.
 *
 * Unique WITHIN THE DOCUMENT rather than globally, because these ids are what
 * timeline tracks and interactions address by name. A random id would be safe
 * but would make `objects.a7f3c2.rotation.y` the thing an author has to read
 * and type, and the tracks would be unreadable.
 */
function uniqueId(base: string, taken: Iterable<string>): string {
	const used = new Set(taken);
	if (!used.has(base)) return base;
	for (let n = 2; ; n++) {
		const candidate = `${base}${n}`;
		if (!used.has(candidate)) return candidate;
	}
}

/* -------------------------------------------------------------------------- */
/* Objects                                                                     */
/* -------------------------------------------------------------------------- */

export function addObject(
	doc: SceneDocument,
	kind: SceneObject['source']['kind'] = 'primitive',
	shape: PrimitiveShape = 'box',
): { doc: SceneDocument; id: string } {
	const next = clone(doc);
	const id = uniqueId(
		kind === 'primitive' ? shape : kind,
		next.objects.map(o => o.id),
	);
	const seed = createSceneDocument({
		objects: [
			{
				id,
				name: id.charAt(0).toUpperCase() + id.slice(1),
				source: { kind, shape },
			},
		],
	} as unknown as Partial<SceneDocument>);
	next.objects.push(seed.objects[0]);
	return { doc: next, id };
}

/**
 * Copy an object, alongside the one it came from.
 *
 * The timeline is copied WITH it. An object's animation is part of what makes
 * it the thing being duplicated, and a copy that arrives motionless next to a
 * spinning original reads as the duplicate being broken rather than as a
 * deliberate omission. Interactions are copied for the same reason.
 *
 * Nudged one unit along x so the copy is visible. Two objects sharing a
 * position look exactly like nothing having happened.
 */
export function duplicateObject(
	doc: SceneDocument,
	id: string,
): { doc: SceneDocument; id: string } {
	const source = doc.objects.find(o => o.id === id);
	if (!source) return { doc, id };

	const next = clone(doc);
	const newId = uniqueId(
		`${id}Copy`,
		next.objects.map(o => o.id),
	);
	const copy: SceneObject = {
		...clone(source),
		id: newId,
		name: `${source.name} copy`,
	};
	copy.transform = {
		...copy.transform,
		position: [
			copy.transform.position[0] + 1,
			copy.transform.position[1],
			copy.transform.position[2],
		],
	};
	const at = next.objects.findIndex(o => o.id === id);
	next.objects.splice(at + 1, 0, copy);

	const prefix = `objects.${id}.`;
	for (const track of doc.timeline.tracks) {
		if (!track.target.startsWith(prefix)) continue;
		next.timeline.tracks.push({
			...clone(track),
			target: `objects.${newId}.${track.target.slice(prefix.length)}`,
		});
	}
	for (const inter of doc.interactions) {
		if (inter.targetId !== id) continue;
		next.interactions.push({ ...inter, targetId: newId });
	}

	return { doc: next, id: newId };
}

export function removeObject(doc: SceneDocument, id: string): SceneDocument {
	const next = clone(doc);
	next.objects = next.objects.filter(o => o.id !== id);
	// Tracks and interactions addressing a deleted object are dropped with it.
	// Leaving them would make validateSceneDocument report an error about an
	// object the author can no longer see, which is unfixable from the UI.
	next.timeline.tracks = next.timeline.tracks.filter(t => !t.target.startsWith(`objects.${id}.`));
	next.interactions = next.interactions.filter(i => i.targetId !== id);
	return next;
}

export function updateObject(
	doc: SceneDocument,
	id: string,
	patch: Partial<SceneObject>,
): SceneDocument {
	const next = clone(doc);
	const idx = next.objects.findIndex(o => o.id === id);
	if (idx < 0) return next;
	next.objects[idx] = {
		...next.objects[idx],
		...patch,
		transform: { ...next.objects[idx].transform, ...(patch.transform ?? {}) },
		material: { ...next.objects[idx].material, ...(patch.material ?? {}) },
		source: { ...next.objects[idx].source, ...(patch.source ?? {}) },
	};
	return next;
}

/**
 * Rename an object's ID, carrying every reference to it along.
 *
 * The id is what tracks and interactions address, so renaming without rewriting
 * them leaves a timeline pointing at nothing. That failure is silent: the
 * object simply stops animating.
 */
export function renameObject(doc: SceneDocument, from: string, to: string): SceneDocument {
	const trimmed = to.trim();
	if (!trimmed || from === trimmed) return doc;
	const next = clone(doc);
	if (next.objects.some(o => o.id === trimmed)) return doc;
	const obj = next.objects.find(o => o.id === from);
	if (!obj) return doc;
	obj.id = trimmed;
	for (const t of next.timeline.tracks) {
		if (t.target.startsWith(`objects.${from}.`)) {
			t.target = `objects.${trimmed}.${t.target.slice(`objects.${from}.`.length)}`;
		}
	}
	for (const i of next.interactions) if (i.targetId === from) i.targetId = trimmed;
	return next;
}

/* -------------------------------------------------------------------------- */
/* Lights                                                                      */
/* -------------------------------------------------------------------------- */

export function addLight(
	doc: SceneDocument,
	type: LightType = 'directional',
): {
	doc: SceneDocument;
	id: string;
} {
	const next = clone(doc);
	const id = uniqueId(
		type,
		next.lights.map(l => l.id),
	);
	next.lights.push({
		id,
		type,
		color: '#ffffff',
		intensity: type === 'ambient' ? 0.5 : 1.5,
		position: [3, 4, 5],
	});
	return { doc: next, id };
}

export function removeLight(doc: SceneDocument, id: string): SceneDocument {
	const next = clone(doc);
	next.lights = next.lights.filter(l => l.id !== id);
	return next;
}

export function updateLight(
	doc: SceneDocument,
	id: string,
	patch: Partial<SceneLight>,
): SceneDocument {
	const next = clone(doc);
	const idx = next.lights.findIndex(l => l.id === id);
	if (idx >= 0) next.lights[idx] = { ...next.lights[idx], ...patch };
	return next;
}

/* -------------------------------------------------------------------------- */
/* Camera, renderer, environment                                               */
/* -------------------------------------------------------------------------- */

export function updateCamera(
	doc: SceneDocument,
	patch: Partial<SceneDocument['camera']>,
): SceneDocument {
	const next = clone(doc);
	next.camera = { ...next.camera, ...patch };
	return next;
}

export function updateEnvironment(
	doc: SceneDocument,
	patch: Partial<SceneDocument['environment']>,
): SceneDocument {
	const next = clone(doc);
	next.environment = { ...next.environment, ...patch };
	return next;
}

export function updateRenderer(
	doc: SceneDocument,
	patch: Partial<SceneDocument['renderer']>,
): SceneDocument {
	const next = clone(doc);
	next.renderer = { ...next.renderer, ...patch };
	return next;
}

/* -------------------------------------------------------------------------- */
/* Shaders                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A new, empty-but-valid shader, and the object that will use it.
 *
 * Both halves together on purpose. A shader nothing references renders
 * nowhere, so adding one on its own looks like the button doing nothing; and
 * pointing an object at a shader id that does not exist drops the object back
 * to a standard material with no error. Until this existed there was no way to
 * create a shader from the editor at all -- only to edit one a preset had
 * already put there.
 *
 * The starter source is a visible flat colour rather than an empty string,
 * because an empty fragment shader fails to compile and the first thing the
 * author would meet is a compile error they did not write.
 */
export function addShader(
	doc: SceneDocument,
	targetObjectId?: string,
): { doc: SceneDocument; id: string } {
	const next = clone(doc);
	const id = uniqueId(
		'shader',
		next.shaders.map(s => s.id),
	);
	next.shaders.push({
		id,
		vertex: '',
		fragment: [
			'varying vec2 vUv;',
			'uniform float uTime;',
			'',
			'void main() {',
			'\tvec3 colour = vec3(vUv, 0.5 + 0.5 * sin(uTime));',
			'\tgl_FragColor = vec4(colour, 1.0);',
			'}',
			'',
		].join('\n'),
		uniforms: [],
	});

	const target =
		next.objects.find(o => o.id === targetObjectId) ??
		next.objects.find(o => !o.material.shaderId);
	if (target) target.material = { ...target.material, shaderId: id };

	return { doc: next, id };
}

export function removeShader(doc: SceneDocument, id: string): SceneDocument {
	const next = clone(doc);
	next.shaders = next.shaders.filter(s => s.id !== id);
	// Objects pointing at it are released rather than left dangling: an unknown
	// shaderId silently falls back to a standard material, so the object would
	// still render and the author would have no way to tell why it changed.
	for (const o of next.objects) {
		if (o.material.shaderId === id) o.material = { ...o.material, shaderId: '' };
	}
	next.timeline.tracks = next.timeline.tracks.filter(t => !t.target.startsWith(`shaders.${id}.`));
	return next;
}

export function updateShader(
	doc: SceneDocument,
	id: string,
	patch: Partial<SceneShader>,
): SceneDocument {
	const next = clone(doc);
	const idx = next.shaders.findIndex(s => s.id === id);
	if (idx >= 0) next.shaders[idx] = { ...next.shaders[idx], ...patch };
	return next;
}

export function setUniform(
	doc: SceneDocument,
	shaderId: string,
	name: string,
	value: unknown,
): SceneDocument {
	const next = clone(doc);
	const shader = next.shaders.find(s => s.id === shaderId);
	if (!shader) return next;
	const existing = shader.uniforms.find(u => u.name === name);
	if (existing) existing.value = value as any;
	return next;
}

/**
 * Uniform names a fragment or vertex source declares but the document does not
 * carry, so the editor can offer to add them.
 *
 * The four shared uniforms are excluded: the runtime binds uTime, uResolution,
 * uPointer, uPointerActive and uProgress for every shader, and listing them as
 * missing would invite an author to add a document uniform that then shadows
 * the live one with a frozen value.
 */
const SHARED_UNIFORMS = new Set([
	'uTime',
	'uResolution',
	'uPointer',
	'uPointerActive',
	'uProgress',
]);

export function undeclaredUniforms(shader: SceneShader): string[] {
	const declared = new Set(shader.uniforms.map(u => u.name));
	const found = new Set<string>();
	for (const src of [shader.vertex ?? '', shader.fragment ?? '']) {
		for (const m of src.matchAll(/^\s*uniform\s+\w+\s+(\w+)\s*;/gm)) {
			const name = m[1];
			if (!declared.has(name) && !SHARED_UNIFORMS.has(name)) found.add(name);
		}
	}
	return [...found];
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

export function addTrack(doc: SceneDocument, target: string): SceneDocument {
	const next = clone(doc);
	if (!target || next.timeline.tracks.some(t => t.target === target)) return next;
	next.timeline.tracks.push({
		target,
		ease: 'linear',
		keys: [
			{ t: 0, v: 0 },
			{ t: 1, v: 1 },
		],
	});
	return next;
}

export function removeTrack(doc: SceneDocument, index: number): SceneDocument {
	const next = clone(doc);
	next.timeline.tracks.splice(index, 1);
	return next;
}

export function updateTrack(
	doc: SceneDocument,
	index: number,
	patch: Partial<TimelineTrack>,
): SceneDocument {
	const next = clone(doc);
	if (!next.timeline.tracks[index]) return next;
	next.timeline.tracks[index] = { ...next.timeline.tracks[index], ...patch };
	return next;
}

/**
 * Move or retime one key.
 *
 * Keys are re-sorted by t afterwards, because `sampleTrack` walks them in order
 * and assumes they ascend. Dragging a key past its neighbour would otherwise
 * produce a track that interpolates backwards for part of its range, which
 * looks like the easing being wrong rather than like the keys being out of
 * order.
 */
export function setKey(
	doc: SceneDocument,
	trackIndex: number,
	keyIndex: number,
	patch: { t?: number; v?: number },
): SceneDocument {
	const next = clone(doc);
	const track = next.timeline.tracks[trackIndex];
	if (!track?.keys[keyIndex]) return next;
	const key = track.keys[keyIndex];
	if (patch.t !== undefined) key.t = Math.min(1, Math.max(0, patch.t));
	if (patch.v !== undefined) key.v = patch.v;
	track.keys.sort((a, b) => a.t - b.t);
	return next;
}

export function addKey(
	doc: SceneDocument,
	trackIndex: number,
	t: number,
	v: number,
): SceneDocument {
	const next = clone(doc);
	const track = next.timeline.tracks[trackIndex];
	if (!track) return next;
	track.keys.push({ t: Math.min(1, Math.max(0, t)), v });
	track.keys.sort((a, b) => a.t - b.t);
	return next;
}

export function removeKey(doc: SceneDocument, trackIndex: number, keyIndex: number): SceneDocument {
	const next = clone(doc);
	const track = next.timeline.tracks[trackIndex];
	// Two keys is the minimum that defines an interpolation. Below that the
	// track holds a constant, which is a track that does nothing while still
	// appearing in the list as though it does.
	if (!track || track.keys.length <= 2) return next;
	track.keys.splice(keyIndex, 1);
	return next;
}

/* -------------------------------------------------------------------------- */
/* Interactions                                                                */
/* -------------------------------------------------------------------------- */

export function addInteraction(doc: SceneDocument): SceneDocument {
	const next = clone(doc);
	next.interactions.push({ on: 'click', targetId: '', event: '', payload: {} } as any);
	return next;
}

export function updateInteraction(
	doc: SceneDocument,
	index: number,
	patch: Partial<SceneDocument['interactions'][number]>,
): SceneDocument {
	const next = clone(doc);
	if (!next.interactions[index]) return next;
	next.interactions[index] = { ...next.interactions[index], ...patch };
	return next;
}

export function removeInteraction(doc: SceneDocument, index: number): SceneDocument {
	const next = clone(doc);
	next.interactions.splice(index, 1);
	return next;
}

/* -------------------------------------------------------------------------- */
/* Track targets the editor can offer                                          */
/* -------------------------------------------------------------------------- */

const OBJECT_PATHS = [
	'position.x',
	'position.y',
	'position.z',
	'rotation.x',
	'rotation.y',
	'rotation.z',
	'scale.x',
	'scale.y',
	'scale.z',
];

const CAMERA_PATHS = ['position.x', 'position.y', 'position.z'];

/**
 * Every target a track can legally address in this document.
 *
 * Offered as a list rather than a free-text box because `parseTrackTarget`
 * accepts only three roots and a mistyped one is dropped in silence: the track
 * stays in the document, appears in the panel, and animates nothing.
 */
export function trackTargets(doc: SceneDocument): Array<{ value: string; label: string }> {
	const out: Array<{ value: string; label: string }> = [];
	for (const o of doc.objects) {
		for (const p of OBJECT_PATHS) {
			out.push({ value: `objects.${o.id}.${p}`, label: `${o.name || o.id} · ${p}` });
		}
	}
	for (const p of CAMERA_PATHS) {
		out.push({ value: `camera.${p}`, label: `Camera · ${p}` });
	}
	for (const s of doc.shaders) {
		for (const u of s.uniforms) {
			if (u.type !== 'float' && u.type !== 'int') continue;
			out.push({ value: `shaders.${s.id}.${u.name}`, label: `${s.id} · ${u.name}` });
		}
	}
	return out;
}

/** Re-normalise after a batch of edits, so a hand-typed value is clamped. */
export function settle(doc: SceneDocument): SceneDocument {
	return normalizeSceneDocument(doc);
}
