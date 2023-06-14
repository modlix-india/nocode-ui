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
		group: ComponentPropertyGroup.BASIC,
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
};

export { propertiesDefinition, stylePropertiesDefinition };
