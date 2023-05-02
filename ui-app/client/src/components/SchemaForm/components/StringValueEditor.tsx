import { Repository, Schema, SchemaValidationException, SchemaValidator } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';

export function StringValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
}: {
	value: string;
	schema: Schema;
	onChange: (v: string) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState(value ?? '');

	console.log(value);

	useEffect(() => {
		setInValue(value ?? '');
	}, [value]);

	const [msg, setMsg] = useState<string>('Testing with message');

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

	return (
		<div className="_singleSchema">
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
			<div className="_errorMessages">{msg}</div>
		</div>
	);
}
