import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './tableStyleProperties';

const PREFIX = '.comp.compTable';
export default function TableStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`
	${PREFIX} {
		display: flex;
		flex-direction: row;
	
	}

	${PREFIX}.FIXED .comp.compTableColumns { table-layout : fixed}

	${PREFIX} ._tableWithPagination {
		flex: 1;
		display: flex;
		flex-wrap:wrap;
		align-items:flex-start;
	}

	${PREFIX} ._tablePagination {
		display: flex;
		gap: 10px;
		align-items: center;
		width:100%;

	}

	${PREFIX} ._tablePagination ._selected {
		display: flex;
		justify-content: center;
		align-items: center;
		color:#427EE4;

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

	${PREFIX}.RIGHT {
		flex-direction:row-reverse;
	}

	${PREFIX}.LEFT {
		flex-direction:row;
	}

	${PREFIX}.TOP {
		flex-direction:column;
	}

	${PREFIX}.BOTTOM {
		flex-direction:column-reverse;
	}

	${PREFIX} ._tablePagination ._pageNumber{
		min-width:26px;
		height:26px;
		display:flex;
		align-items:center;
		justify-content:center;
		padding: 0px 6px;
	}

	${PREFIX} ._tablePagination ._next{
		padding:5px;
	}

	${PREFIX} ._tablePagination ._prev{
		padding:5px;
	}
	
	${PREFIX} ._modesContainer{
		display:flex;
		border:1px solid #DDDDDD;
		border-radius:6px;
		margin-right:15px;
		height:36px;

	}

	${PREFIX} ._grid {
		padding:8px;
		border-top-right-radius:6px;
		border-bottom-right-radius:6px;
	}

	${PREFIX} ._columns{
		padding:8px;
		border-top-left-radius:6px;
		border-bottom-left-radius:6px;
	}

	${PREFIX} ._tablePagination select{
		border: 1px solid #DDDDDD;
		border-radius:6px;
		height:36px;
        font-size: 14px;
        font-weight: 500;
		color:#333333;
		padding-left: 8px;
	}

	${PREFIX} ._leftArrow{
		padding-left:10px;
	}

	
	${PREFIX} ._rightArrow{
		padding-right:10px;
	}


	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableCss">{css}</style>;
}
