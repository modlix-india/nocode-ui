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
		name: 'menuDesignSelectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu Type',
		description: 'Type of the selection of a Menu',
		defaultValue: '_default',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: '_default', displayName: 'Default Menu', description: 'Default Menu type' },
			{ name: '_outlined', displayName: 'Outline Menu', description: 'Outline Menu type' },
			{ name: '_text', displayName: 'Text Menu', description: 'Outline Menu type' },
			{
				name: '_sides',
				displayName: 'Side Bordered Menu',
				description: 'Side Bordered Menu type',
			},
			{
				name: '_topbottom',
				displayName: 'Top and Bottom Bordered Menu',
				description: 'Top and Bottom Bordered Menu type',
			},
		],
	},
	{
		name: 'menuColorScheme',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu Color Scheme',
		description: 'Type of the color scheme for Menu',
		defaultValue: '_primary',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_primary',
				displayName: 'Primary Color Scheme',
				description: 'Default Color Scheme',
			},
			{
				name: '_secondary',
				displayName: 'Secondary Color Scheme',
				description: 'Secondary Color Scheme',
			},
			{
				name: '_tertiary',
				displayName: 'Tertiary Color Scheme',
				description: 'Tertiary Color Scheme',
			},
			{
				name: '_quaternary',
				displayName: 'Quaternary Color Scheme',
				description: 'Quaternary Color Scheme',
			},
			{
				name: '_quinary',
				displayName: 'Quinary Color Scheme',
				description: 'Quinary Color Scheme',
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
