/**
 * Built-in scene documents.
 *
 * These are the whole point of the shared-model design: a new effect should be
 * a preset here, not a new component. They are used three ways, which is why
 * they live in their own module rather than inside any one component:
 *
 *  - as each component's default scene, so it looks like something the moment
 *    it is dropped on a page;
 *  - as the Scene Editor's template gallery;
 *  - published into component-catalog.json, so the AppBuilder agent can name a
 *    preset instead of inventing GLSL from nothing.
 *
 * The GLSL is deliberately plain: GLSL ES 1.0, gl_FragColor, no extensions, no
 * derivatives. It has to compile everywhere, including under SwiftShader in a
 * headless render check, or the verification story does not work.
 *
 * CAUTION until the Scene Editor lands: `preset` is currently a RUNTIME
 * reference, not a seed. A page stores only the preset name, so editing a
 * shader here changes the appearance of every page already using it, with no
 * change to any page definition and nothing in a diff to show it. That is not
 * hypothetical -- the aurora shader below was rewritten during Phase 1
 * verification and the same unchanged page rendered completely differently.
 *
 * Treat a shipped preset as close to frozen: fix a defect, but do not restyle.
 * Phase 5 resolves a preset into a stored SceneDocument on first edit, the way
 * SvgContentEditor turns `src` into `svgContent`, after which this hazard is
 * gone for pages that have been edited.
 *
 * Shared uniforms (uTime, uResolution, uPointer, uProgress) are supplied by
 * sceneRuntime for every shader, so they do not need an entry in the document's
 * `uniforms` array. They DO still have to be declared in the GLSL, because
 * three does not inject uniform declarations into shader source: it only binds
 * values to names the shader already declares. Declaring one in `uniforms` AND
 * relying on the shared injection is fine; omitting the GLSL declaration is
 * not, and fails at compile time with 'undeclared identifier'.
 */

import { createSceneDocument, type SceneDocument, type SceneShader } from './sceneDocument';

export interface ScenePreset {
	name: string;
	displayName: string;
	description: string;
	/** Which component this preset is meant for, for the editor's gallery. */
	kind: 'background' | 'particles' | 'model' | 'scroll';
	build: () => SceneDocument;
}

/** Value noise, small enough to paste into several shaders without a library. */
const NOISE_GLSL = `
float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y);
}
`;

const FULLSCREEN_VERTEX = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function backgroundShader(id: string, fragment: string, uniforms: SceneShader['uniforms']) {
	return { id, vertex: FULLSCREEN_VERTEX, fragment, uniforms };
}

/** A quad filling the frame, lit only by its own shader. */
function backgroundScene(shader: SceneShader): SceneDocument {
	return createSceneDocument({
		// 'fullscreen', not 'perspective': a perspective camera covers 2 units
		// while a 1280x420 box needs 2.84, so the page background showed
		// through the left and right edges on the first real render.
		camera: { type: 'fullscreen', position: [0, 0, 1] },
		environment: { preset: '' },
		lights: [],
		shaders: [shader],
		objects: [
			{
				id: 'backdrop',
				name: 'Backdrop',
				source: { kind: 'quad' },
				material: { shaderId: shader.id },
			},
		],
	} as unknown as Partial<SceneDocument>);
}

// The first version of this saturated to near-flat blue: its
// smoothstep(0.15, 0.95, n * 0.7 + uv.y * 0.5) took an input that ranged up to
// 1.55, so it clamped to 1 across most of the surface and the result was
// uColorB almost everywhere. The noise is normalised to 0..1 here before it is
// used, and the ribbons come from a folded fract() rather than from a
// smoothstep that was always saturated.
const AURORA = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
${NOISE_GLSL}
void main() {
	vec2 uv = vUv;
	float t = uTime * 0.06;
	// Two octaves, weights summing to 1 so n stays in 0..1.
	float n = 0.65 * noise(uv * vec2(2.0, 3.0) + vec2(t, t * 0.6))
			+ 0.35 * noise(uv * vec2(5.0, 7.0) - vec2(t * 1.7, 0.0));
	vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 1.0, uv.y * 0.55 + n * 0.45));
	// Fold a repeating coordinate to 0 at the ribbon centre, then raise it to a
	// power so the glow falls off sharply instead of washing over everything.
	float ribbon = abs(fract(uv.y * 1.6 + n * 1.1) - 0.5) * 2.0;
	col += uColorC * pow(1.0 - ribbon, 3.0) * 0.9;
	gl_FragColor = vec4(col, 1.0);
}
`;

const WAVES = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
void main() {
	vec2 uv = vUv;
	float w = sin(uv.x * 8.0 + uTime * uSpeed) * 0.5
			+ sin(uv.x * 13.0 - uTime * uSpeed * 0.7) * 0.25;
	float d = smoothstep(0.02, 0.0, abs(uv.y - 0.5 - w * 0.12));
	vec3 col = mix(uColorA, uColorB, uv.y + w * 0.2);
	col += d * 0.35;
	gl_FragColor = vec4(col, 1.0);
}
`;

