import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './gridStyleProperties';

const PREFIX = '.comp.compGrid';
export default function GridStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;
	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	const css =
		`
		${PREFIX} ._anchorGrid,
		${PREFIX}._noAnchorGrid {
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._anchorGrid._ROWLAYOUT,
		${PREFIX}._noAnchorGrid._ROWLAYOUT {
			flex-direction: row;
		}

		._FIVECOLUMNSLAYOUT,
		._FOURCOLUMNSLAYOUT,
		._THREECOLUMNSLAYOUT,
		._TWOCOLUMNSLAYOUT {
			display: grid;
			grid-template-columns: 1fr;
		}

		@media screen and (min-width: ${TABLET_MIN_WIDTH}px) {
		
			._FIVECOLUMNSLAYOUT,
			._FOURCOLUMNSLAYOUT,
			._THREECOLUMNSLAYOUT,
			._TWOCOLUMNSLAYOUT {
				grid-template-columns: 1fr 1fr;
			}
		}

		@media screen and (min-width: ${DESKTOP_MIN_WIDTH}px) {
		
			._FIVECOLUMNSLAYOUT {
				grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
			}
	
			._FOURCOLUMNSLAYOUT {
				grid-template-columns: 1fr 1fr 1fr 1fr;
			}
	
			._THREECOLUMNSLAYOUT {
				grid-template-columns: 1fr 1fr 1fr;
			}
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GridCss">{css}</style>;
}
