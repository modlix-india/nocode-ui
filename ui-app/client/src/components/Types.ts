export interface Location {
	type: 'EXPRESSION' | 'VALUE';
	value?: string;
	expression?: string;
}

export interface ComponentProperty<T> {
	value?: T;
	location?: Location;
}

export interface Translations {
	[key: string]: {
		[key: string]: string;
	};
}
