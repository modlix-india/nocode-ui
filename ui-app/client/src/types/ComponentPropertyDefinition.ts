import { Schema } from '@fincity/kirun-js';

export enum ComponentPropertyEditor {
	DATA_LOCATION,
	TRANSLATABLE_PROP,
	ICON,
	VALIDATION,
	ENUM,
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
	pname: string;
	pdisplayName?: string;
	pdescription: string;
	pschema: Schema;
	peditor?: ComponentPropertyEditor;
	ptranslatable: boolean;
	pgroup: ComponentPropertyGroup;
	pmultivalued: boolean;
	penumValues?: Array<ComponentENUM>;
}
