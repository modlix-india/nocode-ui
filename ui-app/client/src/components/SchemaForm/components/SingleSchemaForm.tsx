import { Repository, Schema, SchemaType, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useMemo, useState } from 'react';
import { intersection, isSubset } from '../../../util/setOperations';
import { StringValueEditor } from './StringValueEditor';
import { BooleanValueEditor } from './BooleanValueEditor';
import { NumberValueEditor } from './NumberValueEditor';

const NUMBER_SET = new Set([
	SchemaType.FLOAT,
	SchemaType.INTEGER,
	SchemaType.DOUBLE,
	SchemaType.LONG,
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

export default function SingleSchema({
	schema: actualSchema = Schema.ofAny('Any'),
	value,
	showLabel = false,
	path,
	onChange,
	schemaRepository,
}: {
	schema?: Schema;
	value: any;
	path: string;
	showLabel?: boolean;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
}) {
	console.log(actualValue, 'actualValue');
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
	}, [schema, schemaRepository]);

	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;
	console.log(types, 'typesatbegining');

	useEffect(() => {
		if (!(types?.size >= 1) || !types.has(SchemaType.NULL) || isNullValue(value)) return;
		onChange(path, undefined);
	}, [schema, value]);

	const [currentType, setCurrentType] = React.useState<SchemaType | undefined>();
	// value === undefined ? Array.from(types.values())[0] : undefined,
	const [message, setMessage] = useState<string>('');
	console.log(currentType, 'currentType');

	useEffect(() => {
		if (types?.size >= 1) {
			setCurrentType(types.values().next().value);
			return;
		}
		if (Array.isArray(value)) {
			setCurrentType(types.has(SchemaType.ARRAY) ? SchemaType.ARRAY : undefined);
		} else if (typeof value === 'object') {
			setCurrentType(types.has(SchemaType.OBJECT) ? SchemaType.OBJECT : undefined);
		} else if (typeof value === 'number') {
			if (Number.isInteger(value)) {
				if (value < -2147483648 || value > 2147483647)
					setCurrentType(types.has(SchemaType.LONG) ? SchemaType.LONG : undefined);
				else {
					let type = types.has(SchemaType.INTEGER) ? SchemaType.INTEGER : undefined;
					if (type === undefined && types.has(SchemaType.LONG)) type = SchemaType.LONG;
					setCurrentType(type);
				}
			} else {
				const x = new Float32Array(1);
				x[0] = value;
				if (Math.abs(x[0] - value) < 0.0000001) {
					setCurrentType(types.has(SchemaType.FLOAT) ? SchemaType.FLOAT : undefined);
				} else {
					let type = types.has(SchemaType.FLOAT) ? SchemaType.FLOAT : undefined;
					if (type === undefined && types.has(SchemaType.DOUBLE))
						type = SchemaType.DOUBLE;
					setCurrentType(type);
				}
			}
		} else if (typeof value === 'boolean') {
			setCurrentType(types.has(SchemaType.BOOLEAN) ? SchemaType.BOOLEAN : undefined);
		} else if (typeof value === 'string') {
			setCurrentType(types.has(SchemaType.STRING) ? SchemaType.STRING : undefined);
		} else {
			setCurrentType(undefined);
		}
	}, [schema]);

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

	const handleChange = (event: any) => {
		setCurrentType(event.target.value);
	};
	console.log(value, actualValue, 'values');

	const dropdown = (
		<div className="_selectDiv">
			<select
				className="_select"
				name="types"
				id="types"
				onChange={handleChange}
				value={currentType}
			>
				{Array.from(types.values()).map((e: string) => (
					<option className="_option" value={e} key={e}>
						{e}
					</option>
				))}
			</select>
		</div>
	);

	if (types?.size) {
		if (currentType === SchemaType.OBJECT) {
			return <div className="_singleSchema"></div>;
		} else if (currentType === SchemaType.ARRAY) {
			return <div className="_singleSchema"></div>;
		} else if (currentType === SchemaType.STRING) {
			return (
				<StringValueEditor
					value={value}
					defaultValue={defaultValue}
					schema={schema}
					onChange={v => onChange(path, v)}
					schemaRepository={schemaRepository}
				/>
			);
		} else if (currentType === SchemaType.BOOLEAN) {
			return (
				<div>
					<BooleanValueEditor
						value={value}
						schema={schema}
						onChange={v => onChange(path, v)}
						schemaRepository={schemaRepository}
					/>
					{types?.size > 1 ? dropdown : ''}
				</div>
			);
		} else if (isSubset(new Set([currentType]), NUMBER_SET)) {
			return (
				<NumberValueEditor
					value={value}
					defaultValue={defaultValue}
					schema={schema}
					onChange={v => onChange(path, v)}
					schemaRepository={schemaRepository}
				/>
			);
		}
	} else if (isSubset(new Set([currentType]), NUMBER_SET)) {
		return (
			<NumberValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
			/>
		);
	}

	return dropdown;
	return <div className="_singleSchema"></div>;
}
