import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './carouselStyleProperties';
const PREFIX = '.comp.compCarousel';

export default function CarouselStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
    ${PREFIX} {
        display:flex;
        width: 100%;
        height: 100%;
        flex: 1;
    }
    ${PREFIX}.containerReverse{
        flex-direction:column-reverse;
        
    }
    ${PREFIX}.container{
        flex-direction:column;
    }

    ${PREFIX} .innerDivSlideNav{
        display:flex;
        flex:1;
        flex-direction: column;
       
    }

    ${PREFIX} .arrowButtonsContainer {
        z-index: 8;
        
    }

    ${PREFIX} .slideButtonsContainer {
        z-index: 8;
        position: relative;
    }

    ${PREFIX} .notOutsideTop{
        flex-direction:column;
    }
    ${PREFIX} .button {
        font-size: 50px;
        cursor:pointer;
        position: relative;
    }
    ${PREFIX} .innerDiv{
        overflow: hidden;
        position: relative;
        width:100%;
        flex:1;
    }

    ${PREFIX} .innerDiv ._eachSlide{
        width:100%;
        height: 100%;
        position: absolute;
    }
    ${PREFIX} .valueContainer{
        display:flex;
        flex-direction:row;
    }
    ${PREFIX} .arrowButtonsOutsideTopRight{
        display:flex;
        justify-content:end;
        width:100%;
    }
    ${PREFIX} .arrowButtonsOutsideTopLeft{
        width:100%;
    }
    ${PREFIX} .arrowButtonsOutsideBottomRight{
        width:100%;
        justify-content:end;
        display:flex;
    }
    ${PREFIX} .arrowButtonsOutsideBottomLeft{
        width:100%;
    }
    ${PREFIX} .arrowButtonsMiddle{
      
    }
    ${PREFIX} .leftArrowButton {
        left: 0;
        position:absolute;
        top:50%;
        transform:translateY(-50%);
        z-index:1;
    }
    ${PREFIX} .rightArrowButton {
        right: 0;
        position:absolute;
        top:50%;
        transform:translateY(-50%);
        z-index:1;
    }

    ${PREFIX} .arrowButtonsRightTop{
        position:absolute;
        right:0;
        top:0;
        z-index:1;
    }

    ${PREFIX} .arrowButtonsRightBottom{
        position:absolute;
        right:0;
        bottom:0;
        z-index:1;
    }
  

    ${PREFIX} .arrowButtonsLeftTop{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
    }

    ${PREFIX} .arrowButtonsLeftBottom{
        position:absolute;
        left:0;
        Bottom:0;
        z-index:1;
    }

    ${PREFIX} .arrowbuttonsColumnRverse{
        display:flex;
        flex-direction: row-reverse;
    }

    ${PREFIX} .slideNavDivBottom{
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 0;
        padding-bottom:20px;
        left:50%;
        transform: translateX(-50%);
        gap:3px;
    }
    ${PREFIX} .slideNavDivTop{
        display: flex;
        flex-direction: row;
        position: absolute;
        top: 5;
        padding-top: 10px;
        left: 50%;
        transform: translateX(-50%);
        gap: 3px;
    }
    ${PREFIX} .slideNavDivRight{
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 50%;
        padding-right: 10px;
        right: 0;
        transform: translateY(-50%);
        gap: 3px;
    }
    
    ${PREFIX} .slideNavDivLeft{
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 50%;
        padding-left: 10px;
        left: 0;
        transform: translateY(-50%);
        gap: 3px;
    }
    ${PREFIX} .slideNavDivOutsideBottom{
        display: flex;
        flex-direction: row;
        gap: 3px;
        justify-content: center;
        padding-top: 5px;
    }
    ${PREFIX} .slideNavDivOutsideTop{
        display:flex;
        flex-direction: column-reverse;
        align-items:center;
        gap:5px;
    }

    ${PREFIX} .slideNavDiv{
        display:flex;
        gap:3px;
        flex-direction:row;
    }
    
    ${PREFIX} .slideNav{
        width: fit-content;
        height:fit-content;
        background: transparent;
        border:none;
        cursor:pointer;
        position: relative;
        
    }
    ${PREFIX} .circleWithNumbers{
        width:15px;
        height:15px;
        background-color: #ffffff;
        border-radius: 50%;
        display:flex;
        justify-content: center;
        align-items: center;
        border: 1px solid grey;
        opacity:1;
    }

    ${PREFIX} .squareWithNumbers{
        width:15px;
        height:15px;
        background-color: #ffffff;
        display:flex;
        justify-content: center;
        border: 1px solid grey;
        opacity:1;
        align-items: center;
    }
   ${PREFIX} .hide{
    display:none;
    
   }
   ${PREFIX} .show{
    display:block;
   }
   ${PREFIX} .showFlex{
    display:flex;
   }
    ${PREFIX} ._eachSlide._current._slideover{
        left: 100%;
    }
    ${PREFIX} ._eachSlide._current._slideover._slideoverStart{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._current._slideover._reverse{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._current._slideover._slideoverStart._reverse{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._current._fadeover{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._fadeoverStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._current._fadeoutin{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._fadeoutinStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._previous._fadeoutin{
        opacity: 1;
    }
    ${PREFIX} ._eachSlide._previous._fadeoutinStart{
        opacity: 0;
    }

    ${PREFIX} ._eachSlide._current._crossover{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._crossoverStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._previous._crossover{
        opacity: 1;
    }
    ${PREFIX} ._eachSlide._previous._crossoverStart{
        opacity: 0;
    }

    ${PREFIX} ._eachSlide._current._slide{
        left: 100%;
    }
    ${PREFIX} ._eachSlide._current._slide._slideStart{
        left: 0px;
    }
    ${PREFIX} ._eachSlide._current._slide._reverse{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._current._slide._slideStart._reverse{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._previous._slide{
        left: 0px;
    }
    ${PREFIX} ._eachSlide._previous._slide._slideStart{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._previous._slide._reverse{
        left: 0%;
    }
    ${PREFIX} ._eachSlide._previous._slide._slideStart._reverse{
        left: 100%;
    }

    ${PREFIX} .indicator-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        user-select: none;
    }
    ${PREFIX} .indicator-button {
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #888;
        color: #888;
        font-weight: normal;
        cursor: pointer;
        margin: 2px;
        box-sizing: border-box;
        outline: none;
        background: transparent;
        transition: background 0.2s, color 0.2s, border 0.2s;
    }
    ${PREFIX} .indicator-button.active {
        background: #888;
        color: #fff;
        font-weight: bold;
        outline: 2px solid #333;
        border-color: #888;
    }
    ${PREFIX} .indicator-button.shape-circle {
        border-radius: 50%;
    }
    ${PREFIX} .indicator-button.shape-square {
        border-radius: 4px;
    }
    ${PREFIX} .indicator-button.shape-dash {
        border-radius: 2px;
        width: 24px;
        height: 6px;
    }
    ${PREFIX} .indicator-button.shape-none {
        border: none;
        background: none;
        width: 24px;
        height: 16px;
    }
    ${PREFIX} .indicator-button.fill-outline {
        background: transparent;
    }
    ${PREFIX} .indicator-button.fill-solid:not(.active) {
        background: #eee;
    }

    ${PREFIX} .indicator-nav-btn {
        background: none !important;
        border: none !important;
        box-shadow: none;
        color: #444;
        font-size: 1.2em;
        padding: 2px 8px;
        margin: 0 2px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }
    ${PREFIX} .indicator-nav-btn:focus {
        outline: 2px solid #888;
    }
    ${PREFIX} .indicator-nav-btn:hover {
        color: #111;
        background: none;
    }
    ${PREFIX} .indicator-nav-btn:active {
        color: #000;
        background: none;
    }
    /* Subcomponent helper styling for indicatorContainer, indicatorButton, and indicator-nav-btn is supported via stylePropertiesDefinition. */
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="CarouselCss">{css}</style>;
}
