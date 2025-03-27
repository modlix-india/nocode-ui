import { Schema, SchemaType } from '@fincity/kirun-js';
import { shortUUID } from '../../../util/shortUUID';

const dropdownPropertyGenerator = (
	schema: Schema,
	types: Set<SchemaType>,
	isMandatory: boolean,
) => {
	const properties: { [key: string]: any } = {};

	const enums = schema.getEnums() ?? [];

	if (types.has(SchemaType.ARRAY) && enums?.length) {
		properties.isMultiSelect = { value: true };
	}

	if (enums.length && types.has(SchemaType.STRING)) {
		properties.data = { value: enums };
	}
	if (
		enums.length &&
		(types.has(SchemaType.INTEGER) ||
			types.has(SchemaType.LONG) ||
			types.has(SchemaType.FLOAT) ||
			types.has(SchemaType.DOUBLE))
	) {
		properties.data = {
			value: Object.fromEntries(
				enums.map((num: number, index: number) => [`num${index + 1}`, num]),
			),
		};

		properties.datatype = { value: 'OBJECT_OF_PRIMITIVES' };
		properties.uniqueKeyType = { value: 'INDEX' };
		properties.selectionType = { value: 'OBJECT' };
		properties.labelKeyType = { value: 'OBJECT' };
	}

	if (isMandatory) {
		properties.validation = generateValidation();
	}

	return properties;
};

export default dropdownPropertyGenerator;

function generateValidation() {
	let validation: { [key: string]: any } = {};
	let order = 0;
	const key = shortUUID();
	validation[key] = {
		key,
		order: order++,
		property: {
			value: {
				type: 'MANDATORY',
				message: { value: `This field is required` },
			},
		},
	};
	return validation;
}
