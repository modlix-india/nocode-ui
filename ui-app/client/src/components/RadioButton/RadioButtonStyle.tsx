import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './RadioButtonStyleProperties';

const PREFIX = '.comp.compRadioButton';
export default function RadioButtonStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX}{
        display: flex;
    }` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="RadioButtonCss">{css}</style>;
}
