import React, { useEffect, useState } from 'react';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { styleDefaults } from './tableStyleProperties';
import { usedComponents } from '../../../App/usedComponents';
import { lazyCSSURL, lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compTable';
const NAME = 'Table';
export default function TableStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);

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
		`${PREFIX} ._tablePagination ._seperator {
		color: ${processStyleValueWithFunction(values.get('paginationSeperatorColor'), values)};
	}` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{styleProperties.length ? (
				<link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} />
			) : undefined}
			<style id="TableCss">{css}</style>
		</>
	);
}
