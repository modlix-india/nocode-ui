import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
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
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Icon',
		description: 'Icon',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline',
				description: 'Outline',
			},
			{ name: '_filled', displayName: 'Filled', description: 'Filled' },
			{
				name: '_rounded',
				displayName: 'Rounded',
				description: 'Rounded',
			},
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.colorScheme,
		enumValues: [
			{
				name: '_defaultIcon',
				displayName: 'Default',
				description: 'Default',
			},
			{
				name: '_lightIcon',
				displayName: 'Light',
				description: 'Light',
			},
			...COMMON_COMPONENT_PROPERTIES.colorScheme.enumValues!,
		],
	},
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'stopPropagation',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Stop Propagation',
		description: 'Prevents the event from bubbling up the DOM tree',
		group: ComponentPropertyGroup.EVENTS,
		defaultValue: false,
	},
	{
		name: 'preventDefault',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Prevent Default',
		description: 'Prevents the default action of the event',
		group: ComponentPropertyGroup.EVENTS,
		defaultValue: false,
	},
	{
		name: 'tooltipText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Text',
		description: 'Text to display in the tooltip when hovering over the icon',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: '',
	},
	{
		name: 'tooltipEnabled',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Enable Tooltip',
		description: 'Whether to show a tooltip on hover',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'tooltipPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Position',
		description: 'Position of the tooltip relative to the icon',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'bottom',
		enumValues: [
			{ name: 'top', displayName: 'Top' },
			{ name: 'bottom', displayName: 'Bottom' },
			{ name: 'left', displayName: 'Left' },
			{ name: 'right', displayName: 'Right' },
			{ name: 'center', displayName: 'Center' },
		],
	},
	{
		name: 'tooltipOffset',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Tooltip Offset',
		description: 'Distance between the tooltip and the icon in pixels',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 10,
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
	tooltip: [
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
