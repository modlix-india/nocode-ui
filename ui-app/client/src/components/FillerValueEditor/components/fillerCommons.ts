export enum EditorValueType {
	STRING = 'STRING',
	NUMBER = 'NUMBER',
	BOOLEAN = 'BOOLEAN',
	OBJECT = 'OBJECT',
	DATE = 'DATE',
	ENUM = 'ENUM',
	IMAGE = 'IMAGE',
}

export enum EditorType {
	TEXT_BOX = 'TEXT_BOX',
	TEXT_AREA = 'TEXT_AREA',
	NUMBER = 'NUMBER',
	BOOLEAN = 'BOOLEAN',
	DATE = 'DATE',
	ENUM = 'ENUM',
	COLOR_PICKER = 'COLOR_PICKER',
	IMAGE = 'IMAGE',
	ARRAY_OF_IMAGES = 'ARRAY_OF_IMAGES',
	ARRAY_OF_OBJECTS = 'ARRAY_OF_OBJECTS',
	PALLETTE = 'PALLETTE',
}

export interface EditorDefinition {
	key: string;
	valueKey: string;
	valueType: EditorValueType;
	name: string;
	hideLabel?: boolean;
	description?: string;
	type: EditorType;
}

export enum SectionLayout {
	VERTICAL = 'VERTICAL',
	HORIZONTAL = 'HORIZONTAL',
}

export interface SectionDefinition {
	key: string;
	name: string;
	valueKey: string;
	order: number;
	pagePath: string;
	gridKey?: string;
	layout?: SectionLayout;
	editors?: EditorDefinition[];
	showSectionToggle?: boolean;
	toggleKey?: string;
}

export interface Filler {
	appCode?: string;
	clientCode?: string;
	values?: { [key: string]: any };
	definition?: {
		[key: string]: SectionDefinition;
	};
}
