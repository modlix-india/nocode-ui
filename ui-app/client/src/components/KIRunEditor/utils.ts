import { Repository, Schema, SchemaType, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import duplicate from '../../util/duplicate';
import { runEvent } from '../util/runEvent';

interface StringValue {
	isExpression: boolean;
	isValue: boolean;
	string?: string;
}

export function stringValue(paramValue: any): StringValue | undefined {
	if (paramValue === undefined) return undefined;

	const value = Object.values(paramValue)
		.filter(e => !isNullValue(e))
		.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
		.reduce(
			(a: StringValue, c: any) => ({
				isExpression: a.isExpression || c.type === 'EXPRESSION',
				isValue: a.isValue || c.type === 'VALUE',
				string:
					a.string +
					(a.string ? '\n' : '') +
					(c.type === 'EXPRESSION'
						? c.expression
						: typeof c.value === 'object'
						? JSON.stringify(c.value, undefined, 2)
						: c.value),
			}),
			{ isExpression: false, isValue: false, string: '' } as StringValue,
		);

	return value;
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
	def = duplicate(def) ?? {};

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
