import { propertiesDefinition } from '../gridProperties';
import { styleProperties } from '../gridStyleProperties';

/**
 * Grid's padding / border / border-radius / box-shadow are picked from a fixed enum on the
 * instance, and the theme holds the value for each slot. That is the mechanism the product
 * design standard relies on, so a slot whose CSS never matches is a silent hole in it.
 *
 * It was silently broken. `processEachResolution` emits `prefix + ' ' + sel` for any property
 * without `np`, so a bare `sel: '._PADDINGONE'` became `.comp.compGrid ._PADDINGONE` — a
 * DESCENDANT selector. Grid renders two shapes:
 *
 *   plain     <div class="comp compGrid _noAnchorGrid ... _PADDINGONE">   slot ON the root
 *   anchored  <div class="comp compGrid"><a class="_anchorGrid _PADDINGONE">
 *
 * An element is not its own descendant, so every slot was dead on plain grids — which is
 * almost all of them (leadzump had ~2,900 slot selections rendering nothing). Both shapes now
 * have to be spelled out, and a comma-separated selector list REQUIRES `np: true`, because the
 * automatic prefix only lands on the first branch.
 */

const slotEnums = (propName: string): string[] =>
	(propertiesDefinition.find(p => p.name === propName)?.enumValues ?? [])
		.map(e => e.name)
		.filter(n => n && n !== '_NONE');

const SLOT_PROPS = ['padding', 'border', 'borderRadius', 'boxShadow'] as const;

describe('Grid design-slot selectors', () => {
	it('every slot property declares enum values', () => {
		for (const p of SLOT_PROPS) expect(slotEnums(p).length).toBeGreaterThan(0);
	});

	it('no style property uses a bare slot selector', () => {
		for (const p of styleProperties) {
			expect(p.sel).toBeTruthy();
			expect(p.sel).not.toMatch(/^\._[A-Z0-9]+$/);
		}
	});

	it('every comma-separated selector sets np, or only its first branch is prefixed', () => {
		for (const p of styleProperties) {
			if ((p.sel ?? '').includes(',')) expect(p.np).toBe(true);
		}
	});

	it('every np selector is absolute, so the prefix is not needed', () => {
		for (const p of styleProperties) {
			if (!p.np) continue;
			for (const branch of p.sel!.split(',')) {
				expect(branch.trim().startsWith('.comp.compGrid')).toBe(true);
			}
		}
	});

	it('every enum slot has a rule covering BOTH the plain and the anchored grid', () => {
		const missing: string[] = [];

		for (const prop of SLOT_PROPS) {
			for (const slot of slotEnums(prop)) {
				const rules = styleProperties.filter(p => (p.sel ?? '').includes(`.${slot}`));
				if (!rules.length) {
					missing.push(`${prop}=${slot}: no rule at all`);
					continue;
				}
				const branches = rules.flatMap(r => r.sel!.split(',').map(s => s.trim()));

				// the slot class sits ON the root of a plain grid
				const plain = branches.some(b => b === `.comp.compGrid._noAnchorGrid.${slot}`);
				// ...and on the <a> INSIDE an anchored grid, hence the descendant space
				const anchored = branches.some(b => b === `.comp.compGrid ._anchorGrid.${slot}`);

				if (!plain) missing.push(`${prop}=${slot}: no plain-grid branch`);
				if (!anchored) missing.push(`${prop}=${slot}: no anchored-grid branch`);
			}
		}

		expect(missing).toEqual([]);
	});

	it('gapBetween reaches both shapes too', () => {
		const gap = styleProperties.find(p => p.n === 'gapBetween');
		expect(gap).toBeTruthy();
		expect(gap!.np).toBe(true);
		const branches = gap!.sel!.split(',').map(s => s.trim());
		expect(branches).toContain('.comp.compGrid._noAnchorGrid');
		expect(branches).toContain('.comp.compGrid ._anchorGrid');
	});
});
