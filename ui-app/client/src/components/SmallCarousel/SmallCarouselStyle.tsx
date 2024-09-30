import React from 'react';
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

    ${PREFIX}._vertical { flex-direction: column; }

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

    ${PREFIX} ._slideNavContainer._verticalLeft,
    ${PREFIX} ._slideNavContainer._verticalRight {
        top: 50%;
        transform: translateY(-50%);
    }

    ${PREFIX} ._vertical._slideNavContainer._verticalLeft._inside {
        left: 2%;
    }

    ${PREFIX} ._vertical._slideNavContainer._verticalLeft._outside {
        left: -1%;
    }

    ${PREFIX} ._vertical._slideNavContainer._verticalRight._inside {
        right: 3%;
    }

    ${PREFIX} ._vertical._slideNavContainer._verticalRight._outside {
        right: 0%;
    }

    ${PREFIX} ._slideNavContainer._horizontalTop,
    ${PREFIX} ._slideNavContainer._horizontalBottom {
        left: 50%;
        transform: translateX(-50%);
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._inside {
        top:10%;
    }

    ${PREFIX} ._slideNavContainer._horizontalTop._outside {
        top: 0;
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._inside {
        bottom: 10%;
    }

    ${PREFIX} ._slideNavContainer._horizontalBottom._outside {
        bottom: 0%;
    }

    ${PREFIX} ._slideNavButton {
        cursor: pointer;
        margin: 0 5px;
        width: 10px;
        height: 10px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #555;
        font-size: 12px;
        color: #555;
    }

    ${PREFIX} ._slideNavButton._active { color: #000; }

    ${PREFIX} ._slideNavButton._number {
        width: 20px;
        height: 20px;
        font-size: 12px;
        border-radius: 50%;
        transform:   translateY(-5px);
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

    ${PREFIX} ._slideNavButton._vertical._circle {
        margin-top: 3px;
        margin-bottom: 3px;
        transform: translateX(15px);
    }

    ${PREFIX} ._slideNavButton._vertical._circle._active {
        transform: translateX(10px);
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
    
    ${PREFIX} ._slideNavButton._vertical._square {
        margin-top: 3px;
        margin-bottom: 3px;
        transform: translateX(15px);
    }

    ${PREFIX} ._slideNavButton._vertical._square._solid {
        background-color: #999;
    }

    ${PREFIX} ._slideNavButton._vertical._square._active {
        background-color: #000;
        border-color: #000;
        width: 20px;
        height: 20px;
        transform: translateX(10px);
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

    ${PREFIX} ._slideNavButton._vertical._dash {
        margin-top: 3px;
        margin-bottom: 3px;
        transform: translateX(12px);
    }

    ${PREFIX} ._slideNavButton._vertical._dash._active {
        transform: translateX(8px);
    }

    ${PREFIX} ._slideNavButton._vertical._number {
        margin-top: 3px;
        margin-bottom: 3px;
        transform: translateX(10px);
    }

    ${PREFIX} ._slideNavButton._vertical._number._active {
        transform: translateX(7px);
    }

    ${PREFIX}._vertical ._slideNavContainer._horizontalTop._inside {
        top: 10px;
    }

    ${PREFIX}._vertical ._slideNavContainer._horizontalTop._outside {     
        top: 0;
    }

    ${PREFIX}._vertical ._slideNavContainer._horizontalBottom._inside {
        bottom: 10px;
    }

    ${PREFIX}._vertical ._slideNavContainer._horizontalBottom._outside {     
        bottom: 0;
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
        transform: scale(1.1) translateY(-10px);
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

    ${PREFIX} ._slideNavContainer._vertical {
      flex-direction: column;
    }

    ${PREFIX} ._slideNavContainer._vertical._horizontalTop{ 
        left: 50%;
        top: 10px;
        transform: translateX(-50%);
        flex-direction: row;
    }
    ${PREFIX} ._slideNavContainer._vertical._horizontalBottom {
        left: 50%;
        bottom: 10px;
        top: auto;
        transform: translateX(-50%);
        flex-direction: row;
    }

    ${PREFIX} ._slideNavContainer._vertical._horizontalTop {
      top: 10px;
      bottom: auto;
    }

    ${PREFIX} ._slideNavContainer._vertical._horizontalBottom {
      bottom: 10px;
      top: auto;
    }

    ${PREFIX} ._slideNavContainer._vertical._inside {
      top: 50%;
      transform: translateY(-50%);
    }

    ${PREFIX} ._slideNavContainer._vertical._outside {
      top: 50%;
      transform: translateY(-50%);
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
