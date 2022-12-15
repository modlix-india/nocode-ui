import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compPopup';
export default function PopupStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
     ${PREFIX} .buttonModal{
       color:red
     }

    ${PREFIX} .modal{
        width: 100wh;
        height:100vh;
        top:0;
        left:0;
        right:0;
        bottom; 0;
        position:fixed;
    }
    // ${PREFIX}.modalContent{
    // }
    // ${PREFIX}.overlay{
    // }
    // ${PREFIX}.closeModal{
    // }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
