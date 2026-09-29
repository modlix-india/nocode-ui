import { propertiesDefinition, stylePropertiesDefinition } from '../scrollSceneProperties';
import { PRESETS_BY_NAME, SCENE_PRESETS } from '../../util/three/presets';

const prop = (name: string) => propertiesDefinition.find(p => p.name === name);
const scrollPresets = SCENE_PRESETS.filter(p => p.kind === 'scroll').map(p => p.name);

describe('preset enum', () => {
	/**
	 * Written out literally because the catalog generator reads this file with
	 * the TypeScript AST and cannot evaluate a computed list. Phase 1 shipped a
	 * mapped list and only `custom` reached the catalog, so the agent never
	 * learned the presets existed. These tests are what stop that recurring.
	 */
	const enumNames = (prop('preset')?.enumValues ?? []).map(e => e.name);

	it('offers exactly the scroll presets that exist', () => {
		expect([...enumNames].sort()).toEqual([...scrollPresets].sort());
	});

	it('keeps display names in step with the registry', () => {
		for (const e of prop('preset')?.enumValues ?? []) {
			expect(e.displayName).toBe(PRESETS_BY_NAME.get(e.name)!.displayName);
		}
	});

	it('defaults to a preset that exists and is a scroll one', () => {
		expect(PRESETS_BY_NAME.get(prop('preset')?.defaultValue)?.kind).toBe('scroll');
	});
});

describe('scroll presets are actually scroll-driven', () => {
	it.each(scrollPresets)('%s carries a scroll timeline with tracks', name => {
		// A scroll preset with no tracks renders a perfectly still scene and
		// looks exactly like the scroll wiring being broken.
		const doc = PRESETS_BY_NAME.get(name)!.build();
		expect(doc.timeline.driver).toBe('scroll');
		expect(doc.timeline.tracks.length).toBeGreaterThan(0);
	});

	it.each(scrollPresets)('%s actually moves between its first and last key', name => {
		// Keys that all hold the same value are a timeline that animates
		// nothing, which no other test would catch.
		const doc = PRESETS_BY_NAME.get(name)!.build();
		const moves = doc.timeline.tracks.some(t => {
			const vs = t.keys.map(k => k.v);
			return Math.max(...vs) !== Math.min(...vs);
		});
		expect(moves).toBe(true);
	});
});

describe('axis and mode enums', () => {
	it('offers both axes, since horizontal is the point of having an axis', () => {
		expect((prop('axis')?.enumValues ?? []).map(e => e.name).sort()).toEqual([
			'block',
			'inline',
		]);
	});

	it('offers both measurement modes the scroll driver implements', () => {
		expect((prop('mode')?.enumValues ?? []).map(e => e.name).sort()).toEqual([
			'scroll',
			'view',
		]);
	});

	it('offers every scroller the driver can resolve', () => {
		expect((prop('scroller')?.enumValues ?? []).map(e => e.name).sort()).toEqual([
			'nearest',
			'root',
			'self',
		]);
	});
});

describe('property surface', () => {
	it('exposes the scroll lifecycle events', () => {
		for (const name of ['onReady', 'onError', 'onSceneEnter', 'onSceneExit']) {
			expect(prop(name)).toBeDefined();
		}
	});

	it('keeps the range within 0 and 1, which is what the driver emits', () => {
		for (const name of ['rangeStart', 'rangeEnd']) {
			expect(prop(name)?.min).toBe(0);
			expect(prop(name)?.max).toBe(1);
		}
	});

	it('does not freeze reduced motion at the start of the timeline', () => {
		// t=0 is usually a scene that has not arrived: offscreen, or scaled to
		// nothing. A visitor who asked for less motion should still see the
		// scene, not the frame before it exists.
		expect(prop('reducedMotionProgress')?.defaultValue).toBeGreaterThan(0);
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
