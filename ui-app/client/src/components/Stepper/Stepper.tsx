import React, { Fragment, useCallback, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
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
	console.log(countingType, titles, icons);
	console.log(showCheckOnComplete, textPosition, moveToAnyFutureStep, moveToAnyPreviousStep);

	React.useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					setValue(value ?? 0);
				},
				pageExtractor,
				bindingPathPath,
			),
		[bindingPath],
	);
	const goToStep = (stepNumber: number) => {
		if (stepNumber < value && moveToAnyPreviousStep)
			setData(bindingPathPath, stepNumber, context.pageName);
		else if (stepNumber > value && moveToAnyFutureStep)
			setData(bindingPathPath, stepNumber, context.pageName);
	};
	const checkIcon = 'fa-solid fa-check';
	const effectiveTitles = titles
		? titles
				.split(',')
				.map((e: string) => e.trim())
				.filter((e: string) => !!e)
		: [];

	const iconList = icons
		? icons
				.split(',')
				.map((e: string) => e.trim())
				.filter((e: string) => !!e)
		: [];
	return (
		<div className="comp compStepper">
			<HelperComponent definition={definition} />
			<ul className="stepper">
				{effectiveTitles.map((e: string, i: number) => (
					<li
						onClick={() => goToStep(i)}
						className={`stepperItem ${
							i < value && moveToAnyPreviousStep ? 'previousStep' : ''
						} ${i > value && moveToAnyFutureStep ? 'futureStep' : ''}`}
						key={i}
					>
						{icons ? (
							<i
								className={`${
									i < value && showCheckOnComplete ? checkIcon : iconList[i]
								} countingStep ${i <= value ? 'done' : ''}`}
							></i>
						) : (
							<Fragment>
								{i < value && showCheckOnComplete ? (
									<i
										className={`${checkIcon} countingStep ${
											i <= value ? 'done' : ''
										}`}
									></i>
								) : (
									<span className={`countingStep ${i <= value ? 'done' : ''}`}>
										{i + 1}
									</span>
								)}
							</Fragment>
						)}
						<span className="title">{e}</span>
						{i < effectiveTitles.length - 1 && <hr className="line" />}
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
