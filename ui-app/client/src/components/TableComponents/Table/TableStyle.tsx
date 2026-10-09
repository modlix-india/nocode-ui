import React, { useEffect, useState } from 'react';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './tableStyleProperties';
import { usedComponents } from '../../../App/usedComponents';
import {
	findPropertyDefinitions,
	lazyCSSURL,
	lazyStylePropertyLoadFunction,
} from '../../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './tableProperties';

const PREFIX = '.comp.compTable';
const NAME = 'Table';
export default function TableStyle({
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

	// Row selection (multiSelect) draws CommonCheckbox, whose shared CSS gives it no size and
	// no colour: those live in CheckBoxStyle, scoped to `.comp.compCheckbox`. Inside a table it
	// rendered as a 0x0 box with a 2px border (a dash), and as nothing once checked. Size it
	// here and paint it from the theme's own CheckBox variables, so it follows the theme.
	const checkboxValue = (name: string, fallback: string) =>
		processStyleValueWithFunction(values.get(name), values) || fallback;
	const css =
		`${PREFIX} ._tablePagination ._seperator {
		color: ${processStyleValueWithFunction(values.get('paginationSeperatorColor'), values)};
	}
	${PREFIX} span.commonCheckbox {
		width: 16px;
		height: 16px;
		box-sizing: border-box;
		border: 1.5px solid ${checkboxValue('checkBoxBorderColorCommonCheckboxDefaultPrimary', '#74746F')};
		border-radius: ${checkboxValue('checkBoxBorderRadiusCommonCheckboxDefaultPrimary', '4px')};
		background: ${checkboxValue('checkBoxBackgroundCommonCheckboxDefaultPrimary', '#FFFFFF')};
	}
	${PREFIX} span.commonCheckbox._checked {
		border: 1.5px solid ${checkboxValue('checkBoxBorderColorCheckedDefaultPrimary', '#191918')};
		background: ${checkboxValue('checkBoxBackgroundCheckedDefaultPrimary', '#191918')};
	}
	${PREFIX} span.commonCheckbox ._thumb {
		left: 0px;
		top: 0px;
		background: ${checkboxValue('checkBoxBackgroundThumbDefaultPrimary', '#FFFFFF')};
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{styleProperties.length ? (
				<link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} />
			) : undefined}
			<style id="TableCss">{css}</style>
		</>
	);
}
