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
		}

		${PREFIX} ._bodyDesigner._moving {
			cursor: grabbing;
		}

		${PREFIX} ._bodyDesigner {
			position: absolute;
			width: 3000px;
			height: 3000px;
			background-color: #fff;
			background-size: 20px 20px;
			background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 0px),
			linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0px);
		}

		${PREFIX} ._body {
			flex: 1;
			overflow: auto;
			position: relative;
		}

		${PREFIX} ._selector {
			fill: #d0a17966;
			stroke-width: 1;
			stroke: #d0a179;
		}

		${PREFIX} ._statement rect._box,
		${PREFIX} ._statement rect._selectBox {
			width: 46px;
			height: 46px;
			border-radius: 10px;
			stroke-width: 2px;
			fill: #ffffff70;
			cursor: pointer;
			stroke: #a85b37;
			transform: translate(-23px, -23px);
		}

		${PREFIX} ._statement rect._selectBox {
			width: 36px;
			height: 36px;
			transform: translate(-18px, -18px);
			pointer-events: none;
			stroke-dasharray: 28 21 18 0;
		}

		${PREFIX} ._inPort,
		${PREFIX} ._outPort,
		${PREFIX} ._childPort {
			fill: #fff;
			stroke: #a85b37;
			stroke-width: 2px;
			cursor: pointer;
		}

		${PREFIX} ._childPort {
			stroke: #c5734d;
		}

		${PREFIX} ._connector {
			stroke: #a85b37;
			stroke-width: 2px;
			cursor: pointer;
			fill: none;
		}

		${PREFIX} ._connector:hover,
		${PREFIX} ._connector._selected {
			stroke-width: 4px;
		}

		${PREFIX} ._connectorEnd {
			fill: #a85b37;
		}

		${PREFIX} ._inPort:hover,
		${PREFIX} ._outPort:hover,
		${PREFIX} ._childPort:hover {
			stroke-width: 4px;
		}

		${PREFIX} ._statement rect._box:hover {
			stroke-width: 5px;
		}

		${PREFIX} ._statement text._nodeTitle {
			text-anchor: middle;
			transform: translate(0px, -36px);
			fill: #555;
			font-size: 13px;
			cursor: pointer;
			pointer-events: none;
		}

		${PREFIX} ._statement rect._titleBack {
			width: 70px;
			height: 20px;
			border-radius: 10px;
			fill: #eee;
			transform: translate(-35px, -51px);
			cursor: pointer;
		}

		${PREFIX} ._statement._selected rect {
			stroke-dasharray: 3 3;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="KIRUNEditorCss">{css}</style>;
}
