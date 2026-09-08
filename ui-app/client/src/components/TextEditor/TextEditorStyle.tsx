import { StyleResolution } from '../../types/common';
import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textEditorStyleProperies';

const PREFIX = '.comp.compTextEditor';
export default function TextEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const css =
		`${PREFIX} { flex:1; height: 100%; width: 100%; transition: height 0s, width 0s; border: 1px solid ${t('borderColorNine', '#eee')}; border-radius: 2px; }
		${PREFIX} > * { transition: width 0s, height 0s}` +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextEditorCss">{css}</style>;
}
