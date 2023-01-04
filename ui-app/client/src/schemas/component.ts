import { Namespaces, Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE, SCHEMA_REF_DATA_LOCATION } from '../constants';

const componentSchemas: Array<[string, Schema]> = [
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
];

export default componentSchemas;
