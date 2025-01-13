import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';
import { styleDefaults } from './tableColumnsStyleProperties';

const PREFIX = '.comp.compTableColumns';
const NAME = 'TableColumns';
export default function TableColumnsStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>([]);

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);

	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`${PREFIX} { display: table; flex-direction: column; flex: 1; }
		 ${PREFIX} ._row { display: table-row;}
		
		.comp.compTable._design1 ._row { height: ${processStyleValueWithFunction(
			values.get('design1RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design1RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design2 ._row { height: ${processStyleValueWithFunction(
			values.get('design2RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design2RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design3 ._row { height: ${processStyleValueWithFunction(
			values.get('design3RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design3RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design4 ._row { height: ${processStyleValueWithFunction(
			values.get('design4RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design4RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design5 ._row { height: ${processStyleValueWithFunction(
			values.get('design5RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design5RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design6 ._row { height: ${processStyleValueWithFunction(
			values.get('design6RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design6RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design7 ._row { height: ${processStyleValueWithFunction(
			values.get('design7RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design7RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design8 ._row { height: ${processStyleValueWithFunction(
			values.get('design8RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design8RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design9 ._row { height: ${processStyleValueWithFunction(
			values.get('design9RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design9RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design10 ._row { height: ${processStyleValueWithFunction(
			values.get('design10RowHeight'),
			values,
		)};
			background-color:  ${processStyleValueWithFunction(
				values.get('design10RowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design1 ._row:nth-child(even) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design1EvenRowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design2 ._row:nth-child(even) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design1EvenRowBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design3 ._row:nth-child(3n+1) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design3SecondBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design7 ._row:nth-child(3n+1) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design7SecondBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design3 ._row:nth-child(3n+2) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design3ThridBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design7 ._row:nth-child(3n+2) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design7ThridBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design5 .comp.compTableColumn:nth-child(odd) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design5EvenColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design6 .comp.compTableColumn:nth-child(odd) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design6EvenColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design10 .comp.compTableColumn:nth-child(odd) {
			background-color:  ${processStyleValueWithFunction(
				values.get('design10EvenColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design5 .comp.compTableColumn {
			background-color:  ${processStyleValueWithFunction(
				values.get('design5ColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design6 .comp.compTableColumn {
			background-color:  ${processStyleValueWithFunction(
				values.get('design6ColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTable._design10 .comp.compTableColumn {
			background-color:  ${processStyleValueWithFunction(
				values.get('design10ColumnBackgroundColor'),
				values,
			)};
		}

		.comp.compTableDynamicColumns { display: table; flex-direction: column; flex: 1; }
		.comp.compTableDynamicColumns ._row { display: table-row; }

		.comp.compTable ._row:first-child .comp.compTableHeaderColumn,
		.comp.compTable ._row:first-child .comp.compTableColumn {
			border-top: none !important;
		}
		.comp.compTable ._row:last-child .comp.compTableColumn {
			border-bottom: none !important;
		}
		
		.comp.compTable ._row .comp.compTableHeaderColumn:first-child,
		.comp.compTable ._row .comp.compTableColumn:first-child {
			border-left: none !important;
		}

		.comp.compTable ._row .comp.compTableHeaderColumn:last-child,
		.comp.compTable ._row .comp.compTableColumn:last-child {
			border-right: none !important;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnsCss">{css}</style>;
}
