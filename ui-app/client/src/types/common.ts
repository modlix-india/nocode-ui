import { Schema } from '@fincity/kirun-js';
import { Validation } from './validation';

export interface ComponentProperty<T> {
	value?: T;
	location?: DataLocation;
	overrideValue?: T;
}

export interface DataLocation {
	type: 'EXPRESSION' | 'VALUE';
	value?: string;
	expression?: string;
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
	showValidationMessages?: boolean;
	observer?: IntersectionObserver;
	table?: any;
}

export enum ComponentPropertyDataPathType {
	ARRAY_OF_PRIMITIVES,
	ARRAY_OF_OBJECTS,
	ARRAY_OF_ARRAYS,
	OBJECT_OF_PRMITIVES,
	OBJECT_OF_OBJECTS,
	OBJECT_OF_ARRAYS,
}

export enum ComponentPropertyEditor {
	DATA_LOCATION,
	TRANSLATABLE_PROP,
	ICON,
	ICON_PACK,
	VALIDATION,
	ENUM,
	PAGE_SELECTOR,
	COMPONENT_SELECTOR,
	EVENT_SELECTOR,
	LAYOUT,
	BACKGROUND,
	STYLE_SELECTOR,
	THEME_SELECTOR,
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
	displayOrder?: number;
}

export interface ComponentStylePropertyGroupDefinition {
	name: string;
	type: string;
	displayName: string;
	description: string;
	target: Array<string>;
	prefix?: string;
	displayOrder?: number;
}

export interface ComponentStylePropertyDefinition {
	[key: string]: { [key: string]: ComponentStylePropertyGroupDefinition };
}

export interface Component {
	name: string;
	icon: string;
	displayName: string;
	description: string;
	component: React.ElementType;
	styleComponent?: React.ElementType;
	propertyValidation: (props: any) => Array<string>;
	properties: Array<ComponentPropertyDefinition>;
	styleProperties?: ComponentStylePropertyDefinition;
	stylePseudoStates?: Array<string>;
	allowedChildrenType?: Map<string, number>;
	parentType?: string;
	isHidden?: boolean;
	bindingPaths?: {
		bindingPath?: { name: string };
		bindingPath2?: { name: string };
		bindingPath3?: { name: string };
		bindingPath4?: { name: string };
		bindingPath5?: { name: string };
		bindingPath6?: { name: string };
	};
}

export enum StyleResolution {
	ALL = 'ALL',
	WIDE_SCREEN = 'WIDE_SCREEN',
	DESKTOP_SCREEN = 'DESKTOP_SCREEN',
	TABLET_LANDSCAPE_SCREEN = 'TABLET_LANDSCAPE_SCREEN',
	TABLET_POTRAIT_SCREEN = 'TABLET_POTRAIT_SCREEN',
	MOBILE_LANDSCAPE_SCREEN = 'MOBILE_LANDSCAPE_SCREEN',
	MOBILE_POTRAIT_SCREEN = 'MOBILE_POTRAIT_SCREEN',
	DESKTOP_SCREEN_ONLY = 'DESKTOP_SCREEN_ONLY',
	TABLET_LANDSCAPE_SCREEN_ONLY = 'TABLET_LANDSCAPE_SCREEN_ONLY',
	TABLET_POTRAIT_SCREEN_ONLY = 'TABLET_POTRAIT_SCREEN_ONLY',
	MOBILE_LANDSCAPE_SCREEN_ONLY = 'MOBILE_LANDSCAPE_SCREEN_ONLY',
	MOBILE_POTRAIT_SCREEN_ONLY = 'MOBILE_POTRAIT_SCREEN_ONLY',
}

export interface StylePropertyDefinition {
	name: string;
	displayName: string;
	groupName?: string;
	description: string;
	defaultValue?: string;
	cssProperty?: string;
	selector?: string;
	noPrefix?: boolean;
}

export interface StyleGroupDefinition {
	name: string;
	displayName: string;
	description: string;
}

export interface StyleResolutionProperties {
	minWidth?: number;
	maxWidth?: number;
	name: string;
	displayName: string;
	description: string;
}

export interface EachComponentResolutionStyle {
	[key: string]: ComponentProperty<string>;
}

export interface ComponentResoltuions {
	[StyleResolution.ALL]?: EachComponentResolutionStyle;
	[StyleResolution.WIDE_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.DESKTOP_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.TABLET_LANDSCAPE_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.TABLET_POTRAIT_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.MOBILE_LANDSCAPE_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.MOBILE_POTRAIT_SCREEN]?: EachComponentResolutionStyle;
	[StyleResolution.DESKTOP_SCREEN_ONLY]?: EachComponentResolutionStyle;
	[StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY]?: EachComponentResolutionStyle;
	[StyleResolution.TABLET_POTRAIT_SCREEN_ONLY]?: EachComponentResolutionStyle;
	[StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY]?: EachComponentResolutionStyle;
	[StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY]?: EachComponentResolutionStyle;
}

export interface EachComponentStyle {
	condition?: ComponentProperty<boolean>;
	pseudoState?: string;
	resolutions?: ComponentResoltuions;
}

export interface ComponentStyle {
	[key: string]: EachComponentStyle;
}

export interface ComponentDefinition {
	key: string;
	name: string;
	bindingPath?: DataLocation;
	bindingPath2?: DataLocation;
	bindingPath3?: DataLocation;
	bindingPath4?: DataLocation;
	bindingPath5?: DataLocation;
	bindingPath6?: DataLocation;
	type: string;
	properties?: {
		[key: string]:
			| ComponentProperty<any>
			| { [key: string]: ComponentProperty<any> }
			| { [key: string]: Validation };
	};
	styleProperties?: ComponentStyle;
	validations?: Array<Validation>;
	displayOrder?: number;
	children?: { [key: string]: boolean };
}

export interface ComponentDefinitionValues {
	key: string;
	properties?: any;
	stylePropertiesWithPseudoStates?: any;
}

export interface PageDefinition {
	name: string;
	appCode: string;
	clientCode: string;
	baseClientCode: string | undefined;
	eventFunctions: {
		[key: string]: any;
	};
	rootComponent: string;
	componentDefinition: {
		[key: string]: ComponentDefinition;
	};
	translations: { [key: string]: { [key: string]: string } };
}

export interface ComponentProps {
	definition: ComponentDefinition;
	pageDefinition: PageDefinition;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
}

export interface LocationHistory {
	location: DataLocation | string;
	index: number;
	pageName: string;
}
