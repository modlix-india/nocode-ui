import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'position',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Popover position',
		description: 'Popover position with respect to first child which is the trigger.',
		defaultValue: 'bottom-end',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
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
		description: 'Show Popover tip.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'closeOnLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Popover on leave',
		description: 'Close Popover on leave.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'closeOnOutsideClick',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close Popover on outside click',
		description: 'Close Popover on outside click.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'showInDesign',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show in Design Mode',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
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
	popoverParentContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	popoverContainer: [
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
