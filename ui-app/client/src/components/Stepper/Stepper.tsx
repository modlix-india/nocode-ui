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
	const [hover, setHover] = React.useState(false);
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	const resolvedStyles = processComponentStylePseudoClasses({ hover }, stylePropertiesDefinition);

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
		let count =
			countingType === 'NUMBER'
				? num
				: countingType.startsWith('ROMAN')
				? countingType === 'ROMAN'
					? getRoman(num, false)
					: getRoman(num, true)
				: countingType === 'ALPHA'
				? getAlphaNumeral(num, false)
				: getAlphaNumeral(num, true);

		return count;
	};

	const getPositionStyle = () => {
		let textStyle;
		switch (textPosition) {
			case 'RIGHT':
				textStyle = 'textRight';
				break;
			case 'LEFT':
				textStyle = 'textLeft';
				break;
			case 'TOP':
				textStyle = 'textTop';
				break;
			case 'BOTTOM':
				textStyle = '';
				break;
			default:
		}
		return textStyle;
	};
	return (
		<div className="comp compStepper" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<ul
				style={resolvedStyles.list ?? {}}
				className={`${
					isStepperVertical ? 'vertical' : 'horizontal'
				} ${getPositionStyle()} `}
			>
				{effectiveTitles.map((e: string, i: number) => (
					<li
						style={resolvedStyles.listItem ?? {}}
						onClick={
							(i < value && moveToAnyPreviousStep) ||
							(i > value && moveToAnyFutureStep)
								? () => goToStep(i)
								: undefined
						}
						className={`itemlist ${
							i < value && moveToAnyPreviousStep ? 'previousStep' : ''
						} ${i > value && moveToAnyFutureStep ? 'futureStep' : ''}`}
						key={i}
					>
						<div className="itemContainer" style={resolvedStyles.itemContainer ?? {}}>
							{icons ? (
								<i
									onMouseEnter={
										stylePropertiesWithPseudoStates?.hover
											? () => setHover(true)
											: undefined
									}
									onMouseLeave={
										stylePropertiesWithPseudoStates?.hover
											? () => setHover(false)
											: undefined
									}
									style={resolvedStyles.icon ?? {}}
									className={`${
										i < value && showCheckOnComplete ? checkIcon : iconList[i]
									} countingStep ${i <= value ? 'done' : ''}`}
								></i>
							) : (
								<Fragment>
									{i < value && showCheckOnComplete ? (
										<i
											onMouseEnter={
												stylePropertiesWithPseudoStates?.hover
													? () => setHover(true)
													: undefined
											}
											onMouseLeave={
												stylePropertiesWithPseudoStates?.hover
													? () => setHover(false)
													: undefined
											}
											style={resolvedStyles.icon ?? {}}
											className={`${checkIcon} countingStep ${
												i <= value ? 'done' : ''
											}`}
										></i>
									) : (
										<span
											style={resolvedStyles.text ?? {}}
											className={`countingStep ${i <= value ? 'done' : ''}`}
										>
											{getCount(i + 1)}
										</span>
									)}
								</Fragment>
							)}
							<span
								onMouseEnter={
									stylePropertiesWithPseudoStates?.hover
										? () => setHover(true)
										: undefined
								}
								onMouseLeave={
									stylePropertiesWithPseudoStates?.hover
										? () => setHover(false)
										: undefined
								}
								style={resolvedStyles.text ?? {}}
								className="title"
							>
								{getTranslations(e, translations)}
							</span>
						</div>
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
