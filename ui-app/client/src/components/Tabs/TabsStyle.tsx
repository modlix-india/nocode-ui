import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tabsStyleProperties';

const PREFIX = '.comp.compTabs';
export default function TabsStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
${PREFIX}.compTabs {
	margin-left: 20px;
	margin-right:20px
}

${PREFIX} .tabsButtons {
	background-color:#ffffff;
	border: none;
	text-align: left;
	font-size:  15px;
	font-family: Open Sans;
	letter-spacing: 0px;
	color: #6c7586;
	opacity: 1;
	display: flex;
	gap:3px;
	justify-content: center;
	align-items: center;
}

${PREFIX} .tabsButtonActive {
	background-color:#ffffff;
	border: none;
	text-align: left;
	font-size:  15px;
	font-family: Open Sans;
	letter-spacing: 0px;
	color: #393a3c;
	opacity: 1;
	display: flex;
	border-bottom: 6px solid #1f3c3d;
	gap:3px;
	justify-content: center;
	align-items: center;
}
${PREFIX} .tabButtonDiv {
	width: 100%;
	justify-content: space-between;
	display: flex;
	padding-left: 20px;
    padding-right: 20px;
	border-bottom: 1px solid #cecece;
}
${PREFIX} .tabBorder {
	border-bottom: 1px solid #cecece;
}

` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
