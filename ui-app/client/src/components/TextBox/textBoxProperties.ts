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
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.label,

	{
		name: 'noFloat',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'No Float Label',
		description: 'Textbox without floating label.',
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
		description: 'Text to be shown to help fill the textbox.',
		translatable: true,
		group: ComponentPropertyGroup.ADVANCED,
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
	},

	{
		name: 'updateStoreImmediately',
		displayName: 'Update Immediately',
		description: 'Update the store Immediately after typing or on blur by default.',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.DATA,
	},

	COMMON_COMPONENT_PROPERTIES.onEnter,
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
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
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
	passwordIcon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'passwordIcon',
			displayName: 'passwordIcon font properties',
			description: 'passwordIcon font properties',
			prefix: 'passwordIcon',
			target: ['passwordIcon'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'passwordIcon',
			displayName: 'passwordIcon color properties',
			description: 'passwordIcon color properties',
			prefix: 'passwordIcon',
			target: ['passwordIcon'],
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
