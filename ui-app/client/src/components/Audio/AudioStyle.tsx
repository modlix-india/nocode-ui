import { StyleResolution } from '../../types/common';
import React, { useEffect, useState } from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { StylePropertyDefinition } from '../../types/common';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
	applyPreloadedStyleProperties,
	inflateAndSetStyleProps,
} from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import {
	styleProperties,
	styleDefaults,
	stylePropertiesForTheme,
	waveformStyleProperties,
	waveformStyleDefaults,
	waveformStylePropertiesForTheme,
} from './audioStyleProperties';
import { propertiesDefinition } from './audioProperties';

const PREFIX = '.comp.compAudio';
const NAME = 'Audio';

// The waveform entries are bundled, so they are expanded for the colour schemes right away.
inflateAndSetStyleProps(
	[findPropertyDefinitions(propertiesDefinition, 'colorScheme').colorScheme],
	waveformStylePropertiesForTheme,
	props => waveformStyleProperties.splice(0, waveformStyleProperties.length, ...props),
	waveformStyleDefaults,
);
export default function AudioStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size)
		applyPreloadedStyleProperties(
			NAME,
			propertiesDefinition,
			styleProperties,
			stylePropertiesForTheme,
			styleDefaults,
		);

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
    background-color: ${t('colorSeven', '#ffffff')};
    color: ${t('fontColorOne', '#333')};
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
    border-top: 10px solid ${t('colorSeven', '#ffffff')};
	
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

	${PREFIX} ._waveform {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--audio-waveform-bar-gap, 2px);
		width: 100%;
		height: 40px;
		cursor: pointer;
		touch-action: none;
		user-select: none;
	}
	${PREFIX} ._waveform:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
	${PREFIX} ._waveform ._waveformBar {
		flex: 0 0 var(--audio-waveform-bar-width, 3px);
		min-height: 2px;
		border-radius: 2px;
		background-color: #d0d5dd;
		pointer-events: none;
	}
	${PREFIX} ._waveform ._waveformBar._played {
		background-color: currentColor;
	}
	${PREFIX} ._waveform ._waveformCursor {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		margin-left: -1px;
		background-color: currentColor;
		pointer-events: none;
	}
	 
	
     ` +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme) +
		processStyleDefinition(PREFIX, waveformStyleProperties, waveformStyleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
