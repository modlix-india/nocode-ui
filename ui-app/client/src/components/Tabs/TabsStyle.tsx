import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tabsStyleProperties';

const PREFIX = '.comp.compTabs';
export default function TabsStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .tabsButtons {
			letter-spacing: 0px;
		}
		${PREFIX} .tabsButtonActive {
			margin-left:12px;
			margin-right:12px
		}
		



` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
