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
	textBoxContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	rightIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	inputBox: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.accentColor.type,
	],
	floatingLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	noFloatLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	supportText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorTextContainer: [
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
