import React from 'react';
import { StyleResolutionDefinition, processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fileSelectorStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compFileSelector';
export default function FileSelector({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;
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

	${PREFIX} ._popupBackground ._popupContainer ._fullScreenButton {
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

	${PREFIX} ._popupBackground ._popupContainer ._fullScreenButton svg {
		width: 100%;
		height: 100%;
	}

		@media screen and (max-width: ${TABLET_MIN_WIDTH}px) {®
		${PREFIX} ._popupBackground ._popupContainer {
			min-width: 90vw;
			max-width: 90vw;
			max-height: 80vh;
		}
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="FileSelectorCss">{css}</style>;
}
