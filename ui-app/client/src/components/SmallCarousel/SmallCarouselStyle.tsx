import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './smallCarouselStyleProperties';
const PREFIX = '.comp.compSmallCarousel';

export default function SmallCarouselStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        width: 100%;
        height: 100%;
    }

    ${PREFIX} .innerDivSlideNav {
        width: 100%;
        height: 100%;
        position: relative;
    }

    ${PREFIX} .containerInnerDiv {
        width: 100%;
        overflow: hidden;
        display: flex;
        position: relative;
        gap: 10px;
        height: 100%;
    }

    ${PREFIX} .containerInnerDiv._vertical {
        justify-content: center;
    }

    ${PREFIX} .childElement {
        position: absolute;
        display: flex;
        justify-content: center;
    }

    ${PREFIX} .slideButtonsContainer {
        z-index: 8;
        position: relative;
    }

    ${PREFIX} .button {
        font-size: 50px;
        cursor:pointer;
        position: relative;
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

    ${PREFIX} ._vertical.leftArrowButton {
        top: 0;
        right: 0;
        width: fit-content;
        margin: auto;
        transform: unset;
    }

    ${PREFIX} ._vertical.rightArrowButton {
        bottom: 0;
        left: 0;
        top: unset;
        width: fit-content;
        margin: auto;
        transform: unset;
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

    ${PREFIX}.containerReverse.slideNavOutsideBottomRight, ${PREFIX}.containerReverse.slideNavOutsideBottomLeft{
        display:flex;
        flex-direction: column-reverse;
    }

    ${PREFIX}.containerReverse{
        display:flex;
        flex-direction: column;
    }
    
    ${PREFIX}.containerReverse.arrowButtonsOutsideBottomRight, ${PREFIX}.containerReverse.arrowButtonsOutsideBottomLeft {
        flex-direction: column-reverse;
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
        top: 5px;
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

    ${PREFIX} .slideNavDivOutsideBottomRight {
        display: flex;
        align-items: flex-end;
        gap: 5px;
        flex-direction: column;
    }

    ${PREFIX} .slideNavDivOutsideTopLeft {
        display:flex;
        flex-direction: column-reverse;
        align-items:flex-start;
        gap:5px;
    }

    ${PREFIX} .slideNavDivOutsideTopRight {
        display:flex;
        flex-direction: column-reverse;
        align-items:flex-end;
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

    ${PREFIX} .fa-minus {
        font-size: 20px;
    }

    ${PREFIX} .slideNav.active {
        color: grey;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="SmallCarouselCss">{css}</style>;
}
