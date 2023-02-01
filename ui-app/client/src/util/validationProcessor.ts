import { isNullValue, Schema, SchemaValidator } from '@fincity/kirun-js';
import { getTranslations } from '../components/util/getTranslations';
import { UISchemaRepository } from '../schemas/common';
import { ComponentDefinition, PageDefinition } from '../types/common';

function EVENT_FUNCTION(validation: any, value: any): Array<string> {
	return [];
}

function MANDATORY(validation: any, value: any): Array<string> {
	if (!value) return [validation.message];
	return [];
}

function REGEX(validation: any, value: any): Array<string> {
	if (isNullValue(value) || value === '') return [];
	if (!value.match(new RegExp(validation.pattern, validation.ignoreCase ? 'i' : undefined)))
		return [validation.message];
	return [];
}

function UNIQUE(validation: any, value: any): Array<string> {
	return [];
}

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
function DATE_FORMAT(validation: any, value: any): Array<string> {
	return [];
}

const validationFunctions: { [key: string]: (validation: any, value: any) => Array<string> } = {
	EVENT_FUNCTION,
	MANDATORY,
	REGEX,
	UNIQUE,
	STRING_LENGTH,
	BOOLEAN_CONDITION,
	SCHEMA_TYPE,
	EMAIL,
	NUMBER_VALUE,
	DATE_FORMAT,
};

export function validate(
	def: ComponentDefinition,
	pageDefinition: PageDefinition,
	validation: any,
	value: any,
): Array<string> {
	if (!validation?.length) return [];

	return validation
		.filter((e: any) => e.condition !== false)
		.flatMap((e: any) => validationFunctions[e.type](e, value))
		.map((e: string) => getTranslations(e, pageDefinition.translations))
		.filter((e: string) => !!e);
}
