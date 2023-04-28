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
    ${PREFIX} .videoControlsContainer{
      position:absolute;
      bottom:1%;
      width:100%;
      padding: 0px 10px 5px 5px;
      display:flex;
      flex-direction:column;
      gap:8px;
    }

    ${PREFIX} .playBackIcon {
        color:#ffffff;
       font-size:32px;
       padding-left:10px;
       width:50px;
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
        background-image: linear-gradient(#ffffff);
        background-size: 70% 100%;
        background-repeat: no-repeat;
        width: 100%;
        height:2px;
        accent-color: #ff0000;
     
      }
      
   

      ${PREFIX} .volumeButton{
        color:#ffffff;
      }

      ${PREFIX} .toolTip{
        position: absolute;
        bottom:84%;
        color:#ffffff;
       
      }

      ${PREFIX} .duration{
        color:#ffffff;
      }

      ${PREFIX} .timeElapsed{
        color:#ffffff;
      }

      ${PREFIX} .timeSplitter{
        color:#ffffff;
      }

      ${PREFIX} .playAndVolumeGrid{
        display: flex;
        align-items: center;
        gap: 22px;
        
      }

       ${PREFIX} .playAndFullscreenGrid{
        display:flex;
       }

       ${PREFIX} .pipAndFullScreenGrid{
        justify-content: flex-end;
        display: flex;
        width: 100%;
        gap: 42px;
        align-items: center;
       }
       ${PREFIX} .volumeControls{
        display: flex;
        align-items: center;
        width:110px;
        gap:4px;
       }

       ${PREFIX} .pip {
        color: #ffffff;
        
       }

       ${PREFIX} .fullScreen{
        color: #ffffff;
       }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="VideoStyle">{css}</style>;
}
