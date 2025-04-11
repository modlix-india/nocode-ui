import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './themeEditorStyleProperties';

const PREFIX = '.comp.compThemeEditor';
export default function ThemeEditorStyle({
    theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
    const css =
        `
    ${PREFIX} {
        width: 100%;
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    ${PREFIX} ._iframeContainer {
        flex: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #EEE8
    }

    ${PREFIX} ._iframeContainer._DESKTOP {
        justify-content: flex-start;
        align-items: flex-start;
    }

    ${PREFIX} iframe {
        border: none;
    }

    ${PREFIX} iframe._DESKTOP {
        min-width: 1280px;
        min-height: 1024px;
        max-width: 1280px;
        max-height: 1024px;
    }

    ${PREFIX} iframe._TABLET {
        min-width: 1024px;
        min-height: 768px;
        max-width: 1024px;
        max-height: 768px;
    }

    ${PREFIX} iframe._MOBILE {
        min-width: 375px;
        min-height: 667px;
        max-width: 375px;
        max-height: 667px;
    }

    ${PREFIX} ._variableContainer {
        width: 600px;
        border-right: 1px solid #eee;
        display: flex;
        flex-direction: column;
    }

    ${PREFIX} ._devices {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 10px;
        gap: 5px;
    }

    ${PREFIX} ._components {
        display: flex;
        gap: 10px;
        overflow: auto;
        padding: 7px;
        flex-direction: column;
    }

    ${PREFIX} ._component {
        display: flex;
        gap: 10px;
        align-items: center;
        border-radius: 3px;
        padding: 8px 8px;
        border: none;
        background: none;
        height: 30px;
        cursor: pointer;
    }

    ${PREFIX} ._component:hover, ${PREFIX} ._component._active {
        background-color: #8e90a41a;
    }

    ${PREFIX} ._component svg._iconHelperSVG {
        width: 16px;
    }

    ${PREFIX} ._icon {
        width: 36px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
    }

    ${PREFIX} ._icon:hover,
    ${PREFIX} ._icon._selected {
        background-color: #8e90a41a;
    }

    ${PREFIX} ._variable {


    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
    return <style id="ThemeEditorCss">{css}</style>;
}
