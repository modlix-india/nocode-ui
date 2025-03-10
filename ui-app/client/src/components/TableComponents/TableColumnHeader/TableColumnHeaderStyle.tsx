import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';
import { styleDefaults } from './tableColumnHeaderStyleProperties';

const PREFIX = '.comp.compTableHeaderColumn';
const NAME = 'TableColumnHeader';
export default function TableColumnStyle({
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
		`${PREFIX} { vertical-align: middle; text-align:center}

		${PREFIX} ._headerContainer {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
		}

		${PREFIX} ._rightIcon {
			position: relative;			
			padding-left: 5px;
			padding-right: 5px;
		}

		${PREFIX} ._leftIcon {
			position: relative;
			padding-left: 5px;
			padding-right: 5px;
		}

		.comp.compTable._design1 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design1HeaderPadding'),
			values,
		)}; }
		
		.comp.compTable._design3 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design3HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design5 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design5HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design7 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design7HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design9 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design9HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design2 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design2HeaderPadding'),
			values,
		)}; }
		
		.comp.compTable._design4 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design4HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design6 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design6HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design8 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design8HeaderPadding'),
			values,
		)}; }

		.comp.compTable._design10 ${PREFIX} ._headerContainer { padding: ${processStyleValueWithFunction(
			values.get('design10HeaderPadding'),
			values,
		)}; }

		` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableHeaderColumnCss">{css}</style>;
}
