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
		display: hidden;
	}

	${PREFIX}._withImage:hover ._imageButton {
		display: block;
	}

	${PREFIX} ._popupBackground {
		background: #0004;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;
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

	${PREFIX} ._fullScreenButton {
		position: absolute;
		right: -16px;
		top: -16px;
		width: 32px;
		height: 32px;
		background: #FFF;
		border-radius: 50%;
		padding: 5px;
		box-shadow: 0px 1px 3px 0px #0000001A;
	}

	${PREFIX} ._fullScreenButton svg {
		width: 100%;
		height: 100%;
	
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileSelectorCss">{css}</style>;
}
