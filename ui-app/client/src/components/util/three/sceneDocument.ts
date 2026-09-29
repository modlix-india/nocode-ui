/**
 * The scene document: one JSON shape that the runtime renders, the Scene
 * Editor edits, and each component ships a preset of.
 *
 * Pure on purpose. It imports nothing from three, so it runs in the initial
 * bundle, under jsdom in tests, and in the server render without dragging a
 * 600KB dependency behind it. Modelled on svgDocument.ts, which is the same
 * idea for SVG.
 *
 * Two audiences write these, and that shapes every decision here:
 *
 *  - The Scene Editor, which can be trusted to produce well-formed output.
 *  - A hand edit or the AppBuilder agent, which cannot. So `normalize` never
 *    throws on anything, and `validate` returns sentences a model can act on
 *    rather than a schema dump. A scene that renders black is the failure that
 *    actually happens, and "it threw" is easier to debug than "it is empty".
 *
 * This file is the published contract: generate-component-catalog.ts emits it
 * into component-catalog.json, and nocode-ai validates against THAT rather
 * than against a hand-maintained Python copy. Changing a field here changes
 * what the agent is allowed to write, so version it rather than redefining it.
 */

import { DEFAULT_EASING, EASING_NAMES, type EasingName } from './easing';

export const SCENE_DOCUMENT_VERSION = 1;

export type Vec3 = [number, number, number];

export type ObjectSourceKind = 'gltf' | 'primitive' | 'points' | 'quad';
export type PrimitiveShape = 'box' | 'sphere' | 'plane' | 'torus' | 'cylinder' | 'icosahedron';
export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
/**
 * 'fullscreen' is the canonical three idiom for a shader backdrop: a fixed
 * -1..1 orthographic frustum that a PlaneGeometry(2,2) fills exactly, at every
 * aspect ratio, and that is never aspect-corrected on resize.
 *
 * It exists because the obvious alternatives both fail. A perspective camera
 * covers only 2 units while a 1280x420 box needs 2.84, so the page background
 * bleeds through the left and right edges -- measured on the first render, not
 * theorised. An aspect-corrected orthographic camera has the same gap.
 */
export type CameraType = 'perspective' | 'orthographic' | 'fullscreen';
export type TimelineDriver = 'time' | 'scroll' | 'pointer';
export type InteractionGesture = 'click' | 'hover' | 'pointerdown' | 'pointerup';
export type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'bool' | 'color' | 'texture';

export interface RendererSettings {
	alpha: boolean;
	antialias: boolean;
	/** Capping DPR is the single biggest perf lever on a retina laptop. */
	dprCap: number;
	toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces';
	exposure: number;
}

export interface CameraSettings {
	type: CameraType;
	fov: number;
	position: Vec3;
	target: Vec3;
	near: number;
	far: number;
	controls: boolean;
	autoRotate: boolean;
	autoRotateSpeed: number;
}

export interface EnvironmentSettings {
	/** A built-in lighting preset, or '' when hdriUrl supplies one instead. */
	preset: string;
	hdriUrl: string;
	/** Show the environment behind the scene rather than only lighting with it. */
	background: boolean;
	backgroundColor: string;
}

export interface SceneLight {
	id: string;
	type: LightType;
	color: string;
	intensity: number;
	position: Vec3;
}

export interface ObjectTransform {
	position: Vec3;
	/** Euler angles in degrees. Radians in a hand-written document are a trap. */
	rotation: Vec3;
	scale: Vec3;
}

export interface ObjectMaterial {
	color: string;
	metalness: number;
	roughness: number;
	opacity: number;
	transparent: boolean;
	wireframe: boolean;
	/** Names an entry in `shaders`; overrides the standard material. */
	shaderId: string;
}

/** How a 'points' cloud is seeded in space. */
export type PointDistribution = 'sphere' | 'box' | 'disc' | 'shell';

export interface ObjectSource {
	kind: ObjectSourceKind;
	/** For kind 'gltf'. Goes through getSrcUrl for CDN prefixing at load. */
	url: string;
	shape: PrimitiveShape;
	/** For kind 'points'. */
	count: number;
	distribution: PointDistribution;
}

