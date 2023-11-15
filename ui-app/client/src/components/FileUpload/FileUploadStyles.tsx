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
	${PREFIX} ._hidden {
		display : none;
	}

	${PREFIX} ._fileUploadText {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	${PREFIX} ._fileUploadButton {
		display: flex;
		align-items: center;
  		cursor: pointer;
		justify-content: center;
		gap: 5px;
	}

	${PREFIX}._onlyButton ._fileUploadButton {
		width: 100% !important;
	}

	${PREFIX} ._subtext {
		text-overflow: ellipsis;
    	overflow: hidden;
    	white-space: nowrap;
	}
	${PREFIX}._droparea_design3 ._subtext {
		position: absolute;
	}
	${PREFIX} ._upload_icon_1 {
		width: 100%;
	}

	${PREFIX} ._upload_icon_1 svg, ${PREFIX} ._upload_icon_2 svg {
		width: 100%;
		height: 100%;
	}

	${PREFIX} ._upload_icon_2 {
		width: 100%;
	}
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileUploadCss">{css}</style>;
}
