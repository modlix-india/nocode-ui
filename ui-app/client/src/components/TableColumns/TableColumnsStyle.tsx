import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnsStyleProperties';

const PREFIX = '.comp.compTableColumns';
export default function TableColumnsStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX}{
		flex-direction: column;
	}

	${PREFIX}._ROWLAYOUT{
		flex-direction: row;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnsCss">{css}</style>;
}
