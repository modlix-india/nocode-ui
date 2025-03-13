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
	  justify-content: center;
	  align-items: center;
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

${PREFIX} ._volumeHighIcon{
    width: 100%;
   }

   ${PREFIX} ._volumeMuteIcon{
    width:  100%;
   }

${PREFIX} ._volumeControls {
	display: flex;
}

${PREFIX} ._rewindFastForward {
	display: flex;
	flex-direction: row;
}

${PREFIX} ._volumeHighIcon svg ,${PREFIX} ._volumeButton svg ,${PREFIX} ._volumeMuteIcon svg, ${PREFIX} ._playIconIcon svg, ${PREFIX} ._pauseIconIcon svg {
    width:100%;
    height:100%;
   }
	
     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
