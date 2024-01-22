import { PageStoreExtractor } from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';

export interface SectionGridPropertyEditorProps {
	selectedComponent: string;
	selectedComponentsList: string[];
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	storePaths: Set<string>;
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
	appPath: string | undefined;
	editorType: string | undefined;
}

export enum SectionPropertyValueType {
	STRING = 'STRING',
	NUMBER = 'NUMBER',
	BOOLEAN = 'BOOLEAN',
	COLOR = 'COLOR',
	FONT = 'FONT',
	IMAGE = 'IMAGE',
	ICON = 'ICON',
	ARRAY = 'ARRAY',
	OBJECT = 'OBJECT',
	LINK = 'LINK',
}

export interface SectionComponentProperty {
	componentKey: string;
	isStyleProperty?: boolean;
	propertyName: string;
}

export interface SectionProperty {
	key: string;
	name?: string; // Only to be used in object
	label: string;
	hideLabel?: boolean;
	valueType: SectionPropertyValueType;
	value: any;
	objectProperties?: SectionProperty[];
	arrayItemProperty?: SectionProperty;
	componentProperties?: SectionComponentProperty[];
	order: number;
}

export interface ValueEditorProps {
	property: SectionProperty;
	onChange: (prop: SectionProperty) => void;
}
