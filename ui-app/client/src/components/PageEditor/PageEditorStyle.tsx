import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './pageEditorStyleProperties';

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
			height: 65px;
			background-color: #fff;
			border-bottom: 1px solid rgba(0, 0, 0, 0.10);
			box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.05);
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
			background-color: #F8FAFB;
			border-right: 1px solid rgba(0, 0, 0, 0.10)
		}

		${PREFIX} ._sideBar._previewMode {
			width: 0px;
		}
		
		._propBar {
			display: flex;
			background-color: #fff;
			flex-direction: column;
			align-items: center;
			width: 0px;
			transition: width 1s;
		}

		._propBar._propBarVisible{
			display: flex;
			width: 300px;
		}

		._propBar._compNavBarVisible{
			display: flex;
			flex-direction: column;
			gap: 10px;
			width: auto;
			min-width: 250px;			
		}

		._propBar._left{
			box-shadow: 0px 3px 4px 0px #00000040;
			border-right: 1px solid rgba(0, 0, 0, 0.10);
		}

		._propBar._right{
			box-shadow: 2px 3px 4px 0px #00000040;
			border-left: 1px solid rgba(0, 0, 0, 0.10);
		}

		._propBar._right._isDrag {
			position: absolute;
		}

		._propBar._right._isDragged {
			opacity: 0.6;
		}

		${PREFIX} ._filterBar {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			padding: 15px 10px;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._filterBar i.fa {
			font-size: 22px;
			cursor: pointer;
			color: #52BD94;
		}

		${PREFIX} ._compsTree {
			display: flex;
			flex-direction: column;
			width: 100%;
			overflow: auto;
		}

		${PREFIX} ._compsTree ._treeNode {
			font-size: 12px;
			font-weight: 400;
			font-family: Inter;
			line-height: 14px;
			cursor: pointer;
			display: flex;
			align-items: center;
			height: 34px;
			flex-shrink: 0;
			margin:	0px 8px;
			border-radius: 4px;
		}

		${PREFIX} ._compsTree ._treeNodeName {
			padding: 3px 5px;
			display: flex;
			align-items: center;
		}

		${PREFIX} ._compsTree ._treeNodeLevel {
			width: 13px;
			height: 100%;
		}

		${PREFIX} ._compsTree ._treeNode._subComponent._selected,
		${PREFIX} ._compsTree ._treeNode._subComponent:hover {
			background-color: transparent;
			color: #52BD94;
		}

		${PREFIX} ._compsTree ._treeNode._subComponent._selected i.fa,
		${PREFIX} ._compsTree ._treeNode._subComponent:hover i.fa {
			color: #52BD94;
		}

		${PREFIX} ._compsTree ._treeNode._selected,
		${PREFIX} ._compsTree ._treeNode:hover {
			background-color: #4C7FEE0D;
			color: #4C7FEE;
		}

		${PREFIX} ._compsTree ._treeNode._selected i.fa,
		${PREFIX} ._compsTree ._treeNode:hover i.fa {
			color: #4C7FEE;
		}

		${PREFIX} ._compsTree:hover ._treeNodeLevel {
			border-right: 0.75px dotted #00000020;
		} 
		${PREFIX} ._compsTree:hover ._treeNode._subComponent:hover ._treeNodeLevel,
		${PREFIX} ._compsTree:hover ._treeNode._subComponent._selected ._treeNodeLevel {
			border-right: 0.75px dotted #00000020;
		}

		${PREFIX} ._compsTree:hover ._treeNode:hover ._treeNodeLevel,
		${PREFIX} ._compsTree:hover ._treeNode._selected ._treeNodeLevel {
			border-right: none;
		} 

		${PREFIX} ._compsTree ._treeNodeLevel._lastOpened {
			border-right: 0.75px dotted #00000020;
		}

		${PREFIX} ._compsTree ._treeNode i.fa {
			font-size: 11px;
			width: 11px;
			height: 11px;
			display: flex;
			justify-content: center;
			margin: 0px 2px;
			color: #CACBCA;
		}

		${PREFIX} ._compsTree ._treeNode ._treeText {
			padding-left: 5px;
		}

		${PREFIX} ._compsTree ._treeNode ._treeText ._filter {
			color: #52BD94;
			font-weight: 600;
		}

		${PREFIX} ._compsTree ._treeNodeName i.fa.fa-caret-right {
			font-size: 10px;
			margin-right: 6px;
		}

		${PREFIX} ._compsTree ._treeNodeName i.fa._nothing {
			margin-right: 6px;
		}

		${PREFIX} ._compsTree ._animateTransform i.fa {
			transition: transform 0.5s;
		}

		${PREFIX} ._compsTree ._treeNode._dragStart ._treeNodeLevel {
			border-right: none;
		}

		${PREFIX} svg._iconHelperSVG {
			width: 16px;
			height: 16px;
			color: #96A1B4;
		}

		${PREFIX} ._compsTree ._treeNode:hover ._iconHelperSVG,
		${PREFIX} ._compsTree ._treeNode._selected ._iconHelperSVG {
			color: #4C7FEE;
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
			padding-left: 15px;
		}

		${PREFIX} ._logo {
			height: 20px;
		}

		${PREFIX} ._topRightBarGrid {
			display: flex;
			align-items: center;
			padding-right: 10px;
			gap: 15px;
		}

		select._peSelect {
			height: 35px;
			font-family: Inter;
			font-size: 12px;
			line-height:12px;
			font-weight: 500;
			padding: 5px 15px;
			border-radius: 6px;
			border: none;
			color: #555;
			background-color: #F8FAFB;
			text-transform: uppercase;
			outline: none;
			cursor: pointer;
			width: 100%;
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

		${PREFIX} ._filterBar input,
		input._peInput, ._pvExpressionEditor,
		textarea._peInput, select._peInput {
			color: #000;
			background-color: #F8FAFB;
			font-family: Inter;
			font-weight: 400;
			font-size: 12px;
			padding: 5px 15px;
			border-radius: 6px;
			border: none;
		}

		${PREFIX} ._filterBar input {
			width: 100%;
			height: 38px;
			border: 0.8px solid #E9ECEF;
			border-radius: 2px;
		}

		textarea._peInput {
			flex: 1;
			height: 132px;
			padding: 8px;
			scroll-bar-width: thin;
			resize: none;
		}

		textarea._peInput::-webkit-scrollbar  {
			width: 2px;
			background: none;
			margin-right: 5px;
		}

		textarea._peInput::-webkit-scrollbar-thumb {
			background-color: #4C7FEE;
		}

		${PREFIX} ._overflowContainer {
			height: calc(100vh - 138px);
			overflow: auto;
		}

		${PREFIX} ._overflowContainer._withCopyButtons {
			height: calc(100vh - 210px);
		}

		${PREFIX} ._withDragProperty {
			height: 45vh;
		}

		${PREFIX} ._addSelector {
			background: #4C7FEE;
			color: #fff;
			border:none;
			border-radius: 6px;
		}

		${PREFIX} ._eachStyleClass ._propLabel i.fa {
			font-size: 14px;
			cursor: pointer;
		}

		${PREFIX} ._eachStyleClass ._propLabel button {
			flex: 1;
		}

		input._peInput[type='text'], ._pvExpressionEditor, input._peInput[type='number'] {
			height: 35px;
			font-size: 12px;
			line-height:12px;
			border-radius: 6px;
			padding-left: 8px;
			outline: none;
			flex:1;
		}

		._pvExpressionEditor {
			padding-top: 0px;
			padding-bottom: 0px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			padding-right: 8px;
			gap: 5px;
		}

		._pvExpressionEditor ._pathsList{
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

		._pvExpressionEditor ._pathsList ._path{
			padding: 5px 5px;
			border-radius: 2px;
			cursor: pointer;
		}

		._pvExpressionEditor ._pathsList ._path:hover{
			background-color: #eee;
		}

		._pvExpressionEditor input._peInput[type='text'],  ._pvExpressionEditor input._peInput[type='number']{
			border: none;
			background-color: transparent;
			flex: 1;
			padding: 5px 5px 5px 0;
		}

		._pvExpressionEditor i.fa {
			cursor: pointer;
		}

		${PREFIX} ._urlInput {
			position: absolute;
			width: 240px;
			left: 22px;
			z-index: 1;
		}

		${PREFIX} ._urlInput._peInput input {
			border: none;
			outline: none;
			height: 100%;
			flex: 1;
			background: #F8FAFB;
			padding-left: 5px;
		}

		${PREFIX} ._urlInput._peInput {
			background: #F8FAFB;
			border-radius: 4px;
			position: static;
			height: 38px;
			display: flex;
    		align-items: center;
			padding: 8px;
			border-radius: 20px;
			border: none;
			gap: 8px;
		}

		${PREFIX} ._urlInput ._urlInputIcon {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		${PREFIX} ._urlInput._peInput svg {
			min-width: 20px;
			cursor: pointer;
		}

		${PREFIX} ._textValueEditorContainer {
			color: #000;
			background-color: #F8FAFB;
			font-family: Inter;
			font-weight: 400;
			padding-top: 0px;
			padding-bottom: 0px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			padding-right: 8px;
			gap: 5px;
			flex:1;
		}

		${PREFIX} ._textValueEditorContainer ._peInput {
			border: none;
			background-color: transparent;
			flex: 1;
		}

		${PREFIX} ._iconMenu._personalize {
			background: #F8FAFB;
			border-radius: 10px;
		}

		${PREFIX} ._iconMenu._arrow i.fa {
			width: 16px;
		}

		${PREFIX} ._iconMenu._arrow span.fa-stack {
			width: 16px;
		}
		${PREFIX} ._iconMenu._arrow span.fa-stack .fa-slash {
			margin-left: -4px;
		}
		

		${PREFIX} button:hover, ${PREFIX} select:hover,
		${PREFIX} ._iconMenuOption:hover,
		._popupButtons button:hover {
			background-color: rgba(77, 127, 238, 0.05);
    		color: #4C7FEE;
		}

		${PREFIX} ._iconMenuBody ._iconMenuOption:hover i.fa,
		${PREFIX} ._iconMenuBody ._iconMenuOption:hover svg._iconHelperSVG,
		${PREFIX} ._sideBar ._iconMenu._active  svg._iconHelperSVG,
		${PREFIX} ._sideBar ._iconMenu:hover  svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu._active svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu:hover svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu._active ._iconMenuOption:hover svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu:hover ._iconMenuOption:hover svg._iconHelperSVG {
			color: #4C7FEE;
		}

		${PREFIX} ._sideBar ._iconMenu  svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu  svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu._active ._iconMenuOption svg._iconHelperSVG,
		${PREFIX} ._topBarGrid ._iconMenu:hover ._iconMenuOption svg._iconHelperSVG {
			color: #96A1B4;
			width: 20px;
			height: 20px;
		}

		${PREFIX} i.fa {
			color: #96A1B4;
			font-size: 18px;
		}

		${PREFIX} ._iconMenu:hover i.fa {
			color: #4C7FEE;
		}

		${PREFIX} ._iconMenu._active i.fa {
			color: #4C7FEE;
		}

		${PREFIX} ._iconMenuOption, ._popupMenuBackground ._popupMenuItem  {
			padding: 10px 15px;
			color: #96A1B4;
			display: flex;
			align-items: center;
			gap: 8px;
			white-space: nowrap;
			cursor: pointer;
			margin-bottom: 2px;
		}

		${PREFIX} ._iconMenuBody ._iconMenuOption i.fa,
		${PREFIX} ._iconMenuBody ._iconMenuOption svg._iconHelperSVG {
			color: #96A1B4;
		}

		${PREFIX} ._iconMenuBody{
			position: absolute;
			background-color: #fff;
			font-size: 12px;
			font-family: Inter;
			box-shadow: 0px 1px 4px 0px #00000026;
			display: none;
			border-radius: 4px;
			z-index: 3;
			transform: translateX(40px);
			font-weight: normal;
			text-transform: initial;
		}

		${PREFIX} ._iconMenuBody._clickable {
			display: none;
		}

		${PREFIX} ._iconMenuBody._top{
			bottom: 100%;
		}

		${PREFIX} ._iconMenuBody._bottom{
			top: 100%;
		}
		${PREFIX} ._iconMenuBody._right{
			right: 100%;
		}

		${PREFIX} ._iconMenu {
			cursor: pointer;
			position: relative;
			min-height: 35px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 5px;
			width: 35px;
		}

		${PREFIX} ._iconMenu:hover ._iconMenuBody{
			display: block;
		}

		${PREFIX} ._iconMenu:hover {
			background-color: rgba(77, 127, 238, 0.05);
			border-radius: 5px
		}

		${PREFIX} ._selectionBar ._iconMenu:hover {
			background-color: transparent;
			color: #4C7FEE;
		}

		${PREFIX} ._iconMenu._active {
			background-color: rgba(77, 127, 238, 0.05);
			border-radius: 5px
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

		${PREFIX} ._buttonBar i.fa,
		${PREFIX} ._buttonBar svg{
		
			padding: 7px;
			cursor: pointer;
			background: #F8FAFB;
			border-radius: 10px;
			width: 32px;
			height: 32px;
			text-align: center;
		}

		${PREFIX} ._buttonBar i.fa:not(:last-child),
		${PREFIX} ._buttonBar svg:not(:last-child) {
			margin-right: 10px;
		}

		${PREFIX} ._buttonBar i.fa.active, ${PREFIX} ._buttonBar i.fa:hover,
		${PREFIX} ._buttonBar svg.active, ${PREFIX} ._buttonBar svg:hover{
			background-color: rgba(77, 127, 238, 0.05);
			color: #4C7FEE;
		}

		${PREFIX} ._buttonBar i.fa._hasNoData {
			color: #8E90A44D;
		}

		${PREFIX} ._screenSizes i.fa,
		${PREFIX} ._screenSizes svg {
			background-color: transparent;
			border-radius: 0;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 3px;
		}
		
		${PREFIX} ._buttonBar._screenSizes i.fa,
		${PREFIX} ._buttonBar._screenSizes svg{
			border-bottom: 3px solid transparent;
		}

		${PREFIX} ._iframeHeader._screenSizes svg {
			margin: 0;
			width: 28px;
			height: 28px;
			background: #0000001a;
			padding: 4px 6px;
			border-top-left-radius: 3px;
			border-bottom-left-radius: 3px;
		}

		${PREFIX} ._propLabel._svgButtons {
			display: flex;
			align-items: center;
			justify-content: flex-start;
		}

		${PREFIX} ._propLabel ._svgButtonsContainer{
			border-radius: 6px;
			display: flex;
			align-items: center;
			flex-direction: row;
		}

		${PREFIX} ._propLabel._svgButtons .svgContainer {
			width: 30px;
			height: 30px;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			background: #F8FAFB;		
		}

		${PREFIX} ._propLabel._svgButtons .svgContainer:last-child {
			border-top-right-radius: 6px;
			border-bottom-right-radius: 6px;
		}

		${PREFIX} ._propLabel._svgButtons .svgContainer:first-child {
			border-top-left-radius: 6px;
			border-bottom-left-radius: 6px;
		}

		${PREFIX} ._propLabel._svgButtons .svgContainer:hover,
		${PREFIX} ._propLabel._svgButtons .svgContainer.active {
			background: #EEF3FA;
		}

		${PREFIX} ._screenSizes svg path,
		${PREFIX} ._propLabel._svgButtons svg path,
		${PREFIX} ._propLabel._svgButtons svg circle,
		${PREFIX} ._propLabel._svgButtons svg rect {
			fill: rgba(150, 161, 180, 0.2);
			stroke: rgba(142, 144, 164, 0.5);
		}

		${PREFIX} ._screenSizes svg.active path,
		${PREFIX} ._propLabel._svgButtons.active svg path,
		${PREFIX} ._propLabel._svgButtons.active svg circle,
		${PREFIX} ._propLabel._svgButtons.active svg rect {
			fill: rgba(150, 161, 180, 1);
			stroke: rgba(142, 144, 164, 1);
		}

		${PREFIX} ._propLabel._svgButtons .svgContainer:hover path,
		${PREFIX} ._propLabel._svgButtons .svgContainer:hover circle,
		${PREFIX} ._propLabel._svgButtons .svgContainer:hover rect,
		${PREFIX} ._propLabel._svgButtons .svgContainer.active path,
		${PREFIX} ._propLabel._svgButtons .svgContainer.active rect,
		${PREFIX} ._propLabel._svgButtons .svgContainer.active circle{
			fill: #3A8BED;
			stroke: #3A8BED;
		}

		${PREFIX} ._scaleControlContainer {
			position: relative;	
			margin-left: -20px;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl {
			display: inline-flex;
			position: sticky;
			left: -20px;
			top: 0;
			background: #FFFFFF;
			margin-bottom: 50px;
			border-radius: 4px;
			padding: 0px 5px;
			box-shadow: 0px 1px 4px 0px #00000012;
			align-items: stretch;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control {
			min-width: 20px;
			display: flex;
			cursor: pointer;
			font-family: Asap;
			font-size: 16px;
			font-weight: 600;
			padding: 8px 5px;
			align-items: center;
			border-radius: 3px;
			border-bottom-left-radius: 0px;
			border-bottom-right-radius: 0px;
			margin: 2px;
			border: none;
			background-color: transparent;
			border-bottom: 2px solid transparent;
			margin-bottom: 0px;
			white-space: nowrap;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control._text {
			user-select: none;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control:hover,
		${PREFIX} ._scaleControlContainer ._scaleControl ._control._active {

			background-color: #F8FAFB;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control._device:hover,
		${PREFIX} ._scaleControlContainer ._scaleControl ._control._device._active {

			border-bottom: 2px solid #4D7FEE;
		}

		._microToggle2 {
			padding: 2px;
			border-radius: 10px;
			background-color: #F8FAFB;
			color: #555;
			position: relative;
			font-weight: 400;
			text-transform: uppercase;
			font-size: 10px;
			letter-spacing: 0.5px;
			transition: all 0.5s;
			height: 10px;
			width: 20px;
			border: 1px solid #888;
			cursor: pointer;
			opacity:0.3;
		}

		._microToggle2._withText {
			height: auto;
			width: auto;
			padding-left: 16px;
			padding-right: 15px;
			color: #333;
			border-radius: 20px;
		}

		._microToggle2::before {
			content: '';
			width: 6px;
			height: 6px;
			position: absolute;
			background-color: #CCC;
			border-radius: 50%;
			right: 1px;
			top: 50%;
			transform: translateY(-50%);
			transition: all 0.5s;
			border: 1px solid #888;
		}

		._microToggle2._withText::before {
			width: 10px;
			height: 10px;
			right: 3px;
		}

		._microToggle2._on {
			background-color: #52BD94;
			opacity: 0.8;
			border: 1px solid #198A61;
			color: #FFF;	
		}

		._microToggle2._on::before {
			right: calc(100% - 7px);
			transform: translateY(-50%);
			background-color: #FFF;
			border: 1px solid #FFF;
		}

		._microToggle2._withText._on::before {
			right: calc(100% - 13px);
		}

		._confineWidth {
			overflow: hidden;
		}

		._simpleEditor {
			padding: 5px 15px;
		}

		._combineEditors ._simpleEditor {
			padding: 0px;
		}

		._combineEditors ._simpleEditor._expandWidth {
			width: 100%
		}

		._simpleEditorAngleSize {
			display: flex;
			align-items: center;
			gap: 2px;
			overflow: hidden;
		}

		._simpleEditorPixelSize {
			display: flex;
			align-items: center;
			gap: 2px;
			overflow: hidden;
			height: 35px;
		}

		._simpleEditorPixelSize ._inputDropdownContainer {
			font-family: Inter;
			font-size: 12px;
			border: none;
			border-radius: 6px;
			color: #555;
			background-color: #F8FAFB;
			cursor: pointer;
			padding: 5px 8px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			height: 35px;
			overflow: hidden;
		}

		._simpleEditorPixelSize ._inputDropdownContainer input {
			border: none;
			height: 100%;
			background-color: transparent;
			outline: none;
			font-family: Inter;
			font-size: 12px;
			color: #555;
			max-width: 60px;
			min-width: 20px;
		}

		._simpleEditorPixelSize ._inputDropdownContainer ._simpleEditorSelect {
			min-width: 60px;
			flex: 0.5;
			padding-left: 0px;
			width: 64px;
		}

		._simpleEditorPixelSize ._inputDropdownContainer ._simpleEditorSelect ._selectedOption {
			margin-right: 5px;
			text-align: right;
		}

		._simpleEditorPixelSize ._simpleEditorSelect {
			flex: 1;
			background-color: transparent;
		}

		._simpleEditorPixelSize ._simpleEditorRange {
			flex: 2;
			margin-right: 12px;
		}

		._simpleEditorSelect,
		._simpleEditorInput{
			min-height: 35px;
			min-width: 35px;
			font-family: Inter;
			font-size: 12px;
			border: none;
			border-radius: 6px;
			color: #555;
			background-color: #F8FAFB;
			cursor: pointer;
			padding: 5px 15px;
			flex: 1;
			outline: none;
		}

		._simpleEditorRange {
			position: relative;
		}

		._simpleEditorRange ._rangeTrack {
			width: 100%;
			min-width: 60px;
			height: 2px;
			border-radius: 10px;
			background-color: #E2E2E7;			
			left: 0;
			z-index: 1;
		}

		._simpleEditorRange ._rangeTrackFill {
			width: 0%;
			height: 2px;
			border-radius: 10px;
			background-color: #4C7FEE;
			position: absolute;
			left: 0;
			z-index: 1;
			margin-top: -2px;
			transition: width 0s;
		}

		._simpleEditorRange ._rangeThumb {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: #FFF;
			position: absolute;
			top: -5px;
			z-index: 1;
			cursor: pointer;
			box-shadow: 0px 1px 4px 0px #0000001A;
			cursor: pointer;
		}

		._simpleEditorRange ._rangeThumb::before {
			content: '';
			position: absolute;
			width: 60%;
			height: 60%;
			left: 20%;
			top: 20%;
			border-radius: 50%;
			background-color: #4C7FEE;
		}

		._simpleEditorSelect {
			text-transform: uppercase;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;
		}

		._page_Selector {
			width: 186px;
		}

		._page_Selector ._simpleEditorSelect {	
			height: 38px;
			border-radius: 20px;
		}
		._add_page_btn_container {
			padding: 10px 10px;
		}

		._add_page_btn_container button._add_page_btn {
			border-radius: 2px;
			background: #4C7FEE;
			color: #fff;
			width: 100%;
			height: 30px;
		}

		._main_editor_dropdown { 
			position: relative;
		}
		
		._simpleEditorSelect ._simpleEditorDropdownBody{
			position: fixed;
			min-width: 100%;
			background-color: #FFF;
			border: 1px solid rgba(0, 0, 0, 0.10);
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			margin-top: 4px;
			
			max-height: 250px;
			overflow: auto;
		}

		._main_editor_dropdown ._simpleEditorDropdownBody{
			position: absolute;
			min-width: 100%;
			background-color: #FFF;
			border: 1px solid rgba(0, 0, 0, 0.10);
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			max-height: 300px;
			overflow: auto;
			padding: 10px;
		}

		._simpleEditorSelect ._simpleEditorDropdownBody {
		}

		._simpleEditorSelect ._simpleEditorDropdownBody ._options_divider {
			border-bottom: 1px solid rgba(0, 0, 0, 0.10);
		}

		._simpleEditorSelect svg {
			min-width: 8px;
		}

		._simpleEditorSelect ._selectedOption {
			min-width: calc(100% - 8px);
		}

		._simpleEditorSelect ._selectedOption._placeholder {
			text-transform: capitalize;
			color: #757575;
		}

		._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption {
			padding: 10px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption._hovered {
			background-color: #F8FAFB;
			border-radius: 4px;
			font-weight: bold;
			color: #0085F2;
		}

		._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption._selected {
			color: #0085F2;
		}

		._main_editor_dropdown ._simpleEditorDropdownBody ._simpleEditorDropdownOption {
			height: 25px;
			padding: 5px 10px 5px 0px;
			color: rgba(0, 0, 0, 0.4); 
			border-radius: 4px;
			white-space: nowrap;
		}

		._main_editor_dropdown ._simpleEditorDropdownBody ._simpleEditorDropdownOption:hover {
			background-color: #F8FAFB;
			border-radius: 4px;
			color: #0085F2;
			cursor: pointer;
		}

		._simpleEditorIcons {
			border-radius: 6px;
			display: flex;
			align-items: center;
			flex-direction: row;		
		}

		._simpleEditorIcons ._eachIcon {
			cursor: pointer;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
		}

		._simpleEditorIcons._bground ._eachIcon {
			background: #F8FAFB;
		}

		._simpleEditorIcons ._eachIcon:first-child {
			border-top-left-radius: 6px;
			border-bottom-left-radius: 6px;
		}

		._simpleEditorIcons ._eachIcon:last-child {
			border-top-right-radius: 6px;
			border-bottom-right-radius: 6px;
		}

		._simpleEditorIcons._bground ._eachIcon:hover,
		._simpleEditorIcons._bground ._eachIcon._active {
			background: #EEF3FA;
		}

		._simpleEditorIcons ._eachIcon svg path,
		._simpleEditorIcons ._eachIcon svg circle,
		._simpleEditorIcons ._eachIcon svg rect,
		._simpleEditorIcons ._eachIcon svg rect {
			fill: #333333;
			stroke: rgba(142, 144, 164, 0.5);
		}

		._simpleEditorIcons._bground ._eachIcon svg path,
		._simpleEditorIcons._bground ._eachIcon svg circle,
		._simpleEditorIcons._bground ._eachIcon svg rect,
		._simpleEditorIcons._bground ._eachIcon svg line {
			fill: #E3E5EA;
			stroke: rgba(142, 144, 164, 0.5);
		}

		._simpleEditorIcons ._eachIcon:hover svg path,
		._simpleEditorIcons ._eachIcon:hover svg circle,
		._simpleEditorIcons ._eachIcon:hover svg rect,
		._simpleEditorIcons ._eachIcon:hover svg line,
		._simpleEditorIcons ._eachIcon._active svg path,
		._simpleEditorIcons ._eachIcon._active svg circle,
		._simpleEditorIcons ._eachIcon._active svg rect,
		._simpleEditorIcons ._eachIcon._active svg line {
			fill: #3A8BED;
			stroke: #3A8BED;
		}

		._simpleEditorColorSelector {
			background: linear-gradient(90deg, #35F803 -26.56%, #4D7FEE 26.55%, #F9A71E 69.94%, #35F803 126.56%);
			width: 20px;
			height: 20px;
			border-radius: 50%;
			cursor: pointer;
			border: 3px solid #FFF;
			box-shadow: 0px 0px 5px 3px #00000017;
			position: relative;
		}

		._simpleEditorColorSelector ._colorPickerBody {
			position: fixed;
			background-color: #FFF;
			z-index: 2;
			box-shadow: 0px 1px 4px 0px #00000026;
			border-radius: 6px;
			padding: 10px;
			min-height: 250px;
			width: 250px;
			margin-left: -240px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._color_variable_picker {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: 12px;
			
			padding: 5px;
			flex-wrap: wrap;
		}

		._simpleEditorColorSelector ._colorPickerBody ._color_variable {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			cursor: pointer;
			box-shadow: 0px 1px 2px 0px #00000026;
			position: relative;
		}

		._simpleEditorColorSelector ._colorPickerBody ._color_variable._selected {
			border: 2px solid #51BD94;
			box-shadow: 0px 0px 4px 4px #51BD94;
		}

		._simpleEditorColorSelector ._colorPickerBody ._color_variable::before {
			content: '';
			width: 100%;
			height: 100%;
			border-radius: 50%;
			position: absolute;
			background-image:
				linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
				linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
  			background-size: 10px 10px;
  			background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
			border-radius: 8px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._color_variable_name {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			position: absolute;
		}

		._simpleEditorColorSelector ._colorPickerBody ._simpleEditorInput,
		._simpleEditorColorSelector ._colorPickerBody ._simpleEditorSelect {
			min-height: 25px;
			padding-top: 3px;
			padding-bottom: 3px;
			border-radius: 4px;
			border: 1px solid #EEE;
			background: transparent;
		}

		._simpleEditorColorSelector ._colorPickerBody ._saturation_value_picker{
			position: relative;
			height: 150px;
			border-radius: 6px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._saturation_value_picker ._thumb {
			margin-top: -8px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._hue_picker{
			background: linear-gradient(to right,red 0,#ff0 16.66%,#0f0 33.33%,#0ff 50%,#00f 66.66%,#f0f 83.33%,red 100%);
			height: 10px;
			width: 100%;
			border-radius: 8px;
			position: relative;
			margin-bottom: 10px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._alpha_picker {
			cursor: pointer;
			height: 10px;
			position: relative;
			flex: 3;
			margin-right: 8px;
			background-image:
				linear-gradient(45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(-45deg, #EFEFEF 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, #EFEFEF 75%),
				linear-gradient(-45deg, transparent 75%, #EFEFEF 75%);
  			background-size: 10px 10px;
  			background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
			border-radius: 8px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._alpha_picker_gradient {
			position: absolute;
			height: 100%;
			width: 100%;
			border-radius: 8px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._colorValueline {
			display: flex;
			flex-direction: row;
			align-items: center;
			flex: 1;
			gap: 5px;
		}

		._simpleEditorColorSelector ._colorPickerBody ._colorValues {
			margin-right: 2px;
    		padding-right: 5px;
    		border-right: 0.5px solid #0000000D;
		}

		._simpleEditorColorSelector ._thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background-color: #FFF;
			position: absolute;
			top: -4px;
			z-index: 1;
			cursor: pointer;
			box-shadow: 0px 2px 4px 0px #00000033;
			cursor: pointer;
			margin-left: -8px;
			border: 3px solid #FFF;
			pointer-events: none;
		}
		
		._simpleEditorColorSelector ._thumbInner {
			position: absolute;
			width: 60%;
			height: 60%;
			left: 20%;
			top: 20%;
			border-radius: 50%;
			background-color: #4C7FEE;
		}

		._simpleEditorShadow {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}

		._simpleEditorShadow ._eachShadowEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
			width: 100%;
		}

		._simpleEditorShadow ._inset {
			display: flex;
			align-items: center;
			gap: 5px;
		}

		._simpleEditorShadow ._color_controls {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
			width: 100%;
		}

		._simpleEditor._warning{
			font-size: 11px;
			font-family: Inter;
			color: #FFCC00;
			padding: 5px 15px;
			
		}

		._simpleEditorBigSelector {
			padding: 5px 15px;
		}

		._simpleEditorBigSelector ._searchBox {
			height: 35px;
			display: flex;
			align-items: center;
			border: 0.5px solid #DFE1E2;
			background-color: #F8FAFB;
			border-radius: 6px;
			padding: 0px 10px;
		}

		._simpleEditorBigSelector input {
			border: none;
			height: 100%;
			font-family: Inter;
			font-size: 12px;
			border: none;
			background: transparent;
			flex: 1;
			outline: none;
		}

		._simpleEditorControls {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
			width: 100%;
		}

		._simpleEditorBigSelector ._searchResult {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			padding: 5px 0px;
			flex-direction: row;
			gap: 10px;
			flex-wrap: wrap;
			max-height: 400px;
			overflow: auto;
			margin-top: 15px;
		}

		._simpleEditorBigSelector ._searchResult ._searchResultItem {
			display: flex;
			flex-direction: column;
			cursor: pointer;
		}

		._simpleEditorBigSelector ._searchResult ._searchResultItem ._animationIcon {
			width: 66px;
			height: 66px;
			border-radius: 4px;
			background: #CFCFD81A;
			border-radius: 4px;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		._searchResultItem ._animationIcon ._hovered {
			display: none;
		}

		._searchResultItem:hover ._animationIcon ._default,
		._searchResultItem._selected ._animationIcon ._default {
			display: none;
		}

		._searchResultItem ._animationIcon ._default {
			display: block;
		}

		._searchResultItem:hover ._animationIcon ._hovered,
		._searchResultItem._selected ._animationIcon ._hovered {
			display: block;
		}

		._simpleEditorBigSelector ._searchResult ._searchResultItem ._animationName {
			font-size: 11px;
			font-weight: 500;
			font-family: Asap;
			text-align: center;
		}

		._simpleEditorBigSelector ._searchResult ._searchResultItem:hover ._animationName {
			color: #4FBBB2;
		}

		._simpleEditorGroup {
			padding: 15px;
		}

		._simpleEditorGroupTitle {
			font-family: Inter;
			font-size: 12px;
			font-weight: 600;
			line-height: 14px;
			padding: 5px 10px;
			border-radius: 4px 4px 0px 0px;
			background: #F8FAFB;
			height: 30px;
			display: flex;
			align-items: center;
		}

		._simpleEditorGroupTitle._gradient {
			border-radius: 4px 4px 0px 0px;
			color: #FFF;
			background: linear-gradient(90deg, rgba(67, 178, 255) 0%, rgba(82, 189, 148) 100%);
		}

		._simpleEditorGroupTitle ._controls {
			flex: 1;
			height: 100%;
			display: flex;
			justify-content: flex-end;
		}

		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg path,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg circle,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg rect,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg line{
			fill: #FFF;
			stroke: #FFF
		}

		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg path,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg circle,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg rect,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg line,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg path,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg circle,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg rect,
		._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg line {
			fill-opacity: 0.5;
			stroke-opacity: 0.5;
		}

		._simpleEditorGroup ._simpleEditorGroupContent {
			padding: 10px;
			border-radius: 0px 0px 4px 4px;
			background: rgba(248, 250, 251, 0.60);
			display: flex;
			flex-direction: column;
			gap: 10px;
			justify-content: center;
			align-items: center;
		}

		._simpleEditorGroupContent ._editorLine {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			gap: 5px;
		}

		._simpleEditorGroupContent ._editorLine ._simpleEditorPixelSize {
			width: 100%;
		}

		._simpleEditorGroupContent ._editorLine ._label {
			color: #33333399;
			font-family: Inter;
			font-size: 12px;
			font-weight: 500;
			white-space: nowrap;
		}

		._simpleEditorAngle {
			min-height: 60px;
			min-width: 60px;
			border-radius: 50%;
			background-color: #F8FAFB;
			position: relative;
		}

		._simpleEditorGroupContent ._simpleEditorAngle{
			border: 1px solid rgba(67, 178, 255);
		}

		._simpleEditorAngle ._angleTrack {
			height: 100%;
			position: absolute;
			left: 50%;
			transform-origin: center center;
			margin-left: -4px;
		}

		._simpleEditorAngle ._angleTrack::before {
			content: '';
			display: block;
			width: 10px;
			height: 10px;
			background: linear-gradient(150deg, #43B2FF 13.39%, #52BD94 86.61%);
			border-radius: 50%;
			margin-top: 2px;
			cursor: pointer;
		}

		._simpleEditorButtonBar {
			height: 35px;
			display: flex;
			flex-direction: row;
			padding: 5px;
			font-family: Inter;
			font-size: 12px;
			gap: 5px;
			background-color: #F8FAFB;
			border-radius: 6px;
			justify-content: center;
			align-items: center;
		}

		._simpleEditorButtonBar ._simpleButtonBarButton {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0px 10px;
			border-radius: 4px;
			cursor: pointer;
		}

		._simpleEditorButtonBar ._simpleButtonBarButton._selected {
			background-color: #4C7FEE;
			color: #FFF;
			box-shadow: 0px 1px 3px 0px #0000001A;
		}

		._svgButton {
			border: none;
			background: transparent;
		}

		._combineEditors {
			display: flex;
			flex-direction: row;
			align-items: center;			
			padding: 5px 15px;
			gap: 5px;
			width: 100%;
		}

		._detailStyleEditor ._combineEditors ._simpleLabel {
			padding: 0px;
			padding-right: 5px;
			flex: 1;
		}

		._detailStyleEditor ._combineEditors ._simpleEditor {
			width: auto;
		}

		._combineEditors ._onePart {
			flex: 1;
		}

		._combineEditors ._twoParts {
			flex: 2;
		}

		._combineEditors ._oneAndHalfParts {
			flex: 1.5;
		}

		._combineEditors ._simpleEditorInput,
		._combineEditors ._simpleEditorSelect {
			padding: 8px;
			width: 100%;
		}

		._combineEditors ._combineEditors {
			padding: 0;
		}

		._combineEditors ._eachProp {
			padding: 0;
		}

		._spacer {
			width: 10px;
			height: 15px;
		}

		._combineEditors._spaceBetween {
			justify-content: space-between;
		}

		._combineEditors._spaceAround {
			justify-content: space-around;
		}

		._combineEditors._centered {
			justify-content: center;
		}

		._combineEditors._alignEnd {
			justify-content: flex-end;
		}

		._combineEditors._vertical {
			flex-direction: column;
			align-items: flex-start;
		}

		._combineEditors._top {
			align-items: flex-start;
		}

		._detailStyleEditor {
			min-width: 250px;
			width: 250px;
			min-height: 400px;
			background-color: #FFF;
			box-shadow: 0px 2px 15px 0px #0000001A;
			border: 1px solid #00000029;
			position: fixed;
			z-index: 4;
			border-radius: 4px;
			display: flex;
			flex-direction: column;
		}

		._detailStyleEditor ._header {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding: 10px;
			border-bottom: 1px solid #0000000F;
			background-color: #F8FAFB;
			font-family: Inter;
			font-size: 11px;
			font-weight: 600;
			line-height: 12px;
			color: #000000;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
			padding-left: 20px;			
			cursor: move;
		}

		._detailStyleEditor ._header ._title {
			flex: 1;
		}

		._detailStyleEditor ._header ._close {
			cursor: pointer;
		}

		._detailStyleEditor ._editorContent {
			padding-top: 10px;
			padding-bottom: 10px;
			white-space: nowrap;
			gap: 10px;
			display: flex;
			flex-direction: column;
			max-height: 500px;
			overflow: auto;
			margin-bottom: 5px;
		}

		._simpleLabel {
			font-size: 12px;
			font-family: Inter;
			color: #222222B2;
			white-space: nowrap;
			font-weight: 500;
		}

		._simpleLabel._withPadding {
			padding: 5px 15px;
		}

		._detailStyleEditor ._simpleLabel {
			padding-left: 15px;
			padding-right: 15px;
		}

		._positionKnob #background{
			fill: #F8FAFB;
		}

		._positionKnob #knob {
			fill: #FFF;
			filter: drop-shadow(0px 0px 3px #0000000D)
		}

		._positionKnob #left,
		._positionKnob #top,
		._positionKnob #right,
		._positionKnob #bottom {
			fill: #E3E5EA;
		}

		._positionKnob._left #left,
		._positionKnob._top #top,
		._positionKnob._right #right,
		._positionKnob._bottom #bottom {
			fill: #4C7FEE;
		}

		._spacingEditor._margin {
			margin: 0px 15px;
			position: relative;
			border-radius: 6px;
			border: 2px solid #E3E5EA;
			height: 166px;
		}

		._spacingEditor._margin._hasValue,
		._spacingEditor ._padding._hasValue {
			border-color: #52BD94
		}

		._spacingEditor ._padding {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			border: 2px solid #E3E5EA;
			height: 90px;
			min-width: 58%;
			border-radius: 6px;
		}

		._spacingEditor ._label {
			font-size: 8px;
			font-family: Inter;
			color: #D2D3DB;
			position: absolute;
			bottom: 2px;
			right: 6px;
			text-transform: uppercase;
			user-select: none;
			white-space: nowrap;
		}

		._spacingEditor ._label._hasValue{
			color: #52BD94;
		}

		._spacingEditor ._changer {
			position: absolute;
			width: 110%;
			margin-left: -5%;
			top: 0;
			left: 0;
			cursor: pointer;
			background-color: #FFFFFF;
			box-shadow: 2px 2px 4px 0px #0000001A;
			border-radius: 4px;
			z-index: 1;
		}

		._spacingEditor ._changer ._header {
			font-size: 11px;
			font-family: Inter;
			font-weight: 600;
			color: #000000;
			user-select: none;
			padding: 5px;
			background-color: #F8FAFB;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
			border-bottom: 1px solid #0000000F;
			padding-left: 20px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 35px;
		}

		._spacingEditor ._changer ._body {
			padding: 10px 15px;
			display: flex;
			flex-direction: column;
		}

		._spacingEditor ._value {
			height: 25px;
			min-width: 45px;
			background: #F8FAFB;
			border-radius: 4px;
			font-family: Inter;
			font-size: 12px;
			line-height: 12px;
			color: #000000;
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 4px;
			cursor: pointer;
		}

		._spacingEditor ._value._default {
			color: #D2D3DB;
		}

		._spacingEditor ._padding ._value {
			font-size: 10px;
		}

		._spacingEditor ._square {
			position: absolute;
			width: 8px;
			height: 8px;
			border-radius: 1px;
			background-color: #E3E5EA;
			opacity: 0.5;
		}

		._spacingEditor ._circle {
			position: absolute;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background-color: #E3E5EA;
			opacity: 0.5;
		}

		._spacingEditor ._square._hasValue,
		._spacingEditor ._circle._hasValue {
			background-color: #52BD94;
			opacity: 1;
		}

		._spacingEditor ._top {
			top: -5px;
			left: 50%;
			transform: translateX(-50%);
		}

		._spacingEditor ._bottom {
			bottom: -5px;
			left: 50%;
			transform: translateX(-50%);
		}

		._spacingEditor ._left {
			left: -5px;
			top: 50%;
			transform: translateY(-50%);
		}

		._spacingEditor ._right {
			right: -5px;
			top: 50%;
			transform: translateY(-50%);
		}

		._spacingEditor ._value._top { top: 5px; }
		._spacingEditor ._value._bottom { bottom: 5px; }
		._spacingEditor ._value._left { left: 5px; }
		._spacingEditor ._value._right { right: 5px; }

		${PREFIX} ._screenSizes {
			height: 30px;
		}

		${PREFIX} ._buttonBar._screenSizes {
			height: 65px;
		}

		${PREFIX} ._buttonBar._screenSizes i.fa:hover, ${PREFIX} ._buttonBar._screenSizes svg:hover,
		${PREFIX} ._buttonBar._screenSizes i.fa.active, ${PREFIX} ._buttonBar._screenSizes svg.active{
			color: #8E90A4;
			border-bottom: 3px solid #8E90A4;
			background: linear-gradient(360deg, rgba(142, 144, 164, 0.1) 0.78%, rgba(142, 144, 164, 0.011) 157.03%);
		}

		${PREFIX} ._screenSizes i.fa {
			color: #8E90A480;
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

		${PREFIX} ._topLeftCenterBarGrid {
			display: flex;
			flex:1;
			align-items: center;
			justify-content: center;
		}

		${PREFIX} ._iframeHolder {
			flex: 1;			
			position: relative;
			display: flex;
			gap: 20px;
			transform-origin: left top;
		}

		${PREFIX} ._iframeHeader {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			gap: 10px;
			background-color: #0000000a;
			border-radius: 4px;
			font-size: 12px;
			color: #000000a0;
			cursor: pointer;
    		transform-origin: top left;
		}

		${PREFIX} ._iframeCenter {
			display: table-cell;
			flex: 1;
			padding: 70px;
			padding-top: 10px;
			overflow: auto;
		}

		${PREFIX} ._dummyDevice {
			min-width: 70px;
		}

		${PREFIX} ._iframe {
			display: flex;
			overflow: auto;
			transform-origin: top left;
			flex-direction: column;
			gap: 10px;
			overflow: hidden;
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
		}

		${PREFIX} ._urlInput._peInput:focus-within {
			width: 500px;
		}

		${PREFIX} ._dndGridMain {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		${PREFIX} ._dndContentContainer {
			display: flex;
			flex: 1;
			height: calc(100% - 65px);
		}

		${PREFIX} ._dndIframeContentContainer {
			display: flex;
			flex: 1;
			flex-direction: column;
			width: calc(100% - 48px);
			position: relative;
		}

		${PREFIX} ._selectionBar {
			display: flex;
			background-color: #fff;
			height: 29px;
			padding-left: 28px;
		}
		
		${PREFIX} ._selectionBar._previewMode {
			height: 0px;
		}

		${PREFIX} ._selectionBar ._iconMenu {
			min-height: 100%;
		}

		${PREFIX} ._eachSelectionBar {
			font-size: 10px;
			font-weight: 600;
			padding: 3px;
			display: flex;
    		align-items: center;
			position: relative;
			cursor: pointer;
			user-select: none;
			display: flex;
			gap: 8px;
			align-items: center;
			width: auto;
			text-transform: uppercase;
    		color: #8E90A4B2;
		}
		
		${PREFIX} ._eachSelectionBar i.fa, ${PREFIX} ._iconMenuBody i.fa {
			font-size: 11px;
			width: 10px;
		}

		${PREFIX} ._iframeContainer {
			display: flex;
    		flex: 1;
			max-height: calc(100% - 29px);
		}

		${PREFIX} ._dragBar {
			position: relative;
			width: 100%;
			color: #8E90A4;
		}

		${PREFIX} ._dragBar._unbuckled {
			display: flex;
			justify-content: space-between;
			padding: 8px 6px 8px 6px;
		}

		${PREFIX} ._dragBar ._buckle {
			cursor: pointer;	
			outline: none;
			position: absolute;
			left: -20px;
			top: 8px;
		}

		${PREFIX} ._dragBar ._leftIcon, ._dragBar ._rightIcon {
			outline: none;
			cursor: pointer;
		}

		${PREFIX} ._iframeContainer._previewMode {
			max-height: 100%;
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
			background: #F8FAFB;
			height: 53px;
			justify-content: space-around;
			align-items: center;
			flex-shrink: 0;
		}

		${PREFIX} ._tabBar svg {
			cursor: pointer;	
			outline: none;
		}

		${PREFIX} ._tabBar svg path,
		${PREFIX} ._tabBar svg rect {
			transition: fill 0.5s, fill-opacity 0.5s;
			fill: #8E90A4;
			fill-opacity: 0.2;
		}

		${PREFIX} ._tabBar svg:hover path,
		${PREFIX} ._tabBar svg.active path,
		${PREFIX} ._tabBar svg:hover rect,
		${PREFIX} ._tabBar svg.active rect {
			fill: #52BD94;
			fill-opacity: 1;
		}
		${PREFIX} i._separator {
			opacity: 0.1;
		}

		${PREFIX} ._styleButtonContainer button{
			border: none;
			background-color: transparent;
			color: #D2D3DB;
			display: flex;
			gap: 5px;
			justify-content: center;
			align-items: center;
			height: 30px;
			border-radius: 6px;
			z-index: 2;
			padding: 0;
			transition: none;
		}

		${PREFIX} ._styleButtonContainer button:hover {
			background-color: #52BD94;
			color: #FFF;
			box-shadow: 0px 1px 3px 0px #0000001A;
		}
		${PREFIX} ._styleButtonContainer button:hover svg path {
			fill: #FFF;
		}
		${PREFIX} ._styleButtonContainer button svg path {
			fill: #D2D3DB
		}
		${PREFIX} ._styleButtonContainer ._seperator {
			height: 12px;
			width: 1px;
			border-right: 1px solid #D2D3DB;
		}

		${PREFIX} ._styleButtonContainer {
			background: #F8FAFB;
			border-radius: 6px;
			margin-left: 15px;
			margin-right: 15px;
			height: 45px;
			position: relative;		
			padding: 0px 5px;	
		}

		${PREFIX} ._addArrayItemButton {
			color: #FFFFFF;
			background: #52BD94;
			border-radius: 2px;
			padding: 3px 8px;
			border: none;
			box-shadow: 0px 1px 6px 2px #0000001A;
		}

		.commonTriStateCheckbox::before {
			background: black;
		}

		._propContainer {
			width: 100%;
			padding-top: 20px;
			flex: 1;
		}

		._propertyEditor{
			display: flex;
			flex-direction: column;
			position: relative;
		}

		._eachProp {
			font-size: 12px;
			padding: 5px 20px;
			display: flex;
			flex-direction: column;
			gap: 5px;
			border-radius: 4px;
			position: relative;
		}

		._eachProp svg {
			cursor: pointer;
		}


		._eachProp:hover {
			
		}

		._pvEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		._pvEditor ._microToggle {
			width: 20px;
			background-color: #F8FAFB;
			height: 10px;
			border-radius: 2px;
			position: relative;
			cursor: pointer;
			transition: left 0.5s, background-color 0.5s;
		}

		._pvEditor ._microToggle::before {
			position: absolute;
			float: left;
			left: -10%;
			top: -25%;
			border-radius: 2px;
			content: '';
			width: 65%;
			height: 150%;
			background-color: #E8EAEB;
			transition: left 0.5s, background-color 0.5s;
			font-size: 9px;
			text-align: center;
			font-weight: bold;
			padding: 0px 2px;
			text-align: center;
		}

		._pvEditor ._microToggle._on {
			background-color: #E8EAEB;
		}

		._pvEditor ._microToggle._on::before {
			left: 50%;
			background-color: #C8CACB;
			color: #eee;
		}

		._pvValueEditor {
			display: flex;
			gap: 5px;
			flex: 1;
		}

		._propLabel {
			color: #222222B2;
			display: flex;
			gap: 5px;
			align-items: center;
			text-transform: capitalize;
			font-family: Inter;
			white-space: nowrap;
		}

		._propLabel i.fa {
			cursor: pointer;
		}

		._propValue ._peInput {
			width: 20px;
		}

		._propValue._padding {
			background-color: #F8FAFB77;
			border: 1px solid #F8FAFB;
			border-radius: 4px;
			min-width: 300px;
		}

		._propValue ._propertyGroup {
			min-width: 300px;
			overflow: auto;
		}

		${PREFIX} ._tooltip {
			display: flex;
			align-items: center;
		}

		${PREFIX} ._description {
			font-size: 10px;
			background-color: #8E90A433;
			color: #FFF;
			width: 11px;
			height: 11px;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 50%;
			text-transform: initial;
		}

		${PREFIX} ._tooltip:hover::after {
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
			white-space: break-spaces;
		}
		
		._pvExpressionEditor {
			display: flex;
		}

		._pillTag {
			border: 1px solid;
			padding: 2px 7px;
			border-radius: 10px;
			background-color: #fff;
			font-size: 10px;
			cursor: pointer;
		}

		i._pillTag.fa {
			font-size: 10px !important;
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
			padding: 2px;
			border-radius: 2px;
			border: 1px solid #eee;
			cursor: pointer;
			width: 30px;
			text-align: center;
			font-size: 24px;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 30px;
			border-radius: 4px
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

		._propertyGroup {
			display: flex;
			flex-direction: column;
			border-bottom: 1px solid rgba(0,0,0,0.05);
		}

		._propertyGroup._opened ._propertyGroupContent {
			padding-bottom: 8px;
		}

		._propertyGroupContent {
			transition: padding-bottom 0s;
		}

		._propertyGroupHeader {
			font-family: Inter;
			font-size: 13px;			
			color: #888;
			padding: 14px 15px;
			cursor: pointer;
			border-radius: 3px;
			display: flex;
			align-items: center;
			flex-direction: row;			
			gap: 5px;
			font-weight: 600;
		}

		._propertyGroupHeaderStar {
			fill: #52BD94;
			transform: scale(1.4);
		}

		._propertyGroupHeaderIcon {
			flex: 1;
			display: flex;
			flex-direction: row;
			gap: 15px;
			font-size: 20px;
			font-weight: 200;
			justify-content: flex-end;
			font-family: monospace;
		}

		._propertyGroup._closed ._propertyGroupHeader {
			margin-bottom: 0px;
		}

		._propertyGroupHeader i.fa {
			transition: transform 0.5s;
			color: #eee;
		}

		._propertyGroup._closed i.fa {
			transform: rotate(-90deg);
		}

		._propertyGroup ._detailsSwitchEditor {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			color: #333333;
		}

		._propertyGroup ._detailsSwitchEditor._open,
		._propertyGroup ._detailsSwitchEditor:hover {
			color: #2680EB;
		}

		${PREFIX} ._multiValueEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		._eachProperty {
			display: flex;
			gap: 10px;
			align-items: center;
			border-bottom: 1px solid #ddd;
			padding: 5px;
			padding-top: 20px;
			position: relative;
		}

		._eachProperty i.fa._controlIcons {
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

		._eachProperty i.fa-close._controlIcons {
			left: 24px;
		}

		._eachProperty:hover i.fa {
			color: inherit;
		}

		._eachProperty ._pvEditor {
			flex: 1;
		}

		${PREFIX} ._validationEditor,
		${PREFIX} ._animationValueEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
			flex:1;
		}

		${PREFIX} ._eachProperty ._eachProp {
			padding: 5px 0px;
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

		${PREFIX} ._addPropertyButtonContainer {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 10px;
		}

		${PREFIX} ._addPropertyButtonContainer button {
			color: #FFFFFF;
			background-color: #52BD94;
			border-radius: 4px;
			border: none;
			padding: 8px 10px;		
			box-shadow: 0 15px 30px 0 rgba(0,0,0,.10), 0 5px 15px 0 rgba(0,0,0,.10);
		}

		${PREFIX} ._addPropertyButtonContainer button:hover {
			background-color: #52BD94CC;
		}

		._popupBackground ._popupContainer._schemaFormEditor {
			padding: 0;
			border: 1px solid #0000000F;
			font: normal 600 12px/12px Inter;
			overflow: hidden;
		}

		._popupBackground ._popupContainer._schemaFormEditor ._header {
			background-color: #F8FAFB;
			font: normal 600 12px/12px Inter;
			padding: 15px 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 40px;
		}

		._popupBackground ._popupContainer._schemaFormEditor ._header ._close_btn {
			cursor: pointer;
		}
		._popupContainer._schemaFormEditor ._schemaFormEditorContainer {
			display: flex;
			flex-direction: column;
			flex: 1;
			padding: 20px;
			gap: 20px;
			max-height: calc(100% - 60px);
		}

		._popupContainer._schemaFormEditor ._jsonEditorContainer{
			border: 1px solid #eee;
			border-radius: 4px;
			padding: 2px;
			flex: 1;
			width: 100%;
			transition: width 0s, height 0s;
		}

		._schemaFormEditor {
			width: 600px;
			height: 650px;
		}

		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._bindPathContainer {
			display: flex;
    		gap: 5px;
			height: 35px;
		}

		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._peInput {
			width: 100%;
			height: 35px;
			font: normal 500 12px/12px Inter;
		}

		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._nextScreen {
			overflow: hidden;
    		display: flex;
    		flex-direction: column;
			flex: 1;
		}

		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._textButton, ._popupBackground ._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._popupButtons ._textButton {
			color: #333333CC;
			background-color: transparent;
			border: none;
			font-weight: 600;
		}

		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._button, ._popupBackground ._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._popupButtons ._button {
			color: #fff;
    		background-color: #52BD94;
			font: normal 600 12px/12px Inter;
			border: none;
			border-radius: 5px;
			height: 35px;
			padding: 0 15px;
			cursor: pointer
		}
		._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._button:disabled, ._popupBackground ._popupContainer._schemaFormEditor ._schemaFormEditorContainer ._popupButtons ._button:disabled {
			background-color: #CCC;
			color: #999;
			cursor: not-allowed;
		}

		._nextScreen ._tableContainer {
			margin-top: 30px;
			
			overflow: auto;
			flex: 1;
		}

		._nextScreen ._tableContainer table {
			border-spacing: 0;
			border-collapse: separate;
			border-radius: 8px;
			border: 1px solid black;
			overflow: hidden;

		}

		._nextScreen ._tableContainer tr {
			height: 45px;
		}

		._nextScreen ._tableContainer table, ._nextScreen ._tableContainer tr {
			text-align: center;
			border: 1px solid #3333331A;
		}

		._nextScreen ._tableContainer th {
			background-color: #333333;
			color: #FFFFFF;
		}

		._nextScreen ._tableContainer th, ._nextScreen ._tableContainer td {
			border-bottom: 1px solid #3333331A;
			width: 120px;
			max-width: 120px;
			min-width: 120px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			
		}

		._formEditor {
			width: 600px;
			height: 650px;
		}

		._formEditor ._formEditorContent{
			height: 100%;
			width: 100%;
			padding: 20px;
		}

		._formEditor ._formButton {
			display: flex;
			justify-content: space-between;
		}

		._formButton .fa-close {
			margin-top: 10px;
			margin-right: 10px;
			cursor:pointer;
			transition: transform 0.2s ease-in-out;
		}

		._formButton ._backButton {
			display: flex;
			margin-top: 10px;
			margin-left: 10px;
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
			cursor: pointer;
		}

		._formEditorContent ._generateButton {
			width: 125px;
			padding: 12px;
			border-radius: 4px;
			background: #0085F2;
			box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.10);
			color: #FFF;
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
			cursor: pointer;
			transition: transform 0.2s ease-in-out;
		}

		._formEditorContent ._formEditorBottomBorder {
			margin-top: 15px;
			margin-bottom: 10px;
			background: rgba(0, 0, 0, 0.10);
			height: 1px;
			margin-left: 5px;
			margin-right: 5px;
		}

		._formEditorContent ._formEditorHeader {
			color: rgba(0, 0, 0, 0.80);
			font-family: Inter;
			font-size: 16px;
			font-style: normal;
			font-weight: 600;
			line-height: 16px;
			letter-spacing: 0.16px;
			text-transform: uppercase;
			padding: 5px;
		}

		._formEditorContent ._formEditorSubHeader {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 400;
			line-height: 12px;
			letter-spacing: 0.12px;
			padding: 5px;
		}

		._formEditorContent ._formEditorFilesTitle {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 500;
			line-height: 12px;
			letter-spacing: 0.12px;
			padding: 5px;
		}

		._formEditorContent ._formEditorOptions {
			padding: 5px;
			width: 100%;
			height: 42vh;
			display: flex;
			flex-wrap: wrap;
			margin-top: 10px;
			overflow-y: scroll;
		}

		._formEditorContent ._formEditorOptionsPagination {
			width: 100%;
			height: 40px;
			display: flex;
			justify-content: space-between;
			align-items: end;
		}

		._formEditorOptionsPagination ._paginationPrev {
			width: 100px;
			text-align: left;
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
			cursor: pointer;
		}

		._formEditorOptionsPagination ._paginationPages {
			width: 100px;
			text-align: center;
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
		}

		._formEditorOptionsPagination ._paginationNext {
			width: 100px;
			text-align: right;
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
			cursor: pointer;
		}

		._paginationContainer ._prevButton {
			cursor: pointer;
			color: rgba(0, 0, 0, 0.6);
		}

		._paginationContainer ._nextButton {
			cursor: pointer;
			color: rgba(0, 0, 0, 0.6);
		}

		._paginationContainer ._pageButton {
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			background: rgba(0, 0, 0, 0.05);
			cursor: pointer;
		}

		._paginationContainer ._pageButtonActive {
			color: #fff;
			background: #0085F2;
		}

		._formEditorOptions ._formEditorEachOption {
			width: 161px;
			height: 201px;
			display: flex;
			flex-direction: column;
			padding: 10px;
			cursor: pointer;
		}

		._formEditorEachOption:hover ._formEditorEachOptionPreview {
			box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.10);
			border: 1px solid rgba(66, 126, 228, 0.80);
		}

		._formEditorEachOption ._formEditorEachOptionPreview {
			height: 80%;
			border-radius: 4px;
			background: #F9F9F9;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		._formEditorEachOption ._formEditorEachOptionName {
			margin-top: 15px;
			color: rgba(0, 0, 0, 0.80);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 600;
			line-height: 12px;
			letter-spacing: 0.12px;
		}

		._formEditorContent ._formElements {
			height: 400px;
			width: 100%;
			margin-bottom: 20px;
			display: flex;
			overflow-y: scroll;
		}

		._formElements ._formFieldsAndButtons {
			flex: 1;
		}

		._formFieldsAndButtons ._formFieldsAndButtonsTitle {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 500;
			line-height: 12px;
			letter-spacing: 0.12px;
			margin-left: 15px;
		}

		._formFieldsAndButtons ._formFieldAndButton {
			height: 44px;
			border-radius: 4px;
			background: #F8FAFB;
			margin: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		._formFieldAndButton ._formFieldAndButtonTitle {
			color: rgba(0, 0, 0, 0.80);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 500;
			line-height: 14px;
			padding-left: 20px;
		}

		._formFieldAndButton ._formFieldAndButtonCheckbox {
			padding-right: 20px;
			width: 18px;
			height: 18px;
			cursor: pointer;
		}

		._popupContainer ._progressBar {
			flex: 1;
			text-align: center;
			padding-top: 150px;
		}

		._popupContainer ._progressBar i.fa {
			font-size: 50px;
		}

		._popupBackground ._popupContainer._popupContainerWithPreview {
			flex-direction: row;
		}

		._popupContainer._popupContainerWithPreview ._mdPreviewContainer {
			overflow:auto;
		}

		._popupContainer._popupContainerWithPreview ._mdPreviewContainer ._markDownContent {
			height: 400px;
			width: 400px;
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

		._popupContainer ._iconSelectionBrowser ._selectors {
			display: flex;
			gap: 5px;
			align-items: center;
		}

		._popupContainer ._iconSelectionDisplay {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			overflow: auto;
		}

		._popupContainer ._iconSelectionDisplay._inProgress {
			height: 100%;
			justify-content: center;
			align-items: center;
			padding-bottom: 5%;
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
			width: 100vw;
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
			display: flex;
			flex-direction: column;
			background-color: #fff;
			position: absolute;
			border: 1px solid #eee;
			font-size: 13px;
		}

		._popupMenuBackground ._popupMenuContainer._plain {
			border: none;
			background-color: transparent;
		}

		._popupMenuContainer._compMenu {
			left: 48px;
			top: 64px;
			height: calc(100% - 68px);
			width: 0px;
			overflow: hidden;
			transition: width 0.5s ease-in-out;
			display: flex;
			flex-direction: row;
			box-shadow: 0px 1px 10px 0px #0000001A;
		}

		._compMenu ._left {
			flex: 100px;
			border-right: 1px solid #F2F4F8;
			display: flex;
			flex-direction: column;
			padding: 10px 0px 0px 10px;
			
		}

		._compMenu ._right {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		._compMenu._compMenuRight {
			width: 0px;
			left: 250px;
			border: none;
		}

		._compMenu._show._compMenuRight {
			display: flex;
			flex-direction: column;
			width: 320px;
			border-right: 1px solid #F2F4F8;
		}

		._compMenu._compMenuRight._sections {
			padding: 10px;
			gap: 10px;
			overflow: auto;
		}

		._compMenu ._compList {
			flex: 1;
			overflow-y: auto;
		}

		._compMenu ._compList::-webkit-scrollbar {
			width: 4px;
		}

		._compMenu iframe {
			flex: 1;
		}

		._compMenu._show {
			width: 200px;
		}

		._compMenu ._tabContainerContainer {
			display: flex;
			flex-direction: row;
			margin-bottom: 10px;
			margin-right: 10px;
			width: 170px;
		}

		._compMenu ._tabContainer {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 10px;
			cursor: pointer;
			background-color: #F8FAFB;
			border-radius: 6px;
			gap: 10px;
			font-size: 12px;
			font-weight: 600;
			font-family: Inter;
			padding: 5px 8px;
		}

		._compMenu ._tabContainer ._tab {
			padding: 6px 10px;
			transition: background-color 0.5s;
			border: none;
			background: none;
			font-family: 'Inter';
			font-weight: 500;
			font-size: 12px;
			text-transform: none;
			color: #333333;
		}

		._compMenu ._tabContainer ._tab:hover {
			background: none;
			color: #333333;
		}

		._compMenu ._tabContainer ._tab._selected {
			background-color: #52BD94;
			color: #fff;
			border-radius: 4px;
		}

		._compMenu ._compMenuSearch {
			font-family: 'Inter';
			font-size: 12px;
			font-weight: 600;
			padding: 10px 11px;
			border: 1.5px solid transparent;
			border-radius: 6px;
			outline: none;
			width: 170px;
			background-color: #F8FAFB;
			color: #52BD94;
		}

		._compMenu ._compMenuSearch:focus {
			border-color:#52BD94;
		}

		._compMenu ._compMenuSearch::placeholder {
			color: #52BD9488;
		}

		._compMenu ._compMenuItem img.hover {
			display: none;
		}

		._compMenu ._compMenuItem:hover img.hover,
		._compMenu ._compMenuItem.active img.hover {
			display: inline;
		}

		._compMenu ._compMenuItem:hover img.actual,
		._compMenu ._compMenuItem.active img.actual {
			display: none;
		}

		._compMenu ._sectionThumb {
			width: 100%;
			height: 200px;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center center;
			cursor: pointer;
			border-radius: 4px;
			border: 1.5px solid #F2F4F8;
		}

		._compMenu ._sectionThumb:hover {
			background-color: #F2F4F8;
		}

		._popupMenuBackground ._popupMenu {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: auto;
			padding-left: 5px;
			padding-top: 5px;
		}

		._popupMenuBackground ._contextMenu { 
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: auto;
			padding-top: 5px;
			border-left: 1px solid #52BD94;
			border-radius: 4px;
			background-color: #fff;
			box-shadow: 0px 1px 10px 0px #0000001A;
		}

		._popupMenuBackground ._popupMenuSeperator {
			height: 0px;
		}

		._compList {
			padding-right: 10px;
			display: flex;
			flex-direction: column;
			gap: 15px;
			padding-bottom: 10px;
		}

		._compList ._compMenuItem {
			padding: 10px;
			cursor: pointer;
			background-color: #F8FAFB;
			border-radius: 6px;
			color: #333333E5;
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10px;
			font-size: 12px;
			font-weight: 500;
			font-family: Inter;
			border: 1.5px solid transparent;
			width: 170px;
		}

		._compList ._compMenuItem:hover,
		._compList ._compMenuItem.active {
			border: 1.5px solid #4C7FEE;
			color: #4C7FEE;
			background-color: #4C7FEE0E;
		}

		._compList ._compMenuItem.active svg,
		._compList ._compMenuItem:hover svg,
		._compList ._compMenuItem.active i.fa,
		._compList ._compMenuItem:hover i.fa {
			color: #4C7FEE;
		}

		._popupMenuBackground ._contextMenu ._popupMenuItem:hover {
			background: #00000005;
			color: #52BD94;
		}

		._popupMenuBackground ._contextMenu ._popupMenuItem:hover i.fa {
			color: #52BD94;
		}

		._popupMenuBackground ._contextMenu ._iconHelperSVG {
			color: #CACBCA;
			width: 16px;
			height: 16px;
		}

		._popupMenuBackground ._contextMenu ._popupMenuItem:hover ._iconHelperSVG {
			color: #52BD94;
		}

		._popupMenuBackground ._contextMenu i.fa {
			color: #CACBCA;
		}

		._popupMenuBackground ._popupMenuContainer ._compTemplates {
			display: flex;
			flex-direction: column;
		}

		._popupMenuBackground ._popupMenuContainer ._compTemplates iframe{
			flex: 1;
		}

		._popupMenuBackground ._popupMenuContainer ._compTemplateSections {
			border-bottom: 0.5px dashed rgba(0, 0, 0, 0.3);
		}

		._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection {
			
			padding: 11px 20px 11px 20px;
			cursor: pointer;
		}

		._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection:hover,
		._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection._active {
			background: linear-gradient(90deg, rgba(8, 112, 92, 0.2) 0%, rgba(248, 250, 251, 0) 93.35%);
			color: #08705C;
		}

		._propertyContent {
			display: flex;
			flex-direction: row;
		}

		._pagePropertiesGrid {
			display: flex;
			flex-direction: column;
			width:350px;
		}

		._pageSimplePropGrid {
			width: 250px;
		}

		._popupContainer ._right {
			text-align: right;
			padding: 5px;
		}

		._popupBackground._transparent {
			background: none;
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
		${PREFIX}._dark ._selectionBar, ._dark ._propBar,
		._popupMenuBackground._dark ._popupMenu{
			background-color:#555;
		}

		${PREFIX}._dark button, ._dark select._peSelect, ._dark input._peInput[type='text'],
		._dark ._pvExpressionEditor, ._popupBackground._dark button,
		._dark input._peInput[type='number'] {
			color: #aaa;
			background-color: #222;
			border: 1px solid #333;
		}

		._dark ._pvExpressionEditor input._peInput {
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

		._dark ._propLabel {
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

		._dark ._pvEditor ._microToggle::before {
			background-color: #333;
			color: #777;
		}

		${PREFIX}._dark ._eachProp:hover {

		}
		
		._dark ._pvEditor ._microToggle {
			background-color: #444;
			border-color: #333;
		}

		._dark ._pvEditor ._microToggle._on::before {
			background-color: #222;
			color: #777;
		}

		._dark ._pvEditor ._microToggle._on {
			background-color: #888;
			border-color: #777;
		}		
		
		${PREFIX}._dark ._tooltip:hover::after {
			background-color: #555b;
			color: #bbb;
			border-color: #777;
		}

		._dark ._pillTag {
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

		._dark ._propertyGroupHeader {
			color: #AAA;
		}
		._dark ._propertyGroupHeader i.fa {
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
