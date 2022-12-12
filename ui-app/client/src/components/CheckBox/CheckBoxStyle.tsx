import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './checkBoxStyleProperties';

const PREFIX = '.comp.compCheckBox';
export default function CheckBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} .checkbox input[type='checkbox'] {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        font: inherit;
        color: rgba(0, 0, 0, 0.38);
        width: 1.15em;
        height: 1.15em;
        border: 0.15em solid;
        border-radius: 0.15em;
        display: grid;
        place-content: center;
        cursor: pointer;
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:disabled {
        border: 0.15em solid #dddddd;
    }
    
    ${PREFIX} .checkbox input[type='checkbox']::before {
        content: '';
        width: 0.65em;
        height: 0.65em;
        transform: scale(0);
        transition: 500ms transform ease-in-out;
        box-shadow: inset 1em 1em #ffffff;
        transform-origin: bottom left;
        clip-path: polygon(13% 58%, 4% 68%, 35% 94%, 100% 15%, 90% 5%, 34% 77%);
        /* Windows High Contrast Mode */
        background-color: CanvasText;
    }
    
    ${PREFIX} .checkbox.partial input[type='checkbox']::before {
        content: '';
        width: 0.65em;
        height: 0.65em;
        transform: scale(0);
        transition: 500ms transform ease-in-out;
        box-shadow: inset 1em 1em #e5b122;
        transform-origin: bottom left;
        clip-path: polygon(21% 46%, 21% 54%, 79% 54%, 79% 46%);
        background-color: CanvasText;
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:checked {
        background-color: #e5b122;
        border: 0px;
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:checked:hover {
        box-shadow: 0 0 0 5px rgba(#e5b122, 0.13),
            0 0 0 10px rgba(#e5b122, 0.13);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:checked:active {
        box-shadow: 0 0 0 5px rgba(#e5b122, 0.13),
            0 0 0 10px rgba(#e5b122, 0.13);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:checked:focus {
        box-shadow: 0 0 0 5px rgba(#e5b122, 0.13),
            0 0 0 10px rgba(#e5b122, 0.13);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:hover {
        box-shadow: 0 0 0 5px rgba( 0, 0, 0, 0.12), 0 0 0 10px rgba( 0, 0, 0, 0.12);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:active {
        box-shadow: 0 0 0 5px rgba( 0, 0, 0, 0.12), 0 0 0 10px rgba( 0, 0, 0, 0.12);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:focus {
        box-shadow: 0 0 0 5px rgba( 0, 0, 0, 0.12), 0 0 0 10px rgba( 0, 0, 0, 0.12);
    }
    
    ${PREFIX} .checkbox input[type='checkbox']:checked::before {
        transform: scale(1);
    }
    
    ${PREFIX} .checkbox {
        font-family: 'Open Sans', sans-serif;
        font-size: 1.1rem;
        line-height: 1.1;
        grid-template-rows: 1em auto;
        gap: 0.5em;
        width: 53px;
        justify-items: center;
        text-align: center;
        display: inline-grid;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
