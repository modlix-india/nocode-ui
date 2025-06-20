import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './iconStyleProperies';
import { usedComponents } from '../../App/usedComponents';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './iconProperties';

const PREFIX = '.comp.compIcon';
const NAME = 'Icon';
export default function IconStyle({
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
			setTimeout(() => {
				inflateAndSetStyleProps(
					[designType, colorScheme],
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
			display: inline;
		}

		.comp.compIcon-container {
			display: inline-block;
			position: relative;
		}

		${PREFIX}-container ._tooltip {
			position: absolute;
			background-color: rgba(0, 0, 0, 0.2);
			color: #333;
			padding: 6px 10px;
			border-radius: 4px;
			white-space: nowrap;
			z-index: 30;
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
			--tooltip-offset: 10px;
		}

		${PREFIX}-container ._tooltip-top {
			bottom: 100%;
			left: 50%;
			transform: translateX(-50%);
			margin-bottom: var(--tooltip-offset);
		}

		${PREFIX}-container ._tooltip-bottom {
			top: 100%;
			left: 50%;
			transform: translateX(-50%);
			margin-top: var(--tooltip-offset);
		}

		${PREFIX}-container ._tooltip-left {
			right: 100%;
			top: 50%;
			transform: translateY(-50%);
			margin-right: var(--tooltip-offset);
		}

		${PREFIX}-container ._tooltip-right {
			left: 100%;
			top: 50%;
			transform: translateY(-50%);
			margin-left: var(--tooltip-offset);
		}

		${PREFIX}-container ._tooltip-center {
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="IconCss">{css}</style>;
}
