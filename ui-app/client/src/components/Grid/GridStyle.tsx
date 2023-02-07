import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './gridStyleProperties';

const PREFIX = '.comp.compGrid';
export default function GridStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} ._anchorGrid,
		${PREFIX}._noAnchorGrid {
			flex-direction: column;
		}

		${PREFIX} ._anchorGrid._ROWLAYOUT,
		${PREFIX}._noAnchorGrid._ROWLAYOUT {
			flex-direction: row;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GridCss">{css}</style>;
}
