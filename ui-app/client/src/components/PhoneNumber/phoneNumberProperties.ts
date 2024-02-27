import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentENUM,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';
import { COUNTRY_LIST } from './components/listOfCountries';
const ENUM_OPTION: Array<ComponentENUM> = COUNTRY_LIST.map(each => {
	return { name: each.C, displayName: `${each.N} ${each.D}` };
});
const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.label,
	{
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder to be shown in input box.',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: '',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'countries',
		displayName: 'Countries',
		description: 'Countries to appear in list.',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
		enumValues: ENUM_OPTION,
	},
	{
		name: 'topCountries',
		displayName: 'Top Countries',
		description: 'Top Countries to appear in list.',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.BASIC,
		multiValued: true,
		enumValues: ENUM_OPTION,
	},
	{
		name: 'orderBy',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Order By',
		description: 'Order of dropdown option by',
		defaultValue: 'countryname',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'countryname', displayName: 'Country Name', description: 'Country Name' },
			{ name: 'countrycode', displayName: 'Country Code', description: 'Country Code' },
			{ name: 'dialcode', displayName: 'Dial Code', description: 'Dial Code' },
		],
	},
	{
		name: 'format',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Formar Number',
		description: 'Format Phone Number.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'storeFormatted',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Store Formatted Number',
		description: 'Store the formatted phone number.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'seperator',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Format Value Type',
		description: 'Type of the Value for Format',
		defaultValue: ' ',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: ' ', displayName: 'Space', description: 'Space' },
			{ name: '-', displayName: 'Hyphen', description: 'Hyphen' },
			{ name: '.', displayName: 'Dot', description: 'Dot' },
		],
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
		name: 'searchLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Search Label ',
		description: 'Label for searchbox.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
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
		name: 'noCodeForFirstCountry',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: "Don't add dial code for first country",
		defaultValue: false,
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Do not float Label',
		description: 'Textbox without floating label.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'autoComplete',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Autocomplete type',
		description:
			'Autocomplete specifies what type or if any assistance that is provided to user while filling forms, uses same values as its html attribute.',
		defaultValue: 'off',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'off', displayName: 'Off', description: 'Autocomplete off' },
			{ name: 'on', displayName: 'On', description: 'Autocomplete on' },
			{ name: 'none', displayName: 'None', description: 'No autocomplete' },
		],
	},

	{
		name: 'defaultValue',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Default Value',
		description: 'This value is use when the data entered is empty or not entered.',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'supportingText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Supporting Text',
		description: 'Text to be shown to help fill the textbox.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'autoFocus',
		displayName: 'Auto Focus',
		description: 'Textbox to be focused automatically when page loads.',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,

	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		multiValued: true,
		group: ComponentPropertyGroup.VALIDATION,
	},

	{
		name: 'emptyValue',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Empty Value',
		description: 'Value that should be stored when the textbox is empty.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'UNDEFINED',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'UNDEFINED',
				displayName: 'Undefined',
				description: 'Javascript Undefined Value',
			},
			{
				name: 'NULL',
				displayName: 'Null',
				description: 'Javascript Null Value',
			},
			{
				name: 'ENMPTYSTRING',
				displayName: 'Empty String',
				description: 'Empty String Value',
			},
			{
				name: 'ZERO',
				displayName: 'Zero',
				description: 'Zero Number Value (0)',
			},
		],
	},

	{
		name: 'messageDisplay',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Messages display type',
		description: 'How messages should be displayed.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: '_floatingMessages',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: '_floatingMessages',
				displayName: 'Floating messages',
				description: 'Messages will float below the inputbox',
			},
			{
				name: '_fixedMessages',
				displayName: 'Fixed height for messages',
				description: 'Messages will appear in a fixed height container',
			},
			{
				name: '_nonFixedMessages',
				displayName: 'No Fixed height for messages.',
				description: 'This will increase size of container as it adds messages',
			},
		],
	},

	{
		name: 'removeKeyWhenEmpty',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Delete Key on Empty',
		description: 'Removes the key when the textbox is emptied.',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'updateStoreImmediately',
		displayName: 'Update Immediately',
		description: 'Update the store Immediately after typing or on blur by default.',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.DATA,
	},

	COMMON_COMPONENT_PROPERTIES.onEnter,
	COMMON_COMPONENT_PROPERTIES.onChange,
	COMMON_COMPONENT_PROPERTIES.onBlur,
	COMMON_COMPONENT_PROPERTIES.onFocus,

	{
		name: 'onClear',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Clear',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clear button is pressed.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline Textbox',
				description: 'Outline Textbox type',
			},
			{ name: '_filled', displayName: 'Filled Textbox', description: 'Filled Textbox type' },
			{ name: '_bigDesign1', displayName: 'Big Design 1', description: 'Big Design 1 type' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,

	{
		name: 'hideClearButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Clear Button',
		description: 'Hide Clear Button',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'maxChars',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Max Characters Allowed',
		description: 'Max Characters Allowed to type',
		defaultValue: undefined,
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
	dropdownSelect: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	selectedOption: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	arrowIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	dialCodeLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	dropdownBody: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	dropdownSearchBox: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	dropdownOption: [
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
