import {
	Repository,
	Schema,
	SchemaUtil,
	SchemaValidationException,
	SchemaValidator,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { duplicate } from '@fincity/kirun-js';

export function StringValueEditor({
	value,
	schema,
	onChange: actualOnChange,
	schemaRepository,
	defaultValue,
}: {
	value: string | undefined;
	defaultValue: string | undefined;
	schema: Schema;
	onChange: (v: string | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState(value ?? defaultValue ?? '');

	const onChange = async (v: string | undefined) => {
		if (defaultValue === v) actualOnChange(undefined);
		else actualOnChange(v);
	};

	useEffect(() => {
		setInValue(value ?? defaultValue ?? '');
	}, [value, defaultValue]);

	const [msg, setMsg] = useState<string>('');

	useEffect(() => {
		(async () => {
			if (isNullValue(inValue)) return;
			let message = '';
			try {
				await SchemaValidator.validate(undefined, schema, schemaRepository, inValue);
			} catch (e: any) {
				if (e.message) message = e.message;
				else message = '' + e;
			}
			setMsg(message);
		})();
	}, [inValue]);

	const [options, setOptions] = useState<any[]>([]);

	useEffect(() => {
		(async () => {
			let sch = schema;
			if (!isNullValue(schema.getRef())) {
				sch =
					(await SchemaUtil.getSchemaFromRef(sch, schemaRepository, schema.getRef())) ??
					sch;
			}

			if (sch.getEnums()?.length) {
				const enums = duplicate(sch.getEnums() ?? []);
				enums.unshift(undefined);
				setOptions(enums);
			}
		})();
	}, [schema, schemaRepository]);

	const inputElement = options.length ? (
		<select value={inValue} onChange={ev => onChange(ev.target.value)}>
			{options.map(e => (
				<option key={e} value={e}>
					{isNullValue(e) ? 'None' : '' + e}
				</option>
			))}
		</select>
	) : (
		<input
			type="text"
			value={inValue}
			onChange={ev => setInValue(ev.target.value)}
			onKeyDown={ev => {
				if (ev.key === 'Enter') onChange(inValue);
				else if (ev.key === 'Escape') setInValue(value ?? '');
			}}
			onBlur={() => onChange(inValue)}
		/>
	);
	return (
		<div className="_singleSchema">
			<div className="_inputElement">
				{inputElement}
				<i className="fa fa-regular fa-circle-xmark" onClick={() => onChange(undefined)} />
			</div>
			<div className="_errorMessages">{msg}</div>
		</div>
	);
}
