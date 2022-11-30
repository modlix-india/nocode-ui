import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textBoxStyleProperties';

const PREFIX = '.comp.compTextBox';
export default function TextBoxStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .supportText{
			letter-spacing: 0px;
			text-overflow: ellipsis;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextBoxCss">{css}</style>;
}
