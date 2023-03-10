import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'tabsContainerWidth',
		cssProperty: 'width',
		displayName: 'width',
		description: 'This property specifies the width of container',
		defaultValue: '100%',
		selector: '.tabsContainer',
	},
	{
		name: 'tabsContainerPadding',
		cssProperty: 'padding',
		displayName: 'Tab Button Padding',
		description: 'This property specifies the padding of container',
		defaultValue: '0 20px 0 20px ',
		selector: '.tabsContainer',
	},
	{
		name: 'tabsContainerGap',
		cssProperty: 'gap',
		displayName: 'Tab container gap',
		description: 'This property specifies the gap between two buttons in container',
		defaultValue: '15px',
		selector: '.tabsContainer',
	},
	{
		name: 'tabsContainerBorderBottom',
		cssProperty: 'border-bottom',
		displayName: 'border bottom',
		description: 'This property specifies the border bottom of container',
		defaultValue: '1px solid #cecece',
		selector: '.tabsContainer',
	},
	{
		name: 'tabsContainerPaddingWhenVertical',
		cssProperty: 'padding',
		displayName: 'Tab Button Padding',
		description: 'This property specifies the padding of container',
		defaultValue: '16px 0 16px 0',
		selector: '.tabsContainer.vertical',
	},
	{
		name: 'tabsContainerGapWhenVertical',
		cssProperty: 'gap',
		displayName: 'Tab container gap',
		description: 'This property specifies the gap between two buttons in container',
		defaultValue: '8px',
		selector: '.tabsContainer.vertical',
	},

	{
		name: 'tabButtonPadding',
		cssProperty: 'padding',
		displayName: 'padding',
		description: 'This property specifies the padding of the tab buttons',
		defaultValue: '10px 0',
		selector: '.tabButton',
	},
	{
		name: 'tabButtonBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'background color',
		description: 'This property specifies the background color of the tab buttons',
		defaultValue: '#ffffff',
		selector: '.tabButton',
	},
	{
		name: 'tabButtonBorder',
		cssProperty: 'border',
		displayName: 'border',
		description: 'This property specifies the border of the tab buttons',
		defaultValue: 'none',
		selector: '.tabButton',
	},
	{
		name: 'tabButtonColor',
		cssProperty: 'color',
		displayName: 'Font Color',
		description: 'This property specifies the color of the tab buttons',
		defaultValue: '#6c7586',
		selector: '.tabButton',
	},
	{
		name: 'tabButtonGap',
		cssProperty: 'gap',
		displayName: 'Tab button gap',
		description: 'This property specifies the gap between Icon and Label',
		defaultValue: '6px',
		selector: '.tabButton',
	},

	{
		name: 'ActiveTabButtonBorder',
		cssProperty: 'border-bottom',
		displayName: 'border bottom',
		description: 'This property specifies the border style of active button',
		defaultValue: '6px solid #1f3c3d',
		selector: '.activeTabBorder',
	},
	{
		name: 'ActiveTabButtonBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Active tab button background color',
		description: 'This property specifies the background color of active button',
		defaultValue: '#1F3C3D26',
		selector: '.activeTabHighlight',
	},
];
export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
