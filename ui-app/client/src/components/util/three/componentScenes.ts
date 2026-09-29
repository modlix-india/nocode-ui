/**
 * Turning a scene component's flat properties into a SceneDocument.
 *
 * One module rather than one function per component file, because TWO callers
 * need this and they cannot reach each other:
 *
 *  - the Lazy* component, which renders the document; and
 *  - SceneContentEditor, which resolves a preset into a stored document the
 *    first time someone opens the Scene Editor.
 *
 * When the editor did not share this, opening it silently discarded every flat
 * override the author had set: a ScrollScene with a pink object came back grey,
 * because the editor rebuilt the preset from scratch and knew nothing about the
 * `colorA` property sitting next to it in the panel.
 *
 * Pure, and imports nothing from three, so the editor can call it without
 * pulling the renderer into the page editor's bundle.
 */

import { lightingRig, presetScene } from './presets';
import { createSceneDocument, normalizeSceneDocument, type SceneDocument } from './sceneDocument';

/** Apply a uniform across every shader in the document, adding it if absent. */
function setUniformEverywhere(
	doc: SceneDocument,
	name: string,
	value: unknown,
	type: 'color' | 'float',
) {
	if (value === undefined || value === null || value === '') return;
	for (const shader of doc.shaders) {
		const existing = shader.uniforms.find(u => u.name === name);
		if (existing) existing.value = value as any;
		else shader.uniforms.push({ name, type, value: value as any });
	}
}

export interface ShaderBackgroundInput {
	preset?: string;
	fragmentShader?: string;
	colorA?: string;
	colorB?: string;
	colorC?: string;
}

export function shaderBackgroundDocument(o: ShaderBackgroundInput): SceneDocument {
	const preset = o.preset ?? 'aurora';
	const doc =
		preset === 'custom'
			? createSceneDocument({
					camera: { type: 'fullscreen', position: [0, 0, 1] },
					environment: { preset: '' },
					lights: [],
					shaders: [{ id: 'custom', fragment: o.fragmentShader ?? '', uniforms: [] }],
					objects: [
						{
							id: 'backdrop',
							name: 'Backdrop',
							source: { kind: 'quad' },
							material: { shaderId: 'custom' },
						},
					],
				} as unknown as Partial<SceneDocument>)
			: presetScene(preset);

	// Colours are overrides, not replacements: a preset that uses only two
	// keeps its third, and an empty property leaves the preset's own value.
	setUniformEverywhere(doc, 'uColorA', o.colorA, 'color');
	setUniformEverywhere(doc, 'uColorB', o.colorB, 'color');
	setUniformEverywhere(doc, 'uColorC', o.colorC, 'color');
	return doc;
}

export interface ParticleFieldInput {
	preset?: string;
	count?: number;
	distribution?: string;
	colorA?: string;
	colorB?: string;
	particleSize?: number;
	pointerStrength?: number;
}

export function particleFieldDocument(o: ParticleFieldInput): SceneDocument {
	const doc = presetScene(o.preset ?? 'orbField', 'orbField');
	const field = doc.objects[0];

	if (field) {
		if (typeof o.count === 'number' && o.count > 0) field.source.count = Math.round(o.count);
		if (o.distribution) field.source.distribution = o.distribution as any;
	}

	setUniformEverywhere(doc, 'uColorA', o.colorA, 'color');
	setUniformEverywhere(doc, 'uColorB', o.colorB, 'color');
	setUniformEverywhere(
		doc,
		'uSize',
		typeof o.particleSize === 'number' ? o.particleSize : undefined,
		'float',
	);
	// Zero is meaningful here (it turns the pointer effect off), so it must not
	// be filtered out the way an empty colour string is.
	if (typeof o.pointerStrength === 'number') {
		setUniformEverywhere(doc, 'uPointerStrength', o.pointerStrength, 'float');
	}

	// Re-normalised, not returned as-is: `count` arrives straight from a user
	// property and a typo of 20000000 would otherwise reach the GPU untouched.
	// This puts it back through the same 200k clamp and enum fallback that any
	// other document goes through.
	return normalizeSceneDocument(doc);
}

export interface ModelViewerInput {
	modelUrl?: string;
	environmentPreset?: string;
	hdriUrl?: string;
	showEnvironment?: boolean;
	controls?: boolean;
	zoom?: number;
	cameraHeight?: number;
	fov?: number;
}

/**
 * With no model URL the object is still declared, with an empty url. That looks
 * pointless but is what makes the empty state honest: `validateSceneDocument`
 * then reports "is a gltf source with no url, so nothing loads", which is the
 * true reason the canvas is empty, instead of the scene simply having no objects
 * and looking correctly built.
 */
export function modelViewerDocument(o: ModelViewerInput): SceneDocument {
	return normalizeSceneDocument(
		createSceneDocument({
			camera: {
				type: 'perspective',
				fov: typeof o.fov === 'number' ? o.fov : 45,
				position: [
					0,
					typeof o.cameraHeight === 'number' ? o.cameraHeight : 0.6,
					o.zoom ?? 4,
				],
				target: [0, 0, 0],
				controls: o.controls !== false,
			},
			environment: {
				preset: o.hdriUrl ? '' : (o.environmentPreset ?? 'studio'),
				hdriUrl: o.hdriUrl ?? '',
				background: !!o.showEnvironment && !!o.hdriUrl,
			},
			// An HDRI lights the whole scene on its own, and stacking a rig on
			// top of it washes out exactly the reflections it was added for.
			lights: o.hdriUrl ? [] : lightingRig(o.environmentPreset),
			objects: [
				{
					id: 'model',
					name: 'Model',
					source: { kind: 'gltf', url: o.modelUrl ?? '' },
				},
			],
		} as unknown as Partial<SceneDocument>),
	);
}

export interface ScrollSceneInput {
	preset?: string;
	colorA?: string;
}

export function scrollSceneDocument(o: ScrollSceneInput): SceneDocument {
	const doc = presetScene(o.preset ?? 'scrollSpin', 'scrollSpin');
	if (o.colorA) {
		for (const obj of doc.objects) obj.material.color = o.colorA;
	}
	// The driver is forced rather than trusted: this component's whole job is to
	// be scroll-driven, and a preset picked from another kind (or hand-edited)
	// would otherwise sit on a clock and ignore the scroll entirely, which looks
	// like the scroll wiring being broken.
	doc.timeline.driver = 'scroll';
	return normalizeSceneDocument(doc);
}

/**
 * The document a component of this type would build from these properties.
 *
 * Used by the Scene Editor to seed itself, which is why it takes a plain
 * property bag rather than the component's resolved props: the editor reads
 * literal values straight off the component definition. A property bound to an
 * expression has no literal value there, so the seed falls back to the preset's
 * own. That is a real limitation and the right one: the editor cannot evaluate
 * a page expression, and guessing would bake one frame of page data into the
 * stored scene for good.
 */
export function documentForComponent(
	componentType: string,
	props: Record<string, unknown>,
): SceneDocument {
	switch (componentType) {
		case 'ShaderBackground':
			return shaderBackgroundDocument(props as ShaderBackgroundInput);
		case 'ParticleField':
			return particleFieldDocument(props as ParticleFieldInput);
		case 'ModelViewer':
			return modelViewerDocument(props as ModelViewerInput);
		case 'ScrollScene':
			return scrollSceneDocument(props as ScrollSceneInput);
		default:
			return createSceneDocument();
	}
}
