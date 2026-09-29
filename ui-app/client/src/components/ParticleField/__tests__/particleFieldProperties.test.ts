import { propertiesDefinition, stylePropertiesDefinition } from '../particleFieldProperties';
import { PRESETS_BY_NAME, SCENE_PRESETS } from '../../util/three/presets';

const prop = (name: string) => propertiesDefinition.find(p => p.name === name);

describe('preset enum', () => {
	/**
	 * Written out literally because the catalog generator reads this file with
	 * the TypeScript AST and cannot evaluate a computed list. Phase 1 shipped a
	 * mapped list and only `custom` reached the catalog, so the agent never
	 * learned the presets existed. These tests are what stop that recurring.
	 */
	const enumNames = (prop('preset')?.enumValues ?? []).map(e => e.name);
	const particlePresets = SCENE_PRESETS.filter(p => p.kind === 'particles').map(p => p.name);

	it('offers every particle preset that exists', () => {
		for (const name of particlePresets) expect(enumNames).toContain(name);
	});

	it('offers exactly those, with no duplicates and nothing invented', () => {
		expect(new Set(enumNames).size).toBe(enumNames.length);
		expect([...enumNames].sort()).toEqual([...particlePresets].sort());
	});

	it('keeps display names in step with the registry', () => {
		for (const e of prop('preset')?.enumValues ?? []) {
			expect(e.displayName).toBe(PRESETS_BY_NAME.get(e.name)!.displayName);
		}
	});

	it('defaults to a preset that exists and is a particle one', () => {
		const dv = prop('preset')?.defaultValue;
		expect(PRESETS_BY_NAME.get(dv)?.kind).toBe('particles');
	});
});

describe('distribution enum', () => {
	it('matches the distributions the runtime actually seeds', () => {
		const names = (prop('distribution')?.enumValues ?? []).map(e => e.name).sort();
		expect(names).toEqual(['box', 'disc', 'shell', 'sphere']);
	});
});

describe('property surface', () => {
	it('exposes the events a page needs', () => {
		for (const name of ['onReady', 'onError', 'onClick']) expect(prop(name)).toBeDefined();
	});

	it('offers a fallback for the no-WebGL case', () => {
		expect(prop('poster')).toBeDefined();
		expect(prop('fallbackColor')).toBeDefined();
	});

	it('warns that particle count is a whole-page cost, not a local one', () => {
		expect(prop('count')?.description).toMatch(/whole page|200,000/i);
	});

	it('documents that a negative pointer strength attracts', () => {
		// The sign carrying the mode is not guessable from the name alone.
		expect(prop('pointerStrength')?.description).toMatch(/negative/i);
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
