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
		name: 'schema',
		displayName: 'Schema',
		description: 'Schema to generate form',
		schema: SCHEMA_ANY_COMP_PROP,
		editor: ComponentPropertyEditor.SCHEMA,
		defaultValue: {
			type: [
				'INTEGER',
				'LONG',
				'FLOAT',
				'DOUBLE',
				'STRING',
				'OBJECT',
				'ARRAY',
				'BOOLEAN',
				'NULL',
			],
			name: 'Any Type',
			namespace: '_',
		},
	},
	{
		name: 'design',
		displayName: 'Design',
		description: 'Design of the form',
		schema: SCHEMA_STRING_COMP_PROP,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'simple',
		enumValues: [
			{ name: 'simple', displayName: 'Simple', description: 'Simple Design' },
			{ name: 'complex', displayName: 'Complex', description: 'Heavy Design' },
		],
		notImplemented: true,
	},
	{
		name: 'showJSONEditorButton',
		displayName: 'Show JSON Editor Button',
		description: 'Show JSON Editor Button',
		schema: SCHEMA_BOOL_COMP_PROP,
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
