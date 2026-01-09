import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'placeholder',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Color picker placeholder',
		description: "Placeholder that's shown when no item is selected in color picker.",
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
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Color Picker without floating label.',
		translatable: true,
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Color Picker Label text',
		description: "Label text that's shown on top of color picker.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'closeOnMouseLeave',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Close color picker on mouse leave',
		description:
			'Color Picker will be closed on mouse cursor leaving color picker container when this property is true.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.validation,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
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
				displayName: 'Outline Color Picker',
				description: 'Outline Color Picker type',
			},
			{
				name: '_filled',
				displayName: 'Filled Color Picker',
				description: 'Filled Color Picker type',
			},
			{ name: '_bigDesign1', displayName: 'Big Design 1', description: 'Big Design 1 type' },
			{ name: '_text', displayName: 'Text Color Picker', description: 'Text Color Picker' },
			{
				name: '_boxRoundedDesign',
				displayName: 'Color Picker Round Design',
				description: 'Color Picker Round Design',
			},
			{
				name: '_boxSquareDesign',
				displayName: 'Color Picker Box Design',
				description: 'Color Picker Box Design',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	COMMON_COMPONENT_PROPERTIES.onChange,
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
		description: 'Textbox to be focused automatically when page loads.',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'format',
		displayName: 'Format',
		description: 'Format of the value to be stored.',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'hex',
				displayName: 'HEX String',
				description: 'HEX String',
			},
			{
				name: 'rgba',
				displayName: 'RGBA String',
				description: 'RGBA String',
			},
		],
	},
	{
		name: 'noAlpha',
		displayName: 'No Alpha',
		description: 'No Alpha',
		schema: SCHEMA_BOOL_COMP_PROP,
		defaultValue: false,
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
