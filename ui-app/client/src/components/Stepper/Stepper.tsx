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
import { styleProperties, styleDefaults } from './StepperStyleProperties';
import { IconHelper } from '../util/IconHelper';

const COUNT_FUNCTIONS: Record<string, (num: number) => string> = {
	NUMBER: (num: number) => num.toString(),
	ROMAN: (num: number) => getRoman(num, false),
	ROMAN_UPPERCASE: (num: number) => getRoman(num, true),
	ALPHA: (num: number) => getAlphaNumeral(num, false),
	ALPHA_UPPERCASE: (num: number) => getAlphaNumeral(num, true),
	NONE: () => '',
};

function Stepper(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			countingType,
			titles,
			icons,
			successIcon,
			currentIcon,
			nextIcon,
			useNextIconAlways,
			useSuccessIconAlways,
			useActiveIconAlways,
			textPosition,
			moveToAnyPreviousStep,
			moveToAnyFutureStep,
			isStepperVertical,
			colorScheme,
			stepperDesign,
			showLines,
			onClick,
			images,
			successImage,
			currentImage,
			nextImage,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [value, setValue] = useState<number>(0);
	const [stepHover, setStepHover] = useState<number>(-1);
	const [hover, setHover] = useState<boolean>(false);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false },
		stylePropertiesWithPseudoStates,
	);

	const resolvedStylesWithHover = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);
	const sepStyle = resolvedStyles?.comp?.hideScrollBar;

	const styleComp = sepStyle ? (
		<style
			key={`${key}_style`}
		>{`._${key}_grid_css::-webkit-scrollbar { display: none }`}</style>
	) : undefined;
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setValue(value ?? 0);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const onClickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;

	const handleOnClick = onClickEvent
		? async () =>
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

	const effectiveTitles = titles ?? [];
	const iconList = icons ?? [];
	const imageIconsList = images ?? [];

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

	let steps: Array<JSX.Element> = [];
	const hasLines =
		stepperDesign === '_rectangle_arrow' ||
		stepperDesign === '_default' ||
		stepperDesign === '_big_circle';

	for (let i = 0; i < effectiveTitles.length; i++) {
		let text = undefined;
		const styleGroup = (stepHover === i ? resolvedStylesWithHover : resolvedStyles) ?? {};
		let styleKey = '';

		let iconClassName = undefined;
		let imageSrc = imageIconsList[i];

		if (iconList[i]) iconClassName = iconList[i];

		if (i === value) {
			if (useActiveIconAlways || (!iconClassName && !imageSrc)) {
				if (currentImage) imageSrc = currentImage;
				if (currentIcon) iconClassName = currentIcon;
			}
			styleKey = 'active';
		}

		if (i < value) {
			if (useSuccessIconAlways || (!iconClassName && !imageSrc)) {
				if (successImage) imageSrc = successImage;
				if (successIcon) iconClassName = successIcon;
			}
			styleKey = 'done';
		}

		if (i > value && (useNextIconAlways || (!iconClassName && !imageSrc))) {
			if (nextImage) imageSrc = nextImage;
			if (nextIcon) iconClassName = nextIcon;
		}

		let icon: JSX.Element | undefined;

		if (imageSrc) {
			icon = (
				<img
					src={imageSrc}
					style={styleGroup[styleKey + (styleKey ? 'Step' : 'step')] ?? {}}
					className={`_step ${i < value ? '_done' : ''} ${i === value ? '_active' : ''}`}
					alt={`step-${i}`}
				/>
			);
		} else if (iconClassName) {
			icon = (
				<i
					style={styleGroup[styleKey + (styleKey ? 'Step' : 'step')] ?? {}}
					className={`${iconClassName} _step ${i < value ? '_done' : ''} ${
						i === value ? '_active' : ''
					}`}
				>
					<SubHelperComponent definition={props.definition} subComponentName="step" />
				</i>
			);
		}
		if (!icon)
			icon = (
				<span
					style={styleGroup[styleKey + (styleKey ? 'Step' : 'step')] ?? {}}
					className={`_step ${i < value ? '_done' : ''} ${i === value ? '_active' : ''}`}
				>
					<SubHelperComponent definition={props.definition} subComponentName="step" />
					{COUNT_FUNCTIONS[countingType](i + 1)}
				</span>
			);

		if (stepperDesign !== '_pills') {
			text = (
				<span
					style={styleGroup[styleKey + (styleKey ? 'Title' : 'title')] ?? {}}
					className={`_title ${i < value ? '_done' : ''} ${i === value ? '_active' : ''}`}
				>
					<SubHelperComponent definition={props.definition} subComponentName="title" />
					{getTranslations(effectiveTitles[i], translations)}
				</span>
			);
		}

		let line = undefined;

		if (showLines && hasLines && i != effectiveTitles.length - 1) {
			let lineKey;
			if (i + 1 === value) lineKey = 'activeBeforeLine';
			else lineKey = styleKey + (styleKey ? 'Line' : 'line');

			line = (
				<div
					className={`_line ${i + 1 === value ? '_activeBeforeLine' : ''} ${i + 1 < value ? '_done' : ''} ${i === value ? '_active' : ''}`}
					style={styleGroup[lineKey] ?? {}}
				>
					<SubHelperComponent definition={props.definition} subComponentName="line" />
				</div>
			);
		}

		steps.push(
			<li
				style={styleGroup[styleKey + (styleKey ? 'ListItem' : 'listItem')] ?? {}}
				onMouseEnter={() => setStepHover(i)}
				onMouseLeave={() => setStepHover(-1)}
				onClick={
					(i < value && moveToAnyPreviousStep) || (i > value && moveToAnyFutureStep)
						? () => goToStep(i)
						: undefined
				}
				className={`_listItem ${showLines ? '_withLines' : ''} ${
					i < value ? '_done' : ''
				} ${i === value ? '_active' : ''} ${
					i > value && moveToAnyFutureStep ? '_nextItem' : ''
				} ${i < value && moveToAnyPreviousStep ? '_previousItem' : ''}`}
				key={i}
			>
				<SubHelperComponent definition={props.definition} subComponentName="listItem" />
				<div
					className="_itemContainer"
					style={
						styleGroup[styleKey + (styleKey ? 'ItemContainer' : 'itemContainer')] ?? {}
					}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="itemContainer"
					/>
					{icon}
					{text}
				</div>
				{line}
			</li>,
		);
	}
	return (
		<ul
			style={resolvedStyles.comp ?? {}}
			className={`comp compStepper ${stepperDesign} ${colorScheme} ${
				stepperDesign !== '_rectangle_arrow' && isStepperVertical
					? '_vertical'
					: '_horizontal'
			} ${sepStyle ? `_${key}_grid_css` : ''}
			${getPositionStyle()} `}
		>
			<HelperComponent context={props.context} definition={definition} />
			{styleComp}
			{steps}
		</ul>
	);
}

