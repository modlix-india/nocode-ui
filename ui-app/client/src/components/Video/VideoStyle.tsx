import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './videoStyleProperties';

const PREFIX = '.comp.compVideo';
export default function VideoStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		` 
    ${PREFIX} {
        width:600px;
        height:600px;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="VideoStyle">{css}</style>;
}
