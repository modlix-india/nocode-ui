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
   }
   ${PREFIX}._audioDesign2 ._audioWithoutProgressBar {
	justify-content: space-between;
 }

   ${PREFIX} ._audioWithoutProgressBar {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%
 }

	${PREFIX} ._playIconIcon{
		width:  100%;
		}
	  
	${PREFIX} ._pauseIconIcon{
		width:  100%; 
	}

	${PREFIX} ._time {
	display: flex;
} 

	${PREFIX} ._progressBarContainer {
	position: relative;
	width: 100%;
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

${PREFIX} ._volumeControls  {
    display: flex;
	align-items: center;
   }

  ${PREFIX} ._volumeControls._rightHorizontal  {
    flex-direction: row-reverse;
   }

   ${PREFIX} ._volumeControls._topVertical {
   flex-direction:column;
    align-items: center;
  
   }

   ${PREFIX} ._volumeControls._topVertical ._volumeSliderContainer {
    transform:rotate(-90deg);
	position:absolute;
	bottom:80px;
   }

   ${PREFIX} ._volumeControls._bottomVertical {
   flex-direction:column-reverse;
    align-items: center;
   }


   ${PREFIX} ._volumeControls._bottomVertical ._volumeSliderContainer {
    position:absolute;
	transform:rotate(-90deg);
	top:80px;

   }





	
     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
