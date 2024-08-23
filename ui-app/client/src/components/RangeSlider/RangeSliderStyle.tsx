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
	}

	${PREFIX} ._thumb {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
	}

	${PREFIX} ._mark._thumb {
		transform-origin: center center;
		z-index: 2;
	}

	${PREFIX} ._markLabel { 
		position: absolute;
		transform: translateX(-50%);
		cursor: pointer;
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

	.comp.compRangeSlider ._thumbPit {
		background-color: #52BD94;
	}
	
	.comp.compRangeSlider._invertThumb ._thumb {
		background-color: #52BD94;
	}

	.comp.compRangeSlider._roundedTT ._toolTip, .comp.compRangeSlider._roundedRectangleTT ._toolTip, .comp.compRangeSlider._largeRoundedTT ._toolTip {
		background-color: #52BD94;
		color: #FFF;
	}

	/* Variables 

	${PREFIX}._thinTrack ._track{
		height: 2px;
	}

	${PREFIX}._thickTrack ._track{
		height: 10px;
		border-radius: 5px;
	}

	${PREFIX}._mediumTrack ._track{
		height: 4px;
		border-radius: 2px;
	}

	${PREFIX}._thinTrack ._rangeTrack{
		height: 2px;
	}

	${PREFIX}._thickTrack ._rangeTrack{
		height: 10px;
		border-radius: 5px;
	}

	${PREFIX}._mediumTrack ._rangeTrack{
		height: 4px;
		border-radius: 2px;
	}

	${PREFIX}._emptyTrack ._track{
		background-color: #E5E5E5;
	}

	${PREFIX}._filledTrack ._track{
		background-color: #A8DEC9;
	}

	${PREFIX} ._rangeTrack {
		background-color: #52BD94;
	}
	
	${PREFIX}._smallThumb ._track {
		margin-top: 5px;
		margin-bottom: 5px;
	}

	${PREFIX}._mediumThumb ._track {
		margin-top: 10px;
		margin-bottom: 10px;
	}

	${PREFIX}._largeThumb ._track {
		margin-top: 15px;
		margin-bottom: 15px;
	}


	${PREFIX}._smallThumb ._thumb {
		width: 14px;
		height: 14px;
	}
	
	${PREFIX}._mediumThumb ._thumb {
		width: 24px;
		height: 24px;
	}

	${PREFIX}._largeThumb ._thumb {
		width: 34px;
		height: 34px;
	}

	${PREFIX}._smallThumb ._mark._thumb {
		width: 10px;
		height: 10px;
	}

	${PREFIX}._mediumThumb ._mark._thumb {
		width: 20px;
		height: 20px;
	}

	${PREFIX}._largeThumb ._mark._thumb {
		width: 30px;
		height: 30px;
	}

	${PREFIX}._roundThumb ._thumb {
		border-radius: 50%;
	}

	${PREFIX}._roundedThumbSquare._smallThumb ._thumb {
		border-radius: 2px;
	}

	${PREFIX}._roundedThumbSquare._mediumThumb ._thumb {
		border-radius: 4px;
	}

	${PREFIX}._roundedThumbSquare._largeThumb ._thumb {
		border-radius: 6px;
	}

	${PREFIX}._pillThumb._smallThumb ._thumb {
		width: 24px;
		border-radius: 7px;
	}

	${PREFIX}._pillThumb._mediumThumb ._thumb {
		width: 34px;
		border-radius: 12px;
	}

	${PREFIX}._pillThumb._largeThumb ._thumb {
		width: 44px;
		border-radius: 17px;
	}

	${PREFIX}._pillThumb._smallThumb ._mark._thumb {
		width: 20px;
	}

	${PREFIX}._pillThumb._mediumThumb ._mark._thumb {
		width: 30px;
	}

	${PREFIX}._pillThumb._largeThumb ._mark._thumb {
		width: 40px;
	}

	${PREFIX}._pillThumb._smallThumb ._thumbPit {
		border-radius: 5px;
		width: 20px;
		height: 10px;
	}

	${PREFIX}._pillThumb._mediumThumb ._thumbPit {
		border-radius: 10px;
		width: 27px;
		height: 17px;
	}

	${PREFIX}._pillThumb._largeThumb ._thumbPit {
		border-radius: 15px;
		width: 34px;
		height: 24px;
	}

	${PREFIX}._pillThumb._smallThumb ._mark._thumb ._thumbPit {
		width: 16px;
		height: 7px;
	}

	${PREFIX}._pillThumb._mediumThumb ._mark._thumb ._thumbPit {
		width: 22px;
		height: 14px;
	}

	${PREFIX}._pillThumb._largeThumb ._mark._thumb ._thumbPit {
		width: 30px;
		height: 20px;
	}

	${PREFIX}._smallThumb ._contentMargin {
		margin-left: 7px;
		margin-right: 7px;
	}

	${PREFIX}._mediumThumb ._contentMargin {
		margin-left: 12px;
		margin-right: 12px;
	}

	${PREFIX}._largeThumb ._contentMargin {
		margin-left: 17px;
		margin-right: 17px;
	}

	${PREFIX}._smallThumb._pillThumb ._contentMargin {
		margin-left: 12px;
		margin-right: 12px;
	}

	${PREFIX}._mediumThumb._pillThumb ._contentMargin {
		margin-left: 17px;
		margin-right: 17px;
	}

	${PREFIX}._largeThumb._pillThumb ._contentMargin {
		margin-left: 22px;
		margin-right: 22px;
	}

	${PREFIX} ._thumb {
		background-color: #FFF;
	}

	${PREFIX} ._thumbPit {
		background-color: #52BD94;
	}
	
	${PREFIX}._invertThumb ._thumb {
		background-color: #52BD94;
	}

	${PREFIX}._invertThumb ._thumbPit {
		background-color: #FFF;
	}

	${PREFIX} ._thumb {
		box-shadow: 0px 2px 10px 0px #00000026;
	}

	${PREFIX} ._maxLabel {
		font-size: 11px;
	}

	${PREFIX} ._minLabel {
		font-size: 11px;
	}

	${PREFIX} ._markLabel { 
		font-size: 11px;
	}

	${PREFIX} ._tickLabel {
		font-size: 11px;		
	}

	${PREFIX} ._bottomLabelContainer,
	${PREFIX} ._topLabelContainer {
		height: 20px;
	}

	${PREFIX} ._tickContainer {
		gap: 3px;
	}

	${PREFIX} ._tick {
		height: 6px;
		width: 2px;
		background-color: #A3A3A3;
	}

	${PREFIX} ._tickLabel {
		color: #A3A3A3;
	}

	${PREFIX}._fixedLabelTT ._toolTip{
		font-size: 30px;
		line-height: 30px;
		height: 30px;
		margin-bottom: 5px;
		margin-top: 5px;
	}

	${PREFIX}._roundedTT ._toolTip,
	${PREFIX}._roundedRectangleTT ._toolTip,
	${PREFIX}._largeRoundedTT ._toolTip {
		background-color: #52BD94;
		font-size: 10px;
		border-radius: 15px;
		color: #FFF;
		box-shadow: 2px 4px 10px 0px #00000014;
	}

	${PREFIX}._roundedTT ._toolTip {
		padding: 3px 7px;
	}

	${PREFIX}._largeRoundedTT ._toolTip {
		padding: 7px 9px;
	}

	${PREFIX}._roundedRectangleTT ._toolTip {
		padding: 3px 7px;
		border-radius: 5px;
	}
*/
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="RangeSliderCss">{css}</style>;
}
