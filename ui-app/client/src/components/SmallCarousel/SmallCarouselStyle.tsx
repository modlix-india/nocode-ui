import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './smallCarouselStyleProperties';
const PREFIX = '.comp.compSmallCarousel';

export default function SmallCarouselStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
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
        background: none;
        border: none;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        margin: 0;
        min-width: 0;
        min-height: 0;
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

    ${PREFIX} .carousel-indicators {
        z-index: 10;
        gap: 8px;
        user-select: none;
    }
    ${PREFIX} .carousel-indicators.position-bottom {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 8px;
    }
    ${PREFIX} .carousel-indicators.position-top {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 8px;
    }
    ${PREFIX} .carousel-indicators.position-left {
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
    }
    ${PREFIX} .carousel-indicators.position-right {
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        position: absolute;
        right: 8px;
        top: 0;
        bottom: 0;
    }
    ${PREFIX} .carousel-indicators > div {
        transition: background 0.2s, color 0.2s, border 0.2s;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.2em;
    }

    ${PREFIX} .carousel-indicators > div[style*='background: #888'] {
        box-shadow: 0 0 0 2px #8884, 0 2px 8px #0002;
    }

    ${PREFIX} .indicator-nav-btn {
        background: none;
        border: none;
        color: #888;
        border-radius: 0;
        width: auto;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1em;
        margin: 0 2px;
        cursor: pointer;
        transition: color 0.2s;
        outline: none;
        box-shadow: none;
        padding: 0;
    }
    ${PREFIX} .indicator-nav-btn:hover, ${PREFIX} .indicator-nav-btn:focus {
        color: #333;
    }
    ${PREFIX} .carousel-indicators.position-left .indicator-nav-btn,
    ${PREFIX} .carousel-indicators.position-right .indicator-nav-btn {
        margin: 2px 0;
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

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="SmallCarouselCss">{css}</style>;
}
