import { Repository, Schema, SchemaType, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import duplicate from '../../util/duplicate';
import { runEvent } from '../util/runEvent';

export function stringValue(paramValue: any) {
	if (paramValue === undefined) return undefined;
	const value = Object.values(paramValue)
		.filter(e => !isNullValue(e))
		.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
		.map((e: any) => {
			if (e.type === 'EXPRESSION') return e.expression;
			if (typeof e.value === 'object') return JSON.stringify(e.value, undefined, 2);
			return e.value;
		})
		.join('\n')
		.trim();

	return value ? value : undefined;
}

export function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {
			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}

export function correctStatementNames(def: any) {
	def = duplicate(def);

	Object.keys(def?.steps ?? {}).forEach(k => {
		if (k === def.steps[k].statementName) return;

		let x = def.steps[k];
		delete def.steps[k];
		def.steps[x.statementName] = x;
	});

	return def;
}

export function makeObjectPaths(
	prefix: string,
	schema: Schema,
	schemaRepository: Repository<Schema>,
	set: Set<string>,
) {
	let s: Schema | undefined = schema;
	if (!isNullValue(schema.getRef()))
		s = SchemaUtil.getSchemaFromRef(s, schemaRepository, schema.getRef());

	if (
		isNullValue(s) ||
		!s?.getType()?.contains(SchemaType.OBJECT) ||
		isNullValue(s.getProperties())
	)
		return;

	for (const [propName, subSchema] of s.getProperties()!) {
		const path = prefix + '.' + propName;
		set.add(path);
		makeObjectPaths(path, subSchema, schemaRepository, set);
	}
}
