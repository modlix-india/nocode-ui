import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './rangeSliderStyleProperties';

const PREFIX = '.comp.compRangeSlider';

export default function RangeSliderStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
	${PREFIX} {
		display: flex;
		flex-direction: column;
	}
	
	${PREFIX} ._track{
		position: relative;		
		cursor: pointer;
	}

	${PREFIX} ._rangeTrack {
		position: absolute;
		height: 100%;
		top: 50%;
		transform: translateY(-50%);
		left: 0px;
		transition: all 0.3s ease-in-out;
	}

	${PREFIX} ._thumb {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
		transition: all 0.3s ease-in-out;
	}

	${PREFIX} ._mark._thumb {
		transform-origin: center center;
		z-index: 2;
	}

	${PREFIX} ._markLabel { 
		position: absolute;
		transform: translateX(-50%);
		cursor: pointer;
		transition: all 0.3s ease-in-out;
	}

	${PREFIX} ._thumbPit {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) ;
		width: 70%;
		height: 70%;
		border-radius: 50%;
	}

	${PREFIX}._noPit ._thumbPit {
		display: none;
	}

	${PREFIX} ._bottomLabelContainer,
	${PREFIX} ._topLabelContainer {
		position: relative;
	}

	${PREFIX} ._maxLabel {
		position: absolute;
		right: 0;
	}

	${PREFIX} ._minLabel {
		position: absolute;
		left: 0;
	}

	${PREFIX} ._ticksContainer {
		position: relative;
	}

	${PREFIX} ._ticksContainer._onHover {
		opacity: 0;
	}

	${PREFIX} ._ticksContainer._onHover._hovered {
		opacity: 1;
	}

	${PREFIX} ._ticksContainer._topTickLabel ._tickContainer {
		flex-direction: column-reverse;
	}

	${PREFIX} ._tickContainer {
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 0;
		cursor: pointer;
	}

	${PREFIX} ._tickLabel {
		white-space: nowrap;
		transform: translateX(-50%);
	}

	${PREFIX} ._tickContainer._right {
		align-items: flex-end;
	}

	${PREFIX} ._tickContainer._right ._tickLabel {
		transform: translateX(50%);
	}	

	${PREFIX} ._tickContainer ._tick {
	    transform: translateX(-50%);
	}

	${PREFIX} ._toolTip {
		position: absolute;
	}

	${PREFIX}._onHoverToolTip._hoverSlider ._toolTip {
		visibility: visible;
	}

	${PREFIX}._onHoverToolTip ._toolTip {
		visibility: hidden;
	}

	${PREFIX} ._toolTip {
		position: absolute;
	}

	${PREFIX} ._toolTip::before {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		background-color: inherit;
		z-index: -1;
	}

	${PREFIX} ._toolTip._top {
		top: -100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: -15px;
	}

	${PREFIX}._largeRoundedTT ._toolTip._top {
		margin-top: -23px;
	}

	${PREFIX} ._toolTip._top::before {
		bottom: calc(0% + 2px);
		left: 50%;
		transform: translate(-50%, 50%) rotate(45deg);
	}

	${PREFIX} ._toolTip._bottom {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 8px;
	}

	${PREFIX}._largeRoundedTT ._toolTip._bottom {
		margin-top: 10px;
	}

	${PREFIX} ._toolTip._bottom::before {
		bottom: calc(100% - 2px);
		left: 50%;
		transform: translate(-50%, 50%) rotate(45deg);
	}

	${PREFIX} ._toolTip._left {
		top: 50%;
		right: 100%;
		transform: translateY(-50%);
		margin-right: 5px;
	}

	${PREFIX} ._toolTip._left::before {
		top: 50%;
		left: calc(100% - 2px);
		transform: translate(-50%, -50%) rotate(45deg);
	}

	${PREFIX} ._toolTip._right {
		top: 50%;
		left: 100%;
		transform: translateY(-50%);
		margin-left: 5px;
	}

	${PREFIX} ._toolTip._right::before {
		top: 50%;
		right: calc(100% - 2px);
		transform: translate(50%, -50%) rotate(45deg);
	}

	${PREFIX}._roundedTT._top,
	${PREFIX}._roundedRectangleTT._top,
	${PREFIX}._largeRoundedTT._top,
	${PREFIX}._labelTT._top {
		padding-top: 15px;
	}

	${PREFIX}._roundedTT._bottom,
	${PREFIX}._roundedRectangleTT._bottom,
	${PREFIX}._largeRoundedTT._bottom,
	${PREFIX}._labelTT._bottom {
		padding-bottom: 15px;
	}


	${PREFIX}._fixedLabelTT ._toolTip{
		position: static;
		text-align: center;
		transform: none;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="RangeSliderCss">{css}</style>;
}
