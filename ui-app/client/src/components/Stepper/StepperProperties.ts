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
		name: 'showCheckOnComplete',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Displays a check icon in complete steps',
		description: 'Displays a check icon in complete steps.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},

	{
		name: 'textPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text position',
		description: 'Text position relative to icon',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
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
		name: 'isStepperVertical',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Make stepper vertical',
		description: 'Make stepper vertival.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
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
	icon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],

	text: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
