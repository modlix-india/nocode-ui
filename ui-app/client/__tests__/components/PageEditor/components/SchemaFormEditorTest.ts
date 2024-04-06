import { Schema } from '@fincity/kirun-js';
import { gd2 } from '../../../../src/components/PageEditor/components/SchemaFormEditor';

describe('first', () => {
	const s = Schema.from({
		description: 'A product in the catalog',
		type: 'OBJECT',
		properties: {
			productId: {
				description: 'The unique identifier for a product',
				type: 'INTEGER',
			},
			productName: {
				description: 'Name of the product',
				type: 'STRING',
			},
			price: {
				description: 'The price of the product',
				type: 'INTEGER',
				exclusiveMinimum: 0,
			},
			tags: {
				description: 'Tags for the product',
				type: 'ARRAY',
				items: {
					type: 'STRING',
				},
				minItems: 1,
				uniqueItems: true,
			},
			address: {
				type: 'ARRAY',
				items: [
					{
						type: 'INTEGER',
					},
					{
						type: 'STRING',
					},
					{
						type: 'STRING',
						enum: ['Street', 'Avenue', 'Boulevard'],
					},
					{
						type: 'STRING',
						enum: ['NW', 'NE', 'SW', 'SE'],
					},
				],
			},
			dimensions: {
				type: 'OBJECT',
				properties: {
					length: {
						type: 'INTEGER',
					},
					width: {
						type: 'INTEGER',
					},
					height: {
						type: 'INTEGER',
					},
					anotherName: {
						type: 'STRING',
					},
				},
				required: ['length', 'width', 'height'],
			},
		},
		required: ['productId', 'productName', 'price'],
	});

	const defs = gd2('Product', 'Page.testOBJECT', s!);

	console.log(JSON.stringify(defs, null, 4));
});
