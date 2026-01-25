import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './StepperProperties';
import useDefinition from '../util/useDefinition';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getRoman, getAlphaNumeral } from '../util/numberConverter';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';

const COUNT_FUNCTIONS: Record<string, (num: number) => string> = {
	NUMBER: (num: number) => num.toString(),
	ROMAN: (num: number) => getRoman(num, false),
	ROMAN_UPPERCASE: (num: number) => getRoman(num, true),
	ALPHA: (num: number) => getAlphaNumeral(num, false),
	ALPHA_UPPERCASE: (num: number) => getAlphaNumeral(num, true),
	NONE: () => '',
};

export default function Stepper(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
			pageExtractor.getPageName(),
			(_, value) => {
				setValue(value ?? 0);
			},
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
