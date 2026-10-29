import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './signaturePadStyleProperties';

const PREFIX = '.comp.compSignaturePad';

export default function SignaturePadStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// touch-action none on the pad is what keeps a finger drawing on a phone from scrolling the
	// page; the user-select / touch-callout rules stop a long press from selecting or opening the
	// iOS callout. Colours and fonts come from the style properties (theme), not from here.
	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; gap: 6px; width: 100%; min-width: 0; }
		${PREFIX} ._pad { position: relative; width: 100%; min-width: 0; border-width: 1px; border-style: solid; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; overscroll-behavior: contain; cursor: crosshair; }
		${PREFIX}._readOnly ._pad { cursor: default; }
		${PREFIX} ._canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; z-index: 1; }
		${PREFIX} ._line { position: absolute; left: 6%; right: 6%; bottom: 28%; border-top-width: 1px; border-top-style: dashed; pointer-events: none; }
		${PREFIX} ._hint { position: absolute; left: 6%; bottom: calc(28% + 6px); pointer-events: none; opacity: 0.9; }
		${PREFIX} ._image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
		${PREFIX} ._actions { display: flex; justify-content: flex-end; gap: 12px; }
		${PREFIX} ._button { background: none; border: none; padding: 4px 2px; cursor: pointer; }
		${PREFIX} ._button:disabled { opacity: 0.4; cursor: default; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="SignaturePadCss">{css}</style>;
}
