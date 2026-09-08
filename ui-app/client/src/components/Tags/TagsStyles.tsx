import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './TagsStyleProperties';

const PREFIX = '.comp.compTags';
export default function TagsStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} .container{
			display: flex;
			flex-direction: row;
			gap: 3px;
			align-items: center;
			padding: 5px;
			cursor:pointer;
			position: relative;
		}

		/*
		 * The box wrapping the input and the chips had no layout rule at all, so
		 * it laid out as a block: input on one line, chips on the next. That
		 * makes a control two rows tall that reads as a textarea rather than a
		 * text box. A wrapping flex row puts the chips beside the input, and the
		 * order below puts them ahead of it, which is where a tag field keeps
		 * them. With no chips the control is exactly one input tall.
		 */
		${PREFIX} .containerWithInput{
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 5px;
		}

		${PREFIX} .containerWithInput .tagcontainerWithInput{
			order: -1;
		}

		${PREFIX} .tagcontainerWithInput{
			display: flex;
			flex-wrap: wrap;
			overflow: auto;
			gap:5px;
			position: relative;
	    }

		${PREFIX} .tagContainer {
			display: flex;
			flex-direction:row;
			position: relative;
		}
    	
		${PREFIX} .closeButton{
			cursor: pointer;
			position: relative;
		}

		${PREFIX} .input{
			outline: none;
			/*
			 * Was width: 100%, which only made sense while the parent was a
			 * block. In the flex row it would claim the whole line and push
			 * every chip onto its own row, so it shares the line instead and
			 * still grows to fill whatever the chips leave.
			 */
			flex: 1 1 120px;
			min-width: 0;
			background: transparent;
		}

		/*
		 * The outer label div renders whether or not a label was set, and an
		 * empty one still occupies a line box above the control.
		 */
		${PREFIX} .label:empty{
			display: none;
		}
		
		${PREFIX} .text{
			overflow: hidden;
			text-overflow: ellipsis;
			position: relative;
		}

		${PREFIX} .label {
			position: relative;
		}

		${PREFIX} .iconCss {
			position: relative;
		}
		
		
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TagCss">{css}</style>;
}
