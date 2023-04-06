import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './carouselStyleProperties';
const PREFIX = '.comp.compCarousel';

export default function CarouselStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
    }
    ${PREFIX} .button {
        position: absolute;
        height: 40px;
        top: calc(50% - 40px);
    }
    ${PREFIX} .innerDiv{
        overflow: hidden;
        position: relative;
        width:100%;
        height: 100%;
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

    ${PREFIX} .leftArrowButton {
        left: 0;
        
    }

    ${PREFIX} .rightArrowButton {
       right: 0;
    }
    ${PREFIX} .dotsDiv{
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 0;
        padding-bottom: 10px;
        left:50%;
        transform: translateX(-50%);
    }
    ${PREFIX} .dots{
        width: fit-content;
        height:fit-content;
        background: transparent;
        border:none
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
