import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './TagsStyleProperties';

const PREFIX = '.comp.compTags';
export default function TagsStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
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

		${PREFIX} .tagcontainerWithInput{
			display: flex;
			flex-wrap: wrap; 
			overflow: scroll; 
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
			width: 100%;
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
