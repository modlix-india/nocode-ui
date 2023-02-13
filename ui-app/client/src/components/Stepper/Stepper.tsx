import React, { Fragment, useState } from 'react';
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
import { getRoman, getAlphaNumeral } from '../util/numberConverter';

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
			isStepperVertical,
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

	const getCount = (num: number) => {
		let count;
		switch (countingType) {
			case 'NUMBER':
				count = num;
				break;
			case 'ROMAN':
				count = getRoman(num, false);
				break;
			case 'UPPER_ROMAN':
				count = getRoman(num, true);
				break;
			case 'ALPHA':
				count = getAlphaNumeral(num, false);
				break;
			case 'UPPER_ALPHA':
				count = getAlphaNumeral(num, true);
				break;
			default:
		}
		return count;
	};
	return (
		<div className="comp compStepper">
			<HelperComponent definition={definition} />
			<ul className={`stepper ${isStepperVertical ? 'vertical' : 'horizontal'}`}>
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
										{getCount(i + 1)}
									</span>
								)}
							</Fragment>
						)}
						<span className="title">{e}</span>
						{i < effectiveTitles.length - 1 && <div className="line" />}
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
