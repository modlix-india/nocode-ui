import React, { ReactNode, useCallback } from 'react';
import StringField from './StringField';
import NumberField from './NumberField';
import AnyField from './AnyField';
import { duplicate, Repository, Schema } from '@fincity/kirun-js';
import SelectField from './SelectField';

interface ArrayFieldProps {
	label: string;
	value: any[] | undefined;
	propPath: string;
	onChange: (propPath: string, v: [] | undefined) => void;
	type?: 'STRING' | 'NUMBER' | 'ANY' | 'SELECT';
	options?: { label: string; value: any }[];
	schemaRepository: Repository<Schema>;
	children?: ReactNode;
	readOnly?: boolean;
}

export default function ArrayField({
	label,
	value,
	propPath,
	onChange,
	type = 'ANY',
	schemaRepository,
	options,
	readOnly = false,
}: Readonly<ArrayFieldProps>) {
	const elements: ReactNode[] = [];

	const moveUpDown = useCallback(
		(index: number, up: boolean) => {
			if (!value?.length) return;
			const newValues = duplicate(value);
			const temp = newValues[index];
			if (up && index === 0) {
				const f = newValues.splice(index, 1);
				newValues.push(f[0]);
			} else if (!up && index === newValues.length - 1) {
				const f = newValues.splice(index, 1);
				newValues.unshift(f[0]);
			} else {
				const f = newValues[index];
				newValues[index] = newValues[up ? index - 1 : index + 1];
				newValues[up ? index - 1 : index + 1] = f;
			}
			onChange(propPath, newValues);
		},
		[value, onChange, propPath],
	);

	if (value?.length) {
		for (let i = 0; i < value.length; i++) {
			elements.push(
				// A fresh key per render remounted every row on every parent render, which closed
				// any open value popup and threw away half-typed text. The index is a safe key
				// here: reorder and delete both write a whole new array through onChange.
				<div className="_eachValue" key={`${propPath}[${i}]`}>
					<EachOne
						type={type}
						value={value[i]}
						onChange={onChange}
						propPath={`${propPath}[${i}]`}
						schemaRepository={schemaRepository}
						readOnly={readOnly}
						moveUp={readOnly ? undefined : () => moveUpDown(i, true)}
						moveDown={readOnly ? undefined : () => moveUpDown(i, false)}
						deleteItem={
							readOnly
								? undefined
								: () => {
										const newValues = duplicate(value);
										newValues.splice(i, 1);
										if (newValues.length === 0) onChange(propPath, undefined);
										else onChange(propPath, newValues);
									}
						}
						options={options}
					/>
				</div>,
			);
		}
	}

	const newOne = readOnly ? undefined : (
		<div className="_eachValue">
			<EachOne
				type={type}
				value={undefined}
				onChange={onChange}
				propPath={`${propPath}[${!value ? 0 : value.length}]`}
				schemaRepository={schemaRepository}
				options={options}
			/>
		</div>
	);

	return (
		<>
			<label className="_rightJustify">{label} :</label>
			<div className="_leftJustify _flexRow _array">
				{elements}
				{newOne}
			</div>
		</>
	);
}

interface EachOneProps {
	type: 'STRING' | 'NUMBER' | 'ANY' | 'SELECT';
	value: any;
	propPath: string;
	onChange: (propPath: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	moveUp?: () => void | undefined;
	moveDown?: () => void | undefined;
	deleteItem?: () => void | undefined;
	options?: { label: string; value: any }[];
	readOnly?: boolean;
}

function EachOne({
	value,
	onChange,
	propPath,
	type,
	schemaRepository,
	moveUp,
	moveDown,
	deleteItem,
	options,
	readOnly = false,
}: Readonly<EachOneProps>) {
	let valueComp = null;
	if (type === 'STRING') {
		valueComp = (
			<StringField
				label={''}
				value={value}
				onChange={onChange}
				propPath={propPath}
				readOnly={readOnly}
			/>
		);
	} else if (type === 'NUMBER') {
		valueComp = (
			<NumberField
				label={''}
				value={value}
				onChange={onChange}
				propPath={propPath}
				readOnly={readOnly}
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
				readOnly={readOnly}
			/>
		);
	}
	const moveUpComp = moveUp ? <i className="fa fa-arrow-up" onClick={moveUp} /> : <></>;
	const moveDownComp = moveDown ? <i className="fa fa-arrow-down" onClick={moveDown} /> : <></>;
	const deleteComp = deleteItem ? (
		<i className="fa fa-regular fa-trash-can" onClick={deleteItem} />
	) : (
		<></>
	);

	if (valueComp) {
		return (
			<div className="_eachUpDown">
				{valueComp}
				{moveUpComp}
				{moveDownComp}
				{deleteComp}
			</div>
		);
	} else {
		valueComp = (
			<div className="_eachUpDown">
				{moveUp ? toType(value) : ''}
				{moveUpComp}
				{moveDownComp}
				{deleteComp}

				<AnyField
					label={''}
					value={value}
					onChange={onChange}
					propPath={propPath}
					buttonLabel={moveUp ? undefined : 'Add Value'}
				/>
			</div>
		);
	}

	return valueComp;
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
