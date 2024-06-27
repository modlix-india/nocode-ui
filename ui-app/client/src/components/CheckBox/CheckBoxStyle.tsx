import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './checkBoxStyleProperties';

const PREFIX = '.comp.compCheckbox';
export default function CheckBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`

    input[type='checkbox'].commonCheckbox.radio {
        border-radius:50%;
    }

    input[type='checkbox'].commonCheckbox,
    span.commonTriStateCheckbox {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        width: 16px;
        height: 16px;
        border: 0.15em solid;
        border-radius: 0.15em;
        display: grid;
        place-content: center;
        cursor: pointer;
    }

    input[type='checkbox'].commonCheckbox::before,
    span.commonTriStateCheckbox::before {
        content: '';
        width: 14px;
        height: 12px;
        transform: scale(0);
        transition: 500ms transform ease-in-out;
        transform-origin: bottom left;
        clip-path: path('M12.922.859a1.307,1.307,0,0,1,0,1.854l-7,7.005a1.307,1.307,0,0,1-1.854,0l-3.5-3.5A1.311,1.311,0,0,1,2.423,4.364l2.57,2.57L11.063.859a1.307,1.307,0,0,1,1.854,0Z');
    }
    input[type='checkbox'].commonCheckbox.radio::before {
        background-color: #F5E2C6;
        border-radius: 50%;
        transform-origin: center center;
        clip-path: none;
        width:8px;
        height:8px;
    }
    
    span.commonTriStateCheckbox._true,
    input[type='checkbox'].commonCheckbox:checked {
        border: 0px;
    }
    

    span.commonTriStateCheckbox._false::before {
        transform: scale(1);
        clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
    }
    
    input[type='checkbox'].commonCheckbox:checked::before,
    span.commonTriStateCheckbox._true::before {
        transform: scale(0.7) translate(3px, -2px);
    }
    
    ${PREFIX} .checkbox {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
        
    }
    ${PREFIX} .checkbox.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .checkbox.vertical {
        flex-direction: column;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
