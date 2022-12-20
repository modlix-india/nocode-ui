import React from 'react';
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
      background-color: rgba(51, 51, 51, 0.3);
      backdrop-filter: blur(1px);
      display: flex;
      align-items: center;
      justify-content: center;    
    }

    ${PREFIX} .modal{
      position: relative;
      padding: 20px;
      min-height: 50px;
      min-width: 100px;
      max-height: 80%;
      max-width: 80%;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      background-color: white;
      border-radius: 2px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
