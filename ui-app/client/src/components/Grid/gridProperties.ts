import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
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
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.linkPath,
	COMMON_COMPONENT_PROPERTIES.linkTargetType,
	COMMON_COMPONENT_PROPERTIES.layout,
	{
		name: 'dragData',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data',
		description: 'Drag Data.',
	},
	{
		name: 'onMouseEnter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Enter',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Enter.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMouseLeave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mouse Leave',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Mouse Leave.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'containerType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Container Type (SEO)',
		description: 'container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DIV',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'DIV', displayName: 'DIV', description: 'Div tag' },
			{ name: 'ARTICLE', displayName: 'ARTICLE', description: 'Article tag' },
			{ name: 'SECTION', displayName: 'SECTION', description: 'Section tag' },
			{ name: 'ASIDE', displayName: 'ASIDE', description: 'Aside tag' },
			{ name: 'FOOTER', displayName: 'FOOTER', description: 'Footer tag' },
			{ name: 'HEADER', displayName: 'HEADER', description: 'Header tag' },
			{ name: 'MAIN', displayName: 'MAIN', description: 'Main tag' },
			{ name: 'NAV', displayName: 'NAV', description: 'Nav tag' },
		],
	},
	{
		name: 'background',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background',
		description:
			'Background to be applied, these backgrounds come from theme, please visit theme editor to check or modify the colors.',
		editor: ComponentPropertyEditor.BACKGROUND,
		defaultValue: '',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '', displayName: 'None', description: 'None' },
			{
				name: '_PRIMARYBG',
				displayName: 'Primary background',
				description: 'Primary background',
			},
			{
				name: '_SECONDARYBG',
				displayName: 'Secondary background',
				description: 'Secondary background',
			},
			{
				name: '_TERTIARYBG',
				displayName: 'Tertiary background',
				description: 'Tertiary background',
			},
			{
				name: '_QUATERNARYBG',
				displayName: 'Quaternary background',
				description: 'Quaternary background',
			},
			{
				name: '_QUINARYBG',
				displayName: 'Quinary background',
				description: 'Quinary background',
			},
			{
				name: '_SENARYBG',
				displayName: 'Senary background',
				description: 'Senary background',
			},
			{
				name: '_SEPTENARYBG',
				displayName: 'Septenary background',
				description: 'Septenary background',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
