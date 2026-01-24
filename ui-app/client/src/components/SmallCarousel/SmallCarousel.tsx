import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import {
	Component,
	ComponentDefinition,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	LocationHistory,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { getRenderData } from '../util/getRenderData';
import useDefinition from '../util/useDefinition';
import SmallCarouselStyle from './SmallCarouselStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './smallCarouselProperties';
import { styleProperties, styleDefaults } from './smallCarouselStyleProperties';
import { flattenUUID } from '../util/uuid';
import { shortUUID } from '../../util/shortUUID';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import getSrcUrl from '../util/getSrcUrl';

function SmallCarousel(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const {
		locationHistory = [],
		definition: { children, key, properties },
		pageDefinition,
		definition,
		context,
	} = props;

	const { data: dataProperty } = (properties ?? {}) as { data: ComponentProperty<any> };

	const {
		stylePropertiesWithPseudoStates,
		properties: {
			showArrowButtons,
			slideSpeed,
			autoPlay,
			autoPlayDirection,
			animationDuration,
			dotsButtonType,
			dotsButtonIconType,
			showSlideNumbersInDots,
			arrowButtonsHorizontalPlacement,
			arrowButtonsVerticalPlacement,
			arrowButtonsPlacement,
			slideNavButtonHorizontalAlignment,
			slideNavButtonVerticalAlignment,
			slideNavButtonPlacement,
			showNavigationControlsOnHover,
			slidesToScroll,
			fixedChild,
			noOfChilds,
			designType,
			pauseOnHover,
			easing,
			data,
			showArrowButtonsOnHover,
			datatype,
			selectionKey,
			uniqueKeyType,
			uniqueKey,
			selectionType,
			prevImage,
			nextImage,
			showIndicators,
			indicatorPosition,
			indicatorVisibleCount,
			indicatorShape,
			indicatorFill,
			indicatorShowNumbers,
			showIndicatorArrows,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const ref = useRef<HTMLDivElement>(null);
	const innerSlideItems = useRef<any>([]);
	const innerSlideItemContainers = useRef<any>([]);
	const observableList = useRef<any>([]);
	const [_, setChanged] = useState<number>(Date.now());
	const transit = useRef<any>({});
	const [firstTime, setFirstTime] = useState(true);
	const [currentSlide, setCurrentSlide] = useState(0);

	const touchStart = useRef<{ x: number; y: number } | null>(null);
	const touchDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
		if (isVertical) {
			if (touchDelta.current.y < -threshold && totalSlides > 1) {
				const next = (currentSlide + 1) % totalSlides;
				setCurrentSlide(next);
				applyTransform(next, 1);
			} else if (touchDelta.current.y > threshold && totalSlides > 1) {
				const prev = (currentSlide - 1 + totalSlides) % totalSlides;
				setCurrentSlide(prev);
				applyTransform(prev, -1);
			}
		} else {
			if (touchDelta.current.x < -threshold && totalSlides > 1) {
				const next = (currentSlide + 1) % totalSlides;
				setCurrentSlide(next);
				applyTransform(next, 1);
			} else if (touchDelta.current.x > threshold && totalSlides > 1) {
				const prev = (currentSlide - 1 + totalSlides) % totalSlides;
				setCurrentSlide(prev);
				applyTransform(prev, -1);
			}
		}
		touchStart.current = null;
		touchDelta.current = { x: 0, y: 0 };
	}

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let childrenEntries: Array<[string, ComponentDefinition, LocationHistory[]]> = Object.entries(
		children ?? {},
	)
		.filter((e: any) => !!e[1])
		.map(
			e =>
				[e[0], pageDefinition?.componentDefinition[e[0]], locationHistory] as [
					string,
					ComponentDefinition,
					LocationHistory[],
				],
		)
		.sort((a: any, b: any) => {
			const v = (a[1]?.displayOrder ?? 0) - (b[1]?.displayOrder ?? 0);
			return v === 0 ? (a[1]?.key ?? '').localeCompare(b[1]?.key ?? '') : v;
		});

	const bindingPathPath = `Store.defaultData.${
		pageExtractor?.getPageName() ?? '_global'
	}.${flattenUUID(key)}`;

	useEffect(() => {
		setFirstTime(true);
		if (!dataProperty?.value) return;
		setData(bindingPathPath!, data, context?.pageName);
	}, [dataProperty?.value, data]);

	const carouselData = React.useMemo(
		() => getRenderData(data, datatype, uniqueKeyType, uniqueKey, selectionType, selectionKey),
		[data, datatype, uniqueKeyType, uniqueKey, selectionKey, selectionType],
	);

	if (!isNullValue(data)) {
		childrenEntries = carouselData.map((e, index) => [
			e?.key,
			childrenEntries[0][1],
			[
				...locationHistory,
				updateLocationForChild(
					key,
					dataProperty?.value
						? {
								type: 'VALUE',
								value: bindingPathPath,
							}
						: dataProperty.location!,
					index,
					locationHistory,
					context.pageName,
					pageExtractor,
				),
			],
		]);
	}

	const isVertical = designType === '_vertical';

	useEffect(() => {
		innerSlideItems?.current?.forEach((elem: any, index: number) => {
			if (elem) {
				const observer = new ResizeObserver(() => {
					setChanged(Date.now());
				});

				observer.observe(elem);
				observableList.current[index] = { observer, element: elem };
			}
		});

		return () => {
			for (const element of observableList.current) {
				if (element) {
					element.observer.unobserve(element.element);
				}
			}
		};
	}, [fixedChild, noOfChilds, designType, data, ref.current, innerSlideItems.current]);

	const [minWidth, minHeight, childWidth, childHeight, finNumberOfChildren] =
		calculateMinDimensions(
			ref.current,
			innerSlideItems.current,
			designType,
			childrenEntries.length,
			noOfChilds,
		);

	const widthPercentage = isVertical ? '100%' : `${100 / finNumberOfChildren}%`;
	const heightPercentage = isVertical ? `${100 / finNumberOfChildren}%` : '100%';

	let childrenComponents = childrenEntries.map(
		(e: [string, ComponentDefinition, LocationHistory[]], index: number) => (
			<div
				key={`${e[0]}_${index}`}
				className={`_slideItemContainer`}
				style={{
					minWidth: `${childWidth}px`,
					minHeight: `${childHeight}px`,
					width: widthPercentage,
					height: heightPercentage,
				}}
				ref={el => {
					innerSlideItemContainers.current[index] = el;
				}}
			>
				<div
					ref={el => {
						innerSlideItems.current[index] = el;
					}}
					className={`_slideItem`}
					style={{ ...(resolvedStyles?.childElement ?? {}) }}
				>
					<SubHelperComponent definition={definition} subComponentName="slideItem" />
					<Children
						renderableChildren={{ [e[1].key]: true }}
						context={context}
						pageDefinition={pageDefinition}
						locationHistory={e[2] as LocationHistory[]}
						key={`${e[0]}_${index}`}
					/>
				</div>
			</div>
		),
	);

	const containerDims: React.CSSProperties = {};

	if (isVertical) {
		containerDims.minHeight = `${childHeight * finNumberOfChildren}px`;
	} else {
		containerDims.minWidth = `${childWidth * finNumberOfChildren}px`;
	}

	const applyTransform = (to: number, scrollDirection: number = 1) => {
		if (
			finNumberOfChildren == undefined ||
			finNumberOfChildren <= 1 ||
			childWidth < 5 ||
			childHeight < 5
		)
			return;

		const totalChildren = childrenComponents.length;
		to = (to + totalChildren) % totalChildren;
		setCurrentSlide(to);

		for (let i = 0; i < childrenComponents.length; i++) {
			innerSlideItemContainers.current[i].style.transition = undefined;
		}

		const percentage: number = Math.ceil(10000 / finNumberOfChildren) / 100;
		const direction = isVertical ? 'top' : 'left';
		let from: number = transit.current.to;

		if (
			transit.current.finNumberOfChildren !== finNumberOfChildren ||
			transit.current.totalChildren !== childrenComponents.length
		) {
			for (let i = 0; i < totalChildren; i++) {
				let v;
				if (i < to || i >= to + childrenComponents.length) v = `-${percentage}%`;
				else v = `${(i - to) * percentage}%`;

				innerSlideItemContainers.current[i].style[direction] = v;
			}
			from = 0;
		} else {
			if (from === to) return;

			let fromPercent = scrollDirection === 1 ? 0 : -(slidesToScroll * percentage);
			for (let i = 0; i < childrenComponents.length; i++) {
				const ind =
					(childrenComponents.length * 2 +
						to +
						i -
						(scrollDirection > 0 ? slidesToScroll : 0)) %
					childrenComponents.length;

				const v = `${fromPercent + i * percentage}%`;
				innerSlideItemContainers.current[ind].style[direction] = v;
			}

			setTimeout(() => {
				fromPercent = scrollDirection === -1 ? 0 : -(slidesToScroll * percentage);
				for (let i = 0; i < childrenComponents.length; i++) {
					const ind =
						(childrenComponents.length * 2 +
							to +
							i -
							(scrollDirection > 0 ? slidesToScroll : 0)) %
						childrenComponents.length;
					innerSlideItemContainers.current[ind].style.transition =
						`${direction} ${animationDuration}ms ${easing}`;
					const v = `${fromPercent + i * percentage}%`;
					innerSlideItemContainers.current[ind].style[direction] = v;
				}
			}, 100);
		}

		transit.current = {
			from,
			to,
			finNumberOfChildren: finNumberOfChildren,
			totalChildren: childrenComponents.length,
			hover: transit.current.hover,
			executedAt: Date.now(),
			timerAt: transit.current.timerAt,
		};

		if (firstTime) setFirstTime(false);
	};

	useEffect(() => {
		if (finNumberOfChildren <= 1 || childWidth < 5 || childHeight < 5) return;

		if (firstTime) applyTransform(0);

		if (!autoPlay) return;

		let handle: NodeJS.Timeout;

		function timerFunction() {
			if (
				!transit.current.hover &&
				(firstTime ||
					Date.now() - transit.current.executedAt >= slideSpeed + animationDuration)
			) {
				const factor = autoPlayDirection === 'backward' ? -1 : 1;
				const nextSlide =
					(transit.current.to + slidesToScroll * factor + totalSlides) % totalSlides;
				setCurrentSlide(nextSlide);
				applyTransform(nextSlide, factor);
			}
			transit.current.timerAt = Date.now();
		}

		handle = setInterval(timerFunction, slideSpeed + animationDuration + 220);

		return () => clearInterval(handle);
	}, [
		finNumberOfChildren,
		childWidth,
		childHeight,
		transit.current,
		autoPlay,
		autoPlayDirection,
		firstTime,
		slideSpeed,
		animationDuration,
		slidesToScroll,
	]);

	let { prevButton, buttonGroup, nextButton } = makeArrowButtons(
		showArrowButtons,
		finNumberOfChildren,
		childrenEntries,
		arrowButtonsPlacement,
		isVertical,
		arrowButtonsVerticalPlacement,
		arrowButtonsHorizontalPlacement,
		resolvedStyles,
		props,
		prevImage,
		nextImage,
		() => {
			const prev = (transit.current.to - slidesToScroll + totalSlides) % totalSlides;
			setCurrentSlide(prev);
			applyTransform(prev, -1);
		},
		() => {
			const next = (transit.current.to + slidesToScroll) % totalSlides;
			setCurrentSlide(next);
			applyTransform(next, 1);
		},
	);

	const totalSlides = childrenEntries.length;
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
							applyTransform(newCurrent);
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
						{isVertical ? (
							<i className="fa fa-caret-up" aria-hidden="true" />
						) : (
							<i className="fa fa-caret-left" aria-hidden="true" />
						)}
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
								applyTransform(idx);
							}}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									setCurrentSlide(idx);
									applyTransform(idx);
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
							applyTransform(newCurrent);
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
						{isVertical ? (
							<i className="fa fa-caret-down" aria-hidden="true" />
						) : (
							<i className="fa fa-caret-right" aria-hidden="true" />
						)}
					</button>
				)}
			</div>
		);
	}

	return (
		<div
			className={`comp compSmallCarousel ${designType} ${arrowButtonsPlacement} ${arrowButtonsHorizontalPlacement} ${arrowButtonsVerticalPlacement} ${
				showArrowButtonsOnHover ? '_showArrowsOnHover' : ''
			} `}
			style={{ minWidth, minHeight, ...(resolvedStyles?.comp ?? {}) }}
			onMouseOver={pauseOnHover ? () => (transit.current.hover = true) : undefined}
			onMouseOut={pauseOnHover ? () => (transit.current.hover = false) : undefined}
		>
			<HelperComponent context={props?.context} definition={definition} />
			{(indicatorPosition === 'top' || indicatorPosition === 'left') && <IndicatorBar />}
			{prevButton}
			{buttonGroup}
			<div
				className={`_slidesContainer`}
				style={{ ...containerDims, ...(resolvedStyles?.containerInnerDiv ?? {}) }}
				ref={ref}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{childrenComponents}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="slidesContainer"
				></SubHelperComponent>
			</div>
			{(indicatorPosition === 'bottom' || indicatorPosition === 'right') && <IndicatorBar />}
			{nextButton}
		</div>
	);
}

