import React from 'react';
import NumberField from '../components/NumberField';

export default function SchemaNumbers({
	schema,
	schemaChange,
}: {
	schema: any;
	schemaChange: (propPath: string, v: any | undefined) => void;
}) {
	return (
		<>
			<NumberField
				label="Multiple Of"
				value={schema.multipleOf}
				propPath="multipleOf"
				onChange={schemaChange}
			/>
			<NumberField
				label="Minimum"
				value={schema.minimum}
				propPath="minimum"
				onChange={schemaChange}
			/>
			<NumberField
				label="Maximum"
				value={schema.maximum}
				propPath="maximum"
				onChange={schemaChange}
			/>
			<NumberField
				label="Exclusive Minimum"
				value={schema.exclusiveMinimum}
				propPath="exclusiveMinimum"
				onChange={schemaChange}
			/>
			<NumberField
				label="Exclusive Maximum"
				value={schema.exclusiveMaximum}
				propPath="exclusiveMaximum"
				onChange={schemaChange}
			/>
		</>
	);
}
