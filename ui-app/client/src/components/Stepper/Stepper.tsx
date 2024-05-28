import React, { Fragment, useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './StepperProperties';
import { Component } from '../../types/common';
import StepperStyle from './StepperStyle';
import useDefinition from '../util/useDefinition';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getRoman, getAlphaNumeral } from '../util/numberConverter';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './StepperStyleProperties';

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
			colorScheme,
			stepperDesign,
			showLines,
			onClick
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [value, setValue] = useState(0);
	const [hover, setHover] = useState(false);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setValue(value ?? 0);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPath]);

	const onClickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;

	const handleOnClick = onClickEvent ?  async() => 
		await runEvent(
			onClickEvent,
			onClick,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		)
	 : undefined;

	const goToStep = async (stepNumber: number) => {
		if (!bindingPathPath) return;
		setData(bindingPathPath, stepNumber, context.pageName);
		await handleOnClick?.();
	};
	const checkIcon = 'fa-solid fa-check';
	const effectiveTitles = titles ? titles : [];
	const iconList = icons ? icons : [];

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
				textStyle = '_textRight';
				break;
			case 'LEFT':
				textStyle = '_textLeft';
				break;
			case 'TOP':
				textStyle = '_textTop';
				break;
			case 'BOTTOM':
				textStyle = '';
				break;
			default:
		}
		return textStyle;
	};
	return (
		<div
			className={`comp compStepper ${stepperDesign} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			<ul
				style={resolvedStyles.list ?? {}}
				className={`${
					stepperDesign !== '_rectangle_arrow' && isStepperVertical
						? '_vertical'
						: '_horizontal'
				} ${getPositionStyle()} `}
			>
				<SubHelperComponent definition={props.definition} subComponentName="list" />
				{effectiveTitles.map((e: string, i: number) => (
					<li
						style={resolvedStyles.listItem ?? {}}
						onClick={
							(i < value && moveToAnyPreviousStep) ||
							(i > value && moveToAnyFutureStep)
								? () => 
									goToStep(i)
								: undefined
						}
						className={`_listItem ${showLines ? '_withLines' : ''} ${
							i < value ? '_done' : ''
						} ${i === value ? '_active' : ''} ${
							i > value && moveToAnyFutureStep ? '_nextItem' : ''
						} ${i < value && moveToAnyPreviousStep ? '_previousItem' : ''}`}
						key={i}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="listItem"
						/>
						<div className="_itemContainer" style={resolvedStyles.itemContainer ?? {}}>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="itemContainer"
							/>
							{stepperDesign !== '_rectangle_arrow' && (
								<Fragment>
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
											style={resolvedStyles.step ?? {}}
											className={`${
												i < value && showCheckOnComplete
													? checkIcon
													: iconList[i]
											} _step ${i < value ? '_done' : ''} ${
												i === value ? '_active' : ''
											}`}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="step"
											/>
										</i>
									) : (
										<>
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
													style={resolvedStyles.step ?? {}}
													className={`${checkIcon} _step ${
														i < value ? '_done' : ''
													} ${i === value ? '_active' : ''}`}
												>
													<SubHelperComponent
														definition={props.definition}
														subComponentName="step"
													/>
												</i>
											) : (
												<span
													style={resolvedStyles.step ?? {}}
													className={`_step ${i < value ? '_done' : ''} ${
														i === value ? '_active' : ''
													}`}
												>
													<SubHelperComponent
														definition={props.definition}
														subComponentName="step"
													/>
													{getCount(i + 1)}
												</span>
											)}
										</>
									)}
								</Fragment>
							)}
							{stepperDesign !== '_pills' && (
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
									style={resolvedStyles.title ?? {}}
									className={`_title ${i < value ? '_done' : ''} ${
										i === value ? '_active' : ''
									}`}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="title"
									/>
									{getTranslations(e, translations)}
								</span>
							)}
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
	styleProperties: stylePropertiesDefinition,
	styleComponent: StepperStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Stepper Count' },
	},
	defaultTemplate: {
		key: '',
		type: 'Stepper',
		name: 'Stepper',
		properties: {
			titles: {
				Rmum33beKct0kVQkRrMM7: {
					key: 'Rmum33beKct0kVQkRrMM7',
					order: 1,
					property: { value: 'Step 1' },
				},
				'4CIx4eatNBBYeYau1jSgud': {
					key: '4CIx4eatNBBYeYau1jSgud',
					order: 2,
					property: { value: 'Step 2' },
				},
				Rmum33beKct0kVQkRrMM9: {
					key: 'Rmum33beKct0kVQkRrMM9',
					order: 1,
					property: { value: 'Step 3' },
				},
			},
		},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-arrow-down-1-9',
		},
		{
			name: 'list',
			displayName: 'List',
			description: 'List',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'listItem',
			displayName: 'List Item',
			description: 'List Item',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'itemContainer',
			displayName: 'Item Container',
			description: 'Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'step',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'title',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa-solid fa-list',
		},
	],
};

export default component;
