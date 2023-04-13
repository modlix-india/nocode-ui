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

	return (
		<div
			className={`comp compCarousel ${`slideNavDiv${
				slideNavButtonPosition === 'OutsideTop' ? 'OutsideTop' : ''
			}`}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={definition} />
			<div className="innerDiv">{showChildren}</div>
			{showArrowButtons && (
				<div>
					<button
						className="rightArrowButton fa-solid fa-chevron-right button"
						onClick={() => {
							if (!isNullValue(transitionFrom)) return;
							setTransitionFrom(slideNum);
							setSlideNum(slideNum + 1 >= childrenDef.length ? 0 : slideNum + 1);
							setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
						}}
					></button>
					<button
						className="leftArrowButton fa-solid fa-chevron-left button"
						onClick={() => {
							if (!isNullValue(transitionFrom)) return;
							setTransitionFrom(slideNum);
							setSlideNum(slideNum == 0 ? childrenDef.length - 1 : slideNum - 1);
							setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
						}}
					></button>
				</div>
			)}
			<div
				className={` slideNavDiv${slideNavButtonPosition} ${
					slideNavButtonPosition === 'OutsideTop' ? 'slideNavDiv' : ''
				}`}
			>
				{showDotsButtons &&
					(childrenDef ?? []).map((e: any, key: any) => (
						<button
							key={key}
							className={`slideNav  ${
								dotsButtonType !== 'none' && hasNumbersInSlideNav === false
									? `fa-${dotsButtonIconType} fa-${dotsButtonType}`
									: ` `
							}  ${hasNumbersInSlideNav ? `${dotsButtonType}WithNumbers` : ''} `}
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
					))}
			</div>
		</div>
	);
}

const component: Component = {
	icon: '',
	name: 'Carousel',
	displayName: 'Carousel',
	description: 'Carousel component',
	component: Carousel,
	styleComponent: CarouselStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
};

export default component;