const component: Component = {
	order: 11,
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
	stylePseudoStates: ['hover'],
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
			icon: (
				<IconHelper viewBox="0 0 30 12">
					<path
						d="M18 6L10 6"
						stroke="black"
						strokeOpacity="0.1"
						strokeLinecap="square"
						strokeDasharray="1 1"
					/>
					<circle className="_greenStepperInitialIcon" cx="6" cy="6" r="6" fill="white" />
					<path
						d="M6 12C7.5913 12 9.11742 11.3679 10.2426 10.2426C11.3679 9.11742 12 7.5913 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 7.5913 0.632141 9.11742 1.75736 10.2426C2.88258 11.3679 4.4087 12 6 12ZM8.64844 4.89844L5.64844 7.89844C5.42813 8.11875 5.07188 8.11875 4.85391 7.89844L3.35391 6.39844C3.13359 6.17813 3.13359 5.82188 3.35391 5.60391C3.57422 5.38594 3.93047 5.38359 4.14844 5.60391L5.25 6.70547L7.85156 4.10156C8.07187 3.88125 8.42812 3.88125 8.64609 4.10156C8.86406 4.32187 8.86641 4.67812 8.64609 4.89609L8.64844 4.89844Z"
						fill="#1CBA79"
						className="_greenStepperIcon"
					/>
					<circle className="_greenFinalStepIcon" cx="24" cy="6" r="6" fill="#E0E0E7" />
				</IconHelper>
			),
		},
		{
			name: 'listItem',
			displayName: 'Step',
			description: 'Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneListItem',
			displayName: 'Done Step',
			description: 'Done Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeListItem',
			displayName: 'Active Step',
			description: 'Active Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'itemContainer',
			displayName: 'Item Container',
			description: 'Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneItemContainer',
			displayName: 'Done Item Container',
			description: 'Done Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeItemContainer',
			displayName: 'Active Item Container',
			description: 'Active Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'step',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneStep',
			displayName: 'Done Icon',
			description: 'Done Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeStep',
			displayName: 'Active Icon',
			description: 'Active Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'title',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneTitle',
			displayName: 'Done Text',
			description: 'Done Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeTitle',
			displayName: 'Active Text',
			description: 'Active Text',
			icon: 'fa-solid fa-list',
		},

		{
			name: 'line',
			displayName: 'Lines',
			description: 'Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneLine',
			displayName: 'Done Lines',
			description: 'Done Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeLine',
			displayName: 'Active Line',
			description: 'Active Line',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeBeforeLine',
			displayName: 'Active Before Line',
			description: 'Active Before Line',
			icon: 'fa-solid fa-list',
		},
	],
	stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
