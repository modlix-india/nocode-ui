import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './textListStyleProperties';

const PREFIX = '.comp.compTextList';
export default function TextListStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} .list {
			position: relative;
		}

		${PREFIX} .listItem {
			position: relative;
		}

		${PREFIX} .listItemIcon {
			position: relative;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextListCss">{css}</style>;
}
