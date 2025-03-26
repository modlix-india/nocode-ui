import { Schema, SchemaType } from '@fincity/kirun-js';
import { shortUUID } from '../../../util/shortUUID';

const NUMBER_TYPES = new Set([
	SchemaType.INTEGER,
	SchemaType.LONG,
	SchemaType.FLOAT,
	SchemaType.DOUBLE,
]);

const generateValidation = (schema: Schema): Record<string, any> => {
	const validation: Record<string, any> = {};
	let order = 1;

	if (schema.getMinLength() !== undefined || schema.getMaxLength() !== undefined) {
		const key = shortUUID();
		validation[key] = {
			key,
			order: order++,
			property: {
				value: {
					type: 'STRING_LENGTH',
					minLength:
						schema.getMinLength() !== undefined
							? { value: schema.getMinLength() }
							: undefined,
					maxLength:
						schema.getMaxLength() !== undefined
							? { value: schema.getMaxLength() }
							: undefined,
					message: { value: 'Invalid length' },
				},
			},
		};
	}

	if (schema.getMinimum() !== undefined || schema.getMaximum() !== undefined) {
		const key = shortUUID();
		validation[key] = {
			key,
			order: order++,
			property: {
				value: {
					type: 'NUMBER_VALUE',
					minValue:
						schema.getMinimum() !== undefined
							? { value: schema.getMinimum() }
							: undefined,
					maxValue:
						schema.getMaximum() !== undefined
							? { value: schema.getMaximum() }
							: undefined,
					message: { value: 'Invalid number range' },
				},
			},
		};
	}

	if (schema.getFormat() === 'EMAIL') {
		const key = shortUUID();
		validation[key] = {
			key,
			order: order++,
			property: {
				value: {
					type: 'EMAIL',
					message: { value: 'Invalid email format' },
				},
			},
		};
	}

	if (schema.getFormat() === 'REGEX' && schema.getPattern()) {
		const key = shortUUID();
		validation[key] = {
			key,
			order: order++,
			property: {
				value: {
					type: 'REGEX',
					pattern: { value: schema.getPattern() },
					message: { value: 'Invalid pattern' },
				},
			},
		};
	}

	return validation;
};

const textBoxPropertyGenerator = (schema: Schema, types: Set<SchemaType>) => {
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

	properties.validation = generateValidation(schema);

	return properties;
};

export default textBoxPropertyGenerator;
