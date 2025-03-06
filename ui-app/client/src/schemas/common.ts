import {
	AdditionalType,
	HybridRepository,
	KIRunSchemaRepository,
	Repository,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE, SCHEMA_ANY_COMP_PROP } from '../constants';

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
			.setAdditionalProperties(new AdditionalType().setSchemaValue(SCHEMA_ANY_COMP_PROP))
			.setDefaultValue({}),
	],
	['Url', Schema.ofString('Url').setNamespace(NAMESPACE_UI_ENGINE)],
	['SimpleDataLocation', Schema.ofString('SimpleDataLocation').setNamespace(NAMESPACE_UI_ENGINE)],
	[
		'Translations',
		Schema.ofObject('Translations')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setAdditionalProperties(
				new AdditionalType().setSchemaValue(
					Schema.ofObject('Language').setAdditionalProperties(
						new AdditionalType().setSchemaValue(Schema.ofString('translation')),
					),
				),
			),
	],
	...componentSchemas,
	...validationSchemas,
	...appSchemas,
]);

class _UISchemaRepository implements Repository<Schema> {
	public find(namespace: string, name: string): Promise<Schema | undefined> {
		if (namespace !== NAMESPACE_UI_ENGINE) return Promise.resolve(undefined);
		return Promise.resolve(map.get(name));
	}

	public filter(name: string): Promise<string[]> {
		const lowerCaseName = name.toLowerCase();
		return Promise.resolve(
			Array.from(
				new Set(
					Array.from(map.values())
						.map(e => e.getFullName())
						.filter(e => e.toLowerCase().includes(lowerCaseName)),
				),
			),
		);
	}
}

export class UISchemaRepository extends HybridRepository<Schema> {
	public constructor() {
		super(new KIRunSchemaRepository(), new _UISchemaRepository());
	}
}
