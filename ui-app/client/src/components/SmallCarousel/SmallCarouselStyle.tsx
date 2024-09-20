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

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="SmallCarouselCss">{css}</style>;
}
