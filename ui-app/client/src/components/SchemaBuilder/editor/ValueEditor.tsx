import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { AnyValueEditor } from '../../PageEditor/editors/propertyValueEditors/AnyValueEditor';

const NUMBER_TYPES = new Set(['INTEGER', 'LONG', 'FLOAT', 'DOUBLE']);

export default function ValueEditor({
	value,
	onChange,
	types,
	readOnly = false,
}: Readonly<{
	value: any;
	onChange: (v: any) => void;
	types: string[];
	readOnly?: boolean;
}>) {
	if (
		types.length === 1 &&
		types[0] === 'STRING' &&
		(isNullValue(value) || typeof value === 'string')
	)
		return <StringValue value={value} onChange={onChange} readOnly={readOnly} />;

	if (
		types.length === 1 &&
		NUMBER_TYPES.has(types[0]) &&
		(isNullValue(value) || typeof value === 'number')
	)
		return <NumberValue value={value} onChange={onChange} readOnly={readOnly} />;

	if (
		types.length === 1 &&
		types[0] === 'BOOLEAN' &&
		(isNullValue(value) || typeof value === 'boolean')
	)
		return (
			<select
				value={isNullValue(value) ? '' : '' + value}
				disabled={readOnly}
				onChange={e =>
					onChange(e.target.value === '' ? undefined : e.target.value === 'true')
				}
			>
				<option value="">Unset</option>
				<option value="true">True</option>
				<option value="false">False</option>
			</select>
		);

	return (
		<div className="_anyValue">
			<span className="_valuePreview">{preview(value)}</span>
			<AnyValueEditor
				value={value}
				onChange={v => (readOnly ? undefined : onChange(v))}
				buttonLabel={isNullValue(value) ? 'Set Value' : 'Edit'}
			/>
		</div>
	);
}

function StringValue({
	value,
	onChange,
	readOnly,
}: Readonly<{ value: string | undefined; onChange: (v: any) => void; readOnly: boolean }>) {
	const [inValue, setInValue] = useState(value ?? '');
	useEffect(() => setInValue(value ?? ''), [value]);

	const commit = () => {
		if (inValue === (value ?? '')) return;
		onChange(inValue === '' ? undefined : inValue);
	};

	return (
		<input
			type="text"
			value={inValue}
			disabled={readOnly}
			onChange={e => setInValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(value ?? '');
				else if (e.key === 'Enter') commit();
			}}
			onBlur={commit}
		/>
	);
}

function NumberValue({
	value,
	onChange,
	readOnly,
}: Readonly<{ value: number | undefined; onChange: (v: any) => void; readOnly: boolean }>) {
	const [inValue, setInValue] = useState(isNullValue(value) ? '' : '' + value);
	useEffect(() => setInValue(isNullValue(value) ? '' : '' + value), [value]);

	const commit = () => {
		if (inValue.trim() === '') {
			if (!isNullValue(value)) onChange(undefined);
			return;
		}
		const n = Number(inValue);
		if (isNaN(n)) setInValue(isNullValue(value) ? '' : '' + value);
		else if (n !== value) onChange(n);
	};

	return (
		<input
			type="text"
			value={inValue}
			disabled={readOnly}
			onChange={e => setInValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(isNullValue(value) ? '' : '' + value);
				else if (e.key === 'Enter') commit();
			}}
			onBlur={commit}
		/>
	);
}

function preview(value: any): string {
	if (isNullValue(value)) return '';
	if (Array.isArray(value)) return value.length ? `[Array(${value.length})]` : '[Empty Array]';
	if (typeof value === 'object') return '[Object]';
	return '' + value;
}
