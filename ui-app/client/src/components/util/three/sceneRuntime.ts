/**
 * Builds a three scene from a SceneDocument, and takes it apart again.
 *
 * Disposal is the reason this is one module rather than inline in each
 * component. three does not garbage collect GPU resources: a geometry, a
 * material or a texture dropped without .dispose() stays on the GPU for the
 * life of the context. A page editor where the author is tweaking a scene
 * rebuilds it on every keystroke, so a leak here is not slow, it is minutes.
 *
 * Everything takes the loaded bundle as an argument rather than importing
 * three, so the module graph stays honest about where the dependency enters.
 */

import { easingFor } from './easing';
import type { SceneDocument, SceneObject, TimelineTrack } from './sceneDocument';
import type { ThreeBundle } from './threeLoader';

const DEG = Math.PI / 180;

export interface SceneHandle {
	scene: any;
	camera: any;
	/** Scene object id to the three Object3D built for it. */
	objects: Map<string, any>;
	/** Shader id to its ShaderMaterial, so tracks can write uniforms. */
	materials: Map<string, any>;
	mixers: any[];
	dispose: () => void;
}

/* -------------------------------------------------------------------------- */
/* Track targets                                                               */
/* -------------------------------------------------------------------------- */

export interface ParsedTarget {
	root: 'objects' | 'shaders' | 'camera';
	id: string;
	path: string[];
}

/**
 * 'objects.hero.rotation.y' -> { root:'objects', id:'hero', path:['rotation','y'] }
 * 'camera.position.z'       -> { root:'camera',  id:'',     path:['position','z'] }
 */
export function parseTrackTarget(target: string): ParsedTarget | null {
	const parts = target.split('.').filter(Boolean);
	if (parts.length < 2) return null;
	const [root, ...rest] = parts;
	if (root === 'camera') return { root, id: '', path: rest };
	if (root === 'objects' || root === 'shaders') {
		if (rest.length < 1) return null;
		return { root, id: rest[0], path: rest.slice(1) };
	}
	return null;
}

/** Value of a track at normalised progress, interpolating between keys. */
export function sampleTrack(track: TimelineTrack, progress: number): number | null {
	const keys = track.keys;
	if (!keys.length) return null;
	if (keys.length === 1) return keys[0].v;

	const p = progress <= 0 ? 0 : progress >= 1 ? 1 : progress;
	if (p <= keys[0].t) return keys[0].v;
	if (p >= keys[keys.length - 1].t) return keys[keys.length - 1].v;

	let i = 0;
	while (i < keys.length - 1 && keys[i + 1].t < p) i++;
	const a = keys[i];
	const b = keys[i + 1];
	const span = b.t - a.t;
	// Two keys at the same t would divide by zero; take the later value.
	if (span <= 0) return b.v;
	const local = easingFor(track.ease)((p - a.t) / span);
	return a.v + (b.v - a.v) * local;
}

/* -------------------------------------------------------------------------- */
/* Building                                                                    */
/* -------------------------------------------------------------------------- */

function buildGeometry(three: ThreeBundle, obj: SceneObject): any {
	const T = three.THREE;
	switch (obj.source.shape) {
		case 'sphere':
			return new T.SphereGeometry(1, 48, 32);
		case 'plane':
			return new T.PlaneGeometry(2, 2);
		case 'torus':
			return new T.TorusGeometry(1, 0.35, 24, 72);
		case 'cylinder':
			return new T.CylinderGeometry(1, 1, 2, 48);
		case 'icosahedron':
			return new T.IcosahedronGeometry(1, 1);
		default:
			return new T.BoxGeometry(1, 1, 1);
	}
}

/**
 * Colour forms three's `Color.setStyle` understands.
 *
 * The functional branches MUST consume their closing paren. The first version
 * of this wrote `rgba?\(` inside a `^(...)$` group, so the `$` anchored the
 * whole alternation and that branch could only ever match the literal string
 * "rgb(" -- which is not a colour anyone writes. Every real
 * `rgb(94, 192, 164)` fell through to the warning and rendered as the grey
 * fallback, and since the platform's own colour picker emits exactly that
 * form, picking a colour from the swatch silently did nothing.
 *
 * `[^)]*` rather than a digit pattern on purpose: it accepts the comma form,
 * the modern space-separated form, percentages and a `/ alpha` suffix, and
 * leaves judging the contents to three, which is the thing that actually
 * parses them.
 */
