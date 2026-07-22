import { StringFormat } from '@fincity/kirun-js';
import React from 'react';
import NumberField from '../../components/NumberField';
import SelectField from '../../components/SelectField';
import StringField from '../../components/StringField';
import { relChange, TreeContext } from '../types';

export default function StringSection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	return (
		<>
			<NumberField
				label="Minimum Length"
				value={schema?.minLength}
				propPath="minLength"
				onChange={fieldChange}
			/>
			<NumberField
				label="Maximum Length"
				value={schema?.maxLength}
				propPath="maxLength"
				onChange={fieldChange}
			/>
			<SelectField
				label="Format"
				value={schema?.format}
				propPath="format"
				onChange={fieldChange}
				options={[
					{ label: 'None', value: '' },
					...Object.values(StringFormat).map(e => ({ label: e, value: e })),
				]}
			/>
			<StringField
				label="Pattern"
				value={schema?.pattern}
				helpText="A regular expression the value must match"
				propPath="pattern"
				onChange={fieldChange}
				validationLogic={v => {
					try {
						if (!v) return '';
						new RegExp(v);
					} catch (e: any) {
						return e.message;
					}
					return '';
				}}
			/>
		</>
	);
}
