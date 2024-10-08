import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './dharaStyleProps';

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
		}

		${PREFIX} a, ${PREFIX} ._titleText {
			display: flex;
			align-items: center;
			position: relative;
		}

		${PREFIX} ._bulletIconImage,
		${PREFIX} i{
			position: relative;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MarkdownTOCCss">{css}</style>;
}
