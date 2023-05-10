import { EMPTY_STRING } from '../constants';
import {
	PageDefinition,
	StylePropertyDefinition,
	StyleResolution,
	StyleResolutionProperties,
} from '../types/common';

export const StyleResolutionDefinition = new Map<string, StyleResolutionProperties>([
	[
		StyleResolution.ALL,
		{
			name: StyleResolution.ALL,
			displayName: 'Default',
			description: 'Default for all resolution.',
			order: 1,
		},
	],
	[
		StyleResolution.WIDE_SCREEN,
		{
			name: StyleResolution.WIDE_SCREEN,
			displayName: 'Wide Screen',
			description: 'Resolution larger than Wide Screen, width more than 1280px.',
			minWidth: 1281,
			order: 2,
		},
	],
	[
		StyleResolution.DESKTOP_SCREEN,
		{
			name: StyleResolution.DESKTOP_SCREEN,
			displayName: 'Desktop Screen and Larger',
			description: 'Resolution larger than Desktop Screen, width more than 1024px.',
			minWidth: 1025,
			order: 3,
		},
	],
	[
		StyleResolution.DESKTOP_SCREEN_ONLY,
		{
			name: StyleResolution.DESKTOP_SCREEN_ONLY,
			displayName: 'Desktop',
			description: 'Desktop Screen resolution, width 1025px to 1280px (inclusive).',
			minWidth: 1025,
			maxWidth: 1280,
			order: 4,
		},
	],
	[
		StyleResolution.DESKTOP_SCREEN_SMALL,
		{
			name: StyleResolution.DESKTOP_SCREEN_SMALL,
			displayName: 'Desktop Screen and Smaller',
			description: 'Desktop Screen resolution, width less than 1280px (inclusive).',
			maxWidth: 1280,
			order: 5,
		},
	],
	[
		StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY,
		{
			name: StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY,
			displayName: 'Tablet (Landscape)',
			description: 'Tablet landscape orientation, width 961px to 1024px (inclusive).',
			minWidth: 961,
			maxWidth: 1024,
			order: 7,
		},
	],
	[
		StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL,
		{
			name: StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL,
			displayName: 'Tablet (Landscape) and Smaller',
			description: 'Tablet landscape orientation, width less than 1024px (inclusive).',
			maxWidth: 1024,
			order: 8,
		},
	],
	[
		StyleResolution.TABLET_POTRAIT_SCREEN_ONLY,
		{
			name: StyleResolution.TABLET_POTRAIT_SCREEN_ONLY,
			displayName: 'Tablet (Portrait)',
			description: 'Tablet portrait orientation, width 641px to 960px (inclusive).',
			minWidth: 641,
			maxWidth: 960,
			order: 10,
		},
	],
	[
		StyleResolution.TABLET_POTRAIT_SCREEN_SMALL,
		{
			name: StyleResolution.TABLET_POTRAIT_SCREEN_SMALL,
			displayName: 'Tablet (Portrait) and Smaller',
			description: 'Tablet portrait orientation, width less than 960px (inclusive).',
			maxWidth: 960,
			order: 11,
		},
	],
	[
		StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY,
		{
			name: StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY,
			displayName: 'Mobile (Landscape)',
			description: 'Mobile landscape orientation, width 481px to 640px (inclusive).',
			minWidth: 481,
			maxWidth: 640,
			order: 13,
		},
	],
	[
		StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL,
		{
			name: StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL,
			displayName: 'Mobile (Landscape) and Smaller',
			description: 'Mobile landscape orientation, width less than 640px (inclusive).',
			maxWidth: 640,
			order: 14,
		},
	],
	[
		StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY,
		{
			name: StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY,
			displayName: 'Mobile (Portrait)',
			description: 'Mobile portrait orientation, width smaller than 480px.',
			maxWidth: 480,
			order: 16,
		},
	],
	[
		StyleResolution.MOBILE_POTRAIT_SCREEN,
		{
			name: StyleResolution.MOBILE_POTRAIT_SCREEN,
			displayName: 'Mobile (Portrait) and Larger',
			description:
				'Resolution larger than Mobile portrait orientation, width more than 320px.',
			minWidth: 321,
			order: 15,
		},
	],
	[
		StyleResolution.TABLET_LANDSCAPE_SCREEN,
		{
			name: StyleResolution.TABLET_LANDSCAPE_SCREEN,
			displayName: 'Tablet (Landscape) and Larger',
			description:
				'Resolution larger than Table landscape orientation, width more than 960px.',
			minWidth: 961,
			order: 6,
		},
	],
	[
		StyleResolution.TABLET_POTRAIT_SCREEN,
		{
			name: StyleResolution.TABLET_POTRAIT_SCREEN,
			displayName: 'Tablet (Portrait) and Larger',
			description:
				'Resolution larger than Table portrait orientation, width more than 640px.',
			minWidth: 641,
			order: 9,
		},
	],

	[
		StyleResolution.MOBILE_LANDSCAPE_SCREEN,
		{
			name: StyleResolution.MOBILE_LANDSCAPE_SCREEN,
			displayName: 'Mobile (Landscape) and Larger',
			description:
				'Resolution larger than Table landscape orientation, width more than 480px.',
			minWidth: 481,
			order: 12,
		},
	],
]);

