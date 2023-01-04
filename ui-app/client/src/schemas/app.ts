import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const appSchemas: Array<[string, Schema]> = [
	[
		'AppMeta',
		Schema.ofObject('AppMeta')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['charset', Schema.ofBoolean('charset')],
					['content', Schema.ofBoolean('content')],
					[
						'name',
						Schema.ofString('name').setEnums([
							'application-name',
							'author',
							'description',
							'generator',
							'keywords',
							'viewport',
						]),
					],
					[
						'http-equiv',
						Schema.ofString('http-equiv').setEnums([
							'content-security-policy',
							'content-type',
							'default-style',
							'refresh',
						]),
					],
				]),
			),
	],
	[
		'AppScript',
		Schema.ofObject('AppScript')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['async', Schema.ofBoolean('async')],
					['defer', Schema.ofBoolean('defer')],
					['nomodule', Schema.ofBoolean('nomodule')],
					[
						'referrerpolicy',
						Schema.ofString('referrerpolicy').setEnums([
							'no-referrer',
							'no-referrer-when-downgrade',
							'origin',
							'origin-when-cross-origin',
							'unsafe-url',
						]),
					],
					['src', Schema.ofString('src')],
					['type', Schema.ofString('type')],
					[
						'crossorigin',
						Schema.ofString('crossorigin').setEnums(['anonymous', 'use-credentials']),
					],
				]),
			),
	],
	[
		'AppLink',
		Schema.ofObject('AppLink')
			.setNamespace(NAMESPACE_UI_ENGINE)
			.setProperties(
				new Map<string, Schema>([
					['href', Schema.ofString('href')],
					['hreflang', Schema.ofString('hreflang')],
					['media', Schema.ofString('media')],
					[
						'referrerpolicy',
						Schema.ofString('referrerpolicy').setEnums([
							'no-referrer',
							'no-referrer-when-downgrade',
							'origin',
							'origin-when-cross-origin',
							'unsafe-url',
						]),
					],
					['sizes', Schema.ofString('sizes')],
					['title', Schema.ofString('title')],
					['type', Schema.ofString('type')],
					[
						'rel',
						Schema.ofString('rel').setEnums([
							'alternate',
							'author',
							'dns-prefetch',
							'help',
							'icon',
							'license',
							'next',
							'pingback',
							'preconnect',
							'prefetch',
							'preload',
							'prerender',
							'prev',
							'search',
							'stylesheet',
						]),
					],
				]),
			),
	],
];

export default appSchemas;
