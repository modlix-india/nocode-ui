import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../../util/lazyStylePropertyUtil';
import {
	styleProperties,
	styleDefaults,
	stylePropertiesForTheme,
} from './tableColumnsStyleProperties';
import { propertiesDefinition } from '../Table/tableProperties';

const PREFIX = '.comp.compTableColumns';
const NAME = 'TableColumns';
export default function TableColumnsStyle({
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

	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`${PREFIX} {flex-direction: column; flex: 1; border-spacing: 0; width: 100%; position: relative; }

		.comp.compTable ._row:first-child .comp.compTableHeaderColumn,
		.comp.compTable ._row:first-child .comp.compTableColumn {
			border-top: none !important;
		}
		.comp.compTable ._row:last-child .comp.compTableColumn {
			border-bottom: none !important;
		}
		
		.comp.compTable ._row .comp.compTableHeaderColumn:first-child,
		.comp.compTable ._row .comp.compTableColumn:first-child {
			border-left: none !important;
		}

		.comp.compTable ._row .comp.compTableHeaderColumn:last-child,
		.comp.compTable ._row .comp.compTableColumn:last-child {
			border-right: none !important;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnsCss">{css}</style>;
}
