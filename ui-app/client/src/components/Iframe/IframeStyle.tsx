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

    ${PREFIX}._bare {
        padding: 0;
        margin: 0;
        background: none;
        background-color: transparent;
        border: none;
    }
    ${PREFIX}._bare iframe {
        border: 0 !important;
        outline: none;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="IframeCss">{css}</style>;
}
