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
		}

		${PREFIX} .tagcontainerWithInput{
			display: flex;
			flex-wrap: wrap; 
			overflow: scroll; 
			gap:5px;
	    }

		${PREFIX} .tagContainer {
			display: flex;
			flex-direction:row;
		}
    	
		${PREFIX} .closeButton{
			cursor: pointer;
		}

		${PREFIX} .input{
			outline: none;
			width: 100%;
		}
		
		${PREFIX} .text{
			overflow: hidden;
			text-overflow: ellipsis;
		}
		
		
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TagCss">{css}</style>;
}
