import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .stepper {
			display: flex;
			list-style-type: none;
			overflow: auto;
			margin: 0;
		}

		${PREFIX} .stepper.horizontal {
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		${PREFIX} .stepper.vertical {
			width: fit-content;
			height: 100%;
			flex-direction: column;
			justify-content: space-between;
			align-items: start;
		}

		${PREFIX} .stepperItem {
			flex-grow: 1;
			display:flex;
		}

		${PREFIX} .stepperItem:last-child {
			flex-grow: 0;
		}

		${PREFIX} .stepperItem.futureStep {
			cursor: pointer;
		}

		${PREFIX} .stepperItem.previousStep {			
			cursor: pointer;
		}

		${PREFIX} .stepper.horizontal .stepperItem {
			flex-direction: row;
			justify-content: start;
			align-items: center;
		}

		${PREFIX} .stepper.vertical .stepperItem {
			width: 100%;
			flex-direction: column;
			justify-content: start;
			align-items: center;
		}

		${PREFIX} .countingStep {
			width: ${theme.get(StyleResolution.ALL)?.get('circleSize') ?? styleDefaults.get('circleSize')};
			height: ${theme.get(StyleResolution.ALL)?.get('circleSize') ?? styleDefaults.get('circleSize')};
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 100%;
		}

		${PREFIX} .line {
			flex-grow: 1;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
