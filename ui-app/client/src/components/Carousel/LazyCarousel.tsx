import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import Children from '../Children';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';

export default function Carousel(props: Readonly<ComponentProps>) {
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
