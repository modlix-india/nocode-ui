import { Schema } from '@fincity/kirun-js';
import {
	NAMESPACE_UI_ENGINE,
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'text',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text',
		description: 'Delimitter separated string for multiple list items.',
		translatable: true,
	},

	{
		name: 'delimitter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: ',',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: ',', displayName: 'Comma', description: 'Comma' },
			{ name: ':', displayName: 'SemiColon', description: 'SemiColon' },
			{ name: ' ', displayName: 'Space', description: 'Space' },
			{ name: '\n', displayName: 'New Line', description: 'New Line' },
		],
	},

	{
		name: 'listType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'List Type',
		description: 'Type of the list to use',
		defaultValue: 'ul',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'ul', displayName: 'Unordered List', description: 'An unordered List' },
			{ name: 'ol', displayName: 'Ordered List', description: 'An Ordered List' },
		],
	},

	{
		name: 'listIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'List icon',
		description: 'Icon to be used for list',
		defaultValue: '',
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'listStyleType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'List style type',
		description: 'Style Type of the List to use for listing',
		defaultValue: 'none',
	},

	{
		name: 'textKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Text's text type",
		description: `type of value that needs to be selected for dispaly label`,
		defaultValue: 'OBJECT',
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
		name: 'textKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Text text's value ",
		description: `Key value that is used to generate Text value.`,
		translatable: false,
	},

	{
		name: 'start',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: "List's start count",
		description:
			'The start attribute allows you to start the list counting from a number other than 1.',
		translatable: false,
	},

	{
		name: 'reversed',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: "List's reverse count",
		description: 'The reversed attribute will start the list counting down instead of up.',
		defaultValue: false,
		translatable: false,
	},

	{
		name: 'uniqueKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Text's key type",
		description: `type of value that needs to be selected for text key`,
		defaultValue: 'OBJECT',
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
			{
				name: 'RANDOM',
				displayName: 'Random',
				description: 'A Random key is associated with value which is costly in rendering',
			},
		],
	},

	{
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Text key's value ",
		description: `Key value that is used to generate Text value.`,
		translatable: false,
	},

	{
		name: 'datatype',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "TextList's data type",
		description: "TextList's data format.",
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
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: "TextLis's data",
		description: 'Data that is used to render TextList.',
	},

	{
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.list.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.list,
			target: ['list'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['listItem'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['listItem'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['listItem'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['listItem'],
		},
	},
	listItem: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'listItemMargin',
			displayName: 'List Item margin',
			description: 'Margin for list item, used for indent purposes.',
			prefix: 'listItem',
			target: ['listItem'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'listItemPadding',
			displayName: 'List Item padding',
			description: 'Paddin for list item.',
			prefix: 'listItem',
			target: ['listItem'],
		},
	},
	listItemIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'listItemIconFont',
			displayName: 'listItemIcon font properties',
			description: 'listItemIcon font properties',
			prefix: 'listItemIcon',
			target: ['listItemIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'listItemIconColor',
			displayName: 'listItemIcon color properties',
			description: 'listItemIcon color properties',
			prefix: 'listItemIcon',
			target: ['listItemIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'listItemIconMargin',
			displayName: 'List Item Icon margin',
			description: 'Margin for list item Icon.',
			prefix: 'listItemIcon',
			target: ['listItemIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'listItemIconPadding',
			displayName: 'List Item Icon padding',
			description: 'Paddin for list item Icon.',
			prefix: 'listItemIcon',
			target: ['listItemIcon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
