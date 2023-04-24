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
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['progressBarLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['progressBarLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['progressBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['progressBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['progressBar'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['progress'],
		},
	},
	progressValue: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'Progress Bar Value Font',
			description: 'Progress Bar Value Font',
			displayName: 'Progress Bar Value Font',
			prefix: 'progress',
			target: ['progressValue'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'Progress Bar Value Color',
			description: 'Progress Bar Value Color',
			displayName: 'Progress Bar Value Color',
			prefix: 'progress',
			target: ['progressValue'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
