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
		/* As tall as the page it is showing, and NOT a scroller.
		   It was capped at 100vh and scrolled inside, which put a third scrollbar on screen —
		   the rail has one, the dashboard has one, and this one then captured the wheel
		   whenever the pointer crossed it, so scrolling the dashboard stopped dead over the
		   heatmap. One scrollbar, the page's own.
		   min-height keeps a short page from collapsing the card; flex-shrink: 0 keeps the
		   column it sits in from squashing it back down.
		   (No backticks in this file: the whole stylesheet is one template literal.) */
		${PREFIX} ._stage { overflow: hidden; min-height: 100vh; flex-shrink: 0; border: 1px solid rgba(10,10,10,.12); border-radius: 8px; background: #fff; width: 100%; min-width: 0; }
		/* Holds the space the scaled frame occupies. The frame is taken out of flow so that
		   nothing downstream depends on how the scaling is done. */
		${PREFIX} ._scaler { position: relative; overflow: hidden; }
		${PREFIX} ._frameWrap { position: absolute; top: 0; left: 0; }
		/* The stage is a row so the depth strip can stand beside the page at the same height
		   rather than above it. align-items: flex-start keeps a short strip from stretching
		   when the frame is taller than the reports it has. */
		/* Allowed to wrap and to shrink, where ._count is not. Two nowrap items with
		   margin-left:auto in one row push each other off the end of the toolbar, and the
		   sentence is the one that can afford to take a second line. */
		${PREFIX} ._depth { opacity: 0.6; min-width: 0; flex: 0 1 auto; }
		${PREFIX} ._stage { display: flex; align-items: flex-start; }
		/* Narrow on purpose: it is a margin note on the page, not a chart. The page is what
		   the reader is looking at, and a strip wide enough to read values off would be
		   claiming a precision that a percentage of a document height does not have. */
		${PREFIX} ._scrollStrip { width: 10px; flex: 0 0 10px; display: flex; flex-direction: column; border-radius: 3px; overflow: hidden; margin: 0 8px 0 4px; }
		${PREFIX} ._scrollBand { width: 100%; }
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
