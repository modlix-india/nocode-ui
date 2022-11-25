import {
	AdditionalPropertiesType,
	HybridRepository,
	KIRunSchemaRepository,
	Repository,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

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
					['location', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`)],
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
					['location', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`)],
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
					['location', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`)],
					['value', Schema.ofAny('value')],
				]),
			),
	],
	[
		'NumberComponentProperty',
		Schema.ofObject('NumberComponentProperty')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['location', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`)],
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
					Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`),
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
