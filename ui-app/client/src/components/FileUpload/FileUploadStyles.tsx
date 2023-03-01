import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileUploadStyleProperties';

const PREFIX = '.comp.compFileUpload';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
    ${PREFIX} {
        text-align: -webkit-center;
    }

    ${PREFIX} .hidden {
        display: none;
    }

    ${PREFIX} .uploadContainer.horizontal {
        grid-auto-flow: column;
        position: relative;
        justify-content: flex-start;
    }

    ${PREFIX} .inputContainer {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
    }

    ${PREFIX} .errors {
        text-align: center;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
