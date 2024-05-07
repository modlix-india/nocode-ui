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

		${PREFIX}._vertical {
			flex-direction: row;
		}

		${PREFIX} .tabGridDiv {
			flex: 1;
			width: 100%;
			height: 100%;
			position: relative;
		}

		${PREFIX} .tabsContainer {
			display: flex;
			overflow-x: auto;
			position: relative;
			
		}

		${PREFIX}._vertical > .tabsContainer {
			flex-direction: column;
			overflow-y: auto;
			overflow-x: hidden;
		}

		${PREFIX} .tabDiv {
			cursor: pointer;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 3;
		}
		
		${PREFIX} .tabDiv._vertical {
			flex-direction: column;
		}
		
		${PREFIX} .tabHighlighter {
			position: absolute;
			transition: all 0.3s ease-in-out;
			left: 0;
			top: 0;
			z-index: 2;
		}

		${PREFIX} .icon {
			position: relative;
		}
		
		${PREFIX} .tabsContainer._center {
			justify-content: center;
		}

		${PREFIX} .tabsContainer._start {
			justify-content: flex-start;
		}

		${PREFIX} .tabsContainer._end {
			justify-content: flex-end;
		}

		${PREFIX} .tabsContainer._spaceAround {
			justify-content: space-around;
		}

		${PREFIX} .tabsContainer._spaceBetween {
			justify-content: space-between;
		}

		${PREFIX} .tabsContainer._spaceEvenly .tabDiv{
			flex: 1;
		}

		${PREFIX}._horizontal > .tabsContainer > .tabsSeperator {
			position: absolute;
			left: 0;
			bottom: 0;
			z-index: 1;
			width: 100%;
			height: 1px;
		}

		${PREFIX}._vertical > .tabsContainer >  .tabsSeperator {
			position: absolute;
			right: 0;
			top: 0;
			z-index: 1;
			width: 1px;
			height: 100%; 
		}

` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
