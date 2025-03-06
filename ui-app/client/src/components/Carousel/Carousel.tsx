import React, { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import CarouselStyle from './CarouselStyle';
import Children from '../Children';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './carouselStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Carousel(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition, pageDefinition } = props;
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			showDotsButtons,
			showArrowButtons,
			slideSpeed,
			autoPlay,
			easing,
			animationDuration,
			animationType,
			dotsButtonType,
			dotsButtonIconType,
			hasNumbersInSlideNav,
			slideNavButtonPosition,
			arrowButtons,
			showNavigationControlsOnHover,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const ref = useRef<HTMLDivElement>(null);
	const [childrenDef, setChildrenDef] = useState<any>();
	const [transitionFrom, setTransitionFrom] = useState<number | undefined>(undefined);
	const [slideNum, setSlideNum] = useState<number>(0);
	const [firstTime, setFirstTime] = useState(true);
	const [hover, setHover] = useState(false);

	useEffect(() => {
		setChildrenDef(
			props.definition.children
				? Object.entries(props.definition.children)
						.filter((e: any) => !!e[1])
						.sort((a: any, b: any) => {
							const v =
								(pageDefinition?.componentDefinition[a[0]]?.displayOrder ?? 0) -
								(pageDefinition?.componentDefinition[b[0]]?.displayOrder ?? 0);
							return v === 0
								? (
										pageDefinition?.componentDefinition[a[0]]?.key ?? ''
									).localeCompare(
										pageDefinition?.componentDefinition[b[0]]?.key ?? '',
									)
								: v;
						})
						.map(e => ({ key: e[0], children: { [e[0]]: e[1] } }))
				: [],
		);
	}, [props.definition.children]);

	useEffect(() => {
		if (!autoPlay) return;
		if (!childrenDef || childrenDef?.length <= 1) return;
		const handle = setTimeout(
			() => {
				setTransitionFrom(slideNum);
				setSlideNum((slideNum + 1) % childrenDef.length);
				setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
				if (firstTime) setFirstTime(false);
			},
			firstTime ? slideSpeed : slideSpeed + animationDuration + 220,
		);
		return () => clearTimeout(handle);
	}, [childrenDef, slideNum, setSlideNum, slideSpeed, firstTime, setFirstTime]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const currentSlide = useRef<HTMLDivElement>(null);
	const previousSlide = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!currentSlide.current || isNullValue(transitionFrom)) return;
		setTimeout(() => {
			if (!currentSlide.current || isNullValue(transitionFrom)) return;
			currentSlide.current!.className = `_eachSlide _current _${animationType} _${animationType}Start ${
				slideNum - transitionFrom! + 1 == childrenDef.length ||
				(slideNum - transitionFrom! < 0 &&
					slideNum - transitionFrom! - 1 != -childrenDef.length)
					? '_reverse'
					: ''
			}`;

			if (
				animationType == 'fadeoutin' ||
				animationType == 'crossover' ||
				animationType == 'slide'
			) {
				previousSlide.current!.className = `_eachSlide _previous _${animationType} _${animationType}Start ${
					slideNum - transitionFrom! + 1 == childrenDef.length ||
					(slideNum - transitionFrom! < 0 &&
						slideNum - transitionFrom! - 1 != -childrenDef.length)
						? '_reverse'
						: ''
				}`;
			}
		}, 100);
	}, [currentSlide.current, previousSlide.current, transitionFrom, animationType]);

	let showChildren: Array<ReactNode> = [];
	const duration = animationDuration / 1000;
	const style: CSSProperties = {};
	const prevStyle: CSSProperties = {};
	if (animationType == 'slideover') {
		style.transition = `left ${duration}s ${easing}, right ${duration}s ${easing}`;
	} else if (animationType == 'fadeover') {
		style.transition = `opacity ${duration}s ${easing}`;
	} else if (animationType == 'fadeoutin') {
		style.transition = `opacity ${duration / 2}s ${easing} ${duration / 2}s`;
		style.transitionDelay = '' + duration / 2;
		prevStyle.transition = `opacity ${duration / 2}s ${easing}`;
	} else if (animationType == 'crossover') {
		style.transition = `opacity ${duration}s ${easing}`;
		prevStyle.transition = `opacity ${duration}s ${easing}`;
	} else if (animationType == 'slide') {
		style.transition = `left ${duration}s ${easing}, right ${duration}s ${easing}`;
		prevStyle.transition = `left ${duration}s ${easing}, right ${duration}s ${easing}`;
	}
	if (childrenDef?.length) {
		if (!isNullValue(transitionFrom)) {
			showChildren = [
				<div
					className={`_eachSlide _previous _${animationType} ${
						slideNum - transitionFrom! + 1 == childrenDef.length ||
						(slideNum - transitionFrom! < 0 &&
							slideNum - transitionFrom! - 1 != -childrenDef.length)
							? '_reverse'
							: ''
					}`}
					key={childrenDef[transitionFrom!].key}
					style={prevStyle}
					ref={previousSlide}
				>
					<Children
						renderableChildren={childrenDef[transitionFrom!].children}
						context={props.context}
						pageDefinition={props.pageDefinition}
						locationHistory={locationHistory}
					/>
				</div>,
				<div
					className={`_eachSlide _current _${animationType} ${
						slideNum - transitionFrom! + 1 == childrenDef.length ||
						(slideNum - transitionFrom! < 0 &&
							slideNum - transitionFrom! - 1 != -childrenDef.length)
							? '_reverse'
							: ''
					}`}
					ref={currentSlide}
					key={childrenDef[slideNum].key}
					style={style}
				>
					<Children
						renderableChildren={childrenDef[slideNum].children}
						context={props.context}
						pageDefinition={props.pageDefinition}
						locationHistory={locationHistory}
					/>
				</div>,
			];
		} else {
			showChildren = [
				<div className="_eachSlide _previous" key={childrenDef[slideNum!].key}>
					<Children
						renderableChildren={childrenDef[slideNum!].children}
						context={props.context}
						pageDefinition={props.pageDefinition}
						locationHistory={locationHistory}
					/>
				</div>,
			];
		}
	}

	const handleMouse = (e: any) => {
		if (showNavigationControlsOnHover) setHover(true);
	};
	const handleMouseLeave = (e: any) => {
		if (showNavigationControlsOnHover) setHover(false);
	};

	return (
		<div
			className={`comp compCarousel ${
				arrowButtons !== 'OutsideBottomRight' && arrowButtons !== 'OutsideBottomLeft'
					? 'container'
					: 'containerReverse'
			}`}
			style={resolvedStyles.comp ?? {}}
			onMouseEnter={handleMouse}
			onMouseLeave={handleMouseLeave}
		>
			<HelperComponent context={props.context} definition={definition} />
			{showArrowButtons && (
				<div
					className={`arrowButtonsContainer ${
						showNavigationControlsOnHover
							? `${hover ? `show  arrowButtons${arrowButtons}` : `hide`}`
							: `arrowButtons${arrowButtons}`
					}`}
					style={resolvedStyles.arrowButtonsContainer ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="arrowButtonsContainer"
					></SubHelperComponent>

					<i
						className={` fa-solid fa-chevron-left button ${
							arrowButtons === 'Middle' ? 'leftArrowButton' : ''
						}`}
						style={resolvedStyles.arrowButtons ?? {}}
						onClick={() => {
							if (!isNullValue(transitionFrom)) return;
							setTransitionFrom(slideNum);
							setSlideNum(slideNum == 0 ? childrenDef.length - 1 : slideNum - 1);
							setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
						}}
					>
						{' '}
						<SubHelperComponent
							definition={props.definition}
							subComponentName="arrowButtons"
						></SubHelperComponent>
					</i>
					<i
						className={` fa-solid fa-chevron-right button ${
							arrowButtons === 'Middle' ? 'rightArrowButton' : ''
						}`}
						style={resolvedStyles.arrowButtons ?? {}}
						onClick={() => {
							if (!isNullValue(transitionFrom)) return;
							setTransitionFrom(slideNum);
							setSlideNum(slideNum + 1 >= childrenDef.length ? 0 : slideNum + 1);
							setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
						}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="arrowButtons"
						></SubHelperComponent>
					</i>
				</div>
			)}
			<div
				className={`innerDivSlideNav ${`slideNavDiv${
					slideNavButtonPosition === 'OutsideTop' ? 'OutsideTop' : 'innerDivSlideNav'
				}`}`}
			>
				<div className="innerDiv">{showChildren}</div>

				<div
					className={`slideButtonsContainer slideNavDiv${slideNavButtonPosition} ${
						slideNavButtonPosition === 'OutsideTop' ? 'slideNavDiv' : ''
					} ${showNavigationControlsOnHover ? (hover ? 'showFlex' : 'hide') : ''}`}
					style={resolvedStyles.slideButtonsContainer ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="slideButtonsContainer"
					></SubHelperComponent>
					{showDotsButtons &&
						(childrenDef ?? []).map((e: any, key: any) => (
							<button
								key={key}
								className={` slideNav  ${
									dotsButtonType !== 'none' && hasNumbersInSlideNav === false
										? `fa-${dotsButtonIconType} fa-${dotsButtonType}`
										: ` `
								}  ${hasNumbersInSlideNav ? `${dotsButtonType}WithNumbers` : ''} `}
								style={resolvedStyles.dotButtons ?? {}}
								onClick={() => {
									if (!isNullValue(transitionFrom)) return;
									setTransitionFrom(slideNum);
									setSlideNum(key);
									setTimeout(
										() => setTransitionFrom(undefined),
										animationDuration + 20,
									);
								}}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="dotButtons"
									key={key}
								></SubHelperComponent>
								{hasNumbersInSlideNav ? key + 1 : ''}
							</button>
						))}
				</div>
			</div>
		</div>
	);
}

const component: Component = {
	order: 9,
	name: 'Carousel',
	displayName: 'Carousel',
	description: 'Carousel component',
	component: Carousel,
	styleProperties: stylePropertiesDefinition,
	styleComponent: CarouselStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.41416 8.17383H5.06702C4.51473 8.17383 4.06702 8.62154 4.06702 9.17383V21.1865C4.06702 21.7388 4.51473 22.1865 5.06702 22.1865H7.41416C7.96644 22.1865 8.41416 21.7388 8.41416 21.1865V9.17383C8.41416 8.62154 7.96644 8.17383 7.41416 8.17383Z"
						fill="#EF7E3440"
						className="_carouselsecondframe"
					/>
					<path
						d="M24.9327 8.17383H22.5852C22.0329 8.17383 21.5852 8.62154 21.5852 9.17383V21.1865C21.5852 21.7388 22.0329 22.1865 22.5852 22.1865H24.9327C25.485 22.1865 25.9327 21.7388 25.9327 21.1865V9.17383C25.9327 8.62154 25.485 8.17383 24.9327 8.17383Z"
						fill="#EF7E3440"
						className="_carouselthirdframe"
					/>
					<path
						d="M29.0001 9.66992H28.0828C27.5305 9.66992 27.0828 10.1176 27.0828 10.6699V19.6934C27.0828 20.2457 27.5305 20.6934 28.0828 20.6934H29C29.5523 20.6934 30.0001 20.2457 30.0001 19.6934V10.6699C30.0001 10.1176 29.5523 9.66992 29.0001 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfourthframe"
					/>
					<path
						d="M1.91763 9.66992H1C0.447715 9.66992 0 10.1176 0 10.6699V19.6934C0 20.2457 0.447716 20.6934 1 20.6934H1.91763C2.46991 20.6934 2.91763 20.2457 2.91763 19.6934V10.6699C2.91763 10.1176 2.46991 9.66992 1.91763 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfirstframe"
					/>
					<path
						d="M19.4348 6H10.5673C10.015 6 9.56726 6.44771 9.56726 7V23.3598C9.56726 23.9121 10.015 24.3598 10.5673 24.3598H19.4348C19.9871 24.3598 20.4348 23.9121 20.4348 23.3598V7C20.4348 6.44772 19.9871 6 19.4348 6Z"
						fill="#EF7E34"
						className="_carouselmainframe"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'arrowButtonsContainer',
			displayName: 'Arrow Buttons Container',
			description: 'Arrow Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideButtonsContainer',
			displayName: 'Slide Buttons Container',
			description: 'Slide Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'dotButtons',
			displayName: 'Dot Buttons',
			description: 'Dot Buttons',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
