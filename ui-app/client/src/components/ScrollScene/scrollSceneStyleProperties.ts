import { StylePropertyDefinition } from '../../types/common';

/**
 * Inline rather than externalised: a canvas has almost no themeable surface.
 *
 * A root-level rule needs `np: true` and the FULL selector. processEachResolution
 * skips any entry whose `sel` is falsy, so `sel: ''` -- the obvious way to say
 * "the component itself" -- emits nothing at all. That is how these components
 * shipped with a min-height default that never applied: every one of them
 * rendered as a zero-height box unless the page happened to carry an explicit
 * height leaf, and nothing reported a problem.
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'Size',
		dn: 'Minimum Height',
		n: 'scrollSceneMinHeight',
		dv: '520px',
		cp: 'min-height',
		sel: '.comp.compScrollScene',
		np: true,
	},
	{
		gn: 'Effects',
		dn: 'Canvas Opacity',
		n: 'scrollSceneCanvasOpacity',
		dv: '1',
		cp: 'opacity',
		sel: '.comp.compScrollScene ._canvasHolder',
		np: true,
	},
	{
		gn: 'Effects',
		dn: 'Overlay Background',
		de: 'Sits above the scene. Use a translucent colour to keep text readable.',
		n: 'scrollSceneOverlayBackground',
		dv: 'transparent',
		cp: 'background',
		sel: '.comp.compScrollScene ._overlay',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
