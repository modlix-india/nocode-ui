import {
	ArraySchemaType,
	Repository,
	Schema,
	SchemaValidator,
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import SingleSchemaForm from './SingleSchemaForm';
import { shortUUID } from '../../../util/shortUUID';

export default function ArrayValueEditor({
	value: actualValue,
	schema,
	onChange,
	schemaRepository,
	path,
}: {
	value: any;
	schema: Schema;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	path: string;
}) {
	const [msg, setMsg] = useState<string>('');
	const [value, setvalue] = useState<Array<any>>([]);
	const [arrayKeys, setArrayKeys] = useState<Array<string>>([]);

	const items: ArraySchemaType | undefined = schema.getItems();

	useEffect(() => {
		(async () => {
			if (isNullValue(actualValue)) return;
			let message = '';
			try {
				await SchemaValidator.validate(undefined, schema, schemaRepository, actualValue);
			} catch (e: any) {
				if (e.message) message = e.message;
				else message = '' + e;
			}
			setMsg(message);
		})();

		setvalue(actualValue ?? []);
	}, [actualValue]);

	const singleSchema = items
		?.getSingleSchema()
		?.getType()
		?.getAllowedSchemaTypes()
		?.values()
		.next().value;

	console.log(singleSchema, 'singleSchema');
	// const handleDelete = index => {
	// 	value.splice(index, 1);
	// 	onChange(path ? `${path}[${value.length}]` : `[${value.length}]`, undefined);
	// };
	console.log(value, 'value');
	const singleForm = singleSchema
		? value.map((each, index) => (
				<div className="arraySingleForm">
					<SingleSchemaForm
						key={`_key_${index}`}
						schema={items?.getSingleSchema()}
						path={path ? `${path}[${index}]` : `[${index}]`}
						value={each}
						schemaRepository={schemaRepository}
						onChange={onChange}
					/>
					<i
						className="reduceOne fa fa-circle-minus fa-solid"
						// onClick={() => handleDelete(index)}
					></i>
					{index}
				</div>
		  ))
		: null;

	const addArrayItem = () => {
		onChange(path ? `${path}[${value.length}]` : `[${value.length}]`, undefined);
	};

	const newProp = (
		<div className="_newProp">
			<button onClick={addArrayItem}>Add Element</button>
		</div>
	);

	return (
		<div className=" _singleSchema _arrayEditor">
			{singleForm}
			{newProp}
		</div>
	);
}
