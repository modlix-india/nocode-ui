import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './checkBoxStyleProperties';

const PREFIX = '.comp.compCheckBox';
export default function CheckBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`

    input[type='checkbox'].commonCheckbox.radio {
        border-radius:50%;
    }
    input[type='checkbox'].commonCheckbox,
    span.commonTriStateCheckbox {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        width: 16px;
        height: 16px;
        border: 0.15em solid;
        
        border-radius: 0.15em;
        display: grid;
        place-content: center;
        cursor: pointer;
    }
    
    input[type='checkbox'].commonCheckbox:disabled,
    span.commonTriStateCheckbox.disabled {
        border: 0.15em solid;
    }

    input[type='checkbox'].commonCheckbox::before,
    span.commonTriStateCheckbox::before {
        content: '';
        width: 12px;
        height: 12px;
        transform: scale(0);
        transition: 500ms transform ease-in-out;
        box-shadow: inset 1em 1em;
        transform-origin: bottom left;
        clip-path: polygon(13% 49%, 4% 66%, 35% 98%, 100% 25%, 90% 7%, 34% 72%);
    }
    input[type='checkbox'].commonCheckbox.radio::before {
        background-color: #F5E2C6;
        border-radius: 50%;
        transform-origin: center center;
        clip-path: none;
        width:8px;
        height:8px;
    }
    
    span.commonTriStateCheckbox._true,
    input[type='checkbox'].commonCheckbox:checked {
        border: 0px;
    }

    span.commonTriStateCheckbox._false {
        background-color:${processStyleValueWithFunction(
			values.get('checkBoxBorderColor') as string,
			values as Map<string, string>,
		)}
    }

    span.commonTriStateCheckbox._false::before {
        transform: scale(1);
        clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
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
    
    input[type='checkbox'].commonCheckbox:checked::before,
    span.commonTriStateCheckbox._true::before {
        transform: scale(1);
    }
    
    ${PREFIX} .checkbox {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
        
    }
    ${PREFIX} .checkbox.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .checkbox.vertical {
        flex-direction: column;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CheckboxCss">{css}</style>;
}
