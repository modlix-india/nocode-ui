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
		displayName: 'Step Name',
		description: 'Name of the step.',
		multiValued: true,
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'icons',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Icon',
		description: 'Icon',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
		multiValued: true,
	},
	{
		name: 'successIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Done Icon',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
		multiValued: false,
	},
	{
		name: 'currentIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active Icon',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
		multiValued: false,
	},
	{
		name: 'nextIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Next Icon',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
		multiValued: false,
	},
	{
		name: 'images',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image',
		description: 'Image',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.IMAGE,
		multiValued: true,
	},
	{
		name: 'successImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Done Image',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.IMAGE,
		multiValued: false,
	},
	{
		name: 'currentImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Active Image',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.IMAGE,
		multiValued: false,
	},
	{
		name: 'nextImage',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Next Image',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.IMAGE,
		multiValued: false,
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
		displayName: 'Steps Count Type',
		description: 'Numbers, Roman Numerals, Alphabets to show when no icons are provided.',
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
			{
				name: 'NONE',
				displayName: 'None',
				description: 'None',
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
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'showLines',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Lines',
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
				displayName: 'Default',
				description: 'Default',
			},
			{
				name: '_big_circle',
				displayName: 'Big Circle',
				description: 'Big Circle',
			},
			{
				name: '_pills',
				displayName: 'Pills',
				description: 'Pills',
			},
			{
				name: '_rectangle_arrow',
				displayName: 'Rectangle Arrow',
				description: 'Rectangle Arrow',
			},
		],
	},
	{
		name: 'onClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Step Change Event',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when step is changed.',
		group: ComponentPropertyGroup.EVENTS,
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'useActiveIconAlways',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Use Active Icon Always',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'useSuccessIconAlways',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Use Done Icon Always',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: true,
	},
	{
		name: 'useNextIconAlways',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Use Next Icon Always',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
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
	doneListItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.list.type,
	],
	activeListItem: [
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
	doneItemContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	activeItemContainer: [
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
	doneStep: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	activeStep: [
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
	doneTitle: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	activeTitle: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	line: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	doneLine: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	activeLine: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	activeBeforeLine: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
