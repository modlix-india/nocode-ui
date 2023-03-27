import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'icon',
		description: 'icon that should be associated with the tag.',
	},
	{
		name: 'closeButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'closeButton',
		description: 'closeButton that should be associated with the tag.',
		defaultValue: true,
	},
	{
		name: 'closeEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'closeEvent',
		description: 'closeEvent that should be associated with the tag.',
	},
	{
		name: 'datatype',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown data type',
		description: `Dropdown's data format.`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'LIST_OF_STRINGS',
				displayName: 'List of strings',
				description: 'data has an array of strings',
			},
			{
				name: 'LIST_OF_OBJECTS',
				displayName: 'List of objects',
				description: 'data has an array of objects',
			},
			{
				name: 'LIST_OF_LISTS',
				displayName: 'List of lists',
				description: 'data has an array of arrays',
			},
			{
				name: 'OBJECT_OF_PRIMITIVES',
				displayName: 'Object of primitives',
				description: 'Object with key value pairs where values are primitives',
			},
			{
				name: 'OBJECT_OF_OBJECTS',
				displayName: 'Object of objects',
				description: 'Object with key value pairs where values are objects',
			},
			{
				name: 'OBJECT_OF_LISTS',
				displayName: 'Object of lists',
				description: 'Object with key value pairs where values are lists',
			},
		],
	},
	{
		name: 'uniqueKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's type",
		description: `Type for sleection unique key`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as unique key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as unique key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as unique key's value",
			},
			{
				name: 'RANDOM',
				displayName: 'Random',
				description: 'A Random key is associated with value which is costly in rendering',
			},
		],
	},

	{
		name: 'hasInputBox',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'hasInputBox',
		description: 'has InputBox.',
		defaultValue: true,
	},
	{
		name: 'delimitter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: ' ',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: ',', displayName: 'Comma', description: 'Comma' },
			{ name: ':', displayName: 'SemiColon', description: 'SemiColon' },
			{ name: 'Enter', displayName: 'Enter', description: 'Enter' },
			{ name: ' ', displayName: 'Single Space', description: 'Space' },
		],
	},
	{
		name: 'placeHolder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'placeHolder',
		description: 'placeHolder.',
		defaultValue: '',
	},
	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'label',
		description: 'label.',
		defaultValue: '',
	},

	{
		name: 'labelKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Label's key type",
		description: `type of value that needs to be selected for dispaly label`,
		defaultValue: 'LIST_OF_STRINGS',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as label key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as label key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as label key's value",
			},
		],
	},

	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's value",
		description: `Key value that is used to generate unique key value.`,
		translatable: true,
	},

	{
		name: 'labelKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Labels key's value ",
		description: `Key value that is used to generate label value.`,
		translatable: true,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			target: ['tagContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['container'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['icon'],
		},
	},
	outerContainerWithInputBox: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'OuterContainerWithInputBoxFlex',
			description: 'container with input flex',
			displayName: 'container with input flex',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'OuterContainerWithInputBoxBorder',
			description: 'container with input border',
			displayName: 'container with input border',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'OuterContainerWithInputBoxBoxShadow',
			description: 'container with input boxShadow',
			displayName: 'container with input boxShadow',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'OuterContainerWithInputBoxMargin',
			description: 'container with input margin',
			displayName: 'container with input margin',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'OuterContainerWithInputBoxPadding',
			description: 'container with input padding',
			displayName: 'container with input padding',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'OuterContainerWithInputBoxSize',
			description: 'container with input size',
			displayName: 'container with input size',
			prefix: 'OuterContainerWithInputBox',
			target: ['OuterContainerWithInputBox'],
		},
	},

	inputBox: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'InputBoxSize',
			description: 'input box size',
			displayName: 'input box size',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'InputBoxMargin',
			description: 'input box margin',
			displayName: 'input box margin',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'InputBoxPadding',
			description: 'input box padding',
			displayName: 'input box padding',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'InputBoxcolor',
			description: 'input box color',
			displayName: 'input box color',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'InputBoxBorder',
			description: 'input box border',
			displayName: 'input box border',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'InputBoxBackground',
			description: 'input box background',
			displayName: 'input box background',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
	},

	tagsContainerWithInput: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'inputContainerFlex',
			description: 'Tags input container flex',
			displayName: 'tags input container flex',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'inputContainerbackground',
			description: 'Tags input container background',
			displayName: 'tags input container background',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'inputContainerborder',
			description: 'Tags input container border',
			displayName: 'tags input container border',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'inputContainerboxShadow',
			description: 'Tags input container boxShadow',
			displayName: 'tags input container boxShadow',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'inputContainermargin',
			description: 'Tags input container margin',
			displayName: 'tags input container margin',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			name: 'inputContaineroutline',
			description: 'Tags input container outline',
			displayName: 'tags input container outline',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'inputContainerpadding',
			description: 'Tags input container padding',
			displayName: 'tag input container padding',
			prefix: 'tagsContainerWithInput',
			target: ['tagsContainerWithInput'],
		},
	},
	titleLabel: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'taglabelPadding',
			description: 'Tags title label Padding',
			displayName: 'Tag title label Padding',
			prefix: 'titleLabel',
			target: ['titleLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'tagLabelFont',
			description: 'Tags title label font',
			displayName: 'Tag  title label font',
			prefix: 'titleLabel',
			target: ['titleLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'tagLabelColor',
			description: 'Tags title label color',
			displayName: 'Tag title label color',
			prefix: 'titleLabel',
			target: ['titleLabel'],
		},
	},

	tagIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'tagIconPadding',
			description: "Tags Icon's Padding",
			displayName: "Tag Icon's padding",
			prefix: 'tagIcon',
			target: ['tagIcon'],
		},
	},
	tagText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'tagTextColor',
			description: "Tags Text's Color",
			displayName: "Tag Text's Color",
			prefix: 'tagText',
			target: ['tagText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'tagTextFont',
			description: "Tag's Font",
			displayName: 'Tag Font',
			prefix: 'tagText',
			target: ['tagText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'tagTextPadding',
			description: "Tag's Text Color",
			displayName: 'Tag Text Color',
			prefix: 'tagText',
			target: ['tagText'],
		},
	},
	tagCloseIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'tagCloseIconColor',
			description: "Tag's close icon Color",
			displayName: 'Tag close icon Color',
			prefix: 'tagCloseIcon',
			target: ['tagCloseIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'tagCloseIconFont',
			description: "Tag's close icon Font",
			displayName: 'Tag close icon Font',
			prefix: 'tagCloseIcon',
			target: ['tagCloseIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'tagCloseIconPadding',
			description: "Tag's close icon Color",
			displayName: 'Tag close icon Color',
			prefix: 'tagCloseIcon',
			target: ['tagCloseIcon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
