import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './toggleButtonStyleProperties';

const PREFIX = '.comp.compToggleButton';
export default function ToggleButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} .toggleButton input[type='checkbox'] {
        -webkit-appearance: none;
        appearance: none;
        background-color: #e3e3e3;
        margin: 0;
        font: inherit;
        color: rgba(0, 0, 0, 0.38);
        width: 3em;
        height: 1.5em;
        border: 0.15em solid rgba(0 ,0 ,0 , 0.38);
        border-radius: 1em;
        display: grid;
        align-items: center;
        cursor: pointer;
    }
    
    ${PREFIX} .toggleButton input[type='checkbox']::before {
        content: '';
        width: 1em;
        height: 1em;
        border-radius: 50%;
        transition: 120ms transform ease-in-out;
        transform-origin: left;
        margin-left: 0.2em;
        background-color: rgba(0 ,0 ,0 , 0.75);
    }
    
    ${PREFIX} .toggleButton input[type='checkbox']:checked::before {
        transform: translateX(1.5em);
        background-color: #ffffff;
    }
    
    ${PREFIX} .toggleButton input[type='checkbox']:checked {
        background-color: #e5b122;
        border: none;
    }
    
    ${PREFIX} .toggleButton input[type='checkbox']:hover::before {
        box-shadow: 0 0 0 0.3em rgba(142, 142, 142, 0.75);
    }
    
    ${PREFIX} .toggleButton {
        font-family: 'Open Sans', sans-serif;
        font-size: 1.1rem;
        line-height: 1.1;
        display: inline-grid;
        grid-template-rows: 1em auto;
        gap: 0.5em;
        color: rgba(0 ,0 , 0, 0.6);
        justify-items: center;
    }
    
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ToggleButtonCss">{css}</style>;
}
