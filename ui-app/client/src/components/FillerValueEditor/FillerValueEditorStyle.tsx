import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fillerValueEditorStyleProperties';

const PREFIX = '.comp.compFillerValueEditor';
export default function FillerValueEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FillterValueEditorCSS">{css}</style>;
}
