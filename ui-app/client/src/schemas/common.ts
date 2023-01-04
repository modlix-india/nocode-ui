import {
	AdditionalPropertiesType,
	HybridRepository,
	KIRunSchemaRepository,
	Repository,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE, SCHEMA_REF_ANY_COMP_PROP } from '../constants';

import componentSchemas from './component';
import validationSchemas from './validation';
import appSchemas from './app';

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
		'UrlParameters',
		Schema.ofObject('UrlParameters')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAdditionalProperties(
				new AdditionalPropertiesType().setSchemaValue(
					Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
				),
			)
			.setDefaultValue({}),
	],
	['Url', Schema.ofString('Url').setNamespace(NAMESPACE_UI_ENGINE)],
	['SimpleDataLocation', Schema.ofString('SimpleDataLocation').setNamespace(NAMESPACE_UI_ENGINE)],
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
	...componentSchemas,
	...validationSchemas,
	...appSchemas,
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
