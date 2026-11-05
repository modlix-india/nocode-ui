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
		${PREFIX} ._placeLabel { position: absolute; transform: translate(-50%, -50%); background: #ffffff; color: #1a1a1a; font-size: 12px; font-weight: 500; line-height: 16px; padding: 3px 8px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18); white-space: nowrap; pointer-events: none; }
		${PREFIX} ._placeLabel._excluded { color: #c0362c; }
		${PREFIX}._dark ._placeLabel { background: #1f1f1f; color: #f2f2f2; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); }
		${PREFIX}._dark ._placeLabel._excluded { color: #f08a80; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="MapPickerCss">{css}</style>;
}
