import { Repository, Schema, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import SingleSchema from './SingleSchemaForm';

export function ArrayValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
	path,
	label,
}: Readonly<{
	value: any[] | undefined;
	schema: Schema;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	path: string;
	label?: string;
}>) {
	const [resolvedSchema, setResolvedSchema] = useState(schema);

	useEffect(() => {
		if (isNullValue(schema.getRef())) {
			setResolvedSchema(schema);
			return;
		}

		(async () => {
			const resolved = await SchemaUtil.getSchemaFromRef(
				schema,
				schemaRepository,
				schema.getRef(),
			);
			setResolvedSchema(resolved ?? schema);
		})();
	}, [schema, schemaRepository]);

	const itemSchema = resolvedSchema.getItems()?.getSingleSchema();
	const items = Array.isArray(value) ? value : [];

	const addItem = async () => {
		let defaultValue = undefined;
		if (itemSchema) {
			defaultValue = await SchemaUtil.getDefaultValue(itemSchema, schemaRepository);
		}
		const newItems = [...items, defaultValue];
		onChange(path, newItems);
	};

	const removeItem = (index: number) => {
		const newItems = [...items];
		newItems.splice(index, 1);
		onChange(path, newItems.length > 0 ? newItems : undefined);
	};

	const headerLabel = label || 'Items';

	return (
		<div className="_singleSchema">
			<div className="_arraySchema">
				<div className="_arrayHeader">
					<span>{headerLabel} ({items.length})</span>
					<button className="_arrayAddBtn" onClick={addItem} type="button">
						<i className="fa fa-solid fa-plus" /> Add
					</button>
				</div>
				<div className="_arrayItems">
					{items.map((item, index) => (
						<div className="_arrayItem" key={index}>
							<div className="_arrayItemHeader">
								<span className="_arrayItemIndex">{index + 1}</span>
								<i
									className="fa fa-solid fa-trash"
									onClick={() => removeItem(index)}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') removeItem(index);
									}}
									role="button"
									tabIndex={0}
									title="Remove item"
								/>
							</div>
							{itemSchema && (
								<SingleSchema
									schema={itemSchema}
									value={item}
									path={`${path}[${index}]`}
									onChange={onChange}
									schemaRepository={schemaRepository}
								/>
							)}
						</div>
					))}
					{items.length === 0 && (
						<div className="_arrayItem _emptyMessage">
							No items. Click "Add" to add an item.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
