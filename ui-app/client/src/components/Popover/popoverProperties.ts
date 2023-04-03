import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyEditor } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'position',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Popover position',
		description: `Popover position.`,
		defaultValue: 'bottom-end',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'bottom',
				displayName: 'Bottom Center',
				description: 'Position Bottom Center.',
			},
			{
				name: 'bottom-start',
				displayName: 'Bottom Start',
				description: 'Position Bottom Start.',
			},
			{
				name: 'bottom-end',
				displayName: 'Bottom End',
				description: 'Position Bottom End.',
			},
			{ name: 'top', displayName: 'Top Center', description: 'Position Top Center.' },
			{ name: 'top-start', displayName: 'Top Start', description: 'Position Top Start.' },
			{ name: 'top-end', displayName: 'Top End', description: 'Position Top End.' },
			{ name: 'left', displayName: 'Left Center', description: 'Position Left Center.' },
			{ name: 'left-start', displayName: 'Left Start', description: 'Position Left Start.' },
			{
				name: 'left-end',
				displayName: 'Left End',
				description: 'Position Left End.',
			},
			{ name: 'right', displayName: 'Right Center', description: 'Position Right Center.' },
			{
				name: 'right-start',
				displayName: 'Right Start',
				description: 'Position Right Start.',
			},
			{
				name: 'right-end',
				displayName: 'Right End',
				description: 'Position Right End.',
			},
		],
	},
	{
		name: 'showTip',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Popover tip',
		description: `Show Popover tip.`,
		defaultValue: true,
	},
	{
		name: 'closeOnLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Popover on leave',
		description: `Close Popover on leave.`,
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			target: ['popoverContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['popoverContainer'],
		},
	},
	popoverContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'popoverContainerBorder',
			displayName: 'Popover Container Border',
			description: 'Popover Container Border.',
			prefix: 'popoverContainer',
			target: ['popoverContainer'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
