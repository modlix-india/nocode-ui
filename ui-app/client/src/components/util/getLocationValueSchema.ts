import { Schema } from '@fincity/kirun-js';

const getLocationValueSchema = (valueSchema: Schema) => {
	const location = Schema.ofObject('Location').setProperties(
		new Map<string, Schema>([
			[
				'location',
				Schema.ofObject('expression').setProperties(
					new Map([
						['value', Schema.ofString('value')],
						['expression', Schema.ofString('expression')],
						[
							'type',
							Schema.ofString('type').setEnums([
								'EXPRESSION',
								'VALUE',
							]),
						],
					]),
				),
			],
			['value', valueSchema],
		]),
	);
};
