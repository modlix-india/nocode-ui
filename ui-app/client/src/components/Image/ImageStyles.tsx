import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './imageStyleProperties';

const PREFIX = '.comp.compImage';

export default function ImageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
        ${PREFIX} ._onClickTrue {
            cursor: pointer;
        }

        ${PREFIX} img {
            width: inherit;
            height: inherit;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ImageCss">{css}</style>;
}
