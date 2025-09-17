import { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './videoStyleProperties';
import { StylePropertyDefinition } from '../../types/common';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import { propertiesDefinition } from './videoProperties';

const PREFIX = '.comp.compVideo';
const NAME = 'Video';
export default function VideoStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const { designType, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'designType',
			'colorScheme',
		);
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			(props, originalStyleProps) => {
				styleProperties.splice(0, 0, ...props);
				if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
				setReRender(Date.now());
			},
			styleDefaults,
			[designType, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		` 
    ${PREFIX} {
      position:relative;
   }
   ${PREFIX} video {
    width: 100%;
    height: 100%;
  }
  ${PREFIX} ._videoControlsContainer{
    position:absolute;
    bottom:1%;
    width:100%;
    display:flex;
    flex-direction:column;
  }
  ${PREFIX} ._progressBarContainer, ${PREFIX}  ._playAndFullscreenGrid {
    width:10px;
    position: relative;
   }
   ${PREFIX} ._progressBar {
    width:100%;
    cursor:pointer;
   }

   ${PREFIX} ._toolTip{
    position: absolute;
    bottom:84%;
  }
  ${PREFIX} ._volumeControls {
    display: flex;
    align-items: center;
    gap:4px;
   }

   ${PREFIX} ._volumeHighIcon{
    width: 100%;
   }

   ${PREFIX} ._volumeMuteIcon{
    width:  100%;
   }

  ${PREFIX} ._fullScreenIcon{
  width:  100%;
  }

  ${PREFIX} ._playIconIcon{
  width:  100%;
  }

  ${PREFIX} ._pauseIconIcon{
  width:  100%; 
  }

  ${PREFIX} ._pipIcon{
  width:  100%;
  }

  ${PREFIX} ._volumeHighIcon svg , ${PREFIX} ._volumeMuteIcon svg,  ${PREFIX} ._pipIcon svg , ${PREFIX} ._fullScreenIcon svg, ${PREFIX} ._playIconIcon svg, ${PREFIX} ._pauseIconIcon svg {
    width:100%;
    height:100%;
   }

  ${PREFIX} ._pip{
    padding: 0;
    background-color: transparent;
    border: none;
  }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="VideoStyle">{css}</style>;
}
