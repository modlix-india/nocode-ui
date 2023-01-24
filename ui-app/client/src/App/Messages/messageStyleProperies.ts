import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'messagesOuterContainerLeft',
		cssProperty: 'left',
		displayName: 'Messages Outer Container Left',
		description: 'Messages Outer Container position on the page left',
		defaultValue: '10px',
		selector: ' ',
	},
	{
		name: 'messagesOuterContainerRight',
		cssProperty: 'right',
		displayName: 'Messages Outer Container Right',
		description: 'Messages Outer Container position on the page right',
		selector: ' ',
	},
	{
		name: 'messagesOuterContainerTop',
		cssProperty: 'top',
		displayName: 'Messages Outer Container Top',
		description: 'Messages Outer Container position on the page top',
		selector: ' ',
	},
	{
		name: 'messagesOuterContainerBottom',
		cssProperty: 'bottom',
		displayName: 'Messages Outer Container Bottom',
		description: 'Messages Outer Container position on the page bottom',
		defaultValue: '10px',
		selector: ' ',
	},
	{
		name: 'messageContainerWidth',
		cssProperty: 'width',
		displayName: 'Messages Container Width',
		description: 'Messages Container width',
		defaultValue: '30vw',
		selector: '._message',
	},
	{
		name: 'messageContainerGap',
		cssProperty: 'gap',
		displayName: 'Messages Container item gap',
		description: 'Messages Container item gap',
		defaultValue: '10px',
		selector: '._message',
	},
	{
		name: 'messageContainerBackground',
		cssProperty: 'background',
		displayName: 'Messages Container Background',
		description: 'Messages Container background',
		defaultValue: '<secondary-background>',
		selector: '._message',
	},
	{
		name: 'messageContainerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'Message Container border radius',
		description: 'Message Container border radius',
		defaultValue: '4px',
		selector: '._message',
	},
	{
		name: 'messageContainerPadding',
		cssProperty: 'padding',
		displayName: 'Messages Container Padding',
		description: 'Messages Container padding',
		defaultValue: '10px',
		selector: '._message',
	},
	{
		name: 'messageFontSize',
		cssProperty: 'font-size',
		displayName: 'Message Font Size',
		description: 'Message Font Size',
		defaultValue: 'calc(<main-font-size> - 1px)',
		selector: '._message ._msgString',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
