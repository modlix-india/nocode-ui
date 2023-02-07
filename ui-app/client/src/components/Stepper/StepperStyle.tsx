import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} .stepper {
			display: flex;
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			list-style-type: none;
			overflow: auto;
			background-color: #FFF;
			padding: 12px 20px;
			gap: 0 8px;
		}
		${PREFIX} .stepperItem {
			flex-grow: 1;
			display:flex;
			justify-content: start;
			align-items: center;
		}
		${PREFIX} .stepperItem.previousStep {			
			cursor: pointer;
		}
		${PREFIX} .stepperItem.futureStep {
			cursor: pointer;
		}
		${PREFIX} .stepperItem:last-child {
			flex-grow: 0;
		}
		${PREFIX} .countingStep {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 30px;
			height: 30px;
			border-radius: 100%;
			color: #FFF;
			background-color: #C7C8D6;
		}
		${PREFIX} .countingStep.done {
			background-color: #2680EB;
		}
		${PREFIX} .title {
			margin-left: 8px;
		}
		${PREFIX} .line {
			flex-grow: 1;
			min-width: 30px;
			border: 1px solid #dedfe7;
			margin-left: 16px;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
