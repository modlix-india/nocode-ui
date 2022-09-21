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
		'Location',
		Schema.ofObject('Location')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					[
						'location',
						Schema.ofObject('expression').setProperties(
							new Map([
								['value', Schema.ofString('value')],
								['expression', Schema.ofString('expression')],
								[
									'type',
									Schema.ofString('type').setEnums([
										'EXPRESSION',
										'VALUE',
									]),
								],
							]),
						),
					],
					['value', Schema.ofAny('value')],
				]),
			),
	],
	[
		'UrlParameters',
		Schema.ofObject('UrlParameters')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAdditionalProperties(
				new AdditionalPropertiesType().setSchemaValue(
					Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`),
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
