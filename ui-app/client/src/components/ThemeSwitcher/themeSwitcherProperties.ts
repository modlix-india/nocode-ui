import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		defaultValue: '_segmented',
		enumValues: [
			{
				name: '_segmented',
				displayName: 'Segmented',
				description: 'A row of options with the active one marked. Shows every theme.',
			},
			{
				name: '_toggle',
				displayName: 'Toggle',
				description:
					'A two state switch. Uses the first two themes in order, and renders ' +
					'nothing if the app has fewer than two.',
			},
			{
				name: '_popover',
				displayName: 'Popover',
				description:
					'A button showing the active theme, opening a list of all of them.',
			},
		],
	},
	{
		name: 'showLabel',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Names',
		description:
			"Show each theme's display name on the control itself. Off shows icons " +
			'alone, which needs every theme to have an icon set. The Popover design ' +
			"labels the rows in its open list either way, because a list of icons alone " +
			'cannot say which theme is which.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'position',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Popover Position',
		description: 'Where the popover panel opens, relative to the button.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'bottom-end',
		enumValues: [
			{ name: 'bottom', displayName: 'Bottom', description: 'Bottom' },
			{ name: 'bottom-start', displayName: 'Bottom Start', description: 'Bottom start' },
			{ name: 'bottom-end', displayName: 'Bottom End', description: 'Bottom end' },
			{ name: 'top', displayName: 'Top', description: 'Top' },
			{ name: 'top-start', displayName: 'Top Start', description: 'Top start' },
			{ name: 'top-end', displayName: 'Top End', description: 'Top end' },
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.onChange,
		description:
			'Runs after the theme has been applied and stored. Not needed to switch ' +
			'themes; the component does that itself.',
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
	option: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	icon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	panel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
