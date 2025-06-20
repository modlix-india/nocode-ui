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

    ${PREFIX} _iconStatusContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    ${PREFIX} ._rightSection1 {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
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
        z-index: 100;
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

	${PREFIX} ._progressBarfileUpload {
        background-color:#F9FAFB;
        border : 1px solid #DFE8F0;
        border-radius: 8px;
        height: 50px;
		width:100%;
        padding: 0px 10px 0px 10px;
        box-shadow: 0px 1px 3px 0px #0000001A;
    }
       ${PREFIX}  ._InnerProgressBarContainer{
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        align-items:center;
        height: 50px;
        padding:0px 5px 0px 21px;

        }
    ${PREFIX} ._fileUploadPlaceholderText {
        font: 400 14px/14px Inter;
        color:  #0000004D;                                
    }
      ${PREFIX} ._hidden {
        visibility: hidden;
        width: 100%;
        position: absolute;
        height: 100%;
    }
      ${PREFIX} ._leftSection {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height:50px;
        }

    ${PREFIX} ._progressBarUploadButton {
    border-radius: 4px;
    border: 1px solid #DFE8F099;
    background-color:  #FFFFFF;
    padding: 0px 8px;
	
    height:40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font: 600 14px/14px Inter;
    color: #364359;
    margin: 0px;
	cursor: pointer;
    }
 
    ${PREFIX} ._ImagePreviewPlaceholder {
        background-color:#DFE8F066;
        border-radius: 4px;
        width: 32px;
        height: 32px;
        margin: 0px 10px 0px 0px;
    }
    ${PREFIX} ._previewImageContainer, ._previewImage {
       width: 32px;
        height: 32px;
      
    }
       ._previewImageContainer{
       margin: 0px 10px 0px 0px;
       }
        ${PREFIX} ._uploadingFileContainer{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        }
    ${PREFIX} ._progressBarFileUploadText{
        font: 500 14px/14px Inter;
        color: #364359;
        width:130px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
    }
    ${PREFIX} ._outerContainerUploadStatus {
        height: 5px;
        width: 100px;
        background-color: #3333331A;
        border-radius: 2px;
        margin: 0px 15px 0px 0px;
    }
    ${PREFIX} ._InnerContainerUploadStatus {
        height: 5px;
        border-radius: 2px 0px 0px 2px;
    }

	${PREFIX} ._uploadingBackgroundColor {
		background-color: #375EF9;
	}

	${PREFIX} ._doneBackgroundColor {
		background-color: #1CBA79;
	}
	${PREFIX} ._downloadIcon {
	stroke: #427EE4;
	margin:0px 15px 0px 0px;
}
	${PREFIX} ._deleteIcon {
	stroke: #FF5446;
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
