import { isNullValue } from '@fincity/kirun-js';
import React, { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import SmallCarouselStyle from './SmallCarouselStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './smallCarouselProperties';
import { styleDefaults } from './smallCarouselStyleProperties';

const cssProp = [
	'OutsideTop',
	'OutsideTopLeft',
	'OutsideTopRight',
	'OutsideBottomRight',
	'OutsideTopLeft',
	'OutsideBottomLeft',
];

function SmallCarousel(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition, pageDefinition } = props;
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			showDotsButtons,
			showArrowButtons,
			slideSpeed,
			autoPlay,
			animationDuration,
			animationType,
			dotsButtonType,
			dotsButtonIconType,
			hasNumbersInSlideNav,
			slideNavButtonPosition,
			arrowButtons,
			showNavigationControlsOnHover,
			slidesToScroll,
			fixedChild,
			noOfChilds,
			designType,
			pauseOnHover,
			easing,
			visibility,
			readOnly,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const ref = useRef<HTMLDivElement>(null);
	const [updatedDef, setUpdatedDef] = useState<any>();
	const [childrenDef, setChildrenDef] = useState<any>();
	const [transitionFrom, setTransitionFrom] = useState<number | undefined>(undefined);
	const [hover, setHover] = useState<boolean>(false);
	const innerSlides = useRef<any>([]);
	const observableList = useRef<any>([]);
	const [_, setCurrent] = useState<any>(false);
	const currentRef = useRef<any>({ number: 0 });
	const [firstTime, setFirstTime] = useState(true);
	const buttonRef = useRef<any>(null);
	const [center, setCenter] = useState(Math.floor(noOfChilds / 2));

	const isVertical = () => {
		return ['_design3', '_design4'].includes(designType);
	};

	const isCenterMode = () => {
		return ['_design2', '_design4'].includes(designType);
	};

	useEffect(() => {
		let childrenArray = props?.definition?.children
			? Object.entries(props?.definition?.children)
					.filter((e: any) => !!e[1])
					.sort((a: any, b: any) => {
						const v =
							(pageDefinition?.componentDefinition[a[0]]?.displayOrder ?? 0) -
							(pageDefinition?.componentDefinition[b[0]]?.displayOrder ?? 0);
						return v === 0
							? (pageDefinition?.componentDefinition[a[0]]?.key ?? '').localeCompare(
									pageDefinition?.componentDefinition[b[0]]?.key ?? '',
							  )
							: v;
					})
					.map(e => ({ key: e[0], children: { [e[0]]: e[1] } }))
			: [];

		setUpdatedDef(childrenArray);
	}, [props?.definition?.children, ref?.current]);

	const handleLoad = () => {
		let arr = updatedDef?.reduce((acc: any[], each: any, index: number) => {
			let elem = innerSlides?.current?.[index];
			if (elem) {
				const { width, height } = elem?.getBoundingClientRect();

				const observer = new ResizeObserver(() => {
					applyTransform(
						innerSlides?.current,
						updatedDef?.length,
						currentRef?.current?.number,
						currentRef?.current.number,
					);
				});

				observer.observe(elem);

				observableList.current[index] = { observer, element: elem };

				if (index == updatedDef?.length - 1) {
					applyTransform(
						innerSlides.current,
						updatedDef?.length,
						currentRef?.current?.number,
						currentRef?.current?.number,
					);
				}

				acc.push({ ...each, width, height });
			} else {
				acc.push(each);
			}

			return acc;
		}, []);

		setChildrenDef(arr);
	};

	useEffect(() => {
		handleLoad();
		return () => {
			if (!observableList.current.length) return;
			for (let i = 0; i < observableList.current.length; i++) {
				if (!observableList.current[i]) continue;
				observableList.current[i].observer.unobserve(observableList.current[i].element);
			}
		};
	}, [fixedChild, noOfChilds, designType]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {}, []);

	const applyTransform = useCallback(
		(list: any, size: any, from: any, to: any, direction?: any, slidesToScroll?: any) => {
			if (!list) return;

			let left = 0,
				top = 0;
			let h = 0,
				w = 0;

			let width = 0,
				height = 0;
			width = 100 / (noOfChilds == 0 ? 1 : noOfChilds);
			height = 100 / (noOfChilds == 0 ? 1 : noOfChilds);

			for (let i = 0; i < size; i++) {
				let curr = (from + i) % size;
				if (!list[curr]) continue;
				list[curr].style.transition = 'none';
				const cr = list[curr].getBoundingClientRect();
				list[curr].style.left = `0`;
				list[curr].style.width = `100%`;
				list[curr].style.top = `0`;
				list[curr].style.height = `100%`;
				if (isVertical()) {
					list[curr].style.top = `${top}px`;
					list[curr].style.height = fixedChild ? `${height}%` : ``;
					top += cr.height;
					if (w < cr.width) w = cr.width;
				} else {
					list[curr].style.left = `${left}px`;
					list[curr].style.width = fixedChild ? `${width}%` : ``;
					left += cr.width;
					if (h < cr.height) h = cr.height;
				}
			}
			if (direction == -1) {
				let left = 0,
					top = 0;
				for (let i = 0; i < (slidesToScroll ?? 1); i++) {
					let curr = (from - i - 1 + size) % size;
					const cr = list[curr].getBoundingClientRect();
					if (isVertical()) {
						top -= cr.top;
						list[curr].style.top = `${top}px`;
					} else {
						left -= cr.width;
						list[curr].style.left = `${left}px`;
					}
				}
				setTimeout(() => {
					left = 0;
					top = 0;
					for (let i = 0; i < size; i++) {
						let curr = (to + i) % size;
						const cr = list[curr].getBoundingClientRect();
						if (isVertical()) {
							list[curr].style.transition = `top ${animationDuration}ms ${easing}`;
							list[curr].style.top = `${top}px`;
							top += cr.height;
						} else {
							list[curr].style.transition = `left ${animationDuration}ms ${easing}`;
							list[curr].style.left = `${left}px`;
							left += cr.width;
						}
					}
				}, 100);
			} else if (direction == 1) {
				let left = 0,
					top = 0;
				for (let i = 0; i < (slidesToScroll ?? 1); i++) {
					let curr = (from + i) % size;
					const cr = list[curr].getBoundingClientRect();
					if (isVertical()) {
						top -= cr.height;
					} else {
						left -= cr.width;
					}
				}
				setTimeout(() => {
					let right = 0,
						bottom = 0;
					for (let i = 0; i < size; i++) {
						if (left < 0) right++;
						if (top < 0) bottom++;
						let curr = (from + i) % size;
						const cr = list[curr].getBoundingClientRect();
						if (isVertical()) {
							list[curr].style.transition = `top ${animationDuration}ms ${easing}`;
							list[curr].style.top = `${top}px`;
							top += cr.height;
						} else {
							list[curr].style.transition = `left ${animationDuration}ms ${easing}`;
							list[curr].style.left = `${left}px`;
							left += cr.width;
						}
					}
				}, 100);
			}
			setTransitionFrom(undefined);
		},
		[
			currentRef.current,
			easing,
			animationType,
			fixedChild,
			noOfChilds,
			slidesToScroll,
			setCurrent,
			childrenDef,
			designType,
		],
	);

	const generateElem = useMemo(
		() => (carouselData: any) => {
			const childArray: any[] = !carouselData
				? []
				: Array.isArray(carouselData)
				? carouselData
				: [carouselData];
			if (currentRef.current.number >= childArray?.length) currentRef.current.number = 0;

			if (!childArray.length) {
				innerSlides.current.splice(0, innerSlides?.current.length);
				return;
			}
			return carouselData?.map((each: any, index: number) => (
				<div
					ref={(el: HTMLDivElement) => {
						innerSlides.current[index] = el;
					}}
					key={`${each?.key}_${index}`}
					className={`childElement ${isCenterMode() && center === index ? `center` : ``}`}
					style={resolvedStyles?.childElement ?? {}}
				>
					<SubHelperComponent
						definition={props?.definition}
						subComponentName="childElement"
					></SubHelperComponent>
					<Children
						children={each?.children}
						context={props?.context}
						pageDefinition={props?.pageDefinition}
						locationHistory={locationHistory}
						key={`${each?.key}_${index}`}
					/>
				</div>
			));
		},
		[
			childrenDef,
			currentRef.current,
			resolvedStyles?.childElement,
			props?.pageDefinition,
			designType,
			center,
		],
	);

	useEffect(() => {
		if (!autoPlay || (hover && pauseOnHover)) return;
		if (!updatedDef || updatedDef?.length <= 1) return;

		const handle = setInterval(
			() => {
				if (!isNullValue(transitionFrom)) return;
				const c = currentRef.current.number;
				currentRef.current.number = c + (slidesToScroll ?? 1);
				if (currentRef.current.number >= innerSlides.current.length)
					currentRef.current.number = 0;
				setTransitionFrom(c);
				applyTransform(
					innerSlides.current,
					updatedDef.length,
					c,
					currentRef.current.number,
					1,
					slidesToScroll,
				);
				if (firstTime) setFirstTime(false);
				setCurrent(currentRef?.current?.number);

				if (isCenterMode()) {
					setCenter((center + (slidesToScroll ?? 1)) % innerSlides?.current?.length);
				}
			},
			firstTime ? slideSpeed : slideSpeed + animationDuration + 220,
		);

		return () => clearInterval(handle);
	}, [updatedDef, slideSpeed, firstTime, setFirstTime, pauseOnHover, hover, setCurrent, center]);

	return (
		<div
			ref={ref}
			className={`comp compSmallCarousel ${designType} ${
				cssProp?.includes(arrowButtons) ? 'containerReverse' : 'container'
			} slideNav${slideNavButtonPosition}  arrowButtons${arrowButtons}`}
			style={resolvedStyles.comp ?? {}}
			onLoad={handleLoad}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<HelperComponent context={props?.context} definition={definition} />
			{showArrowButtons ? (
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
						className={` button ${
							isVertical()
								? 'fa-solid fa-chevron-up _vertical'
								: 'fa-solid fa-chevron-left'
						} ${arrowButtons === 'Middle' ? 'leftArrowButton' : ''}`}
						style={resolvedStyles.arrowButtons ?? {}}
						onClick={() => {
							const c = currentRef.current.number;
							if (!isNullValue(transitionFrom)) return;
							currentRef.current.number = c - (slidesToScroll ?? 1);
							if (currentRef.current.number < 0)
								currentRef.current.number =
									(updatedDef.length ?? 0) - (slidesToScroll ?? 1);
							setTransitionFrom(c);
							setCurrent(c);
							if (isCenterMode()) {
								setCenter(
									(center - (slidesToScroll ?? 1)) % innerSlides?.current?.length,
								);
							}
							applyTransform(
								innerSlides.current,
								updatedDef.length,
								c,
								currentRef.current.number,
								-1,
								slidesToScroll,
							);
						}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="arrowButtons"
						></SubHelperComponent>
					</i>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="leftArrowButtonContainer"
					></SubHelperComponent>

					<i
						className={` button ${
							isVertical()
								? 'fa-solid fa-chevron-down _vertical'
								: 'fa-solid fa-chevron-right'
						} ${arrowButtons === 'Middle' ? 'rightArrowButton' : ''}`}
						style={resolvedStyles.arrowButtons ?? {}}
						onClick={() => {
							if (!isNullValue(transitionFrom)) return;
							const c = currentRef.current.number;
							currentRef.current.number = c + (slidesToScroll ?? 1);
							if (currentRef.current.number >= innerSlides.current.length)
								currentRef.current.number = 0;
							setTransitionFrom(c);
							setCurrent(c);
							if (isCenterMode()) {
								setCenter(
									(center + (slidesToScroll ?? 1)) % innerSlides?.current?.length,
								);
							}
							applyTransform(
								innerSlides.current,
								updatedDef.length,
								c,
								currentRef.current.number,
								1,
								slidesToScroll,
							);
						}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="arrowButtons"
						></SubHelperComponent>
					</i>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="rightArrowButtonContainer"
					></SubHelperComponent>
				</div>
			) : undefined}
			<div
				className={`innerDivSlideNav ${`slideNavDiv${
					cssProp.includes(slideNavButtonPosition)
						? slideNavButtonPosition
						: 'innerDivSlideNav'
				}`}`}
				style={resolvedStyles?.innerDivSlideNav ?? {}}
			>
				<SubHelperComponent
					definition={props?.definition}
					subComponentName="innerDivSlideNav"
				></SubHelperComponent>
				<div
					className={`containerInnerDiv ${isVertical() ? '_vertical' : ''}`}
					style={resolvedStyles?.containerInnerDiv ?? {}}
				>
					{generateElem(updatedDef)}
					<SubHelperComponent
						definition={props?.definition}
						subComponentName="containerInnerDiv"
					></SubHelperComponent>
				</div>

				<div
					className={`slideButtonsContainer slideNavDiv${slideNavButtonPosition} ${
						cssProp.includes(slideNavButtonPosition) ? 'slideNavDiv' : ''
					} ${showNavigationControlsOnHover ? (hover ? 'showFlex' : 'hide') : ''}`}
					style={resolvedStyles.slideButtonsContainer ?? {}}
					ref={buttonRef}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="slideButtonsContainer"
					></SubHelperComponent>
					{showDotsButtons &&
						(updatedDef ?? []).map((e: any, key: any) => (
							<button
								key={`${key}_${currentRef?.current?.number}_${e?.key}`}
								className={`slideNav ${
									dotsButtonType !== 'none' && hasNumbersInSlideNav === false
										? `fa-${dotsButtonIconType} fa-${dotsButtonType}`
										: ` `
								} ${hasNumbersInSlideNav ? `${dotsButtonType}WithNumbers` : ''} ${
									key === currentRef?.current?.number ? 'active' : ''
								}`}
								style={resolvedStyles.dotButtons ?? {}}
								onClick={() => {
									if (!isNullValue(transitionFrom)) return;
									if (key == currentRef.current.number) return;

									const c = currentRef?.current.number;
									currentRef.current.number = key;

									const toScroll =
										currentRef.current.number > c
											? currentRef.current.number - c
											: c - currentRef.current.number;
									const dir =
										currentRef.current.number - c > slidesToScroll ? 1 : -1;
									setTransitionFrom(toScroll);
									setCurrent(c);
									if (isCenterMode()) {
										setCenter(
											currentRef.current.number > c
												? (center + toScroll) % innerSlides?.current?.length
												: (center -
														toScroll +
														innerSlides?.current?.length) %
														innerSlides?.current?.length,
										);
									}
									applyTransform(
										innerSlides.current,
										updatedDef.length,
										c,
										currentRef.current.number,
										dir,
										toScroll,
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
		{
			name: 'slideNavDiv',
			displayName: 'Slide Wrapper Grid',
			description: 'Slder Wapper for navigation button and slider',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'containerInnerDiv',
			displayName: 'Slide Container',
			description: 'Slder Wapper for Slider',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'childElement',
			displayName: 'Container Items',
			description: 'Each Slides in the Slider',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
