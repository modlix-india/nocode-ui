import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compPopup';
export default function PopupStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`
     ${PREFIX} .backdrop{
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;   
      backdrop-filter: blur(${processStyleValueWithFunction(values.get('backdropFilter'), values)}) 
    }

    ${PREFIX} .modal{
      position: relative;
    }
    ${PREFIX} .closeButtonPosition{
      margin-bottom: 10px
    }
    ${PREFIX} .design2CloseButton {
      position: absolute;
      top: 10px;
      right: 16px;
      z-index: 1;
    }
    ${PREFIX} .TitleIconGrid{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    ${PREFIX} .iconClass{
      cursor: pointer
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
