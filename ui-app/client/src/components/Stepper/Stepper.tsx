import React, { useCallback, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './StepperProperties';
import { Component } from '../../types/common';
import StepperStyle from './StepperStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Stepper(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			countingType,
			titles,
			icons,
			showCheckOnComplete,
			textPosition,
			moveToAnyPreviousStep,
			moveToAnyFutureStep,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const [value, setValue] = React.useState(0);
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	console.log(countingType, titles, bindingPathPath);
	React.useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					setValue(value);
				},
				pageExtractor,
				bindingPathPath,
			),
		[bindingPath],
	);
	const effectiveTitles = titles
		.split(',')
		.map((e: string) => e.trim())
		.filter((e: string) => !!e);
	return (
		<div className="comp compStepper">
			<HelperComponent definition={definition} />
			<ul>
				{effectiveTitles.map((e: string, i: number) => (
					<li>
						<span>{i + 1}</span>
						{e}
					</li>
				))}
			</ul>
		</div>
	);
}

const component: Component = {
	name: 'Stepper',
	displayName: 'Stepper',
	description: 'Stepper component',
	component: Stepper,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: StepperStyle,
};

export default component;
