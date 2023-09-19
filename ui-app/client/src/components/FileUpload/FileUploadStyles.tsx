import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileUploadStyleProperties';

const PREFIX = '.comp.compFileUpload';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} {
		display: flex;
		align-items: center;
  		width: 100%;
	}
	${PREFIX} .hidden {
		display : none;
	}

	${PREFIX} ._fileUploadText {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	${PREFIX} ._fileUploadButton {
		display: flex;
		
  		cursor: pointer;
		justify-content: center;
		gap: 5px;
	}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
