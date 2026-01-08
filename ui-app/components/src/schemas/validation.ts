import { Schema } from '@fincity/kirun-js';
import {
	NAMESPACE_UI_ENGINE,
	SCHEMA_VALIDATION_TYPE,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
} from '../constants';

const validationSchemas: Array<[string, Schema]> = [
	[
		'ValidationType',
		Schema.ofString('type')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setEnums([
				'EVENT_FUNCTION',
				'MANDATORY',
				'REGEX',
				'UNIQUE',
				'STRING_LENGTH',
				'BOOLEAN_CONDITION',
				'SCHEMA_TYPE',
				'EMAIL',
				'NUMBER_VALUE',
				'DATE_FORMAT',
			]),
	],
	[
		'EventFunctionValidation',
		Schema.ofObject('EventFunctionValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['functionName', SCHEMA_STRING_COMP_PROP],
				]),
			),
	],
	[
		'MandatoryValidation',
		Schema.ofObject('MandatoryValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
				]),
			),
	],
	[
		'EmailValidation',
		Schema.ofObject('EmailValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
				]),
			),
	],
	[
		'RegexValidation',
		Schema.ofObject('RegexValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['pattern', SCHEMA_STRING_COMP_PROP],
					['ignoreCase', SCHEMA_BOOL_COMP_PROP],
					['global', SCHEMA_BOOL_COMP_PROP],
				]),
			),
	],
	[
		'UniqueValidation',
		Schema.ofObject('UniqueValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['keyPath', Schema.ofString('keyPath')],
				]),
			),
	],
	[
		'StringValidation',
		Schema.ofObject('StringValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['minLength', SCHEMA_NUM_COMP_PROP],
					['maxLength', SCHEMA_NUM_COMP_PROP],
				]),
			),
	],
	[
		'NumberValidation',
		Schema.ofObject('NumberValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['minValue', SCHEMA_NUM_COMP_PROP],
					['maxValue', SCHEMA_NUM_COMP_PROP],
				]),
			),
	],
	[
		'BooleanConditionValidation',
		Schema.ofObject('BooleanConditionValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['booleanCondition', SCHEMA_BOOL_COMP_PROP],
				]),
			),
	],
	[
		'SchemaTypeValidation',
		Schema.ofObject('SchemaTypeValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['schema', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.SchemaComponentProperty`)],
				]),
			),
	],
	[
		'DateFormatValidation',
		Schema.ofObject('DateFormatValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', SCHEMA_VALIDATION_TYPE],
					['condition', SCHEMA_BOOL_COMP_PROP],
					['message', SCHEMA_STRING_COMP_PROP],
					['formatString', SCHEMA_STRING_COMP_PROP],
				]),
			),
	],
	[
		'Validation',
		Schema.ofObject('Validation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAnyOf([
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
			]),
	],
];

export default validationSchemas;
