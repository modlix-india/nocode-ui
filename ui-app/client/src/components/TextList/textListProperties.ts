import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
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
		name: 'text',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text',
		description: 'Delimitter separated string for multiple list items.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},

	{
		name: 'delimitter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: ',',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
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
		group: ComponentPropertyGroup.BASIC,
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
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'listStyleType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'List style type',
		description: 'Style Type of the List to use for listing, based on HTML list style type.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'none',
	},

	{
		name: 'start',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: "List's start count",
		group: ComponentPropertyGroup.ADVANCED,
		description:
			'The start attribute allows you to start the list counting from a number other than 1.',
		translatable: false,
	},

	{
		name: 'reversed',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: "List's reverse count",
		group: ComponentPropertyGroup.ADVANCED,
		description: 'The reversed attribute will start the list counting down instead of up.',
		defaultValue: false,
		translatable: false,
	},

	COMMON_COMPONENT_PROPERTIES.datatype,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,

	COMMON_COMPONENT_PROPERTIES.labelKeyType,

	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.labelKey,

	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: "TextList's data",
		group: ComponentPropertyGroup.DATA,
		description: 'Data that is used to render TextList.',
	},

	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	listItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.list.type,
	],
	listItemIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
