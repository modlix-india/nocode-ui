import * as fs from 'fs';
import * as path from 'path';
import { StylePropertyDefinition } from '../../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from '../treeProperties';

/**
 * `dist/styleProperties/Tree.json` is hand-authored and fetched at runtime, so nothing in the
 * build catches a mistake in it. Every rule below, if broken, produces silently missing CSS
 * rather than an error — which is exactly why it is worth a test.
 */

const ARTIFACT = path.resolve(__dirname, '../../../../dist/styleProperties/Tree.json');

const enumNames = (propName: string): string[] =>
	propertiesDefinition.find(p => p.name === propName)?.enumValues?.map(e => e.name) ?? [];

const DESIGNS = enumNames('treeDesign');
const SCHEMES = enumNames('colorScheme');

const props: StylePropertyDefinition[] = JSON.parse(fs.readFileSync(ARTIFACT, 'utf-8'));

const placeholdersIn = (s: string | undefined): string[] =>
	[...(s ?? '').matchAll(/<(treeDesign|colorScheme)>/g)].map(m => m[1]).sort();

describe('Tree theme artifact', () => {
	it('parses and is a non-empty array', () => {
		expect(Array.isArray(props)).toBe(true);
		expect(props.length).toBeGreaterThan(0);
	});

	it('knows the design and scheme enums it is cross-producted against', () => {
		expect(DESIGNS).toEqual(['_indented', '_accordion', '_orgChart', '_columns']);
		expect(SCHEMES.length).toBe(5);
	});

	it('every entry has a name, a css property and a selector', () => {
		for (const p of props) {
			expect(typeof p.n).toBe('string');
			expect(p.n.length).toBeGreaterThan(0);
			expect(p.cp).toBeTruthy();
			expect(p.sel).toBeTruthy();
		}
	});

	it('uses unique style property names', () => {
		const seen = props.map(p => p.n);
		expect(new Set(seen).size).toBe(seen.length);
	});

	it('declares each css property at most once per selector', () => {
		// processEachResolution concatenates declarations per selector, so a repeat would
		// emit the property twice and let source order silently decide the winner.
		const seen = new Set<string>();
		for (const p of props) {
			const composite = `${p.sel}|${p.cp}`;
			expect(seen.has(composite)).toBe(false);
			seen.add(composite);
		}
	});

	it('has matching placeholders in name and selector', () => {
		// inflateStyleProps only substitutes into `sel` the placeholders it found in `n`, so a
		// mismatch leaves a literal <colorScheme> in the emitted selector and kills the rule.
		for (const p of props)
			expect({ n: p.n, ph: placeholdersIn(p.sel) }).toEqual({
				n: p.n,
				ph: placeholdersIn(p.n),
			});
	});

	it('sets np exactly when the selector is absolute', () => {
		for (const p of props) {
			const absolute = p.sel!.startsWith('.comp');
			expect({ n: p.n, np: !!p.np }).toEqual({ n: p.n, np: absolute });
		}
	});

	it('uses spv keys with one part per placeholder', () => {
		// A key of the wrong arity never matches, so makeDefaultValue falls through to `dv`;
		// with no `dv` the property yields no CSS at all.
		for (const p of props) {
			const arity = Math.max(placeholdersIn(p.n).length, 1);
			for (const k of Object.keys(p.spv ?? {}))
				expect({ n: p.n, k, parts: k.split('-').length }).toEqual({
					n: p.n,
					k,
					parts: arity,
				});
		}
	});

	it('uses only real design and scheme values in spv keys', () => {
		for (const p of props) {
			const order = ['treeDesign', 'colorScheme'].filter(d => p.n.includes(`<${d}>`));
			for (const k of Object.keys(p.spv ?? {})) {
				k.split('-').forEach((part, i) => {
					if (!part) return;
					const valid = order[i] === 'treeDesign' ? DESIGNS : SCHEMES;
					expect({ n: p.n, part, valid: valid.includes(part) }).toEqual({
						n: p.n,
						part,
						valid: true,
					});
				});
			}
		}
	});

	it('never puts a comma in a border value', () => {
		// processStyleValue splits `cp: 'border'` on commas into per-side declarations, so an
		// rgba() or a font-style list would be torn apart.
		for (const p of props) {
			if (p.cp !== 'border') continue;
			const values = [...Object.values(p.spv ?? {}), ...(p.dv ? [p.dv] : [])];
			for (const v of values)
				expect({ n: p.n, v, comma: v.includes(',') }).toEqual({
					n: p.n,
					v,
					comma: false,
				});
		}
	});

	it('gives every entry at least one resolvable default', () => {
		for (const p of props)
			expect({ n: p.n, has: !!p.dv || Object.keys(p.spv ?? {}).length > 0 }).toEqual({
				n: p.n,
				has: true,
			});
	});
});

/**
 * SubCompInfo is read as source rather than imported: importing it pulls in
 * `components/index.ts`, whose module graph is circular under Jest.
 */
function readRegisteredSlots(): { names: string[]; mainCount: number } {
	const src = fs.readFileSync(
		path.resolve(__dirname, '../../PageEditor/SubCompInfo.tsx'),
		'utf-8',
	);
	const start = src.indexOf('[Tree.name]: [');
	if (start === -1) return { names: [], mainCount: 0 };

	// Walk to the matching close bracket of the entry array.
	let depth = 0;
	let end = start + '[Tree.name]: '.length;
	for (let i = end; i < src.length; i++) {
		if (src[i] === '[') depth++;
		else if (src[i] === ']') {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}

	const block = src.substring(start, end);
	return {
		names: [...block.matchAll(/\bname:\s*'([^']*)'/g)].map(m => m[1]),
		mainCount: [...block.matchAll(/mainComponent:\s*true/g)].length,
	};
}

describe('Tree style slots', () => {
	const declared = Object.keys(stylePropertiesDefinition);
	const { names: registered, mainCount } = readRegisteredSlots();

	it('registers the same slots it declares', () => {
		expect([...registered].sort()).toEqual([...declared].sort());
	});

	it('marks exactly one entry as the main component, first in the list', () => {
		expect(mainCount).toBe(1);
		// ComponentMenu reads entry [0].icon for the palette, so the root must come first.
		expect(registered[0]).toBe('');
	});

	it('has no slot name that is a suffix of another', () => {
		// SubHelperComponent matches with selectedSubComponent.endsWith(subComponentName), so
		// `toggle` alongside `expandedToggle` would highlight both at once.
		const named = declared.filter(Boolean);
		const collisions = named.filter(a => named.some(b => a !== b && a.endsWith(b)));
		expect(collisions).toEqual([]);
	});
});
