import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown placeholder',
		description: "Placeholder that's shown when no item is selected in dropdown.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showMandatoryAsterisk',
		displayName: 'Show Mandatory Asterisk',
		description: 'Show Mandatory Asterisk',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
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
		name: 'runEventOnDropDownClose',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Event Run on Close',
		description: 'Allows the users to run event on close of dropdown.',
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
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dropdown Label text',
		description: "Label text that's shown on top of dropdown.",
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
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onScrollReachedEnd',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Scroll Reached End',
		description: 'When the scroll reaches the end of the dropdown.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
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
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.validation,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.datatype,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionType,
	COMMON_COMPONENT_PROPERTIES.labelKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionKey,
	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.labelKey,
	{
		name: 'clearOnSelectingSameValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Clear On Selecting Same Value',
		description: 'Clear on selecting same value.',
		defaultValue: true,
	},
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Left Icon',
		description: 'Icon to be shown on the left side.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'rightIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Right Icon (closed)',
		description: 'Icon to be shown on the Right side when closed.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'rightIconOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Right Icon (opened)',
		description: 'Icon to be shown on the Right side when opened.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline Dropdown',
				description: 'Outline Dropdown type',
			},
			{
				name: '_filled',
				displayName: 'Filled Dropdown',
				description: 'Filled Dropdown type',
			},
			{ name: '_bigDesign1', displayName: 'Big Design 1', description: 'Big Design 1 type' },
			{ name: '_text', displayName: 'Text Dropdown', description: 'Text Dropdown' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	COMMON_COMPONENT_PROPERTIES.onClick,
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
	dropDownContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	dropdownCheckIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	dropdownItemLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	dropdownItem: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
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
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	asterisk: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	supportText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	errorText: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
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
