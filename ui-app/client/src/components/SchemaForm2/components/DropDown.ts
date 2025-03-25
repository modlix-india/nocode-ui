import { Schema, SchemaType } from '@fincity/kirun-js';

const DropdownPropertyGenerator = (schema: Schema, types: Set<SchemaType>) => {
	const properties: { [key: string]: any } = {};

	if (types.has(SchemaType.ARRAY)) {
		properties.isMultiSelect = { value: true };
	}

	if (schema.getEnums()?.length && types.has(SchemaType.STRING)) {
		properties.data = { value: schema.getEnums() };
	}
	if (
		schema.getEnums()?.length &&
		(types.has(SchemaType.INTEGER) ||
			types.has(SchemaType.LONG) ||
			types.has(SchemaType.FLOAT) ||
			types.has(SchemaType.DOUBLE))
	) {
		const enums = schema.getEnums() ?? [];
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

	return properties;
};

export default DropdownPropertyGenerator;
