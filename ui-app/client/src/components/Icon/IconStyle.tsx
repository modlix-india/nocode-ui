import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './iconStyleProperies';
import { usedComponents } from '../../App/usedComponents';
import {
	applyPreloadedStyleProperties,
	inflateThemeStylePropsOnce,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './iconProperties';

const PREFIX = '.comp.compIcon';
const NAME = 'Icon';

const inflateVariants = () =>
	inflateThemeStylePropsOnce(
		propertiesDefinition,
		['designType', 'colorScheme'],
		stylePropertiesForTheme,
		styleProperties,
		styleDefaults,
	);
export default function IconStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size)
		applyPreloadedStyleProperties(
			NAME,
			propertiesDefinition,
			styleProperties,
			stylePropertiesForTheme,
			styleDefaults,
		);

	// The design and colour variants go into the first paint (see inflateThemeStylePropsOnce).
	inflateVariants();

	useEffect(() => {
		const fn = () =>
			setTimeout(() => {
				if (inflateVariants()) setReRender(Date.now());
			}, 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
		${PREFIX} {
			display: inline;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="IconCss">{css}</style>;
}
