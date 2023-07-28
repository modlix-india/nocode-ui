import { Repository, Schema, SchemaType, isNullValue } from '@fincity/kirun-js';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import React, { useCallback, useState } from 'react';
import { duplicate } from '@fincity/kirun-js';
import { intersection } from '../../../util/setOperations';
import AnyField from './AnyField';
import ArrayField from './ArrayField';
import NumberField from './NumberField';
import SchemaAdvanced from './../fields/SchemaAdvanced';
import SchemaNumbers from './../fields/SchemaNumbers';
import SchemaObjects from './../fields/SchemaObjects';
import SchemaStrings from './../fields/SchemaStrings';
import SelectField from './SelectField';
import StringField from './StringField';
import SchemaArrays from '../fields/SchemaArrays';

interface SingleSchemaProps {
	schema: any;
	type?: string;
	onChange: (v: any) => void;
	schemaRepository: Repository<Schema>;
	shouldShowNameNamespace?: boolean;
	showRemove?: boolean;
}

const ALL_SET = Array.from(Schema.ofAny('Any').getType()?.getAllowedSchemaTypes()!);
const TYPE_OPTIONS = [
	{ label: 'None', value: undefined },
	...ALL_SET.map(e => ({ label: e, value: e.toUpperCase() })),
];
const NUMBER_SET = Schema.ofNumber('Number').getType()?.getAllowedSchemaTypes()!;

export default function SingleSchema({
	schema: inSchema,
	type,
	onChange,
	schemaRepository,
	shouldShowNameNamespace,
	showRemove = false,
}: SingleSchemaProps) {
	const [backup, setBackup] = React.useState<any>({});
	const schema = inSchema ?? {};

	if (inSchema?.type && !Array.isArray(inSchema.type)) {
		inSchema.type = [inSchema.type];
	}

	const [showDesFields, setShowDesFields] = useState(
		(schema.description || schema.comment) ?? false,
	);

	React.useEffect(() => {
		if (isNullValue(schema)) return;
	}, [schema]);

	const schemaChange = useCallback(
		(path: string, v: any) => {
			const newSchema = isNullValue(schema) ? {} : duplicate(schema);
			const internal = { value: newSchema };

			const map = new Map([['Internal.', new StoreExtractor(internal, 'Internal.')]]);
			setStoreData(
				'Internal.value' + (path ? '.' + path : ''),
				internal,
				v,
				'Internal',
				map,
				true,
			);
			onChange(internal.value);
		},
		[schema, onChange],
	);

	let typeFields = undefined;
	const finType = new Set<SchemaType>();
	if (type) {
		finType.add(SchemaType[type as keyof typeof SchemaType]);
	} else {
		if (schema.type) {
			if (Array.isArray(schema.type)) {
				schema.type.forEach((e: any) =>
					finType.add(SchemaType[e as keyof typeof SchemaType]),
				);
			} else {
				finType.add(SchemaType[schema.type as keyof typeof SchemaType]);
			}
		}
	}

	if (isNullValue(schema.constant) && isNullValue(schema.ref) && finType.size) {
		if (intersection(finType, NUMBER_SET).size) {
			typeFields = <SchemaNumbers schema={schema} schemaChange={schemaChange} />;
		} else if (finType.has(SchemaType.STRING)) {
			typeFields = <SchemaStrings schema={schema} schemaChange={schemaChange} />;
		} else if (finType.has(SchemaType.OBJECT)) {
			typeFields = (
				<SchemaObjects
					schema={schema}
					schemaChange={schemaChange}
					schemaRepository={schemaRepository}
				/>
			);
		} else if (finType.has(SchemaType.ARRAY)) {
			typeFields = (
				<SchemaArrays
					schema={schema}
					schemaChange={schemaChange}
					schemaRepository={schemaRepository}
				/>
			);
		}
	}

	const nameNamespace = shouldShowNameNamespace ? (
		<>
			<StringField label="Name" value={schema.name} propPath="name" onChange={schemaChange} />
			<StringField
				label="Namespace"
				value={schema.namespace}
				propPath="namespace"
				onChange={schemaChange}
			/>
			<NumberField
				label="Version"
				value={schema.version ?? 1}
				propPath="version"
				onChange={schemaChange}
			/>
		</>
	) : (
		<></>
	);

	const typeField =
		!schema.constant && !type ? (
			<ArrayField
				label="Type"
				value={Array.from(finType)
					.filter(e => !isNullValue(e))
					.map(e => e.toUpperCase())}
				propPath="type"
				options={TYPE_OPTIONS}
				type="SELECT"
				onChange={(p: string, v: undefined | any) => {
					if (!v || v.length === 0) schemaChange('type', undefined);
					else if (v.length === 1) schemaChange('type', v[0]);
					else schemaChange(p, v);
				}}
				schemaRepository={schemaRepository}
			/>
		) : (
			<SelectField
				label="Type"
				value={type}
				propPath="type"
				options={TYPE_OPTIONS}
				onChange={(p, v) => {}}
			/>
		);

	const refNTypeFields = schema.constant ? (
		<></>
	) : (
		<>
			<AnyField
				label="Default Value"
				value={schema.defaultValue}
				propPath="defaultValue"
				onChange={schemaChange}
				helpText="If a null value is provided this value will be used"
			/>
			{typeField}
			<StringField
				label="Ref"
				value={schema.ref}
				helpText="Adding reference will ignore other options"
				propPath="ref"
				onChange={schemaChange}
			/>
			<ArrayField
				label="Enums"
				value={schema.enums}
				propPath="enums"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
			/>
		</>
	);

	const showDesFieldsCheckBox = (
		<>
			<label className="_rightJustify">Show Description Fields :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showDesFields}
					onChange={() => setShowDesFields(!showDesFields)}
				/>
			</div>
		</>
	);

	const desComps = showDesFields ? (
		<>
			<StringField
				label="Description"
				value={schema.description}
				textArea={true}
				propPath="description"
				onChange={schemaChange}
			/>
			<StringField
				label="Comment"
				value={schema.comment}
				propPath="comment"
				onChange={schemaChange}
			/>
		</>
	) : (
		<></>
	);

	const removeButton = showRemove ? (
		<button onClick={v => onChange(undefined)}>Remove</button>
	) : (
		<></>
	);

	return (
		<div className="_singleSchema">
			{nameNamespace}
			<AnyField
				label="Constant"
				value={schema.constant}
				propPath="constant"
				onChange={schemaChange}
				helpText="This value is used irrespective of the value provided in the request, rest of the fields are ignored"
			/>
			{refNTypeFields}
			{typeFields}
			<SchemaAdvanced
				schema={schema}
				schemaChange={schemaChange}
				schemaRepository={schemaRepository}
				onChange={onChange}
			/>
			{showDesFieldsCheckBox}
			{desComps}
			{removeButton}
		</div>
	);
}
