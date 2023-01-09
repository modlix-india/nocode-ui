import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './dropdownStyleProperties';

const PREFIX = '.comp.compDropdown';
export default function DropdownStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        display: flex;
        flex-direction: column;
        gap: 8px;
     }

    ${PREFIX} .container {
        position: relative;
        min-width: 200px;
        width : 100%;
        height: 56px;
        cursor: pointer;
        padding: 0 16px;
        border: 1px solid #C7C8D6;
        border-radius: 4px;
        z-index: 1;
    }

    ${PREFIX} .container.disabled {
        border: 1px solid #DDDEE6;
        cursor: not-allowed;
    }

    ${PREFIX} .container:hover {
        border: 1px solid #2680EB;
    }

    ${PREFIX} .container.focus {
        border: 1px solid #2680EB;
    }

    ${PREFIX} .container.disabled:hover {
        border: 1px solid #DDDEE6;
        cursor: not-allowed;
    }
    
    ${PREFIX} .labelContainer {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center
    }

    ${PREFIX} .container.disabled .labelContainer {
        cursor: not-allowed;
    }

    ${PREFIX} .label {
        font-size: 16px;
        cursor: pointer;
    }

    ${PREFIX} .label.notSelected {
        color: #6C7586;
    }

    ${PREFIX} .label.selected {
        color: #1F3C3D;
    }

    ${PREFIX} .container.disabled .label {
        cursor: not-allowed;
    }

    ${PREFIX} .container.disabled .label.notSelected {
        color: #A7ACB6;
    }

    ${PREFIX} .container.disabled .label.selected {
        color: #798A8B;
    }

    ${PREFIX} .labelIcon {
        color:  #1F3C3D;
    }
    ${PREFIX} .container.disabled .labelIcon {
        color:  #798A8B;
    }

    ${PREFIX} .dropdownContainer {
        position: absolute;
        left: 0;
        top: 56px;
        width: 100%;
        min-width: 200px;
        max-height: 150px;
        padding: 8px 0;  
        overflow-y: auto;
        background-color: #FFFFFF;
        box-shadow: 0 4px 6px 1px #E6E6E6;
    }

    ${PREFIX} .dropdownItem {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px 16px;
    }

    ${PREFIX} .dropdownItem:hover {
        background-color: #F4F6F6;
    }

    ${PREFIX} .dropdownItemLabel {
        font-size: 16px;
        color: #1F3C3D;
    }

    ${PREFIX} .checkedIcon {
        color: #2680EB;
    }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
