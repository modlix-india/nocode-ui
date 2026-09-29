import { stylePropertiesDefinition } from '../blueprintEditorProperties';
import { styleProperties } from '../blueprintEditorStyleProperties';

const PREFIX = '.comp.compBlueprintEditor';
const slots = Object.keys(stylePropertiesDefinition);

describe('style slots', () => {
	it('declares the root slot', () => {
		// The editor's sub-component dropdown is Object.keys(component.styleProperties),
		// and the empty key is the component itself.
		expect(slots).toContain('');
	});

	it('has no slot that is a SUFFIX of another', () => {
		// SubHelperComponent highlights with `selectedSubComponent.endsWith(name)`,
		// so a slot called `card` next to `chromeCard` would light up both. This is
		// why the slots are `planCard` and `railColumn` rather than the obvious names.
		const named = slots.filter(Boolean);
		const clashes: string[] = [];
		for (const a of named)
			for (const b of named)
				if (a !== b && b.endsWith(a)) clashes.push(`"${a}" is a suffix of "${b}"`);
		expect(clashes).toEqual([]);
	});

	it('gives every slot at least one style group', () => {
		for (const slot of slots) {
			expect(Array.isArray(stylePropertiesDefinition[slot])).toBe(true);
			expect(stylePropertiesDefinition[slot].length).toBeGreaterThan(0);
		}
	});
});

describe('style properties', () => {
	it('gives every entry a unique name', () => {
		const names = styleProperties.map(p => p.n);
		expect(new Set(names).size).toBe(names.length);
	});

	it('writes every selector in full and marks it no-prefix', () => {
		// A comma-separated `sel` REQUIRES np:true with the prefix on every branch,
		// because the automatic prefix only lands on the first one. Writing every
		// selector in full and always setting np is the rule that makes that safe.
		for (const p of styleProperties) {
			expect(p.np).toBe(true);
			for (const branch of (p.sel ?? '').split(',')) {
				expect(branch.trim().startsWith(PREFIX)).toBe(true);
			}
		}
	});

	it('never hard-codes a colour as a default', () => {
		// A `dv` is injected as the theme's ALL value and emits a real rule, so a
		// literal here is something every theme would have to restate to be rid of.
		// Literals belong in the root custom-property block in the Style file.
		const literals = styleProperties.filter(p => /#[0-9a-f]{3,8}\b|rgba?\(/i.test(p.dv ?? ''));
		expect(literals.map(p => p.n)).toEqual([]);
	});

	it('only defaults to app variables that actually exist', () => {
		// Prompt defaults some entries to <accentTintColor>, <surfaceColorOne> and
		// <borderColorNine>, none of which are declared in appStyleProperties.ts.
		// They are one app's private vocabulary and resolve to empty elsewhere.
		const known = new Set([
			'backgroundColorOne',
			'backgroundColorSeven',
			'borderColorSix',
			'fontColorOne',
			'fontColorTwo',
			'fontColorEight',
			'successColor',
			'informationColor',
			'warningColor',
			'errorColor',
			'primaryFont',
			'tertiaryFont',
			'quinaryFont',
		]);
		const used = styleProperties
			.map(p => p.dv)
			.filter((d): d is string => !!d && d.startsWith('<'))
			.map(d => d.slice(1, -1));
		for (const v of used) expect(known.has(v)).toBe(true);
	});

	it('keeps the ten palette names that restyle the whole board', () => {
		// Every structural rule is written against these, so setting them is all an
		// app needs to do. If this list shrinks, something went back to a literal.
		const palette = styleProperties.filter(p => p.gn === 'Board Palette').map(p => p.cp);
		expect(palette.sort()).toEqual(
			[
				'--_bpAccent',
				'--_bpBorder',
				'--_bpChromeInk',
				'--_bpGround',
				'--_bpHairline',
				'--_bpInk',
				'--_bpInk2',
				'--_bpInkMuted',
				'--_bpOnInk',
				'--_bpSurface',
			].sort(),
		);
	});

	it('restates the font shorthand only where it means to', () => {
		// `font` resets everything it omits, so a slot that only needs to be
		// smaller must use font-size alone.
		const shorthand = styleProperties.filter(p => p.cp === 'font').map(p => p.n);
		expect(shorthand).toEqual([
			'blueprintFont',
			'blueprintBoardTitleFont',
			'blueprintBoardDescriptionFont',
		]);
	});
});
