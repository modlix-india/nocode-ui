import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './carouselStyleProperties';
const PREFIX = '.comp.compCarousel';

export default function CarouselStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
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
    ${PREFIX} .notOutsideTop{
        flex-direction:column;
    }
    ${PREFIX} .button {
        font-size: 50px;
        cursor:pointer;
       
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


    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="CarouselCss">{css}</style>;
}
