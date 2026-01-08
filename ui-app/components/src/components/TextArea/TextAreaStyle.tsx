import { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { processStyleDefinition } from '../../util/styleProcessor';
import {
	findPropertyDefinitions,
	lazyStylePropertyLoadFunction,
} from '../util/lazyStylePropertyUtil';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from './textAreaStyleProperties';
import { propertiesDefinition } from './textAreaProperties';

const PREFIX = '.comp.compTextArea';
const NAME = 'TextArea';
export default function TextAreaStyle({
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
		const fn = lazyStylePropertyLoadFunction(
			NAME,
			(props, originalStyleProps) => {
				styleProperties.splice(0, 0, ...props);
				if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
				setReRender(Date.now());
			},
			styleDefaults,
			[designType, colorScheme],
		);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
		${PREFIX} {
			flex: 1;
			display: flex;
			align-items: center;
		}
	
		${PREFIX} textarea {
			flex: 1;
			height: 100%;
			border: none;
			font: inherit;
			line-height: inherit;
			outline: none;
			padding: 0;
			background: transparent;
			color: inherit;
			min-width: 20px;
			resize: none;
		}
	
		${PREFIX}._isActive ._label,
		${PREFIX} ._label._noFloat {
			transform: translateY(calc(-150% - 7px));
		}
	
		${PREFIX}._hasLeftIcon ._label {
			padding-left: 24px;
		}
	
		${PREFIX} ._label {
			position: absolute;
			user-select: none;
			pointer-events: none;
			transform: translateY(0%);
			transition: transform 0.2s ease-in-out, left 0.2s ease-in-out;
			top: 5px;
		}
	
		${PREFIX} ._rightIcon,
		${PREFIX} ._leftIcon {
			width: 24px;
		}
	
		${PREFIX} ._rightIcon {
			padding-right: 5px;
		}
	
		${PREFIX} ._label._float {
			bottom: 0px;
		}
	
		${PREFIX} ._clearText {
			cursor: pointer;
		}
	
		${PREFIX} ._supportText {
			position:absolute;
			z-index:1;
			left: 0;
			top: 100%;
			margin-top: 5px;
		}

		${PREFIX} ._controlButtons {
			display: none;
			margin-right: 5px;
		}
	
		${PREFIX}:hover ._controlButtons,
		${PREFIX}._editMode ._controlButtons {
			display: flex;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextAreaCss">{css}</style>;
}
