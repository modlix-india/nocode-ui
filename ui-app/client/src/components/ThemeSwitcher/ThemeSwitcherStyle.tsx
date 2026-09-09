import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './themeSwitcherStyleProperties';

const PREFIX = '.comp.compThemeSwitcher';
const PANEL = '._themeSwitcherPanel';

export default function ThemeSwitcherStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
    /*
     * width and align-self, not just inline-flex. A flex item's display is
     * blockified, so inline-flex computes to flex the moment this sits in a Grid,
     * and the default align-items: stretch then spreads the control across the
     * whole column. A switcher is a control, not a band.
     */
    ${PREFIX} {
        display: inline-flex;
        align-items: center;
        position: relative;
        width: fit-content;
        align-self: flex-start;
    }

    ${PREFIX} ._option,
    ${PANEL} ._option {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        font: inherit;
        white-space: nowrap;
    }

    ${PREFIX} ._option[disabled],
    ${PANEL} ._option[disabled] {
        cursor: default;
    }

    /* Segmented */

    ${PREFIX}._segmented {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
    }

    ${PREFIX}._segmented ._option {
        padding: 4px 10px;
        transition: background 0.15s ease-in-out;
    }

    /* Toggle */

    ${PREFIX}._toggle {
        gap: 8px;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
    }

    ${PREFIX}._toggle ._track {
        position: relative;
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        flex-shrink: 0;
        transition: background 0.2s ease-in-out;
    }

    /*
     * The travel distance is expressed relatively rather than as a fixed offset.
     * Track width and height are theme variables baked into the CSS text, so a
     * literal translate would have to be computed from two values this rule
     * cannot see and would land wrong the moment either is restyled.
     *
     * A left of 100% resolves against the track, translateX(-100%) against the
     * knob's own width, so the pair lands the knob flush against the right edge
     * at any size. Both ends are lengths, so it animates; a left of auto would
     * not.
     */
    ${PREFIX}._toggle ._knob {
        position: absolute;
        top: 2px;
        left: 2px;
        bottom: 2px;
        aspect-ratio: 1;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: left 0.2s ease-in-out;
    }

    ${PREFIX}._toggle._on ._knob {
        left: calc(100% - 2px);
        transform: translateX(-100%);
    }

    /* Popover */

    ${PREFIX}._popover ._trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        cursor: pointer;
        font: inherit;
    }

    /*
     * The panel is portalled to the body, so its only competition is app chrome,
     * and it has to clear it: appbuilder's header carries z-index 40 on its bar and
     * 50 on its own popover, and at the 6 this started with the header painted over
     * the panel's first row.
     */
    ${PANEL} {
        position: fixed;
        z-index: 60;
        display: flex;
        flex-direction: column;
        padding: 6px;
        min-width: 160px;
        max-height: min(70vh, 420px);
        overflow-y: auto;
    }

    ${PANEL} ._option {
        padding: 8px 10px;
        border-radius: 6px;
        width: 100%;
        text-align: left;
    }

    ${PREFIX} ._themeIcon,
    ${PANEL} ._themeIcon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ThemeSwitcherCss">{css}</style>;
}
