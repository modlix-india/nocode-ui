import React from 'react';
import NumberField from '../../components/NumberField';
import { relChange, TreeContext } from '../types';

const FIELDS: Array<[string, string]> = [
	['multipleOf', 'Multiple Of'],
	['minimum', 'Minimum'],
	['maximum', 'Maximum'],
	['exclusiveMinimum', 'Exclusive Minimum'],
	['exclusiveMaximum', 'Exclusive Maximum'],
];

export default function NumberSection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	return (
		<>
			{FIELDS.map(([key, label]) => (
				<NumberField
					key={key}
					label={label}
					value={schema?.[key]}
					propPath={key}
					onChange={fieldChange}
					readOnly={ctx.readOnly}
				/>
			))}
		</>
	);
}
