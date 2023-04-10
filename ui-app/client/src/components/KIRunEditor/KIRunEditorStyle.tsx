import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './KIRunEditorStyleProperties';

const PREFIX = '.comp.compKIRunEditor';
export default function KIRunEditorStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			flex: 1;
			border: 1px solid #eee;
			display: flex;
			flex-direction: column;
			overflow: auto;
		}

		${PREFIX} ._designer {
			position: relative;
			min-width: 3000px;
			min-height: 3000px;
			background-color: #fff;
			background-size: 20px 20px;
			background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 0px),
				linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0px);
		}

		${PREFIX} ._designer._moving {
			cursor: grab;
		}

		${PREFIX} ._selectionBox {
			opacity: 0.5;
			background-color: #679AE6;
			border: 2px solid #4578C4;
			position: absolute;
			transition: none;
		}

		${PREFIX} ._statement {
			position: absolute;
			background-color: #fff;
			border: 2px solid #eee;
			border-radius: 4px;
			display: flex;
			gap: 5px;
			flex-direction: column;
			font-size: 11px;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			padding: 2px;
		}

		${PREFIX} ._statement._selected {
			border: 2px solid #679AE6;
		}

		${PREFIX} ._statement ._icon {
			width: 32px;
			height: 32px;
			background-color: #679AE6;
			color: #fff;
			border-radius: 2px;
			border-top-left-radius: 4px;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._statement ._statementName {
			flex: 1;
		}

		${PREFIX} ._editIcon {
			font-size: 12px !important;
			margin-right: 5px;
			cursor: pointer;
			visibility: hidden;
		}

		${PREFIX} ._statement:hover ._editIcon {
			visibility: visible;
		}

		${PREFIX} ._statement ._nameContainer {
			display: flex;
			gap: 6px;
			align-items: center;
			background-color: #eee;
			min-width: 200px;
			border-radius: 2px;
			cursor: move;
		}

		${PREFIX} ._statement ._otherContainer { 
			padding: 5px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="KIRUNEditorCss">{css}</style>;
}
