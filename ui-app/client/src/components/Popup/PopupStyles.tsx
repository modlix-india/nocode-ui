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
    ${PREFIX} ._left_bottom.backdrop > .modal,
    ${PREFIX} ._right_bottom.backdrop > .modal,
    ${PREFIX} ._center_bottom.backdrop > .modal { margin-top: auto; }
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
