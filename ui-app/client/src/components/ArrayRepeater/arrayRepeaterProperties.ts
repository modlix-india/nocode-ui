import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
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
		displayName: 'Move buttons',
		group: ComponentPropertyGroup.BASIC,
		description:
			'When this option is set to true, User will be able to move items up/down the index in the repeater',
		defaultValue: false,
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
		name: 'add',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'add',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on add button.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'remove',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'remove',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on remove button.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'move',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'move',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked on move button.',
		group: ComponentPropertyGroup.EVENTS,
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
