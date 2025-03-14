import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';
import { styleDefaults } from './tableColumnsStyleProperties';

const PREFIX = '.comp.compTableColumns';
const NAME = 'TableColumns';
export default function TableColumnsStyle({
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
