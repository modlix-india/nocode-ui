import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './analyticsHeatmapStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compAnalyticsHeatmap';

export default function AnalyticsHeatmapStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		/* min-width:0 and max-width:100% are the whole reason this component stays inside its
		   card. A flex or grid item's min-width is auto, which means "as wide as my content" —
		   and the content here is a 1440px frame, so without these the card grows to 1440,
		   pushes its neighbours out of the row, and the pane comes apart. */
		${PREFIX} { display: flex; flex-direction: column; gap: 10px; min-width: 0; max-width: 100%; width: 100%; }
		${PREFIX} ._toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 0.8rem; min-width: 0; }
		${PREFIX} ._pick { font: inherit; padding: 4px 8px; border: 1px solid rgba(10,10,10,.15); border-radius: 6px; background: #fff; max-width: 100%; }
		/* The page paths are long and there are cards either side; let it shrink and clip
		   rather than set the width of everything around it. */
		${PREFIX} ._toolbar ._pick:first-child { flex: 0 1 420px; min-width: 0; text-overflow: ellipsis; }
		${PREFIX} ._toggle { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; user-select: none; }
		${PREFIX} ._count { margin-left: auto; opacity: 0.6; font-variant-numeric: tabular-nums; white-space: nowrap; }
		/* A full screen of page, always. The card sits in a column that will happily squash a
		   flex item down to nothing, and a heatmap two hundred pixels tall shows one band of
		   a page and tells you nothing — so this one holds its height and scrolls inside. */
		${PREFIX} ._stage { overflow: auto; min-height: 100vh; max-height: 100vh; flex-shrink: 0; border: 1px solid rgba(10,10,10,.12); border-radius: 8px; background: #fff; width: 100%; min-width: 0; }
		/* Holds the space the scaled frame occupies. The frame is taken out of flow so that
		   nothing downstream depends on how the scaling is done. */
		${PREFIX} ._scaler { position: relative; overflow: hidden; }
		${PREFIX} ._frameWrap { position: absolute; top: 0; left: 0; }
		${PREFIX} ._frame { display: block; }
		/* Never takes pointer events: the page underneath has to stay usable so somebody can
		   sign in or open a menu while looking at where the clicks landed. */
		${PREFIX} ._overlay { position: absolute; inset: 0; pointer-events: none; }
		${PREFIX} ._error { padding: 8px 12px; color: #b91c1c; background: #fef2f2; border-radius: 4px; font-size: 0.85rem; }
		${PREFIX} ._empty { opacity: 0.6; font-size: 0.875rem; padding: 8px; font-style: italic; }
		${PREFIX} ._hint { font-size: 0.7rem; opacity: 0.45; line-height: 1.4; }
		${PREFIX} ._hint code { font-size: 0.7rem; background: rgba(10,10,10,.06); padding: 1px 4px; border-radius: 3px; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="AnalyticsHeatmapCss">{css}</style>;
}
