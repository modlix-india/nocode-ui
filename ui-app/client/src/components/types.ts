export interface DataLocation {
	type: 'EXPRESSION' | 'VALUE';
	value?: string;
	expression?: string;
}

export interface ComponentProperty<T> {
	value?: T;
	location?: DataLocation;
}

export interface Translations {
	[key: string]: {
		[key: string]: string;
	};
}
