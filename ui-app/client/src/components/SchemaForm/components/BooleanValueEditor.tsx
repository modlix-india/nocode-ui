import { Repository, Schema, SchemaValidator } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import CommonTriStateCheckbox from '../../../commonComponents/CommonTriStateCheckbox';

export function BooleanValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
	label,
}: Readonly<{
	value: boolean | undefined;
	schema: Schema;
	onChange: (v: boolean | undefined) => void;
	schemaRepository: Repository<Schema>;
	label?: string;
}>) {
	const [inValue, setInValue] = useState(value);

	useEffect(() => {
		setInValue(value);
	}, [value]);

	const [msg, setMsg] = useState<string>('');

	useEffect(() => {
		(async () => {
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

	return (
		<div className="_singleSchema">
			{label && <div className="_fieldLabel">{label}</div>}
			<div className="_inputElement">
				<CommonTriStateCheckbox value={inValue} onChange={e => onChange(e)} states={3} />
			</div>
			{msg && <div className="_errorMessages">{msg}</div>}
		</div>
	);
}
