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

    ${PREFIX}.arrowButtonsOutside {
        display:flex;
        flex-direction: column;
    }

    ${PREFIX}.arrowButtonsOutside.arrowButtonsBottom {
        flex-direction: column-reverse;
    }

    ${PREFIX} .arrowButtonsOutside.arrowButtonsBottom.arrowButtonsMiddle {
        display: flex;
        justify-content: space-between;
    }
    ${PREFIX} .arrowButtonsOutside.arrowButtonsBottom.arrowButtonsLeft {
        width:100%;
    }
    ${PREFIX} .arrowButtonsOutside.arrowButtonsBottom.arrowButtonsRight {
        width:100%;
        justify-content:end;
        display:flex;
    }
    ${PREFIX} .arrowButtonsOutside.arrowButtonsTop.arrowButtonsMiddle {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    ${PREFIX} .arrowButtonsOutside.arrowButtonsTop.arrowButtonsLeft {
        width:100%;
    }
    ${PREFIX} .arrowButtonsOutside.arrowButtonsTop.arrowButtonsRight {
        display: flex;
        justify-content:end;
        width:100%;
    }

    ${PREFIX} .arrowButtonsInside.arrowButtonsBottom.arrowButtonsMiddle {
        position: absolute;
        bottom: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsBottom.arrowButtonsLeft {
        position:absolute;
        left:0;
        Bottom:0;
        z-index:1;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsBottom.arrowButtonsRight {
        position:absolute;
        right:0;
        Bottom:0;
        z-index:1;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsTop.arrowButtonsMiddle {
        position: absolute;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        z-index:1;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsTop.arrowButtonsLeft {
        position:absolute;
        left:0;
        top:0;
        z-index:1;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsTop.arrowButtonsRight {
        position:absolute;
        right:0;
        top:0;
        z-index:1;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsCenter.arrowButtonsMiddle {
        position: absolute;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        z-index:1;
        height: 100%;
        display: flex;
        align-items: center;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsCenter.arrowButtonsLeft {
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        height: 100%;
        display: flex;
        align-items: center;
    }
    ${PREFIX} .arrowButtonsInside.arrowButtonsCenter.arrowButtonsRight {
        position:absolute;
        right:0;
        top:0;
        bottom:0;
        margin: auto;
        z-index:1;
        height: 100%;
        display: flex;
        align-items: center;
    }

    ${PREFIX} .innerDivSlideNav.slideNavDivOutside {
        display:flex;
        flex-direction: column-reverse;
    }

    ${PREFIX} .innerDivSlideNav.slideNavDivOutside.slideNavDivBottom {
        flex-direction: column;
    }

    ${PREFIX} .slideNavDivOutside.slideNavDivBottom.slideNavDivMiddle {
        display: flex;
        justify-content: center;
    }
    ${PREFIX} .slideNavDivOutside.slideNavDivBottom.slideNavDivLeft {
        width:100%;
    }
    ${PREFIX} .slideNavDivOutside.slideNavDivBottom.slideNavDivRight {
        width:100%;
        justify-content:end;
        display:flex;
    }
    ${PREFIX} .slideNavDivOutside.slideNavDivTop.slideNavDivMiddle {
        width: 100%;
        display: flex;
        justify-content: center;
    }
    ${PREFIX} .slideNavDivOutside.slideNavDivTop.slideNavDivLeft {
        width:100%;
    }
    ${PREFIX} .slideNavDivOutside.slideNavDivTop.slideNavDivRight {
        display: flex;
        justify-content:end;
        width:100%;
    }

    ${PREFIX} .slideNavDivInside.slideNavDivBottom.slideNavDivMiddle {
        position: absolute;
        bottom: 0;
        width: 100%;
        display: flex;
        justify-content: center;
    }
    ${PREFIX} .slideNavDivInside.slideNavDivBottom.slideNavDivLeft {
        position:absolute;
        left:0;
        Bottom:0;
        z-index:1;
    }
    ${PREFIX} .slideNavDivInside.slideNavDivBottom.slideNavDivRight {
        position:absolute;
        right:0;
        Bottom:0;
        z-index:1;
    }
    ${PREFIX} .slideNavDivInside.slideNavDivTop.slideNavDivMiddle {
        position: absolute;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        z-index:1;
    }
    ${PREFIX} .slideNavDivInside.slideNavDivTop.slideNavDivLeft {
        position:absolute;
        left:0;
        top:0;
        z-index:1;
    }
    ${PREFIX} .slideNavDivInside.slideNavDivTop.slideNavDivRight {
        position:absolute;
        right:0;
        top:0;
        z-index:1;
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
