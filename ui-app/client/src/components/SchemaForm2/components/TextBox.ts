import { Schema, SchemaType } from '@fincity/kirun-js';
import { setData } from '../../../context/StoreContext';
import { useEffect } from 'react';

const NUMBER_TYPES = new Set([
	SchemaType.INTEGER,
	SchemaType.LONG,
	SchemaType.FLOAT,
	SchemaType.DOUBLE,
]);

const TextBoxPropertyGenerator = (schema: Schema, types: Set<SchemaType>) => {
	const hasString = types.has(SchemaType.STRING);
	const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));

	const properties: { [key: string]: any } = {};

	if (!hasString || !hasNumber) {
		properties.valueType = { value: hasString ? 'text' : 'number' };

		if (hasNumber) {
			properties.numberType = {
				value:
					types.has(SchemaType.FLOAT) || types.has(SchemaType.DOUBLE)
						? 'DECIMAL'
						: 'INTEGER',
			};
		}
	}

	properties.maxChars = {
		value: schema.getMaximum() ?? schema.getMaxLength() ?? undefined,
	};
	properties.minChars = {
		value: schema.getMinimum() ?? schema.getMinLength() ?? undefined,
	};

	return properties;
};

export default TextBoxPropertyGenerator;
