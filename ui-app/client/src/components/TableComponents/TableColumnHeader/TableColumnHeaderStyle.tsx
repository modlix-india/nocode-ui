import React from 'react';
import { StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableColumnHeaderStyleProperties';

const PREFIX = '.comp.compTableHeaderColumn';
export default function TableColumnStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`${PREFIX} { display: table-cell; vertical-align: middle; text-align:center}

		${PREFIX} ._rightIcon {
			padding-left: 10px;
		}

		${PREFIX} ._leftIcon {
			padding-right: 10px;
		}

		
		.comp.compTable._design1 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design1HeaderPadding'),
			values,
		)}; }
		
		.comp.compTable._design3 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design3HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design5 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design5HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design7 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design7HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design9 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design9HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design2 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design2HeaderPadding'),
			values,
		)}; }
		
		.comp.compTable._design4 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design4HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design6 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design6HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design8 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design8HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design10 ${PREFIX} { padding: ${processStyleValueWithFunction(
			values.get('design10HeaderPadding'),
			values,
		)}; }

		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableHeaderColumnCss">{css}</style>;
}
