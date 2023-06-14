import React from 'react';

import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './buttonBarStyleProperties';

const PREFIX = '.comp.compButtonBar';

export default function ButtonBarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} ._label{
        font-size: 24px;
        font-weight: 500;
        color: black;
        position: relative;
    }

    ${PREFIX} ._buttonBarContainer {
        display: flex;
        position: relative;
    }

    ${PREFIX} ._button {
        position: relative;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
