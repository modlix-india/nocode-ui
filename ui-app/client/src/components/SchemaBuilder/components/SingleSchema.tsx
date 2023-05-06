import { Repository, Schema, SchemaType, StringFormat, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useState } from 'react';
import StringField from './StringField';
import duplicate from '../../../util/duplicate';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import SelectField from './SelectField';
import NumberField from './NumberField';
import AnyField from './AnyField';
import ArrayField from './ArrayField';
import { intersection, isSubset } from '../../../util/setOperations';

interface SingleSchemaProps {
	schema: any;
	type?: SchemaType;
	onChange: (v: any) => void;
	schemaRepository: Repository<Schema>;
	shouldShowNameNamespace?: boolean;
}

const ALL_SET = [...Schema.ofAny('Any').getType()?.getAllowedSchemaTypes()!];
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
}: SingleSchemaProps) {
	const [backup, setBackup] = React.useState<any>({});
	const schema = inSchema ?? {};

	if (inSchema?.type && !Array.isArray(inSchema.type)) {
		inSchema.type = [inSchema.type];
	}

	const [showAdvanced, setShowAdvanced] = useState(
		(schema.oneOf?.length || schema.allOf?.length || schema.anyOf?.length || schema.not) ??
			false,
	);
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
		finType.add(type);
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
			typeFields = (
				<>
					<NumberField
						label="Multiple Of"
						value={schema.multipleOf}
						propPath="multipleOf"
						onChange={schemaChange}
					/>
					<NumberField
						label="Minimum"
						value={schema.minimum}
						propPath="minimum"
						onChange={schemaChange}
					/>
					<NumberField
						label="Maximum"
						value={schema.maximum}
						propPath="maximum"
						onChange={schemaChange}
					/>
					<NumberField
						label="Exclusive Minimum"
						value={schema.exclusiveMinimum}
						propPath="exclusiveMinimum"
						onChange={schemaChange}
					/>
					<NumberField
						label="Exclusive Maximum"
						value={schema.exclusiveMaximum}
						propPath="exclusiveMaximum"
						onChange={schemaChange}
					/>
				</>
			);
		} else if (finType.has(SchemaType.STRING)) {
			typeFields = (
				<>
					<NumberField
						label="Minimum Length"
						value={schema.minLength}
						propPath="minLength"
						onChange={schemaChange}
					/>
					<NumberField
						label="Maximum Length"
						value={schema.maxLength}
						propPath="maxLength"
						onChange={schemaChange}
					/>
					<SelectField
						label="Format"
						value={schema.format}
						propPath="format"
						onChange={schemaChange}
						options={[
							{ label: 'None', value: '' },
							...Object.values(StringFormat).map(e => ({ label: e, value: e })),
						]}
					/>
					<StringField
						label="Pattern"
						value={schema.pattern}
						propPath="pattern"
						onChange={schemaChange}
						validationLogic={v => {
							try {
								if (!v) return '';
								new RegExp(v);
							} catch (e: any) {
								return e.message;
							}
							return '';
						}}
					/>
				</>
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
				value={Array.from(finType).map(e => e.toUpperCase())}
				propPath="type"
				options={TYPE_OPTIONS}
				type="SELECT"
				onChange={(p: string, v: undefined | any) => {
					console.log(p, v);
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

	const showAdvancedCheckbox = (
		<>
			<label className="_rightJustify">Show Advanced :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showAdvanced}
					onChange={() => setShowAdvanced(!showAdvanced)}
				/>
			</div>
		</>
	);

	const advancedComps = showAdvanced ? (
		<>
			<ArrayField
				label="One of"
				value={schema.oneOf}
				propPath="oneOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<ArrayField
				label="All of"
				value={schema.allOf}
				propPath="allOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<ArrayField
				label="Any of"
				value={schema.anyOf}
				propPath="anyOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<label className="_rightJustify">Not :</label>
			<div className="_leftJustify">
				<SingleSchema
					schema={schema.not}
					onChange={v => {
						const s = duplicate(schema ?? {});
						s.not = v;
						onChange(s);
					}}
					schemaRepository={schemaRepository}
					shouldShowNameNamespace={false}
				/>
				<button
					onClick={v => {
						const s = duplicate(schema ?? {});
						delete s.not;
						onChange(s);
					}}
				>
					Remove
				</button>
			</div>
			<ArrayField
				label="examples"
				value={schema.examples}
				propPath="examples"
				onChange={schemaChange}
				type="ANY"
				schemaRepository={schemaRepository}
			/>
		</>
	) : (
		<></>
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

	console.log(schema);

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
			{showAdvancedCheckbox}
			{advancedComps}
			{showDesFieldsCheckBox}
			{desComps}
		</div>
	);
}
