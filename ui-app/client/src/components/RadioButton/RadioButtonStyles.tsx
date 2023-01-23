import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './radioButtonStyleProperties';

const PREFIX = '.comp.compRadioButton';
export default function ReadioButtonStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
            flex-wrap: wrap;
        }
        ${PREFIX} .radiobutton .radioInput {
            display: grid;
            place-content: center;
            -webkit-appearance: none;
            appearance: none;
            background-color: #ffffff;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            transform: translateX(12px);
        }
        ${PREFIX} .radiobutton .radioInput::before {
            content: '';
            width: 16px;
            height: 16px;
            border-radius: 50%;
            transform: scale(0);  
            transition: 120ms transform ease-in-out;
        }
        ${PREFIX} .radiobutton .radioInput:checked::before {
            transform: scale(1);
        }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="RadioButtonCss">{css}</style>;
}
