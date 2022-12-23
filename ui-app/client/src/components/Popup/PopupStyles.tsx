import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compPopup';
export default function PopupStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
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
      backdrop-filter: blur(${
			theme.get(StyleResolution.ALL)?.get('backdropFilter') ??
			styleDefaults.get('backdropFilter')
		}) 
    }

    ${PREFIX} .modal{
      position: relative;
      padding: 5px 20px 20px 20px ;
      
    }
    ${PREFIX} .closeButtonPosition{
      margin-bottom: 10px
    }
    ${PREFIX} .TitleIconGrid{
      display: flex;
      flex-direction: row;
     justify-content: space-between;
    }
    ${PREFIX} .iconClass{
      cursor: pointer
    }
    ${PREFIX} .modelTitleStyle{
      font-family : Roboto;
    }
    
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
