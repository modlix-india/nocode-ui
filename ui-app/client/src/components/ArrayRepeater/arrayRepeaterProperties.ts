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
		name: 'showAdd',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Add button',
		description: 'When this option is set to true, User will be able to add items to repeater',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'showDelete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Delete button',
		group: ComponentPropertyGroup.BASIC,
		description:
			'When this option is set to true, User will be able to delete items from repeater',
		defaultValue: false,
	},
	{
		name: 'showMove',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Move',
		group: ComponentPropertyGroup.BASIC,
		description:
			'When this option is set to true, User will be able to move items up/down the index in the repeater',
		defaultValue: false,
	},
	{
		name: 'addIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Add Icon',
		description: 'Icon to be shown in the add button.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'deleteIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Delete Icon',
		description: 'Icon to be shown in the delete button.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'moveUpIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'MoveUp Icon',
		description: 'Icon to be shown in the moveup button.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'moveDownIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'MoveDown Icon',
		description: 'Icon to be shown in the movedown button.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'isItemDraggable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Draggable Items',
		group: ComponentPropertyGroup.ADVANCED,
		description:
			'When this option is set to true, User will be able to drag items up the index in the repeater',
		defaultValue: false,
	},
	{
		name: 'addEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Adding',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on Add button.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'removeEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Delete',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on Delete button.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'moveEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Moving',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on Move button.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'defaultData',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Default Data',
		description: 'Default data for repeater',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'dataType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Data Type',
		description: 'Data type for repeater',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'array',
		enumValues: [
			{ name: 'array', displayName: 'Array' },
			{ name: 'object', displayName: 'Object' },
		],
	},
	{
		name: 'orderKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Order Key',
		description: 'Key to be used to order the items in the repeater, use "__index" to order by keys in the object',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'orderDirection',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Order Direction',
		description: 'Direction to be used to order the items in the repeater',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'asc',
		enumValues: [{ name: 'asc', displayName: 'Ascending' }, { name: 'desc', displayName: 'Descending' }],
	},
	{
		name: 'orderValue',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Order Value Type to update',
		description: 'Type of value to be used to order the items in the repeater',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'index',
		enumValues: [
			{ name: 'index', displayName: 'From 0' },
			{ name: 'index1', displayName: 'From 1' },
			{name: 'value', displayName: 'Value in the key be used'}
		],
	},
	{
		name: 'missingValueOrder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Missing Value Order',
		description: 'Order to be used for missing values in the order key',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'last',
		enumValues: [{ name: 'last', displayName: 'Last' }, { name: 'first', displayName: 'First' }],
	},
	{
		name: 'newKeyStrategy',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'New Key Strategy For Object',
		description: 'Strategy to be used to generate new keys for the items in the repeater',
		group: ComponentPropertyGroup.DATA,
		enumValues: [{ name: 'index', displayName: 'Index' }, { name: 'shortUUID', displayName: 'Short UUID' }],
	},
	{
		name: 'dropDataPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Prefix',
		description: 'Prefix to be removed from the dropped data and then parsed.',
	},
	{
		name: 'dropDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Type',
		defaultValue: 'text/plain',
		enumValues: [
			{ name: 'text/plain', displayName: 'Text' },
			{ name: 'application/json', displayName: 'JSON' },
		],
	},
	{
		name: 'onDropData',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Drop Data',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when data is dropped.',
		group: ComponentPropertyGroup.EVENTS,
	},

	{
		name: 'filterCondition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Filter Condition',
		description:
			'Filter condition using "Data." to filter the array items. Eg: "Data.marks > 20" gives all the objects with marks greater than 20.',
	},

	COMMON_COMPONENT_PROPERTIES.layout,
	COMMON_COMPONENT_PROPERTIES.readOnly,
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
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	repeaterProperties: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	repeatedComp: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	iconGrid: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	add: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	remove: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	move: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
