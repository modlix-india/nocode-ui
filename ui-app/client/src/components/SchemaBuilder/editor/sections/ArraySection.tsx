import { isNullValue } from '@fincity/kirun-js';
import React from 'react';
import CommonTriStateCheckbox from '../../../../commonComponents/CommonTriStateCheckbox';
import NumberField from '../../components/NumberField';
import SelectField from '../../components/SelectField';
import { relChange, TreeContext } from '../types';
import Row from './Row';

export default function ArraySection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	const itemsSchemaType =
		isNullValue(schema?.items) || !Array.isArray(schema?.items) ? 'single' : 'tuple';

	const additionalIsBoolean = typeof schema?.additionalItems === 'boolean';
	const additionalSchema =
		itemsSchemaType === 'tuple' && !additionalIsBoolean ? (
			<Row label="Additional Items Schema" hint="Schema for items beyond the tuple">
				{ctx.renderTree({
					schema: schema?.additionalItems,
					path: path ? `${path}.additionalItems` : 'additionalItems',
					depth: 0,
					kind: 'sub',
					label: 'additionalItems',
					onDelete:
						schema?.additionalItems !== undefined
							? () => fieldChange('additionalItems', undefined)
							: undefined,
				})}
			</Row>
		) : undefined;

	return (
		<>
			<SelectField
				label="Items Type"
				value={itemsSchemaType}
				helpText="Single: every item matches one schema. Tuple: each position has its own schema"
				undefinedOnEmpty={false}
				onChange={(p, v) => {
					if (v === 'single') {
						if (Array.isArray(schema?.items) && schema.items.length)
							fieldChange('items', schema.items[0]);
						else if (Array.isArray(schema?.items)) fieldChange('items', undefined);
					} else if (v === 'tuple') {
						if (schema?.items && !Array.isArray(schema.items))
							fieldChange('items', [schema.items]);
						else if (isNullValue(schema?.items)) fieldChange('items', []);
					}
				}}
				propPath="itemsType"
				options={[
					{ label: 'Single', value: 'single' },
					{ label: 'Tuple', value: 'tuple' },
				]}
			/>
			<NumberField
				label="Min Items"
				value={schema?.minItems}
				propPath="minItems"
				onChange={fieldChange}
			/>
			<NumberField
				label="Max Items"
				value={schema?.maxItems}
				propPath="maxItems"
				onChange={fieldChange}
			/>
			<Row label="Unique Items" hint="Whether all items must be distinct">
				<CommonTriStateCheckbox
					value={schema?.uniqueItems}
					onChange={v => (ctx.readOnly ? undefined : fieldChange('uniqueItems', v))}
					states={3}
				/>
			</Row>
			{itemsSchemaType === 'tuple' && (
				<SelectField
					label="Additional Items"
					value={additionalIsBoolean ? '' + schema.additionalItems : ''}
					helpText="Whether items beyond the tuple are allowed, or a schema they must match"
					onChange={(p, v) => {
						if (v === 'true') fieldChange(p, true);
						else if (v === 'false') fieldChange(p, false);
						else fieldChange(p, undefined);
					}}
					propPath="additionalItems"
					options={[
						{ label: 'Schema', value: '' },
						{ label: 'True', value: true },
						{ label: 'False', value: false },
					]}
				/>
			)}
			{additionalSchema}
			<Row label="Contains" hint="At least one item must match this schema">
				{ctx.renderTree({
					schema: schema?.contains,
					path: path ? `${path}.contains` : 'contains',
					depth: 0,
					kind: 'sub',
					label: 'contains',
					onDelete:
						schema?.contains !== undefined
							? () => fieldChange('contains', undefined)
							: undefined,
				})}
			</Row>
			{!isNullValue(schema?.contains) && (
				<>
					<NumberField
						label="Min Contains"
						value={schema?.minContains}
						propPath="minContains"
						onChange={fieldChange}
					/>
					<NumberField
						label="Max Contains"
						value={schema?.maxContains}
						propPath="maxContains"
						onChange={fieldChange}
					/>
				</>
			)}
		</>
	);
}
