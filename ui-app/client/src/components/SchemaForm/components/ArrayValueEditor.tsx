import { Repository, Schema, SchemaValidator, duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import SingleSchemaForm from './SingleSchemaForm';

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
	const types = schema.getItems();
	console.log(types, 'types');

	// console.log(value, 'value from array'); // value of that property
	// console.log(path, 'path from array'); // property name in object
	// console.log(schema.getItems(), 'getItems');
	const [valueProp, setValueProp] = useState<any>('');
	const [Prop, setProp] = useState<any>(value);

	Prop?.map((e: any) => {
		if (isNullValue(Prop)) return;
		// console.log(e, 'each');
		// console.log(schema);
		// console.log(schema.getProperties());
		<div>
			<SingleSchemaForm
				key={e}
				schema={
					schema.getProperties()?.get(e) ??
					schema.getAdditionalProperties()?.getSchemaValue()
				}
				path={path ? `${path}.${e}` : e}
				value={e}
				schemaRepository={schemaRepository}
				onChange={onChange}
			/>
		</div>;
	});

	const newProp = (
		<div className="_newProp">
			<input value={valueProp} />
			<button>Add Element</button>
		</div>
	);
	return <div className=" _singleSchema _arrayEditor">{newProp}</div>;
}
