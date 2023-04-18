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

		${PREFIX} ._header {
			min-height: 36px;
			background-color: #eee;
			width: 100%;
			display: flex;
			align-items: center;
		}

		${PREFIX} ._header i.fa {
			color: #777;
			font-size: 14px;
			padding: 5px;
			background-color: #ccc;
			border-radius: 3px;
			cursor: pointer;
			transition: all 0.4s;	
		}

		${PREFIX} ._header i.fa:hover {
			color: #ccc;
			background-color: #777;
		}

		${PREFIX} ._header ._separator {
			height: 18px;
			border-radius: 2px;
			width: 2px;
			background-color: #aaa;
			margin-left: 4px;
			margin-right: 4px;
		}

		${PREFIX} ._header ._left {
			display: flex;
			gap: 5px;
			padding: 5px;
			flex: 1;
			align-items: center;
		}

		${PREFIX} ._header ._right {
			display: flex;
			gap: 5px;
			padding: 5px;
			justify-content: flex-end;
		}

		${PREFIX} ._container {
			flex: 1;
			overflow: auto;
			width: 100%;
			height: 100%;
			background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 0px),
				linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 0px);
			background-size: 20px 20px;
			background-color: #fff;
		}

		${PREFIX} ._designer {
			position: relative;
			min-width: 3000px;
			min-height: 3000px;
			outline: none;
			transform-origin: left top;
			transition: transform 1s ease-in;
			overflow: hidden;
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
			z-index: 4;
		}

		${PREFIX} ._messages {
			color: #f25332;
			position: absolute;
			float: left;
			top: 100%;
			margin-top: 10px;
			padding: 5px;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._messages ._message {
			background-color: #fffa;
			border-left: 3px solid #f25332;
			padding: 5px;
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
		}

		${PREFIX} ._statementName input[type = "text"] {
			color: #555;
			border-radius: 4px;
			font-size: 13px;
			font-family: inherit;
			border: none;
			background-color: #0000000a;
			width: 160px;
			padding-left: 5px;
			margin-left: -5px;
		}

		${PREFIX} ._statement {
			position: absolute;
			background-color: #fff;
			border: 2px solid #eee;
			border-radius: 4px;
			display: flex;
			flex-direction: column;
			font-size: 13px;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			padding: 2px;
		}

		${PREFIX} ._statement._selected {
			border: 2px solid #679AE6;
		}

		${PREFIX} ._statement ._icon {
			width: 32px;
			height: 32px;
			background-color: inherit;
			color: #fff;
			border-top-right-radius: 2px;
			border-top-left-radius: 4px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		${PREFIX} ._statement ._statementContanier{
			background-color: #f8f8f8;
			display: flex;
			flex-direction: row;
			align-items: center;
			border-top-right-radius: 4px;
    		
		}

		${PREFIX} ._statement ._statementName {
			flex: 1;
			
			height: 33px;
			display: flex;
			align-items: center;
			padding-left: 5px;
			min-width: 160px
		}

		${PREFIX} ._editIcon {
			font-size: 12px !important;
			margin-right: 5px;
			cursor: pointer;
			visibility: hidden;
		}

		${PREFIX} ._nameContainer:hover ._editIcon,
		${PREFIX} ._nameNamespaceContainer:hover ._editIcon {
			visibility: visible;
		}

		${PREFIX} ._statement ._namesContainer {
			border-radius: 4px;
		}

		${PREFIX} ._statement ._nameContainer {
			display: flex;
			
			align-items: center;
			min-width: 200px;
			border-radius: 2px;
			cursor: move;
		}

		${PREFIX} ._nameNamespaceContainer {
			display: flex;
			height: 32px;
			align-items: center;
			padding: 5px;
			color: #fff;
			border-radius: 2px;
			border-top-left-radius: 0px;
		}

		${PREFIX} ._nameNamespaceContainer ._nameNamespace {
			flex: 1;
		}

		${PREFIX} ._nameNamespaceContainer i.fa {
			color: #fff;
		}

		${PREFIX} ._statement ._otherContainer { 
			padding: 5px;
			display: flex;
			flex-direction: row;
			gap: 10px;
		}

		${PREFIX} ._statement ._otherContainer ._eventsContainer,
		${PREFIX} ._statement ._otherContainer ._paramsContainer {
			flex: 1;
		}

		${PREFIX} ._statement ._otherContainer ._eventsContainer {
			display: flex;
			flex-direction: column;
			gap: 15px;
		}

		${PREFIX} ._statement ._param {
			position: relative;
			display: flex;
			align-items: center;
			gap: 5px;
			padding: 3px;
			padding-left: 0px;
		}

		${PREFIX} ._paramsContainer._event ._param{
			flex-direction: row-reverse;
			justify-content: flex-end;
		}

		${PREFIX} ._statement ._paramNode {
			position: absolute;
			left: -14px;
			top: 4px;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: #fff;
			border: 2px solid #fff;
		}

		${PREFIX} ._statement ._param ._paramName {
			flex: 1;
		}

		${PREFIX} ._statement ._paramName._hasValue {
			font-weight: bold;
		}

		${PREFIX} ._statement ._paramsContainer._event ._paramName {
			text-align: right;
		}

		${PREFIX} ._statement ._paramsContainer {
			display: flex;
			flex-direction: column;
			gap: 5px;
			position: relative;
		} 

		${PREFIX} ._statement ._paramsContainer._event ._paramHeader{
			text-align: right;
		}

		${PREFIX} ._statement ._paramNode._eventNode {
			border-width: 3px;
			cursor: pointer;
		}

		${PREFIX} ._statement ._paramsContainer._event ._paramNode {
			cursor: pointer;
		}

		${PREFIX} ._statement ._paramsContainer._event ._paramNode,
		${PREFIX} ._statement ._paramNode._eventNode {
			left: auto;
			right: -14px;
		}

		${PREFIX} ._statement ._paramHeader {
			font-family: monospace;
			font-size: 16px;
			color: #aaa;
		}

		${PREFIX} ._statement ._buttons {
			position: absolute;
			left: 100%;
			display: flex;
			flex-direction: column;
			margin-left: 10px;
			gap: 5px;
		}

		${PREFIX} ._statement ._buttons i.fa {
			color: inherit;
			cursor: pointer;
			background-color: #ffffff;
			border-radius: 4px;
			display: block;
			padding: 4px;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			text-align: center;
			font-size: 14px;
			border: 1px solid transparent;
		}

		${PREFIX} ._statement ._buttons i.fa:hover {
			opacity: 0.8;
			border: 1px solid;
		}

		${PREFIX} ._statement ._dependencyNode:hover,
		${PREFIX} ._statement ._paramNode:hover,
		${PREFIX} ._statement ._paramHeader:hover~._paramNode,
		${PREFIX} ._statement ._paramsContainer._event ._param:hover ._paramNode {
			border-width: 7px;
			margin-left: -1px;
			margin-top: -1px;
		}

		${PREFIX} ._statement ._dependencyNode {
			position: absolute;
			width: 12px;
			height: 12px;
			background-color: #fff;
			border: 2px solid;
			border-radius: 50%;
			top: -8px;
			left: 50%;
		}

		${PREFIX} ._search {
			position: absolute;
			border-radius: 4px;
			padding: 5px;
			margin-left: -5px;
    		margin-top: -12px;
			min-width: 100%;
			z-Index: 3;
		}

		${PREFIX} ._search ._value {
			background: #fff;
			color: #777;
			border-radius: 4px;
			height: 24px;
			display: flex;
			align-items: center;
			padding-left: 5px;
			width: 100%;
		}

		${PREFIX} ._search ._options {
			height: 200px;
			overflow: auto;
			display: flex;
			gap: 3px;
			flex-direction: column;
			padding-top: 5px;
			padding-bottom: 5px;
			margin-top: 5px;
		}

		${PREFIX} ._search ._option {
			padding: 5px;
			cursor: pointer;
		}

		${PREFIX} ._search ._option:hover {
			background-color: #f8f8f833;
			border-radius: 2px;
		}

		${PREFIX} ._linesSvg {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
		}

		${PREFIX} ._linesSvg._overLine {
			pointer-events: none;
			z-index: 4;
		}

		${PREFIX} ._connector {
			fill: transparent;
			stroke-width: 8px;
			stroke-linecap: round;
			transform: translate(6px, 6px);
			opacity: 0.3;
			transition: opacity 0.5s;
			cursor: pointer;
		}

		${PREFIX} ._connector._straight {
			stroke-width: 7px;
		}

		${PREFIX} ._connector:hover,
		${PREFIX} ._connector._selected {
			opacity: 1;
		}

		${PREFIX} ._menu {
			position: absolute;
			padding-top: 5px;
			padding-bottom: 5px;
			background-color: #fff;
			border-radius: 4px;
			border-top-left-radius: 0px;
			border-top-right-radius: 0px;
			border-top: 3px solid #aaa;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			font-size: 13px;
		}

		${PREFIX} ._menu ._menuItem {
			padding: 5px;
			cursor: pointer;
		}

		${PREFIX} ._menu ._menuItem i.fa {
			font-size: 12px;
		}

		${PREFIX} ._menu ._menuItem:hover {
			background-color: #eee;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="KIRUNEditorCss">{css}</style>;
}
