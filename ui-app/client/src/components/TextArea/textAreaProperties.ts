import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
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
		description: 'TextArea without floating label.',
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
		name: 'hideClearButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Clear Button',
		description: 'Hide Clear Button',
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
		name: 'autoFocus',
		displayName: 'Auto Focus',
		description: 'Textarea to be focused automatically when page loads.',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
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
		description: 'Text to be shown to help fill the textArea.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder to be shown in input box.',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: '',
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
		description: 'Value that should be stored when the textArea is empty.',
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
		description: 'Removes the key when the textArea is emptied.',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'updateStoreImmediately',
		displayName: 'Update Immediately',
		description: 'Update the store Immediately after typing or on blur by default.',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.DATA,
	},

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
				displayName: 'Outline Text Area',
				description: 'Outline Text Area type',
			},
			{
				name: '_filled',
				displayName: 'Filled Text Area',
				description: 'Filled Text Area type',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
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
	inputContainer: [
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
