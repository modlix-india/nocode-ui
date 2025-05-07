import { Schema, SchemaType } from '@fincity/kirun-js';
import { ComponentProperty } from '../../../types/common';

const ArrayRepeatorGenerator = (
	schema: Schema,
	types: Set<SchemaType>,
	isMandatory: boolean,
	arrbindingPathPath?: string,
	minItems?: number,
	bindingPathPath?: string,
) => {
	const properties: { [key: string]: any } = {};
	const maxItems = schema.getMaxItems();
	const actualMinItems = schema.getMinItems();
	console.log('maxItems', arrbindingPathPath);
	const showAdd: ComponentProperty<any> = maxItems
		? {
				value: true,
				location: {
					type: 'EXPRESSION',
					expression: `{{${arrbindingPathPath}.length ?? 0}} < ${maxItems} ? true : false`,
				},
			}
		: { value: true };

	properties.showAdd = showAdd;
	const showDelete: ComponentProperty<any> = actualMinItems
		? {
				value: true,
				location: {
					type: 'EXPRESSION',
					expression: `{{${arrbindingPathPath}.length ?? 0}} > ${actualMinItems} ? true : false`,
				},
			}
		: { value: true };

	properties.showDelete = showDelete;
	properties.dataType = { value: 'array' };

	return properties;
};

export default ArrayRepeatorGenerator;