const CSS_COLOR =
	/^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i;

/**
 * Whether three will be able to read this string as a colour.
 *
 * Exported as its own function so the forms can be tested without a GPU: the
 * bug above was in the pattern, and a test that needed a WebGL context would
 * never have been written.
 */
export function isParsableColor(value: unknown): boolean {
	const s = typeof value === 'string' ? value.trim() : '';
	return !!s && CSS_COLOR.test(s);
}

/**
 * Parse a colour, loudly.
 *
 * three's Color.setStyle warns to the console and silently leaves the colour
 * at white when it cannot parse a string. A theme variable written as
 * `<colorOne>` therefore renders as a white scene with one console line
 * nobody reads. This rejects it up front with a message that says what to do
 * instead, and falls back to something visible rather than to white, which is
 * easily mistaken for a working light scene.
 */
export function parseColor(three: ThreeBundle, value: unknown, fallback = '#888888'): any {
	const T = three.THREE;
	// Theme variables are resolved by the COMPONENT before a value reaches the
	// document, not here: importing themeExtractor into this module would make
	// components/index -> ShaderBackground -> sceneRuntime -> StoreContext ->
	// ThemeExtractor -> components/index a cycle, and would pull the whole
	// component tree into this module's unit tests.
	const s = typeof value === 'string' ? value.trim() : '';
	if (isParsableColor(s)) {
		try {
			return new T.Color(s);
		} catch {
			/* falls through to the warning below */
		}
	}
	if (s) {
		console.warn(
			`[three] Cannot parse the colour "${s}". A scene colour must be a CSS colour: ` +
				`#1e1b4b, rgb(30, 27, 75), hsl(248, 47%, 20%) or a named colour. To use a ` +
				`theme variable, bind the property to an expression like Theme.colorOne ` +
				`rather than writing <colorOne>, which is style-sheet syntax and is not ` +
				`resolved here.`,
		);
	}
	return new T.Color(fallback);
}

function buildShaderMaterial(three: ThreeBundle, doc: SceneDocument, shaderId: string): any {
	const shader = doc.shaders.find(s => s.id === shaderId);
	if (!shader) return null;
	const T = three.THREE;

	const uniforms: Record<string, { value: any }> = {
		// Bound for every shader so a document need not list them. The GLSL
		// must still declare them: three binds values to names the source
		// already declares, it does not inject declarations.
		uTime: { value: 0 },
		uResolution: { value: new T.Vector2(1, 1) },
		uPointer: { value: new T.Vector2(0, 0) },
		// 0 while the pointer has never been over the surface or has left it,
		// 1 while it is on. uPointer alone cannot express this: it is parked
		// far off-canvas at rest, which reads correctly only for a shader that
		// pushes AWAY from the pointer. A shader that pulls TOWARD it reads the
		// parked value as a real position and sends its effect off-screen, so
		// it renders flat until the pointer first arrives. Gate on this instead.
		uPointerActive: { value: 0 },
		uProgress: { value: 0 },
	};
	for (const u of shader.uniforms) {
		if (!u.name) continue;
		if (u.type === 'color') uniforms[u.name] = { value: parseColor(three, u.value) };
		else if (u.type === 'vec2') {
			const v = (u.value as number[]) ?? [];
			uniforms[u.name] = { value: new T.Vector2(v[0] ?? 0, v[1] ?? 0) };
		} else if (u.type === 'vec3') {
			const v = (u.value as number[]) ?? [];
			uniforms[u.name] = { value: new T.Vector3(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0) };
		} else if (u.type === 'vec4') {
			const v = (u.value as number[]) ?? [];
			uniforms[u.name] = {
				value: new T.Vector4(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, v[3] ?? 0),
			};
		} else uniforms[u.name] = { value: u.value };
	}

	return new T.ShaderMaterial({
		vertexShader:
			shader.vertex ||
			`varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}`,
		fragmentShader: shader.fragment,
		uniforms,
		transparent: true,
	});
}

