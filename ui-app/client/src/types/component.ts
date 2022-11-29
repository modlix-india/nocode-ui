import { Schema } from '@fincity/kirun-js';
import React from 'react';

export enum ComponentPropertyEditor {
	DATA_LOCATION,
	TRANSLATABLE_PROP,
	ICON,
	VALIDATION,
	ENUM,
	PAGE_SELECTOR,
	STYLE_SELECTOR,
	THEME_SELECTOR,
	COMPONENT_SELECTOR,
}

export enum ComponentPropertyGroup {
	DEFAULT,
	COMMON,
	VALIDATION,
}

export interface ComponentENUM {
	name: string;
	displayName: string;
	description: string;
}

export interface ComponentPropertyDefinition {
	name: string;
	displayName: string;
	description: string;
	schema: Schema;
	editor?: ComponentPropertyEditor;
	translatable?: boolean;
	group?: ComponentPropertyGroup;
	multiValued?: boolean;
	enumValues?: Array<ComponentENUM>;
	notImplemented?: boolean;
	defaultValue?: any;
}

export interface Component {
	name: string;
	displayName: string;
	description: string;
	component: React.ElementType;
	styleComponent?: React.ElementType;
	propertyValidation: (props: any) => Array<string>;
	properties: Array<ComponentPropertyDefinition>;
}
