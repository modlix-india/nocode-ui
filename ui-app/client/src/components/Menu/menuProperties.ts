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
		name: 'subMenuOrientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'SubMenu Orientation',
		description: 'SubMenu Orientation',
		editor: ComponentPropertyEditor.LAYOUT,
		defaultValue: '_default_orientation',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_default_orientation',
				displayName: 'Default Orientation',
				description: 'Default Orientation',
			},
			{
				name: '_right_orientation',
				displayName: 'Right Orientation',
				description: 'Right Orientation',
			},
			{
				name: '_bottom_orientation',
				displayName: 'Bottom Orientation',
				description: 'Bottom Orientation',
			},
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline Type Menu',
				description: 'Outline type menu',
			},
			{ name: '_text', displayName: 'Text Menu', description: 'Text type menu' },
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
	subMenuContainer: [
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
