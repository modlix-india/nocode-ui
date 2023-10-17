import React from 'react';

import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './buttonBarStyleProperties';

const PREFIX = '.comp.compButtonBar';

export default function ButtonBarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
            display: flex;
        }

        ${PREFIX} ._button {
            flex: 1;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
