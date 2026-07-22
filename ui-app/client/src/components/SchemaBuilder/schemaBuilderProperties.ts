import { SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentStylePropertyDefinition } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'rootSchemaType',
		displayName: 'Root Schema type',
		schema: SCHEMA_STRING_COMP_PROP,
		description: 'Root schema type',
		enumValues: [
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
	{
		name: 'defaultView',
		displayName: 'Default View',
		schema: SCHEMA_STRING_COMP_PROP,
		description: 'Editor view shown initially; users can switch views at runtime.',
		defaultValue: 'COMPACT',
		enumValues: [
			{
				name: 'COMPACT',
				displayName: 'Compact Tree',
				description: 'Tree with one row per field',
			},
			{
				name: 'EXTENDED',
				displayName: 'Extended',
				description: 'Tree with every setting visible inline',
			},
			{ name: 'JSON', displayName: 'JSON', description: 'Raw schema JSON editor' },
		],
	},
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Application Code',
		description: 'Application Code for listing app-defined schemas in references',
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Client Code',
		description: 'Client Code for listing app-defined schemas in references',
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
