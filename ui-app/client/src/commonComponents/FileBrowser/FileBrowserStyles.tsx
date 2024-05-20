import React from 'react';

export function FileBrowserStyles() {
	const styles = `
    ._fileBrowser {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 500px;
        min-width: 500px;
        gap: 5px;
    }
    
    ._fileBrowser ._searchUploadContainer {
        display: flex;
        align-items: center;
        height: 48px;
        gap: 15px;
    }
    
    ._fileBrowser ._searchInputContainer {
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 50px;
        border: 1px solid #d9d9d9;
        background-color: #FFFFFF;
        color: #00000066;
        padding: 5px 8px;
        height: 35px;
    }
    ._fileBrowser ._searchInputContainer input {
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 50px;
        border: none;
        background-color: #FFFFFF;
        color: #00000066;
        height: 100%;
        outline: none; 
    }

    ._fileBrowser button {
        height: 30px;
        background-color: #FFFFFF;
        border: 1px solid #0085F2;
        color: #0085F2;
        border-radius: 5px;
        padding: 5px 10px;
        box-shadow: 0px 1px 3px 0px #0000001A;
        cursor: pointer;
    }

    ._fileBrowser ._editBtnContainer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding: 10px 0px;
    }

    ._fileBrowser ._upload {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 10px;
        height: 30px;
        border: 1px solid #0085F2;
        border-radius: 5px;
        color: #0085F2;
        cursor: pointer;
        position: relative;
        background-color: #FFFFFF;
        box-shadow: 0px 1px 3px 0px #0000001A;
    }

    ._fileBrowser ._upload input {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    ._fileBrowser ._filesContainer {
        display: flex;
        flex: 1;
        gap: 10px;
        flex-direction: column;
        overflow: auto;
    }

    ._fileBrowser ._files {
        flex: 1;
        overflow: auto;
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 10px;
        padding: 6px;
        justify-content: flex-start;
        align-content: flex-start;
        box-shadow: inset 0px 0px 8px #0001;
        border-radius: 5px;
    }

    ._fileBrowser ._files ._eachFile {
        width: 125px;
        height: 125px;
        cursor: pointer;
        position: relative;
        display: flex;
        justify-content: center;
        display: flex;
        flex-direction: column;        
    }

    ._fileBrowser ._files ._eachFile._selectable:hover {
        background-color: #E8E8E8;
    }
    
    ._fileBrowser ._files ._eachFile ._image {
        flex: 1;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        margin: 10px 0px;
    }

    ._fileBrowser ._files ._eachFile ._imageLabel {
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #000000;
        background-color: #F8F8F8;
        margin: 0px;
    }

    ._fileBrowser ._files ._eachFile::after {
        content: '';
        position: absolute;
        top: 0px;
        left: 0px;
        width: calc(100%);
        height: calc(100%);
        z-index: 1;
        border-radius: 5px;
        border: 1px solid #d9d9d9;
    }

    ._fileBrowser ._files ._eachFile._selected::before,
    ._fileBrowser ._files ._eachFile._selectable:hover::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        border-radius: 7px;
        border: 2px solid #FFC427;
        z-index: 1;
    }

    ._fileBrowser ._files ._eachFile._directory:hover {
        background-color: #E8E8E8;
    }

    ._fileBrowser ._files ._eachFile._file._unselectable {
        opacity: 0.5;
    }

    ._fileBrowser ._pathContainer {
        display: flex;
        gap: 5px;
        cursor: pointer;
        align-items: center;
    }

    ._fileBrowser ._pathContainer ._pathFolderImage {
        width: 32px;
        height: 32px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
    
    }

    ._fileBrowser ._pathPart:hover,
    ._fileBrowser ._pathPart:last-child {
        font-weight: bold;
    } 

    ._fileBrowser ._progressBar {
        flex: 1;
        justify-content: center;
        align-items: center;
        display: flex;
    }

    ._fileBrowser ._progressBar svg {
        animation: _tada 2s linear infinite;
    }

    ._fileBrowser button:disabled {
        border-color: #d9d9d9;
        color: #d9d9d9;
    }

    ._fileBrowser ._confirmationBox {
        position: absolute;
        background: #0003;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        left: 0;
        top: 0;
    }

    ._fileBrowser ._confirmationBoxContent {
        background: #FFF;
        padding: 10px;
        border-radius: 4px;
    }

    ._fileBrowser ._confirmationBoxButtons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    ._fileBrowser ._eachFile ._deleteInner {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 2;
        display: none;
    }

    ._fileBrowser ._eachFile:hover ._deleteInner {
        display: flex;
    }

    ._fileBrowser ._deleteInner svg {
        width: 16px;
    }

    ._fileBrowser ._deleteInner:hover {
        transform: scale(1.1);
    }

    ._fileBrowser ._popupBackground {
		background: #0004;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;
        position: absolute;
        z-index: 6;
        left: 0px;
		top: 0px;
	}

	._fileBrowser ._popupBackground ._popupContainer {
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

	._fileBrowser ._popupBackground ._popupContainer._fullScreen {
		max-width: 95vw;
		max-height: 95vh;
		width: 95vw;
		height: 95vh;
	}

    ._fileBrowser ._imageResizer {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
    }

    ._fileBrowser ._imageResizerHeader {
        color: #FFF;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 20px;
        min-width: 600px;
        background-color: #427EE4;
        height: 40px;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
    }

    ._fileBrowser ._imageResizerBody {
        border-width: 0px 1px 1px 1px;
        border-style: solid;
        border-color: #d9d9d9;
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
    }

    ._fileBrowser ._imageResizerFooter {
        display: flex;
        margin-top: 15px;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
    }

    ._fileBrowser ._popupBackground ._popupContainer._imageResizerContainer {
        max-width: -webkit-fill-available;
        max-height: -webkit-fill-available;
        min-width: 600px;
        min-height: 500px;
        display: flex;
        flex-direction: column;
    }

    ._fileBrowser ._popupContainer._imageResizerContainer ._imageResizerBody {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
    }

    ._fileBrowser ._popupContainer._imageResizerContainer ._imageResizerBody ._imagePreviewer {
        flex: 1;
        background-image:
            linear-gradient(45deg, #EDEDED 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #EDEDED 75%),
            linear-gradient(45deg, transparent 75%, #EDEDED 75%),
            linear-gradient(45deg, #EDEDED 25%, #fff 25%);    

        background-size: 20px 20px;       
        background-position: 0 0, 0 0, -10px -10px, 10px 10px;
        box-shadow: inset 0px 0px 5px #0004;
        overflow: auto;
        position: relative;
    }

    ._fileBrowser ._imagePreviewer img {
        position: absolute;
        transform-origin: 0 0;
        top: 0px;
        transition: all linear 0.3s;
    }

    ._fileBrowser ._imageSizeDisplayer {
        position: absolute;
        left: 0px;
        top: 0px;
        border: 3px dotted transparent;
        z-index: 1;
    }

    ._fileBrowser ._imagePreviewer:hover ._imageSizeDisplayer {
        border-color: #0004;
        transition: all linear 0.3s;
    }

    ._fileBrowser ._popupContainer._imageResizerContainer._fullScreen ._imageResizerBody {
        flex-direction: row;
    }

    ._fileBrowser ._popupContainer._imageResizerContainer._fullScreen ._imageResizerBody ._imageControls {
        min-width: 300px;
        flex-grow: 0;
    }

    ._fileBrowser ._imageZOOM {
        display: flex;
        justify-content: center;
        align-items: center;
        position: sticky;
        z-index: 4;
        left: 20px;
        top: 10px;
        background-color: #FFF;
        border-radius: 5px;
        box-shadow: 0px 0px 5px #0004;
        width: 82px;
    }

    ._fileBrowser ._imageZOOM button {
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        box-shadow: none;
        background-color: #FFF;
        padding: 3px;
        width: 25px;
        height: 25px;
    }

    ._fileBrowser ._imageZOOM button:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    ._fileBrowser ._imageZOOM button:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    ._fileBrowser ._imageControls {
        display: flex;
        gap: 10px;
        padding: 10px;
        height: 200px;
    }

    ._fileBrowser ._popupContainer._imageResizerContainer._fullScreen ._imageControls {
        flex-direction: column;
    }

    ._fileBrowser ._controlGroup {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    ._fileBrowser ._controlHeader {
        display: flex;
        flex-direction: row;
        gap: 5px;
        justify-content: center;
        align-items: center;
        min-height: 30px;
        border-bottom: 2px solid #427EE4;
    }

    ._fileBrowser ._controlLabel {
        font-size: 12px;
        color: #000000;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    ._fileBrowser ._controlBody {
        display: flex;
        gap: 10px;
        flex-direction: column;
        padding: 10px;
        overflow: auto;
    } 

    ._fileBrowser ._controlBody button {
        display: flex;
        align-items: center;
        gap: 5px;
        justify-content: center;
        font-size: 12px;
    }

    ._fileBrowser ._controlValue {
        display: flex;
        gap: 5px;
        align-items: center;
    }

    ._fileBrowser ._controlValue ._simpleEditorRange {
        flex: 1;
    }

    ._fileBrowser ._controlInput {
        display: flex;
        align-items: center;
        height: 32px;
        background-color: #F8FAFB;
        padding: 5px;
        border-radius: 6px;
    }

    ._fileBrowser ._controlInput input {
        flex: 1;
        background: none;
        border: none;
        font-size: 12px;
        padding: 0px;
        height: 100%;
        outline: none;
    }

    ._fileBrowser ._controlInput input._degrees {
        width: 40px;
    }
    ._fileBrowser ._controlInput input._size {
        width: 60px;
    }

    ._fileBrowser ._controlInput span {
        color: #000;
        font-size: 12px;
        padding: 0px 5px;
    }

    ._fileBrowser ._aspectRatio {
        color: #d9d9d9;
    }

    ._fileBrowser ._aspectRatio:hover,
    ._fileBrowser ._aspectRatio._active {
        color: #427EE4;
    }

    ._fileBrowser ._cropBox {
        position: absolute;
        border: 2px solid #FFF;
        z-index: 3;
        mix-blend-mode: difference;
    }

    ._fileBrowser ._cropBox ._mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 3;
    }

    ._fileBrowser ._cropBox ._horizontal1,
    ._fileBrowser ._cropBox ._horizontal2 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 33%;
        border-bottom: 1px solid #FFFFFF;
    }

    ._fileBrowser ._cropBox ._horizontal2 {
        height: 66%;
    }

    ._fileBrowser ._cropBox ._vertical1,
    ._fileBrowser ._cropBox ._vertical2 {
        position: absolute;
        top: 0;
        left: 0;
        width: 33%;
        height: 100%;
        border-right: 1px solid #FFFFFF;
    }

    ._fileBrowser ._cropBox ._vertical2 {
        width: 66%;
    }

    ._fileBrowser ._cropBox ._topLeft {
        position: absolute;
        top: -4px;
        left: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-top: 2px solid #FFFFFF;
        border-left: 2px solid #FFFFFF;
        cursor: nw-resize;
    }

    ._fileBrowser ._cropBox ._topRight {
        position: absolute;
        top: -4px;
        right: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-top: 2px solid #FFFFFF;
        border-right: 2px solid #FFFFFF;
        cursor: ne-resize;
    }

    ._fileBrowser ._cropBox ._bottomLeft {
        position: absolute;
        bottom: -4px;
        left: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-bottom: 2px solid #FFFFFF;
        border-left: 2px solid #FFFFFF;
        cursor: sw-resize;
    }

    ._fileBrowser ._cropBox ._bottomRight {
        position: absolute;
        bottom: -4px;
        right: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-bottom: 2px solid #FFFFFF;
        border-right: 2px solid #FFFFFF;
        cursor: se-resize;
    }

    ._fileBrowser ._cropBox ._top {
        position: absolute;
        top: -4px;
        left: 40%;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-top: 2px solid #FFFFFF;
        cursor: n-resize;
    }

    ._fileBrowser ._cropBox ._bottom {
        position: absolute;
        bottom: -4px;
        left: 40%;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-bottom: 2px solid #FFFFFF;
        cursor: s-resize;
    }

    ._fileBrowser ._cropBox ._left {
        position: absolute;
        top: 40%;
        left: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-left: 2px solid #FFFFFF;
        cursor: w-resize;
    }

    ._fileBrowser ._cropBox ._right {
        position: absolute;
        top: 40%;
        right: -4px;
        z-index: 2;
        width: 20%;
        height: 20%;
        border-right: 2px solid #FFFFFF;
        cursor: e-resize;
    }

    ._fileBrowser ._iroBackground {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 5;
        background: #0005;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    ._fileBrowser ._iroContainer {
        position: absolute;
        background: #FFF;
        padding: 10px;
        border-radius: 4px;
    }

    ._fileBrowser ._imageResizerHeader {
        min-width: auto;
    }

    ._fileBrowser ._iroBody {
        padding: 20px 10px 10px 10px;
        border: 1px solid #d2d2d2;
        border-top: none;
        border-bottom: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    ._fileBrowser ._iroButtons {
        padding: 5px 10px;
        border: 1px solid #d2d2d2;
        border-top: none;
        justify-content: flex-end;
        display: flex;
        gap: 10px;
    }
    `;
	return <style id="fileBrowserStyles">{styles}</style>;
}