export interface SceneObject {
	id: string;
	name: string;
	visible: boolean;
	source: ObjectSource;
	transform: ObjectTransform;
	material: ObjectMaterial;
	/** Named clips inside a glTF to play on load. */
	animations: string[];
}

export interface ShaderUniform {
	name: string;
	type: UniformType;
	value: number | number[] | string | boolean;
}

export interface SceneShader {
	id: string;
	vertex: string;
	fragment: string;
	uniforms: ShaderUniform[];
}

export interface TrackKey {
	/** Normalised position on the timeline, 0..1. */
	t: number;
	v: number;
}

export interface TimelineTrack {
	/** Dotted path, e.g. 'objects.hero.rotation.y' or 'shaders.aurora.uSpeed'. */
	target: string;
	keys: TrackKey[];
	ease: EasingName;
}

export interface SceneTimeline {
	driver: TimelineDriver;
	/** For driver 'time', in milliseconds. */
	duration: number;
	loop: boolean;
	tracks: TimelineTrack[];
}

export interface SceneInteraction {
	on: InteractionGesture;
	/** Object id the gesture must land on, or '' for anywhere in the canvas. */
	targetId: string;
	/** Key of a page event function, run through the ordinary runEvent path. */
	event: string;
}

export interface SceneDocument {
	version: number;
	renderer: RendererSettings;
	camera: CameraSettings;
	environment: EnvironmentSettings;
	lights: SceneLight[];
	objects: SceneObject[];
	shaders: SceneShader[];
	timeline: SceneTimeline;
	interactions: SceneInteraction[];
}

/* -------------------------------------------------------------------------- */
/* Coercion helpers. Every one takes unknown and cannot throw.                 */
/* -------------------------------------------------------------------------- */

const isObj = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

function num(v: unknown, fallback: number): number {
	const n = typeof v === 'string' ? parseFloat(v) : v;
	return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

function clampNum(v: unknown, fallback: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, num(v, fallback)));
}

function bool(v: unknown, fallback: boolean): boolean {
	if (typeof v === 'boolean') return v;
	if (v === 'true') return true;
	if (v === 'false') return false;
	return fallback;
}

function str(v: unknown, fallback = ''): string {
	return typeof v === 'string' ? v : fallback;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
	return allowed.includes(v as T) ? (v as T) : fallback;
}

/** Accepts [x,y,z] or {x,y,z}, because both turn up in hand-written JSON. */
export function vec3(v: unknown, fallback: Vec3): Vec3 {
	if (Array.isArray(v)) {
		return [num(v[0], fallback[0]), num(v[1], fallback[1]), num(v[2], fallback[2])];
	}
	if (isObj(v)) {
		return [num(v.x, fallback[0]), num(v.y, fallback[1]), num(v.z, fallback[2])];
	}
	return [...fallback];
}

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

let idSeq = 0;
const nextId = (prefix: string): string => `${prefix}${++idSeq}`;

/** Testing seam: keeps generated ids stable across cases. */
export function resetIdSequenceForTests(): void {
	idSeq = 0;
}

/* -------------------------------------------------------------------------- */
/* Defaults                                                                    */
/* -------------------------------------------------------------------------- */

const TONE_MAPPINGS = ['none', 'linear', 'reinhard', 'cineon', 'aces'] as const;
const LIGHT_TYPES: readonly LightType[] = ['ambient', 'directional', 'point', 'spot', 'hemisphere'];
const SOURCE_KINDS: readonly ObjectSourceKind[] = ['gltf', 'primitive', 'points', 'quad'];
const DISTRIBUTIONS: readonly PointDistribution[] = ['sphere', 'box', 'disc', 'shell'];
const SHAPES: readonly PrimitiveShape[] = [
	'box',
	'sphere',
	'plane',
	'torus',
	'cylinder',
	'icosahedron',
];
const DRIVERS: readonly TimelineDriver[] = ['time', 'scroll', 'pointer'];
const GESTURES: readonly InteractionGesture[] = ['click', 'hover', 'pointerdown', 'pointerup'];
const UNIFORM_TYPES: readonly UniformType[] = [
	'float',
	'vec2',
	'vec3',
	'vec4',
	'int',
	'bool',
	'color',
	'texture',
];

