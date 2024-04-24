import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tableDynamicColumnStyleProperties';


const PREFIX = '.comp.compTableDynamicColumn';
export default function TableDynamicColumnStyle({
	theme,
}: {
	theme: Map<string, Map<string,string>>;
}) {
	const css = 
	`${PREFIX} { display: table; flex-direction: column; flex:1; }
	 ${PREFIX} ._row { display: table-row; }
	` + processStyleDefinition(PREFIX,styleProperties,styleDefaults , theme);

	return <style id="TableDynamicColumnCss">{css}</style>;
}


