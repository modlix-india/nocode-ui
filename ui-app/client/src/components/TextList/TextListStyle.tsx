import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textListStyleProperties';

const PREFIX = '.comp.compTextList';
export default function TextListStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextListCss">{css}</style>;
}
