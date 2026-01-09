import React from 'react';
import ArrayField from '../components/ArrayField';
import MapField from '../components/MapField';
import NumberField from '../components/NumberField';
import SelectField from '../components/SelectField';
import SingleSchema from '../components/SingleSchema';

export default function SchemaObjects({
	schema,
	schemaRepository,
	schemaChange,
}: {
	schema: any;
	schemaRepository: any;
	schemaChange: (propPath: string, v: any | undefined) => void;
}) {
	const [showAdvancedObjectFields, setShowAdvancedObjectFields] = React.useState<boolean>(false);
	const showAdvancedCheckbox = (
		<>
			<label className="_rightJustify">Show Advanced Object Fields :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showAdvancedObjectFields}
					onChange={() => setShowAdvancedObjectFields(!showAdvancedObjectFields)}
				/>
			</div>
		</>
	);

	let advanedComps = <></>;
	if (showAdvancedObjectFields) {
		const addtionalSchema =
			typeof schema.additionalProperties === 'boolean' ? (
				<></>
			) : (
				<>
					<div className="_rightJustify">Additional Properties (Schema) :</div>
					<div className="_leftJustify">
						<SingleSchema
							schema={schema.additionalProperties}
							onChange={v => schemaChange('additionalProperties', v)}
							schemaRepository={schemaRepository}
							shouldShowNameNamespace={false}
							showRemove={true}
						/>
					</div>
				</>
			);
		advanedComps = (
			<>
				<NumberField
					label="Min Properties"
					value={schema.minProperties}
					propPath="minProperties"
					onChange={schemaChange}
				/>
				<NumberField
					label="Max Properties"
					value={schema.maxProperties}
					propPath="maxProperties"
					onChange={schemaChange}
				/>
				<MapField
					label="Pattern Properties"
					value={schema.patternProperties}
					propPath="patternProperties"
					onChange={schemaChange}
					schemaRepository={schemaRepository}
					type="SCHEMA"
				/>
				<SelectField
					label="Additional Properties"
					value={schema.additionalProperties}
					onChange={(p, v) => {
						if (v === 'true') schemaChange(p, true);
						else if (v === 'false') schemaChange(p, false);
						else schemaChange(p, undefined);
					}}
					propPath="additionalProperties"
					options={[
						{ label: 'Schema', value: '' },
						{ label: 'True', value: true },
						{ label: 'False', value: false },
					]}
				/>
				{addtionalSchema}
				<>
					<div className="_rightJustify">Property Names :</div>
					<div className="_leftJustify">
						<SingleSchema
							schema={schema.propertyNames}
							onChange={v => schemaChange('propertyNames', v)}
							schemaRepository={schemaRepository}
							shouldShowNameNamespace={false}
							showRemove={true}
							type="STRING"
						/>
					</div>
				</>
			</>
		);
	}

	return (
		<>
			<MapField
				label="Properties"
				value={schema.properties}
				propPath="properties"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>

			<ArrayField
				label="Required"
				value={schema.required}
				propPath="required"
				onChange={schemaChange}
				schemaRepository={schemaRepository}
				type="STRING"
			/>
			{showAdvancedCheckbox}
			{advanedComps}
		</>
	);
}
