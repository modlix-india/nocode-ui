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
			height: 65px;
			background-color: #fff;
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
			
		}

		${PREFIX} ._filterBar {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			padding: 5px;
			gap: 5px;
		}

		${PREFIX} ._filterBar i.fa {
			font-size: 22px;
			cursor: pointer;
		}

		${PREFIX} ._compsTree {
			display: flex;
			flex-direction: column;
			width: 100%;
			overflow: auto;
		}

		${PREFIX} ._compsTree ._treeNode {
			font-size: 12px;
			cursor: pointer;
			display: flex;
			align-items: center;
		}

		${PREFIX} ._compsTree ._treeNodeName {
			padding: 3px 5px;
			display: flex;
			align-items: center;
		}

		${PREFIX} ._compsTree ._treeNodeLevel {
			width: 10px;
			height: 100%;
		}

		${PREFIX} ._compsTree ._treeNode._selected {
			background-color: #ddd;
		}

		${PREFIX} ._compsTree:hover ._treeNodeLevel {
			border-right: 1px solid #ccc;
		} 

		${PREFIX} ._compsTree ._treeNodeLevel._lastOpened {

			border-right: 1px solid #aaa;
		}

		${PREFIX} ._compsTree ._treeNode:hover {
			background-color: #eee;
		}

		${PREFIX} ._compsTree ._treeNode i.fa {
			font-size: 13px;
			width: 13px;
			height: 13px;
			display: flex;
			justify-content: center;
			margin: 0px 2px;
		}

		${PREFIX} ._compsTree ._treeNode ._treeText {
			padding-left: 5px;
		}

		${PREFIX} ._compsTree:hover ._animateTransform::before {
			color: #777;	
		}

		${PREFIX} ._compsTree ._animateTransform::before {
			color: #ccc;	
		}

		${PREFIX} ._compsTree ._animateTransform {
			transition: transform 0.5s;
		}

		${PREFIX} ._compsTree ._treeNode._dragStart ._treeNodeLevel {
			border-right: none;
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
			height: calc(100vh - 158px);
			overflow: auto;
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
			width: 200px;
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
			border: 0.8px solid #E9ECEF;
			box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 0.05);
			border-radius: 4px;
			position: static;
			height: 38px;
			display: flex;
    		align-items: center;
			padding: 8px;
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
		

		${PREFIX} button:hover, ${PREFIX} select:hover, ${PREFIX} ._iconMenuOption:hover,
		._popupButtons button:hover {
			background-color: rgba(77, 127, 238, 0.05);
    		color: #96A1B4;
		}

		._popupMenuBackground ._popupMenuItem:hover, ._popupMenuBackground ._popupMenuItem.active {
			color: #08705C;
			background: linear-gradient(90deg, rgba(8, 112, 92, 0.2) 0%, rgba(248, 250, 251, 0) 93.35%);
			border-radius: 2px;
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
			padding: 5px 10px;
			color: #96A1B4;
			display: flex;
			align-items: center;
			gap: 8px;
			white-space: nowrap;
			cursor: pointer;
		}

		${PREFIX} ._iconMenuBody ._iconMenuOption i.fa{
			color: #96A1B4;
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
			min-height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 5px;
			width: 32px;
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

		${PREFIX} ._buttonBar._screenSizes i.fa,
		${PREFIX} ._buttonBar._screenSizes svg {
			background-color: transparent;
			border-bottom: 3px solid transparent;
			border-radius: 0;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 3px;
		}

		${PREFIX} ._propLabel._screenSizes {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		${PREFIX} ._propLabel._screenSizes .svgContainer {
			background-color: #F8FAFB;
			width: 30px;
			height: 30px;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 4px;
			cursor: pointer;
		}

		${PREFIX} ._propLabel._screenSizes .svgContainer:hover,
		${PREFIX} ._propLabel._screenSizes .svgContainer.active {
			background-color: #52BD9490;
		}

		${PREFIX} ._screenSizes svg path{
			fill: rgba(150, 161, 180, 0.2);
			stroke: rgba(142, 144, 164, 0.5);
		}

		${PREFIX} ._screenSizes svg.active path{
			fill: rgba(150, 161, 180, 1);
			stroke: rgba(142, 144, 164, 1);
		}

		${PREFIX} ._propLabel._screenSizes .svgContainer:hover path,
		${PREFIX} ._propLabel._screenSizes .svgContainer.active path{
			fill: #52BD9422;
			stroke: #FFF;
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

		${PREFIX} ._buttonBar._screenSizes i.fa {
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

		${PREFIX} ._iframe {
			flex: 1;
			display: flex;
			justify-content: center;
			overflow: auto;
			transform-origin: top left;
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

		${PREFIX} ._urlInput._peInput:focus-within {
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
			max-height: calc(100% - 65px - 29px);
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
			background: #F8FAFB;
			height: 53px;
			justify-content: space-around;
			align-items: center;
			flex-shrink: 0;
		}

		${PREFIX} ._tabBar svg {
			cursor: pointer;	
		}

		${PREFIX} ._tabBar svg path{
			transition: fill 0.5s, fill-opacity 0.5s;
			fill: #8E90A4;
			fill-opacity: 0.2;
		}

		${PREFIX} ._tabBar svg:hover path, ${PREFIX} ._tabBar svg.active path{ 
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
			margin-left: 20px;
			margin-right: 20px;
			height: 45px;
			position: relative;		
			padding: 0px 5px;	
		}

		.commonTriStateCheckbox::before {
			background: black;
		}

		._propContainer {
			width: 100%;
			padding-top: 20px;
			padding-bottom: 20px;
			flex: 1;
		}

		._propertyEditor{
			display: flex;
			flex-direction: column;
			position: relative;
		}

		._eachProp {
			font-size: 12px;
			padding: 5px 25px;
			display: flex;
			flex-direction: column;
			gap: 5px;
			border-radius: 4px;
			position: relative;
			margin-bottom: 10px;
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
		}

		._propLabel i.fa {
			cursor: pointer;
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

		._propertyGroupHeader {
			font-family: Inter;
			font-size: 13px;			
			color: #888;
			padding: 10px 20px;
			cursor: pointer;
			border-radius: 3px;
			display: flex;
			align-items: center;
			flex-direction: row-reverse;
			justify-content: space-between;
			gap: 5px;
			font-weight: 600;
			margin-bottom: 15px;
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

		${PREFIX} ._multiValueEditor {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		._eachProperty {
			display: flex;
			gap: 10px;
			align-items: center;
			border: 2px solid #ddd;
			padding: 5px;
			border-radius: 3px;
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

		._popupContainer ._iconSelectionBrowser ._selectors {
			display: flex;
			gap: 5px;
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
			box-shadow: 0px 1px 8px 0px #00000020;
			display: flex;
			flex-direction: column;
			background-color: #fff;
			position: absolute;
			border-radius: 4px;
			border-left: 1px solid #eee;
			font-size: 13px;
		}

		._popupMenuBackground ._popupMenuContainer ._elementBarSearchContainer{
			padding: 20px 50px 20px 20px;
			background: #FFFFFF;
			border-bottom: 1px solid rgba(150, 161, 180, 0.4);
		}
		._popupMenuBackground ._popupMenuContainer ._elementBarSearchContainer p{
			color: #4C7FEE;
			font-weight: 600;
			font-size: 14px;
			line-height: 16px;
			margin-top: 0;
		}

		._popupMenuBackground ._popupMenuContainer ._elementBarSearchContainer input{
			width: 345px;
			height: 38px;
			background: #F8FAFB;
			border: 0.8px solid #E9ECEF;
			box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 0.05);
			border-radius: 4px;
			
		}

		._popupMenuBackground ._popupMenuContainer ._elementsBarContainer {
			overflow: auto;
			display: flex;
			flex-direction: row;
			flex: 1;
		}

		._popupMenuBackground ._popupMenuContainer ._elementsBarContainer ._popupMenu {
			background-color: #F8FAFB;
		}

		._popupMenuBackground ._popupMenuContainer ._elementsBarContainer ._popupMenu::-webkit-scrollbar {
			width: 3px;
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

		._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection:hover, ._popupMenuBackground ._popupMenuContainer ._compTemplateSections ._eachTemplateSection._active {
			background: linear-gradient(90deg, rgba(8, 112, 92, 0.2) 0%, rgba(248, 250, 251, 0) 93.35%);
			color: #08705C;
		}

		._compMenu {
			left: 48px;
			top: 48px;
			height: calc(100% - 68px);
			width: 0px;
			overflow: hidden;
			transition: width 0.5s ease-in-out;
		}

		._compMenu._show {
			width: 415px;
		}

		._popupMenuBackground ._popupMenu {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: auto;
			padding-left: 5px;
			padding-top: 5px;
		}

		._popupMenuBackground ._popupMenuSeperator {
			height: 0px;
			border: 1px solid #aaa;
			margin: 1px;
		}

		._popupMenuBackground ._popupMenuItem {
			border-radius: 2px;
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
