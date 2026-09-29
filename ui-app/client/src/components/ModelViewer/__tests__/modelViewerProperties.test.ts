import { propertiesDefinition, stylePropertiesDefinition } from '../modelViewerProperties';
import { LIGHTING_RIGS, lightingRig } from '../../util/three/presets';

const prop = (name: string) => propertiesDefinition.find(p => p.name === name);

describe('lighting enum', () => {
	/**
	 * Written out literally because the catalog generator reads this file with
	 * the TypeScript AST and cannot evaluate a computed list. A mapped list
	 * reaches the catalog as nothing, and the agent then never learns the
	 * options exist -- which is exactly what happened to the preset enum in
	 * Phase 1.
	 */
	const enumNames = (prop('environmentPreset')?.enumValues ?? []).map(e => e.name);

	it('offers exactly the rigs the runtime can build', () => {
		expect([...enumNames].sort()).toEqual(Object.keys(LIGHTING_RIGS).sort());
	});

	it('defaults to a rig that exists', () => {
		expect(LIGHTING_RIGS[prop('environmentPreset')?.defaultValue]).toBeDefined();
	});
});

describe('lighting rigs', () => {
	it('falls back to studio rather than to an unlit scene', () => {
		// An unknown name must not produce a black canvas with no error.
		expect(lightingRig('nonsense')).toEqual(LIGHTING_RIGS.studio);
		expect(lightingRig(undefined).length).toBeGreaterThan(0);
	});

	it('hands out a copy, not the shared rig', () => {
		// The caller puts this straight into a document the Scene Editor may
		// mutate; a shared array would leak one scene's edits into every other
		// scene using the same rig, for the life of the tab.
		const a = lightingRig('studio');
		a[0].intensity = 99;
		a[0].position[0] = 99;
		expect(LIGHTING_RIGS.studio[0].intensity).not.toBe(99);
		expect(LIGHTING_RIGS.studio[0].position[0]).not.toBe(99);
	});

	it('gives every rig at least one light', () => {
		for (const [name, rig] of Object.entries(LIGHTING_RIGS)) {
			expect(rig.length).toBeGreaterThan(0);
			expect(name).toBeTruthy();
		}
	});
});

describe('property surface', () => {
	it('exposes the events a page needs', () => {
		for (const name of ['onReady', 'onModelLoad', 'onError', 'onMeshClick', 'onMeshHover']) {
			expect(prop(name)).toBeDefined();
		}
	});

	it('offers a fallback for the no-WebGL case', () => {
		expect(prop('poster')).toBeDefined();
		expect(prop('fallbackColor')).toBeDefined();
	});

	it('says plainly that compressed meshes do not load', () => {
		// DRACO and KTX2 need decoder files this build does not ship, and such
		// a model loads as nothing with no error the author can see.
		expect(prop('modelUrl')?.description).toMatch(/DRACO|KTX2/);
	});

	it('warns that an HDRI is a real download', () => {
		expect(prop('hdriUrl')?.description).toMatch(/download|sizeable/i);
	});

	it('warns that hover picking costs a raycast per pointer move', () => {
		expect(prop('onMeshHover')?.description).toMatch(/raycast/i);
	});

	it('explains why camera distance is portable between models', () => {
		// It only means the same thing across files because autoFit normalises
		// scale first, and that is not guessable from the name.
		expect(prop('zoom')?.description).toMatch(/scaled|common size/i);
	});

	it('gives every numeric slider a usable range', () => {
		const sliders = propertiesDefinition.filter(
			p => p.min !== undefined || p.max !== undefined,
		);
		expect(sliders.length).toBeGreaterThan(0);
		for (const p of sliders) {
			expect(typeof p.min).toBe('number');
			expect(typeof p.max).toBe('number');
			expect(p.max!).toBeGreaterThan(p.min!);
			if (p.defaultValue !== undefined) {
				expect(p.defaultValue).toBeGreaterThanOrEqual(p.min!);
				expect(p.defaultValue).toBeLessThanOrEqual(p.max!);
			}
		}
	});

	it('has no duplicate property names', () => {
		const names = propertiesDefinition.map(p => p.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('names a style target for every sub-component it renders', () => {
		for (const t of ['container', 'poster', 'overlay']) {
			expect(stylePropertiesDefinition[t]).toBeDefined();
		}
	});
});