export function defaultRenderer(): RendererSettings {
	return { alpha: true, antialias: true, dprCap: 2, toneMapping: 'aces', exposure: 1 };
}

export function defaultCamera(): CameraSettings {
	return {
		type: 'perspective',
		fov: 50,
		position: [0, 0, 5],
		target: [0, 0, 0],
		near: 0.1,
		far: 1000,
		controls: false,
		autoRotate: false,
		autoRotateSpeed: 1,
	};
}

export function defaultEnvironment(): EnvironmentSettings {
	return { preset: 'studio', hdriUrl: '', background: false, backgroundColor: '' };
}

export function defaultTimeline(): SceneTimeline {
	return { driver: 'time', duration: 4000, loop: true, tracks: [] };
}

export function createSceneDocument(partial?: Partial<SceneDocument>): SceneDocument {
	return normalizeSceneDocument({ version: SCENE_DOCUMENT_VERSION, ...(partial ?? {}) });
}

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

function normalizeTransform(v: unknown): ObjectTransform {
	const t = isObj(v) ? v : {};
	return {
		position: vec3(t.position, [0, 0, 0]),
		rotation: vec3(t.rotation, [0, 0, 0]),
		scale: vec3(t.scale, [1, 1, 1]),
	};
}

function normalizeMaterial(v: unknown): ObjectMaterial {
	const m = isObj(v) ? v : {};
	return {
		color: str(m.color, '#ffffff'),
		metalness: clampNum(m.metalness, 0, 0, 1),
		roughness: clampNum(m.roughness, 1, 0, 1),
		opacity: clampNum(m.opacity, 1, 0, 1),
		// An opacity below 1 with transparent false renders fully opaque, which
		// looks like the opacity setting silently did nothing.
		transparent: bool(m.transparent, num(m.opacity, 1) < 1),
		wireframe: bool(m.wireframe, false),
		shaderId: str(m.shaderId),
	};
}

function normalizeObject(v: unknown): SceneObject {
	const o = isObj(v) ? v : {};
	const src = isObj(o.source) ? o.source : {};
	return {
		id: str(o.id) || nextId('obj'),
		name: str(o.name, 'Object'),
		visible: bool(o.visible, true),
		source: {
			kind: oneOf(src.kind, SOURCE_KINDS, 'primitive'),
			url: str(src.url),
			shape: oneOf(src.shape, SHAPES, 'box'),
			// Capped well below what a GPU can draw: the real limit is that each
			// point costs a fragment pass, and a careless 1,000,000 on a laptop
			// integrated GPU drops the whole page, not just the scene.
			count: Math.round(clampNum(src.count, 1000, 1, 200_000)),
			distribution: oneOf(src.distribution, DISTRIBUTIONS, 'sphere'),
		},
		transform: normalizeTransform(o.transform),
		material: normalizeMaterial(o.material),
		animations: arr(o.animations)
			.map(a => str(a))
			.filter(Boolean),
	};
}

function normalizeLight(v: unknown): SceneLight {
	const l = isObj(v) ? v : {};
	return {
		id: str(l.id) || nextId('light'),
		type: oneOf(l.type, LIGHT_TYPES, 'directional'),
		color: str(l.color, '#ffffff'),
		intensity: clampNum(l.intensity, 1, 0, 100),
		position: vec3(l.position, [5, 5, 5]),
	};
}

function normalizeUniform(v: unknown): ShaderUniform {
	const u = isObj(v) ? v : {};
	const type = oneOf(u.type, UNIFORM_TYPES, 'float');
	let value = u.value;
	if (type === 'float' || type === 'int') value = num(value, 0);
	else if (type === 'bool') value = bool(value, false);
	else if (type === 'color' || type === 'texture') value = str(value);
	else value = arr(value).map(n => num(n, 0));
	return { name: str(u.name), type, value: value as ShaderUniform['value'] };
}

