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
        gap: 4px;
        margin-top:1rem;
     }
     ${PREFIX} .label {
        cursor: text;
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
    
    ${PREFIX} .placeholderContainer {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center
    }

    ${PREFIX} .container.disabled .placeholderContainer {
        cursor: not-allowed;
    }

    ${PREFIX} .searchContainer {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center
    }

    ${PREFIX} .searchBox {
        border: none;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        outline: none;
    }

    ${PREFIX} .labelFloat { 
        position: absolute;
        letter-spacing: 0px;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        transition: top 100ms, transform 100ms ease-in;
        cursor: text;
        color: #6C7586;
    }
    ${PREFIX} .labelFloat.float { 
        top: 0;
        left: 16px;
        transform: translateY(-55%);
        background-color: #fff;
    }

    ${PREFIX} .container.disabled .labelFloat {
        cursor: not-allowed;
        color: #A7ACB6;
    }

    ${PREFIX} .placeholder {
        color: #6C7586;
        cursor: pointer;
    }

    ${PREFIX} .placeholder.selected {
        color: #1F3C3D;
    }

    ${PREFIX} .container.disabled .placeholder {
        cursor: not-allowed;
        color: #A7ACB6;
    }

    ${PREFIX} .container.disabled .placeholder.selected {
        color: #798A8B;
    }

    ${PREFIX} .placeholderIcon {
        color:  #1F3C3D;
    }
    ${PREFIX} .container.disabled .placeholderIcon {
        color:  #798A8B;
    }

    ${PREFIX} .dropdownContainer {
        position: absolute;
        left: 0;
        top: 100%;
        width: 100%;
        min-width: 200px;
        max-height: 150px;
        padding: 8px 0;  
        overflow-y: auto;
        background-color: #FFFFFF;
        box-shadow: 0 4px 6px 1px #E6E6E6;
        margin-top: 1px;
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
        color: #1F3C3D;
    }

    ${PREFIX} .checkedIcon {
        color: #2680EB;
    }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
