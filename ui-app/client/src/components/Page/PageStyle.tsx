import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './pageStyleProperties';

const PREFIX = '.comp.compPage';
export default function PageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`${PREFIX} { display: flex; flex-direction: column }` +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageCss">{css}</style>;
}
