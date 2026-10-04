import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './toggleButtonStyleProperties';

const PREFIX = '.comp.compToggleButton';
export default function ToggleButtonStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
    ${PREFIX} {
        position: relative;
        display: inline-flex;
        transition: all 0.4s ease-in-out;
        align-items: center;
        cursor: pointer;
        container-type: inline-size;
    }
    
    ${PREFIX} input[type='checkbox'] {
        display: none;
    }

    ${PREFIX} ._knob {
        transition: transform 0.4s ease-in-out, background-color 0.4s ease-in-out, color 0.4s ease-in-out,
            box-shadow 0.4s ease-in-out;
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

    /* The knob and the on-track label slide with transform alone. Animating left together
       with transform split the motion across threads: a busy main thread (a table
       re-rendering on toggle) froze left while the compositor ran transform, and the knob
       hung outside the track. 100cqw is the track's own width (the label is the container).
       Margins (the theme's on/off knob inset) switch at once rather than transition, or a
       blocked main thread would leave the knob pressed against the far edge until it frees. */
    ${PREFIX} ._toggleButtonLabel._ontrack {
        transition: transform 0.4s ease-in-out, background-color 0.4s ease-in-out, color 0.4s ease-in-out,
            box-shadow 0.4s ease-in-out;
        position: absolute;
        left: 0%;
        transform: translateX(calc(100cqw - 100%));
    }
    ${PREFIX}._on ._toggleButtonLabel._ontrack {
        transform: translateX(0%);
    }

    ${PREFIX}._on ._knob{
        transform: translateX(calc(100cqw - 100%));
    }

    ${PREFIX} ._toggleIcon{
    width:100%;
    }


    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ToggleButtonCss">{css}</style>;
}
