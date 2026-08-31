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
        align-items: stretch;
        overflow-x: auto;
        overflow-y: hidden;
    }

    ${PREFIX} iframe {
        border: none;
    }

    ${PREFIX} iframe._DESKTOP {
        min-width: 1280px;
        width: 100%;
        height: 100%;
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
        flex: 0 0 auto;
        min-width: 300px;
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

    ${PREFIX} ._variableValue {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    ${PREFIX} ._valueRow {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }

    ${PREFIX} ._valueRow input[type="text"] {
        flex: 1;
        min-width: 0;
    }

    /* A variable set on this theme, rather than inherited from its base or the
       component default. Without this every box looks equally authored. */
    ${PREFIX} ._setMarker {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex: 0 0 auto;
        background: transparent;
    }

    ${PREFIX} ._variable._overridden ._setMarker {
        background: #F59E0B;
    }

    ${PREFIX} ._variable._overridden ._variableName {
        color: #333;
        font-weight: 600;
    }

    ${PREFIX} ._variableName {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
    }

    ${PREFIX} ._colorPicker {
        flex: 0 0 auto;
        width: 22px;
        height: 22px;
        padding: 0;
        border: 1px solid #8e90a433;
        border-radius: 3px;
        background: none;
        cursor: pointer;
    }

    ${PREFIX} ._colorSwatch {
        flex: 0 0 auto;
        width: 22px;
        height: 22px;
        border: 1px solid #8e90a433;
        border-radius: 3px;
    }

    /* What a <var> value actually paints, once the indirection is followed. */
    ${PREFIX} ._resolvedHint {
        font: 10px/13px Inter;
        color: #999;
        padding-left: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    ${PREFIX} ._hitCount {
        margin-left: auto;
        font: 10px Inter;
        color: #999;
        flex: 0 0 auto;
    }

    ${PREFIX} ._componentTitle {
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        border-bottom: 2px solid #EEE8;
        font: 13px Inter;
        font-weight: 600;
        color: #555;
        cursor: pointer;
    }

    ${PREFIX} ._componentTitle:hover {
        color: #B45309;
    }

    ${PREFIX} ._noHits {
        padding: 14px 12px;
        font: 11px/16px Inter;
        color: #999;
    }

    ${PREFIX} ._scopeButton,
    ${PREFIX} ._overrideButton {
        width: auto;
        min-width: 20px;
        padding: 0 5px;
        font: 10px Inter;
        color: #555;
        border: 1px solid #8e90a433;
    }

    ${PREFIX} ._scopeButton._selected,
    ${PREFIX} ._overrideButton._selected {
        background-color: rgba(245, 158, 11, .16);
        border-color: #F59E0B;
        color: #B45309;
    }

    ${PREFIX} ._overrideButton ._dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        border: 1px solid #999;
    }

    ${PREFIX} ._overrideButton._selected ._dot {
        background: #F59E0B;
        border-color: #F59E0B;
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
        flex: 0 0 auto;
        min-width: 300px;
        overflow: hidden;
    }
    
    ${PREFIX} ._editorWrapper {
        flex: 1;
        display: flex;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
    }

    ${PREFIX} ._editorWrapper > * {
        flex: 1;
        min-width: 0;
    }

    ${PREFIX} ._editorTopBar {
        height: 46px;
        border-bottom: 2px solid #8e90a41a;
        display: flex;
        align-items: center;
        padding: 2px 20px;
        gap: 10px;
    }
    
    ${PREFIX} ._panelResizer {
        flex: 0 0 auto;
        width: 5px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: col-resize;
        align-self: stretch;
    }

    ${PREFIX} ._panelResizer:hover,
    ${PREFIX} ._panelResizer:active {
        background: rgba(245, 158, 11, .35);
    }

    ${PREFIX} ._iframeWrapper {
        flex: 1;
        display:flex;
        flex-direction: column;
        overflow: hidden;
    }

    ${PREFIX} ._urlInput {
        flex: 1;
    }

    ${PREFIX} ._separator {
        height: 50%;
        border-left: 1px solid #EEE;
        border-right: 1px solid #EEE;
        border-radius: 2px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ThemeEditorCss">{css}</style>;
}
