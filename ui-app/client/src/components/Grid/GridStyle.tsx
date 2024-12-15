import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './gridStyleProperties';

const PREFIX = '.comp.compGrid';
export default function GridStyle({ theme }: Readonly<{ theme: Map<string, Map<string, string>> }>) {
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

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GridCss">{css}</style>;
}
