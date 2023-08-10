import {
	Repository,
	Schema,
	SchemaUtil,
	SchemaValidationException,
	SchemaValidator,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useRef, useState } from 'react';
import { duplicate } from '@fincity/kirun-js';

let counter = 0;
let insideCounter = 0;

export function StringValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
}: {
	value: string | undefined;
	schema: Schema;
	onChange: (v: string | undefined) => void;
	schemaRepository: Repository<Schema>;
}) {
	const [inValue, setInValue] = useState(value ?? '');

	useEffect(() => {
		(async () => {
			const x = await SchemaUtil.getDefaultValue(schema, schemaRepository);
			if (!isNullValue(value)) {
				setInValue(value!);
				return;
			}
			setInValue(value ?? x ?? '');
		})();
	}, [value, setInValue, schema, schemaRepository]);

	const [msg, setMsg] = useState<string>('');

	useEffect(() => {
		(async () => {
			let message = '';
			try {
				SchemaValidator.validate(undefined, schema, schemaRepository, inValue);
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