const GRADIENT_MESH = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uPointerActive;
void main() {
	vec2 uv = vUv;
	vec2 p = uv - 0.5;
	// Pointer nudges the blend centres, so the surface reacts without motion
	// that a reduced-motion user would notice on a single frame.
	// Gated on uPointerActive: at rest uPointer is parked far off-canvas, and
	// adding that raw would put both blend centres tens of units away, leaving
	// every blob outside the quad and the whole background flat uColorA until
	// the pointer first touched it.
	vec2 nudge = uPointer * uPointerActive;
	vec2 c1 = vec2(0.3, 0.35) + nudge * 0.08 + vec2(sin(uTime * 0.21), cos(uTime * 0.17)) * 0.06;
	vec2 c2 = vec2(0.7, 0.65) - nudge * 0.06 + vec2(cos(uTime * 0.13), sin(uTime * 0.19)) * 0.06;
	float d1 = 1.0 - smoothstep(0.0, 0.7, distance(uv, c1));
	float d2 = 1.0 - smoothstep(0.0, 0.7, distance(uv, c2));
	vec3 col = mix(uColorA, uColorB, clamp(d1, 0.0, 1.0));
	col = mix(col, uColorC, clamp(d2 * 0.8, 0.0, 1.0));
	gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Points vertex shader. Three things here are not obvious:
 *
 *  - `aSeed` is the per-point random attribute buildPoints writes, and it is
 *    what gives each particle its own phase and size without a texture lookup.
 *  - the pointer push is done in VIEW space, because that is the space uPointer
 *    is already in; doing it in world space makes the repulsion drift away from
 *    the cursor as the camera moves.
 *  - gl_PointSize divides by -mv.z for perspective falloff, and that value is
 *    clamped away from zero. A point crossing the camera plane otherwise gets
 *    an enormous or negative size and paints the whole screen for one frame.
 *  - uDepthScale must be the camera's distance from the field, so that a
 *    particle at the centre comes out at uSize pixels. The first version used
 *    a fixed 260.0 here, borrowed from three's own PointsMaterial where the
 *    factor is half the render height and `size` is in WORLD units. With uSize
 *    read as pixels that made every particle about 190px across: it compiled,
 *    it animated, and it rendered as a few enormous overlapping blobs.
 */
const POINTS_VERTEX = `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uDepthScale;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uPointerStrength;
varying float vSeed;
void main() {
	vSeed = aSeed;
	vec3 p = position;
	float t = uTime * 0.25 + aSeed * 6.28318;
	p.x += sin(t) * 0.04;
	p.y += cos(t * 0.9) * 0.04;
	p.z += sin(t * 0.7) * 0.04;

	vec4 mv = modelViewMatrix * vec4(p, 1.0);

	// Gated rather than relying on the parked sentinel being far enough away
	// for exp(-d*d) to underflow. That happens to hold at the current park
	// distance and falloff, but both are numbers someone will reasonably
	// change, and the failure it would bring back is a hole bitten out of the
	// centre of the field before the pointer has ever been near it.
	vec2 d = mv.xy - uPointer * 1.6;
	float dist = max(length(d), 0.001);
	float push = uPointerStrength * uPointerActive * exp(-dist * dist * 1.8);
	mv.xy += (d / dist) * push;

	gl_Position = projectionMatrix * mv;
	gl_PointSize = uSize * (0.6 + aSeed) * (uDepthScale / max(-mv.z, 0.1));
}
`;

const POINTS_FRAGMENT = `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vSeed;
void main() {
	// Round the square point sprite off, and fade the edge so it does not alias.
	vec2 c = gl_PointCoord - 0.5;
	float d = length(c);
	if (d > 0.5) discard;
	gl_FragColor = vec4(mix(uColorA, uColorB, vSeed), smoothstep(0.5, 0.08, d));
}
`;

function pointsScene(
	id: string,
	distribution: string,
	count: number,
	uniforms: SceneShader['uniforms'],
	spin = true,
): SceneDocument {
	return createSceneDocument({
		camera: { position: [0, 0, 3] },
		environment: { preset: '' },
		lights: [],
		shaders: [{ id, vertex: POINTS_VERTEX, fragment: POINTS_FRAGMENT, uniforms }],
		objects: [
			{
				id: 'field',
				name: 'Particle Field',
				source: { kind: 'points', count, distribution },
				transform: { scale: [1.5, 1.5, 1.5] },
				material: { shaderId: id, transparent: true },
			},
		],
		timeline: spin
			? {
					driver: 'time',
					duration: 40000,
					loop: true,
					tracks: [
						{
							target: 'objects.field.rotation.y',
							ease: 'linear',
							keys: [
								{ t: 0, v: 0 },
								{ t: 1, v: 360 },
							],
						},
					],
				}
			: { driver: 'time', duration: 4000, loop: true, tracks: [] },
	} as unknown as Partial<SceneDocument>);
}

/**
 * The named lighting rigs the ModelViewer offers.
 *
 * Real lights rather than an HDRI on purpose: an .hdr is a multi-megabyte
 * download for what is, for most product shots, three directional lights. The
 * HDRI path still exists for materials that genuinely need it -- metal and
 * glass have nothing to reflect without one -- but it should be a deliberate
 * choice rather than the price of getting a model lit at all.
 */
export const LIGHTING_RIGS: Record<string, SceneDocument['lights']> = {
	studio: [
		{ id: 'key', type: 'directional', color: '#ffffff', intensity: 2.2, position: [4, 6, 5] },
		{ id: 'fill', type: 'directional', color: '#ffffff', intensity: 0.7, position: [-5, 1, 3] },
		{ id: 'rim', type: 'directional', color: '#ffffff', intensity: 0.9, position: [0, 2, -6] },
		{ id: 'ambient', type: 'ambient', color: '#ffffff', intensity: 0.5, position: [0, 0, 0] },
	],
	soft: [
		{ id: 'key', type: 'directional', color: '#ffffff', intensity: 1.2, position: [2, 5, 4] },
		{
			id: 'sky',
			type: 'hemisphere',
			color: '#ffffff',
			intensity: 1.1,
			position: [0, 1, 0],
		},
		{ id: 'ambient', type: 'ambient', color: '#ffffff', intensity: 0.8, position: [0, 0, 0] },
	],
	dramatic: [
		{ id: 'key', type: 'directional', color: '#ffffff', intensity: 3.4, position: [6, 4, 2] },
		{ id: 'rim', type: 'directional', color: '#6ea8ff', intensity: 1.1, position: [-3, 1, -5] },
		{ id: 'ambient', type: 'ambient', color: '#ffffff', intensity: 0.12, position: [0, 0, 0] },
	],
	warm: [
		{ id: 'key', type: 'directional', color: '#ffb86b', intensity: 2.4, position: [5, 4, 3] },
		{ id: 'fill', type: 'directional', color: '#6ea8ff', intensity: 0.8, position: [-4, 2, 2] },
		{ id: 'ambient', type: 'ambient', color: '#ffd9b0', intensity: 0.45, position: [0, 0, 0] },
	],
};

/** A rig by name, falling back to studio rather than to an unlit scene. */
export function lightingRig(name: string | undefined): SceneDocument['lights'] {
	// Deep-copied, because the caller puts these straight into a document that
	// the Scene Editor may then mutate, and a shared array would leak one
	// scene's edits into every other scene using the same rig.
	const rig = LIGHTING_RIGS[name ?? ''] ?? LIGHTING_RIGS.studio;
	return rig.map(l => ({ ...l, position: [...l.position] as [number, number, number] }));
}

export const SCENE_PRESETS: ScenePreset[] = [
	{
		name: 'aurora',
		displayName: 'Aurora',
		description: 'Soft drifting colour bands. Good behind a hero headline.',
		kind: 'background',
		build: () =>
			backgroundScene(
				backgroundShader('aurora', AURORA, [
					{ name: 'uColorA', type: 'color', value: '#0b1026' },
					{ name: 'uColorB', type: 'color', value: '#2b5cff' },
					{ name: 'uColorC', type: 'color', value: '#7ef5d0' },
				]),
			),
	},
	{
		name: 'waves',
		displayName: 'Noise Waves',
		description: 'A travelling wave with a bright crest.',
		kind: 'background',
		build: () =>
			backgroundScene(
				backgroundShader('waves', WAVES, [
					{ name: 'uColorA', type: 'color', value: '#101a3a' },
					{ name: 'uColorB', type: 'color', value: '#4338ca' },
					{ name: 'uSpeed', type: 'float', value: 0.6 },
				]),
			),
	},
	{
		name: 'gradientMesh',
		displayName: 'Gradient Mesh',
		description: 'Blended colour blobs that lean toward the pointer.',
		kind: 'background',
		build: () =>
			backgroundScene(
				backgroundShader('gradientMesh', GRADIENT_MESH, [
					{ name: 'uColorA', type: 'color', value: '#1e1b4b' },
					{ name: 'uColorB', type: 'color', value: '#c026d3' },
					{ name: 'uColorC', type: 'color', value: '#0ea5e9' },
				]),
			),
	},
	{
		name: 'orbField',
		displayName: 'Orb Field',
		description: 'A slowly rotating cloud of points that parts around the cursor.',
		kind: 'particles',
		build: () =>
			pointsScene('orbField', 'sphere', 4000, [
				{ name: 'uColorA', type: 'color', value: '#9bd6ff' },
				{ name: 'uColorB', type: 'color', value: '#5b7cff' },
				{ name: 'uSize', type: 'float', value: 2.2 },
				{ name: 'uPointerStrength', type: 'float', value: 0.35 },
				{ name: 'uDepthScale', type: 'float', value: 3 },
			]),
	},
	{
		name: 'starfield',
		displayName: 'Starfield',
		description: 'Points on a sphere surface, like a night sky turning overhead.',
		kind: 'particles',
		build: () =>
			pointsScene('starfield', 'shell', 6000, [
				{ name: 'uColorA', type: 'color', value: '#ffffff' },
				{ name: 'uColorB', type: 'color', value: '#9db4ff' },
				{ name: 'uSize', type: 'float', value: 1.6 },
				{ name: 'uPointerStrength', type: 'float', value: 0.12 },
				{ name: 'uDepthScale', type: 'float', value: 3 },
			]),
	},
	{
		name: 'dust',
		displayName: 'Drifting Dust',
		description: 'A flat drift of motes, good as a subtle layer behind content.',
		kind: 'particles',
		build: () =>
			pointsScene(
				'dust',
				'disc',
				2500,
				[
					{ name: 'uColorA', type: 'color', value: '#f5e6c8' },
					{ name: 'uColorB', type: 'color', value: '#c9a227' },
					{ name: 'uSize', type: 'float', value: 2.6 },
					{ name: 'uPointerStrength', type: 'float', value: 0.5 },
					{ name: 'uDepthScale', type: 'float', value: 3 },
				],
				false,
			),
	},
	{
		name: 'studio',
		displayName: 'Studio Product',
		description: 'Neutral three-point lighting for showing a model.',
		kind: 'model',
		build: () =>
			createSceneDocument({
				camera: { position: [0, 0.6, 3.2], controls: true, autoRotate: true },
				environment: { preset: 'studio' },
				lights: [
					{ id: 'key', type: 'directional', intensity: 2.2, position: [4, 6, 5] },
					{ id: 'fill', type: 'directional', intensity: 0.7, position: [-5, 1, 3] },
					{ id: 'ambient', type: 'ambient', intensity: 0.5 },
				],
				objects: [
					{
						id: 'subject',
						name: 'Subject',
						source: { kind: 'primitive', shape: 'icosahedron' },
						material: { color: '#c9ced6', metalness: 0.35, roughness: 0.35 },
					},
				],
			} as unknown as Partial<SceneDocument>),
	},
	{
		name: 'scrollSpin',
		displayName: 'Scroll Spin',
		description: 'An object that turns and rises as the section scrolls past.',
		kind: 'scroll',
		build: () =>
			createSceneDocument({
				camera: { position: [0, 0, 4] },
				environment: { preset: 'studio' },
				lights: [
					{ id: 'key', type: 'directional', intensity: 2, position: [3, 5, 4] },
					{ id: 'ambient', type: 'ambient', intensity: 0.6 },
				],
				objects: [
					{
						id: 'hero',
						name: 'Hero',
						source: { kind: 'primitive', shape: 'torus' },
						material: { color: '#f59e0b', metalness: 0.4, roughness: 0.3 },
					},
				],
				timeline: {
					driver: 'scroll',
					loop: false,
					tracks: [
						{
							target: 'objects.hero.rotation.y',
							ease: 'linear',
							keys: [
								{ t: 0, v: -90 },
								{ t: 1, v: 90 },
							],
						},
						{
							target: 'objects.hero.position.y',
							ease: 'easeOutCubic',
							keys: [
								{ t: 0, v: -0.6 },
								{ t: 1, v: 0.6 },
							],
						},
					],
				},
			} as unknown as Partial<SceneDocument>),
	},
	{
		name: 'scrollDolly',
		displayName: 'Scroll Dolly',
		description: 'The camera pushes in toward the object as the section passes.',
		kind: 'scroll',
		build: () =>
			createSceneDocument({
				camera: { position: [0, 0, 7] },
				environment: { preset: 'studio' },
				lights: [
					{ id: 'key', type: 'directional', intensity: 2.4, position: [4, 5, 5] },
					{ id: 'rim', type: 'directional', intensity: 0.9, position: [-4, 1, -4] },
					{ id: 'ambient', type: 'ambient', intensity: 0.45 },
				],
				objects: [
					{
						id: 'hero',
						name: 'Hero',
						source: { kind: 'primitive', shape: 'icosahedron' },
						material: { color: '#38bdf8', metalness: 0.5, roughness: 0.25 },
					},
				],
				timeline: {
					driver: 'scroll',
					loop: false,
					tracks: [
						// The camera moves, not the object, which is what makes
						// this read as a dolly rather than as the object growing.
						{
							target: 'camera.position.z',
							ease: 'easeInOutCubic',
							keys: [
								{ t: 0, v: 7 },
								{ t: 1, v: 2.6 },
							],
						},
						{
							target: 'objects.hero.rotation.x',
							ease: 'linear',
							keys: [
								{ t: 0, v: 0 },
								{ t: 1, v: 120 },
							],
						},
					],
				},
			} as unknown as Partial<SceneDocument>),
	},
	{
		name: 'scrollRise',
		displayName: 'Scroll Rise',
		description: 'The object rises and grows into place, then settles.',
		kind: 'scroll',
		build: () =>
			createSceneDocument({
				camera: { position: [0, 0, 4.5] },
				environment: { preset: 'studio' },
				lights: [
					{ id: 'key', type: 'directional', intensity: 2.1, position: [3, 6, 4] },
					{ id: 'fill', type: 'directional', intensity: 0.6, position: [-4, 0, 3] },
					{ id: 'ambient', type: 'ambient', intensity: 0.55 },
				],
				objects: [
					{
						id: 'hero',
						name: 'Hero',
						source: { kind: 'primitive', shape: 'cylinder' },
						material: { color: '#a78bfa', metalness: 0.3, roughness: 0.4 },
					},
				],
				timeline: {
					driver: 'scroll',
					loop: false,
					tracks: [
						{
							target: 'objects.hero.position.y',
							ease: 'easeOutCubic',
							keys: [
								{ t: 0, v: -1.8 },
								{ t: 0.7, v: 0 },
								{ t: 1, v: 0 },
							],
						},
						{
							target: 'objects.hero.scale.x',
							ease: 'easeOutCubic',
							keys: [
								{ t: 0, v: 0.35 },
								{ t: 0.7, v: 1 },
								{ t: 1, v: 1 },
							],
						},
						{
							target: 'objects.hero.scale.y',
							ease: 'easeOutCubic',
							keys: [
								{ t: 0, v: 0.35 },
								{ t: 0.7, v: 1 },
								{ t: 1, v: 1 },
							],
						},
						{
							target: 'objects.hero.scale.z',
							ease: 'easeOutCubic',
							keys: [
								{ t: 0, v: 0.35 },
								{ t: 0.7, v: 1 },
								{ t: 1, v: 1 },
							],
						},
						{
							target: 'objects.hero.rotation.y',
							ease: 'linear',
							keys: [
								{ t: 0, v: -40 },
								{ t: 1, v: 40 },
							],
						},
					],
				},
			} as unknown as Partial<SceneDocument>),
	},
];

export const PRESETS_BY_NAME: ReadonlyMap<string, ScenePreset> = new Map(
	SCENE_PRESETS.map(p => [p.name, p]),
);

/** Build a preset by name, falling back rather than throwing on an unknown one. */
export function presetScene(name: string, fallback = 'aurora'): SceneDocument {
	const preset = PRESETS_BY_NAME.get(name) ?? PRESETS_BY_NAME.get(fallback);
	return preset ? preset.build() : createSceneDocument();
}

export const presetsFor = (kind: ScenePreset['kind']): ScenePreset[] =>
	SCENE_PRESETS.filter(p => p.kind === kind);
