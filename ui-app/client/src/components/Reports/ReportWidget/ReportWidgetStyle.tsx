import React from 'react';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { reportCss } from '../reportStyle';
import { PREFIX, styleDefaults, styleProperties } from './reportWidgetStyleProperties';

export default function ReportWidgetStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`${PREFIX} { display: flex; flex-direction: column; min-height: 200px; }` +
		reportCss(PREFIX) +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ReportWidgetCss">{css}</style>;
}
