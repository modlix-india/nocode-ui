import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import StringField from './StringField';
import NumberField from './NumberField';
import AnyField from './AnyField';
import SingleSchema from './SingleSchema';
import { Repository, Schema, isNullValue } from '@fincity/kirun-js';
import { shortUUID } from '../../../util/shortUUID';
import duplicate from '../../../util/duplicate';
import SelectField from './SelectField';

interface ArrayFieldProps {
	label: string;
	value: any | undefined;
	propPath: string;
	onChange: (propPath: string, v: any | undefined) => void;
	type?: 'STRING' | 'NUMBER' | 'SCHEMA' | 'ANY' | 'SELECT';
	options?: { label: string; value: any }[];
	schemaRepository: Repository<Schema>;
	children?: ReactNode;
}

export default function MapField({
	label,
	value,
	propPath,
	onChange,
	type = 'ANY',
	schemaRepository,
	options,
}: ArrayFieldProps) {
	const elements: ReactNode[] = [];

	const [order, setOrder] = useState<Map<string, number>>(new Map());
	const [newProp, setNewProp] = useState<string>('');

	useEffect(() => {
		setOrder(new Map(isNullValue(value) ? [] : Object.keys(value).map((e, i) => [e, i])));
	}, [value]);

	if (order.size) {
		const entries = Object.entries(value ?? {}).sort(
			(a, b) => order.get(a[0])! - order.get(b[0])!,
		);
		for (let i = 0; i < entries.length; i++) {
			elements.push(
				<EachOne
					type={type}
					onChange={onChange}
					value={entries[i][1]}
					propPath={`${propPath}.${entries[i][0]}`}
					label={entries[i][0]}
					schemaRepository={schemaRepository}
					deleteItem={() => {
						const newValues = duplicate(value);
						if (order.size === 1) onChange(propPath, undefined);
						else {
							delete newValues[entries[i][0]];
							onChange(propPath, newValues);
						}
					}}
					options={options}
				/>,
			);
		}
	}

	const newOne = (
		<div className="_eachValue">
			<input type="text" value={newProp} onChange={e => setNewProp(e.target.value)} />
			<button
				onClick={() => {
					const v = newProp.trim();
					if (!v) return;
					if (value?.[newProp]) return;
					const newValues = value ? duplicate(value) : {};
					newValues[newProp] = undefined;
					onChange(propPath, newValues);
				}}
			>
				+ Add
			</button>
		</div>
	);

	return (
		<>
			<label className="_rightJustify">{label} :</label>
			<div className="_leftJustify _flexRow _object">
				{elements}
				{newOne}
			</div>
		</>
	);
}

interface EachOneProps {
	type: 'STRING' | 'NUMBER' | 'SCHEMA' | 'ANY' | 'SELECT';
	value: any;
	label: string;
	propPath: string;
	onChange: (propPath: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	deleteItem?: () => void | undefined;
	options?: { label: string; value: any }[];
}

function EachOne({
	value,
	label,
	onChange,
	propPath,
	type,
	schemaRepository,
	deleteItem,
	options,
}: EachOneProps) {
	let valueComp = null;
	if (type === 'STRING') {
		valueComp = (
			<StringField label={''} value={value} onChange={onChange} propPath={propPath} />
		);
	} else if (type === 'NUMBER') {
		valueComp = (
			<NumberField label={''} value={value} onChange={onChange} propPath={propPath} />
		);
	} else if (type === 'SCHEMA') {
		valueComp = (
			<SingleSchema
				schema={value}
				onChange={v => onChange(propPath, v)}
				schemaRepository={schemaRepository}
				shouldShowNameNamespace={false}
			/>
		);
	} else if (type === 'SELECT') {
		valueComp = (
			<SelectField
				label={''}
				value={value}
				onChange={onChange}
				propPath={propPath}
				options={options}
			/>
		);
	}

	if (!valueComp) {
		valueComp = (
			<div className="_eachUpDown">
				{toType(value)}
				<AnyField label={''} value={value} onChange={onChange} propPath={propPath} />
			</div>
		);
	}

	return (
		<>
			<div className="_rightJustify _flexRow">
				{label}
				<i className="fa fa-regular fa-trash-can" onClick={deleteItem} />
			</div>
			<div className="_leftJustify">{valueComp}</div>
		</>
	);
}

function toType(value: any) {
	if (Array.isArray(value)) {
		if (!value.length) return '[Empty Array]';
		return `[Array(${value
			.map(e => {
				if (Array.isArray(e)) return 'Array';
				const type = typeof e;
				return type[0].toUpperCase() + type.slice(1);
			})
			.join(', ')})]`;
	} else if (typeof value === 'object') {
		return '[Object]';
	} else {
		return '' + value;
	}
}
