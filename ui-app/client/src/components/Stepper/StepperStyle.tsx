import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: flex;
		}
		  
		${PREFIX} ul {
			display: flex;
			list-style-type: none;
		}

		${PREFIX} ul.horizontal {
			width: 100%;
			flex-direction: row;
			overflow: auto;
		}

		${PREFIX} ul.vertical {
			flex-direction: column;
		}

		${PREFIX} .itemlist {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		${PREFIX} .itemlist.futureStep {
			cursor: pointer;
		}

		${PREFIX} .itemlist.previousStep {			
			cursor: pointer;
		}

		${PREFIX} ul.horizontal .itemlist {
		    flex-direction: row;
		}
		
		${PREFIX} ul.horizontal .itemlist:last-child {
		    flex-grow: 0;
		}

		${PREFIX} ul.horizontal .itemlist:not(:last-child)::after {
			content: "";
			min-height: 0px;
			min-width: 30px;
			border-bottom: 1px solid #dedfe7;
			display: block;
			flex-grow: 1;
			border-left: none;
			align-self: flex-start;
			height: ${
				theme.get(StyleResolution.ALL)?.get('lineHeightOrWidth') ??
				styleDefaults.get('lineHeightOrWidth')
			};
			
		}

		${PREFIX} ul.horizontal.textTop .itemlist:not(:last-child)::after {
			align-self: flex-end;
			border-top: 1px solid #dedfe7;
			border-bottom: none;
		}

		${PREFIX} ul.vertical .itemlist {
			width: 100%;
		}
		
		${PREFIX} ul.vertical .itemlist:not(:last-child)::after {
			content: "";
			min-height: 30px;
			border-left: 1px solid #dedfe7;
			flex-grow: 1;
		}

		${PREFIX} ul.vertical.textRight .itemlist:not(:last-child)::after {
			align-self: flex-start;
			width:  ${
				theme.get(StyleResolution.ALL)?.get('lineHeightOrWidth') ??
				styleDefaults.get('lineHeightOrWidth')
			};
			border-left: none;
			border-right: 1px solid #dedfe7;
		}

		${PREFIX} ul.vertical.textLeft .itemlist:not(:last-child)::after {
			align-self: flex-end;
			width:  ${
				theme.get(StyleResolution.ALL)?.get('lineHeightOrWidth') ??
				styleDefaults.get('lineHeightOrWidth')
			};
		}
		
		${PREFIX} .itemContainer {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 5px;
		}

		${PREFIX} ul.vertical .itemContainer {
			width: 100%;
			justify-content: flex-start;
		}

		${PREFIX} ul.textRight .itemContainer {
			flex-direction: row;
		}
		
		${PREFIX} ul.textLeft .itemContainer {
			flex-direction: row-reverse;
		}
				
		${PREFIX} ul.textTop .itemContainer {
		    flex-direction: column-reverse;
		}
		
		${PREFIX} .title {
		    white-space: nowrap;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
