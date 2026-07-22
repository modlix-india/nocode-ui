import React from 'react';
import NumberField from '../../components/NumberField';
import { relChange, TreeContext } from '../types';

export default function NumberSection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	return (
		<>
			<NumberField
				label="Multiple Of"
				value={schema?.multipleOf}
				propPath="multipleOf"
				onChange={fieldChange}
			/>
			<NumberField
				label="Minimum"
				value={schema?.minimum}
				propPath="minimum"
				onChange={fieldChange}
			/>
			<NumberField
				label="Maximum"
				value={schema?.maximum}
				propPath="maximum"
				onChange={fieldChange}
			/>
			<NumberField
				label="Exclusive Minimum"
				value={schema?.exclusiveMinimum}
				propPath="exclusiveMinimum"
				onChange={fieldChange}
			/>
			<NumberField
				label="Exclusive Maximum"
				value={schema?.exclusiveMaximum}
				propPath="exclusiveMaximum"
				onChange={fieldChange}
			/>
		</>
	);
}
