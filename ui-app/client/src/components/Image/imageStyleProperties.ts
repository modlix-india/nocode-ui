import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'imageRendering',
		cp: 'image-rendering',
		dn: 'Image rendering',
		de: 'This property specifies the type of algorithm to be used for image scaling',
		dv: 'auto',
		sel: '.image',
	},
	{
		n: 'zoomPreviewBorder',
		cp: 'border',
		dn: 'Zoom Preview Border',
		de: 'Border style for the zoom preview window',
		dv: '2px solid #ccc',
		sel: '._zoomPreview',
	},
	{
		n: 'magnifierBoxShadow',
		cp: 'box-shadow',
		dn: 'Magnifier Shadow',
		de: 'Box shadow for the magnifier lens',
		dv: '0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 5px rgba(0, 0, 0, 0.2)',
		sel: '._magnifier',
	},
	{
		n: 'sliderLineColor',
		cp: 'background-color',
		dn: 'Slider Line Color',
		de: 'Color of the comparison slider line',
		dv: 'rgba(255, 255, 255, 0.7)',
		sel: '._sliderLine',
	},
	{
		n: 'sliderHandleBgColor',
		cp: 'background-color',
		dn: 'Slider Handle Background Color',
		de: 'Background color of the comparison slider handle',
		dv: 'rgba(255, 255, 255, 0.7)',
		sel: '._sliderHandle',
	},
	{
		n: 'sliderHandleBorder',
		cp: 'border',
		dn: 'Slider Handle Border',
		de: 'Border style for the comparison slider handle',
		dv: '2px solid rgba(0, 0, 0, 0.5)',
		sel: '._sliderHandle',
	},
	{
		n: 'sliderHandleBoxShadow',
		cp: 'box-shadow',
		dn: 'Slider Handle Shadow',
		de: 'Box shadow for the comparison slider handle',
		dv: '0 0 5px rgba(0, 0, 0, 0.3)',
		sel: '._sliderHandle',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
