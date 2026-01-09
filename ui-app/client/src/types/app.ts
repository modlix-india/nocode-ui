export enum AppLinkScriptReferrerPolicy {
	NO_REFERRER = 'no-referrer',
	NO_REFERRER_WHEN_DOWNGRADE = 'no-referrer-when-downgrade',
	ORIGIN = 'origin',
	ORIGIN_WHEN_CROSS_ORIGIN = 'origin-when-cross-origin',
	UNSAFE_URL = 'unsafe-url',
}

export enum AppLinkRel {
	ALTERNATE = 'alternate',
	AUTHOR = 'author',
	DNS_PREFETCH = 'dns-prefetch',
	HELP = 'help',
	ICON = 'icon',
	LICENSE = 'license',
	NEXT = 'next',
	PINGBACK = 'pingback',
	PRECONNECT = 'preconnect',
	PREFETCH = 'prefetch',
	PRELOAD = 'preload',
	PRERENDER = 'prerender',
	PREV = 'prev',
	SEARCH = 'search',
	STYLESHEET = 'stylesheet',
}

export enum AppScriptCrossorigin {
	ANONYMOUS = 'anonymous',
	USE_CREDENTIALS = 'use-credentials',
}

export enum AppMetaHTTPEquiv {
	CONTENT_SECURITY_POLICY = 'content-security-policy',
	CONTENT_TYPE = 'content-type',
	DEFAULT_STYLE = 'default-style',
	REFRESH = 'refresh',
}

export enum AppMetaName {
	APPLICATION_NAME = 'application-name',
	AUTHOR = 'author',
	DESCRIPTION = 'description',
	GENERATOR = 'generator',
	KEYWORDS = 'keywords',
	VIEWPORT = 'viewport',
}

export interface AppLink {
	href: string;
	rel: AppLinkRel;
	hreflang?: string;
	media?: string;
	referrerpolicy?: AppLinkScriptReferrerPolicy;
	sizes?: string;
	title?: string;
	type?: string;
}

export interface AppScript {
	async?: boolean;
	crossorigin?: AppScriptCrossorigin;
	defer?: boolean;
	nomodule?: boolean;
	referrerpolicy?: AppLinkScriptReferrerPolicy;
	src: string;
	type: string;
}

export interface AppMeta {
	charset?: string;
	content: string;
	'http-equiv': AppMetaHTTPEquiv;
	name: AppMetaName;
}
