import { SCENE_PRESETS, PRESETS_BY_NAME, presetScene, presetsFor } from '../presets';
import { validateSceneDocument } from '../sceneDocument';

describe('built-in presets', () => {
	it('ships at least one preset per component kind', () => {
		for (const kind of ['background', 'particles', 'model', 'scroll'] as const) {
			expect(presetsFor(kind).length).toBeGreaterThan(0);
		}
	});

	it('has unique names, since they address a preset from the catalog', () => {
		const names = SCENE_PRESETS.map(p => p.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it.each(SCENE_PRESETS.map(p => p.name))('%s validates clean', name => {
		// A preset with validation errors is a scene that ships broken by
		// default, which is worse than having no preset at all.
		expect(validateSceneDocument(PRESETS_BY_NAME.get(name)!.build())).toEqual([]);
	});

	it.each(SCENE_PRESETS.map(p => p.name))('%s builds something renderable', name => {
		const doc = PRESETS_BY_NAME.get(name)!.build();
		expect(doc.objects.length).toBeGreaterThan(0);
		expect(doc.objects.some(o => o.visible)).toBe(true);
	});

	it.each(SCENE_PRESETS.map(p => p.name))('%s is independent between builds', name => {
		// The gallery builds a preset per click. Sharing nested state would let
		// edits to one scene leak into the next one created.
		const a = PRESETS_BY_NAME.get(name)!.build();
		const b = PRESETS_BY_NAME.get(name)!.build();
		a.objects[0].transform.position[0] = 999;
		expect(b.objects[0].transform.position[0]).not.toBe(999);
	});

	it('declares in GLSL every uniform its shaders actually use', () => {
		// three binds values to names the source declares; it does not inject
		// declarations. A uniform used but not declared fails to compile and
		// the scene renders black with only a console warning.
		for (const preset of SCENE_PRESETS) {
			for (const shader of preset.build().shaders) {
				for (const u of ['uTime', 'uResolution', 'uPointer', 'uProgress']) {
					const used = new RegExp(`\\b${u}\\b`).test(shader.fragment);
					if (!used) continue;
					const declared = new RegExp(`uniform\\s+\\w+\\s+${u}\\s*;`).test(
						shader.fragment,
					);
					expect(`${preset.name}:${u}:${declared}`).toBe(`${preset.name}:${u}:true`);
				}
			}
		}
	});

	it('gives every shader an entry point', () => {
		for (const preset of SCENE_PRESETS) {
			for (const shader of preset.build().shaders) {
				expect(shader.fragment).toMatch(/void\s+main\s*\(/);
				expect(shader.vertex).toMatch(/void\s+main\s*\(/);
			}
		}
	});
});

describe('presetScene', () => {
	it('builds a named preset', () => {
		expect(presetScene('aurora').shaders[0].id).toBe('aurora');
	});

	it('falls back rather than throwing on a name from a hand-edited document', () => {
		expect(presetScene('doesNotExist').shaders[0].id).toBe('aurora');
	});

	it('still returns a document when even the fallback is unknown', () => {
		expect(presetScene('nope', 'alsoNope').version).toBeGreaterThan(0);
	});
});
