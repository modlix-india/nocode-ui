import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'position',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Popover position',
		description: `Popover position.`,
		defaultValue: 'bottom-center',
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
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