export function processStyleDefinition(
	prefix: string,
	styleProperties: StylePropertyDefinition[],
	styleDefaults: Map<string, string> | undefined,
	theme: Map<string, Map<string, string>> | undefined,
): string {
	if (!styleProperties?.length && !theme?.size) return EMPTY_STRING;

	if (styleDefaults) {
		theme = new Map(theme ? [...theme] : []);

		theme.set(
			StyleResolution.ALL,
			theme.has(StyleResolution.ALL)
				? new Map([...styleDefaults, ...theme.get(StyleResolution.ALL)!])
				: styleDefaults,
		);
	}

	if (!theme) return EMPTY_STRING;

	let style = '';
	for (const [key, value] of theme) {
		style += processEachResolution(prefix, styleProperties, key, value);
	}

	return style;
}

export function processEachResolution(
	prefix: string,
	styleProperties: StylePropertyDefinition[],
	resolutionName: string,
	theme: Map<string, string>,
): string {
	if (!theme.size) return EMPTY_STRING;

	const index = new Map<string, string>();

	for (const propDef of styleProperties) {
		if (!propDef.selector || !propDef.cssProperty) continue;
		const sel = propDef.noPrefix ? propDef.selector : prefix + ' ' + propDef.selector;
		index.set(
			sel,
			(index.get(sel) ?? '') + processStyleValue(propDef.name, theme, propDef.cssProperty),
		);
	}

	if (index.size === 0) return EMPTY_STRING;

	const resDef = StyleResolutionDefinition.get(resolutionName);

	let mediaQuery = '';

	if (resDef?.minWidth) {
		mediaQuery = '\n@media screen and (min-width: ' + resDef.minWidth + 'px) ';
		if (resDef.maxWidth) mediaQuery += ' and (max-width: ' + resDef.maxWidth + 'px) {';
		else mediaQuery += ' {';
	} else if (resDef?.maxWidth) {
		mediaQuery = '\n@media screen and (max-width: ' + resDef.maxWidth + 'px) {';
	}

	return (
		mediaQuery +
		[...index].map(([key, style]) => key + ' { ' + style + ' }').join('\n') +
		(mediaQuery ? '}' : '')
	);
}

export function processStyleValue(
	variable: string,
	theme: Map<string, string>,
	cssStyleProp: string,
): string {
	if (!variable || !cssStyleProp) return EMPTY_STRING;
	const v = theme.get(variable);
	if (!v) return EMPTY_STRING;
	return cssStyleProp + ': ' + processStyleValueWithFunction(v, theme) + '; ';
}

export function processComponentStylePseudoClasses(
	pdef: PageDefinition,
	pseudoStates: { [key: string]: boolean },
	styleProperties: any | undefined,
): any {
	if (!styleProperties) return {};

	let style = { ...styleProperties[''] } ?? {};

	for (let [state, status] of Object.entries(pseudoStates)) {
		if (!status || !styleProperties[state]) continue;

		for (let [target, styleObj] of Object.entries(styleProperties[state])) {
			if (style[target]) style[target] = { ...style[target], ...(styleObj as any) };
			else style[target] = styleObj;
		}
	}
	if (pdef.processedClasses) {
		for (let [target, styleObj] of Object.entries(style)) {
			let s = styleObj as any;
			if (!s?.selectorName) continue;
			for (let eachSelector of s.selectorName.split(' ')) {
				if (!pdef.processedClasses[eachSelector]) continue;
				s = { ...s, ...pdef.processedClasses[eachSelector] };
			}
			style[target] = s;
		}
	}
	return style;
}

// Enhance this function to support various css functions and nested expressions too.
export function processStyleValueWithFunction(
	value: string | undefined,
	theme: Map<string, string>,
): string {
	if (!value) return '';
	let finValue = '';
	for (let i = 0; i < value.length; i++) {
		if (value[i] !== '<') {
			finValue += value[i];
			continue;
		}

		let variable = '';
		while (value[++i] != '>' && i < value.length) {
			variable += value[i];
		}

		if (!variable) continue;

		finValue += theme.get(variable) ?? '';
	}

	return finValue;
}

export function processClassesForPageDefinition(pdef: PageDefinition): PageDefinition {
	if (pdef?.processedClasses || !pdef?.properties?.classes) return pdef;
	const newDef = { ...pdef };
	newDef.processedClasses = Object.values(pdef.properties.classes).reduce((a, c) => {
		if (!c.selector || !c.style) return a;
		a[c.selector] = processStyleFromString(c.style);
		return a;
	}, {} as any);

	return newDef;
}

export function processStyleFromString(str: string): { [key: string]: string } {
	str = str
		.replace(/\n/g, '')
		.split('}')
		.map(e => e.trim())
		.filter(e => !!e)
		.map(e => {
			const ind = e.indexOf('{');
			if (ind <= 0) return e;
			return e.substring(ind + 1).trim();
		})
		.join('');

	const styles = str
		.split(';')
		.map(s => {
			let ind = s.indexOf(':');
			if (ind <= 0) return undefined;
			let prop = s.substring(0, ind).trim();
			if (!prop) return undefined;
			prop = prop
				.split('-')
				.map((s, i) => (i ? s[0].toUpperCase() + s.substring(1) : s))
				.join('');
			let value = s.substring(ind + 1).trim();
			if (!value) return undefined;
			return { prop, value };
		})
		.filter(e => !!e)
		.reduce((ia, ic) => {
			if (!ic) return ia;
			ia[ic.prop] = ic.value;
			return ia;
		}, {} as any);
	return styles;
}
