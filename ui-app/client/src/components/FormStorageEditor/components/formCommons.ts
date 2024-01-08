import { ComponentDefinition } from '../../../types/common';

interface itemSchema {
	type: Array<string>;
}
export interface CustomSchema {
	type?: Array<string>;
	enums?: Array<string>;
	pattern?: string;
	maxLength?: number | '';
	minLength?: number | '';
	minimum?: number | '';
	maximum?: number | '';
	items?: itemSchema;
	oneOf?: Array<CustomSchema>;
	format?: string;
}

export interface formSchemaProperties {
	[key: string]: CustomSchema;
}

export interface FormSchema {
	type: 'OBJECT';
	name?: string;
	properties?: formSchemaProperties;
	required?: Array<string>;
	additionalProperties: false;
}

export interface compValidations {
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
	maxChars?: number | '';
	inputType?: string;
	numberType?: string | '';
	isMultiSelect?: boolean;
	validation: compValidations;
	optionList?: Array<Option>;
	schema: CustomSchema;
	editorType: string;
}

export interface formDefinition {
	[key: string]: FormCompDefinition;
}
export interface FormStorageEditorDefinition {
	name: string;
	schema: FormSchema;
	fieldDefinitionMap: formDefinition;
	readAuth: string;
	updateAuth: string;
	deleteAuth: string;
}

export const compDefinitionMap = new Map<string, FormCompDefinition>([
	[
		'name',
		{
			key: 'name',
			uuid: '',
			order: undefined,
			label: 'Name',
			placeholder: 'Enter your name',
			maxChars: 24, //maxChar = maxLength
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 0,
					maxLength: 24,
					message: 'not valid length',
				},
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
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
			maxChars: 50, //maxChar = maxLength
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 0,
					maxLength: 50,
					message: 'not valid length',
				},
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },

				// if validation check = true
				// EMAIL: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'EMAIL',
				// 	message: 'Not an valid email',
				// },
			},
			schema: {
				type: ['STRING'],
				minLength: 0,
				maxLength: 50,
				// if validation check = true
				// format: 'EMAIL',
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
			maxChars: 10, //maxChar = maxLength
			validation: {
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: 10,
					maxLength: 10,
					message: 'not valid length',
				},
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },

				// if validation check = true
				// PHONE: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'REGEX',
				// 	pattern: `^(\+\d{1,3}\s?)?\(?\d{3}\)?\d{4,15}$`,
				// 	ignoreCase: false,
				// 	message: 'Not an valid phone',
				// },
			},
			schema: {
				type: ['STRING'],
				minLength: 10,
				maxLength: 10,
				// if validation check = true
				// pattern: `^(\+\d{1,3}\s?)?\(?\d{3}\)?\d{4,15}$`,
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
			maxChars: '',
			inputType: 'text', // ['text','number']
			numberType: '', // ['INTEGER','DECIMAL']
			//it will have validation editor
			validation: {
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
				// validation when inputType = text
				STRING_LENGTH: {
					uuid: '',
					order: 0,
					type: 'STRING_LENGTH',
					minLength: '',
					maxLength: '',
					message: 'not valid length',
				},
				// validation when inputType = number
				// NUMBER_VALUE: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'NUMBER_VALUE',
				// 	minimum: '',
				// 	maximum: '',
				// 	message: '',
				// },
			},
			// schema for inputType = text
			schema: {
				type: ['STRING'],
				minLength: '',
				maxLength: '',
			},

			// if inputType = number and numberType Integer
			// schema: {
			// 	oneOf: [
			// 		{
			// 			type: ['INTEGER', 'LONG'],
			// 		},
			// 	],
			// },
			// if inputType = number and numberType Decimal
			// schema: {
			// 	oneOf: [
			// 		{
			// 			type: ['INTEGER', 'LONG', 'FLOAT', 'DOUBLE'],
			// 		},
			// 	],
			// },
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
			maxChars: 2000, //maxChar = maxLength
			inputType: 'text', // will not change
			//it will have validation editor
			validation: {
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
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
			validation: {
				// mandatory validation only
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
			},
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
			//this schema is for single selection dropdown
			schema: {
				type: ['STRING'],
				enums: ['option1', 'option2'],
			},
			// //this schema is for multiselection dropdown
			// schema:{
			// 	type: ['ARRAY'],
			// 	enums: ['option1', 'option2', 'option3'],
			// 	items: {
			// 		type: ['STRING'],
			// 	},
			// },

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
			validation: {
				// mandatory validation only
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
			},
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
			validation: {
				// mandatory validation only
				// if mandatory check = true
				// MANDATORY: {
				// 	key: '',
				// 	order: undefined,
				// 	type: 'MANDATORY',
				// 	message: 'Mandatory',
				// },
			},
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
	minLength?: number | '';
	maxLength?: number | '';
	minValue?: number | '';
	maxValue?: number | '';
}

export const compValidationMap = new Map<string, FormCompValidation>([
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
			pattern: '/^(\\+\\d{1,3}\\s?)?\\(?\\d{3}\\)?\\d{4,15}$/',
			ignoreCase: false,
			message: 'Not a valid phone number',
		},
	],
	[
		'STRING_LENGTH',
		{
			uuid: '',
			order: undefined,
			type: 'STRING_LENGTH',
			maxLength: '',
			minLength: '',
			message: 'not valid length',
		},
	],
	[
		'NUMBER_VALUE',
		{
			uuid: '',
			order: undefined,
			type: 'NUMBER_VALUE',
			minValue: '',
			maxValue: '',
			message: '',
		},
	],
	[
		'ALPHABETIC',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^[a-zA-Z]+$',
			ignoreCase: false,
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
			ignoreCase: false,
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
			ignoreCase: false,
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
			ignoreCase: false,
			message: '',
		},
	],
	[
		'CHARACTERS_ONLY',
		{
			uuid: '',
			order: undefined,
			type: 'REGEX',
			pattern: '^[^\\d]*$', // A/a to Z/z + all spacial character
			ignoreCase: false,
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
			ignoreCase: false,
			message: '',
		},
	],
]);

