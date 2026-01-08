import React, { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import CarouselStyle from './CarouselStyle';
import Children from '../Children';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleProperties, styleDefaults } from './carouselStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Carousel(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition, pageDefinition } = props;
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			showArrowButtons,
			slideSpeed,
			autoPlay,
			easing,
			animationDuration,
			animationType,
			slideNavButtonPosition,
			arrowButtons,
			showNavigationControlsOnHover,
			showIndicators: _showIndicators,
			indicatorPosition,
			indicatorVisibleCount,
			indicatorShape,
			indicatorFill,
			indicatorShowNumbers,
			showIndicatorArrows: _showIndicatorArrows,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	// Backward compatibility: if showIndicators is undefined but showDotsButtons is true, treat as true
	const showIndicators =
		typeof _showIndicators === 'boolean'
			? _showIndicators
			: typeof props?.definition?.properties?.showDotsButtons === 'boolean'
				? props?.definition?.properties?.showDotsButtons
				: true;

	const showIndicatorArrows =
		typeof _showIndicatorArrows === 'boolean' ? _showIndicatorArrows : true;

	const ref = useRef<HTMLDivElement>(null);
	const [childrenDef, setChildrenDef] = useState<any>();
	const [transitionFrom, setTransitionFrom] = useState<number | undefined>(undefined);
	const [slideNum, setSlideNum] = useState<number>(0);
	const [firstTime, setFirstTime] = useState(true);
	const [hover, setHover] = useState(false);
	const [currentSlide, setCurrentSlide] = useState(0);
	const touchStart = useRef<{ x: number; y: number } | null>(null);
	const touchDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

	const currentSlideRef = useRef<HTMLDivElement>(null);
	const previousSlide = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!currentSlideRef.current || isNullValue(transitionFrom)) return;
		setTimeout(() => {
			if (!currentSlideRef.current || isNullValue(transitionFrom)) return;
			currentSlideRef.current!.className = `_eachSlide _current _${animationType} _${animationType}Start ${
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
	}, [currentSlideRef.current, previousSlide.current, transitionFrom, animationType]);

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
					ref={currentSlideRef}
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

	function handleTouchStart(e: React.TouchEvent) {
		const t = e.touches[0];
		touchStart.current = { x: t.clientX, y: t.clientY };
		touchDelta.current = { x: 0, y: 0 };
	}
	function handleTouchMove(e: React.TouchEvent) {
		if (!touchStart.current) return;
		const t = e.touches[0];
		touchDelta.current = {
			x: t.clientX - touchStart.current.x,
			y: t.clientY - touchStart.current.y,
		};
	}
	function handleTouchEnd() {
		if (!touchStart.current) return;
		const threshold = 40;
		if (touchDelta.current.x < -threshold && childrenDef?.length > 1) {
			const next = (currentSlide + 1) % childrenDef.length;
			setCurrentSlide(next);
			setSlideNum(next);
		} else if (touchDelta.current.x > threshold && childrenDef?.length > 1) {
			const prev = (currentSlide - 1 + childrenDef.length) % childrenDef.length;
			setCurrentSlide(prev);
			setSlideNum(prev);
		}
		touchStart.current = null;
		touchDelta.current = { x: 0, y: 0 };
	}

	const totalSlides = childrenDef?.length ?? 0;
	const visibleCount =
		indicatorVisibleCount > 0 ? Math.min(indicatorVisibleCount, totalSlides) : totalSlides;
	let startIdx = 0;
	if (visibleCount < totalSlides) {
		startIdx = Math.max(
			0,
			Math.min(currentSlide - Math.floor(visibleCount / 2), totalSlides - visibleCount),
		);
	}
	const indicatorIndexes = Array.from({ length: visibleCount }, (_, i) => i + startIdx);

	function renderIndicatorNavButtons() {
		if (visibleCount >= totalSlides) return null;
		const canScrollPrev = startIdx > 0;
		const canScrollNext = startIdx + visibleCount < totalSlides;
		return (
			<>
				{canScrollPrev && (
					<button
						className="indicator-nav-btn prev"
						aria-label="Scroll indicators backward"
						onClick={e => {
							e.stopPropagation();
							const newStart = Math.max(0, startIdx - 1);
							const newCurrent = Math.max(newStart, currentSlide - 1);
							setCurrentSlide(newCurrent);
							setSlideNum(newCurrent);
						}}
					>
						{<i className="fa fa-caret-left" aria-hidden="true" />}
					</button>
				)}
				{canScrollNext && (
					<button
						className="indicator-nav-btn next"
						aria-label="Scroll indicators forward"
						onClick={e => {
							e.stopPropagation();
							const newStart = Math.min(totalSlides - visibleCount, startIdx + 1);
							const newCurrent = Math.min(
								newStart + visibleCount - 1,
								currentSlide + 1,
							);
							setCurrentSlide(newCurrent);
							setSlideNum(newCurrent);
						}}
					>
						{<i className="fa fa-caret-right" aria-hidden="true" />}
					</button>
				)}
			</>
		);
	}

	function IndicatorBar() {
		if (!showIndicators || totalSlides <= 1) return null;
		const canScrollPrev = visibleCount < totalSlides && startIdx > 0;
		const canScrollNext = visibleCount < totalSlides && startIdx + visibleCount < totalSlides;
		return (
			<div
				className={`carousel-indicators position-${indicatorPosition} indicator-container`}
				role="tablist"
				aria-label="Carousel indicators"
				style={resolvedStyles.indicatorContainer ?? {}}
			>
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="indicatorContainer"
				/>
				{showIndicatorArrows && canScrollPrev && (
					<button
						className="indicator-nav-btn prev"
						aria-label="Scroll indicators backward"
						onClick={e => {
							e.stopPropagation();
							const newStart = Math.max(0, startIdx - 1);
							const newCurrent = Math.max(newStart, currentSlide - 1);
							setCurrentSlide(newCurrent);
							setSlideNum(newCurrent);
						}}
						style={{
							...(resolvedStyles.indicatorNavBtn ?? {}),
							...(resolvedStyles.indicatorNavBtnActive ?? {}),
						}}
					>
						<SubHelperComponent
							definition={props?.definition}
							subComponentName="indicatorNavBtn"
						/>
						<SubHelperComponent
							definition={props?.definition}
							subComponentName="indicatorNavBtnActive"
						/>
						<i className="fa fa-caret-left" aria-hidden="true" />
					</button>
				)}
				{indicatorIndexes.map(idx => {
					const isActive = idx === currentSlide;
					let indicatorClass = 'indicator-button';
					if (isActive) indicatorClass += ' active';
					if (indicatorShape) indicatorClass += ` shape-${indicatorShape}`;
					if (indicatorFill) indicatorClass += ` fill-${indicatorFill}`;
					return (
						<div
							key={idx}
							className={indicatorClass}
							role="tab"
							aria-selected={isActive}
							aria-label={`Go to slide ${idx + 1}`}
							tabIndex={0}
							onClick={() => {
								setCurrentSlide(idx);
								setSlideNum(idx);
							}}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									setCurrentSlide(idx);
									setSlideNum(idx);
								}
							}}
							style={
								isActive
									? {
											...(resolvedStyles.indicatorButton ?? {}),
											...(resolvedStyles.indicatorButtonActive ?? {}),
										}
									: (resolvedStyles.indicatorButton ?? {})
							}
						>
							<SubHelperComponent
								definition={props?.definition}
								subComponentName="indicatorButton"
								key={idx}
							/>
							{isActive && (
								<SubHelperComponent
									definition={props?.definition}
									subComponentName="indicatorButtonActive"
									key={'active' + idx}
								/>
							)}
							{indicatorShowNumbers ? idx + 1 : indicatorShape === 'dash' ? '' : ''}
						</div>
					);
				})}
				{showIndicatorArrows && canScrollNext && (
					<button
						className="indicator-nav-btn next"
						aria-label="Scroll indicators forward"
						onClick={e => {
							e.stopPropagation();
							const newStart = Math.min(totalSlides - visibleCount, startIdx + 1);
							const newCurrent = Math.min(
								newStart + visibleCount - 1,
								currentSlide + 1,
							);
							setCurrentSlide(newCurrent);
							setSlideNum(newCurrent);
						}}
						style={{
							...(resolvedStyles.indicatorNavBtn ?? {}),
							...(resolvedStyles.indicatorNavBtnActive ?? {}),
						}}
					>
						<SubHelperComponent
							definition={props?.definition}
							subComponentName="indicatorNavBtn"
						/>
						<SubHelperComponent
							definition={props?.definition}
							subComponentName="indicatorNavBtnActive"
						/>
						<i className="fa fa-caret-right" aria-hidden="true" />
					</button>
				)}
			</div>
		);
	}

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
			{(indicatorPosition === 'top' || indicatorPosition === 'left') && <IndicatorBar />}
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
				<div
					className="innerDiv"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{showChildren}
				</div>
				{(indicatorPosition === 'bottom' || indicatorPosition === 'right') && (
					<IndicatorBar />
				)}
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
			name: 'indicatorContainer',
			displayName: 'Indicator Container',
			description: 'Container for slide indicators',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButton',
			displayName: 'Indicator Button',
			description: 'Individual indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButtonActive',
			displayName: 'Indicator Button Active',
			description: 'Active indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorNavBtn',
			displayName: 'Indicator Navigation Arrow',
			description: 'Indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
		{
			name: 'indicatorNavBtnActive',
			displayName: 'Active Indicator Navigation Arrow',
			description: 'Active indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
