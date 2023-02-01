import React from 'react';

import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './ButtonBarStyleProperties';

const PREFIX = '.comp.compButtonBar';

export default function ButtonBarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} ._label{
        font-size: 24px;
        font-weight: 500;
        color: black;
    }

    ${PREFIX} ._buttonBarContainer {
        display: flex;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
