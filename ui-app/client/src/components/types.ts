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
	isReadonly: boolean;
	formKey: Array<string>;
}
