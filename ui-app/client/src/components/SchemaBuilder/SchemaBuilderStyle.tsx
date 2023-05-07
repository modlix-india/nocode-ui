import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './schemaBuilderStyleProperies';

const PREFIX = '.comp.compSchemaBuilder';
export default function SchemaBuilderStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`

	${PREFIX} ._leftJustify {
		justify-self: left;
	}	
	
	${PREFIX} ._leftJustify:hover > ._helptext {
		display: inline;
	}

	${PREFIX} ._rightJustify {
		justify-self: right;
	}	

	${PREFIX} ._leftJustify,
	${PREFIX} ._rightJustify {
		border-bottom: 1px solid #eee;
		border-right: 1px solid #eee;
		padding: 5px;
		width: 100%;
	}
	
	${PREFIX} ._helptext {
		font-size: 12px;
		color: #ccc;
		display: none;
	}

	${PREFIX} ._flexRow {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}

	${PREFIX} ._array {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	${PREFIX} ._eachValue {
		margin: 5px;
		border-bottom: 1px solid #eee;
	}

	${PREFIX} ._eachUpDown {
		display: flex;
		gap: 8px;
		padding: 3px;
		align-items: center;
	}

	${PREFIX} ._eachUpDown i.fa {
		width: 20px;
		height: 20px;
		border-radius: 3px;
		padding: 2px;
		background-color: #eee;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	${PREFIX} ._eachUpDown i.fa:hover {
		background-color: #ddd;
	}

	${PREFIX} ._eachUpDown > ._leftJustify {
		border: none;
	}

	${PREFIX} ._object > ._leftJustify,
	${PREFIX} ._object > ._rightJustify {
		border: none;
	}

	${PREFIX} select,
	${PREFIX} input[type="text"],
	${PREFIX} input[type="number"],
	${PREFIX} textarea {
		border: 1px solid #ccc;
		background-color: #eee;
		font-family: inherit;
		font-size: 12px;
		border-radius: 3px;
		padding: 2px 5px;
		width: 200px;
	}

	${PREFIX} textarea {
		width:	300px;
		height: 100px;
	}

	${PREFIX} ._error {
		color: #ff2b2b;
		font-size: 12px;
	}

	${PREFIX} ._singleSchema,
	${PREFIX} ._object {
		display: grid;
		grid-template-columns: auto 1fr;
		font-size: 14px;
		border-top: 1px solid #eee;
		border-left: 1px solid #eee;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SchemaBuilderCss">{css}</style>;
}
