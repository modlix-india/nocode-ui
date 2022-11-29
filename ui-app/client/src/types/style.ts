export enum StyleResolution {
	OTHER = '',
	WIDE_SCREEN = '1281px-',
	DESKTOP_SCREEN = '1025px-',
	TABLET_LANDSCAPE_SCREEN = '961px-',
	TABLET_POTRAIT_SCREEN = '641px-',
	MOBILE_LANDSCAPE_SCREEN = '481px-',
	MOBILE_SCREEN = '320px-',
	DESKTOP_SCREEN_ONLY = '1025px-1280px',
	TABLET_LANDSCAPE_SCREEN_ONLY = '961px-1024px',
	TABLET_POTRAIT_SCREEN_ONLY = '641px-960px',
	MOBILE_LANDSCAPE_SCREEN_ONLY = '481px-640px',
	MOBILE_SCREEN_ONLY = '320px-480px',
}

export interface StylePropertyDefinition {
	name: string;
	displayName: string;
	groupName?: string;
	description: string;
	defaultValue?: string;
	cssProperty?: string;
	selector?: string;
	addPrefix?: boolean;
}

export interface StyleGroupDefinition {
	name: string;
	displayName: string;
	description: string;
}
