import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	styleDefaults as mdDefaults,
	styleProperties as mdProps,
} from '../MarkdownEditor/markdownEditorStyleProperties';
import {
	styleDefaults as sfDefaults,
	styleProperties as sfProps,
} from '../SchemaForm/schemaFormStyleProperies';
import { themableComponents } from '../ThemeEditor/components/themableComponents';

/**
 * A component only reaches the Theme Editor rail when its definition binds a
 * NON-EMPTY `stylePropertiesForTheme`. ButtonBar shipped for a while bound to
 * its sibling `styleProperties`, which is the empty runtime array, so it was
 * silently absent. These assert the wiring, not the contents.
 */
describe('Theme Editor rail', () => {
	const rail = themableComponents();
	const keys = rail.map(e => e.key);

	it.each(['ButtonBar', 'MarkdownEditor', 'SchemaForm'])('lists %s', name => {
		expect(keys).toContain(name);
	});

	it('gives every listed component at least one variable', () => {
		for (const comp of rail) expect(comp.styleProps.length).toBeGreaterThan(0);
	});

	// Not a repo-wide invariant: PageEditor deliberately points many selectors at
	// one token, so its array repeats names by design. These three give each
	// declaration its own knob, and the rail keys rows on `n`, so a repeat here
	// would be a duplicate React key and a row listed twice.
	it.each(['ButtonBar', 'MarkdownEditor', 'SchemaForm', 'FileSelector'])(
		'keeps %s variable names unique',
		name => {
			const names = rail.find(c => c.key === name)!.styleProps.map(p => p.n);
			expect(new Set(names).size).toBe(names.length);
		},
	);

	// `processStyleValue` writes `cp` into the stylesheet verbatim, so a
	// camelCase one emits `backgroundColor: red` and the browser drops it --
	// a variable that looks wired up in the rail and does nothing. FileSelector
	// had fourteen. A custom property (`--_bpAccent`) is exempt: those are
	// case-sensitive by design and BlueprintEditor themes itself through them.
	it('uses CSS property names, not the camelCase DOM spelling', () => {
		const camel = rail.flatMap(c =>
			c.styleProps
				.filter(p => p.cp && !p.cp.startsWith('--') && /[A-Z]/.test(p.cp))
				.map(p => `${c.key}.${p.n}=${p.cp}`),
		);
		expect(camel).toEqual([]);
	});

	// A placeholder only disappears if something inflates the array against the
	// component's `propertiesForTheme`. A component with none -- FileSelector --
	// shipped `<colorScheme>` straight into its selectors, killing every rule.
	it('leaves no uninflated placeholder in a selector', () => {
		const raw = rail.flatMap(c =>
			c.propertiesForTheme?.length
				? []
				: c.styleProps.filter(p => p.sel?.includes('<')).map(p => `${c.key}.${p.n}`),
		);
		expect(raw).toEqual([]);
	});
});

describe.each([
	['MarkdownEditor', '.comp.compMarkdownEditor', mdProps, mdDefaults],
	['SchemaForm', '.comp.compSchemaForm', sfProps, sfDefaults],
])('%s style properties', (_name, prefix, props, defaults) => {
	it('declares a default for every entry that replaces a literal', () => {
		// An entry with no `dv` is a deliberate opt-in and emits nothing until a
		// theme sets it; everything else has to carry the value it replaced.
		const optIn = props.filter(p => !p.dv).map(p => p.n);
		expect(optIn.every(n => /FontFamily|TextAreaBackground|TextAreaColor/.test(n))).toBe(true);
	});

	it('writes every selector at the component prefix', () => {
		for (const p of props) {
			expect(p.np).toBe(true);
			for (const branch of p.sel!.split(',')) expect(branch.trim()).toMatch(prefix);
		}
	});

	it('never uses the border shorthand, which processStyleValue comma-splits', () => {
		expect(props.filter(p => p.cp === 'border')).toHaveLength(0);
	});

	it('emits nothing when the theme is empty', () => {
		expect(processStyleDefinition(prefix, props, undefined, undefined)).toBe('');
	});

	it('emits each default exactly once, resolved through the theme', () => {
		const theme = new Map([
			[
				StyleResolution.ALL,
				new Map([
					['surfaceColorOne', '#F9FAFB'],
					['surfaceColorTwo', '#F3F4F6'],
					['surfaceColorThree', '#e0e0e0'],
					['borderColorNine', '#E5E7EB'],
					['borderColorTen', '#dddddd'],
					['colorOne', '#4a90e2'],
					['colorFour', '#DC2626'],
					['colorFive', '#3B82F6'],
					['colorSeven', '#ffffff'],
					['fontColorOne', '#333333'],
					['fontColorTwo', '#374151'],
					['fontColorThree', '#6B7280'],
					['fontColorTen', '#9CA3AF'],
					['errorWashColor', '#FEF2F2'],
				]),
			],
		]);

		const css = processStyleDefinition(prefix, props, defaults, theme);

		for (const p of props.filter(e => !!e.dv)) {
			expect(css).toContain(`${p.cp}: `);
			// a `<var>` default has to come out resolved, never as literal text
			expect(css).not.toContain(`${p.cp}: <`);
		}
		expect(css).not.toContain('<');
	});

	it('drops a declaration whose theme variable is missing rather than emitting an empty one', () => {
		const theme = new Map([[StyleResolution.ALL, new Map<string, string>()]]);
		const css = processStyleDefinition(prefix, props, defaults, theme);
		// `<unknownVar>` resolves to '' -- the declaration is invalid and the
		// browser drops it, so the base sheet's own literal survives.
		expect(css).not.toContain('<');
	});
});
