import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './gridStyleProperties';

const PREFIX = '.comp.compGrid';
export default function GridStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		
		${PREFIX} ._anchorGrid._ROWLAYOUT,
		${PREFIX}._noAnchorGrid._ROWLAYOUT {
			flex-direction: row;
			align-items: center;
		}

		${PREFIX} a._anchorGrid {
			text-decoration: none;
		}

		${PREFIX} a._anchorGrid:visited, ${PREFIX} a._anchorGrid:active {
			color: inherit
		}

		/* ─── Resizable pane ─── */
		${PREFIX}._resizableGrid {
			position: relative;
		}

		${PREFIX}._resizableGrid > ._gridResizeHandle {
			position: absolute;
			z-index: 5;
			background: transparent;
			transition: background 0.15s;
		}

		${PREFIX}._resizableGrid > ._gridResizeHandle:hover,
		${PREFIX}._resizableGrid > ._gridResizeHandle:active {
			background: rgba(10, 10, 10, 0.15);
		}

		${PREFIX}._resizableGrid > ._gridResizeHandle._LEFT,
		${PREFIX}._resizableGrid > ._gridResizeHandle._RIGHT {
			top: 0;
			bottom: 0;
			width: 4px;
			cursor: col-resize;
		}

		${PREFIX}._resizableGrid > ._gridResizeHandle._LEFT { left: 0; }
		${PREFIX}._resizableGrid > ._gridResizeHandle._RIGHT { right: 0; }

		${PREFIX}._resizableGrid > ._gridResizeHandle._TOP,
		${PREFIX}._resizableGrid > ._gridResizeHandle._BOTTOM {
			left: 0;
			right: 0;
			height: 4px;
			cursor: row-resize;
		}

		${PREFIX}._resizableGrid > ._gridResizeHandle._TOP { top: 0; }
		${PREFIX}._resizableGrid > ._gridResizeHandle._BOTTOM { bottom: 0; }

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GridCss">{css}</style>;
}
