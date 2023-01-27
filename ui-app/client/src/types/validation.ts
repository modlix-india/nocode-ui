import { Schema } from '@fincity/kirun-js';
import { ComponentProperty } from './common';

export enum ValidationType {
	// EVENT_FUNCTION,
	MANDATORY,
	REGEX,
	// UNIQUE,
	STRING_LENGTH,
	BOOLEAN_CONDITION,
	SCHEMA_TYPE,
	EMAIL,
	NUMBER_VALUE,
	// DATE_FORMAT,
}

export interface Validation {
	type: ValidationType;
	condition: ComponentProperty<boolean>;
	message: ComponentProperty<string>;
}

export interface EventFunctionValidation extends Validation {
	functionName: ComponentProperty<string>;
}

export interface MandatoryValidation extends Validation {}

export interface EmailValidation extends Validation {}

export interface RegexValidation extends Validation {
	pattern: ComponentProperty<string>;
	ignoreCase: ComponentProperty<boolean>;
	global: ComponentProperty<boolean>;
}

export interface UniqueValidation extends Validation {
	keyPath: string;
}

export interface StringValidation extends Validation {
	minLength: ComponentProperty<number>;
	maxLength: ComponentProperty<number>;
}

export interface NumberValidation extends Validation {
	minValue: ComponentProperty<number>;
	maxValue: ComponentProperty<number>;
}

export interface BooleanConditionValidation extends Validation {
	booleanCondition: ComponentProperty<boolean>;
}

export interface SchemaTypeValidation extends Validation {
	schema: ComponentProperty<Schema>;
}

export interface DateFormatValidation extends Validation {
	formatString: ComponentProperty<string>;
}
