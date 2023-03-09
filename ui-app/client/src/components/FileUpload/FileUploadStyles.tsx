import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileUploadStyleProperties';

const PREFIX = '.comp.compFileUpload';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        text-align: center;
    }

    ${PREFIX} .hidden {
        display: none;
    }

    ${PREFIX} .uploadContainer {
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;
        cursor: pointer;
    }

    ${PREFIX} .uploadContainer.horizontal {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
    }

    ${PREFIX} .inputContainer {
        display: flex;
        align-items: center;
    }

    ${PREFIX} .errors {
        text-align: center;
    }

    ${PREFIX} .selectedFileContainer {
        display: flex;
        overflow-x: auto;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
