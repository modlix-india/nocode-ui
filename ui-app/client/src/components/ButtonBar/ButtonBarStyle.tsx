import React from 'react';

import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './ButtonBarStyleProperties';

const PREFIX = '.comp.compButtonBar';

export default function ButtonBarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} ._button{
        height: 48px;
        background-color: #F4F6F6;
        width:200px;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
    }

    ${PREFIX} ._selected{
        background-color: #1F3C3D;
        color: #ffffff;
        
      
    }

    
    
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
