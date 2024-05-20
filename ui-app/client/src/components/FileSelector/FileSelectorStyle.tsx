import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileSelectorStyleProperties';

const PREFIX = '.comp.compFileSelector';
export default function FileSelector({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX}  {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	${PREFIX} ._imageButton {
		cursor: pointer;
	}

	${PREFIX}._withImage ._imageButton {
		opacity: 0.5;
		display: none;
		position: absolute;
	}

	${PREFIX}._withImage:hover ._imageButton {
		display: block;
		opacity: 1;
	}

	${PREFIX} ._popupBackground {
		background: #0004;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;
		position: fixed;
        z-index: 6;
		left: 0px;
		top: 0px;
	}

	${PREFIX} ._popupBackground ._popupContainer {
		background-color: #fff;
		padding: 20px;
		border-radius: 3px;
		max-width: 60vw;
		max-height: 60vh;
		display: flex;
		flex-direction: column;
		gap: 15px;
		position: relative;
	}

	${PREFIX} ._popupBackground ._popupContainer._fullScreen {
		max-width: 95vw;
		max-height: 95vh;
		width: 95vw;
		height: 95vh;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileSelectorCss">{css}</style>;
}
