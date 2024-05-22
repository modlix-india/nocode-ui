import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'titles',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Comma separated titles',
		description: 'List of titles that are comma separated and should be in order.',
		defaultValue: '',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},

	{
		name: 'icons',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Comma separated icons',
		description: 'List of icon that are comma separated and should be in order of titles.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '',
	},
	{
		name: 'textPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text position',
		description: 'Text position relative to icon',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'RIGHT',
		enumValues: [
			{
				name: 'RIGHT',
				displayName: 'Right',
				description: 'Right',
			},
			{
				name: 'LEFT',
				displayName: 'Left',
				description: 'Left',
			},
			{
				name: 'TOP',
				displayName: 'Top',
				description: 'Top',
			},
			{
				name: 'BOTTOM',
				displayName: 'Bottom',
				description: 'Bottom',
			},
		],
	},
	{
		name: 'countingType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Counting type of Stepper',
		description: "Stepper's counting type",
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'NUMBER',
		enumValues: [
			{
				name: 'NUMBER',
				displayName: 'Numbers',
				description: 'Numbers',
			},
			{
				name: 'ROMAN',
				displayName: 'Lowercase Roman Numerals',
				description: 'Lowercase Roman Numerals',
			},
			{
				name: 'ROMAN_UPPERCASE',
				displayName: 'Uppercase Roman Numerals',
				description: 'Uppercase Roman Numerals',
			},
			{
				name: 'ALPHA_UPPERCASE',
				displayName: 'Uppercase Alphabets',
				description: 'Uppercase Alphabets',
			},
			{
				name: 'ALPHA',
				displayName: 'Lowercase alphabets',
				description: 'Lowercase alphabets',
			},
		],
	},

	{
		name: 'isStepperVertical',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Make stepper vertical',
		description: 'Make stepper vertival.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'showCheckOnComplete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Displays a check icon in complete steps',
		description: 'Displays a check icon in complete steps.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'moveToAnyPreviousStep',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Can Move to any previous step',
		description: 'Can Move to any previous step.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'moveToAnyFutureStep',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Can Move to any Future step',
		description: 'Can Move to any Future step.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'showLines',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Lines',
		description: 'Show Lines.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	{
		name: 'stepperDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Stepper Selection Type',
		description: 'Type of the selection of a Stepper',
		defaultValue: '_default',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_default',
				displayName: 'Stepper Default Design',
				description: 'Stepper Default Design.',
			},
			{
				name: '_big_circle',
				displayName: 'Stepper big circular design.',
				description: 'Stepper big circular design.',
			},
			{
				name: '_pills',
				displayName: 'Stepper pills design.',
				description: 'Stepper pills design.',
			},
			{
				name: '_rectangle_arrow',
				displayName: 'Stepper Rectangle Arrow design.',
				description: 'Stepper Rectangle Arrow design.',
			},
		],
	},
	{
		name: 'onClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Click Event',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,

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
	list: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.list.type,
	],
	listItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.list.type,
	],
	itemContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	step: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],

	title: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
