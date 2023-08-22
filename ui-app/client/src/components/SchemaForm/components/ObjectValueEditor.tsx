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
import SingleSchemaForm from './SingleSchemaForm';

export function ObjectValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
	defaultValue,
	path,
}: {
	value: any;
	defaultValue: any;
	schema: Schema;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	path: string;
}) {
	const [msg, setMsg] = useState<string>('');
	const [propName, setPropName] = useState<string>('');
	const [propList, setPropList] = useState<Array<[string, any]>>([]);

	useEffect(() => {
		(async () => {
			if (isNullValue(value)) return;
			let message = '';
			try {
				await SchemaValidator.validate(undefined, schema, schemaRepository, value);
			} catch (e: any) {
				if (e.message) message = e.message;
				else message = '' + e;
			}
			setMsg(message);
		})();
		setPropList(Object.entries(value ?? {}).sort((a, b) => a[0].localeCompare(b[0])));
	}, [value]);

	const props = propList.map(e => (
		<div className="_objectProp" key={e[0]}>
			<div className="_propName">{e[0]}</div>
			<div className="_propValues">
				<SingleSchemaForm
					key={e[0]}
					schema={
						schema.getProperties()?.get(e[0]) ??
						schema.getAdditionalProperties()?.getSchemaValue()
					}
					path={path ? `${path}.${e[0]}` : e[0]}
					value={e[1]}
					schemaRepository={schemaRepository}
					onChange={onChange}
				/>
				<i className="fa fa-regular fa-circle-xmark" onClick={() => {}} />
			</div>
		</div>
	));
	const errors = msg ? <div className="_errorMessages">{msg}</div> : undefined;
	const addProperty = () => {
		if (!propName || value?.hasOwnProperty(propName)) return;
		onChange(path ? `${path}.${propName}` : propName, undefined);
		setPropName('');
	};
	const newProp = (
		<div className="_newProp">
			<input
				type="text"
				value={propName}
				onChange={e => setPropName(e.target.value)}
				onKeyDown={e => {
					if (e.key != 'Enter') return;
					addProperty();
				}}
			/>
			<button onClick={addProperty}>Add Property</button>
		</div>
	);
	return (
		<div className="_singleSchema _objectEditor">
			{props}
			{newProp}
			{errors}
		</div>
	);
}
