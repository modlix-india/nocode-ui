import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './toggleButtonStyleProperties';

const PREFIX = '.comp.compToggleButton';
export default function ToggleButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        position: relative;
        display: inline-flex;
        transition: all 0.4s ease-in-out;
        align-items: center;
        cursor: pointer;
    }
    
    ${PREFIX} input[type='checkbox'] {
        display: none;
    }

    ${PREFIX} ._knob {
        transition: all 0.4s ease-in-out;
        position: absolute;
        left: 0%;
    }

    ${PREFIX} ._knob._withText {
        display: inline-flex;
        align-items: center;
    }

    ${PREFIX} ._toggleButtonLabel {
        flex: 1;
        display: flex;
        justify-content: center;
    }

    ${PREFIX} ._toggleButtonLabel._ontrack {
        transition: all 0.4s ease-in-out;
        position: absolute;
        left: 100%;
        transform: translateX(-100%);
    }
    ${PREFIX}._on ._toggleButtonLabel._ontrack {
        left: 0%;
        transform: translateX(0%);
    }

    ${PREFIX}._on ._knob{
        left: 100%;
        transform: translateX(-100%);
    }


    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ToggleButtonCss">{css}</style>;
}
