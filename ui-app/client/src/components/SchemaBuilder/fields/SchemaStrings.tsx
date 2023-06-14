import React from 'react';
import { StringFormat } from '@fincity/kirun-js';
import NumberField from '../components/NumberField';
import SelectField from '../components/SelectField';
import StringField from '../components/StringField';

export default function SchemaStrings({
	schema,
	schemaChange,
}: {
	schema: any;
	schemaChange: (propPath: string, v: any | undefined) => void;
}) {
	return (
		<>
			<NumberField
				label="Minimum Length"
				value={schema.minLength}
				propPath="minLength"
				onChange={schemaChange}
			/>
			<NumberField
				label="Maximum Length"
				value={schema.maxLength}
				propPath="maxLength"
				onChange={schemaChange}
			/>
			<SelectField
				label="Format"
				value={schema.format}
				propPath="format"
				onChange={schemaChange}
				options={[
					{ label: 'None', value: '' },
					...Object.values(StringFormat).map(e => ({ label: e, value: e })),
				]}
			/>
			<StringField
				label="Pattern"
				value={schema.pattern}
				propPath="pattern"
				onChange={schemaChange}
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
