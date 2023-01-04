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
    ${PREFIX} .headerText {
        font-family: san-sarif;
        font-size: 14px;
        font-weight: 700;
    }
    ${PREFIX} .headerText.disabled {
        opacity: 60%;
    }
    ${PREFIX} .container {
        position: relative;
        min-width: 120px;
        width : 100%;
        height: 56px;
        cursor: pointer;
        padding: 0 16px;
        border: 1px solid #C7C8D6;
        border-radius: 4px;
    }
    ${PREFIX} .container:hover {
        border-color: #2680EB;
    }
    ${PREFIX} .container:hover.disabled {
        border-color: #C7C8D6;
        cursor: not-allowed;
    }
    ${PREFIX} .container.onFocus {
        border-color: #2680EB;
    }
    ${PREFIX} .container .labelcontainer {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center
    }
    ${PREFIX} .container .labelcontainer.disabled {
        cursor: not-allowed;
        opacity: 60%;
    }
    ${PREFIX} .container .labelcontainer .label {
        font-family: san-sarif;
        font-size: 16px;
        font-weight: 400;
        cursor: pointer;
    }
    ${PREFIX} .container .labelcontainer .label.disabled {
        cursor: not-allowed;
        opacity: 60%;
    }
    ${PREFIX} .container .dropdowncontainer {
        position: absolute;
        left: 0;
        top: 56px;
        width: 100%;
        min-width: 120px;
        box-shadow: 0 4px 6px 1px rgba(0, 0, 0, 0.1);
        padding: 12px 0;
        z-index : 10;
    }
    ${PREFIX} .container .dropdowncontainer .dropdownItem {
        font-family: san-sarif;
        font-size: 16px;
        font-weight: 400;
        cursor: pointer;
        padding: 8px 0;
        padding-left: 16px;
    }
    ${PREFIX} .container .dropdowncontainer .dropdownItem:hover {
        background-color: #F4F6F6;
    }
		
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="DropdownCss">{css}</style>;
}
