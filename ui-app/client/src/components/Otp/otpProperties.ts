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
	// BASIC
	COMMON_COMPONENT_PROPERTIES.label,
	{
		name: 'otpLength',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'OTP Length',
		description: 'Length of OTP',
		defaultValue: 4,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'valueType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'The Type Of OTP',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'NUMERIC',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'NUMERIC', displayName: 'Numeric', description: 'Number values' },
			{ name: 'ALPHABETICAL', displayName: 'Alphabetical', description: 'Alphabet values' },
			{ name: 'ALPHANUMERIC', displayName: 'Alphanumeric', description: 'Alphanumeric values' },
			{ name: 'ANY', displayName: 'Any', description: 'Any values' },
		],
	},
	{
		name: 'maskValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Mask Value',
		description: 'Mask the value of the OTP.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'maskStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mask Style',
		description: 'Style of the mask character',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DOT',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'DOT', displayName: 'Dot', description: 'Mask with dot (•)' },
			{ name: 'ASTERISK', displayName: 'Asterisk', description: 'Mask with asterisk (*)' },
		],
	},
	{
		name: 'showVisibilityToggle',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Visibility Toggle',
		description: 'Show a button to toggle visibility of masked values',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'showIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Show Icon',
		description: 'Icon to be shown when the value is visible',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: 'ms material-symbols-outlined mso-visibility_off',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'hideIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Hide Icon',
		description: 'Icon to be shown when the value is masked',
		editor: ComponentPropertyEditor.ICON,
		defaultValue: 'ms material-symbols-outlined mso-visibility',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'temporaryVisibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Temporary Visibility',
		description: 'Show the value only while the visibility button is being pressed',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder to be shown in input box.',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: '',
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
		name: 'hideClearButton',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Hide Clear Button',
		description: 'Hide Clear Button',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoFocus',
		displayName: 'Auto Focus',
		description: 'OTP to be focused automatically when page loads.',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoComplete',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Autocomplete type',
		description: 'Autocomplete specifies what type or if any assistance that is provided to user while filling forms, uses same values as its html attribute.',
		defaultValue: 'off',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'off', displayName: 'Off', description: 'Autocomplete off' },
			{ name: 'on', displayName: 'On', description: 'Autocomplete on' },
			{ name: 'none', displayName: 'None', description: 'No autocomplete' },
		],
	},
	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Do not float Label',
		description: 'OTP without floating label.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'supportingText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Supporting Text',
		description: 'Text to be shown to help fill the OTP.',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.LARGE_TEXT,
	},

	// ADVANCED
	// (add any advanced properties here, if needed)

	// VALIDATION
	{
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		group: ComponentPropertyGroup.VALIDATION,
		validationList: [{ name: 'MANDATORY', displayName: 'OTP Validation' }],
		multiValued: true,
	},

	// DATA
	// (add any data properties here, if needed)

	// COMMON
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,

	// EVENTS
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

	// DESIGN & COLOR
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{ name: '_dashed', displayName: 'Dashed OTP', description: 'Dashed OTP type' },
			{ name: '_round', displayName: 'Round OTP', description: 'Round OTP type' },
			{ name: '_filled', displayName: 'Filled OTP', description: 'Filled OTP type' },
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
	activeInputBox: [
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
	visibilityToggle: [
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
