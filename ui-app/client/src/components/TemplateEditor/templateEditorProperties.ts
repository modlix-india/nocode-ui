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
		displayName: 'Locked Template Type',
		description:
			'Optionally lock the editor to a single template type. Leave empty to let the user choose the type inside the editor.',
		schema: SCHEMA_STRING_COMP_PROP,
		enumValues: [
			{ name: 'email', displayName: 'Email' },
			{ name: 'pdf', displayName: 'PDF' },
			{ name: 'inapp', displayName: 'In App' },
			{ name: 'whatsapp', displayName: 'WhatsApp' },
			{ name: 'sms', displayName: 'SMS' },
		],
	},
	{
		name: 'aiEndpoint',
		displayName: 'AI Endpoint',
		description:
			"Endpoint the editor's AI tab posts prompts to (POST {prompt, template, language, part, templateType} -> {subject, html, message}). Leave empty to hide the AI tab.",
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: 'api/ai/appbuilder/template',
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
