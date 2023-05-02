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
			position: relative;
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
			border-bottom: 1px solid #eee;
		}

		${PREFIX} ._topBarGrid._previewMode{
			height: 0px;
		}

		${PREFIX} ._sideBar {
			width: 48px;
			background-color: #fff;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 10px;
			border-right: 1px solid #eee;
		}

		${PREFIX} ._sideBar._previewMode {
			width: 0px;
		}
		
		${PREFIX} ._propBar {
			display: flex;
			background-color: #fff;
			flex-direction: column;
			align-items: center;
			width: 0px;
			transition: width 1s;
		}

		${PREFIX} ._propBar._propBarVisible{
			display: flex;
			width: 300px;
			border-left: 1px solid #eee;
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

		${PREFIX} select._peSelect {
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

		${PREFIX} input._peInput, ${PREFIX} ._pvExpressionEditor {
			color: #555;
			background-color: #eee;
			font-size: 11px;
			padding: 5px 15px;
			border-radius: 2px;
			border: 1px solid #ccc;
		}

		${PREFIX} input._peInput[type='text'], ${PREFIX} ._pvExpressionEditor, ${PREFIX} input._peInput[type='number'] {
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

		${PREFIX} ._pvExpressionEditor ._pathsList{
			z-index: 2;
			background-color: #fff;
			display: flex;
			flex-direction: column;
			border-radius: 4px;
			float: left;
			position: absolute;
			top: 100%;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
		}

		${PREFIX} ._pvExpressionEditor ._pathsList ._path{
			padding: 5px 5px;
			border-radius: 2px;
			cursor: pointer;
		}

		${PREFIX} ._pvExpressionEditor ._pathsList ._path:hover{
			background-color: #eee;
		}

		${PREFIX} ._pvExpressionEditor input._peInput[type='text'],  ${PREFIX} ._pvExpressionEditor input._peInput[type='number']{
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
			transform: translateX(40px);
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
			min-height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
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
			width: 100%;
			min-width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.WIDE_SCREEN iframe{
			width: 100%;
			min-width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.MOBILE_POTRAIT_SCREEN {
			width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('MOBILE_POTRAIT_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.MOBILE_LANDSCAPE_SCREEN {
			width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('MOBILE_LANDSCAPE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.TABLET_POTRAIT_SCREEN{
			width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('TABLET_POTRAIT_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.TABLET_LANDSCAPE_SCREEN{
			width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
			min-width: ${StyleResolutionDefinition.get('TABLET_LANDSCAPE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.DESKTOP_SCREEN{
			width: 100%;
			min-width: ${StyleResolutionDefinition.get('DESKTOP_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe.WIDE_SCREEN{
			width: 100%;
			min-width: ${StyleResolutionDefinition.get('WIDE_SCREEN')?.minWidth}px;
		}

		${PREFIX} ._iframe iframe {
			border: none;
			width: 100%;
			min-height: 100%;
			overflow: hidden;
		}

		${PREFIX} input._urlInput:focus {
			width: 500px;
		}

		${PREFIX} ._dndGridMain {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		${PREFIX} ._selectionBar {
			display: flex;
			background-color: #fff;
    		border-top: 1px solid #eee;
			height: 20px;
		}
		
		${PREFIX} ._selectionBar._previewMode {
			height: 0px;
		}

		${PREFIX} ._selectionBar ._iconMenu {
			min-height: 100%;
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

		${PREFIX} ._iframeContainer._previewMode {
			max-height: 100%;
		}

		${PREFIX} ._iframeHolder {
			flex: 1;
			display: flex;
			overflow: auto;
			position: relative;
		}

		${PREFIX}  ._previewModeCloser {
			position: fixed;
			bottom: 20px;
			left: 50%;
			transform: translateX(-50%);
			cursor: pointer;
			width: 30px;
			height: 30px;
			background-color: #aaa7;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 1.5px solid;
			transition: bottom 0.5s;
		}

		${PREFIX}  ._previewModeCloser:hover {
			bottom: 25px
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
			position: relative;
		}

		${PREFIX} ._eachProp:hover {
			background-color:#eee;
		}

		${PREFIX} ._pvEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._pvEditor input._peInput[type='text'], ${PREFIX} ._pvEditor input._peInput[type='number']  {
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
			flex: 1;
		}

		${PREFIX} ._propLabel {
			color: #555;
			display: flex;
			gap: 5px;
			align-items: center;
			text-transform: capitalize;
		}

		${PREFIX} ._propLabel i.fa {
			cursor: pointer;
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
			align-items: center;
			gap: 10px;
		}

		${PREFIX} ._smallEditorContainer i.fa {
			cursor: pointer;
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
			text-transform: uppercase;
		}

		${PREFIX} ._propertyGroupHeader i.fa {
			transition: transform 0.5s;
			color: #eee;
		}

		${PREFIX} ._propertyGroup._closed i.fa {
			transform: rotate(-90deg);
		}

		${PREFIX} ._multiValueEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._eachProperty {
			display: flex;
			gap: 10px;
			align-items: center;
			border: 2px solid #ddd;
			padding: 5px;
			border-radius: 3px;
			padding-top: 20px;
			position: relative;
		}

		${PREFIX} ._eachProperty i.fa {
			color: #aaa;
			cursor: pointer;
			font-size: 13px;
			position: absolute;
			top: 5px;
			left: 5px;
			background-color: #eee;
			width:14px;
			height: 14px;
			display: inline-flex;
			justify-content: center;
			align-items: center;
			border-radius: 3px;
			font-size: 12px;
		}

		${PREFIX} ._eachProperty i.fa-close {
			left: 24px;
			
		}

		${PREFIX} ._eachProperty:hover i.fa {
			color: inherit;
		}

		${PREFIX} ._eachProperty ._pvEditor {
			flex: 1;
		}

		${PREFIX} ._validationEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
			flex:1;
		}

		${PREFIX} ._codeEditor {
			display: flex;
			visibility: hidden;
			position: absolute;
			width: 100%;
			height: 100%;
			align-items: center;
			z-index: 3;
			opacity: 0;
			transition: opacity 1s;
		}

		${PREFIX} ._codeEditorContent {
			background-color: #fff;
			width: 70vw;
			min-height: 80vh;
			max-height: 80vh;
			margin-left: 5vw;
			display: flex;
			border-radius: 4px;
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
			flex-direction: column;
			opacity: 0;
			transition: margin-left 1s, width 1s, height 1s, min-height 1s, max-height 1s, opacity 1s, visibility 1s;
		}

		${PREFIX} ._codeEditor.show ._codeEditorContent{
			opacity:1;
		}

		${PREFIX} ._codeEditor.show {
			opacity: 1;
			visibility: visible;
		}

		${PREFIX} ._codeEditorContent._fullScreen {
			width: 98vw;
			min-height: 98vh;
			max-height: 98vh;
			margin-left: 1vw;
		}

		${PREFIX} ._codeEditorContent ._codeEditorHeader {
			background-color: #eeea;
			display: flex;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
		}

		${PREFIX} ._codeEditorContent ._codeFunctions {
			flex: 1;
			display: flex;
			gap: 5px;
			padding: 8px;
			align-items: center;
		}

		${PREFIX} ._codeEditorContent ._codeFunctions select._peSelect {
			text-transform: none;
		}

		${PREFIX} ._codeEditorContent ._codeButtons {
			display: flex;
			
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._codeEditorContent ._iconMenu {
			width: 32px;
		} 

		${PREFIX} ._codeEditorContent ._iconMenuSeperator{
			border: 1.5px solid #ccc;
			height: 75%;
			width: 0;
			margin-right: 5px;
			border-radius: 4px;
			margin-left: 5px;
		}

		._popupContainer ._progressBar {
			flex: 1;
			text-align: center;
			padding-top: 150px;
		}

		._popupContainer ._progressBar i.fa {
			font-size: 50px;
		}

		._popupContainer ._jsonEditorContainer{
			border: 1px solid #eee;
			border-radius: 4px;
			padding: 2px;
			width:400px;
			height: 400px;
			transition: width 0s, height 0s;
		}

		._popupContainer ._jsonEditorContainer > * {
			transition: width 0s, height 0s;
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
			word-break: break-all;
			position: relative;
		}

		._popupContainer ._iconSelectionDisplay ._eachIcon:hover {
			background-color: #ddd;
		}

		._popupContainer ._pathParts {
			display: flex;
			flex-direction: row;
			gap: 5px;
			flex:1;
		}

		._popupContainer ._pathContainer {
			display: flex;
			gap: 10px;
		}

		._popupContainer ._pathContainer i.fa {
			cursor: pointer;
		}

		._popupContainer ._eachIcon input{
			font-size: 11px;
			border: none;
			width: 80px;
			background-color: #eee;
			padding:0px 5px;
		}

		._popupContainer ._eachIcon ._deleteButton {
			position: absolute;
			display: none;
			right: 5px;
			top: 5px;
		}
		._popupContainer ._eachIcon:hover ._deleteButton {
			display: block;
		}

		._popupContainer ._pathParts span {
			padding: 0px 5px;
		}

		._popupContainer ._eachIcon._upload {
			border: 2px dashed #ccc;
		}

		._popupContainer ._eachIcon input._peInput[type="file"] {
			position: absolute;
			opacity: 0;
			width: 100%;
    		height: 100%;
			cursor: pointer;
		}

		._popupContainer ._image {
			width: 48px;
			height: 48px;
			background-repeat: no-repeat;
			background-size: contain;
			background-position: center center;
		}

		._popupContainer ._pathParts span._clickable {
			cursor: pointer;
			border-radius: 3px;
		}

		._popupContainer ._pathParts span._clickable:hover {
			color: #000;
			background-color: #eee;
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

		${PREFIX}._dark button, ${PREFIX}._dark select._peSelect, ${PREFIX}._dark input._peInput[type='text'],
		${PREFIX}._dark ._pvExpressionEditor, ._popupBackground._dark button,
		${PREFIX}._dark input._peInput[type='number'] {
			color: #aaa;
			background-color: #222;
			border: 1px solid #333;
		}

		${PREFIX}._dark ._pvExpressionEditor input._peInput {
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

		${PREFIX}._dark ._eachProperty:hover i.fa {
			color: #777;
		}

		${PREFIX}._dark ._eachProperty{
			border:  2px solid #333;
		}
		
		${PREFIX}._dark ._codeEditorContent ._codeEditorHeader {
			background-color: #666;
		}

		${PREFIX}._dark ._eachProperty i.fa {
			background-color: #333;
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
