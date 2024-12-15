import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tablePreviewGridStyleProperties';

const PREFIX = '.comp.compTablePreviewGrid';
export default function TablePreviewGridStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
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

	return <style id="TablePreviewGridCss">{css}</style>;
}
