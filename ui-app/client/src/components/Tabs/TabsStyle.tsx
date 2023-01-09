import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './tabsStyleProperties';

const PREFIX = '.comp.compTabs';
export default function TabsStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
${PREFIX} .tabsButtons {
	background-color: #fff;
	border: none;
	text-align: left;
	font: normal normal normal 15px/24px Open Sans;
	letter-spacing: 0px;
	color: #6c7586;
	opacity: 1;
	display: flex;
	flex-direction: column;
}
${PREFIX} .compTabs .tabButtonBorderActive {
	border-bottom: 6px solid #1f3c3d;
	width: 63px;
	align-self: center;
}
${PREFIX} .tabsButtonActive {
	background-color: #fff;
	border: none;
	text-align: left;
	font: normal normal normal 15px/24px Open Sans;
	letter-spacing: 0px;
	color: #393a3c;
	opacity: 1;
	display: flex;
	flex-direction: column;
}
${PREFIX} .tabButtonDiv {
	width: 97%;
	justify-content: space-between;
	display: flex;
	margin-left: 20px;
}
${PREFIX} .tabBorder {
	border-bottom: 1px solid #cecece;
}

` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
