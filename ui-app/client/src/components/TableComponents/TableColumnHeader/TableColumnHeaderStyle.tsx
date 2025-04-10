import { useEffect, useState } from 'react';
import { usedComponents } from '../../../App/usedComponents';
import { StylePropertyDefinition, StyleResolution } from '../../../types/common';
import {
	processStyleDefinition,
	processStyleValueWithFunction,
} from '../../../util/styleProcessor';
import { lazyStylePropertyLoadFunction } from '../../util/lazyStylePropertyUtil';
import { styleProperties, styleDefaults } from './tableColumnHeaderStyleProperties';

const PREFIX = '.comp.compTableHeaderColumn';
const NAME = 'TableColumnHeader';
export default function TableColumnStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME])
		styleProperties.filter((e: any) => !!e.dv)?.map(
			({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue),
		);
	}

	useEffect(() => {
		const fn = lazyStylePropertyLoadFunction(NAME, (props) => { styleProperties.splice(0, 0, ...props); setReRender(Date.now()) }, styleDefaults);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const css =
		`${PREFIX} { vertical-align: middle; text-align:center}

		${PREFIX} ._headerContainer {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			position: relative;
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

		${PREFIX} ._titleContainer {
			display: none;
		}

		${PREFIX} ._headerContainer ._leftIcon:hover ._titleContainer,
		${PREFIX} ._headerContainer ._rightIcon:hover ._titleContainer {
			all: initial;
			position: absolute;
			bottom: 30px;
			display: block;
			white-space: pre;
			z-index: 1;
			transform: translateX(-50%);
		}
		
		${PREFIX} ._headerContainer ._leftIcon:hover ._titleContainer ._titleTriangle,
		${PREFIX} ._headerContainer ._rightIcon:hover ._titleContainer ._titleTriangle {
			content: '';
			position: absolute;
			left: 50%;
			bottom: -6px;
			display: block;
			width: 15px;
			height: 15px;
			clip-path: polygon(100% 100%, 0% 100%, 100% 0%);
			transform: rotate(45deg);
		}

		${PREFIX}._bottom ._headerContainer ._leftIcon:hover ._titleContainer,
		${PREFIX}._bottom ._headerContainer ._rightIcon:hover ._titleContainer {
			bottom: auto;
			top: 20px;
		}

		${PREFIX}:first-child ._headerContainer ._leftIcon:hover ._titleContainer {
			transform: translateX(-10%);
		}

		${PREFIX}:first-child ._headerContainer ._leftIcon:hover ._titleContainer ._titleTriangle {
			left: 10%;
		}

		${PREFIX}:last-child ._headerContainer ._rightIcon:hover ._titleContainer {
			transform: translateX(-100%);
    		margin-left: 90%;
		}

		${PREFIX}:last-child ._headerContainer ._rightIcon:hover ._titleContainer ._titleTriangle {
			left: 100%;
			margin-left: -10%;
		}

		${PREFIX}._bottom ._headerContainer ._leftIcon:hover ._titleContainer ._titleTriangle,
		${PREFIX}._bottom ._headerContainer ._rightIcon:hover ._titleContainer ._titleTriangle {
			top: -6px;
			transform: rotate(225deg);
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
