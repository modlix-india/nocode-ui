import { Schema } from '@fincity/kirun-js';
import {
	NAMESPACE_UI_ENGINE,
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'label',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Label',
		description: 'Label that should be associated with the textbox.',
		translatable: true,
	},

	{
		name: 'noFloat',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'No Float Label',
		description: 'Textbox without floating label.',
		translatable: true,
		defaultValue: false,
	},

	{
		name: 'leftIcon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Left Icon',
		description: 'Icon to be shown on the left side.',
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'rightIcon',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Right Icon',
		description: 'Icon to be shown on the right side.',
		editor: ComponentPropertyEditor.ICON,
	},

	{
		name: 'defaultValue',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'Default Value',
		description: 'This value is use when the data entered is empty or not entered.',
	},

	{
		name: 'readOnly',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Read Only',
		description: 'Textbox will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'visibility',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},

	{
		name: 'supportingText',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Supporting Text',
		description: 'Text to be shown to help fill the textbox.',
		translatable: true,
	},

	{
		name: 'validation',
		schema: Schema.ofArray(
			'validation',
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.EventFunctionValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.MandatoryValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.EmailValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.RegexValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UniqueValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.StringValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.NumberValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.BooleanConditionValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.SchemaTypeValidation`),
			Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DateFormatValidation`),
		),
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		multiValued: true,
		notImplemented: true,
	},

	{
		name: 'emptyValue',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Empty Value',
		description: 'Value that should be stored when the textbox is empty.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'UNDEFINED',
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
		name: 'valueType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Value Type',
		description: 'Type of the Value',
		defaultValue: 'STRING',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'STRING', displayName: 'Text', description: 'Javascript String type' },
			{ name: 'NUMBER', displayName: 'Number', description: 'Javascript Number type' },
		],
	},

	{
		name: 'numberType',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Number Type',
		description: 'Choose whether number can be decimal or integer',
		defaultValue: 'DECIMAL',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'DECIMAL', displayName: 'Decimal', description: 'Javascript Float type' },
			{ name: 'INTEGER', displayName: 'Integer', description: 'Javascript Integer type' },
		],
	},

	{
		name: 'removeKeyWhenEmpty',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Delete Key on Empty',
		description: 'Removes the key when the textbox is emptied.',
		notImplemented: true,
	},

	{
		name: 'updateStoreImmediately',
		displayName: 'Update Immediately',
		description: 'Update the store Immediately after typing or on blur by default.',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		notImplemented: true,
	},

	{
		name: 'isPassword',
		displayName: 'Password',
		description: 'Textbox to enter password',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		defaultValue: false,
	},
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
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
