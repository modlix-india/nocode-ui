import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textEditorStyleProperies';

const PREFIX = '.comp.compTextEditor';
export default function TextEditorStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`${PREFIX} { flex:1; height: 100%; width: 100%; transition: height 0s, widht 0s; }
		${PREFIX} > * { transition: width 0s, height 0s}` +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextEditorCss">{css}</style>;
}
