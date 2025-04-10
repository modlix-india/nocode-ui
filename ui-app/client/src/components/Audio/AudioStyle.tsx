import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { StylePropertyDefinition } from '../../types/common';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { styleProperties, styleDefaults } from './audioStyleProperties';

const PREFIX = '.comp.compAudio';
const NAME = 'Audio';
export default function AudioStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME])
		styleProperties.filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, (props) => { styleProperties.splice(0, 0, ...props); setReRender(Date.now()) }, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);
	const css =
		` 
		${PREFIX} {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			text-align: start;
		 }
		 ${PREFIX}._audioDesign2 ._audioWithoutProgressBar {
		  justify-content: space-between;
	   }
	   
		 ${PREFIX} ._audioWithoutProgressBar {
		  display: flex;
		  justify-content: center;
		  align-items: center;
		  width: 100%;
		  gap:10px;
	   }

		${PREFIX} ._playPauseContainer {
			display: flex;
		}
		${PREFIX} ._fileName {
			align-self: start;
			}
		  
	
	${PREFIX} ._rewind {
		display : flex;
	}

	${PREFIX} ._fastForward {
		display : flex;
	}


	${PREFIX} ._time {
	display: flex;
} 

	${PREFIX} ._progressBarContainer {
	position: relative;
	width: 100%;
	display:flex;
}

     ${PREFIX}._audioDesign2 ._progressBarContainer {
	height: 5px;
}
${PREFIX} ._seekTimeTextOnHover {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 12px;
    background-color: #ffffff;
    color: #333;
    border-radius: 4px;
	border: 1px solid #1133891A
}


${PREFIX} ._seekTimeTextOnHover::after {
    content: "";
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 10px solid #ffffff;
	
}

${PREFIX} ._progressBar {
    width: 100%;
	
}

${PREFIX} ._toolTip {
	position: absolute;
	}

${PREFIX} ._rewindFastForward {
	display: flex;
	flex-direction: row;
}

 ${PREFIX} ._volumeSliderContainer {
   display: flex;
   }

  ${PREFIX} ._volumeControls._rightHorizontal  {
    flex-direction: row-reverse;
   }

   ${PREFIX} ._volumeControls._topVertical {
   flex-direction: row ;
   justify-content: center;
    align-items: center;
   }

   ${PREFIX} ._volumeControls {
    display: flex;
    align-items: center;
}

${PREFIX} ._volumeControls ._onHoverVolumeControl {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 16px;
    width: 0px;
    overflow: hidden;
    transition: width 0.3s ease-in-out;
}

${PREFIX} ._volumeControls:hover ._onHoverVolumeControl {
    width: 135px;
}

   ${PREFIX} ._volumeControls._topVertical ._volumeSliderContainer {
   display: flex;
    transform:rotate(-90deg);
	position:absolute;
	bottom:90px;
   }

   ${PREFIX} ._volumeControls._bottomVertical {
   display: flex;
   flex-direction:column-reverse;
    align-items: center;
	position: relative;
   }


   ${PREFIX} ._volumeControls._bottomVertical ._volumeSliderContainer {
   display: flex;
    position:absolute;
	transform:rotate(-90deg);
	 align-items: center;
	top:80px;
   }

   ${PREFIX} ._playBackSpeedGrid {
   display:flex;
   cursor:pointer;
   }

   ${PREFIX} ._volumeButton {
	display:flex;
	cursor:pointer;
	}

   ${PREFIX} ._playBackSpeed span{
	cursor:pointer;
	}
	 
	
     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