function makeArrowButtons(
	showArrowButtons: any,
	finNumberOfChildren: any,
	childrenEntries: any,
	arrowButtonsPlacement: any,
	isVertical: boolean,
	arrowButtonsVerticalPlacement: any,
	arrowButtonsHorizontalPlacement: any,
	resolvedStyles: any,
	props: ComponentProps,
	prevImage: any,
	nextImage: any,
	onPrevClick: () => void,
	onNextClick: () => void,
): { prevButton?: JSX.Element; nextButton?: JSX.Element; buttonGroup?: JSX.Element } {
	let prevButton;
	let nextButton;
	let buttonGroup;

	if (!showArrowButtons || finNumberOfChildren >= childrenEntries.length) return {};

	if (
		arrowButtonsPlacement === '_outsideArrow' ||
		(isVertical &&
			arrowButtonsPlacement === '_insideArrow' &&
			arrowButtonsVerticalPlacement === '_centerArrow') ||
		(!isVertical &&
			arrowButtonsPlacement === '_insideArrow' &&
			arrowButtonsHorizontalPlacement === '_middleArrow')
	) {
		prevButton = (
			<div className="_arrowButtons _prev" onClick={onPrevClick}>
				{prevImage ? (
					<img src={getSrcUrl(prevImage)} alt="prev" />
				) : isVertical ? (
					<UpArrow />
				) : (
					<LeftArrow />
				)}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="prevButton"
				></SubHelperComponent>
			</div>
		);
		nextButton = (
			<div className="_arrowButtons _next" onClick={onNextClick}>
				{nextImage ? (
					<img src={getSrcUrl(nextImage)} alt="next" />
				) : isVertical ? (
					<DownArrow />
				) : (
					<RightArrow />
				)}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="nextButton"
				></SubHelperComponent>
			</div>
		);

		return { prevButton, nextButton };
	}
	buttonGroup = (
		<div className="_arrowButtonGroup">
			<div className="_arrowButtons _prev" onClick={onPrevClick}>
				{prevImage ? (
					<img src={getSrcUrl(prevImage)} alt="prev" />
				) : isVertical ? (
					<UpArrow />
				) : (
					<LeftArrow />
				)}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="prevButton"
				></SubHelperComponent>
			</div>
			<div className="_arrowButtons _next" onClick={onNextClick}>
				{nextImage ? (
					<img src={getSrcUrl(nextImage)} alt="next" />
				) : isVertical ? (
					<DownArrow />
				) : (
					<RightArrow />
				)}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="nextButton"
				></SubHelperComponent>
			</div>
		</div>
	);
	return { buttonGroup };
}

