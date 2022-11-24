export interface DataLocation {
	type: 'EXPRESSION' | 'VALUE';
	value?: string;
	expression?: string;
}

export interface ComponentProperty<T> {
	value?: T;
	location?: DataLocation;
	overrideValue?: T;
}

export interface Translations {
	[key: string]: {
		[key: string]: string;
	};
}

export interface RenderContext {
	pageName: string;
	isReadonly?: boolean;
	formKey?: Array<string>;
}

export enum ValidationType {
	EVENT_FUNCTION,
	MANDATORY,
	REGEX,
	JSON,
	UNIQUE,
	STRING_MAX_LENGTH,
	STRING_MIN_LENGTH,
	BOOLEAN_EXPRESSION,
	SCHEMA_TYPE,
	EMAIL,
	NUMBER_MIN_VALUE,
	NUMBER_MAX_VALUE,
	FORMAT,
}

export interface Validation {
	type: ValidationType;
	condition: DataLocation;
	message: ComponentProperty<string>;
}
