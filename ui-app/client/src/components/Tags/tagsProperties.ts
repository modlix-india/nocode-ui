import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'icon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'icon',
		description: 'icon that should be associated with the tag.',
	},
	{
		name: 'closeButton',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'closeButton',
		description: 'closeButton that should be associated with the tag.',
		defaultValue: true,
	},
	{
		name: 'closeEvent',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'closeEvent',
		description: 'closeEvent that should be associated with the tag.',
	},
	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'readOnly',
		description: 'read only.',
		group: ComponentPropertyGroup.COMMON,
		defaultValue: false,
	},
	{
		name: 'datatype',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
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
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
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
		],
	},

	{
		name: 'hasInputBox',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'hasInputBox',
		description: 'has InputBox.',

		defaultValue: true,
	},
	{
		name: 'delimitter',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: ',',
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
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'placeHolder',
		description: 'placeHolder.',
		defaultValue: ' ',
	},

	{
		name: 'labelKeyType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
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
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Unique key's value ",
		description: `Key value that is used to generate unique key value.`,
		translatable: true,
	},

	{
		name: 'labelKey',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Labels key's value ",
		description: `Key value that is used to generate label value.`,
		translatable: true,
	},
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
