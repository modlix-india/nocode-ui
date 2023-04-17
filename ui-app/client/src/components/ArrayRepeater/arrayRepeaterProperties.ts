import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showAdd',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Add button',
		description: 'When this option is set to true, User will be able to add items to repeater',
		group: ComponentPropertyGroup.IMPORTANT,
		defaultValue: false,
	},
	{
		name: 'showDelete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Delete button',
		group: ComponentPropertyGroup.IMPORTANT,
		description:
			'When this option is set to true, User will be able to delete items from repeater',
		defaultValue: false,
	},
	{
		name: 'showMove',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Move buttons',
		group: ComponentPropertyGroup.IMPORTANT,
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

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
