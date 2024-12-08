import React, { useState, useEffect } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './videoStyleProperties';
import { StylePropertyDefinition } from '../../types/common';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';

const PREFIX = '.comp.compVideo';
const NAME = 'Video';
export default function VideoStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>([]);

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, setStyleProperties, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		else usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, []);
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
  ${PREFIX} ._progressBarContainer {
    width:100%;
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
