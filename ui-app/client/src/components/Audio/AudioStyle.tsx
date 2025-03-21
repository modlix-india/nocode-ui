import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { StylePropertyDefinition } from '../../types/common';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { styleDefaults } from './audioStyleProperties';

const PREFIX = '.comp.compAudio';
const NAME = 'Audio';
export default function AudioStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>(
		globalThis.styleProperties[NAME] ?? [],
	);

	if (globalThis.styleProperties[NAME] && !styleDefaults.size) {
		globalThis.styleProperties[NAME].filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);
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


  ${PREFIX} ._volumeControls._rightHorizontal  {
    flex-direction: row-reverse;
   }

   ${PREFIX} ._volumeControls._topVertical {
   flex-direction:column;
   justify-content: center;
    align-items: center;
   }

   ${PREFIX} ._volumeControls {
    display: flex;
    align-items: center;
}

${PREFIX} ._volumeControls ._volumeSliderContainer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 16px;
    width: 0px;
    overflow: hidden;
    transition: width 0.3s ease-in-out;
}

${PREFIX} ._volumeControls:hover ._volumeSliderContainer {
    width: 135px;
}

   ${PREFIX} ._volumeControls._topVertical ._volumeSliderContainer {
    transform:rotate(-90deg);
	position:absolute;
	bottom:100px;
   }

   ${PREFIX} ._volumeControls._bottomVertical {
   flex-direction:column-reverse;
    align-items: center;
	position: relative;
   }


   ${PREFIX} ._volumeControls._bottomVertical ._volumeSliderContainer {
    position:absolute;
	transform:rotate(-270deg);
	top:80px;
   }

   ${PREFIX} ._playBackSpeedGrid {
   display:flex;
   cursor:pointer;
   }

   ${PREFIX} ._playBackSpeed span{
	cursor:pointer;
	}
	
     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