function buildMaterial(three: ThreeBundle, doc: SceneDocument, obj: SceneObject): any {
	if (obj.material.shaderId) {
		const m = buildShaderMaterial(three, doc, obj.material.shaderId);
		if (m) return m;
		// A dangling shaderId is already reported by validate; falling through
		// to a standard material keeps something on screen either way.
	}
	const T = three.THREE;
	if (obj.source.kind === 'points') {
		return new T.PointsMaterial({
			color: parseColor(three, obj.material.color),
			size: 0.02,
			transparent: obj.material.transparent,
			opacity: obj.material.opacity,
			sizeAttenuation: true,
		});
	}
	return new T.MeshStandardMaterial({
		color: parseColor(three, obj.material.color),
		metalness: obj.material.metalness,
		roughness: obj.material.roughness,
		transparent: obj.material.transparent,
		opacity: obj.material.opacity,
		wireframe: obj.material.wireframe,
	});
}

/**
 * Seed one point. Split out and exported because the distributions are pure
 * maths with a classic trap in them, and that is worth testing directly.
 */
export function seedPoint(
	distribution: string,
	rnd: () => number,
	out: [number, number, number],
): void {
	// Direction is picked from the sphere correctly in every case: taking
	// phi = acos(2v - 1) rather than a uniform angle is what stops points
	// bunching at the poles. A naive uniform cube clipped to a sphere has the
	// same class of bug at the corners.
	const theta = 2 * Math.PI * rnd();
	const phi = Math.acos(2 * rnd() - 1);
	const sinPhi = Math.sin(phi);

	if (distribution === 'box') {
		out[0] = rnd() * 2 - 1;
		out[1] = rnd() * 2 - 1;
		out[2] = rnd() * 2 - 1;
		return;
	}
	if (distribution === 'disc') {
		// sqrt, not a raw uniform: without it the density piles up at the centre.
		const r = Math.sqrt(rnd());
		out[0] = r * Math.cos(theta);
		out[1] = r * Math.sin(theta);
		out[2] = (rnd() - 0.5) * 0.08;
		return;
	}
	// 'shell' sits on the surface; 'sphere' fills the volume. cbrt is the
	// volume-uniform radius, for the same reason sqrt is the area-uniform one.
	const r = distribution === 'shell' ? 1 : Math.cbrt(rnd());
	out[0] = r * sinPhi * Math.cos(theta);
	out[1] = r * sinPhi * Math.sin(theta);
	out[2] = r * Math.cos(phi);
}

function buildPoints(three: ThreeBundle, obj: SceneObject, material: any): any {
	const T = three.THREE;
	const count = obj.source.count;
	const positions = new Float32Array(count * 3);
	// A stable per-point random value, so a shader can give each particle its
	// own phase and size without needing a texture lookup.
	const seeds = new Float32Array(count);
	const scratch: [number, number, number] = [0, 0, 0];

	for (let i = 0; i < count; i++) {
		seedPoint(obj.source.distribution, Math.random, scratch);
		positions[i * 3] = scratch[0];
		positions[i * 3 + 1] = scratch[1];
		positions[i * 3 + 2] = scratch[2];
		seeds[i] = Math.random();
	}

	const geometry = new T.BufferGeometry();
	geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
	geometry.setAttribute('aSeed', new T.BufferAttribute(seeds, 1));
	return new T.Points(geometry, material);
}

function applyTransform(node: any, obj: SceneObject): void {
	const t = obj.transform;
	node.position.set(t.position[0], t.position[1], t.position[2]);
	// Documents store degrees: radians in hand-written JSON are a trap, and the
	// agent writes these too.
	node.rotation.set(t.rotation[0] * DEG, t.rotation[1] * DEG, t.rotation[2] * DEG);
	node.scale.set(t.scale[0], t.scale[1], t.scale[2]);
	node.visible = obj.visible;
}