function calculateMinDimensions(
	ref: HTMLDivElement | null,
	childRefs: any[],
	designType: any,
	totalChildren: number,
	noOfChilds: any,
) {
	if (!ref || childRefs.length < totalChildren) return [0, 0];

	let maxChildWidth = 0;
	let maxChildHeight = 0;

	for (let i = 0; i < totalChildren; i++) {
		const { width, height } = childRefs[i].getBoundingClientRect();
		if (width > maxChildWidth) maxChildWidth = width;
		if (height > maxChildHeight) maxChildHeight = height;
	}

	if (noOfChilds === -1) {
		if (designType === '_vertical')
			noOfChilds = Math.floor(ref.getBoundingClientRect().height / maxChildHeight);
		else noOfChilds = Math.floor(ref.getBoundingClientRect().width / maxChildWidth);
		if (noOfChilds > totalChildren) noOfChilds = totalChildren;
	}

	return [
		designType === '_vertical' ? maxChildWidth : maxChildWidth * noOfChilds,
		designType === '_vertical' ? maxChildHeight * noOfChilds : maxChildHeight,
		maxChildWidth,
		maxChildHeight,
		noOfChilds,
	];
}

function LeftArrow({ angle = 0 }) {
	return (
		<svg
			width="29.961"
			height="41.326"
			viewBox="0 0 29.961 41.326"
			transform={`rotate(${angle})`}
		>
			<path
				data-name="Path 268"
				d="M32.309-6.1a4.866,4.866,0,0,1,1.033,2.912A3.3,3.3,0,0,1,32.309-.7a3.654,3.654,0,0,1-2.63.986,6.065,6.065,0,0,1-2.348-.564q-2.348-1.691-5.26-3.851T16.155-8.547q-3.006-2.254-5.917-4.461t-5.354-3.9a4.405,4.405,0,0,1-1.5-3.1,4.115,4.115,0,0,1,1.785-3.287l2.113-1.691q1.644-1.315,3.992-3.1T16.2-31.934Q18.785-34,21.133-35.785t4.039-3.146q1.691-1.362,2.066-1.644a5.966,5.966,0,0,1,2.066-.47,3.562,3.562,0,0,1,2.63,1.033,3.448,3.448,0,0,1,1.033,2.536,4.874,4.874,0,0,1-1.221,3.1q-1.6,1.315-4.039,3.193t-5.072,3.945q-2.63,2.066-5.072,3.945T13.525-20.1q1.878,1.409,4.367,3.24T22.917-13.1q2.536,1.925,5.025,3.757T32.309-6.1Z"
				fill="currentColor"
				transform="translate(-3.381 41.044)"
			/>
		</svg>
	);
}

