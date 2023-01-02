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
		}
		${PREFIX} .closeButton{
			cursor: pointer;
		}

		
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TagCss">{css}</style>;
}
