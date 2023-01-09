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
		notImplemented: true,
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
		notImplemented: true,
	},

	{
		name: 'minValue',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Minimum Value',
		description: 'Minimum Value',
		notImplemented: true,
	},

	{
		name: 'maxValue',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'Maximum Value',
		description: 'Maximum Value',
		notImplemented: true,
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
];

const stylePropertiesDefinition = {};

export { propertiesDefinition, stylePropertiesDefinition };
