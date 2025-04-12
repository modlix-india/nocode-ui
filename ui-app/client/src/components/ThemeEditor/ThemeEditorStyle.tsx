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
        padding-bottom: 8px;
        box-shadow: 1px 1px 3px 3px #EEE4;
    }

    ${PREFIX} ._components {
        display: flex;
        gap: 10px;
        overflow: auto;
        padding: 7px;
        flex-direction: column;
        box-shadow: 1px 1px 3px 3px #EEE8;
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
        font: 12px Inter;
        color: #555;
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

    ${PREFIX} select {
        height: 24px;
        border: 2px solid #EEE;
        border-radius: 4px;
        font: 12px Inter;
        color: #777;
    }

    ${PREFIX} ._compsVariables {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    ${PREFIX} ._variables {
        flex: 1;
        box-shadow: inset -3px -3px 4px 4px #EEE4;
        display: flex;
        flex-direction: column;
    }
    
    ${PREFIX} ._variableGroups {
        flex: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    ${PREFIX} ._variableGroup {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 0px;
        font: 11px/14px Inter;
    }

    ${PREFIX} ._title {
        font: 13px Inter;
        font-weight: 600;
        padding-bottom: 5px;
        border-bottom: 2px solid #EEE8;
        margin-bottom: 5px;
        color: #555;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
    }

    ${PREFIX} ._caret {
        width: 12px;
        height: 12px;
        transition: transform 0.2s ease-in-out;
    }

    ${PREFIX} ._caret path {
        stroke-width: 12px;
        stroke: #555;
    }

    ${PREFIX} ._caret._open {
        transform: rotate(90deg);
    }

    ${PREFIX} ._variable {
        display: flex;
        gap: 10px;
        align-items: center;
        border-radius: 3px;
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        font: 11px Inter;
        color: #555;
    }

     ${PREFIX} ._variable > * {
        flex: 1;
     }

     ${PREFIX} input {
        border: 2px solid #8e90a41a;
        border-radius: 3px;
        color: #333;
        font: 12px inter;
        padding: 5px;
    }

    ${PREFIX} ._filterContainer {
        display: flex;
        gap: 10px;
        padding: 10px;
        border-bottom: 2px solid #EEE8;
        flex-direction: column;
    }

    ${PREFIX} ._searchBar {
        display: flex;
        gap: 10px;
        padding-top: 7px;
        align-items: center;
    }
    
    ${PREFIX} ._smallButton {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px;
        border-radius: 2px;
        width: 20px;
        height: 20px;
    }

     ${PREFIX} ._smallButton:hover {
        background-color: #8e90a41a;
     }

    ${PREFIX} ._smallButton svg {
        width: 20px;
        height: 20px;
    }

    ${PREFIX} ._smallButton svg path {
        stroke-width: 2px;
        stroke: #555;
    }

    ${PREFIX} ._editorContainer {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    ${PREFIX} ._editorWrapper {
        flex: 1;
        display: flex;

    }

    ${PREFIX} ._editorTopBar {
        height: 36px;
        border-bottom: 2px solid #EEE8;
        display: flex;
        align-items: center;
        padding: 2px 20px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ThemeEditorCss">{css}</style>;
}
