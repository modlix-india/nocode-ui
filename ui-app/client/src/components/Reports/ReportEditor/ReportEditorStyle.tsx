import React from 'react';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { reportCss } from '../reportStyle';
import { PREFIX, styleDefaults, styleProperties } from './reportEditorStyleProperties';

export default function ReportEditorStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`${PREFIX} { display: block; width: 100%; }` +
		reportCss(PREFIX) +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ReportEditorCss">{css}</style>;
}
