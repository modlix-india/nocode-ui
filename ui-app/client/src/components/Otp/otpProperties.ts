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
		description: 'Otp without floating label.',
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
		name: 'placeholder',
		displayName: 'Placeholder',
		description: 'Placeholder to be shown in input box.',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: '',
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
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},

	{
		name: 'autoFocus',
		displayName: 'Auto Focus',
		description: 'Otp to be focused automatically when page loads.',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'maskValue',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Mask Value',
		description: 'Mask the value of the otp.',
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'maskStyle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mask Style',
		description: 'Style of the mask character',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'DOT',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'DOT',
				displayName: 'Dot',
				description: 'Mask with dot (•)',
			},
			{
				name: 'ASTERISK',
				displayName: 'Asterisk',
				description: 'Mask with asterisk (*)',
			},
		],
	},

	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,

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
	{
		name: 'supportingText',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Supporting Text',
		description: 'Text to be shown to help fill the otp.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.LARGE_TEXT,
	},
	{
		name: 'otpLength',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'otpLength',
		description: 'Length of otp ',
		defaultValue: 4,
		group: ComponentPropertyGroup.BASIC,
	},

	{
		name: 'valueType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Value Type',
		description: 'The Type Of Otp',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'NUMERIC',
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'NUMERIC',
				displayName: 'Numeric',
				description: 'Number values',
			},
			{
				name: 'ALPHABETICAL',
				displayName: 'Alphabetical',
				description: 'alphabet values',
			},
			{
				name: 'ALPHANUMERIC',
				displayName: 'Aplhanumeric',
				description: 'alphanumeric values',
			},
			{
				name: 'ANY',
				displayName: 'Any',
				description: 'any values',
			},
		],
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
				name: '_dashed',
				displayName: 'Dashed Otp',
				description: 'Dashed Otp type',
			},
			{
				name: '_round',
				displayName: 'Round Otp',
				description: 'Round Otp type',
			},
			{
				name: '_filled',
				displayName: 'Filled Otp',
				description: 'Filled Otp type',
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
};

export { propertiesDefinition, stylePropertiesDefinition };
