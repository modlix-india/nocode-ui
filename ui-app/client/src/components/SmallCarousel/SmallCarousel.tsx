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

		let handle: number;

		function timerFunction() {
			if (
				!transit.current.hover &&
				(firstTime ||
					Date.now() - transit.current.executedAt >= slideSpeed + animationDuration)
			) {
				const factor = autoPlayDirection === 'backward' ? -1 : 1;
				applyTransform(transit.current.to + slidesToScroll * factor, factor);
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
		() => applyTransform(transit.current.to - slidesToScroll, -1),
		() => applyTransform(transit.current.to + slidesToScroll, 1),
	);

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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_carouselmainframe"
						d="M16.0958 0H9.00391C8.45162 0 8.00391 0.447716 8.00391 1V14.36C8.00391 14.9123 8.45162 15.36 9.0039 15.36H16.0958C16.648 15.36 17.0958 14.9123 17.0958 14.36V1C17.0958 0.447715 16.648 0 16.0958 0Z"
						fill="url(#paint0_linear_3214_9454)"
					/>
					<path
						className="_carouselsecondframe"
						d="M6.0392 1.81726H4.40234C3.85006 1.81726 3.40234 2.26498 3.40234 2.81726V12.5404C3.40234 13.0927 3.85006 13.5404 4.40234 13.5404H6.0392C6.59148 13.5404 7.0392 13.0927 7.0392 12.5404V2.81726C7.0392 2.26498 6.59148 1.81726 6.0392 1.81726Z"
						fill="url(#paint1_linear_3214_9454)"
					/>
					<path
						className="_carouselthirdframe"
						d="M20.6957 1.81726H19.0586C18.5063 1.81726 18.0586 2.26498 18.0586 2.81726V12.5404C18.0586 13.0927 18.5063 13.5404 19.0586 13.5404H20.6957C21.248 13.5404 21.6957 13.0927 21.6957 12.5404V2.81726C21.6957 2.26498 21.248 1.81726 20.6957 1.81726Z"
						fill="url(#paint2_linear_3214_9454)"
					/>
					<path
						className="_carouselfourthframe"
						d="M24.0983 3.07153H23.6577C23.1054 3.07153 22.6577 3.51925 22.6577 4.07153V11.2938C22.6577 11.8461 23.1054 12.2938 23.6577 12.2938H24.0983C24.6506 12.2938 25.0983 11.8461 25.0983 11.2938V4.07153C25.0983 3.51925 24.6506 3.07153 24.0983 3.07153Z"
						fill="url(#paint3_linear_3214_9454)"
					/>
					<path
						className="_carouselfirstframe"
						d="M1.44091 3.07153H1C0.447715 3.07153 0 3.51925 0 4.07153V11.2938C0 11.8461 0.447716 12.2938 1 12.2938H1.44091C1.9932 12.2938 2.44091 11.8461 2.44091 11.2938V4.07153C2.44091 3.51925 1.9932 3.07153 1.44091 3.07153Z"
						fill="url(#paint4_linear_3214_9454)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9454"
							x1="12.5498"
							y1="0"
							x2="12.5498"
							y2="15.36"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#E6E2FF" />
							<stop offset="1" stopColor="#B1A5FF" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9454"
							x1="5.22077"
							y1="1.81726"
							x2="5.22077"
							y2="13.5404"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9454"
							x1="19.8772"
							y1="1.81726"
							x2="19.8772"
							y2="13.5404"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9454"
							x1="23.878"
							y1="3.07153"
							x2="23.878"
							y2="12.2938"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3214_9454"
							x1="1.22046"
							y1="3.07153"
							x2="1.22046"
							y2="12.2938"
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
			name: 'dotButtons',
			displayName: 'Dot Buttons',
			description: 'Dot Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slidesContainer',
			displayName: 'Slide Container',
			description: 'Slder Wapper for Slider',
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
