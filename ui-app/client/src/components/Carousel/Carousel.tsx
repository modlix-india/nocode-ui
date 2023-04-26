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
						.sort(
							(a: any, b: any) =>
								(pageDefinition?.componentDefinition[a[0]]?.displayOrder ?? 0) -
								(pageDefinition?.componentDefinition[b[0]]?.displayOrder ?? 0),
						)
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

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

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
				<SubHelperComponent
					definition={props.definition}
					subComponentName="arrowButtonsContainer"
				>
					<div
						className={` ${
							showNavigationControlsOnHover
								? `${hover ? `show  arrowButtons${arrowButtons}` : `hide`}`
								: `arrowButtons${arrowButtons}`
						}`}
						style={resolvedStyles.arrowButtonsContainer ?? {}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="arrowButtons"
						>
							<i
								className={` fa-solid fa-chevron-left button ${
									arrowButtons === 'Middle' ? 'leftArrowButton' : ''
								}`}
								style={resolvedStyles.arrowButtons ?? {}}
								onClick={() => {
									if (!isNullValue(transitionFrom)) return;
									setTransitionFrom(slideNum);
									setSlideNum(
										slideNum == 0 ? childrenDef.length - 1 : slideNum - 1,
									);
									setTimeout(
										() => setTransitionFrom(undefined),
										animationDuration + 120,
									);
								}}
							></i>
							<i
								className={` fa-solid fa-chevron-right button ${
									arrowButtons === 'Middle' ? 'rightArrowButton' : ''
								}`}
								style={resolvedStyles.arrowButtons ?? {}}
								onClick={() => {
									if (!isNullValue(transitionFrom)) return;
									setTransitionFrom(slideNum);
									setSlideNum(
										slideNum + 1 >= childrenDef.length ? 0 : slideNum + 1,
									);
									setTimeout(
										() => setTransitionFrom(undefined),
										animationDuration + 120,
									);
								}}
							></i>
						</SubHelperComponent>
					</div>
				</SubHelperComponent>
			)}
			<div
				className={`innerDivSlideNav ${`slideNavDiv${
					slideNavButtonPosition === 'OutsideTop' ? 'OutsideTop' : 'innerDivSlideNav'
				}`}`}
			>
				<div className="innerDiv">{showChildren}</div>

				<SubHelperComponent
					definition={props.definition}
					subComponentName="slideButtonsContainer"
				>
					<div
						className={`slideNavDiv${slideNavButtonPosition} ${
							slideNavButtonPosition === 'OutsideTop' ? 'slideNavDiv' : ''
						} ${showNavigationControlsOnHover ? (hover ? 'showFlex' : 'hide') : ''}`}
						style={resolvedStyles.slideButtonsContainer ?? {}}
					>
						{showDotsButtons &&
							(childrenDef ?? []).map((e: any, key: any) => (
								<SubHelperComponent
									definition={props.definition}
									subComponentName="dotButtons"
									key={key}
								>
									<button
										key={key}
										className={` slideNav  ${
											dotsButtonType !== 'none' &&
											hasNumbersInSlideNav === false
												? `fa-${dotsButtonIconType} fa-${dotsButtonType}`
												: ` `
										}  ${
											hasNumbersInSlideNav
												? `${dotsButtonType}WithNumbers`
												: ''
										} `}
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
										{hasNumbersInSlideNav ? key + 1 : ''}
									</button>
								</SubHelperComponent>
							))}
					</div>
				</SubHelperComponent>
			</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-tv',
	name: 'Carousel',
	displayName: 'Carousel',
	description: 'Carousel component',
	component: Carousel,
	styleComponent: CarouselStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	styleProperties: stylePropertiesDefinition,
};

export default component;
