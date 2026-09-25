import { StylePropertyDefinition } from '../../types/common';

/**
 * Kept inline rather than externalised to dist/styleProperties/. A canvas has
 * almost no themeable surface, and those JSON artifacts are hand-authored with
 * no build-time validation (see the comment in Tree's treeStyleArtifact.test).
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'Size',
		dn: 'Minimum Height',
		n: 'shaderBackgroundMinHeight',
		dv: '320px',
		cp: 'min-height',
		sel: '',
	},
	{
		gn: 'Effects',
		dn: 'Canvas Opacity',
		n: 'shaderBackgroundCanvasOpacity',
		dv: '1',
		cp: 'opacity',
		sel: ' ._canvasHolder',
	},
	{
		gn: 'Effects',
		dn: 'Overlay Background',
		de: 'Sits above the canvas. Use a translucent colour to keep text readable.',
		n: 'shaderBackgroundOverlayBackground',
		dv: 'transparent',
		cp: 'background',
		sel: ' ._overlay',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
