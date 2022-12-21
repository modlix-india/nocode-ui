import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from '../Popup/popupStyleProperties';

const PREFIX = '.comp.compMenu';
export default function MenuStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
