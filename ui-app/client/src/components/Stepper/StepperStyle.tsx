import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
