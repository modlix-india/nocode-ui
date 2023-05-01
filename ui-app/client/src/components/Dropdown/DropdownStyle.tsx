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
        align-self: flex-start;
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
    ${PREFIX} .textbox {
        caret-color: transparent;
    }
    ${PREFIX} .dropdownContainer .textbox {
        caret-color: black;
    }

    ${PREFIX} .dropdownContainer .dropdownSearchContainer {
        padding: 20px;
    }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
