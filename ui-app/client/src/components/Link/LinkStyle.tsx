import { useState, useEffect } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './linkProperties';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './linkStyleProperties';

const PREFIX = '.comp.compLink';
const NAME = 'Link';
export default function LinkStyle({
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

		const fn = () => {
			inflateAndSetStyleProps(
				[designType, colorScheme],
				stylePropertiesForTheme,
				(props, _) => styleProperties.splice(0, 0, ...props),
				styleDefaults,
			);
			setReRender(Date.now());
		};

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
	}

	${PREFIX} ._externalButton {
		position: relative;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	console.log(css);

	return <style id="LinkCss">{css}</style>;
}