function normalizeShader(v: unknown): SceneShader {
	const s = isObj(v) ? v : {};
	return {
		id: str(s.id) || nextId('shader'),
		vertex: str(s.vertex),
		fragment: str(s.fragment),
		uniforms: arr(s.uniforms).map(normalizeUniform),
	};
}

function normalizeTrack(v: unknown): TimelineTrack {
	const t = isObj(v) ? v : {};
	const keys = arr(t.keys)
		.map(k => {
			const key = isObj(k) ? k : {};
			return { t: clampNum(key.t, 0, 0, 1), v: num(key.v, 0) };
		})
		// Out-of-order keys interpolate backwards and look like a glitch.
		.sort((a, b) => a.t - b.t);
	return {
		target: str(t.target),
		keys,
		ease: oneOf(t.ease, EASING_NAMES, DEFAULT_EASING),
	};
}

function normalizeInteraction(v: unknown): SceneInteraction {
	const i = isObj(v) ? v : {};
	return {
		on: oneOf(i.on, GESTURES, 'click'),
		targetId: str(i.targetId),
		event: str(i.event),
	};
}

/**
 * Turn anything at all into a renderable document. Never throws: a scene that
 * falls back to defaults still draws something, and `validate` is where the
 * author is told what was wrong.
 */
export function normalizeSceneDocument(input: unknown): SceneDocument {
	const d = isObj(input) ? migrate(input) : {};
	const r = isObj(d.renderer) ? d.renderer : {};
	const c = isObj(d.camera) ? d.camera : {};
	const e = isObj(d.environment) ? d.environment : {};
	const tl = isObj(d.timeline) ? d.timeline : {};
	const dc = defaultCamera();

	return {
		version: SCENE_DOCUMENT_VERSION,
		renderer: {
			alpha: bool(r.alpha, true),
			antialias: bool(r.antialias, true),
			dprCap: clampNum(r.dprCap, 2, 0.5, 4),
			toneMapping: oneOf(r.toneMapping, TONE_MAPPINGS, 'aces'),
			exposure: clampNum(r.exposure, 1, 0, 10),
		},
		camera: {
			type: oneOf(
				c.type,
				['perspective', 'orthographic', 'fullscreen'] as const,
				'perspective',
			),
			fov: clampNum(c.fov, dc.fov, 1, 179),
			position: vec3(c.position, dc.position),
			target: vec3(c.target, dc.target),
			near: Math.max(0.0001, num(c.near, dc.near)),
			far: num(c.far, dc.far),
			controls: bool(c.controls, false),
			autoRotate: bool(c.autoRotate, false),
			autoRotateSpeed: num(c.autoRotateSpeed, 1),
		},
		environment: {
			preset: str(e.preset, 'studio'),
			hdriUrl: str(e.hdriUrl),
			background: bool(e.background, false),
			backgroundColor: str(e.backgroundColor),
		},
		lights: arr(d.lights).map(normalizeLight),
		objects: arr(d.objects).map(normalizeObject),
		shaders: arr(d.shaders).map(normalizeShader),
		timeline: {
			driver: oneOf(tl.driver, DRIVERS, 'time'),
			duration: Math.max(1, num(tl.duration, 4000)),
			loop: bool(tl.loop, true),
			tracks: arr(tl.tracks).map(normalizeTrack),
		},
		interactions: arr(d.interactions).map(normalizeInteraction),
	};
}

/**
 * Bring an older document forward. Version 1 is the first, so there is nothing
 * to do yet; the seam exists so that adding version 2 does not require finding
 * every call site.
 */
