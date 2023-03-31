import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'dropdownContainerWidth',
		cssProperty: 'width',
		displayName: 'Dropdown Container width',
		description: 'The width of Dropdown Container.',
		defaultValue: '100%',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownContainerMaxHeight',
		cssProperty: 'max-height',
		displayName: 'Dropdown Container max height',
		description: 'The max height of Dropdown Container.',
		defaultValue: '150px',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownContainerPadding',
		cssProperty: 'padding',
		displayName: 'Dropdown Container padding',
		description: 'The padding of Dropdown Container.',
		defaultValue: '8px 0',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownContainerBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Dropdown Container background color',
		description: 'The background color of Dropdown Container.',
		defaultValue: '<light-font-color>',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownContainerBoxShadow',
		cssProperty: 'box-shadow',
		displayName: 'Dropdown Container box shadow',
		description: 'The box shadow of Dropdown Container.',
		defaultValue: '0 4px 6px 1px <box-box-shadow>',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownContainerZIndex',
		cssProperty: 'z-index',
		displayName: 'Dropdown Container z index',
		description: 'The z index of Dropdown Container.',
		defaultValue: '1',
		selector: '.dropdownContainer',
	},
	{
		name: 'dropdownItemPadding',
		cssProperty: 'padding',
		displayName: 'Dropdown Item padding',
		description: 'The padding of Dropdown Item.',
		defaultValue: '8px 16px',
		selector: '.dropdownItem',
	},
	{
		name: 'dropdownItemBackgroundColorOnHover',
		cssProperty: 'background-color',
		displayName: 'Dropdown Item background color on hover',
		description: 'The background color of Dropdown Item on hover.',
		defaultValue: '<option-hover-background>',
		selector: '.dropdownItem:hover',
	},
	{
		name: 'dropdownItemLabelFontColor',
		cssProperty: 'color',
		displayName: 'Font color for Dropdown Item Label',
		description: 'Font color for Dropdown Item Label.',
		defaultValue: '<main-font-color>',
		selector: '.dropdownItemLabel',
	},
	{
		name: 'checkedIconFontColor',
		cssProperty: 'color',
		displayName: 'Font color for Checked Icon',
		description: 'Font color for Checked Icon.',
		defaultValue: '<form-input-border-color-hover>',
		selector: '.checkedIcon',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
