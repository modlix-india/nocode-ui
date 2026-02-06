import { Repository, Schema, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import SingleSchema from './SingleSchemaForm';

export function ObjectValueEditor({
	value,
	schema,
	onChange,
	schemaRepository,
	path,
	label,
}: Readonly<{
	value: Record<string, any> | undefined;
	schema: Schema;
	onChange: (path: string, v: any) => void;
	schemaRepository: Repository<Schema>;
	path: string;
	label?: string;
}>) {
	const [expanded, setExpanded] = useState(true);
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

	const properties = resolvedSchema.getProperties();

	const headerLabel = label || resolvedSchema.getName() || 'Object';

	if (!properties || properties.size === 0) {
		return (
			<div className="_singleSchema">
				<div className="_objectSchema">
					<div className="_objectHeader">
						<span>{headerLabel} (Empty)</span>
					</div>
				</div>
			</div>
		);
	}

	const propertyEntries = Array.from(properties.entries()).sort((a, b) => a[0].localeCompare(b[0]));

	return (
		<div className="_singleSchema">
			<div className="_objectSchema">
				<div
					className="_objectHeader"
					onClick={() => setExpanded(!expanded)}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded);
					}}
					role="button"
					tabIndex={0}
				>
					<i className={`fa fa-solid fa-chevron-${expanded ? 'down' : 'right'}`} />
					<span>{headerLabel}</span>
				</div>
				{expanded && (
					<div className="_objectProperties">
						{propertyEntries.map(([key, propSchema]) => (
							<div className="_objectField" key={key}>
								<SingleSchema
									schema={propSchema}
									value={value?.[key]}
									path={path ? `${path}.${key}` : key}
									showLabel={true}
									label={key}
									onChange={onChange}
									schemaRepository={schemaRepository}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
