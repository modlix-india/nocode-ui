import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import { ComponentPropertyGroup, ComponentPropertyDefinition } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown placeholder',
		description: "Placeholder that's shown when no item is selected in dropdown.",
		defaultValue: 'Select...',
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is MultiSelect',
		description: 'Allows the users to select multiple options.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'isSearchable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is Searchable',
		description: 'Allows the users search options.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Dropdown without floating label.',
		translatable: true,
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown header text',
		description: "Header text that's shown on top of dropdown.",
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Dropdown data',
		description: 'Data that is used to render dropdown.',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'clearSearchTextOnClose',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Clear Search on close',
		description: 'Clear Search on close.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onSearch',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Search Event',
		description: 'Search event to run on search.',
		translatable: true,
		group: ComponentPropertyGroup.EVENTS,
	},

	{
		name: 'searchLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Search Label ',
		description: 'Label for searchbox.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'closeOnMouseLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close dropdown on mouse leave',
		description:
			'Dropdown will be closed on mouse cursor leaving dropdown container when this property is true.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.validation,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.datatype,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionType,
	COMMON_COMPONENT_PROPERTIES.labelKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionKey,
	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.labelKey,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
			target: ['dropDownContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['noFloatLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['noFloatLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['textBoxContainer'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['textBoxContainer'],
		},
	},
	textBoxContainer: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'textBoxContainer',
			displayName: 'textBoxContainer size properties',
			description: 'textBoxContainer size properties',
			prefix: 'textBoxContainer',
			target: ['textBoxContainer'],
		},
	},
	leftIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'leftIcon',
			displayName: 'leftIcon font properties',
			description: 'leftIcon font properties',
			prefix: 'leftIcon',
			target: ['leftIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'leftIcon',
			displayName: 'leftIcon color properties',
			description: 'leftIcon color properties',
			prefix: 'leftIcon',
			target: ['leftIcon'],
		},
	},
	rightIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'rightIcon',
			displayName: 'rightIcon font properties',
			description: 'rightIcon font properties',
			prefix: 'rightIcon',
			target: ['rightIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'rightIcon',
			displayName: 'rightIcon color properties',
			description: 'rightIcon color properties',
			prefix: 'rightIcon',
			target: ['rightIcon'],
		},
	},
	inputBox: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'inputBox',
			displayName: 'inputBox font properties',
			description: 'inputBox font properties',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'inputBox',
			displayName: 'inputBox color properties',
			description: 'inputBox color properties',
			prefix: 'inputBox',
			target: ['inputBox'],
		},
	},
	floatingLabel: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'floatingLabel',
			displayName: 'floatingLabel font properties',
			description: 'floatingLabel font properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'floatingLabel',
			displayName: 'floatingLabel color properties',
			description: 'floatingLabel color properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'floatingLabel',
			displayName: 'floatingLabel background properties',
			description: 'floatingLabel background properties',
			prefix: 'floatingLabel',
			target: ['floatingLabel'],
		},
	},
	supportText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'supportText',
			displayName: 'supportText font properties',
			description: 'supportText font properties',
			prefix: 'supportText',
			target: ['supportText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'supportText',
			displayName: 'supportText color properties',
			description: 'supportText color properties',
			prefix: 'supportText',
			target: ['supportText'],
		},
	},
	errorText: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'errorText',
			displayName: 'errorText font properties',
			description: 'errorText font properties',
			prefix: 'errorText',
			target: ['errorText'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'errorText',
			displayName: 'errorText color properties',
			description: 'errorText color properties',
			prefix: 'errorText',
			target: ['errorText'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
