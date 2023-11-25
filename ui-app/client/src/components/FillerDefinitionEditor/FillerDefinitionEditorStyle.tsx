import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './fillerDefinitionEditorStyleProperties';

const PREFIX = '.comp.compFillerDefinitionEditor';
export default function FillerDefinitionEditorStyle({
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

	return <style id="FillerDefinitionEditorCSS">{css}</style>;
}
