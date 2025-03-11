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
      position:relative;
	  height:50px;
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  display: flex;
	  align-items: center;
	  background: #222;
	  color: white;
	  padding: 12px;
	  border-radius: 10px;
	  gap: 15px;
	  position: relative;
	  width: 100%;
	  max-width: 400px;
   }
    ${PREFIX} audio {
    width: 100%;
    height: 100%;
    }

	${PREFIX} ._playPauseButton {
	    cursor: pointer;
	    font-size: 20px;
	    background: #444;
	    color: white;
	    border-radius: 50%;
	    padding: 10px;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    width: 40px;
	    height: 40px;
		}

	${PREFIX} ._time {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 14px;
	color: #ddd;
} 
	${PREFIX} ._timeSplitter {
	color: #888;
}

	${PREFIX} ._progressBarContainer {
	position: relative;
	width: 100%;
}

${PREFIX} ._progressBar {
	width: 100%;
	cursor: pointer;
	background: #666;
	border-radius: 5px;
	height: 5px;
	outline: none;
	-webkit-appearance: none;
}

${PREFIX} ._toolTip {
	position: absolute;
	background: black;
	color: white;
	padding: 4px 8px;
	border-radius: 5px;
	font-size: 12px;
	white-space: nowrap;
	top: -30px;
	transform: translateX(-50%);
	
}

${PREFIX} ._volumeControls {
	display: flex;
	align-items: center;
	gap: 10px;
}

	${PREFIX} ._volumeControls input {
	cursor: pointer;
	width: 80px;
}

${PREFIX} ._playBackSpeed {
	position: relative;
	border-radius: 5px;
	cursor: pointer;
	font-size: 14px;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
}

${PREFIX} .speedOptions {
	position: absolute;
	top: 30px;
	left: 0;
	background: black;
	color: white;
	border-radius: 5px;
	padding: 5px;
	display: flex;
	flex-direction: column;
	gap: 5px;
}

${PREFIX} .speedOptions button {
	background: transparent;
	border: none;
	color: white;
	cursor: pointer;
	padding: 5px;
	width: 100%;
	text-align: left;
}

${PREFIX} ._volumeButton{
width:10px;}



     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
