import React, { useState } from 'react';
import ArrayField from '../components/ArrayField';
import SingleSchema from '../components/SingleSchema';
import { duplicate } from '@fincity/kirun-js';
import { isNullValue } from '@fincity/kirun-js';

export default function SchemaAdvanced({
	schema,
	schemaChange,
	schemaRepository,
	onChange,
}: {
	schema: any;
	schemaChange: (propPath: string, v: any | undefined) => void;
	schemaRepository: any;
	onChange: (v: any) => void;
}) {
	const [showAdvanced, setShowAdvanced] = useState(
		(schema.oneOf?.length || schema.allOf?.length || schema.anyOf?.length || schema.not) ??
			false,
	);

	const showAdvancedCheckbox = (
		<>
			<label className="_rightJustify">Show Advanced Fields :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showAdvanced}
					onChange={() => setShowAdvanced(!showAdvanced)}
				/>
			</div>
		</>
	);

	if (!showAdvanced) {
		return showAdvancedCheckbox;
	}

	return (
		<>
			{showAdvancedCheckbox}
			<ArrayField
				label="One of"
				value={schema.oneOf}
				propPath="oneOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<ArrayField
				label="All of"
				value={schema.allOf}
				propPath="allOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<ArrayField
				label="Any of"
				value={schema.anyOf}
				propPath="anyOf"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
			<label className="_rightJustify">Not :</label>
			<div className="_leftJustify">
				<SingleSchema
					schema={schema.not}
					onChange={v => {
						const s = duplicate(schema ?? {});
						if (isNullValue(v)) delete s.not;
						else s.not = v;
						onChange(s);
					}}
					schemaRepository={schemaRepository}
					shouldShowNameNamespace={false}
					showRemove={true}
				/>
			</div>
			<ArrayField
				label="examples"
				value={schema.examples}
				propPath="examples"
				onChange={schemaChange}
				type="ANY"
				schemaRepository={schemaRepository}
			/>
		</>
	);
}
