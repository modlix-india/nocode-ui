import { propertiesDefinition, stylePropertiesDefinition } from '../shaderBackgroundProperties';
import { SCENE_PRESETS, PRESETS_BY_NAME } from '../../util/three/presets';

const prop = (name: string) => propertiesDefinition.find(p => p.name === name);

describe('preset enum', () => {
	/**
	 * The enum is written out literally because the catalog generator reads
	 * this file with the TypeScript AST and cannot evaluate a computed list.
	 * These tests are what stops the hand-written copy drifting from the real
	 * preset registry, which would reach the agent as a preset that does not
	 * exist, or hide one that does.
	 */
	const enumNames = (prop('preset')?.enumValues ?? []).map(e => e.name);
	const backgroundPresets = SCENE_PRESETS.filter(p => p.kind === 'background').map(p => p.name);

	it('offers every background preset that exists', () => {
		for (const name of backgroundPresets) expect(enumNames).toContain(name);
	});

	it('offers no preset that does not exist', () => {
		for (const name of enumNames) {
			if (name === 'custom') continue;
			expect(PRESETS_BY_NAME.has(name)).toBe(true);
		}
	});

	it('offers exactly the background presets plus custom, with no duplicates', () => {
		expect(new Set(enumNames).size).toBe(enumNames.length);
		expect(enumNames.sort()).toEqual([...backgroundPresets, 'custom'].sort());
	});

	it('keeps the display names in step with the registry', () => {
		for (const e of prop('preset')?.enumValues ?? []) {
			if (e.name === 'custom') continue;
			expect(e.displayName).toBe(PRESETS_BY_NAME.get(e.name)!.displayName);
		}
	});

	it('defaults to a preset that exists', () => {
		expect(PRESETS_BY_NAME.has(prop('preset')?.defaultValue)).toBe(true);
	});
});

describe('property surface', () => {
	it('exposes the events a page needs to react to the scene', () => {
		for (const name of ['onReady', 'onError', 'onClick']) {
			expect(prop(name)).toBeDefined();
		}
	});

	it('exposes a fallback for the case WebGL is unavailable', () => {
		// Without one, an unsupported browser gets an empty box.
		expect(prop('poster')).toBeDefined();
		expect(prop('fallbackColor')).toBeDefined();
	});

	it('has no duplicate property names', () => {
		const names = propertiesDefinition.map(p => p.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('names a style target for every sub-component the component renders', () => {
		for (const target of ['container', 'poster', 'overlay']) {
			expect(stylePropertiesDefinition[target]).toBeDefined();
		}
	});

	it('tells the author that custom uniforms still need declaring in GLSL', () => {
		// The trap that cost a debugging round: three binds values to names the
		// source declares, it does not add declarations.
		expect(prop('fragmentShader')?.description).toMatch(/declare/i);
	});
});
