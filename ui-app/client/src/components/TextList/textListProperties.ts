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
