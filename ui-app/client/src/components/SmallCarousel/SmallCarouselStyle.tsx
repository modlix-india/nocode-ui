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
        display: flex;
        position: relative;
    }

    ${PREFIX}._vertical {
        flex-direction: column;
    }

    ${PREFIX} ._slidesContainer {
        overflow: hidden;
        display: block;
        position: relative;
        flex: 1;
    }

    ${PREFIX} ._slideItem {
        width: fit-content;
        height: fit-content;
    }

    ${PREFIX} ._slideItemContainer {
        display: flex;
        position: absolute;
        justify-content: center;
        align-items: center;
    }

    ${PREFIX} ._arrowButtons {
        cursor: pointer;
        display: flex;
        position: relative;
        color: #5555;
        width: 2.5vw;  
        height: 2.5vw; 
    }

    
    ${PREFIX} ._slideNavContainer {
        display: flex;
        position: absolute;
        z-index: 1;
    }

    ${PREFIX} ._slideNavButton {
        cursor: pointer;
        margin: 0 5px;
        width: 10px;
        height: 10px;
        transition: all 0.3s ease;
    }

    ${PREFIX} ._slideNavButton {
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #555;
    }

    ${PREFIX} ._slideNavButton._number {
        width: 20px;
        height: 20px;
        font-size: 12px;
        border-radius: 50%;
        transform: translateY(-5px);
    }

    ${PREFIX} ._slideNavButton._number._active {
        width: 25px;
        height: 25px;
        font-size: 15px;
        background-color: #000;
        color: #fff;
        transform: translateY(-7px);
    }

    ${PREFIX} ._slideNavButton._circle {
        border-radius: 50%;
        width: 10px;
        height: 10px;
    }

    ${PREFIX} ._slideNavButton._circle._solid {
        background-color: #999;
    }

    ${PREFIX} ._slideNavButton._circle._active {
        background-color: #000;
        border-color: #000;
        width: 20px;
        height: 20px;
        transform: translateY(-5px);
    }

    ${PREFIX} ._slideNavButton._square {
        width: 10px;
        height: 10px;
    }

    ${PREFIX} ._slideNavButton._square._solid {
        background-color: #999;
    }

    ${PREFIX} ._slideNavButton._square._active {
        background-color: #000;
        border-color: #000;
        width: 20px;
        height: 20px;
        transform: translateY(-5px);
    }

    ${PREFIX} ._slideNavButton._dash {
        width: 15px;
        height: 6px;
    }

    ${PREFIX} ._slideNavButton._dash._solid {
        background-color: #999;
    }

    ${PREFIX} ._slideNavButton._dash._active {
        background-color: #000;
        border-color: #000;
        width: 25px;
        height: 8px;
        transform: translateY(-1px);
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._inside {
    flex-direction: row;
    bottom: 25%;
    left: 50%;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._outside {
    flex-direction: row;
    bottom: 5%;
    // bottom: 2.5vw;
    left: 50%;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._inside {
    flex-direction: row;
    bottom:70%;
    left: 50%;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._outside {
    flex-direction: row;
    bottom: 95%;
    left: 50%;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._verticalLeft._inside {
    flex-direction: column;    
    bottom: 10.5vw;
    left: 3%;
    transform: translateX(-50%);
    }
    
    ${PREFIX} ._slideNavContainer._verticalLeft._outside {
    flex-direction: column;    
    bottom: 10.5vw;
    left: 0 %;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._verticalRight._inside {
    flex-direction: column;    
    bottom: 10.5vw;
    left: 97%;
    transform: translateX(-50%);
    }
    
    ${PREFIX} ._slideNavContainer._verticalRight._outside {
    flex-direction: column;    
    bottom: 10.5vw;
    left: 100%;
    transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavButton {
    cursor: pointer;
    margin: 0 5px;
    font-size: 12px;
    color: #555;
   
    }

    ${PREFIX} ._slideNavButton._active {
    color: #000;
    }

    ${PREFIX}._vertical ._slideNavContainer._inside {
    right: 10px;
    top: 50%;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
    }

    ${PREFIX}._vertical ._slideNavContainer._outside {
    right: -30px;
    top: 50%;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
    }

    ${PREFIX}._horizontal._centerArrow ._arrowButtons { align-items: center; }
    ${PREFIX}._horizontal._topArrow ._arrowButtons { align-items: flex-start; }
    ${PREFIX}._horizontal._bottomArrow ._arrowButtons { align-items: flex-end; }
    ${PREFIX}._horizontal._outsideArrow._leftArrow ._arrowButtons._prev { order: 1; }
    ${PREFIX}._horizontal._outsideArrow._leftArrow ._arrowButtons._next { order: 2; }
    ${PREFIX}._horizontal._outsideArrow._leftArrow ._slidesContainer { order: 3; }
    ${PREFIX}._horizontal._outsideArrow._rightArrow ._arrowButtons._prev { order: 2; }
    ${PREFIX}._horizontal._outsideArrow._rightArrow ._arrowButtons._next { order: 3; }
    ${PREFIX}._horizontal._outsideArrow._rightArrow ._slidesContainer { order: 1; }

    ${PREFIX}._vertical._leftArrow ._arrowButtons { justify-content: flex-start; }
    ${PREFIX}._vertical._rightArrow ._arrowButtons { justify-content: flex-end; }
    ${PREFIX}._vertical._middleArrow ._arrowButtons { justify-content: center; }
    ${PREFIX}._vertical._outsideArrow._topArrow ._arrowButtons._prev { order: 1; }
    ${PREFIX}._vertical._outsideArrow._topArrow ._arrowButtons._next { order: 2; }
    ${PREFIX}._vertical._outsideArrow._topArrow ._slidesContainer { order: 3; }
    ${PREFIX}._vertical._outsideArrow._bottomArrow ._arrowButtons._prev { order: 2; }
    ${PREFIX}._vertical._outsideArrow._bottomArrow ._arrowButtons._next { order: 3; }
    ${PREFIX}._vertical._outsideArrow._bottomArrow ._slidesContainer { order: 1; }

    ${PREFIX}._insideArrow ._arrowButtons { z-index: 1;}

    ${PREFIX}._vertical._insideArrow._centerArrow ._arrowButtons { position: absolute; width: 100%; }
    ${PREFIX}._vertical._insideArrow._centerArrow ._arrowButtons._prev { top: 0; }
    ${PREFIX}._vertical._insideArrow._centerArrow ._arrowButtons._next { bottom: 0; }

    ${PREFIX}._vertical._insideArrow ._arrowButtonGroup { position: absolute; width: 100%;}
    ${PREFIX}._vertical._insideArrow._topArrow ._arrowButtonGroup { top: 0; }
    ${PREFIX}._vertical._insideArrow._bottomArrow ._arrowButtonGroup { bottom: 0; }

    ${PREFIX}._horizontal._insideArrow._middleArrow ._arrowButtons { position: absolute; height: 100%;}
    ${PREFIX}._horizontal._insideArrow._middleArrow ._arrowButtons._prev { left: 0; }
    ${PREFIX}._horizontal._insideArrow._middleArrow ._arrowButtons._next { right: 0; }

    ${PREFIX}._horizontal._insideArrow ._arrowButtonGroup { position: absolute; display: flex; height: 100%}
    ${PREFIX}._horizontal._insideArrow._leftArrow ._arrowButtonGroup { left: 0; }
    ${PREFIX}._horizontal._insideArrow._rightArrow ._arrowButtonGroup { right: 0; }

    ${PREFIX}._showArrowsOnHover ._arrowButtons { visibility: hidden; }
    ${PREFIX}._showArrowsOnHover:hover ._arrowButtons { visibility: visible; }

    ${PREFIX} ._slideNavArrow {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border-radius: 50%;
        margin: 0 10px;
        font-size: 18px;
        user-select: none;
        transition: all 0.3s ease;
        transform: translateY(-10px);
    }

    ${PREFIX} ._slideNavArrow:hover {
        background-color: rgba(0, 0, 0, 0.7);
        transform: scale(1.1);
        transform: translateY(-10px);
    }

    ${PREFIX} ._slideNavArrow._start::before {
        content: '';
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 8px solid currentColor;

    }

    ${PREFIX} ._slideNavArrow._end::before {
        content: '';
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 8px solid currentColor;

    }

    ${PREFIX} ._slideNavArrow._vertical {
        transform: rotate(90deg);
    }

    ${PREFIX} ._slideNavContainer._verticalLeft{
        flex-direction: column;
    }
    ${PREFIX} ._slideNavContainer._verticalRight {
        flex-direction: column;
    }

    ${PREFIX} ._slideNavContainer._verticalLeft {
        left: 10px;
    }

    ${PREFIX} ._slideNavContainer._verticalRight {
        right: 10px;
    }

    ${PREFIX} ._slideNavContainer._verticalLeft._inside {
        left: 10px;
    }
    ${PREFIX} ._slideNavContainer._verticalRight._inside {
        top: 50%;
        
    }

    ${PREFIX} ._slideNavContainer._verticalLeft._outside {
        // left: 10px;
    }

    ${PREFIX} ._slideNavContainer._verticalRight._outside {
        // right: -40px;
    }

    ${PREFIX} ._slideNavContainer._horizontalTop,
    ${PREFIX} ._slideNavContainer._horizontalBottom {
        flex-direction: row;
        left: 50%;
        transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._inside {
        top: 20px;
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._inside {
        bottom: 10px;
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._outside {
        top: 0px;
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._outside {
        bottom: -40px;
    }

    ${PREFIX}._showSlideNavOnHover ._slideNavContainer {
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    ${PREFIX}._showSlideNavOnHover:hover ._slideNavContainer {
        opacity: 1;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="SmallCarouselCss">{css}</style>;
}
