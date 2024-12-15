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
		width:26px;
		height:26px;
		display:flex;
		align-items:center;
		justify-content:center;

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

	${PREFIX} ._grid._selected{
		background: #0000000F;

	}

	${PREFIX} ._columns._selected{
		background: #0000000F;

	}

	${PREFIX} ._grid {
		padding:8px;

	}

	${PREFIX} ._columns{
		padding:8px;
	
	}

	${PREFIX} ._grid._selected svg{
		fill:#427EE4;
	}

	
	${PREFIX} ._columns._selected svg{
		fill:#427EE4;
	}

	${PREFIX} ._columns svg{
		fill:#DDDDDD;
	}

	${PREFIX} ._grid svg{
		fill:#DDDDDD;
	}

	${PREFIX} ._tablePagination select{
		border: 1px solid #DDDDDD;
		border-radius:6px;
		height:36px;
		width:58px;
		font-family: Inter;
        font-size: 14px;
        font-weight: 500;
		color:#333333;
        line-height: 19.07px;
		padding-left:10px;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.71655 0.232035C8.85799 0.0833867 9.04899 0 9.24803 0C9.44708 0 9.63807 0.0833867 9.77951 0.232035C9.84935 0.305029 9.9048 0.392037 9.94265 0.487995C9.98051 0.583952 10 0.686942 10 0.790971C10 0.895001 9.98051 0.99799 9.94265 1.09395C9.9048 1.18991 9.84935 1.27691 9.77951 1.34991L5.53202 5.76833C5.39026 5.91677 5.19913 6 5 6C4.80087 6 4.60974 5.91677 4.46798 5.76833L0.220486 1.34991C0.150654 1.27691 0.0951987 1.18991 0.057346 1.09395C0.0194934 0.99799 0 0.895001 0 0.790971C0 0.686942 0.0194934 0.583952 0.057346 0.487995C0.0951987 0.392037 0.150654 0.305029 0.220486 0.232035C0.361925 0.0833867 0.552923 0 0.751966 0C0.951008 0 1.14201 0.0833867 1.28345 0.232035L5.00163 3.8556L8.71655 0.232035Z' fill='%23333333'/%3E%3C/svg%3E%0A");
		background-repeat:no-repeat;
		background-position: calc(100% - 10px) center;
	}

	${PREFIX} ._tablePagination select option{
		font-family: Inter;
        font-size: 14px;
        font-weight: 500;
		color:#333333;
        line-height: 19.07px;

	}

	${PREFIX} ._tablePagination span{
		font-family: Inter;
        font-size: 14px;
        font-weight: 500;
		color:#333333;
        line-height: 19.07px;
        text-align: left;

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
