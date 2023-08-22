import { Repository, Schema, SchemaValidationException, SchemaValidator } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import CommonTriStateCheckbox from '../../../commonComponents/CommonTriStateCheckbox';

export function BooleanValueEditor({
	value,
	schema,
	onChange: actualOnChange,
	schemaRepository,
	defaultValue,
}: {
	value: boolean | undefined;
	schema: Schema;
	defaultValue: boolean | undefined;
	onChange: (v: boolean | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState(value ?? defaultValue);
	const onChange = async (v: boolean | undefined) => {
		if (defaultValue === v) actualOnChange(undefined);
		else actualOnChange(v);
	};

	useEffect(() => {
		setInValue(value ?? defaultValue);
	}, [value, defaultValue]);

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
	const errors = msg ? <div className="_errorMessages">{msg}</div> : undefined;
	return (
		<div className="_singleSchema">
			<div className="_inputElement">
				<CommonTriStateCheckbox value={inValue} onChange={e => onChange(e)} states={3} />
			</div>
		</div>
	);
}
