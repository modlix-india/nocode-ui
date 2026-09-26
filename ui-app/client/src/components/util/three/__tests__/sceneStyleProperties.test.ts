import { styleProperties as modelViewer } from '../../../ModelViewer/modelViewerStyleProperties';
import { styleProperties as particleField } from '../../../ParticleField/particleFieldStyleProperties';
import { styleProperties as shaderBackground } from '../../../ShaderBackground/shaderBackgroundStyleProperties';
import { processStyleDefinition } from '../../../../util/styleProcessor';
import { styleDefaults as mvDefaults } from '../../../ModelViewer/modelViewerStyleProperties';
import { styleDefaults as pfDefaults } from '../../../ParticleField/particleFieldStyleProperties';
import { styleDefaults as sbDefaults } from '../../../ShaderBackground/shaderBackgroundStyleProperties';

const SURFACES = [
	['ModelViewer', '.comp.compModelViewer', modelViewer, mvDefaults],
	['ParticleField', '.comp.compParticleField', particleField, pfDefaults],
	['ShaderBackground', '.comp.compShaderBackground', shaderBackground, sbDefaults],
] as const;

/**
 * processEachResolution skips any entry whose `sel` is falsy, so `sel: ''` --
 * the obvious way to write "the component itself" -- emits no rule at all.
 * All three of these shipped that way: their min-height default never reached
 * the page, every one rendered as a zero-height box unless the page happened to
 * carry an explicit height leaf, and nothing anywhere reported a problem.
 */
describe.each(SURFACES)('%s style properties', (_name, prefix, props, defaults) => {
	it('has no entry with an empty selector', () => {
		for (const p of props) expect(p.sel).toBeTruthy();
	});

	it('scopes every rule to its own component', () => {
		// np: true means the selector is used verbatim, so an unscoped one
		// would restyle every component on the page.
		for (const p of props) {
			if (p.np) expect(p.sel?.startsWith(prefix)).toBe(true);
		}
	});

	it('actually emits CSS for its defaults', () => {
		// The test that would have caught it: not "is the entry present" but
		// "does anything come out the other end".
		const css = processStyleDefinition(prefix, [...props], defaults, undefined);
		expect(css.trim()).not.toBe('');
		for (const p of props) {
			if (p.dv) expect(css).toContain(p.cp);
		}
	});

	it('gives the surface a height of its own', () => {
		// A canvas is an empty box: with no intrinsic content it collapses to
		// zero unless something says otherwise.
		const css = processStyleDefinition(prefix, [...props], defaults, undefined);
		expect(css).toMatch(/min-height:\s*\d/);
	});
});
