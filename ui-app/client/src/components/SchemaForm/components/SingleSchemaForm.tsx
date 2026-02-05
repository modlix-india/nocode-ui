import { Repository, Schema, SchemaType, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useMemo, useState } from 'react';
import { intersection, isSubset } from '../../../util/setOperations';
import { StringValueEditor } from './StringValueEditor';
import { BooleanValueEditor } from './BooleanValueEditor';
import { NumberValueEditor } from './NumberValueEditor';
import { ObjectValueEditor } from './ObjectValueEditor';
import { ArrayValueEditor } from './ArrayValueEditor';

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
	label,
}: {
	schema?: Schema;
	value: any;
	path: string;
	showLabel?: boolean;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	label?: string;
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
	}, [schema, schemaRepository]);

	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	useEffect(() => {
		if (types?.size !== 1 || !types.has(SchemaType.NULL) || isNullValue(value)) return;
		onChange(path, undefined);
	}, [schema, value]);

	const [currentType, setCurrentType] = React.useState<SchemaType | undefined>();
	const [message, setMessage] = useState<string>('');
	const [selectedType, setSelectedType] = useState<SchemaType>(SchemaType.STRING);

	// Initialize selectedType based on value or default to STRING
	useEffect(() => {
		const availableTypes = Array.from(types).filter(t => t !== SchemaType.NULL);
		if (currentType && availableTypes.includes(currentType)) {
			setSelectedType(currentType);
		} else if (availableTypes.includes(SchemaType.STRING)) {
			setSelectedType(SchemaType.STRING);
		} else if (availableTypes.length > 0) {
			setSelectedType(availableTypes[0]);
		}
	}, [types, currentType]);

	useEffect(() => {
		if (types?.size === 1) {
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

	const fieldLabel = showLabel ? label || schema.getName() : undefined;

	if (types?.size === 1) {
		if (types.has(SchemaType.OBJECT)) {
			return (
				<ObjectValueEditor
					value={value}
					schema={schema}
					onChange={onChange}
					schemaRepository={schemaRepository}
					path={path}
					label={fieldLabel}
				/>
			);
		} else if (types.has(SchemaType.ARRAY)) {
			return (
				<ArrayValueEditor
					value={value}
					schema={schema}
					onChange={onChange}
					schemaRepository={schemaRepository}
					path={path}
					label={fieldLabel}
				/>
			);
		} else if (types.has(SchemaType.STRING)) {
			return (
				<StringValueEditor
					value={value}
					defaultValue={defaultValue}
					schema={schema}
					onChange={v => onChange(path, v)}
					schemaRepository={schemaRepository}
					label={fieldLabel}
				/>
			);
		} else if (types.has(SchemaType.BOOLEAN)) {
			return (
				<BooleanValueEditor
					value={value}
					schema={schema}
					onChange={v => onChange(path, v)}
					schemaRepository={schemaRepository}
					label={fieldLabel}
				/>
			);
		} else if (isSubset(types, NUMBER_SET)) {
			return (
				<NumberValueEditor
					value={value}
					defaultValue={defaultValue}
					schema={schema}
					onChange={v => onChange(path, v)}
					schemaRepository={schemaRepository}
					label={fieldLabel}
				/>
			);
		}
	} else if (isSubset(types, NUMBER_SET)) {
		return (
			<NumberValueEditor
				value={value}
				defaultValue={defaultValue}
				schema={schema}
				onChange={v => onChange(path, v)}
				schemaRepository={schemaRepository}
				label={fieldLabel}
			/>
		);
	}

	// Multi-type schema - show type selector with editor
	const availableTypes = Array.from(types).filter(t => t !== SchemaType.NULL);

	const handleTypeChange = (newType: SchemaType) => {
		setSelectedType(newType);
		// Clear the value when type changes to avoid type mismatches
		onChange(path, undefined);
	};

	const renderEditorForType = (type: SchemaType) => {
		switch (type) {
			case SchemaType.STRING:
				return (
					<StringValueEditor
						value={typeof value === 'string' ? value : undefined}
						defaultValue={defaultValue}
						schema={schema}
						onChange={v => onChange(path, v)}
						schemaRepository={schemaRepository}
					/>
				);
			case SchemaType.BOOLEAN:
				return (
					<BooleanValueEditor
						value={typeof value === 'boolean' ? value : undefined}
						schema={schema}
						onChange={v => onChange(path, v)}
						schemaRepository={schemaRepository}
					/>
				);
			case SchemaType.INTEGER:
			case SchemaType.LONG:
			case SchemaType.FLOAT:
			case SchemaType.DOUBLE:
				return (
					<NumberValueEditor
						value={typeof value === 'number' ? value : undefined}
						defaultValue={defaultValue}
						schema={schema}
						onChange={v => onChange(path, v)}
						schemaRepository={schemaRepository}
					/>
				);
			case SchemaType.OBJECT:
				return (
					<ObjectValueEditor
						value={typeof value === 'object' && !Array.isArray(value) ? value : undefined}
						schema={schema}
						onChange={onChange}
						schemaRepository={schemaRepository}
						path={path}
					/>
				);
			case SchemaType.ARRAY:
				return (
					<ArrayValueEditor
						value={Array.isArray(value) ? value : undefined}
						schema={schema}
						onChange={onChange}
						schemaRepository={schemaRepository}
						path={path}
					/>
				);
			default:
				return null;
		}
	};

	const typeLabels: Record<string, string> = {
		[SchemaType.STRING]: 'String',
		[SchemaType.BOOLEAN]: 'Boolean',
		[SchemaType.INTEGER]: 'Integer',
		[SchemaType.LONG]: 'Long',
		[SchemaType.FLOAT]: 'Float',
		[SchemaType.DOUBLE]: 'Double',
		[SchemaType.OBJECT]: 'Object',
		[SchemaType.ARRAY]: 'Array',
	};

	return (
		<div className="_singleSchema">
			{fieldLabel && <div className="_fieldLabel">{fieldLabel}</div>}
			<div className="_multiTypeContainer">
				<select
					className="_typeSelector"
					value={selectedType}
					onChange={e => handleTypeChange(e.target.value as SchemaType)}
				>
					{availableTypes.map(type => (
						<option key={type} value={type}>
							{typeLabels[type] || type}
						</option>
					))}
				</select>
				<div className="_multiTypeEditor">{renderEditorForType(selectedType)}</div>
			</div>
		</div>
	);
}
