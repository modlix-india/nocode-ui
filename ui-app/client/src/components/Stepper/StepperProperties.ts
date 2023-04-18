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
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.name]:
			COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.name]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.name]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.name]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.name]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.name]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.name]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.name]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.name]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.list.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.list,
			target: ['list'],
		},
	},
	listItem: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.list.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.list,
			displayName: 'List item',
			description: "List Item's list css",
			prefix: 'listItem',
			target: ['listItem'],
		},
	},
	itemContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			displayName: 'List item Container',
			description: "List Item container's flex css",
			prefix: 'itemContainer',
			target: ['itemContainer'],
		},
	},
	icon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'icon color',
			description: 'icon color css',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'icon font',
			description: 'icon font css',
			prefix: 'icon',
			target: ['icon'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			displayName: 'icon padding',
			description: 'icon padding css',
			prefix: 'icon',
			target: ['icon'],
		},
	},

	text: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			displayName: 'text color',
			description: 'text color css',
			prefix: 'text',
			target: ['text'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			displayName: 'text font',
			description: 'text font css',
			prefix: 'text',
			target: ['text'],
		},

		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.name]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			displayName: 'text padding',
			description: 'text padding css',
			prefix: 'text',
			target: ['text'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
