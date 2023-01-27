import React from 'react';

import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './ButtonBarStyleProperties';

const PREFIX = '.comp.compDropdown';

export default function ButtonBarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
