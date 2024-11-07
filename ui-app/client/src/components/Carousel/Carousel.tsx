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

function Carousel(props: ComponentProps) {
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
						children={childrenDef[transitionFrom!].children}
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
						children={childrenDef[slideNum].children}
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
						children={childrenDef[slideNum!].children}
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
					<rect width="30" height="30" fill="#F9F9F9" />
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						className="_carouselmainframe"
						d="M19.4349 6H10.5674C10.0151 6 9.56738 6.44771 9.56738 7V23.3598C9.56738 23.9121 10.0151 24.3598 10.5674 24.3598H19.4349C19.9872 24.3598 20.4349 23.9121 20.4349 23.3598V7C20.4349 6.44772 19.9872 6 19.4349 6Z"
						fill="url(#paint0_linear_3214_9410)"
					/>
					<path
						className="_carouselfirstframe"
						d="M1.91763 9.66992H1C0.447715 9.66992 0 10.1176 0 10.6699V19.6934C0 20.2457 0.447716 20.6934 1 20.6934H1.91763C2.46991 20.6934 2.91763 20.2457 2.91763 19.6934V10.6699C2.91763 10.1176 2.46991 9.66992 1.91763 9.66992Z"
						fill="url(#paint4_linear_3214_9410)"
					/>
					<path
						className="_carouselsecondframe"
						d="M7.41403 8.17383H5.06689C4.51461 8.17383 4.06689 8.62154 4.06689 9.17383V21.1865C4.06689 21.7388 4.51461 22.1865 5.0669 22.1865H7.41403C7.96632 22.1865 8.41403 21.7388 8.41403 21.1865V9.17383C8.41403 8.62154 7.96632 8.17383 7.41403 8.17383Z"
						fill="url(#paint1_linear_3214_9410)"
					/>
					<path
						className="_carouselthirdframe"
						d="M24.9324 8.17383H22.585C22.0327 8.17383 21.585 8.62154 21.585 9.17383V21.1865C21.585 21.7388 22.0327 22.1865 22.585 22.1865H24.9324C25.4847 22.1865 25.9324 21.7388 25.9324 21.1865V9.17383C25.9324 8.62154 25.4847 8.17383 24.9324 8.17383Z"
						fill="url(#paint2_linear_3214_9410)"
					/>
					<path
						className="_carouselfourthframe"
						d="M29.0003 9.66992H28.083C27.5307 9.66992 27.083 10.1176 27.083 10.6699V19.6934C27.083 20.2457 27.5307 20.6934 28.083 20.6934H29.0003C29.5526 20.6934 30.0003 20.2457 30.0003 19.6934V10.6699C30.0003 10.1176 29.5526 9.66992 29.0003 9.66992Z"
						fill="url(#paint3_linear_3214_9410)"
					/>

					<defs>
						<linearGradient
							id="paint0_linear_3214_9410"
							x1="15.0011"
							y1="6"
							x2="15.0011"
							y2="24.3598"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#E8CCBA" />
							<stop offset="1" stopColor="#EF7E34" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9410"
							x1="6.24046"
							y1="8.17383"
							x2="6.24046"
							y2="22.1865"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9410"
							x1="23.7587"
							y1="8.17383"
							x2="23.7587"
							y2="22.1865"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9410"
							x1="28.5417"
							y1="9.66992"
							x2="28.5417"
							y2="20.6934"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3214_9410"
							x1="1.45881"
							y1="9.66992"
							x2="1.45881"
							y2="20.6934"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
					</defs>
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
