import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from '../Page/pageStyleProperties';

const PREFIX = '.comp.compMarkdownTOC';
export default function MarkdownTOCStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
		display:flex;
		flex-direction:column;
		gap:20px;
		}

		${PREFIX} ._topLabel,._bottomLabel {
		display:flex;
		justify-content:start;
		}

		${PREFIX} ._topLabel._left,._bottomLabel._left{
		flex-direction:row
		}

		${PREFIX} ._topLabel._right,._bottomLabel._right{
			flex-direction:row-reverse
			}
		
		${PREFIX} a span {
		margin-right:5px;
		}		
}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownTOCCss">{css}</style>;
}
