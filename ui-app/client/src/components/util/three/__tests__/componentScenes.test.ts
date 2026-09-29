import {
	documentForComponent,
	modelViewerDocument,
	particleFieldDocument,
	scrollSceneDocument,
	shaderBackgroundDocument,
} from '../componentScenes';
import { validateSceneDocument } from '../sceneDocument';

const uniform = (doc: any, name: string) =>
	doc.shaders.flatMap((s: any) => s.uniforms).find((u: any) => u.name === name)?.value;

/**
 * These builders exist in one module because TWO callers need them and cannot
 * reach each other: the Lazy* component, and the Scene Editor when it resolves
 * a preset into a stored document. While the editor did not share them it
 * silently discarded every flat override beside the preset in the panel, and
 * the author's only clue was that their colour had gone.
 */
describe('documentForComponent carries the flat overrides', () => {
	it('keeps a ScrollScene object colour', () => {
		const doc = documentForComponent('ScrollScene', {
			preset: 'scrollSpin',
			colorA: '#f472b6',
		});
		expect(doc.objects[0].material.color).toBe('#f472b6');
	});

	it('keeps ShaderBackground colours', () => {
		const doc = documentForComponent('ShaderBackground', {
			preset: 'aurora',
			colorA: '#111111',
			colorC: '#333333',
		});
		expect(uniform(doc, 'uColorA')).toBe('#111111');
		expect(uniform(doc, 'uColorC')).toBe('#333333');
		// Untouched colours keep the preset's own value rather than blanking.
		expect(uniform(doc, 'uColorB')).toBeTruthy();
	});

	it('keeps a ParticleField count and shape', () => {
		const doc = documentForComponent('ParticleField', {
			preset: 'orbField',
			count: 777,
			distribution: 'disc',
		});
		expect(doc.objects[0].source.count).toBe(777);
		expect(doc.objects[0].source.distribution).toBe('disc');
	});

	it('keeps a ModelViewer url and camera', () => {
		const doc = documentForComponent('ModelViewer', {
			modelUrl: 'files/x.glb',
			zoom: 9,
			fov: 30,
		});
		expect(doc.objects[0].source.url).toBe('files/x.glb');
		expect(doc.camera.position[2]).toBe(9);
		expect(doc.camera.fov).toBe(30);
	});

	it('returns an empty document for an unknown component rather than throwing', () => {
		const doc = documentForComponent('Nonsense', { preset: 'aurora' });
		expect(doc.objects).toEqual([]);
	});
});

describe('builders produce documents that validate', () => {
	it.each([
		['ShaderBackground', shaderBackgroundDocument({ preset: 'aurora' })],
		['ParticleField', particleFieldDocument({ preset: 'orbField' })],
		['ScrollScene', scrollSceneDocument({ preset: 'scrollSpin' })],
	])('%s', (_name, doc) => {
		expect(validateSceneDocument(doc)).toEqual([]);
	});

	it('ModelViewer with no url says so, rather than looking correctly empty', () => {
		// An empty gltf object is deliberate: it makes validate report the real
		// reason the canvas is blank instead of the scene simply having no
		// objects and appearing to be built correctly.
		const problems = validateSceneDocument(modelViewerDocument({}));
		expect(problems.join(' ')).toMatch(/no url/i);
	});

	it('ModelViewer with a url validates clean', () => {
		expect(validateSceneDocument(modelViewerDocument({ modelUrl: 'a.glb' }))).toEqual([]);
	});
});

describe('ParticleField clamping still applies through the shared builder', () => {
	it('caps a count typed straight into the property panel', () => {
		const doc = particleFieldDocument({ count: 9e9 });
		expect(doc.objects[0].source.count).toBeLessThanOrEqual(200000);
	});

	it('keeps a pointer strength of exactly zero, which turns the effect off', () => {
		// Zero is meaningful here and must not be filtered out the way an empty
		// colour string is.
		expect(uniform(particleFieldDocument({ pointerStrength: 0 }), 'uPointerStrength')).toBe(0);
	});
});

describe('ScrollScene always ends up scroll-driven', () => {
	it.each(['aurora', 'orbField', 'studio', 'nonsense'])(
		'forces the driver even when seeded from %s',
		preset => {
			// A preset from another kind would otherwise sit on a clock and
			// ignore the scroll, which looks like the scroll wiring being broken.
			expect(scrollSceneDocument({ preset }).timeline.driver).toBe('scroll');
		},
	);
});
