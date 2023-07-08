import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Bar Labels value ',
		description: 'Progress Bar Label value.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'showProgressValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Progress Bar value ',
		description: 'Show Progress Bar value.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'progressNotStartedLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Not started Label',
		description: 'Progress Not started Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'inProgressLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'In Progress Label',
		description: 'In Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'progressCompletedLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Completed Label',
		description: 'Progress Completed Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'appendProgressValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Append Progress Label',
		description: 'Append Progress value to the progress label.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	{
		name: 'prependProgressValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Prepend Progress Label',
		description: `Prepend Progress value to the progress label.`,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,

	{
		name: 'progressBarDesignSelection',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Bar Selection Type',
		description: 'Type of the selection of a Progress Bar',
		defaultValue: '_progressBarDesignOne',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: '_progressBarDesignOne',
				displayName: 'Progress Bar Design One',
				description: 'Progress Bar design one',
			},
			{
				name: '_simpleMenuDesign2',
				displayName: 'simpleMenuDesign2',
				description: 'simple menu design two',
			},
			{
				name: '_simpleMenuDesign3',
				displayName: 'simpleMenuDesign3',
				description: 'simple menu design three',
			},
			{
				name: '_colouredMenuDesign1',
				displayName: 'ColouredMenuDesign1',
				description: 'coloured menu design one',
			},
			{
				name: '_colouredMenuDesign2',
				displayName: 'ColouredMenuDesign2',
				description: 'coloured menu design two',
			},
			{
				name: '_colouredMenuDesign3',
				displayName: 'ColouredMenuDesign3',
				description: 'coloured menu design three',
			},
			{
				name: '_filledMenuDesign1',
				displayName: 'FilledMenuDesign1',
				description: 'filled menu design one',
			},
			{
				name: '_filledMenuDesign2',
				displayName: 'FilledMenuDesign2',
				description: 'filled menu design two',
			},
			{
				name: '_filledMenuDesign3',
				displayName: 'FilledMenuDesign3',
				description: 'filled menu design three',
			},
			{
				name: '_filledMenuDesign4',
				displayName: 'FilledMenuDesign4',
				description: 'filled menu design four',
			},
			{
				name: '_filledMenuDesign5',
				displayName: 'FilledMenuDesign5',
				description: 'filled menu design five',
			},
			{
				name: '_simpleMenuHorizontalDesign1',
				displayName: 'simpleMenuHorizontalDesign1',
				description: 'simple menu design one',
			},
			{
				name: '_simpleMenuHorizontalDesign2',
				displayName: 'simpleMenuHorizontalDesign2',
				description: 'simple menu design two',
			},
			{
				name: '_simpleMenuHorizontalDesign3',
				displayName: 'simpleMenuHorizontalDesign3',
				description: 'simple menu design three',
			},
			{
				name: '_simpleMenuHorizontalDesign4',
				displayName: 'simpleMenuHorizontalDesign4',
				description: 'simple menu design four',
			},
			{
				name: '_filledMenuHorizontalDesign1',
				displayName: 'filledMenuHorizontalDesign1',
				description: 'filled menu horizontal design one',
			},
		],
	},
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
	progressValue: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	progress: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	progressBar: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	progressBarLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
