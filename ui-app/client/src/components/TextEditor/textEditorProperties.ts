import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'documentType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Editor Type',
		description: 'Type of the text to edit',
		defaultValue: 'text',
		enumValues: [
			{
				name: 'json',
				displayName: 'JSON',
				description: 'JSON',
			},
			{
				name: 'text',
				displayName: 'Text',
				description: 'Text',
			},
			{
				name: 'html',
				displayName: 'HTML',
				description: 'HTML',
			},
			{
				name: 'css',
				displayName: 'CSS',
				description: 'CSS',
			},
			{
				name: 'typescript',
				displayName: 'Typescript',
				description: 'Typescript',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,

		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
