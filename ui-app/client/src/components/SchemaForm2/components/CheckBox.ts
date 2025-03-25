import { Schema, SchemaType } from '@fincity/kirun-js';

const CheckBoxPropertyGenerator = (schema: Schema, types: Set<SchemaType>) => ({
	valueType: { value: types.has(SchemaType.BOOLEAN) ? 'boolean' : undefined },
});

export default CheckBoxPropertyGenerator;
