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
        min-width: 35%;
        cursor: pointer;
        z-index: 1;
    }

    ${PREFIX} .container.disabled {
        cursor: not-allowed;
    }

    ${PREFIX} .container.disabled:hover {
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

    ${PREFIX} .placeholder {
        cursor: pointer;
    }

    ${PREFIX} .container.disabled .placeholder {
        cursor: not-allowed;
    }

    ${PREFIX} .labelFloat { 
        position: absolute;
        letter-spacing: 0px;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        transition: top 100ms, transform 100ms ease-in;
        cursor: text;
    }
    
    ${PREFIX} .labelFloat.float { 
        top: 0;
        left: 16px;
        transform: translateY(-55%);
        background-color: #FFF;
    }

    ${PREFIX} .container.disabled .labelFloat {
        cursor: not-allowed;
    }

    ${PREFIX} .dropdownContainer {
        position: absolute;
        left: 0;
        top: 100%;
        overflow-y: auto;
        margin-top: 1px;
    }

    ${PREFIX} .dropdownItem {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
