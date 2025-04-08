import { Schema, SchemaType } from '@fincity/kirun-js';
import { shortUUID } from '../../../util/shortUUID';

const checkBoxPropertiesGenerator = (
	schema: Schema,
	types: Set<SchemaType>,
	isMandatory: boolean,
) => {
	const properties: { [key: string]: any } = {};

	if (isMandatory) {
		properties.validation = generateValidation();
	}

	return properties;
};

export default checkBoxPropertiesGenerator;

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
