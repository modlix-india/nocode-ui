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
			height: 100%;
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
			align-items: center;
			padding-top: 10px;
		}
		
		${PREFIX} ._propBar {
			display: flex;
			background-color: #fff;
			flex-direction: column;
			align-items: center;
			padding-top: 10px;
			width: 0px;
			transition: width 1s;
		}

		${PREFIX} ._propBar._propBarVisible{
			display: flex;
			width: 300px;
		}

		${PREFIX} ._sideBar ._top {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
    		gap: 10px;
			padding-top: 15px;
		}

		${PREFIX} ._sideBar ._top i.fa {
			font-size: 22px;
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

		${PREFIX} button, ._popupButtons button {
			color: #555;
			background-color: #eee;
			text-transform: uppercase;
			font-size: 11px;
			padding: 5px 15px;
			cursor: pointer;
			border-radius: 2px;
			border: 1px solid #ccc;
		}

		${PREFIX} input, ${PREFIX} ._pvExpressionEditor {
			color: #555;
			background-color: #eee;
			font-size: 11px;
			padding: 5px 15px;
			border-radius: 2px;
			border: 1px solid #ccc;
		}

		${PREFIX} input[type='text'], ${PREFIX} ._pvExpressionEditor{
			height: 25px;
			font-size: 12px;
			border-radius: 12px;
			padding-left: 8px;
			flex: 1;
			outline: none;
		}

		${PREFIX} ._pvExpressionEditor {
			padding-top: 0px;
			padding-bottom: 0px;
			border-radius: 2px;
			display: flex;
			align-items: center;
			padding-right: 8px;
			gap: 5px;
		}

		${PREFIX} ._pvExpressionEditor input[type='text'] {
			border: none;
			background-color: transparent;
			flex: 1;
			padding: 5px 5px 5px 0;
		}

		${PREFIX} ._pvExpressionEditor i.fa {
			cursor: pointer;
		}

		${PREFIX} ._urlInput {
			position: absolute;
			width: 200px;
			left: 22px;
			z-index: 1;
		}
		

		${PREFIX} button:hover, ${PREFIX} select:hover, ${PREFIX} ._iconMenuOption:hover,
		._popupMenuBackground ._popupMenuItem:hover, ._popupMenuBackground ._popupMenuItem.active,
		._popupButtons button:hover {
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

		${PREFIX} ._iconMenuOption, ._popupMenuBackground ._popupMenuItem  {
			padding: 5px 10px;
			color: #555;
			display: flex;
			align-items: center;
			gap: 8px;
			white-space: nowrap;
			cursor: pointer;
		}

		${PREFIX} ._iconMenuBody{
			position: absolute;
			background-color: #fff;
			font-size: 12px;
			box-shadow: 2px 2px 5px #ccc;
			display: none;
			border-radius: 2px;
			z-index: 1;
		}

		${PREFIX} ._iconMenuBody._clickable {
			display: none;
		}

		${PREFIX} ._iconMenuBody._top{
			bottom: 100%;
		}

		${PREFIX} ._iconMenuBody._right{
			right: 0px;
		}

		${PREFIX} ._iconMenu{
			cursor: pointer;
			position: relative;
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

		${PREFIX} ._dndGridMain {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._selectionBar {
			display: flex;
			background-color: #fff;
    		border-left: 1px solid #ccc;
			height: 20px;
		}

		${PREFIX} ._eachSelectionBar {
			font-size: 11px;
			padding: 3px 14px;
			display: flex;
    		align-items: center;
			position: relative;
			cursor: pointer;
			user-select: none;
			display: flex;
			gap: 8px;
			align-items: center;
		}
		
		${PREFIX} ._eachSelectionBar::before {
			content: ' ';
			width: 16px;
			height: 16px;
			position: absolute;
			border: 2px solid #aaa;
			border-left: none;
			border-top: none;
			transform: rotate(-45deg);
			right: 0px;
			border-radius: 2px;
		}

		${PREFIX} ._eachSelectionBar i.fa, ${PREFIX} ._iconMenuBody i.fa {
			font-size: 11px;
			width: 10px;
		}

		${PREFIX} ._iframeContainer {
			display: flex;
    		flex: 1;
			max-height: calc(100% - 48px - 20px);
		}

		${PREFIX} ._tabBar {
			width: 100%;
			display: flex;
			background-color: #eee5;
		}

		${PREFIX} ._tabBar i.fa {
			padding: 10px 6px 10px 6px;
			cursor: pointer;
			width: 38px;
			text-align: center;
		}

		${PREFIX} ._tabBar i.fa.active{
			background-color: #fff;
		}

		${PREFIX} ._propContainer {
			width: 100%;
			padding: 5px;
			flex: 1;
			overflow: auto;
		}

		${PREFIX} ._propertyEditor{
			gap: 10px;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._eachProp {
			font-size: 12px;
			padding: 5px;
			display: flex;
			flex-direction: column;
			gap: 5px;
			border-radius: 4px;
		}

		${PREFIX} ._eachProp:hover {
			background-color:#eee;
		}

		${PREFIX} ._pvEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._pvEditor input[type='text'] {
			border-radius: 2px;
		}

		${PREFIX} ._pvEditor ._microToggle {
			width: 20px;
			background-color: #eee;
			height: 10px;
			border-radius: 2px;
			position: relative;
			border: 1px solid #ddd;
			cursor: pointer;
			transition: left 0.5s, background-color 0.5s;
		}

		${PREFIX} ._pvEditor ._microToggle::before {
			position: absolute;
			float: left;
			left: -10%;
			top: -25%;
			border-radius: 2px;
			content: '';
			width: 65%;
			height: 150%;
			background-color: #ccc;
			transition: left 0.5s, background-color 0.5s;
			font-size: 9px;
			text-align: center;
			font-weight: bold;
			padding: 0px 2px;
			text-align: center;
		}

		${PREFIX} ._pvEditor ._microToggle._on {
			background-color: #aaa;
		}

		${PREFIX} ._pvEditor ._microToggle._on::before {
			left: 50%;
			background-color: #777;
			color: #eee;
		}

		${PREFIX} ._pvValueEditor {
			display: flex;
			gap: 5px;
		}

		${PREFIX} ._propLabel {
			color: #555;
			display: flex;
			gap: 5px;
			align-items: center;
		}

		${PREFIX} span._description {
			font-weight: bold;
			font-size: 9px;
			border-radius: 50%;
			width: 12px;
			background-color: #eee;
			height: 12px;
			display: inline-flex;
			justify-content: center;
			align-items: center;
			color: #aaa;
			border: 1px solid;
			cursor: pointer;
		}

		${PREFIX} span._description:hover::after {
			content: attr(title);
			float: left;
			min-width: 50px;
			z-index: 9;
			position: absolute;
			font-size: 11px;
			font-weight: normal;
			width: 150px;
			padding: 5px;
			background-color: #fffe;
			border-radius: 4px;
			border: 1px solid #eee;
			color: #777;
			margin-top: 10px;
		}
		
		${PREFIX} ._pvExpressionEditor {
			display: flex;
		}

		${PREFIX} ._pillTag {
			border: 1px solid;
			padding: 2px 7px;
			border-radius: 10px;
			background-color: #fff;
			font-size: 10px;
			cursor: pointer;
		}

		${PREFIX} i._pillTag.fa {
			font-size: 10px;
		}

		${PREFIX} ._iconSelectionEditor {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._iconSelectionButtons {
			display: flex;
			flex-direction: row;
			gap: 10px;
			align-items: center;
			flex-wrap: wrap;
		}

		${PREFIX} ._iconSelectionButton {
			background-color: #fff;
			padding: 5px;
			border-radius: 2px;
			border: 1px solid #eee;
			cursor: pointer;
			width: 24px;
			text-align: center;
			height: 24px;
		}

		${PREFIX} ._iconSelectionButton.active {
			background-color: #eee;
		}

		${PREFIX} ._smallEditorContainer {
			display: flex;
			flex: 1;
		}

		${PREFIX} ._propertyGroup {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._propertyGroupHeader {
			font-size: 13px;
			font-weight: bold;
			background-color: #ccc;
			color: #888;
			padding: 3px;
			cursor: pointer;
			border-radius: 3px;
			display: flex;
			align-items: center;
			gap: 5px;
			padding-left: 5px;
		}

		${PREFIX} ._propertyGroupHeader i.fa {
			transition: transform 0.5s;
			color: #eee;
		}

		${PREFIX} ._propertyGroup._closed i.fa {
			transform: rotate(-90deg);
		}

		._popupContainer ._jsonEditorContainer{
			border: 1px solid #eee;
			border-radius: 4px;
			padding: 2px;
			width:400px;
			height: 400px;
		}

		._popupContainer ._iconSelectionBrowser {
			height: 450px;
			width: 540px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		._popupContainer ._iconSelectionDisplay {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			overflow: auto;
		}
		
		._popupContainer ._iconSelectionDisplay ._eachIcon {
			width: 90px;
			height: 90px;
			display: flex;
			flex-direction: column;
			font-size: 11px;
			cursor: pointer;
			align-items: center;
			padding: 5px;
			border-radius: 5px;
			background-color: #fafafa;
			justify-content: center;
			gap: 15px;
			text-align: center;
		}

		._popupMenuBackground, ._popupBackground {
			position: absolute;
			left: 0px;
			top: 0px;
			width: 100vw;
			height: 100vh;
			z-index: 3;
		}

		._popupBackground {
			background: #0004;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		._popupBackground ._popupContainer {
			background-color: #fff;
			padding: 15px;
			border-radius: 3px;
			max-width: 60vw;
			display: flex;
			flex-direction: column;
			gap: 15px;
		}

		._popupBackground ._popupButtons {
			display: flex;
			gap: 10px;
			justify-content: end;
		}

		._popupMenuBackground ._popupMenuContainer {
			box-shadow: 2px 2px 5px #ccc;
			display: flex;
			background-color: #fff;
			position: absolute;
			border-radius: 3px;
			border-left: 1px solid #eee;
			font-size: 13px;
		}

		._compMenu {
			left: 48px;
			top: 65px;
			max-height: 85vh;
			min-height: 50vh;
			min-width: 100px;
			padding-bottom: 10px;
		}

		._popupMenuBackground ._popupMenu {
			border-top: 4px solid #aaa;
			
			display: flex;
			flex-direction: column;
			overflow: auto;
		}

		._popupMenuBackground ._popupMenuSeperator {
			height: 0px;
			border: 1px solid #aaa;
			margin: 1px;
		}

		._popupMenuBackground ._popupMenuItem {
			border-radius: 2px;
		}

		
		/* Dark theme values  */
		${PREFIX}._dark ._dndGrid{
			background-color: #000;
		}
		
		${PREFIX}._dark ._iconMenuBody{
			box-shadow: 2px 2px 5px #555;
		}
		
		${PREFIX}._dark ._sideBar, ${PREFIX}._dark ._iconMenuBody,
		${PREFIX}._dark ._topBarGrid, ._popupBackground._dark ._popupContainer,
		${PREFIX}._dark ._selectionBar, ${PREFIX}._dark ._propBar,${PREFIX}._dark ._tabBar i.fa.active
		._popupMenuBackground._dark ._popupMenu, ${PREFIX}._dark ._tabBar i.fa.active {
			background-color:#555;
		}

		${PREFIX}._dark button, ${PREFIX}._dark select, ${PREFIX}._dark input[type='text'],
		${PREFIX}._dark ._pvExpressionEditor, ._popupBackground._dark button {
			color: #aaa;
			background-color: #222;
			border: 1px solid #333;
		}

		${PREFIX}._dark ._pvExpressionEditor input {
			border: none;
		}

		${PREFIX}._dark i.fa {
			color: #aaa;
		}

		${PREFIX}._dark button:hover, ${PREFIX}._dark select:hover,  ${PREFIX}._dark ._iconMenuOption:hover,
		._popupMenuBackground._dark ._popupMenuItem:hover, ._popupMenuBackground._dark ._popupMenuItem.active,
		._popupBackground._dark button:hover {
			background-color: #aaa;
    		color: #222;
		}
		${PREFIX}._dark ._iconMenu:hover i.fa, ${PREFIX}._dark ._buttonBar i.fa {
			color: #222;
		}

		${PREFIX}._dark ._propLabel {
			color: #bbb;
		}

		${PREFIX}._dark ._buttonBar i.fa.active, ${PREFIX}._dark ._buttonBar i.fa:hover,
		${PREFIX}._dark ._eachSelectionBar, ._popupBackground._dark{
			color: #aaa;
		}

		${PREFIX}._dark ._iconMenuOption, ._popupMenuBackground._dark ._popupMenuItem {
			color: #000;
		}

		${PREFIX}._dark ._selectionBar {
    		border-left: 1px solid #aaa;
		}

		${PREFIX}._dark ._pvEditor ._microToggle::before {
			background-color: #333;
			color: #777;
		}

		${PREFIX}._dark ._eachProp:hover {
			background-color:#444a;
		}
		
		${PREFIX}._dark ._pvEditor ._microToggle {
			background-color: #444;
			border-color: #333;
		}

		${PREFIX}._dark ._pvEditor ._microToggle._on::before {
			background-color: #222;
			color: #777;
		}

		${PREFIX}._dark ._pvEditor ._microToggle._on {
			background-color: #888;
			border-color: #777;
		}

		${PREFIX}._dark span._description {
			background-color: #444;
			color: #777;
		}
		
		${PREFIX}._dark span._description:hover::after {
			background-color: #555b;
			color: #bbb;
			border-color: #777;
		}

		${PREFIX}._dark ._pillTag {
			background-color: #555;
			color: #000;
		}

		${PREFIX}._dark ._iconSelectionEditor { 
			color: #bbb;
		}

		${PREFIX}._dark ._iconSelectionButton {
			background-color: #555;
			color: #000;
			border: 1px solid transparent;
		}

		${PREFIX}._dark ._iconSelectionButton.active {
			background-color: #333;
		}

		${PREFIX}._dark ._propertyGroupHeader {
			background-color: #444c;
			color: #222;
		}
		${PREFIX}._dark ._propertyGroupHeader i.fa {
			color: #222;
		}

		._popupMenuBackground._dark ._popupMenuContainer  {
			border-color: #444;
			box-shadow: 2px 2px 5px #555;
		}
		
		._popupMenuBackground._dark ._popupMenu {
			border-color: #aaa;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageEditorCss">{css}</style>;
}
