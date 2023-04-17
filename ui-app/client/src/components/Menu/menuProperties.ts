import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'pathsActiveFor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Path's menu is active",
		description: 'A list of comma separated paths for which the menu is shown in active.',
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Menu label',
		description: "Menu's display label.",
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
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
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Menu's icon",
		description: "Menu's icon to be displayed on left of label.",
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'isMenuOpen',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Default state of submenus',
		description: 'Should sub menu if any be open or close on load by default.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.linkPath,
	COMMON_COMPONENT_PROPERTIES.linkTargetType,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['link'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['menu'],
		},
	},
	menu: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'menuPadding',
			displayName: 'Menu Padding',
			description: 'Menu Padding',
			prefix: 'menu',
			target: ['menu'],
		},
	},
	icon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'iconColor',
			displayName: 'Menu Icon Color',
			description: 'Menu Icon Color',
			prefix: 'icon',
			target: ['icon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'iconMargin',
			displayName: 'Menu Icon margin',
			description: 'Menu Icon margin',
			prefix: 'icon',
			target: ['icon'],
		},
	},
	caretIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'caretIconColor',
			displayName: 'Menu Icon Color',
			description: 'Menu Icon Color',
			prefix: 'caretIcon',
			target: ['caretIcon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
