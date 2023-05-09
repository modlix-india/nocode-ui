import React, { useEffect } from 'react';
import ArrayField from '../components/ArrayField';
import MapField from '../components/MapField';
import NumberField from '../components/NumberField';
import SelectField from '../components/SelectField';
import SingleSchema from '../components/SingleSchema';
import CommonTriStateCheckbox from '../../../commonComponents/CommonTriStateCheckbox';
import { isNullValue } from '@fincity/kirun-js';

export default function SchemaArrays({
	schema,
	schemaRepository,
	schemaChange,
}: {
	schema: any;
	schemaRepository: any;
	schemaChange: (propPath: string, v: any | undefined) => void;
}) {
	const [showAdvancedArrayFields, setShowAdvancedArrayFields] = React.useState<boolean>(
		schema.additionalItems || schema.minItems || schema.maxItems,
	);
	const [showContainsFields, setShowContainsFields] = React.useState<boolean>(!!schema.contains);

	const showAdvancedCheckbox = (
		<>
			<label className="_rightJustify">Show Advanced Array Fields :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showAdvancedArrayFields}
					onChange={() => setShowAdvancedArrayFields(!showAdvancedArrayFields)}
				/>
			</div>
		</>
	);

	const showContainsCheckbox = (
		<>
			<label className="_rightJustify">Show Contains Array Fields :</label>
			<div className="_leftJustify">
				<input
					type="checkbox"
					checked={showContainsFields}
					onChange={() => setShowContainsFields(!showContainsFields)}
				/>
			</div>
		</>
	);

	let advanedComps = <></>;
	if (showAdvancedArrayFields) {
		const addtionalSchema =
			typeof schema.additionalItems === 'boolean' ? (
				<></>
			) : (
				<>
					<div className="_rightJustify">Additional Items (Schema) :</div>
					<div className="_leftJustify">
						<SingleSchema
							schema={schema.additionalItems}
							onChange={v => schemaChange('additionalItems', v)}
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
					label="Min Items"
					value={schema.minItems}
					propPath="minItems"
					onChange={schemaChange}
				/>
				<NumberField
					label="Max Items"
					value={schema.maxItems}
					propPath="maxItems"
					onChange={schemaChange}
				/>
				<>
					<div className="_rightJustify">Unique Items :</div>
					<div className="_leftJustify">
						<CommonTriStateCheckbox
							value={schema.uniqueItems}
							onChange={v => schemaChange('uniqueItems', v)}
							states={3}
						/>
					</div>
				</>
				<SelectField
					label="Additional Items"
					value={schema.additionalItems}
					onChange={(p, v) => {
						if (v === 'true') schemaChange(p, true);
						else if (v === 'false') schemaChange(p, false);
						else schemaChange(p, undefined);
					}}
					propPath="additionalItems"
					options={[
						{ label: 'Schema', value: '' },
						{ label: 'True', value: true },
						{ label: 'False', value: false },
					]}
				/>
				{addtionalSchema}
			</>
		);
	}

	const containsComps = showContainsFields ? (
		<>
			<div className="_rightJustify">Contains Schema :</div>
			<div className="_leftJustify">
				<SingleSchema
					schema={schema.contains}
					onChange={v => {
						schemaChange('contains', v);
					}}
					schemaRepository={schemaRepository}
					shouldShowNameNamespace={false}
					showRemove={true}
				/>
			</div>
			{schema.contains && (
				<NumberField
					label="Min Contains"
					value={schema.minContains}
					propPath="minContains"
					onChange={schemaChange}
				/>
			)}
			{schema.contains && (
				<NumberField
					label="Max Contains"
					value={schema.maxContains}
					propPath="maxContains"
					onChange={schemaChange}
				/>
			)}
		</>
	) : (
		<></>
	);

	const [itemsSchemaType, setItemsSchemaType] = React.useState<string>(
		isNullValue(schema.items) || !Array.isArray(schema.items) ? 'single' : 'array',
	);
	useEffect(() => {
		setItemsSchemaType(
			isNullValue(schema.items) || !Array.isArray(schema.items) ? 'single' : 'tuple',
		);
	}, [schema.items]);

	const itemsComps =
		itemsSchemaType === 'single' ? (
			<>
				<div className="_rightJustify">Items :</div>
				<div className="_leftJustify">
					<SingleSchema
						schema={schema.items}
						onChange={v => schemaChange('items', v)}
						schemaRepository={schemaRepository}
						shouldShowNameNamespace={false}
						showRemove={true}
					/>
				</div>
			</>
		) : (
			<ArrayField
				label="Items"
				value={schema.items}
				onChange={schemaChange}
				propPath="items"
				schemaRepository={schemaRepository}
				type="SCHEMA"
			/>
		);

	return (
		<>
			<SelectField
				label="Items Type"
				value={itemsSchemaType}
				onChange={(p, v) => {
					if (v === 'single') {
						if (schema.items && Array.isArray(schema.items) && schema.items.length)
							schemaChange('items', schema.items[0]);
						else schemaChange('items', undefined);
					} else if (v === 'tuple') {
						if (schema.items && !Array.isArray(schema.items))
							schemaChange('items', [schema.items]);
						else schemaChange('items', []);
					}
				}}
				propPath="itemsType"
				options={[
					{ label: 'Single', value: 'single' },
					{ label: 'Tuple', value: 'tuple' },
				]}
			/>
			{itemsComps}
			{showAdvancedCheckbox}
			{advanedComps}
			{showContainsCheckbox}
			{containsComps}
		</>
	);
}
