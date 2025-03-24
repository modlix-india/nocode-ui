import React, { useEffect, useState } from 'react';
import { StylePropertyDefinition } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults } from './StepperStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compStepper';
const NAME = 'Stepper';
export default function StepperStyle({
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
		  
		ul${PREFIX} {
			display: flex;
			list-style-type: none;
			position: relative;
			padding-inline-start: 0px;
		}

		ul${PREFIX}._horizontal {
			width: 100%;
			flex-direction: row;
			overflow: auto;
		}

		ul${PREFIX}._vertical {
			flex-direction: column;
		}

		${PREFIX} ._listItem {	
			display: flex;
			flex-direction: row;
			align-items: center;
			position: relative;
		}

		${PREFIX} ._listItem._withLines {	
			flex-grow: 1;
			flex-shrink: 0;
		}

		ul._vertical${PREFIX} ._listItem {
		    flex-direction: column;
		}

		${PREFIX} ._listItem._nextItem {
			cursor: pointer;
		}

		${PREFIX} ._listItem._previousItem {			
			cursor: pointer;
		}

		${PREFIX}._pills ._listItem {
			flex-grow: 0;
		}

		${PREFIX}._rectangle_arrow ._listItem {
			justify-content: center;
		}

		${PREFIX}._rectangle_arrow ._listItem ._line {			
			position: absolute;
			top: 0;
			left: 100%;
			z-index: 1;
			clip-path: polygon(0 0, 100% 50%, 0 100%);
			margin-left: -0.2px;
		}

		ul${PREFIX}._default._horizontal ._listItem ._line,
		ul${PREFIX}._big_circle._horizontal ._listItem ._line {
			align-self: flex-start;
			flex-grow: 1;
		}

		ul${PREFIX}._default._horizontal._textTop ._listItem ._line,
		ul${PREFIX}._big_circle._horizontal._textTop ._listItem ._line {
			align-self: flex-end;
		}
		
		ul${PREFIX}._default._vertical ._listItem ._line,
		ul${PREFIX}._big_circle._vertical ._listItem ._line {
			flex-grow: 1;
		}

		ul${PREFIX}._default._vertical._textRight ._listItem ._line,
		ul${PREFIX}._big_circle._vertical._textRight ._listItem ._line {
			align-self: flex-start;
		}

		ul${PREFIX}._default._vertical._textLeft ._listItem ._line,
		ul${PREFIX}._big_circle._vertical._textLeft ._listItem ._line {
			align-self: flex-end;
		}
		
		${PREFIX} ._itemContainer {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: relative;
		}

		${PREFIX}._vertical ._itemContainer {
			width: 100%;
			justify-content: flex-start;
		}

		${PREFIX}._textRight ._itemContainer {
			flex-direction: row;
		}
		
		${PREFIX}._textLeft ._itemContainer {
			flex-direction: row-reverse;
		}
				
		${PREFIX}._textTop ._itemContainer {
		    flex-direction: column-reverse;
		}

		${PREFIX} ._step {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		${PREFIX} ._title {
		    white-space: nowrap;
			position: relative;
		}
			

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
