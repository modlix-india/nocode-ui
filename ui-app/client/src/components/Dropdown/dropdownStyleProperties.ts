import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	//header text style
	{
		name: 'headerTextFontSize',
		cssProperty: 'font-size',
		displayName: 'Font size for Header Text',
		description: 'Font size for Header Text.',
		defaultValue: '14px',
		selector: '.headerText',
	},
	{
		name: 'headerTextFontColor',
		cssProperty: 'color',
		displayName: 'Font color for Header Text',
		description: 'Font color for Header Text.',
		defaultValue: '#1F3C3D',
		selector: '.headerText',
	},
	{
		name: 'headerTextFontColorDisabled',
		cssProperty: 'color',
		displayName: 'Font color when Header Text is disable',
		description: 'Font color for Header Text when it is disable.',
		defaultValue: '#798A8B',
		selector: '.headerText.disabled',
	},
	{
		name: 'containerWidth',
		cssProperty: 'width',
		displayName: 'Container width',
		description: 'The width of Container.',
		defaultValue: '100%',
		selector: '.container',
	},
	{
		name: 'containerHeight',
		cssProperty: 'height',
		displayName: 'Container height',
		description: 'The height of Container.',
		defaultValue: '56px',
		selector: '.container',
	},
	{
		name: 'containerPadding',
		cssProperty: 'padding',
		displayName: 'Container padding',
		description: 'The padding of Container.',
		defaultValue: '0 16px',
		selector: '.container',
	},
	{
		name: 'containerBorder',
		cssProperty: 'border',
		displayName: 'Container border',
		description: 'The border of Container.',
		defaultValue: '1px solid #C7C8D6',
		selector: '.container',
	},
	{
		name: 'containerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'Container border radius',
		description: 'The border radius of Container.',
		defaultValue: '4px',
		selector: '.container',
	},
	{
		name: 'containerBorderDisabled',
		cssProperty: 'border',
		displayName: 'Container border on disabled',
		description: 'The border of Container on disabled.',
		defaultValue: '1px solid #DDDEE6',
		selector: '.container.disabled',
	},
	{
		name: 'containerBorderHover',
		cssProperty: 'border',
		displayName: 'Container border on hover',
		description: 'The border of Container on hover.',
		defaultValue: '1px solid #2680EB',
		selector: '.container:hover',
	},
	{
		name: 'containerBorderFocus',
		cssProperty: 'border',
		displayName: 'Container border on Focus',
		description: 'The border of Container on Focus.',
		defaultValue: '1px solid #2680EB',
		selector: '.container.focus',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
