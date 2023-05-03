import { Schema } from '@fincity/kirun-js';
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
		name: 'rootSchemaType',
		displayName: 'Root Schema type',
		schema: SCHEMA_STRING_COMP_PROP,
		description: 'Root schema type',
		defaultValue: 'ANY',
		enumValues: [
			{ name: 'ANY', displayName: 'Any', description: 'Any' },
			{ name: 'OBJECT', displayName: 'Object', description: 'Object' },
			{ name: 'ARRAY', displayName: 'Array', description: 'Array' },
			{ name: 'STRING', displayName: 'String', description: 'String' },
			{ name: 'INTEGER', displayName: 'Integer', description: 'Integer' },
			{ name: 'LONG', displayName: 'Long', description: 'Long' },
			{ name: 'FLOAT', displayName: 'Float', description: 'Float' },
			{ name: 'DOUBLE', displayName: 'Double', description: 'Double' },
			{ name: 'BOOLEAN', displayName: 'Boolean', description: 'Boolean' },
		],
	},
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
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
