import { ComponentDefinition } from '../../../types/common';

interface ItemSchema {
	type: Array<string>;
}
export interface CustomSchema {
	type?: Array<string>;
	enums?: Array<string>;
	pattern?: string;
	maxLength?: number | undefined;
	minLength?: number | undefined;
	minimum?: number | undefined;
	maximum?: number | undefined;
	items?: ItemSchema;
	oneOf?: Array<CustomSchema>;
	format?: string;
}

export interface FormSchemaProperties {
	[key: string]: CustomSchema;
}

export interface FormSchema {
	type: 'OBJECT';
	name?: string;
	properties?: FormSchemaProperties;
	required?: Array<string>;
	additionalProperties: boolean;
}

export interface CompValidations {
	[key: string]: FormCompValidation;
}
export interface Option {
	key: string;
	value: string;
}

export interface FormCompDefinition {
	key: string;
	uuid: string;
	order: number | undefined;
	label: string;
	placeholder?: string;
	maxChars?: number | undefined;
	inputType?: string;
	numberType?: string;
	isMultiSelect?: boolean;
	validation: CompValidations;
	optionList?: Array<Option>;
	schema: CustomSchema;
	editorType: string;
}

export interface FormDefinition {
	[key: string]: FormCompDefinition;
}
export interface FormStorageEditorDefinition {
	name: string;
	schema: FormSchema;
	fieldDefinitionMap: FormDefinition;
	readAuth: string;
	updateAuth: string;
	deleteAuth: string;
}

export const COMP_DEFINITION_MAP = new Map<string, FormCompDefinition>([
	[
		'name',
		{
			key: 'name',
			uuid: '',
			order: undefined,
			label: 'Name',
			placeholder: 'Enter your name',
			maxChars: 24,
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 0,
					maxLength: 24,
					message: 'Not valid length',
				},
			},
			schema: {
				type: ['STRING'],
				minLength: 0,
				maxLength: 24,
			},
			editorType: 'NameEditor',
		},
	],
	[
		'email',
		{
			key: 'email',
			uuid: '',
			order: undefined,
			label: 'Email',
			placeholder: 'Enter your email address',
			maxChars: 50,
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 0,
					maxLength: 50,
					message: 'not valid length',
				},
			},
			schema: {
				type: ['STRING'],
				minLength: 0,
				maxLength: 50,
			},
			editorType: 'EmailEditor',
		},
	],
	[
		'phone',
		{
			key: 'phone',
			uuid: '',
			order: undefined,
			label: 'Phone',
			placeholder: 'Enter your phone number',
			maxChars: 10,
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 10,
					maxLength: 10,
					message: 'not valid length',
				},
			},
			schema: {
				type: ['STRING'],
				minLength: 10,
				maxLength: 10,
			},
			editorType: 'PhoneEditor',
		},
	],
	[
		'textBox',
		{
			key: 'textBox',
			uuid: '',
			order: undefined,
			label: 'Text box',
			placeholder: 'Type something',
			inputType: 'text',
			numberType: '',
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
				},
			},
			schema: {
				type: ['STRING'],
			},
			editorType: 'TextBoxEditor',
		},
	],
	[
		'textArea',
		{
			key: 'textArea',
			uuid: '',
			order: undefined,
			label: 'Text area',
			placeholder: 'Type description',
			maxChars: 2000,
			inputType: 'text',
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 0,
					maxLength: 2000,
					message: 'not valid length',
				},
			},
			schema: {
				type: ['STRING'],
				minLength: 0,
				maxLength: 2000,
			},
			editorType: 'TextAreaEditor',
		},
	],
	[
		'dropdown',
		{
			key: 'dropdown',
			uuid: '',
			order: undefined,
			label: 'Drop down',
			placeholder: 'Select an option',
			isMultiSelect: false,
			validation: {},
			optionList: [
				{
					key: 'option 1',
					value: 'Option 1',
				},
				{
					key: 'option 2',
					value: 'Option 2',
				},
			],

			schema: {
				type: ['STRING'],
				enums: ['option1', 'option2'],
			},

			editorType: 'DropdownEditor',
		},
	],
	[
		'radioButton',
		{
			key: 'radioButton',
			uuid: '',
			order: undefined,
			label: 'Radio Button',
			validation: {},
			optionList: [
				{
					key: 'option 1',
					value: 'Option 1',
				},
				{
					key: 'option 2',
					value: 'Option 2',
				},
			],

			schema: {
				type: ['STRING'],
				enums: ['option1', 'option2'],
			},
			editorType: 'RadioButtonEditor',
		},
	],
	[
		'checkBox',
		{
			key: 'checkBox',
			uuid: '',
			order: undefined,
			label: 'Check box',
			isMultiSelect: true,
			validation: {},
			optionList: [
				{
					key: 'option 1',
					value: 'Option 1',
				},
				{
					key: 'option 2',
					value: 'Option 2',
				},
			],
			schema: {
				type: ['ARRAY'],
				enums: ['option1', 'option2'],
				items: {
					type: ['STRING'],
				},
			},
			editorType: 'CheckBoxEditor',
		},
	],
]);

