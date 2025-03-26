import { Schema, SchemaType } from '@fincity/kirun-js';

const checkBoxPropertyGenerator = (schema: Schema, types: Set<SchemaType>) => ({
	valueType: { value: types.has(SchemaType.BOOLEAN) ? 'boolean' : undefined },
});

export default checkBoxPropertyGenerator;