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
	value,
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
	// const [valueProp, setValueProp] = useState<any>('');
	const [msg, setMsg] = useState<string>('');
	const [prop, setProp] = useState<Array<any>>([]);
	const [arrayKeys, setArrayKeys] = useState<Array<string>>([]);
	const items: ArraySchemaType | undefined = schema.getItems();
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
		const genKeys = (value ?? []).map(() => shortUUID());
		setArrayKeys(genKeys);
		setProp(value ?? []);
		console.log(value, 'picard');
	}, [value]);
	const singleSchema = items?.getSingleSchema()?.getType();
	const singleSchemaType = singleSchema?.getAllowedSchemaTypes();
	const singleType = singleSchemaType?.values().next().value;
	const singleForm = singleType
		? prop.map((e, i) => (
				<div>
					<SingleSchemaForm
						key={`${arrayKeys[i]}`}
						schema={items?.getSingleSchema()}
						path={path ? `${path}[${i}]` : `[${i}]`}
						value={e}
						schemaRepository={schemaRepository}
						onChange={onChange}
					/>
				</div>
		  ))
		: null;

	const tupleSchema = items?.getTupleSchema() || undefined;
	console.log(tupleSchema, 'tupleSchema');
	console.log(singleSchema, 'singleSchema');

	// const tupleForm = tupleSchema
	// 	? tupleSchema?.map((e, i) => {
	// 			console.log(e, 'e');
	// 			return (
	// 				<div>
	// 					<SingleSchemaForm
	// 						key={`${arrayKeys[i]}`}
	// 						path={path}
	// 						value={e}
	// 						schema={items?.getSingleSchema()}
	// 						schemaRepository={schemaRepository}
	// 						onChange={onChange}
	// 					/>
	// 				</div>
	// 			);
	// 	  })
	// 	: undefined;

	// console.log(tupleForm, 'tupleForm');
	// console.log(prop, 'prop');

	const addArrayItem = () => {
		onChange(path ? `${path}[${prop.length}]` : `[${prop.length}]`, undefined);
	};

	const newProp = (
		<div className="_newProp">
			<button onClick={addArrayItem}>Add Element</button>
		</div>
	);

	return (
		<div className=" _singleSchema _arrayEditor">
			{singleForm}
			{/* {tupleForm} */}
			{newProp}
		</div>
	);
}
