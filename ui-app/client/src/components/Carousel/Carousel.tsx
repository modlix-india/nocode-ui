import React, { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import CarouselStyle from './CarouselStyle';
import Children from '../Children';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../SubHelperComponent';
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
			<HelperComponent definition={definition} />
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M15.0934 5.34961H9.24609C8.69381 5.34961 8.24609 5.79732 8.24609 6.34961V17.6071C8.24609 18.1594 8.69381 18.6071 9.24609 18.6071H15.0934C15.6457 18.6071 16.0934 18.1594 16.0934 17.6071V6.34961C16.0934 5.79732 15.6457 5.34961 15.0934 5.34961Z"
						fill="currentColor"
					/>
					<path
						d="M6.41442 6.91943H5.27539C4.72311 6.91943 4.27539 7.36715 4.27539 7.91943V16.0379C4.27539 16.5902 4.72311 17.0379 5.27539 17.0379H6.41442C6.9667 17.0379 7.41442 16.5902 7.41442 16.0379V7.91943C7.41442 7.36715 6.9667 6.91943 6.41442 6.91943Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M19.0631 6.91943H17.9238C17.3715 6.91943 16.9238 7.36715 16.9238 7.91943V16.0379C16.9238 16.5902 17.3715 17.0379 17.9238 17.0379H19.0631C19.6154 17.0379 20.0631 16.5902 20.0631 16.0379V7.91943C20.0631 7.36715 19.6154 6.91943 19.0631 6.91943Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M22.0011 7.99902H21.8945C21.3422 7.99902 20.8945 8.44674 20.8945 8.99902V14.959C20.8945 15.5112 21.3422 15.959 21.8945 15.959H22.0011C22.5534 15.959 23.0011 15.5112 23.0011 14.959V8.99902C23.0011 8.44674 22.5534 7.99902 22.0011 7.99902Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M2.44468 7.99902H2.33789C1.78561 7.99902 1.33789 8.44674 1.33789 8.99902V14.959C1.33789 15.5112 1.78561 15.959 2.33789 15.959H2.44468C2.99697 15.959 3.44468 15.5112 3.44468 14.959V8.99902C3.44468 8.44674 2.99697 7.99902 2.44468 7.99902Z"
						fill="currentColor"
						fillOpacity="0.2"
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
