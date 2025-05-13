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
	COMMON_COMPONENT_PROPERTIES.label,

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
		editor: ComponentPropertyEditor.LARGE_TEXT,
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
		displayName: 'Right Icon',
		description: 'Icon to be shown on the right side.',
		editor: ComponentPropertyEditor.ICON,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'isPassword',
		displayName: 'Password',
		description: 'Textbox to enter password',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
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
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder to be shown in input box.',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: '',
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
		name: 'valueType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: 'text',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{ name: 'text', displayName: 'Text', description: 'Javascript String type' },
			{ name: 'number', displayName: 'Number', description: 'Javascript Number type' },
		],
	},

	{
		name: 'numberType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Number Type',
		description: 'Choose whether number can be decimal or integer',
		defaultValue: 'DECIMAL',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{ name: 'DECIMAL', displayName: 'Decimal', description: 'Javascript Float type' },
			{ name: 'INTEGER', displayName: 'Integer', description: 'Javascript Integer type' },
		],
	},

	{
		name: 'removeKeyWhenEmpty',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Delete Key on Empty',
		description: 'Removes the key when the textbox is emptied.',
		group: ComponentPropertyGroup.DATA,
		defaultValue: false,
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
		name: 'showNumberSpinners',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Number Spinners',
		description: 'Show Number Spinners',
		defaultValue: true,
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
	{
		name: 'onLeftIconClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Left Icon Click',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Left Icon clicked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onRightIconClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Right Icon Click',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when Right Icon clicked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'numberFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Number Format Locale',
		description:
			"Number Format Locale - en-IN, en-US, or system (based on system's settings) etc.",
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
