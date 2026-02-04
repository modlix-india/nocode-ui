import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { processStyleDefinition } from '../../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../../util/lazyStylePropertyUtil';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './tableRowStyleProperties';
import { propertiesDefinition } from '../Table/tableProperties';

const PREFIX = '.comp.compTableRow';
const NAME = 'TableRow';
export default function TableRowStyle({
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
		const { tableDesign, colorScheme } = findPropertyDefinitions(
			propertiesDefinition,
			'tableDesign',
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
			[tableDesign, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`${PREFIX} { vertical-align: middle; }` +
		processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableRowCss">{css}</style>;
}
