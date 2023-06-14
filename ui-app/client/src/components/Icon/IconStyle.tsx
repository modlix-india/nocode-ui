import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './iconStyleProperies';

const PREFIX = '.comp.compIcon';
export default function IconStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: inline;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="IconCss">{css}</style>;
}
