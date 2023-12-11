export enum EditorType {
	TEXT_BOX = 'TEXT_BOX',
	TEXT_AREA = 'TEXT_AREA',
	BOOLEAN = 'BOOLEAN',
	ENUM = 'ENUM',
	IMAGE = 'IMAGE',
	ARRAY_OF_IMAGES = 'ARRAY_OF_IMAGES',
	ARRAY_OF_OBJECTS = 'ARRAY_OF_OBJECTS',
	PALLETTE = 'PALLETTE',
	LABEL = 'LABEL',
	FONT_PICKER = 'FONT_PICKER',
}

export interface EditorDefinition {
	key: string;
	valueKey: string;
	name: string;
	hideLabel?: boolean;
	description?: string;
	type: EditorType;
	maxLength?: number;
	regex?: string;
	enumOptions?: { displayName: string; name: string }[];
	enumHideNone?: boolean;
	numColors?: number;
	fontNames?: string[];
	sampleObjects?: any[];
	objectEditors?: EditorDefinition[];
	arrayPreviewList?: string[];
	arrayPreviewType?: 'LIST' | 'GRID';
}

export enum SectionLayout {
	VERTICAL = 'VERTICAL',
	HORIZONTAL = 'HORIZONTAL',
	TWO_PER_ROW = 'TWO_PER_ROW',
	THREE_PER_ROW = 'THREE_PER_ROW',
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

export interface PopupType {
	type: 'IMAGE' | 'OBJECT';
	path: string;
	isUIFiller?: boolean;
	editorDefinition?: EditorDefinition;
}
