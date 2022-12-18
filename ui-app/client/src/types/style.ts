import { ComponentProperty } from './common';

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

export interface EachComponentStyle {
	condition?: ComponentProperty<boolean>;
	resolutions?: {
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
	};
}

export interface ComponentStyle {
	[key: string]: EachComponentStyle;
}