function buildLight(three: ThreeBundle, l: SceneDocument['lights'][number]): any {
	const T = three.THREE;
	const color = parseColor(three, l.color);
	let light: any;
	switch (l.type) {
		case 'ambient':
			light = new T.AmbientLight(color, l.intensity);
			break;
		case 'point':
			light = new T.PointLight(color, l.intensity);
			break;
		case 'spot':
			light = new T.SpotLight(color, l.intensity);
			break;
		case 'hemisphere':
			light = new T.HemisphereLight(color, new T.Color('#444444'), l.intensity);
			break;
		default:
			light = new T.DirectionalLight(color, l.intensity);
	}
	light.position.set(l.position[0], l.position[1], l.position[2]);
	return light;
}

export function buildCamera(three: ThreeBundle, doc: SceneDocument, aspect: number): any {
	const T = three.THREE;
	const c = doc.camera;

	// Fixed -1..1 on both axes, so a PlaneGeometry(2,2) fills the frame exactly
	// at any aspect. Deliberately NOT aspect-corrected: correcting it is what
	// leaves the backdrop short of the left and right edges on a wide box.
	if (c.type === 'fullscreen') {
		const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		camera.position.set(0, 0, 1);
		// Read by resizeCamera, which must leave this frustum alone.
		camera.userData.fullscreen = true;
		return camera;
	}

	const camera =
		c.type === 'orthographic'
			? new T.OrthographicCamera(-aspect, aspect, 1, -1, c.near, c.far)
			: new T.PerspectiveCamera(c.fov, aspect, c.near, c.far);
	camera.position.set(c.position[0], c.position[1], c.position[2]);
	camera.lookAt(new T.Vector3(c.target[0], c.target[1], c.target[2]));
	return camera;
}

/**
 * Build the scene. Anything asynchronous (glTF, HDRI) is loaded afterwards by
 * the component, so that the first frame draws immediately rather than after a
 * download.
 */
export function buildScene(three: ThreeBundle, doc: SceneDocument, aspect: number): SceneHandle {
	const T = three.THREE;
	const scene = new T.Scene();
	if (doc.environment.backgroundColor) {
		scene.background = parseColor(three, doc.environment.backgroundColor);
	}

	const objects = new Map<string, any>();
	const materials = new Map<string, any>();
	const disposables: any[] = [];

	for (const l of doc.lights) scene.add(buildLight(three, l));

	for (const obj of doc.objects) {
		// gltf is attached later by the component once it has downloaded.
		if (obj.source.kind === 'gltf') continue;

		const material = buildMaterial(three, doc, obj);
		if (obj.material.shaderId) materials.set(obj.material.shaderId, material);
		disposables.push(material);

		let node: any;
		if (obj.source.kind === 'points') {
			node = buildPoints(three, obj, material);
			disposables.push(node.geometry);
		} else if (obj.source.kind === 'quad') {
			const geometry = new T.PlaneGeometry(2, 2);
			disposables.push(geometry);
			node = new T.Mesh(geometry, material);
		} else {
			const geometry = buildGeometry(three, obj);
			disposables.push(geometry);
			node = new T.Mesh(geometry, material);
		}

		applyTransform(node, obj);
		// Read back by interactionBridge.resolveSceneObjectId after a raycast.
		node.userData.sceneObjectId = obj.id;
		scene.add(node);
		objects.set(obj.id, node);
	}

	const camera = buildCamera(three, doc, aspect);

	return {
		scene,
		camera,
		objects,
		materials,
		mixers: [],
		dispose: () => {
			for (const d of disposables) {
				try {
					d.dispose?.();
				} catch {
					// Already disposed, or a lost context. Keep going: one
					// failure must not strand the rest on the GPU.
				}
			}
			disposeSceneGraph(scene);
			objects.clear();
			materials.clear();
		},
	};
}

/**
 * Walk what is actually in the scene and dispose it. Belt and braces alongside
 * the disposables list, because a glTF attached after the build contributes
 * geometries and textures this module never saw.
 */
