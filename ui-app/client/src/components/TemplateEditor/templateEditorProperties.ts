import {
	SCHEMA_STRING_COMP_PROP
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'templateType',
		displayName: 'Template Type',
		description: 'The type of template to be used',
		schema: SCHEMA_STRING_COMP_PROP,
		enumValues: [
			{ name: 'email', displayName: 'Email' },
			{ name: 'whatsapp', displayName: 'WhatsApp' },
			{ name: 'inapp', displayName: 'In App' },
		],
	},
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
