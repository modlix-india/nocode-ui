import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './mapPickerStyleProperties';

const PREFIX = '.comp.compMapPicker';

export default function MapPickerStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; width: 100%; min-width: 0; height: 320px; position: relative; overflow: hidden; border-radius: 8px; }
		${PREFIX} ._map { flex: 1; width: 100%; min-height: 0; }
		${PREFIX} ._noMap { padding: 8px 0; opacity: 0.7; font-size: 0.875rem; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="MapPickerCss">{css}</style>;
}
