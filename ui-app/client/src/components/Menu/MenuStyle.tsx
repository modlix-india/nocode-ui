import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './menuStyleProperties';
import { StylePropertyDefinition } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './menuProperties';

const PREFIX = '.comp.compMenu';
const NAME = 'Menu';
export default function MenuStyle({
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
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
		text-decoration: none;
	}

	${PREFIX} ._externalButton {
		position: relative;
	}

	${PREFIX} ._icon,
	${PREFIX} ._imageIcon,
	${PREFIX} ._activeImageIcon {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	${PREFIX} ._imageIcon img,
	${PREFIX} ._activeImageIcon img {
		display: block;
		object-fit: contain;
	}

	${PREFIX} ._caretIcon {
		position: relative;
		transition: transform 0.5s ease-in-out;
	}

	${PREFIX} ._caretIconContainer {
		flex: 1;
		text-align: right;
 	}

	${PREFIX}Submenu._right_orientation,
	${PREFIX}Submenu._left_orientation,
	${PREFIX}Submenu._top_orientation,
	${PREFIX}Submenu._bottom_orientation {
		position: fixed;
		background:#fff;
		z-index: 10000;
		bottom: auto;
		right: auto;
		transform: none;
		box-sizing: border-box;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
