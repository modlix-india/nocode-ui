import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: flex;
		}
		  
		${PREFIX} ul {
			display: flex;
			list-style-type: none;
			position: relative;
			padding-inline-start: 0px;
		}

		${PREFIX} ul._horizontal {
			width: 100%;
			flex-direction: row;
			overflow: auto;
		}

		${PREFIX} ul._vertical {
			flex-direction: column;
		}

		${PREFIX} ._listItem {	
			display: flex;
			flex-direction: row;
			align-items: center;
			position: relative;
		}

		${PREFIX} ._listItem._withLines {	
			flex-grow: 1;
			flex-shrink: 0;
		}

		${PREFIX} ul._vertical ._listItem {
		    flex-direction: column;
		}

		${PREFIX} ._listItem._nextItem {
			cursor: pointer;
		}

		${PREFIX} ._listItem._previousItem {			
			cursor: pointer;
		}

		${PREFIX}._pills ._listItem {
			flex-grow: 0;
		}

		${PREFIX}._rectangle_arrow ._listItem {
			justify-content: center;
		}

		${PREFIX}._rectangle_arrow ._listItem._withLines:not(:last-child)::after {
			content: "";
			width: 0;
			height: 0;
			position: absolute;
			top: 0;
			left: 100%;
			z-index: 1;
		}
		
		${PREFIX} ._itemContainer {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: relative;
		}

		${PREFIX} ul._vertical ._itemContainer {
			width: 100%;
			justify-content: flex-start;
		}

		${PREFIX} ul._textRight ._itemContainer {
			flex-direction: row;
		}
		
		${PREFIX} ul._textLeft ._itemContainer {
			flex-direction: row-reverse;
		}
				
		${PREFIX} ul._textTop ._itemContainer {
		    flex-direction: column-reverse;
		}

		${PREFIX} ._step {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		${PREFIX} ._title {
		    white-space: nowrap;
			position: relative;
		}
		
		${PREFIX} ._leftRightHorizontalActive {
			border-bottom:2px dashed #0000001A;
			align-self:center;
			min-width:100px;
			
		}

		${PREFIX}  ._leftRightHorizontalNextItem {
			border-bottom:2px dashed #0000001A;
			align-self:center;
			min-width:100px;
			
		}

		${PREFIX}  ._leftRightHorizontalDone {
			border-bottom:2px solid #1CBA79;
			align-self:center;
			min-width:100px;
		}
		
		${PREFIX}  ._leftRightHorizontalActiveBeforeLine {
			border-bottom:2px solid #0880AE;
			align-self:center;
			min-width:100px;
		}

		${PREFIX} ._topHorizontalActive {
			border-top:2px dashed #0000001A;
			align-self:flex-end;
			height:18px;
			min-width:100px;

	    }

		${PREFIX}  ._topHorizontalNextItem {
			border-top:2px dashed #0000001A;
			align-self:flex-end;
			height:18px;
			min-width:100px;
	    }
		
		${PREFIX}  ._topHorizontalDone {
			border-top:2px solid #1CBA79;
			align-self:flex-end;
			height:18px;
			min-width:100px;
		}
		
		${PREFIX}  ._topHorizontalActiveBeforeLine {
			border-top:2px solid #0880AE;
			align-self:flex-end;
			height:18px;
			min-width:100px;
		}

		${PREFIX} ._bottomHorizontalActive {
			border-bottom:2px dashed #0000001A;
			align-self:flex-start;
			height:17px;
			min-width:100px;
		}
		
		${PREFIX} ._bottomHorizontalNextItem {
			border-bottom:2px dashed #0000001A;
			align-self:flex-start;
			height:17px;
			min-width:100px;
		}
		
		${PREFIX} ._bottomHorizontalActiveBeforeLine {
			border-bottom: 2px solid #0880AE;
			align-self:flex-start;
			height:17px;
			min-width:100px;
		}
		
		${PREFIX} ._bottomHorizontalDone {
			border-bottom: 2px solid #1CBA79;
			align-self:flex-start;
			height:17px;
			min-width:100px;
		}

		${PREFIX}  ._topBottomVerticalActive {
			border-right: 2px dashed #0000001A;
			align-self:center;
			min-height:100px;
			
		}
		
		${PREFIX}  ._topBottomVerticalNextItem {
			border-right: 2px dashed #0000001A;
			align-self:center;
			min-height:100px;
		}
		
		${PREFIX}  ._topBottomVerticalDone {
			border-right: 2px solid #1CBA79;
			align-self:center;
			min-height:100px;	
		}

		${PREFIX}  ._topBottomVerticalActiveBeforeLine {
			border-right: 2px solid #0880AE;
			align-self:center;
			min-height:100px;
			
			
		}
		
		${PREFIX}  ._leftVerticalDone {
			border-left:2px solid #1CBA79;
			align-self:flex-end;
			min-height:100px;
			width:17px;
		}
		
		${PREFIX}  ._leftVerticalActiveBeforeLine {
			border-left:2px solid #0880AE;
			align-self:flex-end;
			min-height:100px;
			width:17px;
		}
		
		${PREFIX}  ._leftVerticalNextItem {
			border-left:2px dashed #0000001A;
			align-self:flex-end;
			min-height:100px;
			width:17px;
		}

		${PREFIX}  ._leftVerticalActive {
			border-left:2px dashed #0000001A;
			align-self:flex-end;
			min-height:100px;
			width:17px;
		}

		${PREFIX}  ._rightVerticalDone {
			border-right:2px solid #1CBA79;
			align-self:flex-start;
			min-height:100px;
			width:17px;
		}

		${PREFIX}  ._rightVerticalActive {
			border-right:2px dashed #0000001A;
			align-self:flex-start;
			min-height:100px;
			width:17px;
		}
		
		${PREFIX}  ._rightVerticalNextItem {
			border-right:2px dashed #0000001A;
			align-self:flex-start;
			min-height:100px;
			width:17px;
		}
		
		${PREFIX}  ._rightVerticalActiveBeforeLine {
			border-right:2px solid #0880AE;
			align-self:flex-start;
			min-height:100px;
			width:17px;
		}
		
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
