import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tabsStyleProperties';

const PREFIX = '.comp.compTabs';
export default function TabsStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
		}
		${PREFIX}.vertical {
			flex-direction: row;
		}
		${PREFIX} .tabGridDiv {
			flex: 1;
			width: 100%;
			height: 100%;
			overflow: auto;
			position: relative;
		}
		${PREFIX} .tabsContainer {
			display: flex;
			overflow: auto;
			justify-content: space-between;
			position: relative;
		}
		${PREFIX} .tabsContainer.vertical {
			flex-direction: column;
			border-bottom: none;
		}
		${PREFIX} .tabDiv {
			padding: 0 16px 0 16px;
			cursor: pointer;
			position: relative;
		}
		${PREFIX} .tabButton {
			display: flex;
			letter-spacing: 0px;
			white-space: nowrap;	
			cursor: pointer;
			position: relative;
		}
		${PREFIX} .icon {
			position: relative;
		}
		${PREFIX} .border {
			position: relative;
		}
		${PREFIX} .tabButton.noIcon {
			gap: 0;
		}
		
		
` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
