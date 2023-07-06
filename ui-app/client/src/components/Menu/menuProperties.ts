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
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Link label',
		description: "Link's display label.",
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{ ...COMMON_COMPONENT_PROPERTIES.linkPath, group: ComponentPropertyGroup.BASIC },
	{ ...COMMON_COMPONENT_PROPERTIES.linkTargetType, group: ComponentPropertyGroup.BASIC },
	{ ...COMMON_COMPONENT_PROPERTIES.linkTargetFeatures, group: ComponentPropertyGroup.BASIC },
	{
		name: 'showButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Link Button',
		description: 'Button beside the link to redirect.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'externalButtonTarget',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Link Button's target",
		description: "Link Button's target.",
		defaultValue: '_blank',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'externalButtonFeatures',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Link Button's target features",
		description: "Link Button's target features",
	},
	{
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Menu's icon",
		description: "Menu's icon to be displayed on left.",
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'caretIconOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Menu's caret icon open",
		description: "Menu's icon to be displayed when menu open.",
		defaultValue: 'fa fa-solid fa-angle-down',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'caretIconClose',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Menu's caret icon close",
		description: "Menu's icon to be displayed when menu close.",
		defaultValue: 'fa fa-solid fa-angle-down fa-rotate-180',
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'pathsActiveFor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Path's menu is active",
		description: 'A list of comma separated paths for which the menu is shown in active.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'onMenuOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu open click event',
		description: "Menu's event to trigger on menu open click.",
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMenuClose',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu close click event',
		description: "Menu's event to trigger on menu close click.",
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onlyIconMenu',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Only Icon Menu',
		description: 'Menu have only icons.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'isMenuOpen',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Default state of submenus',
		description: 'Should sub menu if any be open or close on load by default.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'MenuDesignSelectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu Selection Type',
		description: 'Type of the selection of a Menu',
		defaultValue: '_simpleMenuDesign1',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: '_simpleMenuDesign1',
				displayName: 'SimpleMenuDesign1',
				description: 'simple menu design one',
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
			{
				name: '_transparentMenuDesign1',
				displayName: 'TransparentMenuDesign1',
				description: 'Transparent menu vertical design one',
			},
			{
				name: '_transparentMenuHorizontalDesign1',
				displayName: 'TransparentMenuHorizontalDesign1',
				description: 'Transparent menu horizontal design one',
			},
		],
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
	externalIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	icon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	caretIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
