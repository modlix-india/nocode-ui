import { useState, useEffect } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition } from '../../../types/common';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';
import { styleDefaults } from './tableGridStyleProperties';

const PREFIX = '.comp.compTableGrid';
const NAME = 'TableGrid';
export default function TableGridStyle({
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
	${PREFIX}{
		flex-direction: column;
	}

	${PREFIX}._ROWLAYOUT{
		flex-direction: row;
	}

	${PREFIX} ._eachTableGrid {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableGridCss">{css}</style>;
}
