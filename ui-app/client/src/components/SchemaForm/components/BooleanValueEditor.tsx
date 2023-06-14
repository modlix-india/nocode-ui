import { Repository, Schema, SchemaValidationException, SchemaValidator } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import CommonTriStateCheckbox from '../../../commonComponents/CommonTriStateCheckbox';

export function BooleanValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
}: {
	value: boolean | undefined;
	schema: Schema;
	onChange: (v: boolean | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState(value);

	useEffect(() => {
		setInValue(value);
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

	return (
		<div className="_singleSchema">
			<div className="_inputElement">
				<CommonTriStateCheckbox value={inValue} onChange={e => onChange(e)} states={3} />
			</div>
			<div className="_errorMessages">{msg}</div>
		</div>
	);
}
