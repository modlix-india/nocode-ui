import {
	Repository,
	Schema,
	SchemaUtil,
	SchemaValidator,
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';

export function NumberValueEditor({
	value,
	schema,
	onChange: actualOnChange,
	schemaRepository,
	defaultValue,
}: {
	value: number | undefined;
	defaultValue: number | undefined;
	schema: Schema;
	onChange: (v: number | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState<number | undefined>(value ?? defaultValue);

	const onChange = async (v: number | undefined) => {
		if (defaultValue === v) actualOnChange(undefined);
		else actualOnChange(v);
	};

	useEffect(() => {
		setInValue(value ?? defaultValue);
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
		<select value={inValue}>
			{options.map(e => (
				<option value={e}>{isNullValue(e) ? 'None' : '' + e}</option>
			))}
		</select>
	) : (
		<input
			type="number"
			value={inValue ?? ''}
			onChange={ev => {
				if (ev.target.value == '') {
					setInValue(undefined);
					return;
				}
				const ind = ev.target.value.indexOf('.');
				setInValue((ind === -1 ? parseInt : parseFloat)(ev.target.value));
			}}
			onKeyDown={ev => {
				if (ev.key === 'Enter') onChange(inValue);
				else if (ev.key === 'Escape') setInValue(value);
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
