import {
	Repository,
	Schema,
	SchemaType,
	SchemaUtil,
	SchemaValidationException,
	SchemaValidator,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import duplicate from '../../../util/duplicate';

export function NumberValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
}: {
	value: number | undefined;
	schema: Schema;
	onChange: (v: number | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState<number>(isNullValue(value) ? 0 : value!);

	useEffect(() => {
		setInValue(isNullValue(value) ? 0 : value!);
	}, [value]);

	const [msg, setMsg] = useState<string>('');

	useEffect(() => {
		let message = '';
		try {
			SchemaValidator.validate(undefined, schema, schemaRepository, inValue);
		} catch (e: any) {
			if (e.message) message = e.message;
			else message = '' + e;
		}
		setMsg(message);
	}, [inValue]);

	const [options, setOptions] = useState<any[]>([]);

	useEffect(() => {
		let sch = schema;
		if (!isNullValue(schema.getRef())) {
			sch = SchemaUtil.getSchemaFromRef(sch, schemaRepository, schema.getRef()) ?? sch;
		}

		if (sch.getEnums()?.length) {
			const enums = duplicate(sch.getEnums() ?? []);
			enums.unshift(undefined);
			setOptions(enums);
		}
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
			value={inValue}
			onChange={ev => {
				const ind = ev.target.value.indexOf('.');
				setInValue((ind === -1 ? parseInt : parseFloat)(ev.target.value));
			}}
			onKeyDown={ev => {
				if (ev.key === 'Enter') onChange(inValue);
				else if (ev.key === 'Escape') setInValue(isNullValue(value) ? 0 : value!);
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