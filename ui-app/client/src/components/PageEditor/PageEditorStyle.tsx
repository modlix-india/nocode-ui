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
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._sideBar ._top {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
    		gap: 10px;
		}

		${PREFIX} ._sideBar ._bottom {
			display: flex;
			flex-direction: column;
			padding-bottom: 30px;
			align-items: center;
    		gap: 10px;
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

		${PREFIX} input[type='text'] {
			height: 25px;
			font-size: 12px;
			border-radius: 12px;
			padding-left: 8px;
			flex: 1;
		}

		${PREFIX} ._urlInput {
			position: absolute;
			width: 200px;
			left: 22px;
			z-index: 1;
		}

		${PREFIX} button:hover, ${PREFIX} select:hover, ${PREFIX} ._iconMenuOption:hover {
			background-color: #555;
    		color: #eee;
		}

		${PREFIX} i.fa {
			color: #555;
			font-size: 18px;
		}

		${PREFIX} ._iconMenu:hover i.fa {
			color: #aaa;
		}

		${PREFIX} ._iconMenuOption {
			padding: 5px 10px;
			color: #555;
		}

		${PREFIX} ._iconMenuBody{
			position: absolute;
			background-color: #fff;
			font-size: 12px;
			box-shadow: 2px 2px 5px #ccc;
			display: none;
		}

		${PREFIX} ._iconMenu{
			cursor: pointer;
		}

		${PREFIX} ._iconMenu:hover ._iconMenuBody{
			display: block;
		}

		${PREFIX} ._buttonBar{
			height: 50px;
			display: flex;
			align-items: center;
			position: relative;
		}

		${PREFIX} ._buttonBar._lightBackground {
			background-color: #eee5;
    		padding: 0px 10px;	
		}

		${PREFIX} ._buttonBar i.fa{
			color: #aaa;
			padding: 7px;
			cursor: pointer;
		}

		${PREFIX} ._buttonBar i.fa.active, ${PREFIX} ._buttonBar i.fa:hover{
			color: #555;
		}

		${PREFIX} i._rotate-before-270::before {
			transform: rotate(270deg);
			display: block;
		}

		${PREFIX} ._buttonBarText {
			position: absolute;
			font-size: 11px;
			width: 100%;
			left: 0;
			bottom: 0;
			text-align: center;
		}

		${PREFIX} ._inputBar {
			display: flex;
			gap: 10px;
			align-items: center;
			position: relative;
			min-width: 220px;
		}

		${PREFIX} ._iframe {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: auto;
		}

		${PREFIX} ._iframe.MOBILE_POTRAIT_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.MOBILE_LANDSCAPE_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.TABLET_POTRAIT_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.TABLET_LANDSCAPE_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.DESKTOP_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.WIDE_SCREEN iframe{
			width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
		}
		

		${PREFIX} ._iframe iframe {
			border: none;
		}

		${PREFIX} input._urlInput:focus {
			width: 500px;
		}

		/* Dark theme values  */
		${PREFIX}._dark ._dndGrid{
			background-color: #000;
		}

		${PREFIX}._dark ._topBarGrid {
			background-color: #555;
		}

		${PREFIX}._dark ._iconMenuBody{
			background-color: #555;
			box-shadow: 2px 2px 5px #555
		}
		
		${PREFIX}._dark ._sideBar {
			background-color:#555;
		}

		${PREFIX}._dark button, ${PREFIX}._dark select, ${PREFIX}._dark input[type='text'] {
			color: #aaa;
			background-color: #222;
			border: 1px solid #333;
		}

		${PREFIX}._dark i.fa {
			color: #aaa;
		}

		${PREFIX}._dark button:hover, ${PREFIX}._dark select:hover,  ${PREFIX}._dark ._iconMenuOption:hover {
			background-color: #aaa;
    		color: #222;
		}

		${PREFIX}._dark ._iconMenu:hover i.fa {
			color: #222;
		}

		${PREFIX}._dark ._buttonBar i.fa{
			color: #222;
		}

		${PREFIX}._dark ._buttonBar i.fa.active, ${PREFIX}._dark ._buttonBar i.fa:hover{
			color: #aaa;
		}

		${PREFIX}._dark ._iconMenuOption {
			color: #000;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageEditorCss">{css}</style>;
}