function migrate(d: Record<string, unknown>): Record<string, unknown> {
	return d;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Problems worth telling the author about, as sentences rather than paths.
 * Normalisation has already made the document renderable, so everything here
 * is "this will not do what you meant", not "this will crash".
 */
/**
 * A stored scene document wins over a preset name.
 *
 * SceneContentEditor writes `scene` and DELETES `preset` in the same change, so
 * in practice only one is ever set. This is the belt to that braces: a
 * definition carrying both -- hand-edited, or written by a tool -- must resolve
 * the same way every time rather than depending on which branch happened to run
 * first. The document wins, because it is the one a person edited.
 */
export function resolveSceneDocument(
	scene: unknown,
	fromPreset: () => SceneDocument,
): SceneDocument {
	if (scene && typeof scene === 'object') return normalizeSceneDocument(scene);
	return fromPreset();
}

export function validateSceneDocument(doc: SceneDocument): string[] {
	const errors: string[] = [];

	const objectIds = new Set<string>();
	for (const o of doc.objects) {
		if (objectIds.has(o.id)) {
			errors.push(
				`Two objects share the id '${o.id}'. Ids address objects from ` +
					`timeline tracks and interactions, so the second one is unreachable.`,
			);
		}
		objectIds.add(o.id);

		if (o.source.kind === 'gltf' && !o.source.url) {
			errors.push(`Object '${o.name}' is a gltf source with no url, so nothing loads.`);
		}
		if (o.material.shaderId && !doc.shaders.some(s => s.id === o.material.shaderId)) {
			errors.push(
				`Object '${o.name}' references shader '${o.material.shaderId}', ` +
					`which is not in shaders.`,
			);
		}
	}

	const shaderIds = new Set<string>();
	for (const s of doc.shaders) {
		if (shaderIds.has(s.id)) errors.push(`Two shaders share the id '${s.id}'.`);
		shaderIds.add(s.id);

		if (!s.fragment.trim()) {
			errors.push(`Shader '${s.id}' has no fragment source; it would render black.`);
		} else if (!/\bvoid\s+main\s*\(/.test(s.fragment)) {
			// Cheap check that catches the common case of a snippet pasted
			// without its entry point. Real compilation happens in the browser.
			errors.push(`Shader '${s.id}' fragment has no 'void main()' entry point.`);
		}
		for (const u of s.uniforms) {
			if (!u.name) errors.push(`Shader '${s.id}' has a uniform with no name.`);
		}
	}

	if (!doc.objects.length) {
		errors.push('The scene has no objects, so it renders empty.');
	}

	const lit = doc.lights.length > 0 || !!doc.environment.preset || !!doc.environment.hdriUrl;
	const needsLight = doc.objects.some(
		o => o.visible && o.source.kind !== 'points' && !o.material.shaderId,
	);
	if (needsLight && !lit) {
		// The most common way a scene renders as a black rectangle while every
		// individual setting looks correct.
		errors.push(
			'Nothing lights this scene: it has no lights and no environment preset, ' +
				'so standard materials render black.',
		);
	}

	for (const t of doc.timeline.tracks) {
		if (!t.target) {
			errors.push('A timeline track has no target path.');
			continue;
		}
		const [root, id] = t.target.split('.');
		if (root === 'objects' && !objectIds.has(id)) {
			errors.push(`Timeline track targets object '${id}', which does not exist.`);
		} else if (root === 'shaders' && !shaderIds.has(id)) {
			errors.push(`Timeline track targets shader '${id}', which does not exist.`);
		} else if (root !== 'objects' && root !== 'shaders' && root !== 'camera') {
			errors.push(
				`Timeline track target '${t.target}' must start with objects, ` +
					`shaders or camera.`,
			);
		}
		if (t.keys.length < 2) {
			errors.push(`Timeline track '${t.target}' needs at least two keys to animate.`);
		}
	}

	for (const i of doc.interactions) {
		if (!i.event) {
			errors.push(`An interaction on '${i.on}' names no event function.`);
		}
		if (i.targetId && !objectIds.has(i.targetId)) {
			errors.push(`Interaction targets object '${i.targetId}', which does not exist.`);
		}
	}

	return errors;
}

/** Convenience for callers that only need a yes or no. */
export const isSceneDocumentValid = (doc: SceneDocument): boolean =>
	validateSceneDocument(doc).length === 0;
