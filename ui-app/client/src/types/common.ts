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

export enum ComponentPropertyDataPathType {
	ARRAY_OF_PRIMITIVES,
	ARRAY_OF_OBJECTS,
	ARRAY_OF_ARRAYS,
	OBJECT_OF_PRMITIVES,
	OBJECT_OF_OBJECTS,
	OBJECT_OF_ARRAYS,
}
