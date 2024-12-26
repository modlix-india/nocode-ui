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
	},
	{
		name: 'dragDataPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data Prefix',
	},
	{
		name: 'dragDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drag Data Type',
		description: 'When prefix is used json is stringified and prefix is added to the string.',
		defaultValue: 'text/plain',
		enumValues: [
			{ name: 'text/plain', displayName: 'Text' },
			{ name: 'application/json', displayName: 'JSON' },
		],
	},
	{
		name: 'dropDataPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Prefix',
		description: 'Prefix to be removed from the dropped data and then parsed.',
	},
	{
		name: 'dropDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Drop Data Type',
		defaultValue: 'text/plain',
		enumValues: [
			{ name: 'text/plain', displayName: 'Text' },
			{ name: 'application/json', displayName: 'JSON' },
		],
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
		name: 'onEnteringViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Entering Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid enters view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onLeavingViewport',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Leaving Viewport',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when grid leaves view port.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onDropData',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Drop Data',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when data is dropped.',
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
	COMMON_COMPONENT_PROPERTIES.background,
	{
		name: 'borderRadius',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Border Type',
		description: 'Border Type',
		defaultValue: '_STRAIGHT',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_STRAIGHT', displayName: 'Straight', description: 'Straight' },
			{ name: '_ROUND', displayName: 'Round', description: 'Round' },
			{ name: '_VERYROUND', displayName: 'VeryRound', description: 'VeryRound' },
		],
	},
	{
		name: 'border',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Border Size Type',
		description: 'Border Size Type',
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'None' },
			{ name: '_LIGHT', displayName: 'Light', description: 'Light' },
			{ name: '_MEDIUM', displayName: 'Medium', description: 'Medium' },
			{ name: '_HEAVY', displayName: 'Heavy', description: 'Heavy' },
		],
	},
	{
		name: 'boxShadow',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'BoxShadow Type',
		description: 'BoxShadow Type',
		defaultValue: '_NONE',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_NONE', displayName: 'None', description: 'None' },
			{
				name: '_DARKLOW',
				displayName: 'DarkLow',
				description: 'Light shadow for dark background',
			},
			{
				name: '_DARKMEDIUM',
				displayName: 'DarkMedium',
				description: 'Medium shadow for dark background',
			},
			{
				name: '_DARKHIGH',
				displayName: 'DarkHigh',
				description: 'High shadow for dark background',
			},
			{
				name: '_LIGHTLOW',
				displayName: 'LightLow',
				description: 'Light shadow for light background',
			},
			{
				name: '_LIGHTMEDIUM',
				displayName: 'LightMedium',
				description: 'Medium shadow for light background',
			},
			{
				name: '_LIGHTHIGH',
				displayName: 'LightHigh',
				description: 'High shadow for light shadow',
			},
		],
	},
	{
		name: 'stopPropagation',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Stop propagation of click event',
		description:
			'Stop propagation of click event which will not trigger the container click event.',
		defaultValue: false,
	},
	{
		name: 'preventDefault',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Prevent default of click event',
		description: 'Prevent default of click event.',
		defaultValue: false,
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
