import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tableDynamicColumnsStyleProperties';

const PREFIX = '.comp.compTableDynamicColumns';
export default function TableDynamicColumnsStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
	// All the styles will be copied from TablesColumns, don't write any specific styles here
	// This is a re-incarnation of TableColumnsStyle.tsx
	const css =
		`${PREFIX} { display: table; flex-direction: column; flex: 1; }
		 ${PREFIX} ._row { display: table-row; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableDynamicColumnsCss">{css}</style>;
}
