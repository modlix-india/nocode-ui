import { isNullValue, Schema, SchemaValidator } from '@fincity/kirun-js';
import { getTranslations } from '../components/util/getTranslations';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../constants';
import { getData, PageStoreExtractor } from '../context/StoreContext';
import { UISchemaRepository } from '../schemas/common';
import {
	ComponentDefinition,
	ComponentProperty,
	ComponentPropertyDefinition,
	LocationHistory,
	PageDefinition,
} from '../types/common';
import CD from '../components';

// function EVENT_FUNCTION(validation: any, value: any): Array<string> {
// 	return [];
// }

function MANDATORY(validation: any, value: any): Array<string> {
	if (!value) return [validation.message];
	return [];
}

function REGEX(validation: any, value: any): Array<string> {
	if (isNullValue(value) || value === '') return [];

	if (!new RegExp(validation.pattern, validation.ignoreCase ? 'i' : undefined).test(value))
		return [validation.message];
	return [];
}

// function UNIQUE(validation: any, value: any): Array<string> {
// 	return [];
// }

function STRING_LENGTH(validation: any, value: any): Array<string> {
	if (isNullValue(value)) return [];
	if (!isNullValue(validation.minLength) && value.length < parseInt(validation.minLength))
		return [validation.message];
	if (!isNullValue(validation.maxLength) && value.length > parseInt(validation.maxLength))
		return [validation.message];
	return [];
}

function BOOLEAN_CONDITION(validation: any, value: any): Array<string> {
	if (validation.booleanCondition) return [];
	return [validation.message];
}

function SCHEMA_TYPE(validation: any, value: any): Array<string> {
	if (!validation?.schema) return [];
	try {
		const sch = Schema.from(validation.schema);
		SchemaValidator.validate(undefined, sch, UISchemaRepository, value);
		return [];
	} catch (err) {
		console.error('Error while validating a schema.', err);
		return [validation.message];
	}
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
function EMAIL(validation: any, value: any): Array<string> {
	if (isNullValue(value) || value === '') return [];
	if (!value.match(EMAIL_REGEX)) return [validation.message];
	return [];
}

function NUMBER_VALUE(validation: any, value: any): Array<string> {
	if (isNullValue(value)) return [];
	const intValue = parseInt(value);
	if (isNaN(intValue) || '' + intValue !== '' + value) return [validation.message];
	if (!isNullValue(validation.minValue) && intValue < parseInt(validation.minValue))
		return [validation.message];
	if (!isNullValue(validation.maxValue) && intValue > parseInt(validation.maxValue))
		return [validation.message];
	return [];
}
// function DATE_FORMAT(validation: any, value: any): Array<string> {
// 	return [];
// }

function FILE_SIZE(validation: any, value: FileList): Array<string> {
	if (isNullValue(value)) return [];
	const size =
		validation.sizeType !== undefined
			? Array.from(value).reduce((a, c: any) => a + c.size, 0) / validation.sizeType
			: Array.from(value).reduce((a, c: any) => a + c.size, 0);
	if (isNaN(size)) return [validation.message];
	if (!isNullValue(validation.minValue) && size < parseInt(validation.minValue))
		return [validation.message];
	if (!isNullValue(validation.maxValue) && size > parseInt(validation.maxValue))
		return [validation.message];
	return [];
}

export const VALIDATION_FUNCTIONS: {
	[key: string]: {
		functionCode: (validation: any, value: any, def: ComponentDefinition) => Array<string>;
		displayName: string;
		fields?: Array<ComponentPropertyDefinition>;
	};
} = {
	MANDATORY: { functionCode: MANDATORY, displayName: 'Mandatory' },
	REGEX: {
		functionCode: REGEX,
		displayName: 'Regular Expression',
		fields: [
			{
				name: 'pattern',
				displayName: 'Pattern',
				description: 'Regular expression pattern',
				schema: SCHEMA_STRING_COMP_PROP,
			},
			{
				name: 'ignoreCase',
				displayName: 'Ignore Case',
				description: 'Ignore case while matching',
				schema: SCHEMA_BOOL_COMP_PROP,
				defaultValue: false,
			},
		],
	},
	STRING_LENGTH: {
		functionCode: STRING_LENGTH,
		displayName: 'String Length',
		fields: [
			{
				name: 'maxLength',
				displayName: 'Maximum Length',
				description: 'Maximum length of the string',
				schema: SCHEMA_NUM_COMP_PROP,
			},
			{
				name: 'minLength',
				displayName: 'Minimum Length',
				description: 'Minimum length of the string',
				schema: SCHEMA_NUM_COMP_PROP,
			},
		],
	},
	BOOLEAN_CONDITION: {
		functionCode: BOOLEAN_CONDITION,
		displayName: 'Truthy Condition',
		fields: [
			{
				name: 'booleanCondition',
				displayName: 'Boolean Condition',
				description: 'Boolean Condition that has to be true',
				schema: SCHEMA_BOOL_COMP_PROP,
			},
		],
	},
	SCHEMA_TYPE: {
		functionCode: SCHEMA_TYPE,
		displayName: 'Schema',
		fields: [
			{
				name: 'schema',
				displayName: 'Schema',
				description: 'Schema to validate',
				schema: SCHEMA_ANY_COMP_PROP,
			},
		],
	},
	EMAIL: { functionCode: EMAIL, displayName: 'Email' },
	NUMBER_VALUE: {
		functionCode: NUMBER_VALUE,
		displayName: 'Number',
		fields: [
			{
				name: 'maxValue',
				displayName: 'Maximum Value',
				description: 'Maximum Value',
				schema: SCHEMA_NUM_COMP_PROP,
			},
			{
				name: 'minValue',
				displayName: 'Minimum Value',
				description: 'Minimum Value',
				schema: SCHEMA_NUM_COMP_PROP,
			},
		],
	},
	FILE_SIZE: {
		functionCode: FILE_SIZE,
		displayName: 'File Size',
		fields: [
			{
				name: 'maxValue',
				displayName: 'Maximum Size',
				description: 'Maximum File Size',
				schema: SCHEMA_NUM_COMP_PROP,
			},
			{
				name: 'minValue',
				displayName: 'Minimum Size',
				description: 'Minimum File Size',
				schema: SCHEMA_NUM_COMP_PROP,
			},
		],
	},
};

export function validate(
	def: ComponentDefinition,
	pageDefinition: PageDefinition,
	validation: any,
	value: any,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): Array<string> {
	const CUSTOM_VAL_FUNC = CD.get(def.type)?.validations;

	if (!validation?.length) return [];
	return validation
		.map((e: any) => {
			let vals: { [key: string]: any } = {};

			for (let [k, v] of Object.entries(e)) {
				vals[k] =
					typeof v !== 'string'
						? getData(v as ComponentProperty<any>, locationHistory, pageExtractor)
						: v;
			}
			return vals;
		})
		.filter((e: any) => e.condition !== false)
		.flatMap((e: any) => {
			const type = e.type ?? 'MANDATORY';
			if (CUSTOM_VAL_FUNC && CUSTOM_VAL_FUNC[type])
				return CUSTOM_VAL_FUNC[type](e, value, def, locationHistory, pageExtractor);
			else return VALIDATION_FUNCTIONS[type ?? 'MANDATORY']?.functionCode(e, value, def);
		})
		.map((e: string) => getTranslations(e, pageDefinition.translations))
		.filter((e: string) => !!e);
}
