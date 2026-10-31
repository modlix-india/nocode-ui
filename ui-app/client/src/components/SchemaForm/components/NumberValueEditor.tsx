import React, { useEffect, useRef, useState } from 'react';
import { DraftNumberInput } from '../../util/DraftNumberInput';
import {
	Repository,
	Schema,
	SchemaUtil,
	SchemaValidator,
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';

export function NumberValueEditor({
	value,
	schema,
	onChange: actualOnChange,
	schemaRepository,
	defaultValue,
	label,
}: Readonly<{
	value: number | undefined;
	defaultValue: number | undefined;
	schema: Schema;
	onChange: (v: number | undefined) => void;
	schemaRepository: Repository<Schema>;
	label?: string;
}>) {
	const [inValue, setInValue] = useState<number | undefined>(value ?? defaultValue);
	// inValue as last set, for a blur or Enter that runs in the same event as the box settling.
	const inValueRef = useRef<number | undefined>(inValue);
	const setIn = (v: number | undefined) => {
		inValueRef.current = v;
		setInValue(v);
	};

	const onChange = async (v: number | undefined) => {
		if (defaultValue === v) actualOnChange(undefined);
		else actualOnChange(v);
	};

	useEffect(() => {
		setIn(value ?? defaultValue);
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

	// An option's value is its text; the empty one is None. Picking one commits it at once, as
	// Enter and blur do for the box: the enum's own number, or undefined for None.
	const inputElement = options.length ? (
		<select
			value={isNullValue(inValue) ? '' : String(inValue)}
			onChange={ev => {
				const text = ev.target.value;
				const v =
					text === ''
						? undefined
						: options.find(e => !isNullValue(e) && String(e) === text);
				setIn(v);
				onChange(v);
			}}
		>
			{options.map(e => (
				<option
					key={isNullValue(e) ? '' : String(e)}
					value={isNullValue(e) ? '' : String(e)}
				>
					{isNullValue(e) ? 'None' : '' + e}
				</option>
			))}
		</select>
	) : (
		// The box keeps the text as typed; inValue follows it once it is a complete number.
		<DraftNumberInput
			value={inValue}
			allowEmpty
			onNumber={setIn}
			onKeyDown={ev => {
				if (ev.key === 'Enter') onChange(inValueRef.current);
				else if (ev.key === 'Escape') setIn(value);
			}}
			// The box has settled inValue (inValueRef) before this runs.
			onBlur={() => onChange(inValueRef.current)}
		/>
	);
	return (
		<div className="_singleSchema">
			{label && <div className="_fieldLabel">{label}</div>}
			<div className="_inputElement">
				{inputElement}
				<i className="fa fa-regular fa-circle-xmark" onClick={() => onChange(undefined)} />
			</div>
			{msg && <div className="_errorMessages">{msg}</div>}
		</div>
	);
}
