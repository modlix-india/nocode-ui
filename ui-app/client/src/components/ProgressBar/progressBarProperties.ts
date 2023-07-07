import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showProgressValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Progress value',
		description: 'Show Progress value.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'progressValue',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Progress Value',
		description: 'Progress Value.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'progressValueUnit',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Value Unit',
		description: 'Progress Value Unit.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'showProgressLabel',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Progress Label',
		description: 'Show Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'noProgressLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'No Progress Label',
		description: 'No Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'progressLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Label',
		description: 'Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'completedProgressLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Completed Progress Label',
		description: 'Completed Progress Label.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},

	{
		name: 'progressLabelPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Label Position',
		description: 'Position of Progress Label with respect to Progress value',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'Right',
		enumValues: [
			{
				name: 'Right',
				displayName: 'Progress Label Right',
				description: 'Progress Label is right to Progress Value.',
			},
			{
				name: 'Left',
				displayName: 'Progress Label Left',
				description: 'Progress Label is left to Progress Value.',
			},
		],
	},
	{
		name: 'labelAndValueContainerPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label and Value Container Position',
		description: 'Position of Label and Value Container.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: 'Left',
		enumValues: [
			{
				name: 'Left',
				displayName: 'Label and Value Container Left',
				description: 'Label and Value Container Left.',
			},
			{
				name: 'Center',
				displayName: 'Label and Value Container Center',
				description: 'Label and Value Container Center.',
			},
			{
				name: 'Right',
				displayName: 'Label and Value Container Right',
				description: 'Label and Value Container Right.',
			},
		],
	},

	{
		name: 'progressBarDesignSelection',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Progress Bar Selection Type',
		description: 'Type of the selection of a Progress Bar',
		defaultValue: '_progressBarDesignOne',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_progressBarDesignOne',
				displayName: 'Progress Bar Design One',
				description: 'Progress Bar design one.',
			},
			{
				name: '_simpleMenuDesigntwo',
				displayName: 'Progress Bar Design Two',
				description: 'Progress Bar design two.',
			},
			{
				name: '_simpleMenuDesignThree',
				displayName: 'Progress Bar Design Three',
				description: 'Progress Bar design three.',
			},
		],
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
	currentProgress: [
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
	labelAndValueContainer: [
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
	progressLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
