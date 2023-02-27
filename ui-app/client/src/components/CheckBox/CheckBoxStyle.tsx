import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './checkBoxStyleProperties';

const PREFIX = '.comp.compCheckBox';
export default function CheckBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`
    input[type='checkbox'].commonCheckbox {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        width: 1.15em;
        height: 1.15em;
        border: 0.15em solid;
        
        border-radius: 0.15em;
        display: grid;
        place-content: center;
        cursor: pointer;
    }
    
    input[type='checkbox'].commonCheckbox:disabled {
        border: 0.15em solid;
    }
    
    input[type='checkbox'].commonCheckbox::before {
        content: '';
        width: 0.65em;
        height: 0.65em;
        transform: scale(0);
        transition: 500ms transform ease-in-out;
        box-shadow: inset 1em 1em;
        transform-origin: bottom left;
        clip-path: polygon(13% 58%, 4% 68%, 35% 94%, 100% 15%, 90% 5%, 34% 77%);
    }
    
    input[type='checkbox'].commonCheckbox:checked {
        border: 0px;
    }
    
    input[type='checkbox'].commonCheckbox:checked:hover {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxCheckedHoverColor') as string,
			values as Map<string, string>,
		)},
            0 0 0 10px ${processStyleValueWithFunction(
				values.get('checkboxCheckedHoverColor') as string,
				values as Map<string, string>,
			)};
    }
    
    input[type='checkbox'].commonCheckbox:checked:active {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxCheckedHoverColor') as string,
			values as Map<string, string>,
		)},
            0 0 0 10px ${processStyleValueWithFunction(
				values.get('checkboxCheckedHoverColor') as string,
				values as Map<string, string>,
			)};
    }
    
    input[type='checkbox'].commonCheckbox:checked:focus {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxCheckedHoverColor') as string,
			values as Map<string, string>,
		)},
            0 0 0 10px ${processStyleValueWithFunction(
				values.get('checkboxCheckedHoverColor') as string,
				values as Map<string, string>,
			)};
    }
    
    input[type='checkbox'].commonCheckbox:hover {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)}, 0 0 0 10px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)};
    }
    
    input[type='checkbox'].commonCheckbox:active {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)}, 0 0 0 10px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)};
    }
    
    input[type='checkbox'].commonCheckbox:focus {
        box-shadow: 0 0 0 5px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)}, 0 0 0 10px ${processStyleValueWithFunction(
			values.get('checkboxHoverColor') as string,
			values as Map<string, string>,
		)};
    }
    
    input[type='checkbox'].commonCheckbox:checked::before {
        transform: scale(1);
    }
    
    ${PREFIX} .checkbox {
        grid-template-rows: 1em auto;
        gap: 0.5em;
        justify-items: center;
        text-align: center;
        align-items: center;
        display: inline-grid;
    }
    ${PREFIX} .checkbox.horizontal {
        grid-template-columns: 1em auto;
    }

    ${PREFIX} .checkbox.vertical {
        grid-template-rows: 1em auto;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
