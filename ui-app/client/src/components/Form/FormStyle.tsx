import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './formStyleProperies';

const PREFIX = '.comp.compForm';
export default function FormStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; gap: 5px;}
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FormCss">{css}</style>;
}
