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

    `;
	return <style id="fileBrowserStyles">{styles}</style>;
}
