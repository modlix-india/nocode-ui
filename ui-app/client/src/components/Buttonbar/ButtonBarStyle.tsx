import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import {
	styleDefaults,
	styleProperties,
	stylePropertiesForTheme,
} from './buttonBarStyleProperties';
import { propertiesDefinition } from './buttonBarproperties';

const PREFIX = '.comp.compButtonBar';
const NAME = 'ButtonBar';
export default function ButtonBarStyle({
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
		const { buttonBarDesign, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'buttonBarDesign',
			'colorScheme',
		);

		const fn = () => setTimeout(() => {
			inflateAndSetStyleProps(
				[buttonBarDesign, colorScheme],
				stylePropertiesForTheme,
				(props, _) => styleProperties.splice(0, 0, ...props),
				styleDefaults,
			);
			setReRender(Date.now());
		}, 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
        ${PREFIX} {
            display: flex;
        }

        ${PREFIX} ._button {
            flex: 1;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return <style id="ButtonBarcss">{css}</style>;
}
