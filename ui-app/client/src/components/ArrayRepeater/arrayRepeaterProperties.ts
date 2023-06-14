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
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.image.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.shape.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.list.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
