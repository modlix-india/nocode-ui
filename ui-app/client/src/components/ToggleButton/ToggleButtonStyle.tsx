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
        transition: 0.4s;
        align-items: center;
    }
    
    ${PREFIX} input[type='checkbox'] {
        display: none;
    }

    ${PREFIX} ._knob {
        cursor: pointer;
        transition: 0.4s;
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

    ${PREFIX}._on {
        flex-direction: row-reverse;
    }


    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ToggleButtonCss">{css}</style>;
}
