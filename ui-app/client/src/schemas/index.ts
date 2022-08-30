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
						Schema.ofArray(
							'location',
							Schema.ofString('eachLocation'),
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
			),
	],
	[
		'FetchError',
		Schema.ofObject('FetchError')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map([['responseCode', Schema.ofNumber('responseCode')]]),
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
