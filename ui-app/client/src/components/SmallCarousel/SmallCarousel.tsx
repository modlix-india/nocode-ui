import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	setData,
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
import { styleDefaults } from './smallCarouselStyleProperties';
import { flattenUUID } from '../util/uuid';
import { shortUUID } from '../../util/shortUUID';
import { updateLocationForChild } from '../util/updateLoactionForChild';

function SmallCarousel(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
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
			arrowButtonsHorizontalPlacement,
			arrowButtonsVerticalPlacement,
			arrowButtonsPlacement,
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
			showSlideNav,
			slideNavOrientation,
			slideNavPlacement,
			slideNavIconType,
			slideNavIconFill,
			showSlideNumbersInDots,
			showNavigationControlsOnHover,
			visibleSlideNavButtons,
			showNavArrowButtons,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const ref = useRef<HTMLDivElement>(null);
	const innerSlideItems = useRef<any>([]);
	const innerSlideItemContainers = useRef<any>([]);
	const observableList = useRef<any>([]);
	const [_, setChanged] = useState<number>(Date.now());
	const transit = useRef<any>({});
	const [firstTime, setFirstTime] = useState(true);
	const [currentSlide, setCurrentSlide] = useState(0);

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

	// used for unobserving the div's
	useEffect(() => {
		// on load of the images we are attaching the resize observer to each elem, and then storing it in observableList so we can unobserve it.
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
						children={{ [e[1].key]: true }}
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

	const applyTransform = useCallback(
		(to: number, scrollDirection: number = 1) => {
			if (
				finNumberOfChildren == undefined ||
				finNumberOfChildren <= 1 ||
				childWidth < 5 ||
				childHeight < 5
			)
				return;

			const totalChildren = childrenComponents.length;
			to = (to + totalChildren) % totalChildren;

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

			setCurrentSlide(to);

			if (firstTime) setFirstTime(false);
		},
		[
			finNumberOfChildren,
			childrenComponents.length,
			firstTime,
			childWidth,
			childHeight,
			isVertical,
			slidesToScroll,
			animationDuration,
			easing,
		],
	);

	useEffect(() => {
		if (finNumberOfChildren <= 1 || childWidth < 5 || childHeight < 5) return;

		if (firstTime) applyTransform(0);

		if (!autoPlay) return;

		let handle: number;

		function timerFunction() {
			if (
				!transit.current.hover &&
				(firstTime ||
					Date.now() - transit.current.executedAt >= slideSpeed + animationDuration)
			) {
				const factor = autoPlayDirection === 'backward' ? -1 : 1;
				applyTransform(
					(currentSlide + slidesToScroll * factor + childrenComponents.length) %
						childrenComponents.length,
					factor,
				);
			}
			transit.current.timerAt = Date.now();
		}

		handle = setInterval(timerFunction, slideSpeed + animationDuration + 220);

		return () => clearInterval(handle);
	}, [
		finNumberOfChildren,
		childWidth,
		childHeight,
		autoPlay,
		autoPlayDirection,
		firstTime,
		slideSpeed,
		animationDuration,
		slidesToScroll,
		currentSlide,
		childrenComponents.length,
		applyTransform,
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
		() => applyTransform(transit.current.to - slidesToScroll, -1),
		() => applyTransform(transit.current.to + slidesToScroll, 1),
	);

	function makeSlideNavButtons(
		showSlideNav: boolean,
		totalSlides: number,
		currentSlide: number,
		slideNavOrientation: string,
		slideNavPlacement: string,
		slideNavIconType: string,
		slideNavIconFill: string,
		showSlideNumbersInDots: boolean,
		resolvedStyles: any,
		onSlideNavClick: (index: number) => void,
		visibleSlideNavButtons: number,
		showNavArrowButtons: boolean,
	) {
		if (!showSlideNav) return null;

		const buttons = [];
		let startIndex = 0;
		let endIndex = totalSlides;

		if (visibleSlideNavButtons > 0 && visibleSlideNavButtons < totalSlides) {
			const halfVisible = Math.floor(visibleSlideNavButtons / 2);
			startIndex = Math.max(0, currentSlide - halfVisible);
			endIndex = Math.min(totalSlides, startIndex + visibleSlideNavButtons);

			if (endIndex - startIndex < visibleSlideNavButtons) {
				startIndex = Math.max(0, endIndex - visibleSlideNavButtons);
			}
		}

		const navButtons = [];

		const isVertical = slideNavOrientation.startsWith('vertical');
		const rotationClass = isVertical ? '_vertical' : '';

		if (startIndex > 0 && showNavArrowButtons) {
			navButtons.push(
				<div
					key="start-arrow"
					className={`_slideNavArrow _start ${rotationClass}`}
					onClick={() =>
						onSlideNavClick(Math.max(0, startIndex - visibleSlideNavButtons))
					}
					style={resolvedStyles?.slideNavArrow ?? {}}
				/>,
			);
		}

		for (let i = startIndex; i < endIndex; i++) {
			navButtons.push(
				<div
					key={`slide-nav-${i}`}
					className={`_slideNavButton ${rotationClass} ${
						showSlideNumbersInDots ? '_number' : `_${slideNavIconType}`
					} ${slideNavIconFill === 'solid' ? '_solid' : ''} ${
						i === currentSlide ? '_active' : ''
					}`}
					style={resolvedStyles?.slideNavButton ?? {}}
					onClick={() => onSlideNavClick(i)}
				>
					{showSlideNumbersInDots ? i + 1 : null}
				</div>,
			);
		}

		if (endIndex < totalSlides && showNavArrowButtons) {
			navButtons.push(
				<div
					key="end-arrow"
					className={`_slideNavArrow _end ${rotationClass}`}
					onClick={() => onSlideNavClick(Math.min(totalSlides - 1, endIndex))}
					style={resolvedStyles?.slideNavArrow ?? {}}
				/>,
			);
		}

		const navContainerClass = `_slideNavContainer _${slideNavOrientation} _${slideNavPlacement} ${isVertical ? '_vertical' : '_horizontal'}`;

		return (
			<div className={navContainerClass} style={resolvedStyles?.slideNavContainer ?? {}}>
				{navButtons}
			</div>
		);
	}

	return (
		<div
			className={`comp compSmallCarousel ${designType} ${arrowButtonsPlacement} ${arrowButtonsHorizontalPlacement} ${arrowButtonsVerticalPlacement} ${
				showArrowButtonsOnHover ? '_showArrowsOnHover' : ''
			} ${
				showNavigationControlsOnHover ? '_showSlideNavOnHover' : ''
			} ${slideNavOrientation} ${slideNavPlacement} ${isVertical ? '_vertical' : ''}`}
			style={{ minWidth, minHeight, ...(resolvedStyles?.comp ?? {}) }}
			onMouseOver={pauseOnHover ? () => (transit.current.hover = true) : undefined}
			onMouseOut={pauseOnHover ? () => (transit.current.hover = false) : undefined}
		>
			<HelperComponent context={props?.context} definition={definition} />
			{prevButton}
			{buttonGroup}
			<div
				className={`_slidesContainer`}
				style={{ ...containerDims, ...(resolvedStyles?.containerInnerDiv ?? {}) }}
				ref={ref}
			>
				{childrenComponents}
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="slidesContainer"
				></SubHelperComponent>
			</div>
			{makeSlideNavButtons(
				showSlideNav,
				childrenComponents.length,
				currentSlide,
				slideNavOrientation,
				slideNavPlacement,
				slideNavIconType,
				slideNavIconFill,
				showSlideNumbersInDots,
				resolvedStyles,
				(index: number) => applyTransform(index),
				visibleSlideNavButtons,
				showNavArrowButtons,
			)}
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
			<div
				className="_arrowButtons _prev"
				style={resolvedStyles?.prevButton ?? {}}
				onClick={onPrevClick}
			>
				{prevImage ? (
					<img src={prevImage} alt="prev" />
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
			<div
				className="_arrowButtons _next"
				style={resolvedStyles?.nextButton ?? {}}
				onClick={onNextClick}
			>
				{nextImage ? (
					<img src={nextImage} alt="next" />
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
	} else if (arrowButtonsPlacement === '_insideArrow') {
		buttonGroup = (
			<div className="_arrowButtonGroup">
				<div
					className="_arrowButtons _prev"
					style={resolvedStyles?.prevButton ?? {}}
					onClick={onPrevClick}
				>
					{prevImage ? (
						<img src={prevImage} alt="prev" />
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
				<div
					className="_arrowButtons _next"
					style={resolvedStyles?.nextButton ?? {}}
					onClick={onNextClick}
				>
					{nextImage ? (
						<img src={nextImage} alt="next" />
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

	return {};
}

function calculateMinDimensions(
	ref: HTMLDivElement | null,
	childRefs: any[],
	designType: any,
	totalChildren: number,
	noOfChilds: any,
) {
	if (!ref || childRefs.length < totalChildren) return [0, 0, 0, 0, 0];

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
						d="M2.44468 7.99902H2.33789C1.78561 7.99902 1.33789 8.44674 1.33789 8.99902V14.959C1.33789 15.5112 1.78561 17.0379 5.27539 17.0379H6.41442C6.9667 17.0379 7.41442 16.5902 7.41442 16.0379V7.91943C7.41442 7.36715 6.9667 6.91943 6.41442 6.91943Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'prevButton',
			displayName: 'Previous Arrow Button',
			description: 'Previous Arrow Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextButton',
			displayName: 'Next Arrow Button',
			description: 'Next Arrow Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideButtonsContainer',
			displayName: 'Slide Buttons Container',
			description: 'Slide Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideNavButtons',
			displayName: 'Slider Navigation Buttons',
			description: 'Slider Navigation Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slidesContainer',
			displayName: 'Slide Container',
			description: 'Slider Wapper for Slider',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideItem',
			displayName: 'Slide Item',
			description: 'Each Slides in the Slider',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
