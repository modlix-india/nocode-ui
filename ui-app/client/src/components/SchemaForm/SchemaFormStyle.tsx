import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaFormStyleProperies';

const PREFIX = '.comp.compSchemaForm';
export default function SchemaFormStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} { display: flex; flex-direction: column; gap: 5px;}
		${PREFIX} ._singleSchema { display: flex; flex-direction: column; gap: 5px;}
		
		${PREFIX} ._singleSchema input[type="text"],
		${PREFIX} ._singleSchema input[type="number"] {
			color: #555;
			border-radius: 4px;
			font-size: 13px;
			font-family: inherit;
			border: none;
			background-color: #0000000a;
			width: 100%;
			padding: 5px 5px;
		}

		${PREFIX} ._singleSchema input:focus {
			outline: #cccccc solid 1px;
		}

		${PREFIX} ._singleSchema ._errorMessages {
			color: #ff2b2b;
			font-size: 11px;
		}

		${PREFIX} ._singleSchema ._inputElement{
			display: flex;
			align-items: center;
			gap: 10px;
		}
		${PREFIX} ._selectDiv{
			display: flex;
			
		}
		${PREFIX} ._select{
			margin-left:5px;
		}
		${PREFIX} ._typelabel{
			
		}
		${PREFIX} .monacoEditor { flex:1; height: 100%; width: 100%; transition: width 0s, height 0s; }

		${PREFIX} > * { transition: width 0s, height 0s;}
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaFormCss">{css}</style>;
}
