import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'dataBinding',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'Menu data',
		description: `Data that is used to render menu.`,
	},
	{
		name: 'pathsActiveFor',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Path's menu is active",
		description: `A list of comma separated paths for which the menu is shown in active.`,
		defaultValue: '',
	},
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu label',
		description: `Menu's display label.`,
		translatable: true,
	},
	{
		name: 'onClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu click event',
		description: `Menu's event to trigger on click.`,
	},
	{
		name: 'onMenuOpenClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu open click event',
		description: `Menu's event to trigger on menu open click.`,
	},
	{
		name: 'onMenuCloseClick',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Menu close click event',
		description: `Menu's event to trigger on menu close click.`,
	},
	{
		name: 'onlyIconMenu',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Only Icon Menu',
		description: `Menu have only icons.`,
	},
	{
		name: 'icon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: "Menu's icon",
		description: `Menu's icon to be displayed on left of label.`,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'isMenuOpen',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Menu open or not',
		description: `Menu open or not after click event.`,
		defaultValue: true,
	},
	{
		name: 'linkPath',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link path',
		description: `Path that page needs to be redirected on click.`,
		translatable: false,
	},
	{
		name: 'target',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Link target',
		description: `Link's target.`,
		defaultValue: '_self',
	},
	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			target: ['menuContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['menuContainer'],
		},
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
