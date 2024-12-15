import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnStyleProperties';

const PREFIX = '.comp.compTableColumn';
export default function TableColumnStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`${PREFIX} { display: table-cell; vertical-align: middle; text-align:center;}
	
		.comp.compTable._design1 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design1ColumnPadding'),
			values,
		)}; }
		
		.comp.compTable._design3 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design3ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design5 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design5ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design7 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design7ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design9 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design9ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design2 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design2ColumnPadding'),
			values,
		)}; }
		
		.comp.compTable._design4 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design4ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design6 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design6ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design8 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design8ColumnPadding'),
			values,
		)}; }

		.comp.compTable._design10 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design10ColumnPadding'),
			values,
		)}; }
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnCss">{css}</style>;
}
