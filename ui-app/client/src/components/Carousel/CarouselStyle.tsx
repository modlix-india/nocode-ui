import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';

import { styleProperties, styleDefaults } from './carouselStyleProperties';
const PREFIX = '.comp.compCarousel';

export default function CarouselStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        display: flex;
    }
    ${PREFIX} button {
        position: absolute;
        height: 40px;
        top: calc(50% - 40px);
    }
    ${PREFIX} .innerDiv{
        display:flex;
        flex-direction:row;
        flex:1;
        overflow: hidden;
    }

    ${PREFIX} .innerDiv ._eachSlide{
        min-width: 100%;
        max-width: 100%;
        min-height: 100%;
        max-height: 100%;
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
   
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="CarouselCss">{css}</style>;
}
