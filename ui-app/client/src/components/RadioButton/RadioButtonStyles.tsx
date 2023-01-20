import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compRadioButton';
export default function ReadioButtonStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        .${PREFIX} .radiobutton {
            font-family: 'Open Sans', sans-serif;
            font-size: 1.1rem;
            line-height: 1.1;
            display: inline-grid;
            grid-template-rows: 1em auto;
            gap: 0.5em;
            color: rgba(var(--black-rgb), 0.6);
            /* justify-items: center; */
        }
        
        .${PREFIX} .radiobutton input[type='radio'] {
            -webkit-appearance: none;
            appearance: none;
            background-color: var(--pure-white);
            margin: 0;
            font: inherit;
            display: grid;
            place-content: center;
            width: 1.15em;
            height: 1.15em;
            border: 0.15em solid rgba(var(--black-rgb), 0.38);
            border-radius: 50%;
            transform: translateX(0.75em);
        }
        
        .${PREFIX} .radiobutton input[type='radio']::before {
            content: '';
            width: 0.65em;
            height: 0.65em;
            border-radius: 50%;
            transform: scale(0);
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1em 1em var(--primary-yellow);
            background-color: CanvasText;
        }
        
        .${PREFIX} .radiobutton input[type='radio']:checked::before {
            transform: scale(1);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:checked {
            border: 0.15em solid var(--primary-yellow);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:checked:focus {
            box-shadow: 0 0 0 5px rgba(var(--primary-yellow-rgb), 0.13),
                0 0 0 10px rgba(var(--primary-yellow-rgb), 0.13);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:checked:active {
            box-shadow: 0 0 0 5px rgba(var(--primary-yellow-rgb), 0.13),
                0 0 0 10px rgba(var(--primary-yellow-rgb), 0.13);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:checked:hover {
            box-shadow: 0 0 0 5px rgba(var(--primary-yellow-rgb), 0.13),
                0 0 0 10px rgba(var(--primary-yellow-rgb), 0.13);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:active {
            box-shadow: 0 0 0 5px rgba(var(--black-rgb), 0.12),
                0 0 0 10px rgba(var(--black-rgb), 0.12);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:hover {
            box-shadow: 0 0 0 5px rgba(var(--black-rgb), 0.12),
                0 0 0 10px rgba(var(--black-rgb), 0.12);
        }
        
        .${PREFIX} .radiobutton input[type='radio']:focus {
            box-shadow: 0 0 0 5px rgba(var(--black-rgb), 0.12),
                0 0 0 10px rgba(var(--black-rgb), 0.12);
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopupCss">{css}</style>;
}
