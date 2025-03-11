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
   }
    ${PREFIX} audio {
    width: 100%;
    height: 100%;
    }

     ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="AudioStyle">{css}</style>;
}
