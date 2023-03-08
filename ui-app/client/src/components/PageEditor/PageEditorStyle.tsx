import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './pageEditorStyleProperties';

const PREFIX = '.comp.compPageEditor';
export default function GridStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: flex;
			width: 100%;
			height: 100%;
			flex-direction: column;
			overflow: hidden;
		}

		${PREFIX} ._dndGrid {
			display: flex;
			flex:1;
			background-color: #eee;
		}

		${PREFIX} ._topBarGrid {
			display: flex;
			height: 48px;
			background-color: #fff;
		}

		${PREFIX} ._sideBar {
			width: 48px;
			background-color: #fff;
		}

		${PREFIX} ._topLeftBarGrid {
			flex: 1;
			gap: 10px;
			display: flex;
			flex-direction: row;
			align-items: center;
			padding-left: 10px;
		}

		${PREFIX} ._logo {
			height: 30px;
			width: 30px;
		}

		${PREFIX} ._topRightBarGrid {
			display: flex;
			align-items: center;
			padding-right: 10px;
			gap: 10px;
		}

		${PREFIX} select {
			height: 25px;
			font-size: 11px;
			padding: 5px;
			border-radius: 2px;
			border: 1px solid #ccc;
			color: #555;
			background-color: #eee;
			text-transform: uppercase;
			outline: none;
			cursor: pointer;
		}

		${PREFIX} button {
			color: #555;
			background-color: #eee;
			text-transform: uppercase;
			font-size: 11px;
			padding: 5px 15px;
			cursor: pointer;
			border-radius: 2px;
			border: 1px solid #ccc;
		}

		${PREFIX} input {
			color: #555;
			background-color: #eee;
			font-size: 11px;
			padding: 5px 15px;
			border-radius: 2px;
			border: 1px solid #ccc;
		}

		${PREFIX} button:hover {
			background-color: #555;
    		color: #eee;
		}

		/* Dark theme values  */
		${PREFIX}._dark ._dndGrid{
			background-color: #000;
		}

		${PREFIX}._dark ._topBarGrid {
			background-color: #555;
		}
		
		${PREFIX}._dark ._sideBar {
			background-color:#555;
		}

		${PREFIX}._dark button, ${PREFIX}._dark select {
			color: #aaa;
			background-color: #222;
			border: 1px solid #333;
		}

		${PREFIX}._dark button:hover, ${PREFIX}._dark select:hover {
			background-color: #aaa;
    		color: #222;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageEditorCss">{css}</style>;
}
