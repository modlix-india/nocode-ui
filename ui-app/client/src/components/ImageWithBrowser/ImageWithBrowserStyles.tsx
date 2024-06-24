import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './imageWithBrowserStyleProperties';

const PREFIX = '.comp.compImageWithBrowser';

export default function ImageStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} ._onClickTrue {
            cursor: pointer;
        }

        ${PREFIX} img {
            width: inherit;
            height: inherit;
        }

        ._imageBrowserPopup ._browserBack {
            background-color: #FFF;
            padding: 20px;
            box-shadow: 0px 3px 4px 0px #00000040;
            border-radius: 4px;
            gap: 10px;
			position: relative;
			z-index: 7;
        }

		._imageBrowserPopup ._altTextContainer {
			gap: 10px;
		}

		._imageBrowserPopup ._altTextContainer input {
			flex: 1;
		}

        ._imageBrowserPopup ._browserBack input,
		._imageBrowserPopup ._browserBack select {
            border: none;
            padding: 5px;
            background-color: #F5F5F5;
        }

        ._imageBrowserPopup ._iconSelectionBrowser {
			height: 350px;
			width: 540px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		._imageBrowserPopup ._iconSelectionBrowser ._selectors {
			display: flex;
			gap: 5px;
		}

        ._imageBrowserPopup ._pathContainer {
			display: flex;
			gap: 10px;
		}

		._imageBrowserPopup ._pathContainer i.fa {
			cursor: pointer;
		}

        ._imageBrowserPopup ._iconSelectionDisplay {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			overflow: auto;
		}
		
		._imageBrowserPopup ._iconSelectionDisplay ._eachIcon {
			width: 90px;
			height: 90px;
			display: flex;
			flex-direction: column;
			font-size: 11px;
			cursor: pointer;
			align-items: center;
			padding: 5px;
			border-radius: 5px;
			background-color: #fafafa;
			justify-content: center;
			gap: 15px;
			text-align: center;
			word-break: break-all;
			position: relative;
		}

		._imageBrowserPopup ._iconSelectionDisplay ._eachIcon:hover {
			background-color: #ddd;
		}

        ._imageBrowserPopup ._eachIcon ._image {
			width: 48px;
			height: 48px;
			background-repeat: no-repeat;
			background-size: contain;
			background-position: center center;
		}

		._imageBrowserPopup ._iconSelectionDisplay ._eachIcon:hover {
			background-color: #ddd;
		}

        ._imageBrowserPopup ._eachIcon input{
			font-size: 11px;
			border: none;
			width: 80px;
			background-color: #eee;
			padding:0px 5px;
		}

		._imageBrowserPopup ._eachIcon ._deleteButton {
			position: absolute;
			display: none;
			right: 5px;
			top: 5px;
		}
		._imageBrowserPopup ._eachIcon:hover ._deleteButton {
			display: block;
		}

		._imageBrowserPopup ._pathParts span {
			padding: 0px 5px;
		}

		._imageBrowserPopup ._eachIcon._upload {
			border: 2px dashed #ccc;
		}

		._imageBrowserPopup ._eachIcon input[type="file"] {
			position: absolute;
			opacity: 0;
			width: 100%;
    		height: 100%;
			cursor: pointer;
		}

        ._imageBrowserPopup ._eachIcon input[type="file"] {
			position: absolute;
			opacity: 0;
			width: 100%;
    		height: 100%;
			cursor: pointer;
		}

        ._imageBrowserPopup ._pathParts span._clickable {
			cursor: pointer;
			border-radius: 3px;
		}

		._imageBrowserPopup ._pathParts span._clickable:hover {
			color: #000;
			background-color: #eee;
		}

		._closeIcon {
			position:absolute;
			left: 100%;
			border-radius: 50%;
			background-color: #fff;
			display: flex;
			width: 20px;
			height: 20px;
			align-items: center;
			justify-content: center;
			top: 0%;
			transform: translate(-50%, -50%);
			box-shadow: 3px 1px 3px 0px #00000020;
			cursor: pointer;
		}

		._imageBrowserPopup ._progressBar {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			padding-bottom: 5%;
		}

		._imageBrowserPopup ._progressBar  i.fa {
			font-size: 50px;
		}

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ImageWithBrowserCss">{css}</style>;
}