export const previewCompDefinitionMap = new Map<string, ComponentDefinition>([
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
				// maxChars: {
				// 	value: 10,
				// },
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
				// data: {
				// 	value: ['option1', 'option2'],
				// },
				// isMultiSelect: {
				// 	value: true,
				// },
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
				// data: {
				// 	value: ['Option 1', 'Option 2', 'Option 3'],
				// },
				layout: {
					value: 'ROWLAYOUT',
				},
				uniqueKeyType: {
					value: 'OBJECT',
				},
				// isMultiSelect: {
				// 	value: false,
				// },
			},
			styleProperties: {
				'6UMN33DqOzIFIsrc7ZNIrN': {
					resolutions: {
						ALL: {
							flexDirection: {
								value: 'row',
							},
						},
					},
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

export interface previewCompValidationProperties {
	type: string;
	message?: { value?: string };
	pattern?: { value?: string };
	maxValue?: { value?: number };
	minValue?: { value?: number };
	maxLength?: { value?: number };
	minLength?: { value?: number };
}

export interface FormPreviewCompValidation {
	key: string;
	order?: number;
	property: { value: previewCompValidationProperties };
}

export const previewCompValidationMap = new Map<string, FormPreviewCompValidation>([
	[
		'MANDATORY',
		{
			key: '',
			order: undefined,
			property: {
				value: {
					type: 'MANDATORY',
					message: {
						// value: '',
					},
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
					message: {
						// value: '',
					},
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
					pattern: {
						// value: '',
					},
					message: {
						// value: '',
					},
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
					maxLength: {
						// value: 0,
					},
					minLength: {
						// value: 0,
					},
					message: {
						// value: '',
					},
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
					maxValue: {
						// value: 0,
					},
					minValue: {
						// value: 0,
					},
					message: {
						// value: '',
					},
				},
			},
		},
	],
]);
