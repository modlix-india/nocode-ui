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
	const [valueProp, setValueProp] = useState<any>('');
	const [Prop, setProp] = useState<any>(value);
	const items: ArraySchemaType | undefined = schema.getItems();
	console.log(items, 'items');

	const singleSchema = items?.getSingleSchema()?.getType();
	const singleSchemaType = singleSchema?.getAllowedSchemaTypes();

	const singleType = singleSchemaType?.values().next().value;

	console.log(Prop);

	const singleForm = singleType ? (
		<div>
			<SingleSchemaForm
				key={'singleSchema_'}
				schema={schema?.getItems()?.getSingleSchema()}
				path={path}
				value={Prop}
				schemaRepository={schemaRepository}
				onChange={onChange}
			/>
		</div>
	) : (
		''
	);

	const tupleSchema = items?.getTupleSchema();
	console.log(tupleSchema, 'tupleSchema');
	//console.log(e.getType()?.getAllowedSchemaTypes().values().next().value);

	// const tupleForm = tupleSchema
	// 	? tupleSchema?.map(e => {
	// 		e.getType()?.getAllowedSchemaTypes().values().next().value
	// 			<SingleSchemaForm
	// 				key={`${e}`}
	// 				schema={schema.getAdditionalProperties()?.getSchemaValue()}
	// 				path={path}
	// 				value={valueProp}
	// 				schemaRepository={schemaRepository}
	// 				onChange={onChange}
	// 			/>;
	// 	  })
	// 	: '';

	const newProp = (
		<div className="_newProp">
			<input value={valueProp} />
			<button>Add Element</button>
		</div>
	);
	return (
		<div className=" _singleSchema _arrayEditor">
			{singleForm}
			{newProp}
		</div>
	);
}
