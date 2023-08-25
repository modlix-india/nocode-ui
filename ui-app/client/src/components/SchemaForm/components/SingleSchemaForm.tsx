import {
	Repository,
	Schema,
	SchemaType,
	SchemaUtil,
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useMemo, useState } from 'react';
import { intersection, isSubset } from '../../../util/setOperations';
import { StringValueEditor } from './StringValueEditor';
import { BooleanValueEditor } from './BooleanValueEditor';
import { NumberValueEditor } from './NumberValueEditor';
import { ObjectValueEditor } from './ObjectValueEditor';
import ArrayValueEditor from './ArrayValueEditor';

const NUMBER_SET = new Set([
	SchemaType.FLOAT,
	SchemaType.INTEGER,
	SchemaType.DOUBLE,
	SchemaType.LONG,
]);

const DEFAULT_VALUES = new Map<SchemaType, any>([
	[SchemaType.ARRAY, []],
	[SchemaType.OBJECT, {}],
	[SchemaType.BOOLEAN, true],
	[SchemaType.DOUBLE, 0],
	[SchemaType.FLOAT, 0],
	[SchemaType.INTEGER, 0],
	[SchemaType.LONG, 0],
	[SchemaType.NULL, null],
	[SchemaType.STRING, ''],
]);

const ALL_SET = Schema.ofAny('Any').getType()?.getAllowedSchemaTypes()!;

function toStringList(types: Set<string>) {
	let str = Array.from(types)
		.map(t => t.toLowerCase())
		.join(', ');
	const ind = str.lastIndexOf(', ');
	if (ind !== -1) str = str.substring(0, ind) + ' or ' + str.substring(ind + 2);
	return str;
}

function getSchemaType(types: Set<SchemaType>, value: any): SchemaType | undefined {
	if (Array.isArray(value)) return types.has(SchemaType.ARRAY) ? SchemaType.ARRAY : undefined;

	if (typeof value === 'object')
		return types.has(SchemaType.OBJECT) ? SchemaType.OBJECT : undefined;

	if (typeof value === 'number') {
		if (Number.isInteger(value)) {
			if (value < -2147483648 || value > 2147483647)
				return types.has(SchemaType.LONG) ? SchemaType.LONG : undefined;

			let type = types.has(SchemaType.INTEGER) ? SchemaType.INTEGER : undefined;
			if (type === undefined && types.has(SchemaType.LONG)) type = SchemaType.LONG;
			return type;
		}
		const x = new Float32Array(1);
		x[0] = value;
		if (Math.abs(x[0] - value) < 0.0000001)
			return types.has(SchemaType.FLOAT) ? SchemaType.FLOAT : undefined;

		let type = types.has(SchemaType.FLOAT) ? SchemaType.FLOAT : undefined;
		if (type === undefined && types.has(SchemaType.DOUBLE)) type = SchemaType.DOUBLE;
		return type;
	}

	if (typeof value === 'boolean')
		return types.has(SchemaType.BOOLEAN) ? SchemaType.BOOLEAN : undefined;

	if (typeof value === 'string') {
		return types.has(SchemaType.STRING) ? SchemaType.STRING : undefined;
	}

	return undefined;
}

const anySchema = Schema.ofAny('Any');

export default function SingleSchemaForm({
	schema: actualSchema = anySchema,
	value,
	showLabel = false,
	path,
	onChange,
	schemaRepository,
}: {
	schema?: Schema | undefined;
	value: any;
	path: string;
	showLabel?: boolean;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [schema, setSchema] = useState(actualSchema);

	useEffect(() => {
		if (isNullValue(actualSchema.getRef())) {
			setSchema(actualSchema);
			return;
		}
		(async () =>
			setSchema(
				(await SchemaUtil.getSchemaFromRef(schema, schemaRepository, schema.getRef())) ??
					actualSchema,
			))();
	}, [actualSchema, schemaRepository]);

	const [defaultValue, setDefaultValue] = useState<any>();

	useEffect(() => {
		(async () => {
			setDefaultValue(await SchemaUtil.getDefaultValue(schema, schemaRepository));
		})();
		setCurrentType(undefined);
	}, [schema, schemaRepository]);

	const types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	const [currentType, setCurrentType] = React.useState<SchemaType | undefined>();
	const [suggestedCurrentType, setSuggestedCurrentType] = React.useState<SchemaType | undefined>(
		SchemaType.STRING,
	);
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		const v = value ?? defaultValue;

		if (types?.size === 1 || isNullValue(v)) {
			setSuggestedCurrentType(types.values().next().value);
			return;
		}

		setSuggestedCurrentType(getSchemaType(types, v));
	}, [schema, value, defaultValue]);

	useEffect(() => {
		if (Array.isArray(value) && !types.has(SchemaType.ARRAY))
			setMessage(`Value is an array but allowed type(s) include only ${toStringList(types)}`);
		else if (typeof value === 'object' && !types.has(SchemaType.OBJECT))
			setMessage(
				`Value is an object but allowed type(s) include only ${toStringList(types)}`,
			);
		else if (typeof value === 'number') {
			if (
				intersection(types, NUMBER_SET).size === 0 ||
				(Number.isInteger(value) &&
					!types.has(SchemaType.INTEGER) &&
					!types.has(SchemaType.LONG))
			) {
				setMessage(
					`Value is an number but allowed type(s) include only ${toStringList(types)}`,
				);
			}
		} else if (typeof value === 'boolean' && !types.has(SchemaType.BOOLEAN))
			setMessage(
				`Value is an boolean but allowed type(s) include only ${toStringList(types)}`,
			);
		else if (typeof value === 'string' && !types.has(SchemaType.STRING))
			setMessage(
				`Value is an string but allowed type(s) include only ${toStringList(types)}`,
			);
		else if (isNullValue(value) && !types.has(SchemaType.NULL))
			setMessage(`Value is an null but allowed type(s) include only ${toStringList(types)}`);
		else setMessage('');
	}, [value]);

	const dropdown =
		types.size > 1 ? (
			<select
				name="types"
				id="types"
				onChange={e => {
					const st: SchemaType = e.target.value as SchemaType;
					setCurrentType(st);
					onChange(path, duplicate(DEFAULT_VALUES.get(st)));
				}}
				value={currentType ?? suggestedCurrentType}
			>
				{Array.from(types.values()).map((e: string) => (
					<option className="_option" value={e} key={e}>
						{e}
					</option>
				))}
			</select>
		) : undefined;

	let editor;

	const whatType = currentType ?? suggestedCurrentType;
	if (whatType === SchemaType.OBJECT) {
		editor = (
			<ObjectValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				path={path}
				onChange={onChange}
				schemaRepository={schemaRepository}
			/>
		);
	} else if (whatType === SchemaType.ARRAY) {
		editor = (
			<ArrayValueEditor
				value={value}
				schema={schema}
				path={path}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
			/>
		);
	} else if (whatType === SchemaType.STRING) {
		editor = (
			<StringValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
			/>
		);
	} else if (whatType === SchemaType.BOOLEAN) {
		editor = (
			<BooleanValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
			/>
		);
	} else if (isSubset(new Set([whatType]), NUMBER_SET)) {
		editor = (
			<NumberValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
			/>
		);
	}

	return (
		<div className="_editorChoice">
			{dropdown}
			{editor}
		</div>
	);
}
