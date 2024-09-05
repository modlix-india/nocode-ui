import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './pageEditorStyleProperties';

const PREFIX = '.comp.compPageEditor';
export default function GridStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} {
			display: flex;
			width: 100%;
			height: 100%;
			flex-direction: column;
			overflow: hidden;
			position: relative;
			--comp-item-animation-duration: 1s;
			--comp-item-animation-duration-long: 4s;
		}

		${PREFIX} ._dndGrid {
			display: flex;
			flex:1;
			background-color: #F9F9F9;
			height: 100%;
		}

		${PREFIX} ._topBarGrid {
			display: flex;
			height: 70px;
			background-color: #fff;
			border-bottom: 1px solid rgba(0, 0, 0, 0.10);
		}

		${PREFIX} ._topBarGrid._previewMode{
			height: 0px;
		}

		${PREFIX} ._sideBar {
			width: 70px;
			background-color: #fff;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 10px;
			border-right: 1px solid rgba(0, 0, 0, 0.10)
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
		}

		${PREFIX} ._propBar._compNavBarVisible{
			display: flex;
			flex-direction: column;
			gap: 10px;
			width: auto;
			min-width: 250px;			
		}

		${PREFIX} ._propBar._left{
			border-right: 1px solid rgba(0, 0, 0, 0.10);
		}

		${PREFIX} ._propBar._right{
			box-shadow: 2px 3px 4px 0px #00000040;
			border-left: 1px solid rgba(0, 0, 0, 0.10);
		}

		${PREFIX} ._propBar._right._isDrag {
			position: absolute;
		}

		${PREFIX} ._propBar._right._isDragged {
			opacity: 0.6;
		}

		${PREFIX} ._propBarTabContainer {
			padding: 14px 15px;
			width: 100%;
		}

		${PREFIX} ._propBarTabContainer ._tabContainer {
			height: 46px;
		}
		
		${PREFIX} ._propBarTabContainer ._tabContainer ._tab {
			height: 36px;
		}

		${PREFIX} ._propBarTabContainer svg._iconHelperSVG {
			color: #99999973;
		}

		${PREFIX} ._propBarTabContainer ._tab:hover svg._iconHelperSVG ._gradientFill,
		${PREFIX} ._propBarTabContainer ._tab._selected svg._iconHelperSVG ._gradientFill {
			fill: url(#greenPropBarGradient);
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
			background-color: #1893E90D;
			color: #1893E9;
		}

		${PREFIX} ._compsTree ._treeNode._selected i.fa,
		${PREFIX} ._compsTree ._treeNode:hover i.fa {
			color: #1893E9;
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
			color: #1893E9;
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
    		gap: 15px;
		}

		${PREFIX} ._topLeftBarGrid {
			flex: 1;
			gap: 10px;
			display: flex;
			flex-direction: row;
			align-items: center;
			padding-left: 15px;
		}

		${PREFIX} ._topRightBarGrid {
			display: flex;
			align-items: center;
			padding-right: 10px;
			gap: 15px;
		}

		${PREFIX} select._peSelect {
			height: 35px;
			font-family: Inter;
			font-size: 12px;
			line-height:12px;
			font-weight: 500;
			padding: 5px 15px;
			border-radius: 6px;
			border: none;
			color: #555;
			background-color: #F9F9F9;
			text-transform: uppercase;
			outline: none;
			cursor: pointer;
			width: 100%;
		}

		${PREFIX} button, ${PREFIX} ._popupButtons button {
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
		${PREFIX} input._peInput, ${PREFIX} ._pvExpressionEditor,
		${PREFIX} textarea._peInput, select._peInput {
			color: #000;
			background-color: #F9F9F9;
			font-family: Inter;
			font-weight: 500;
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

		${PREFIX} textarea._peInput {
			flex: 1;
			height: 132px;
			padding: 8px;
			scroll-bar-width: thin;
			resize: none;
		}

		${PREFIX} textarea._peInput::-webkit-scrollbar  {
			width: 2px;
			background: none;
			margin-right: 5px;
		}

		${PREFIX} textarea._peInput::-webkit-scrollbar-thumb {
			background-color: #1893E9;
		}

		${PREFIX} ._overflowContainer {
			height: calc(100vh - 173px);
			overflow: auto;
		}

		${PREFIX} ._overflowContainer._withCopyButtons {
			height: calc(100vh - 228px);
		}

		${PREFIX} ._withDragProperty {
			height: 45vh;
		}

		${PREFIX} ._addSelector {
			background: #1893E9;
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

		${PREFIX} input._peInput[type='text'], ${PREFIX} ._pvExpressionEditor, input._peInput[type='number'] {
			height: 35px;
			font-size: 12px;
			line-height:12px;
			border-radius: 6px;
			padding-left: 8px;
			outline: none;
			flex:1;
		}

		${PREFIX} ._pvExpressionEditor {
			padding-top: 0px;
			padding-bottom: 0px;
			border-radius: 6px;
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

		${PREFIX} ._pvExpressionEditor input._peInput[type='text'], ${PREFIX} ._pvExpressionEditor input._peInput[type='number']{
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
			width: 240px;
			left: 22px;
			z-index: 1;
		}

		${PREFIX} ._urlInput._peInput input {
			border: none;
			outline: none;
			height: 100%;
			flex: 1;
			background: transparent;
			padding-left: 5px;
		}

		${PREFIX} ._urlInput._peInput {
			background: #FFFFFF;
			border-radius: 4px;
			position: static;
			height: 32px;
			display: flex;
    		align-items: center;
			padding: 8px;
			border-radius: 8px;
			border: none;
			gap: 8px;
			box-shadow: 0px 1px 4px 0px #0000001A;
			margin-left: 10px;
		}

		${PREFIX} ._urlInput ._urlInputIcon {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		${PREFIX} ._urlInput ._urlInputIcon svg {
			color: #99999973;
			fill: black;
		}

		${PREFIX} ._urlInput._peInput svg {
			min-width: 20px;
			cursor: pointer;
		}

		${PREFIX} ._textValueEditorContainer {
			color: #000;
			background-color: #F9F9F9;
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

		${PREFIX} ._sideBar ._iconMenu {
			background: #F9F9F9;
			color: #FFF;
			border: none;
		}

		${PREFIX} ._sideBar ._seperator {
			width: 36px;
			height: 1px;
			background-color: #0000001A;
		}
		
		${PREFIX} ._sideBar ._iconMenu._active,
		${PREFIX} ._sideBar ._iconMenu:hover {
			background: #000000;
			color: #FFF;
		}

		${PREFIX} ._sideBar ._arrow svg._iconHelperSVG {
			width: 20px;
		}

		${PREFIX} ._iconMenu._compMenuButton {
			width: 40px;
			height: 40px;
			margin-bottom: 10px;
		}
		

		${PREFIX} button:hover, ${PREFIX} select:hover,
		${PREFIX} ._iconMenuOption:hover,
		${PREFIX} ._popupButtons button:hover {
			background-color: rgba(77, 127, 238, 0.05);
    		color: #000;
		}

		${PREFIX} ._iconMenuBody ._iconMenuOption:hover i.fa,
		${PREFIX} ._iconMenuBody ._iconMenuOption:hover svg._iconHelperSVG,
		${PREFIX} ._iconMenu._active svg._iconHelperSVG {
			color: #000;
		}
		${PREFIX} ._sideBar ._iconMenu._active  svg._iconHelperSVG,
		${PREFIX} ._sideBar ._iconMenu:hover  svg._iconHelperSVG {
			color: #FFFFFF;
		}

		${PREFIX} ._sideBar ._iconMenu  svg._iconHelperSVG {
			color: #000000;
			width: 16px;
			height: 16px;
		}

		${PREFIX} i.fa {
			color: #000000;
			font-size: 18px;
		}

		${PREFIX} ._iconMenu:hover i.fa {
			color: #1893E9;
		}

		${PREFIX} ._iconMenu._active i.fa {
			color: #1893E9;
		}

		${PREFIX} ._iconMenuOption, ${PREFIX} ._popupMenuBackground ._popupMenuItem  {
			padding: 10px 15px;
			color: #96A1B4;
			display: flex;
			align-items: center;
			gap: 8px;
			white-space: nowrap;
			cursor: pointer;
			margin-bottom: 2px;
			font-family: Inter;
			border: none;
			background-color: transparent;
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
			min-height: 36px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 5px;
			width: 36px;
			border-radius: 8px;
		}

		${PREFIX} ._iconMenu:hover ._iconMenuBody{
			display: block;
		}

		${PREFIX} ._topBarGrid ._iconMenuBody {
			top: 100%;
		}

		${PREFIX} ._iconMenu:hover {
			background-color: rgba(77, 127, 238, 0.05);
			
		}

		${PREFIX} ._selectionBar ._iconMenu:hover {
			background-color: transparent;
			color: #1893E9;
		}

		${PREFIX} ._iconMenu._active {
			background-color: rgba(77, 127, 238, 0.05);
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
			background: #F9F9F9;
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
			color: #1893E9;
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
			background: #F9F9F9;		
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
			
		}

		${PREFIX} ._scaleControlContainer ._scaleControl {
			display: inline-flex;
			position: sticky;
			left: -20px;
			top: 0;
			background: #FFFFFF;
			margin-bottom: 15px;
			border-radius: 4px;
			padding: 0px 15px;
			border: 1px solid #0000000D;
			align-items: stretch;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control {
			min-width: 20px;
			display: flex;
			cursor: pointer;
			font-size: 11px;
			font-weight: 500;
			padding: 8px 5px;
			align-items: center;
			justify-content: center;
			border: none;
			background-color: transparent;
			margin-bottom: 0px;
			white-space: nowrap;
			color: #000000CC;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control svg {
			color: #00000066;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control._text {
			user-select: none;
			width: 50px;
			border-radius: 4px;
			background-color: #F9F9F9;
			padding: 0px;
			margin: 6px 0px;
		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control:hover,
		${PREFIX} ._scaleControlContainer ._scaleControl ._control._active {

		}

		${PREFIX} ._scaleControlContainer ._scaleControl ._control._device:hover,
		${PREFIX} ._scaleControlContainer ._scaleControl ._control._device._active {

		}

		${PREFIX} ._microToggle2 {
			padding: 2px;
			border-radius: 10px;
			background-color: #F9F9F9;
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

		${PREFIX} ._microToggle2._withText {
			height: auto;
			width: auto;
			padding-left: 16px;
			padding-right: 15px;
			color: #333;
			border-radius: 20px;
		}

		${PREFIX} ._microToggle2::before {
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

		${PREFIX} ._microToggle2._withText::before {
			width: 10px;
			height: 10px;
			right: 3px;
		}

		${PREFIX} ._microToggle2._on {
			background-color: #52BD94;
			opacity: 0.8;
			border: 1px solid #198A61;
			color: #FFF;	
		}

		${PREFIX} ._microToggle2._on::before {
			right: calc(100% - 7px);
			transform: translateY(-50%);
			background-color: #FFF;
			border: 1px solid #FFF;
		}

		${PREFIX} ._microToggle2._withText._on::before {
			right: calc(100% - 13px);
		}

		${PREFIX} ._confineWidth {
			overflow: hidden;
		}

		${PREFIX} ._simpleEditor {
			padding: 5px 15px;
		}

		${PREFIX} ._combineEditors ._simpleEditor {
			padding: 0px;
		}

		${PREFIX} ._combineEditors ._simpleEditor._expandWidth {
			width: 100%
		}

		${PREFIX} ._simpleEditorAngleSize {
			display: flex;
			align-items: center;
			gap: 2px;
			overflow: hidden;
		}

		${PREFIX} ._simpleEditorPixelSize {
			display: flex;
			align-items: center;
			gap: 2px;
			overflow: hidden;
			height: 35px;
		}

		${PREFIX} ._simpleEditorPixelSize ._inputDropdownContainer {
			font-family: Inter;
			font-size: 12px;
			border: none;
			border-radius: 6px;
			color: #555;
			background-color: #F9F9F9;
			cursor: pointer;
			padding: 5px 8px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			height: 35px;
			overflow: hidden;
		}

		${PREFIX} ._simpleEditorPixelSize ._inputDropdownContainer input {
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

		${PREFIX} ._simpleEditorPixelSize ._inputDropdownContainer ._simpleEditorSelect {
			min-width: 60px;
			flex: 0.5;
			padding-left: 0px;
			width: 64px;
		}

		${PREFIX} ._simpleEditorPixelSize ._inputDropdownContainer ._simpleEditorSelect ._selectedOption {
			margin-right: 5px;
			text-align: right;
		}

		${PREFIX} ._simpleEditorPixelSize ._simpleEditorSelect {
			flex: 1;
			background-color: transparent;
		}

		${PREFIX} ._simpleEditorSelect,
		${PREFIX} ._simpleEditorInput{
			min-height: 35px;
			min-width: 35px;
			font-family: Inter;
			font-weight: 500;
			font-size: 12px;
			border: none;
			border-radius: 6px;
			color: #000000;
			background-color: #F9F9F9;
			cursor: pointer;
			padding: 5px 15px;
			flex: 1;
			outline: none;
		}

		${PREFIX} ._simpleEditorSelect {
			text-transform: uppercase;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;
		}

		${PREFIX} ._page_Selector {
			width: 186px;
		}

		${PREFIX} ._page_Selector ._simpleEditorSelect {	
			height: 38px;
			border-radius: 20px;
			background: transparent;
			font-weight: 600;
			text-transform: none;
		}

		${PREFIX} ._page_Selector ._simpleEditorSelect path {
			fill: #000000;
		}
		${PREFIX} ._add_page_btn_container {
			padding: 10px 10px;
		}

		${PREFIX} ._add_page_btn_container button._add_page_btn {
			border-radius: 2px;
			background: #1893E9;
			color: #fff;
			width: 100%;
			height: 30px;
		}

		${PREFIX} button._iconOnly {
			border: none;
			background: transparent;
			padding: 0px;
			margin: 0px;
		}
		
		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody{
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


		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody {
		}

		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody ._options_divider {
			border-bottom: 1px solid rgba(0, 0, 0, 0.10);
		}

		${PREFIX} ._simpleEditorSelect svg {
			min-width: 8px;
		}

		${PREFIX} ._simpleEditorSelect ._selectedOption {
			min-width: calc(100% - 8px);
		}

		${PREFIX} ._simpleEditorSelect ._selectedOption._placeholder {
			text-transform: capitalize;
			color: #757575;
		}

		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption {
			padding: 10px;
			color: #0000004D; 
			border-radius: 4px;
			white-space: nowrap;
			font-weight: 400;
			font-size: 12px;
			font-family: Inter;
		}

		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption._hovered {
			background-color: #F9F9F9;
			border-radius: 4px;
			color: #52BD94;
		}

		${PREFIX} ._simpleEditorSelect ._simpleEditorDropdownBody ._simpleEditorDropdownOption._selected {
			color: #52BD94;
			
		}

		${PREFIX} ._simpleEditorIcons {
			border-radius: 6px;
			display: flex;
			align-items: center;
			flex-direction: row;
			height: 36px;
			padding: 2px;
			gap: 2px;
		}

		${PREFIX} ._simpleEditorIcons ._eachIcon {
			cursor: pointer;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			border-radius: 6px;
		}

		${PREFIX} ._simpleEditorIcons._bground {
			background: #F9F9F9;
		}


		${PREFIX} ._simpleEditorIcons._bground ._eachIcon:hover,
		${PREFIX} ._simpleEditorIcons._bground ._eachIcon._active {
			background: #FFF;
			box-shadow: 0px 2px 4px 0px #0000001A;
		}

		${PREFIX} ._simpleEditorIcons ._eachIcon svg path,
		${PREFIX} ._simpleEditorIcons ._eachIcon svg circle,
		${PREFIX} ._simpleEditorIcons ._eachIcon svg rect,
		${PREFIX} ._simpleEditorIcons ._eachIcon svg rect {
			fill: #333333;
			stroke: rgba(142, 144, 164, 0.5);
		}

		${PREFIX} ._simpleEditorIcons._bground ._eachIcon svg path,
		${PREFIX} ._simpleEditorIcons._bground ._eachIcon svg circle,
		${PREFIX} ._simpleEditorIcons._bground ._eachIcon svg rect,
		${PREFIX} ._simpleEditorIcons._bground ._eachIcon svg line {
			fill: #E3E5EA;
			stroke: rgba(142, 144, 164, 0.5);
		}

		${PREFIX} ._simpleEditorIcons ._eachIcon:hover svg path,
		${PREFIX} ._simpleEditorIcons ._eachIcon:hover svg circle,
		${PREFIX} ._simpleEditorIcons ._eachIcon:hover svg rect,
		${PREFIX} ._simpleEditorIcons ._eachIcon:hover svg line,
		${PREFIX} ._simpleEditorIcons ._eachIcon._active svg path,
		${PREFIX} ._simpleEditorIcons ._eachIcon._active svg circle,
		${PREFIX} ._simpleEditorIcons ._eachIcon._active svg rect,
		${PREFIX} ._simpleEditorIcons ._eachIcon._active svg line {
			fill: #52BD94;
			stroke: #52BD94;
		}

		${PREFIX} ._simpleEditorShadow {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}

		${PREFIX} ._simpleEditorShadow ._eachShadowEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._simpleEditorShadow ._inset {
			display: flex;
			align-items: center;
			gap: 5px;
		}

		${PREFIX} ._simpleEditorShadow ._color_controls {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._simpleEditor._warning{
			font-size: 11px;
			font-family: Inter;
			color: #FFCC00;
			padding: 5px 15px;
			
		}

		${PREFIX} ._simpleEditorBigSelector {
			padding: 5px 15px;
		}

		${PREFIX} ._simpleEditorBigSelector ._searchBox {
			height: 35px;
			display: flex;
			align-items: center;
			border: 0.5px solid #DFE1E2;
			background-color: #F9F9F9;
			border-radius: 6px;
			padding: 0px 10px;
		}

		${PREFIX} ._simpleEditorBigSelector input {
			border: none;
			height: 100%;
			font-family: Inter;
			font-size: 12px;
			border: none;
			background: transparent;
			flex: 1;
			outline: none;
		}

		${PREFIX} ._simpleEditorControls {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._simpleEditorBigSelector ._searchResult {
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

		${PREFIX} ._simpleEditorBigSelector ._searchResult ._searchResultItem {
			display: flex;
			flex-direction: column;
			cursor: pointer;
		}

		${PREFIX} ._simpleEditorBigSelector ._searchResult ._searchResultItem ._animationIcon {
			width: 66px;
			height: 66px;
			border-radius: 4px;
			background: #CFCFD81A;
			border-radius: 4px;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._searchResultItem ._animationIcon ._hovered {
			display: none;
		}

		${PREFIX} ._searchResultItem:hover ._animationIcon ._default,
		${PREFIX} ._searchResultItem._selected ._animationIcon ._default {
			display: none;
		}

		${PREFIX} ._searchResultItem ._animationIcon ._default {
			display: block;
		}

		${PREFIX} ._searchResultItem:hover ._animationIcon ._hovered,
		${PREFIX} ._searchResultItem._selected ._animationIcon ._hovered {
			display: block;
		}

		${PREFIX} ._simpleEditorBigSelector ._searchResult ._searchResultItem ._animationName {
			font-size: 11px;
			font-weight: 500;
			font-family: Asap;
			text-align: center;
		}

		${PREFIX} ._simpleEditorBigSelector ._searchResult ._searchResultItem:hover ._animationName {
			color: #4FBBB2;
		}

		${PREFIX} ._simpleEditorGroup {
			padding: 15px;
		}

		${PREFIX} ._simpleEditorGroupTitle {
			font-family: Inter;
			font-size: 12px;
			font-weight: 600;
			line-height: 14px;
			padding: 5px 10px;
			border-radius: 4px 4px 0px 0px;
			background: #F9F9F9;
			height: 30px;
			display: flex;
			align-items: center;
		}

		${PREFIX} ._simpleEditorGroupTitle._gradient {
			border-radius: 4px 4px 0px 0px;
			color: #FFF;
			background: linear-gradient(90deg, rgba(67, 178, 255) 0%, rgba(82, 189, 148) 100%);
		}

		${PREFIX} ._simpleEditorGroupTitle ._controls {
			flex: 1;
			height: 100%;
			display: flex;
			justify-content: flex-end;
		}

		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg path,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg circle,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg rect,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon svg line{
			fill: #FFF;
			stroke: #FFF
		}

		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg path,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg circle,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg rect,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon:hover svg line,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg path,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg circle,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg rect,
		${PREFIX} ._simpleEditorGroupTitle._gradient ._simpleEditorIcons ._eachIcon._active svg line {
			fill-opacity: 0.5;
			stroke-opacity: 0.5;
		}

		${PREFIX} ._simpleEditorGroup ._simpleEditorGroupContent {
			padding: 10px;
			border-radius: 0px 0px 4px 4px;
			background: rgba(248, 250, 251, 0.60);
			display: flex;
			flex-direction: column;
			gap: 10px;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._simpleEditorGroupContent ._editorLine {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			gap: 5px;
		}

		${PREFIX} ._simpleEditorGroupContent ._editorLine ._simpleEditorPixelSize {
			width: 100%;
		}

		${PREFIX} ._simpleEditorGroupContent ._editorLine ._label {
			color: #33333399;
			font-family: Inter;
			font-size: 12px;
			font-weight: 500;
			white-space: nowrap;
		}

		${PREFIX} ._simpleEditorAngle {
			min-height: 60px;
			min-width: 60px;
			border-radius: 50%;
			background-color: #F9F9F9;
			position: relative;
		}

		${PREFIX} ._simpleEditorGroupContent ._simpleEditorAngle{
			border: 1px solid rgba(67, 178, 255);
		}

		${PREFIX} ._simpleEditorAngle ._angleTrack {
			height: 100%;
			position: absolute;
			left: 50%;
			transform-origin: center center;
			margin-left: -4px;
		}

		${PREFIX} ._simpleEditorAngle ._angleTrack::before {
			content: '';
			display: block;
			width: 10px;
			height: 10px;
			background: linear-gradient(150deg, #43B2FF 13.39%, #52BD94 86.61%);
			border-radius: 50%;
			margin-top: 2px;
			cursor: pointer;
		}

		${PREFIX} ._simpleEditorButtonBar {
			height: 35px;
			display: flex;
			flex-direction: row;
			padding: 5px;
			font-family: Inter;
			font-size: 12px;
			gap: 5px;
			background-color: #F9F9F9;
			border-radius: 6px;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._simpleEditorButtonBar ._simpleButtonBarButton {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0px 10px;
			border-radius: 4px;
			cursor: pointer;
		}

		${PREFIX} ._simpleEditorButtonBar ._simpleButtonBarButton._selected {
			background-color: #1893E9;
			color: #FFF;
			box-shadow: 0px 1px 3px 0px #0000001A;
		}

		${PREFIX} ._svgButton {
			border: none;
			background: transparent;
		}

		${PREFIX} ._combineEditors {
			display: flex;
			flex-direction: row;
			align-items: center;			
			padding: 5px 15px;
			gap: 5px;
			width: 100%;
		}

		${PREFIX} ._detailStyleEditor ._combineEditors ._simpleLabel {
			padding: 0px;
			padding-right: 5px;
			flex: 1;
		}

		${PREFIX} ._detailStyleEditor ._combineEditors ._simpleEditor {
			width: auto;
		}

		${PREFIX} ._combineEditors ._onePart {
			flex: 1;
		}

		${PREFIX} ._combineEditors ._twoParts {
			flex: 2;
		}

		${PREFIX} ._combineEditors ._oneAndHalfParts {
			flex: 1.5;
		}

		${PREFIX} ._combineEditors ._simpleEditorInput,
		${PREFIX} ._combineEditors ._simpleEditorSelect {
			padding: 8px;
			width: 100%;
		}

		${PREFIX} ._combineEditors ._combineEditors {
			padding: 0;
		}

		${PREFIX} ._combineEditors ._eachProp {
			padding: 0;
		}

		${PREFIX} ._spacer {
			width: 10px;
			height: 15px;
		}

		${PREFIX} ._combineEditors._spaceBetween {
			justify-content: space-between;
		}

		${PREFIX} ._combineEditors._spaceAround {
			justify-content: space-around;
		}

		${PREFIX} ._combineEditors._centered {
			justify-content: center;
		}

		${PREFIX} ._combineEditors._alignEnd {
			justify-content: flex-end;
		}

		${PREFIX} ._combineEditors._vertical {
			flex-direction: column;
			align-items: flex-start;
		}

		${PREFIX} ._combineEditors._top {
			align-items: flex-start;
		}

		${PREFIX} ._detailStyleEditor{
			min-width: 300px;
			width: 300px;
			min-height: 400px;
			background-color: #FFF;
			box-shadow: 0px 2px 15px 0px #0000001A;
			border: 1px solid #00000029;
			position: fixed;
			z-index: 4;
			border-radius: 9px;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._detailStyleEditor ._header {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding: 10px;
			border-bottom: 1px solid #0000000F;
			font-family: Inter;
			font-size: 12px;
			font-weight: 600;
			line-height: 12px;
			color: #000000;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
			padding-left: 20px;			
			cursor: move;
			height: 44px;
		}

		${PREFIX} ._detailStyleEditor ._header ._title {
			flex: 1;
		}

		${PREFIX} ._detailStyleEditor ._header ._close {
			cursor: pointer;
		}

		${PREFIX} ._detailStyleEditor ._editorContent {
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

		${PREFIX} ._simpleLabel {
			font-size: 12px;
			font-family: Inter;
			color: #222222B2;
			white-space: nowrap;
			font-weight: 500;
		}

		${PREFIX} ._simpleLabel._withPadding {
			padding: 5px 15px;
		}

		${PREFIX} ._detailStyleEditor ._simpleLabel {
			padding-left: 15px;
			padding-right: 15px;
		}

		${PREFIX} ._positionKnob #background{
			fill: #F9F9F9;
		}

		${PREFIX} ._positionKnob #knob {
			fill: #FFF;
			filter: drop-shadow(0px 0px 3px #0000000D)
		}

		${PREFIX} ._positionKnob #left,
		${PREFIX} ._positionKnob #top,
		${PREFIX} ._positionKnob #right,
		${PREFIX} ._positionKnob #bottom {
			fill: #E3E5EA;
		}

		${PREFIX} ._positionKnob._left #left,
		${PREFIX} ._positionKnob._top #top,
		${PREFIX} ._positionKnob._right #right,
		${PREFIX} ._positionKnob._bottom #bottom {
			fill: #1893E9;
		}

		${PREFIX} ._spacingEditor._margin {
			margin: 0px 15px;
			position: relative;
			border-radius: 6px;
			border: 2px solid #E3E5EA;
			height: 166px;
		}

		${PREFIX} ._spacingEditor._margin._hasValue,
		${PREFIX} ._spacingEditor ._padding._hasValue {
			border-color: #52BD94
		}

		${PREFIX} ._spacingEditor ._padding {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			border: 2px solid #E3E5EA;
			height: 90px;
			min-width: 58%;
			border-radius: 6px;
		}

		${PREFIX} ._spacingEditor ._label {
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

		${PREFIX} ._spacingEditor ._label._hasValue{
			color: #52BD94;
		}

		${PREFIX} ._spacingEditor ._changer {
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

		${PREFIX} ._spacingEditor ._changer ._header {
			font-size: 11px;
			font-family: Inter;
			font-weight: 600;
			color: #000000;
			user-select: none;
			padding: 5px;
			background-color: #F9F9F9;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
			border-bottom: 1px solid #0000000F;
			padding-left: 20px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 35px;
		}

		${PREFIX} ._spacingEditor ._changer ._body {
			padding: 10px 15px;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._spacingEditor ._value {
			height: 25px;
			min-width: 45px;
			background: #F9F9F9;
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

		${PREFIX} ._spacingEditor ._value._default {
			color: #D2D3DB;
		}

		${PREFIX} ._spacingEditor ._padding ._value {
			font-size: 10px;
		}

		${PREFIX} ._spacingEditor ._square {
			position: absolute;
			width: 8px;
			height: 8px;
			border-radius: 1px;
			background-color: #E3E5EA;
			opacity: 0.5;
		}

		${PREFIX} ._spacingEditor ._circle {
			position: absolute;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background-color: #E3E5EA;
			opacity: 0.5;
		}

		${PREFIX} ._spacingEditor ._square._hasValue,
		${PREFIX} ._spacingEditor ._circle._hasValue {
			background-color: #52BD94;
			opacity: 1;
		}

		${PREFIX} ._spacingEditor ._top {
			top: -5px;
			left: 50%;
			transform: translateX(-50%);
		}

		${PREFIX} ._spacingEditor ._bottom {
			bottom: -5px;
			left: 50%;
			transform: translateX(-50%);
		}

		${PREFIX} ._spacingEditor ._left {
			left: -5px;
			top: 50%;
			transform: translateY(-50%);
		}

		${PREFIX} ._spacingEditor ._right {
			right: -5px;
			top: 50%;
			transform: translateY(-50%);
		}

		${PREFIX} ._spacingEditor ._value._top { top: 5px; }
		${PREFIX} ._spacingEditor ._value._bottom { bottom: 5px; }
		${PREFIX} ._spacingEditor ._value._left { left: 5px; }
		${PREFIX} ._spacingEditor ._value._right { right: 5px; }

		${PREFIX} ._screenSizes {
			height: 38px;
		}

		${PREFIX} ._buttonBar._screenSizes {
			height: 70px;
		}

		${PREFIX} ._screenSizes:hover {
			background-color: #FFFFFF;
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
			background-color: #FFF;
			border-radius: 6px;
			font-family: Inter;
			font-size: 11px;
			font-weight: 600;
			color: #333333E5;
			cursor: pointer;
    		transform-origin: top left;
			padding-left: 30px;
			border: 1.5px solid #3333331A;
		}

		${PREFIX} ._iframeCenter {
			display: table-cell;
			flex: 1;
			padding: 70px;
			padding-top: 30px;
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
			height: calc(100% - 70px);
		}

		${PREFIX} ._dndIframeContentContainer {
			display: flex;
			flex: 1;
			flex-direction: column;
			width: calc(100% - 70px);
			position: relative;
		}

		${PREFIX} ._selectionBar {
			display: flex;
			background-color: #fff;
			height: 29px;
			padding-left: 28px;
			z-index: 1;
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

		${PREFIX} ._dragBar ._leftIcon, ${PREFIX} ._dragBar ._rightIcon {
			outline: none;
			cursor: pointer;
		}

		${PREFIX} ._iframeContainer._previewMode {
			max-height: 100%;
		}

		${PREFIX} ._previewModeCloser {
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

		${PREFIX} ._previewModeCloser:hover {
			bottom: 25px
		}

		${PREFIX} ._tabBar {
			width: 100%;
			display: flex;
			background: #F9F9F9;
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
			background: #F9F9F9;
			border-radius: 6px;
			margin-left: 15px;
			margin-right: 15px;
			height: 45px;
			position: relative;		
			padding: 0px 5px;	
			margin-bottom: 10px;
		}

		${PREFIX} ._addArrayItemButton {
			color: #FFFFFF;
			background: #52BD94;
			border-radius: 2px;
			padding: 3px 8px;
			border: none;
			box-shadow: 0px 1px 6px 2px #0000001A;
		}

		${PREFIX} .commonTriStateCheckbox::before {
			background: black;
		}

		${PREFIX} ._propContainer {
			width: 100%;
			flex: 1;
		}

		${PREFIX} ._propertyEditor{
			display: flex;
			flex-direction: column;
			position: relative;
		}

		${PREFIX} ._eachProp {
			font-size: 12px;
			padding: 5px 20px;
			display: flex;
			flex-direction: column;
			gap: 5px;
			border-radius: 4px;
			position: relative;
		}

		${PREFIX} ._eachProp svg {
			cursor: pointer;
		}

		${PREFIX} ._pvEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		${PREFIX} ._pvEditor ._microToggle {
			width: 20px;
			background-color: #F9F9F9;
			height: 10px;
			border-radius: 2px;
			position: relative;
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
			background-color: #E8EAEB;
			transition: left 0.5s, background-color 0.5s;
			font-size: 9px;
			text-align: center;
			font-weight: bold;
			padding: 0px 2px;
			text-align: center;
		}

		${PREFIX} ._pvEditor ._microToggle._on {
			background-color: #E8EAEB;
		}

		${PREFIX} ._pvEditor ._microToggle._on::before {
			left: 50%;
			background-color: #C8CACB;
			color: #eee;
		}

		${PREFIX} ._pvValueEditor {
			display: flex;
			gap: 5px;
			flex: 1;
		}

		${PREFIX} ._propLabel {
			color: #22222299;
			display: flex;
			gap: 5px;
			align-items: center;
			text-transform: capitalize;
			font-family: Inter;
			white-space: nowrap;
		}

		${PREFIX} ._propLabel i.fa {
			cursor: pointer;
		}

		${PREFIX} ._propValue ._peInput {
			width: 20px;
		}

		${PREFIX} ._propValue._padding {
			background-color: #F9F9F977;
			border: 1px solid #F9F9F9;
			border-radius: 4px;
			min-width: 300px;
		}

		${PREFIX} ._propValue ._propertyGroup {
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

		${PREFIX} ._propertyGroup {
			display: flex;
			flex-direction: column;
			border-bottom: 1px solid #0000000D;
		}

		${PREFIX} ._propertyGroup._opened ._propertyGroupContent {
			padding-bottom: 8px;
		}

		${PREFIX} ._propertyGroupContent {
			transition: padding-bottom 0s;
		}

		${PREFIX} ._propertyGroupHeader {
			font-family: Inter;
			font-size: 12px;			
			color: #333;
			padding: 14px 15px;
			cursor: pointer;
			border-radius: 3px;
			display: flex;
			align-items: center;
			flex-direction: row;			
			gap: 5px;
			font-weight: 600;
		}

		${PREFIX} ._propertyGroupHeaderStar {
			fill: #52BD94;
			transform: scale(1.4);
		}

		${PREFIX} ._propertyGroupHeaderIcon {
			flex: 1;
			display: flex;
			flex-direction: row;
			gap: 15px;
			font-size: 15px;
			font-weight: 200;
			justify-content: flex-end;
			font-family: monospace;
		}

		${PREFIX} ._propertyGroup._closed ._propertyGroupHeader {
			margin-bottom: 0px;
		}

		${PREFIX} ._propertyGroupHeader i.fa {
			transition: transform 0.5s;
			color: #eee;
		}

		${PREFIX} ._propertyGroup._closed i.fa {
			transform: rotate(-90deg);
		}

		${PREFIX} ._propertyGroup ._detailsSwitchEditor {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			color: #333333;
		}

		${PREFIX} ._propertyGroup ._detailsSwitchEditor._open,
		${PREFIX} ._propertyGroup ._detailsSwitchEditor:hover {
			color: #2680EB;
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
			border-bottom: 1px solid #ddd;
			padding: 5px;
			padding-top: 20px;
			position: relative;
		}

		${PREFIX} ._eachProperty i.fa._controlIcons {
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

		${PREFIX} ._eachProperty i.fa-close._controlIcons {
			left: 24px;
		}

		${PREFIX} ._eachProperty:hover i.fa {
			color: inherit;
		}

		${PREFIX} ._eachProperty ._pvEditor {
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

		${PREFIX} ._popupContainer._formEditor {
			width: 600px;
			height: 650px;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent{
			height: 100%;
			width: 100%;
			padding: 20px;
		}

		${PREFIX} ._popupContainer._formEditor ._formButton {
			display: flex;
			justify-content: space-between;
		}

		${PREFIX} ._popupContainer._formEditor ._formButton .fa-close {
			margin-top: 10px;
			margin-right: 10px;
			cursor:pointer;
			transition: transform 0.2s ease-in-out;
		}

		${PREFIX} ._popupContainer._formEditor ._formButton ._backButton {
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

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._generateButton {
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

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorBottomBorder {
			margin-top: 15px;
			margin-bottom: 10px;
			background: rgba(0, 0, 0, 0.10);
			height: 1px;
			margin-left: 5px;
			margin-right: 5px;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorHeader {
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

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorSubHeader {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 400;
			line-height: 12px;
			letter-spacing: 0.12px;
			padding: 5px;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorFilesTitle {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 500;
			line-height: 12px;
			letter-spacing: 0.12px;
			padding: 5px;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorOptions {
			padding: 5px;
			width: 100%;
			height: 42vh;
			display: flex;
			flex-wrap: wrap;
			margin-top: 10px;
			overflow-y: scroll;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formEditorOptionsPagination {
			width: 100%;
			height: 40px;
			display: flex;
			justify-content: space-between;
			align-items: end;
		}

		${PREFIX} ._formEditorOptionsPagination ._paginationPrev {
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

		${PREFIX} ._formEditorOptionsPagination ._paginationPages {
			width: 100px;
			text-align: center;
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 600;
			line-height: 14px;
		}

		${PREFIX} ._formEditorOptionsPagination ._paginationNext {
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

		${PREFIX} ._imagePopupContainer ._fileBrowser {
			height: 60vh;
		}

		${PREFIX} ._paginationContainer ._prevButton {
			cursor: pointer;
			color: rgba(0, 0, 0, 0.6);
		}

		${PREFIX} ._paginationContainer ._nextButton {
			cursor: pointer;
			color: rgba(0, 0, 0, 0.6);
		}

		${PREFIX} ._paginationContainer ._pageButton {
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			background: rgba(0, 0, 0, 0.05);
			cursor: pointer;
		}

		${PREFIX} ._paginationContainer ._pageButtonActive {
			color: #fff;
			background: #0085F2;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorOptions ._formEditorEachOption {
			width: 161px;
			height: 201px;
			display: flex;
			flex-direction: column;
			padding: 10px;
			cursor: pointer;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorEachOption:hover ._formEditorEachOptionPreview {
			box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.10);
			border: 1px solid rgba(66, 126, 228, 0.80);
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorEachOption ._formEditorEachOptionPreview {
			height: 80%;
			border-radius: 4px;
			background: #F9F9F9;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorEachOption ._formEditorEachOptionName {
			margin-top: 15px;
			color: rgba(0, 0, 0, 0.80);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 600;
			line-height: 12px;
			letter-spacing: 0.12px;
		}

		${PREFIX} ._popupContainer._formEditor ._formEditorContent ._formElements {
			height: 400px;
			width: 100%;
			margin-bottom: 20px;
			display: flex;
			overflow-y: scroll;
		}

		${PREFIX} ._popupContainer._formEditor ._formElements ._formFieldsAndButtons {
			flex: 1;
		}

		${PREFIX} ._popupContainer._formEditor ._formFieldsAndButtons ._formFieldsAndButtonsTitle {
			color: rgba(0, 0, 0, 0.40);
			font-family: Inter;
			font-size: 12px;
			font-style: normal;
			font-weight: 500;
			line-height: 12px;
			letter-spacing: 0.12px;
			margin-left: 15px;
		}

		${PREFIX} ._popupContainer._formEditor ._formFieldsAndButtons ._formFieldAndButton {
			height: 44px;
			border-radius: 4px;
			background: #F9F9F9;
			margin: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		${PREFIX} ._popupContainer._formEditor ._formFieldAndButton ._formFieldAndButtonTitle {
			color: rgba(0, 0, 0, 0.80);
			font-family: Inter;
			font-size: 14px;
			font-style: normal;
			font-weight: 500;
			line-height: 14px;
			padding-left: 20px;
		}

		${PREFIX} ._popupContainer._formEditor ._formFieldAndButton ._formFieldAndButtonCheckbox {
			padding-right: 20px;
			width: 18px;
			height: 18px;
			cursor: pointer;
		}

		${PREFIX} ._popupBackground ._popupContainer ._progressBar {
			flex: 1;
			text-align: center;
			padding-top: 150px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._progressBar i.fa {
			font-size: 50px;
		}

		${PREFIX} ._popupBackground ._popupContainer._popupContainerWithPreview {
			flex-direction: row;
			width: 50vw;
			height: 60vh;
		}

		${PREFIX} ._popupBackground ._popupContainer._popupContainerWithPreview ._mdPreviewContainer {
			overflow:auto;
		}

		${PREFIX} ._popupBackground ._popupContainer._popupContainerWithPreview ._mdPreviewContainer ._markDownContent {
			height: 400px;
			width: 400px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._jsonEditorContainer{
			border: 1px solid #eee;
			border-radius: 4px;
			padding: 2px;
			width:400px;
			height: 400px;
			transition: width 0s, height 0s;
		}

		${PREFIX} ._popupBackground ._popupContainer ._jsonEditorContainer > * {
			transition: width 0s, height 0s;
		}

		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionBrowser {
			height: 450px;
			width: 540px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionBrowser ._selectors {
			display: flex;
			gap: 5px;
			align-items: center;
		}

		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionDisplay {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			overflow: auto;
		}

		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionDisplay._inProgress {
			height: 100%;
			justify-content: center;
			align-items: center;
			padding-bottom: 5%;
		}
		
		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionDisplay ._eachIcon {
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

		${PREFIX} ._popupBackground ._popupContainer ._iconSelectionDisplay ._eachIcon:hover {
			background-color: #ddd;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathParts {
			display: flex;
			flex-direction: row;
			gap: 5px;
			flex:1;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathContainer {
			display: flex;
			gap: 10px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathContainer i.fa {
			cursor: pointer;
		}

		${PREFIX} ._popupBackground ._popupContainer ._eachIcon input{
			font-size: 11px;
			border: none;
			width: 80px;
			background-color: #eee;
			padding:0px 5px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._eachIcon ._deleteButton {
			position: absolute;
			display: none;
			right: 5px;
			top: 5px;
		}
		${PREFIX} ._popupBackground ._popupContainer ._eachIcon:hover ._deleteButton {
			display: block;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathParts span {
			padding: 0px 5px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._eachIcon._upload {
			border: 2px dashed #ccc;
		}

		${PREFIX} ._popupBackground ._popupContainer ._eachIcon input._peInput[type="file"] {
			position: absolute;
			opacity: 0;
			width: 100%;
    		height: 100%;
			cursor: pointer;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathParts span._clickable {
			cursor: pointer;
			border-radius: 3px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._pathParts span._clickable:hover {
			color: #000;
			background-color: #eee;
		}

		${PREFIX} ._popupMenuBackground, ${PREFIX} ._popupBackground {
			position: fixed;
			left: 0px;
			top: 0px;
			width: 100vw;
			height: 100vh;
			z-index: 8;
		}

		${PREFIX} ._popupBackground {
			background: #0004;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100vw;
		}

		${PREFIX} ._popupBackground ._popupContainer {
			background-color: #fff;
			padding: 15px;
			border-radius: 3px;
			max-width: 60vw;
			display: flex;
			flex-direction: column;
			gap: 15px;
		}

		${PREFIX} ._popupBackground ._popupButtons {
			display: flex;
			gap: 10px;
			justify-content: end;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer {
			display: flex;
			flex-direction: column;
			background-color: #fff;
			position: absolute;
			border: 1px solid #eee;
			font-size: 13px;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer._plain {
			border: none;
			background-color: transparent;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer._compMenu {
			left: 70px;
			top: 70px;
			height: calc(100% - 70px);
			width: 0px;
			overflow: hidden;
			transition: width 0.5s ease-in-out;
			display: flex;
			flex-direction: row;
			border: none;
			opacity: 0;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._left {
			flex: 100px;
			1px solid rgba(0, 0, 0, 0.10)
			display: flex;
			flex-direction: column;
			padding: 15px 0px 0px 15px;
			border-right: 1px solid rgba(0, 0, 0, 0.10);
			display: flex;
			gap: 15px;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._right {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._popupMenuContainer._compMenu._compMenuRight {
			width: 0px;
			left: 320px;
			border: none;
		}

		${PREFIX} ._popupMenuContainer._compMenu._show._compMenuRight {
			display: flex;
			flex-direction: column;
			width: 320px;
			border-right: 1px solid rgba(0, 0, 0, 0.10);
			box-shadow: 4px 0px 15px 0px #00000008;
		}

		${PREFIX} ._popupMenuContainer._compMenu._compMenuRight._sections {
			padding: 10px;
			gap: 10px;
			overflow: auto;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList::-webkit-scrollbar {
			width: 4px;
		}

		${PREFIX} ._popupMenuContainer._compMenu iframe {
			flex: 1;
		}

		${PREFIX} ._popupMenuContainer._compMenu._show {
			width: 250px;
			opacity: 1;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._tabContainerContainer {
			display: flex;
			flex-direction: row;
			margin-right: 19px;
		}

		${PREFIX} ._tabContainer {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 5px;
			cursor: pointer;
			background-color: #F9F9F9;
			border-radius: 6px;
			gap: 10px;
			font-size: 14px;
			font-weight: 600;
			font-family: Inter;
			flex: 1;
		}

		${PREFIX} ._tabContainer ._tab {
			padding: 6px 10px;
			transition: background-color 0.5s;
			border: none;
			background: none;
			font-family: 'Inter';
			font-weight: 500;
			font-size: 13px;
			text-transform: none;
			color: #33333399;
			flex: 1;
			height: 30px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		${PREFIX} ._topRightBarGrid ._tabContainer {
			padding: 3px 9px;
		}

		${PREFIX} ._topRightBarGrid ._tabContainer ._tab {
			padding: 4px 10px;
		}

		${PREFIX} ._tabContainer ._tab._personalize {
			padding: 5px 5px 7px 5px;
		}

		${PREFIX} ._tabContainer ._tab:hover {
			background: none;
			color: #333333;
			font-weight: 600;
		}

		${PREFIX} ._tabContainer ._tab._selected {
			background-color: #FFFFFF;
			color: #000;
			border-radius: 4px;
			box-shadow: 0px 2px 4px 0px #0000001A;
			font-weight: 600;
		}

		${PREFIX} ._tab:hover svg ._blackGradient {
			fill: url(#blackGradient);
		}

		${PREFIX} ._tab:hover  svg ._yellow2Gradient {
			fill: url(#yellow2Gradient);
		}

		${PREFIX} ._tab:hover svg ._yellow1Gradient {
			fill: url(#yellow1Gradient);
		}

		${PREFIX} ._tab:hover  svg ._blueGradient {
			fill: url(#blueGradient);
		}

		${PREFIX} ._compTemplateSections {
			margin: 15px;
		}

		${PREFIX} ._compTemplateSections ._tab {
			flex: none;
		}

		${PREFIX} ._tab._inActive svg {
			color: #99999973;
		}

		${PREFIX} ._topRightBarGrid svg._iconHelperSVG  {
			width: 24px;
			height: 20px
		}

		${PREFIX} ._topRightBarGrid ._tab._reload svg._iconHelperSVG  {
			width: 18px;
		}

		${PREFIX} ._topRightBarGrid button {
			height: 34px;
			padding: 0px 18px;
			font-family: 'Inter';
			font-size: 13px;
			line-height: 14px;
			font-weight: 600;
			text-transform: none;
			border-radius: 8px;
			border: none;
		}

		${PREFIX} ._topRightBarGrid button._save {
			background: linear-gradient(180deg, #4BC6FF 0%, #1893E9 100%);
			color: #fff;
		}

		${PREFIX} ._topRightBarGrid button._publish {
			background: linear-gradient(180deg, #7CD9B6 0%, #52BD94 100%);
			color: #fff;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuSearch {
			font-family: 'Inter';
			font-size: 12px;
			font-weight: 600;
			padding: 10px 11px;
			border: 1.5px solid transparent;
			border-radius: 6px;
			outline: none;
			background-color: #F9F9F9;
			color: #52BD94;
			margin-right: 19px;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuSearch:focus {
			border-color:#52BD94;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuSearch::placeholder {
			color: #52BD9488;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuItem img.hover {
			display: none;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuItem:hover img.hover,
		${PREFIX} ._popupMenuContainer._compMenu ._compMenuItem.active img.hover {
			display: inline;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compMenuItem:hover img.actual,
		${PREFIX} ._popupMenuContainer._compMenu ._compMenuItem.active img.actual {
			display: none;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._sectionThumb {
			width: 100%;
			height: 200px;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center center;
			cursor: pointer;
			border-radius: 4px;
			border: 1.5px solid #F2F4F8;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._sectionThumb:hover {
			background-color: #F2F4F8;
		}

		${PREFIX} ._popupMenuBackground ._popupMenu {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: auto;
			padding-left: 5px;
			padding-top: 5px;
		}

		${PREFIX} ._popupMenuBackground ._contextMenu { 
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: auto;
			padding-top: 5px;
			border-left: 1px solid #52BD94;
			border-radius: 0px 4px 4px 0px;
			background-color: #fff;
			box-shadow: 0px 1px 10px 0px #0000001A;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuSeperator {
			height: 0px;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList {
			padding-right: 15px;
			gap: 15px;
			padding-bottom: 10px;
			flex: 1;
			overflow-y: auto;
			display: grid;
			grid-template-columns: 1fr 1fr;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem {
			padding: 10px;
			cursor: pointer;
			background-color: #F9F9F9;
			border-radius: 6px;
			color: #333333E5;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
			font-size: 12px;
			font-weight: 600;
			font-family: Inter;
			border: 0.5px solid transparent;
			width: 100px;
			height: 100px;
			justify-content: center;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem:hover,
		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem.active {
			border: 0.5px solid #1893E9;			
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem svg._iconHelperSVG,
		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem i.fa {
			width: 30px;
			height: 30px;
			font-size: 30px;
		}

		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem.active svg,
		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem:hover svg,
		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem.active i.fa,
		${PREFIX} ._popupMenuContainer._compMenu ._compList ._compMenuItem:hover i.fa {
			color: #1893E9;
		}
		/* Animations Start here... */
		@keyframes updown {
			0% { transform: translateY(0); }
			50% { transform: translateY(5px); }
			100% { transform: translateY(0); }
		}
		
		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._updownAnimation {
			animation: updown var(--comp-item-animation-duration) infinite;
		}

		@keyframes scaleBottomTop {
			0% { transform: scaleY(1); }
			50% { transform: scaleY(0.2); }
			100% { transform: scaleY(1); }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._scaleBottomTop {
			animation: scaleBottomTop var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._scaleTopBottom {
			animation: scaleBottomTop var(--comp-item-animation-duration) infinite;
			transform-origin: bottom;
		}

		@keyframes opacityAnimation {
			0% { opacity: 0; }
			50% { opacity: 1; }
			100% { opacity: 0; }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._opacityAnimation {
			animation: opacityAnimation var(--comp-item-animation-duration-long) infinite;
		}

		@keyframes leftrightAnimation {
			0% { transform: translateX(0); }
			50% { transform: translateX(5px); }
			100% { transform: translateX(0); }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._leftrightAnimation {
			animation: leftrightAnimation var(--comp-item-animation-duration) infinite;
		}

		@keyframes updownleftrightAnimation {
			0% { transform: translate(0 0); }
			50% { transform: translate(5px, 5px); }
			100% { transform: translate(0, 0); }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG ._updownAnimation._leftrightAnimation {
			animation: updownleftrightAnimation var(--comp-item-animation-duration) infinite;
		}
		
		@keyframes text_box_caret_animation {
			0% { opacity: 0; }
			25% { opacity: 1; }
			35% { opacity: 0; transform: translateX(0%);}
			55% { opacity: 1; transform: translateX(65%); }
			99% { opacity: 1; transform: translateX(65%); }
		}

		@keyframes text_box_text_animation {
			0% { opacity: 0; }
			25% { opacity: 0; }
			40% { opacity: 1; }
			100% { opacity: 1; }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG #_text_box_caret {
			animation: text_box_caret_animation var(--comp-item-animation-duration-long) infinite;
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG #_text_box_text {
			animation: text_box_text_animation var(--comp-item-animation-duration-long) infinite;
		}

		@keyframes array_repeater_rect1_animation {
			0% { opacity: 0}
			9% { opacity: 0}
			10% { opacity: 1}
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect2_animation {
			0% { opacity: 0}
			19% { opacity: 0}
			20% { opacity: 1}
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect3_animation {
			0% { opacity: 0}
			29% { opacity: 0}
			30% { opacity: 1}
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect4_animation {
			0% { opacity: 0}
			39% { opacity: 0}
			40% { opacity: 1}	
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect5_animation {
			0% { opacity: 0}
			49% { opacity: 0}
			50% { opacity: 1}	
			100% { opacity: 1}
			}

		@keyframes array_repeater_rect6_animation {
			0% { opacity: 0}
			59% { opacity: 0}
			60% { opacity: 1}	
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect7_animation {
			0% { opacity: 0}
			69% { opacity: 0} 
			70% { opacity: 1}	
			100% { opacity: 1}
		}

		@keyframes array_repeater_rect8_animation {
			0% { opacity: 0}
			79% { opacity: 0}
			80% { opacity: 1}	
			100% { opacity: 1}
		}		

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect1 {
			animation: array_repeater_rect1_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect2 {
			animation: array_repeater_rect2_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect3 {
			animation: array_repeater_rect3_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect4 {
			animation: array_repeater_rect4_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect5 {
			animation: array_repeater_rect5_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect6 {
			animation: array_repeater_rect6_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect7 {
			animation: array_repeater_rect7_animation var(--comp-item-animation-duration) infinite;
		}

		${PREFIX} ._compMenuItem:hover #_arrayRepeaterIcon #_rect8 {
			animation: array_repeater_rect8_animation var(--comp-item-animation-duration) infinite;
		}

		@keyframes dropDownAnimation {
			0% { scale: 0; 	}
			60% { scale: 1; }
			100% { scale: 1; }
		}

		${PREFIX} ._compMenuItem:hover svg._iconHelperSVG #_dropDownAnimation {
			transform-origin: center left;
			animation: dropDownAnimation var(--comp-item-animation-duration) infinite;
		}

		/* Animations End here... */

		${PREFIX} ._popupMenuBackground ._contextMenu ._popupMenuItem:hover {
			background: #00000005;
			color: #52BD94;
		}

		${PREFIX} ._popupMenuBackground ._contextMenu ._popupMenuItem:hover i.fa {
			color: #52BD94;
		}

		${PREFIX} ._popupMenuBackground ._contextMenu ._iconHelperSVG {
			color: #CACBCA;
			width: 16px;
			height: 16px;
		}

		${PREFIX} ._popupMenuBackground ._contextMenu ._popupMenuItem:hover ._iconHelperSVG {
			color: #52BD94;
		}

		${PREFIX} ._popupMenuBackground ._contextMenu i.fa {
			color: #CACBCA;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer ._compTemplates {
			display: flex;
			flex-direction: column;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer ._compTemplates iframe{
			flex: 1;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection {
			
			padding: 11px 20px 11px 20px;
			cursor: pointer;
		}

		${PREFIX} ._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection:hover,
		${PREFIX} ._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection._active {
			background: linear-gradient(90deg, rgba(8, 112, 92, 0.2) 0%, rgba(248, 250, 251, 0) 93.35%);
			color: #08705C;
		}

		${PREFIX} ._propertyContent {
			display: flex;
			flex-direction: row;
		}

		${PREFIX} ._pagePropertiesGrid {
			display: flex;
			flex-direction: column;
			width:350px;
		}

		${PREFIX} ._pageSimplePropGrid {
			width: 250px;
		}

		${PREFIX} ._popupBackground ._popupContainer ._right {
			text-align: right;
			padding: 5px;
		}

		${PREFIX} ._popupBackground._transparent {
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
		${PREFIX}._dark ._topBarGrid, ${PREFIX} ._popupBackground._dark ._popupContainer,
		${PREFIX}._dark ._selectionBar, ${PREFIX} ._dark ._propBar,
		${PREFIX} ._popupMenuBackground._dark ._popupMenu{
			background-color:#555;
		}

		${PREFIX}._dark button, ${PREFIX} ._dark select._peSelect, ${PREFIX} ._dark input._peInput[type='text'],
		${PREFIX}._dark ._pvExpressionEditor, ${PREFIX} ._popupBackground._dark button,
		${PREFIX}._dark input._peInput[type='number'] {
			color: #000;
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
		${PREFIX} ._popupMenuBackground._dark ._popupMenuItem:hover, ${PREFIX} ._popupMenuBackground._dark ._popupMenuItem.active,
		${PREFIX} ._popupBackground._dark button:hover {
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
		${PREFIX}._dark ._eachSelectionBar, ${PREFIX} ._popupBackground._dark{
			color: #aaa;
		}

		${PREFIX}._dark ._iconMenuOption, ${PREFIX} ._popupMenuBackground._dark ._popupMenuItem {
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
		
		${PREFIX}._dark ._tooltip:hover::after {
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
			color: #AAA;
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

		${PREFIX} ._popupMenuBackground._dark ._popupMenuContainer  {
			border-color: #444;
			box-shadow: 2px 2px 5px #555;
		}
		
		${PREFIX} ._popupMenuBackground._dark ._popupMenu {
			border-color: #aaa;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PageEditorCss">{css}</style>;
}