export function disposeSceneGraph(root: any): void {
	if (!root?.traverse) return;
	const seen = new Set<any>();
	// An HDRI hangs off the scene itself, not off any node, so traverse never
	// reaches it and it would survive every dispose for the life of the tab.
	for (const slot of ['environment', 'background'] as const) {
		const t = root[slot];
		if (t?.isTexture && !seen.has(t)) {
			seen.add(t);
			try {
				t.dispose?.();
			} catch {
				// Already gone.
			}
		}
		if (t?.isTexture) root[slot] = null;
	}
	root.traverse((node: any) => {
		if (node.geometry && !seen.has(node.geometry)) {
			seen.add(node.geometry);
			try {
				node.geometry.dispose?.();
			} catch {
				/* already gone */
			}
		}
		const mats = Array.isArray(node.material) ? node.material : [node.material];
		for (const m of mats) {
			if (!m || seen.has(m)) continue;
			seen.add(m);
			// Textures hold the most GPU memory of anything here, and a
			// material.dispose() does NOT release the maps hanging off it.
			for (const key of Object.keys(m)) {
				const v = (m as any)[key];
				if (v && v.isTexture) {
					try {
						v.dispose();
					} catch {
						/* already gone */
					}
				}
			}
			try {
				m.dispose?.();
			} catch {
				/* already gone */
			}
		}
	});
	root.clear?.();
}

/* -------------------------------------------------------------------------- */
/* Driving                                                                     */
/* -------------------------------------------------------------------------- */

function setNested(target: any, path: string[], value: number, degrees: boolean): void {
	if (!target || !path.length) return;
	let node = target;
	for (let i = 0; i < path.length - 1; i++) {
		node = node?.[path[i]];
		if (!node) return;
	}
	const leaf = path[path.length - 1];
	if (node && leaf in node) node[leaf] = degrees ? value * DEG : value;
}

/** Apply every track at the given normalised progress. */
export function applyTimeline(handle: SceneHandle, doc: SceneDocument, progress: number): void {
	for (const track of doc.timeline.tracks) {
		const parsed = parseTrackTarget(track.target);
		if (!parsed) continue;
		const value = sampleTrack(track, progress);
		if (value === null) continue;

		if (parsed.root === 'camera') {
			setNested(handle.camera, parsed.path, value, parsed.path[0] === 'rotation');
		} else if (parsed.root === 'objects') {
			const node = handle.objects.get(parsed.id);
			setNested(node, parsed.path, value, parsed.path[0] === 'rotation');
		} else {
			const material = handle.materials.get(parsed.id);
			const uniform = material?.uniforms?.[parsed.path[0]];
			if (uniform) uniform.value = value;
		}
	}
}

/** Per-frame uniforms every shader can rely on. */
export function updateSharedUniforms(
	handle: SceneHandle,
	values: {
		time?: number;
		width?: number;
		height?: number;
		pointer?: { x: number; y: number };
		pointerActive?: boolean;
		progress?: number;
	},
): void {
	for (const material of handle.materials.values()) {
		const u = material?.uniforms;
		if (!u) continue;
		if (values.time !== undefined && u.uTime) u.uTime.value = values.time;
		if (values.progress !== undefined && u.uProgress) u.uProgress.value = values.progress;
		if (u.uResolution && values.width !== undefined && values.height !== undefined) {
			u.uResolution.value.set(values.width, values.height);
		}
		if (u.uPointer && values.pointer) {
			u.uPointer.value.set(values.pointer.x, values.pointer.y);
		}
		if (u.uPointerActive && values.pointerActive !== undefined) {
			u.uPointerActive.value = values.pointerActive ? 1 : 0;
		}
	}
}

/** Resize a camera for a new aspect ratio. */
export function resizeCamera(camera: any, width: number, height: number): void {
	const aspect = height > 0 ? width / height : 1;
	// A fullscreen backdrop camera must keep its fixed -1..1 frustum. Correcting
	// it for aspect is exactly what stops the quad reaching the side edges.
	if (camera.userData?.fullscreen) return;
	if (camera.isOrthographicCamera) {
		camera.left = -aspect;
		camera.right = aspect;
		camera.top = 1;
		camera.bottom = -1;
	} else {
		camera.aspect = aspect;
	}
	camera.updateProjectionMatrix?.();
}