export interface FormCompValidation {
	uuid: string;
	type: string;
	order: number | undefined;
	message?: string;
	pattern?: string;
	ignoreCase?: boolean;
	minLength?: number | undefined;
	maxLength?: number | undefined;
	minValue?: number | undefined;
	maxValue?: number | undefined;
}

export const COMP_VALIDATION_MAP = new Map<string, FormCompValidation>([
	[
		'MANDATORY',
		{
			uuid: '',
			order: undefined,
			type: 'MANDATORY',
			message: 'Mandatory field',
		},
	],
	[
		'EMAIL',
		{
			uuid: '',
			order: undefined,
			type: 'EMAIL',
			message: 'Not a valid email',
		},
	],
	[
		'PHONE',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^(\\+\\d{1,3}\\s?)?\\(?\\d{3}?\\)?\\d{4,15}$',
			message: 'Not a valid phone number',
		},
	],
	[
		'STRING_LENGTH',
		{
			uuid: '',
			order: undefined,
			type: 'STRING_LENGTH',
		},
	],
	[
		'NUMBER_VALUE',
		{
			uuid: '',
			order: undefined,
			type: 'NUMBER_VALUE',
		},
	],
	[
		'ALPHABETIC',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^[a-zA-Z]+$',
			message: '',
		},
	],
	[
		'ALPHANUMERIC',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^[a-zA-Z0-9]+$',
			message: '',
		},
	],
	[
		'URL',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern:
				'\\b(?:https?|ftp):\\/\\/[-A-Za-z0-9+&@#\\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\\/%=~_|]',
			message: '',
		},
	],
	[
		'CURRENCY',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^₹?\\s?\\d{1,3}(?:,?\\d{3})*(?:\\.\\d{1,2})?$',
			message: '',
		},
	],
	[
		'CHARACTERS_ONLY',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^[^\\d]*$',
			message: '',
		},
	],
	[
		'REGEX',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '',
			message: '',
		},
	],
]);

export const PREVIEW_COMP_DEFINITION_MAP = new Map<string, ComponentDefinition>([
	[
		'TextBox',
		{
			key: '',
			name: 'TextBox',
			type: 'TextBox',
			properties: {
				showNumberSpinners: {
					value: false,
				},

				placeholder: {
					value: '',
				},
			},
			displayOrder: undefined,
			bindingPath: {
				type: 'VALUE',
				value: 'Page.textBox',
			},
		},
	],
	[
		'TextArea',
		{
			key: '',
			name: 'TextArea',
			type: 'TextArea',
			properties: {
				placeholder: {
					value: 'TextArea',
				},
			},
			displayOrder: undefined,
			bindingPath: {
				type: 'VALUE',
				value: 'Page.textArea',
			},
		},
	],
	[
		'Dropdown',
		{
			key: '',
			name: 'Dropdown',
			type: 'Dropdown',
			properties: {
				placeholder: {
					value: '',
				},
				selectionType: {
					value: 'OBJECT',
				},
				uniqueKeyType: {
					value: 'RANDOM',
				},
			},
			displayOrder: undefined,
			bindingPath: {
				type: 'VALUE',
				value: 'Page.selected',
			},
		},
	],
	[
		'RadioButton',
		{
			key: '2o2Bqo4cXW2Zxa0q5J8EdQ',
			name: 'RadioButton',
			type: 'RadioButton',
			properties: {
				selectionType: {
					value: 'OBJECT',
				},

				layout: {
					value: 'ROWLAYOUT',
				},
				uniqueKeyType: {
					value: 'OBJECT',
				},
			},
			displayOrder: undefined,
			bindingPath: {
				type: 'VALUE',
				value: 'Page.radioSelected',
			},
		},
	],
]);

export interface PreviewCompValidationProperties {
	type: string;
	message?: { value: string };
	pattern?: { value: string };
	maxValue?: { value: number };
	minValue?: { value: number };
	maxLength?: { value: number };
	minLength?: { value: number };
}

export interface FormPreviewCompValidation {
	key: string;
	order?: number;
	property: { value: PreviewCompValidationProperties };
}

export const PREVIEW_COMP_VALIDATION_MAP = new Map<string, FormPreviewCompValidation>([
	[
		'MANDATORY',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'MANDATORY',
				},
			},
		},
	],
	[
		'EMAIL',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'EMAIL',
				},
			},
		},
	],
	[
		'REGEX',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'REGEX',
				},
			},
		},
	],
	[
		'STRING_LENGTH',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'STRING_LENGTH',
				},
			},
		},
	],
	[
		'NUMBER_VALUE',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'NUMBER_VALUE',
				},
			},
		},
	],
]);
