import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { stylePropertiesDefinition } from './iframeProperties';
import { styleProperties, styleDefaults } from './iframeStyleProperties';
const PREFIX = '.comp.compIframe';

export default function IframeStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
    ${PREFIX}{
        display: flex;
    }
    ${PREFIX} iframe{
        flex:1;
        height:100%;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="IframeCss">{css}</style>;
}
