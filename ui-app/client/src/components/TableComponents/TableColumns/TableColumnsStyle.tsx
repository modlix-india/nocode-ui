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

	` +
		// Tree mode styles
		`
		${PREFIX} ._treeColumnCell {
			display: flex;
			align-items: center;
			white-space: nowrap;
			padding: 0 4px;
			height: 100%;
		}

		${PREFIX} ._treeColumn {
			padding: 0 !important;
			vertical-align: middle;
		}

		${PREFIX} ._treeHeaderColumn {
			width: 1px;
			padding: 0 !important;
		}

		${PREFIX} ._treeIndent {
			display: inline-block;
			position: relative;
			flex-shrink: 0;
			height: 100%;
			min-height: 28px;
		}

		${PREFIX} ._treeIndent._hasLine::before {
			content: '';
			position: absolute;
			left: 50%;
			top: 0;
			bottom: 0;
			border-left: 1px dotted #ccc;
		}

		${PREFIX} ._treeConnector {
			display: inline-block;
			position: relative;
			flex-shrink: 0;
			height: 100%;
			min-height: 28px;
		}

		${PREFIX} ._treeConnector::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			width: 50%;
			border-top: 1px dotted #ccc;
		}

		${PREFIX} ._treeConnector._notLast::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			border-left: 1px dotted #ccc;
		}

		${PREFIX} ._treeConnector._last::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			height: 50%;
			border-left: 1px dotted #ccc;
		}

		${PREFIX} button._treeToggle {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 18px;
			height: 18px;
			cursor: pointer;
			flex-shrink: 0;
			user-select: none;
			background: none;
			border: 1px solid #ddd;
			border-radius: 3px;
			padding: 0;
			color: inherit;
			margin: 0 2px;
		}

		${PREFIX} button._treeToggle:hover {
			background: rgba(0, 0, 0, 0.05);
		}

		${PREFIX} ._treeLeafSpacer {
			display: inline-block;
			width: 18px;
			min-width: 18px;
			flex-shrink: 0;
			margin: 0 2px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TableColumnsCss">{css}</style>;
}
