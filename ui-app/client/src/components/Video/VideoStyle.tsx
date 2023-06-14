import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './videoStyleProperties';

const PREFIX = '.comp.compVideo';
export default function VideoStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		` 
    ${PREFIX} {
       position:relative;
    }

    ${PREFIX} video {
      width: 100%;
      height: 100%;
    }

    ${PREFIX} .videoControlsContainer{
      position:absolute;
      bottom:1%;
      width:100%;
      display:flex;
      flex-direction:column;
    }

    ${PREFIX} .playBackIcon {
        padding-left:10px;
      }

      ${PREFIX} .progressBarContainer {
        width:100%;
        position: relative;
       }

      ${PREFIX} .progressBar {
       width:100%;
       cursor:pointer;
      }

      ${PREFIX} input[type="range"] {
        background-size: 70% 100%;
        background-repeat: no-repeat;
        width: 100%;
      }
      
      ${PREFIX} .volumeButton{
        color:#ffffff;
      }

      ${PREFIX} .toolTip{
        position: absolute;
        bottom:84%;
      }

      ${PREFIX} .playAndVolumeGrid{
        display: flex;
        align-items: center;
        gap: 22px;
      }

       ${PREFIX} .playAndFullscreenGrid{
        display:flex;
       }

       ${PREFIX} .pipAndFullScreenGrid {
        justify-content: flex-end;
        display: flex;
        width: 100%;
        gap: 42px;
        align-items: center;
       }

       ${PREFIX} .volumeControls {
        display: flex;
        align-items: center;
        width:110px;
        gap:4px;
       }


    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="VideoStyle">{css}</style>;
}
