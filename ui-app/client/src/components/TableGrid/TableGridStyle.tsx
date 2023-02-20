import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableGridStyleProperties';

const PREFIX = '.comp.compTableGrid';
export default function TableGridStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX}{
		flex-direction: column;
	}

	${PREFIX}._ROWLAYOUT{
		flex-direction: row;
	}

	${PREFIX} ._eachTableGrid {
		display: flex;
		flex-direction: column;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableGridCss">{css}</style>;
}
