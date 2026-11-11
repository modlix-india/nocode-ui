import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compPopup';
export default function PopupStyles({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map<string, string>([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);
	const css =
		`
    ${PREFIX} {
      z-index: 7;
    }

     ${PREFIX} .backdrop{
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      overflow-y: auto;
    }

    
    ${PREFIX} ._left_center.backdrop { align-items: center; justify-content: flex-start; }
    ${PREFIX} ._right_center.backdrop { align-items: center; justify-content: flex-end; }
    ${PREFIX} ._center_center.backdrop { align-items: center; justify-content: center; }
    ${PREFIX} ._left_top.backdrop { align-items: flex-start; justify-content: flex-start; }
    ${PREFIX} ._right_top.backdrop { align-items: flex-start; justify-content: flex-end; }
    ${PREFIX} ._center_top.backdrop { align-items: flex-start; justify-content: center; }
    ${PREFIX} ._left_bottom.backdrop { align-items: flex-end; justify-content: flex-start; }
    ${PREFIX} ._right_bottom.backdrop { align-items: flex-end; justify-content: flex-end; }
    ${PREFIX} ._center_bottom.backdrop { align-items: flex-end; justify-content: center; }

    ${PREFIX} .modal{
      position: relative;
    }

    /* A modal taller than the viewport used to overflow both edges of the centred
       backdrop, and the part above the top could not be scrolled to (the title on a
       small laptop). Auto margins centre the same way while it fits and collapse to
       0 when it does not, so it starts at the top and the backdrop scrolls. */
    ${PREFIX} ._left_center.backdrop > .modal,
    ${PREFIX} ._right_center.backdrop > .modal,
    ${PREFIX} ._center_center.backdrop > .modal { margin-top: auto; margin-bottom: auto; }
    /* A bottom-anchored modal sits on the screen edge, so rounding its bottom corners only
       shows the page through them. Pages used to square them one popup at a time. */
    ${PREFIX} ._left_bottom.backdrop > .modal,
    ${PREFIX} ._right_bottom.backdrop > .modal,
    ${PREFIX} ._center_bottom.backdrop > .modal {
      margin-top: auto;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    /* Drawer (opt-in property): full height, flush to the edge the position names, square
       on that edge, sliding in from it. Placed after the position rules so it wins over
       their align-items at the same specificity; the width stays the page's modal width. */
    ${PREFIX} ._drawer.backdrop { align-items: stretch; padding: 0; overflow: hidden; }
    ${PREFIX} ._drawer.backdrop > .modal {
      margin: 0;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
      box-sizing: border-box;
      animation: popupDrawerUp 220ms ease-out;
    }
    ${PREFIX} ._drawer._right_top.backdrop > .modal,
    ${PREFIX} ._drawer._right_center.backdrop > .modal,
    ${PREFIX} ._drawer._right_bottom.backdrop > .modal {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      animation-name: popupDrawerFromRight;
    }
    ${PREFIX} ._drawer._left_top.backdrop > .modal,
    ${PREFIX} ._drawer._left_center.backdrop > .modal,
    ${PREFIX} ._drawer._left_bottom.backdrop > .modal {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      animation-name: popupDrawerFromLeft;
    }
    @keyframes popupDrawerFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes popupDrawerFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes popupDrawerUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) {
      ${PREFIX} ._drawer.backdrop > .modal { animation: none; }
    }
    ${PREFIX} .closeButtonPosition{
      margin-bottom: 10px;
      position: relative;
    }
    ${PREFIX} .design2CloseButton {
      position: absolute;
      top: 10px;
      right: 16px;
      z-index: 1;
    }
    ${PREFIX} .modelTitleStyle {
      position: relative;
    }
    ${PREFIX} .TitleIconGrid{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      position: relative;
    }
    ${PREFIX} .iconClass{
      cursor: pointer;
      position: relative;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
