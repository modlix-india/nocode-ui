import { EMPTY_STRING } from '../constants';
import { StylePropertyDefinition } from '../types/style';

export function processStyleDefinition(
	prefix: string,
	styleProperties: StylePropertyDefinition[],
	theme: Map<string, string>,
): string {
	if (!styleProperties?.length || !theme.size) return EMPTY_STRING;

	const index = new Map<string, string>();

	for (const propDef of styleProperties) {
		if (!propDef.selector || !propDef.cssProperty) continue;
		const sel = propDef.addPrefix ? prefix + propDef.selector : propDef.selector;
		index.set(
			sel,
			(index.get(sel) ?? '') + processStyleValue(propDef.name, theme, propDef.cssProperty),
		);
	}

	if (index.size === 0) return EMPTY_STRING;

	return [...index].map(([key, style]) => key + ' { ' + style + ' }').join('\n');
}

export function processStyleValue(
	variable: string,
	theme: Map<string, string>,
	cssStyleProp: string,
): string {
	if (!variable || !cssStyleProp) return EMPTY_STRING;
	const v = theme.get(variable);
	if (!v) return EMPTY_STRING;
	return cssStyleProp + ': ' + processFunction(v, theme);
}

// Enhance this function to support various css functions.
export function processFunction(value: string, theme: Map<string, string>): string {
	return value;
}
