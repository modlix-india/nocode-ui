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

		${PREFIX}._bare, ${PREFIX} ._anchorGrid._bare {
			background: none;
			background-color: transparent;
			border: none;
			border-radius: 0;
			box-shadow: none;
			padding: 0;
			margin: 0;
			gap: 0;
			min-height: 0;
		}

		${PREFIX}._bare._ROWLAYOUT, ${PREFIX} ._anchorGrid._bare._ROWLAYOUT {
			align-items: stretch;
		}

		${PREFIX} a._anchorGrid {
			text-decoration: none;
		}

		${PREFIX} a._anchorGrid:visited, ${PREFIX} a._anchorGrid:active {
			color: inherit
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GridCss">{css}</style>;
}
