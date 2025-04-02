import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './RadioButtonStyleProperties';

const PREFIX = '.comp.compRadioButton';
export default function RadioButtonStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
    
    ${PREFIX} .radioLabel {
        display: inline-flex;
        gap: 5px;
        justify-items: center;
        text-align: center;
        align-items: center;
        position: relative;
    }

    ${PREFIX} .radioLabel.horizontal {
        flex-direction: row;
    }

    ${PREFIX} .radioLabel.vertical {
        flex-direction: column;
    }
    
    ${PREFIX} span.commonCheckbox {
        min-width: 16px;
        min-height: 16px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="RadioButtonCss">{css}</style>;
}
