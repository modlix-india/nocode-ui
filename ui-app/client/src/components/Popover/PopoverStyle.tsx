import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './popoverStyleProperties';

const PREFIX = '.comp.compPopover';
export default function PopoverStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PopoverCss">{css}</style>;
}
