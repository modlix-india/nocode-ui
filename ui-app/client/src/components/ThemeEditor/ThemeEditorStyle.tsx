import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './themeEditorStyleProperties';

const PREFIX = '.comp.compThemeEditor';
export default function ThemeEditorStyle({
    theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
    const css =
        `
    ${PREFIX} {
        width: 100%;
        height: 100%;
        display: flex;
    }

    ${PREFIX} iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    ${PREFIX} .variableContainer {
        width: 300px;
        border-right: 1px solid #eee;
    }

    ${PREFIX} .iframeContainer {
        flex: 1;
    }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

    return <style id="ThemeEditorCss">{css}</style>;
}
