import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showTill',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Show Till',
		description: 'Show Till',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'H2',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: 'H1',
				displayName: 'H1',
				description: 'Heading1',
			},
			{
				name: 'H2',
				displayName: 'H2',
				description: 'Heading2',
			},
			{
				name: 'H3',
				displayName: 'H3',
				description: 'Heading3',
			},
			{
				name: 'H4',
				displayName: 'H4',
				description: 'Heading4',
			},
			{
				name: 'H5',
				displayName: 'H5',
				description: 'Heading5',
			},
			{
				name: 'H6',
				displayName: 'H6',
				description: 'Heading6',
			},
		],
	},
	{
		name: 'makeCollapsible',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Make collapsible',
		description: 'Make the toc expandable',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'makeCollapsibleTill',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Make collapsible Till',
		description: 'Make collapsible Till',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'H2',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: 'H1',
				displayName: 'H1',
				description: 'Heading1',
			},
			{
				name: 'H2',
				displayName: 'H2',
				description: 'Heading2',
			},
			{
				name: 'H3',
				displayName: 'H3',
				description: 'Heading3',
			},
			{
				name: 'H4',
				displayName: 'H4',
				description: 'Heading4',
			},
			{
				name: 'H5',
				displayName: 'H5',
				description: 'Heading5',
			},
			{
				name: 'H6',
				displayName: 'H6',
				description: 'Heading6',
			},
		],
	},
	{
		name: 'goToTopStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'goToTopStyle',
		description: 'go to top style',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'onlyText',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'onlyText',
				displayName: 'Only Text',
				description: 'Only Text',
			},
			{
				name: 'onlyImage',
				displayName: 'Only Image',
				description: 'Only Image',
			},
			{
				name: 'leftImageWithText',
				displayName: 'LeftImage With Text',
				description: 'LeftImage With Text',
			},
			{
				name: 'rightImageWithText',
				displayName: 'RightImage With Text',
				description: 'RightImage With Text',
			},
		],
	},
	{
		name: 'goToBottomStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'goToBottomStyle',
		description: 'go to bottom style',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'onlyText',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'onlyText',
				displayName: 'Only Text',
				description: 'Only Text',
			},
			{
				name: 'onlyImage',
				displayName: 'Only Image',
				description: 'Only Image',
			},
			{
				name: 'leftImageWithText',
				displayName: 'LeftImage With Text',
				description: 'LeftImage With Text',
			},
			{
				name: 'rightImageWithText',
				displayName: 'RightImage With Text',
				description: 'RightImage With Text',
			},
		],
	},
	{
		name: 'titleText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Title Text',
		description: 'Text to be shown to for the title.',
		translatable: true,
		defaultValue:"Table of Contents",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'topLabelText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Top Label Text',
		description: 'Text to be shown to for the gototop.',
		translatable: true,
		defaultValue:"Top",
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'bottomLabelText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Bottom Label Text',
		description: 'Text to be shown to for the gotobottom.',
		translatable: true,
		defaultValue:"Bottom",
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'topTextImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Top Text image",
		description: "Top Text image",
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'bottomTextImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Bottom Text image",
		description: "Bottom Text image",
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'goToTopLabel',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'GoToTopLabel',
		description: 'Go to top label',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'goToBottomLabel',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'GoToBottomLabel',
		description: 'Go to Bottom label',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'numericBullets',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'NumericBullets',
		description: 'NumericBullets',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
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
	H1: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	H2: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	H3: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	H4: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	H5: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	H6: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	Header: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	goToTopLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	goToBottomLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	numericBullets: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	topImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	bottomImage: [
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
