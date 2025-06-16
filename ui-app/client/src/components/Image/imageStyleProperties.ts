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
	{
		n: 'tooltipBackgroundColor',
		cp: 'background-color',
		dn: 'Tooltip Background Color',
		de: 'Background color of the tooltip',
		dv: 'rgba(0, 0, 0, 0.1)',
		sel: '._tooltip',
	},
	{
		n: 'tooltipTextColor',
		cp: 'color',
		dn: 'Tooltip Text Color',
		de: 'Text color of the tooltip',
		dv: '#333',
		sel: '._tooltip',
	},
	{
		n: 'tooltipBorderRadius',
		cp: 'border-radius',
		dn: 'Tooltip Border Radius',
		de: 'Border radius of the tooltip',
		dv: '4px',
		sel: '._tooltip',
	},
	{
		n: 'tooltipPadding',
		cp: 'padding',
		dn: 'Tooltip Padding',
		de: 'Padding inside the tooltip',
		dv: '6px 10px',
		sel: '._tooltip',
	},
	{
		n: 'tooltipBoxShadow',
		cp: 'box-shadow',
		dn: 'Tooltip Shadow',
		de: 'Box shadow for the tooltip',
		dv: '0 2px 5px rgba(0, 0, 0, 0.2)',
		sel: '._tooltip',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
