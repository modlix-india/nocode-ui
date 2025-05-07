import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './imageStyleProperties';

const PREFIX = '.comp.compImage';

export default function ImageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
        ${PREFIX} ._onClickTrue {
            cursor: pointer;
        }

        ${PREFIX} img {
            width: inherit;
            height: inherit;
            opacity: 1;
            transition: opacity 0.3s;
        }
        
        ${PREFIX} ._imageContainer {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        ${PREFIX} ._zoomControls {
            position: absolute;
            display: flex;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            padding: 5px;
            z-index: 1;
        }
        
        ${PREFIX} ._zoomButton {
            background: none;
            border: none;
            color: white;
            font-size: 14px;
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 2px;
            border-radius: 3px;
            transition: background-color 0.2s;
        }
        
        ${PREFIX} ._zoomButton:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        ${PREFIX} ._zoomReset {
            min-width: 50px;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ImageCss">{css}</style>;
}
