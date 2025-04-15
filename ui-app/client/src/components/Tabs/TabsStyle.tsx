import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './tabsStyleProperties';
import {
	findPropertyDefinitions,
	inflateAndSetStyleProps,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './tabsProperties';
import { usedComponents } from '../../App/usedComponents';

const PREFIX = '.comp.compTabs';
const NAME = 'Tabs';
export default function TabsStyles({
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

		const fn = () =>
			inflateAndSetStyleProps(
				[designType, colorScheme],
				stylePropertiesForTheme,
				(props, _) => styleProperties.splice(0, 0, ...props),
				styleDefaults,
			);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
		${PREFIX} {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
		}

		${PREFIX}._vertical {
			flex-direction: row;
		}

		${PREFIX} .tabGridDiv {
			flex: 1;
			width: 100%;
			height: 100%;
			position: relative;
		}

		${PREFIX} .tabsContainer {
			display: flex;
			overflow-x: auto;
			position: relative;
			
		}

		${PREFIX}._vertical > .tabsContainer {
			flex-direction: column;
			overflow-y: auto;
			overflow-x: hidden;
		}

		${PREFIX} .tabDiv {
			cursor: pointer;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 3;
		}
		
		${PREFIX} .tabDiv._vertical {
			flex-direction: column;
		}
		
		${PREFIX} .tabHighlighter {
			position: absolute;
			transition: all 0.3s ease-in-out;
			left: 0;
			top: 0;
			z-index: 2;
		}

		${PREFIX} .icon {
			position: relative;
		}
		
		${PREFIX} .tabsContainer._center {
			justify-content: center;
		}

		${PREFIX} .tabsContainer._start {
			justify-content: flex-start;
		}

		${PREFIX} .tabsContainer._end {
			justify-content: flex-end;
		}

		${PREFIX} .tabsContainer._spaceAround {
			justify-content: space-around;
		}

		${PREFIX} .tabsContainer._spaceBetween {
			justify-content: space-between;
		}

		${PREFIX} .tabsContainer._spaceEvenly .tabDiv{
			flex: 1;
		}

		${PREFIX}._horizontal > .tabsContainer > .tabsSeperator {
			position: absolute;
			left: 0;
			bottom: 0;
			z-index: 1;
			width: 100%;
			height: 1px;
		}

		${PREFIX}._vertical > .tabsContainer >  .tabsSeperator {
			position: absolute;
			right: 0;
			top: 0;
			z-index: 1;
			width: 1px;
			height: 100%; 
		}

` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TabsCss">{css}</style>;
}