function RightArrow() {
	return <LeftArrow angle={180} />;
}

function UpArrow({ angle = 0 }) {
	return (
		<svg
			width="41.326"
			height="29.961"
			viewBox="0 0 41.326 29.961"
			transform={`rotate(${angle})`}
		>
			<path
				id="Path_269"
				data-name="Path 269"
				d="M32.309-6.1a4.866,4.866,0,0,1,1.033,2.912A3.3,3.3,0,0,1,32.309-.7a3.654,3.654,0,0,1-2.63.986,6.065,6.065,0,0,1-2.348-.564q-2.348-1.691-5.26-3.851T16.155-8.547q-3.006-2.254-5.917-4.461t-5.354-3.9a4.405,4.405,0,0,1-1.5-3.1,4.115,4.115,0,0,1,1.785-3.287l2.113-1.691q1.644-1.315,3.992-3.1T16.2-31.934Q18.785-34,21.133-35.785t4.039-3.146q1.691-1.362,2.066-1.644a5.966,5.966,0,0,1,2.066-.47,3.562,3.562,0,0,1,2.63,1.033,3.448,3.448,0,0,1,1.033,2.536,4.874,4.874,0,0,1-1.221,3.1q-1.6,1.315-4.039,3.193t-5.072,3.945q-2.63,2.066-5.072,3.945T13.525-20.1q1.878,1.409,4.367,3.24T22.917-13.1q2.536,1.925,5.025,3.757T32.309-6.1Z"
				transform="translate(0.282 -3.381) rotate(90)"
				fill="currentColor"
			/>
		</svg>
	);
}

function DownArrow() {
	return <UpArrow angle={180} />;
}

const component: Component = {
	order: 10,
	name: 'Small Carousel',
	displayName: 'Small Carousel',
	description: 'Small Carousel component',
	component: SmallCarousel,
	styleProperties: stylePropertiesDefinition,
	styleComponent: SmallCarouselStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
		stylePropertiesForTheme: styleProperties,
};

export default component;
