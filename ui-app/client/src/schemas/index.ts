import {
	AdditionalPropertiesType,
	HybridRepository,
	KIRunSchemaRepository,
	Namespaces,
	Repository,
	Schema,
} from '@fincity/kirun-js';
import {
	NAMESPACE_UI_ENGINE,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_NUM_COMP_PROP,
	SCHEMA_REF_STRING_COMP_PROP,
	SCHEMA_REF_VALIDATION_TYPE,
} from '../constants';

const map = new Map([
	[
		'DataLocation',
		Schema.ofObject('DataLocation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map([
					['value', Schema.ofString('value')],
					['expression', Schema.ofString('expression')],
					['type', Schema.ofString('type').setEnums(['EXPRESSION', 'VALUE'])],
				]),
			),
	],
	[
		'StringComponentProperty',
		Schema.ofObject('StringComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(SCHEMA_REF_DATA_LOCATION)],
					['value', Schema.ofString('value')],
				]),
			),
	],
	[
		'BooleanComponentProperty',
		Schema.ofObject('BooleanComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(SCHEMA_REF_DATA_LOCATION)],
					['value', Schema.ofBoolean('value')],
				]),
			),
	],
	[
		'AnyComponentProperty',
		Schema.ofObject('AnyComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(SCHEMA_REF_DATA_LOCATION)],
					['value', Schema.ofAny('value')],
				]),
			),
	],
	[
		'SchemaComponentProperty',
		Schema.ofObject('SchemaComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(SCHEMA_REF_DATA_LOCATION)],
					['value', Schema.ofRef(`${Namespaces.SYSTEM}.Schema`)],
				]),
			),
	],
	[
		'NumberComponentProperty',
		Schema.ofObject('NumberComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(SCHEMA_REF_DATA_LOCATION)],
					['value', Schema.ofNumber('value')],
				]),
			),
	],
	[
		'UrlParameters',
		Schema.ofObject('UrlParameters')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAdditionalProperties(
				new AdditionalPropertiesType().setSchemaValue(
					Schema.ofRef(SCHEMA_REF_DATA_LOCATION),
				),
			)
			.setDefaultValue({}),
	],
	[
		'FetchError',
		Schema.ofObject('FetchError')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map([
					[
						'error',
						Schema.ofObject('error')
							.setNamespace(NAMESPACE_UI_ENGINE)
							.setProperties(
								new Map<string, Schema>([
									['status', Schema.ofNumber('status')],
									['data', Schema.ofNumber('data')],
									['headers', Schema.ofNumber('headers')],
								]),
							),
					],
				]),
			),
	],
	[
		'Translations',
		Schema.ofObject('Translations')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAdditionalProperties(
				new AdditionalPropertiesType().setSchemaValue(
					Schema.ofObject('Language').setAdditionalProperties(
						new AdditionalPropertiesType().setSchemaValue(
							Schema.ofString('translation'),
						),
					),
				),
			),
	],
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
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['functionName', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
				]),
			),
	],
	[
		'MandatoryValidation',
		Schema.ofObject('MandatoryValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
				]),
			),
	],
	[
		'EmailValidation',
		Schema.ofObject('EmailValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
				]),
			),
	],
	[
		'RegexValidation',
		Schema.ofObject('RegexValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['pattern', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['ignoreCase', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['global', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
				]),
			),
	],
	[
		'UniqueValidation',
		Schema.ofObject('UniqueValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
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
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['minLength', Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP)],
					['maxLength', Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP)],
				]),
			),
	],
	[
		'NumberValidation',
		Schema.ofObject('NumberValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['minValue', Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP)],
					['maxValue', Schema.ofRef(SCHEMA_REF_NUM_COMP_PROP)],
				]),
			),
	],
	[
		'BooleanConditionValidation',
		Schema.ofObject('BooleanConditionValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['booleanCondition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
				]),
			),
	],
	[
		'SchemaTypeValidation',
		Schema.ofObject('SchemaTypeValidation')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
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
					['type', Schema.ofRef(SCHEMA_REF_VALIDATION_TYPE)],
					['condition', Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP)],
					['message', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
					['formatString', Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP)],
				]),
			),
	],
]);

class _UISchemaRepository implements Repository<Schema> {
	find(namespace: string, name: string): Schema | undefined {
		if (namespace !== NAMESPACE_UI_ENGINE) return undefined;
		return map.get(name);
	}
}

export const UISchemaRepository = new HybridRepository<Schema>(
	new KIRunSchemaRepository(),
	new _UISchemaRepository(),
);
