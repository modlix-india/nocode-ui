import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../../types/common';
import {
	COMPONENT_STYLE_GROUP_PROPERTIES,
	COMMON_COMPONENT_PROPERTIES,
} from '../../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'rowPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Row Position',
		description: 'Determines whether the detail row appears above or below the main data row.',
		defaultValue: 'BELOW',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'ABOVE', displayName: 'Above Row', description: 'Show above the data row' },
			{ name: 'BELOW', displayName: 'Below Row', description: 'Show below the data row' },
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
	rowContainer: [
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
