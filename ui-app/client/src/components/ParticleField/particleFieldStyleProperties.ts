import { StylePropertyDefinition } from '../../types/common';

/** Inline rather than externalised: a canvas has almost no themeable surface. */
export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'Size',
		dn: 'Minimum Height',
		n: 'particleFieldMinHeight',
		dv: '320px',
		cp: 'min-height',
		sel: '',
	},
	{
		gn: 'Effects',
		dn: 'Canvas Opacity',
		n: 'particleFieldCanvasOpacity',
		dv: '1',
		cp: 'opacity',
		sel: ' ._canvasHolder',
	},
	{
		gn: 'Effects',
		dn: 'Overlay Background',
		de: 'Sits above the particles. Use a translucent colour to keep text readable.',
		n: 'particleFieldOverlayBackground',
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
