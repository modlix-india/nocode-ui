import React, { useEffect, useState } from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults } from './menuStyleProperties';
import { StylePropertyDefinition, StyleResolution } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import { lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compMenu';
const NAME = 'Menu';
export default function MenuStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [styleProperties, setStyleProperties] = useState<Array<StylePropertyDefinition>>(
		window.styleProperties[NAME] ?? [],
	);

	if (window.styleProperties[NAME] && !styleDefaults.size) {
		window.styleProperties[NAME].filter((e: any) => !!e.dv)?.map(
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
	${PREFIX}._imageIcon,
	${PREFIX}._activeImageIcon {
		position: relative;
	}

	${PREFIX} ._caretIcon {
		position: relative;
		transition: transform 0.5s ease-in-out;
	}

	${PREFIX} ._caretIconContainer {
		flex: 1;
		text-align: right;
 	}

	${PREFIX} + ._right_orientation {
		position: absolute;
		left: 100%;
		z-index: 1;
	}

	${PREFIX} + ._bottom_orientation {
		position: absolute;
		left: 0;
		z-index: 1;
		top: 100%;
	}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MenuCss">{css}</style>;
}
