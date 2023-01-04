import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './imageStyleProperties';

const PREFIX = '.comp.compImage';

export default function ImageStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `${PREFIX} .image {
        cursor: pointer;
        background-repeat: repeat-y;
        width:500px;
        height:500px;
    }`;
	+processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ImageCss">{css}</style>;
}
