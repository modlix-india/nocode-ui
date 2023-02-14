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
			max-width: 100px;
			cursor:pointer;
		}

		${PREFIX} .containerWithInput{
			border: 1px solid #C7C8D6;
			width:300px;
			margin:10px;
			border-radius: 4px;

		}
		${PREFIX} .tagcontainerWithInput{
			display: flex;
			flex-wrap: wrap; 
			max-height: 200px; 
			overflow: scroll; 
			padding:4px;
			flex-direction:row;
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
			border:none;
			outline: none;
			width: 100%;
			height:30px;
			border-radius:4px;
			font-size:13px;
		}
		
		${PREFIX} .text{
			overflow: hidden;
			text-overflow: ellipsis;
			
		}

		
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TagCss">{css}</style>;
}
