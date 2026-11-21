import React from 'react';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { reportCss } from '../reportStyle';
import { PREFIX, styleDefaults, styleProperties } from './reportLibraryStyleProperties';

export default function ReportLibraryStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`${PREFIX} { display: block; width: 100%; }` +
		reportCss(PREFIX) +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ReportLibraryCss">{css}</style>;
}
