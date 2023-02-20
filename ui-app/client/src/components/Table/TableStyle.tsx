import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableStyleProperties';

const PREFIX = '.comp.compTable';
export default function TableStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`
	${PREFIX} {
		display: flex;
		flex-direction: row;
	}

	${PREFIX} ._tableWithPagination {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	${PREFIX} ._tablePagination {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	${PREFIX} ._tablePagination ._selected {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	${PREFIX} ._tablePagination ._seperator {
		color: ${processStyleValueWithFunction(values.get('paginationSeperatorColor'), values)};
	}

	${PREFIX} ._tablePagination._RIGHT {
		justify-content: right;
	}

	${PREFIX} ._tablePagination._CENTER {
		justify-content: center;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableCss">{css}</style>;
}
