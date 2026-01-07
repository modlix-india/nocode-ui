import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './subPageStyleProperties';

const PREFIX = '.comp.compSubPage';
export default function SubPageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SubPageCss">{css}</style>;
}
