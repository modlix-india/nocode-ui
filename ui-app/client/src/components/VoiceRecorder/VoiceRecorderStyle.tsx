import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';
import {
	styleProperties,
	styleDefaults,
	stylePropertiesForTheme,
} from './voiceRecorderStyleProperties';
import { propertiesDefinition } from './voiceRecorderProperties';

const PREFIX = '.comp.compVoiceRecorder';
const NAME = 'VoiceRecorder';

export default function VoiceRecorderStyle({
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
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			text-align: start;
		}

		${PREFIX}._voiceRecorderDesign2 {
			border-radius: 16px;
		}

		${PREFIX} ._recordContainer {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			gap: 10px;
		}

		${PREFIX}._voiceRecorderDesign2 ._recordContainer {
			display:flex
			gap: 10px;
		}

		${PREFIX} ._playPauseContainer {
			position: relative;
			display: flex;
			align-items: center;
			gap: 6px;
			cursor: pointer;
		}

		${PREFIX} ._recordingDuration {
			display: flex;
			align-items: center;
			justify-content: center;
			font-variant-numeric: tabular-nums;
			white-space: nowrap;
		}

		${PREFIX} ._audioLevelSlider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 0;
			height: 0;
			opacity: 0;
		}

		${PREFIX} ._audioLevelSlider::-moz-range-thumb {
			width: 0;
			height: 0;
			opacity: 0;
			border: none;
		}

		${PREFIX} ._progressBarContainer {
			position: relative;
			width: 100%;
			display: flex;
		}

		${PREFIX} ._progressBar {
			width: 100%;
		}

		${PREFIX} ._visualizerContainer {
			display: flex;
			justify-content: center;
			flex-direction: column;
			width: 100%;
		}

		${PREFIX} ._visualizer {
			width: 100%;
			border-radius: 8px;
			display: block;
		}
		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="VoiceRecorderStyle">{css}</style>;
}
