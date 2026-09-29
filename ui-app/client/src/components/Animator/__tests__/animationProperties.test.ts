import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
	ANIMATIONS_LIST,
	ANIMATION_PROPERTIES,
	ANIMATION_TIMELINE_PROPERTIES,
} from '../../util/properties';

const field = (name: string) => ANIMATION_PROPERTIES.find(p => p.name === name);

describe('the animation property surface', () => {
	it('defaults timeline to none, which is what keeps stored pages working', () => {
		// No page definition in production carries the key, so every existing
		// animation must resolve to its current clock-driven behaviour.
		// Changing this default would silently re-time every one of them.
		expect(field('timeline')?.defaultValue).toBe('none');
	});

	it('offers both axes, since horizontal is the point of having an axis', () => {
		expect((field('axis')?.enumValues ?? []).map(e => e.name).sort()).toEqual([
			'block',
			'inline',
		]);
	});

	it('keeps the range inside 0..1, which is what the scroll driver emits', () => {
		for (const name of ['rangeStart', 'rangeEnd']) {
			expect(field(name)?.min).toBe(0);
			expect(field(name)?.max).toBe(1);
		}
	});

	it('leaves the observation surface intact alongside the timeline one', () => {
		// The two are independent: observation switches an animation ON at a
		// threshold, timeline SCRUBS it. Removing either would break pages.
		for (const name of ['observation', 'enteringThreshold', 'numOfObservations']) {
			expect(field(name)).toBeDefined();
		}
	});

	it('has no duplicate field names', () => {
		const names = ANIMATION_PROPERTIES.map(p => p.name);
		expect(new Set(names).size).toBe(names.length);
	});
});

describe('animation names are underscore-prefixed', () => {
	it('every one of them', () => {
		// `_fadeInUp`, NOT `fadeInUp`. An unprefixed name matches no keyframes
		// block, so the element never animates and nothing reports a problem.
		// This is documented as a silent killer in the agent's own pattern docs.
		const unprefixed = ANIMATIONS_LIST.filter(a => !a.name.startsWith('_'));
		expect(unprefixed).toEqual([]);
	});
});

describe('the generated catalog carries the animation entry schema', () => {
	/**
	 * `animation` is multiValued, and before this the catalog said only that and
	 * stopped. The AppBuilder agent therefore had no way to learn that
	 * `animationName`, `observation` or the scroll-timeline keys existed at all,
	 * for the one component whose entire purpose is animation.
	 *
	 * Generated fresh rather than read off disk: dist/component-catalog.json is
	 * a build artifact, and asserting against a stale copy would pass while the
	 * real generator was broken.
	 */
	const catalogPath = path.join(__dirname, '../../../../dist/component-catalog.json');
	let animation: any;

	beforeAll(() => {
		execFileSync(
			'npx',
			['ts-node', '--transpile-only', 'scripts/generate-component-catalog.ts'],
			{ cwd: path.join(__dirname, '../../../..'), stdio: 'ignore' },
		);
		const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
		const comps = Array.isArray(catalog.components)
			? Object.fromEntries(catalog.components.map((c: any) => [c.name, c]))
			: catalog.components;
		animation = comps.Animator.properties.find((p: any) => p.name === 'animation');
	}, 120000);

	it('promotes Animator so its schema reaches the prompt at all', () => {
		// At tier 'specialized' a component renders as exactly ONE line, and
		// its properties never appear.
		const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
		const comps = Array.isArray(catalog.components)
			? Object.fromEntries(catalog.components.map((c: any) => [c.name, c]))
			: catalog.components;
		expect(comps.Animator.tier).toBe('common');
	});

	it('describes every field of one animation entry', () => {
		const names = (animation.subProperties ?? []).map((p: any) => p.name);
		for (const expected of ANIMATION_PROPERTIES.map(p => p.name)) {
			expect(names).toContain(expected);
		}
	});

	it('carries the scroll-timeline keys, not just the clock ones', () => {
		const names = (animation.subProperties ?? []).map((p: any) => p.name);
		for (const expected of ANIMATION_TIMELINE_PROPERTIES.map(p => p.name)) {
			expect(names).toContain(expected);
		}
	});

	it('carries the real keyframes names, prefix and all', () => {
		// Declared as `enumValues: ANIMATIONS_LIST`, an identifier the AST
		// parser cannot evaluate, so without special handling the agent gets a
		// free-text field and writes `fadeInUp`.
		const nameField = (animation.subProperties ?? []).find(
			(p: any) => p.name === 'animationName',
		);
		const values = (nameField?.enumValues ?? []).map((e: any) => e.name);
		expect(values.length).toBe(ANIMATIONS_LIST.length);
		expect(values.every((v: string) => v.startsWith('_'))).toBe(true);
	});
});
