import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
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
import { flattenUUID } from '../util/uuid';
import { shortUUID } from '../../util/shortUUID';
import { updateLocationForChild } from '../util/updateLoactionForChild';

// css Class Props for different position of the navbar and arrow buttons
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
	const {
		locationHistory = [],
		definition: { children, bindingPath, key },
		pageDefinition,
		context,
		definition,
	} = props;
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			showDotsButtons,
			showArrowButtons,
			slideSpeed,
			autoPlay,
			animationDuration,
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
			defaultData,
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
	const [hover, setHover] = useState<boolean>(false);
	const innerSlides = useRef<any>([]);
	const observableList = useRef<any>([]);
	const [_, setCurrent] = useState<any>(false);
	const currentRef = useRef<any>({ number: 0 });
	const [firstTime, setFirstTime] = useState(true);
	const [center, setCenter] = useState(Math.floor(noOfChilds / 2));
	const [value, setValue] = React.useState<any[]>([]);
	const indKeys = React.useRef<{
		array: Array<string>;
		oldKeys: Array<{ object: any; key: string }>;
	}>({ array: [], oldKeys: [] });

	// checking is the vertical style is selected.
	const isVertical = () => {
		return ['_design3', '_design4'].includes(designType);
	};

	//  checking if the center mode design is selected.
	const isCenterMode = () => {
		return ['_design2', '_design4'].includes(designType);
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	// array binding path for a repeater.
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: `Store.defaultData.${pageExtractor?.getPageName() ?? '_global'}.${flattenUUID(key)}`;

	useEffect(() => {
		setData(bindingPathPath!, defaultData, context?.pageName);
	}, [defaultData]);

	// checking if we have objects values which are duplicate so, we don't assign the unique key to that again.
	useEffect(() => {
		if (!bindingPathPath || !indKeys.current) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, _v) => {
				setValue(_v ?? []);
				if (!_v?.length) return;

				const duplicateCheck = new Array<{ object: any; occurance: number }>();
				for (let i = 0; i < _v.length; i++) {
					let oldIndex = -1;

					let duplicate = duplicateCheck.find(e => deepEqual(e.object, _v[i]));

					if (!duplicate) {
						duplicate = { object: _v[i], occurance: 1 };
						duplicateCheck.push(duplicate);
					} else {
						duplicate.occurance++;
					}

					let occurance = duplicate.occurance;
					let count = -1;
					for (let oldIndexObject of indKeys.current.oldKeys) {
						count++;
						if (!deepEqual(oldIndexObject.object, _v[i])) continue;
						occurance--;
						if (occurance !== 0) continue;
						oldIndex = count;
						break;
					}

					if (oldIndex === -1) {
						indKeys.current.array[i] = shortUUID();
						if (_v[i] !== undefined && _v[i] !== null)
							indKeys.current.oldKeys.push({
								object: _v[i],
								key: indKeys.current.array[i],
							});
					} else {
						indKeys.current.array[i] = indKeys.current.oldKeys[oldIndex].key;
					}
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, indKeys.current]);

	// accepting the children or childrens for the component
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
	}, [props?.definition?.children, ref?.current, bindingPathPath, defaultData]);

	// trying to get the first truthy child within an object.
	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	// on load of the images we are attaching the resize observer to each elem, and then storing it in observableList so we can unobserve it.
	const handleLoad = () => {
		innerSlides?.current?.forEach((elem: any, index: number) => {
			if (elem) {
				const observer = new ResizeObserver(() => {
					applyTransform(
						innerSlides?.current,
						innerSlides?.current?.length,
						currentRef?.current?.number,
						currentRef?.current.number,
					);
				});

				observer.observe(elem);
				observableList.current[index] = { observer, element: elem };
			}
		});
	};

	// used for unobserving the div's
	useEffect(() => {
		handleLoad();
		return () => {
			for (let i = 0; i < observableList.current.length; i++) {
				if (observableList.current[i]) {
					observableList.current[i].observer.unobserve(observableList.current[i].element);
				}
			}
		};
	}, [fixedChild, noOfChilds, designType, value]);

	// applying the main transformation
	const applyTransform = useCallback(
		(list: any, size: any, from: any, to: any, direction?: any, slidesToScroll?: any) => {
			if (!list) return;

			// left for horizontal mode and top for vertical.
			let left = 0,
				top = 0;

			let width = 0,
				height = 0;

			//initilizing the width if we have center mode, we need to adjust the children sizes, as the middle one is scaled in to 1.1.
			width =
				(isCenterMode()
					? 100 -
					  (innerSlides?.current?.length - noOfChilds == 0
							? noOfChilds * 1.1
							: innerSlides?.current?.length - noOfChilds + 1) /
							1.1
					: 100) / (noOfChilds == 0 ? 1 : noOfChilds);
			height =
				(isCenterMode()
					? 100 -
					  (innerSlides?.current?.length - noOfChilds == 0
							? noOfChilds * 1.1
							: innerSlides?.current?.length - noOfChilds + 1) /
							1.1
					: 100) / (noOfChilds == 0 ? 1 : noOfChilds);

			//lopping and displaying the childrens whenever the applytransform is called first.
			for (let i = 0; i < size; i++) {
				let curr = (from + i) % size;
				if (!list[curr]) continue;
				list[curr].style.transition = 'none';
				const cr = list[curr].getBoundingClientRect();
				// initilizating the values before head it self, so there is no side effects when the slider first loads
				list[curr].style.left = `0`;
				list[curr].style.width = `100%`;
				list[curr].style.top = `0`;
				list[curr].style.height = `100%`;
				if (isVertical()) {
					list[curr].style.top = `${top}px`;
					list[curr].style.height = fixedChild ? `${height}%` : ``;
					top += cr.height;
				} else {
					list[curr].style.left = `${left}px`;
					list[curr].style.width = fixedChild ? `${width}%` : ``;
					left += cr.width;
				}
			}

			// when we move to previous slide.
			if (direction == -1) {
				let left = 0,
					top = 0;
				for (let i = 0; i < (slidesToScroll ?? 1); i++) {
					let curr = (from - i - 1 + size) % size;
					const cr = list[curr].getBoundingClientRect();
					if (isVertical()) {
						top -= cr.height;
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
				// when we move to the next slide.
			} else if (direction == 1) {
				let left = 0,
					top = 0,
					removedComponent: Array<any> = [];

				for (let i = 0; i < (slidesToScroll ?? 1); i++) {
					let curr = (from + i) % size;
					const cr = list[curr].getBoundingClientRect();
					if (isVertical()) {
						top -= cr.height;
					} else {
						left -= cr.width;
					}

					removedComponent.push(curr);
					list[curr].style.left = `${ref.current?.getBoundingClientRect().width}px`;
				}

				setTimeout(() => {
					for (let i = 0; i < size; i++) {
						let curr = (from + i) % size;
						const cr = list[curr].getBoundingClientRect();

						if (isVertical()) {
							list[curr].style.top = `${top}px`;
							list[curr].style.transition = `top ${animationDuration}ms ${easing}`;
							top += cr.height;
						} else {
							list[curr].style.left = `${left}px`;
							list[curr].style.transition = `left ${animationDuration}ms ${easing}`;
							left += cr.width;
						}
					}
				}, 0);

				setTimeout(() => {
					for (let i = 0; i < removedComponent?.length; i++) {
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
		},
		[
			currentRef.current,
			easing,
			fixedChild,
			noOfChilds,
			slidesToScroll,
			setCurrent,
			designType,
		],
	);

	// generate the elements when the children is changed or added
	const generateElem = useMemo(
		() => (carouselData: any) => {
			const { definition, context, pageDefinition } = props;
			// check if we are passing the bindingPath or default value.
			const childrenArray =
				Array.isArray(value) && value?.length > 0
					? value
					: Array.isArray(carouselData)
					? carouselData
					: [carouselData];

			// if we reach the end of the slide it will get inililized to 0, i.e first slide again.
			if (currentRef.current.number >= childrenArray?.length) currentRef.current.number = 0;

			// if we are removing the childs this will remove the ref's from the array of thre removed children to prevent it from throwing error.
			if (!childrenArray.length) {
				innerSlides.current?.splice(0, innerSlides?.current?.length);
				return;
			}

			if (Array.isArray(value) && value.length) {
				let updatableBindingPath = bindingPath;
				if (!updatableBindingPath && defaultData) {
					updatableBindingPath = {
						type: 'VALUE',
						value: `Store.defaultData.${
							pageExtractor?.getPageName() ?? '_global'
						}.${flattenUUID(key)}`,
					};
				}

				// if we are using binding path or defaultValue then return this
				return value.map((e: any, index) => (
					<div
						ref={el => {
							innerSlides.current[index] = el;
						}}
						key={`${index}`}
						className={`childElement ${
							isCenterMode() && center === index ? 'center' : ''
						}`}
						style={resolvedStyles?.childElement ?? {}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="childElement"
						/>
						<Children
							pageDefinition={pageDefinition}
							children={firstchild}
							context={context}
							locationHistory={[
								...locationHistory,
								updateLocationForChild(
									updatableBindingPath!,
									index,
									locationHistory,
									context.pageName,
									pageExtractor,
								),
							]}
						/>
					</div>
				));
			}
			// if we had added childrens directly.
			return childrenArray.map((each, index) => (
				<div
					ref={el => {
						innerSlides.current[index] = el;
					}}
					key={`${index}`}
					className={`childElement ${isCenterMode() && center === index ? 'center' : ''}`}
					style={resolvedStyles?.childElement ?? {}}
				>
					<SubHelperComponent definition={definition} subComponentName="childElement" />
					<Children
						children={each?.children}
						context={context}
						pageDefinition={pageDefinition}
						locationHistory={locationHistory}
						key={`${index}`}
					/>
				</div>
			));
		},
		[
			currentRef.current,
			resolvedStyles?.childElement,
			pageDefinition,
			designType,
			center,
			value,
		],
	);

	useEffect(() => {
		// onhover stop autoplay
		if (!autoPlay || (hover && pauseOnHover)) return;
		// we check if the updateDef is empty or not, or innerSlides refs is empty then return
		if (!updatedDef || innerSlides?.current?.length <= 1) return;

		// for autoplay
		const handle = setInterval(
			() => {
				const c = currentRef.current.number;
				currentRef.current.number = c + (slidesToScroll ?? 1);
				if (currentRef.current.number >= innerSlides.current.length)
					currentRef.current.number = 0;
				applyTransform(
					innerSlides.current,
					innerSlides?.current?.length,
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
	}, [
		updatedDef,
		slideSpeed,
		firstTime,
		setFirstTime,
		pauseOnHover,
		hover,
		setCurrent,
		center,
		value,
	]);

	const handleArrowButtonClick = (direction: any) => {
		const c = currentRef.current.number;
		const increment = direction === 'left' ? -1 : 1;
		currentRef.current.number =
			(c + increment * slidesToScroll + innerSlides?.current?.length) %
			innerSlides?.current?.length;

		setCurrent(c);
		if (isCenterMode()) {
			setCenter((center + increment) % innerSlides?.current?.length);
		}
		applyTransform(
			innerSlides.current,
			innerSlides?.current?.length,
			c,
			currentRef.current.number,
			increment,
			slidesToScroll,
		);
	};

	const arrowButtonComp = (
		<>
			<div
				className={`arrowButtonsContainer ${hover ? `hover` : ``} ${
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
					onClick={() => handleArrowButtonClick('left')}
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
					onClick={() => handleArrowButtonClick('right')}
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
		</>
	);

	const slideButtonContainer = (
		<div
			className={`slideButtonsContainer slideNavDiv${slideNavButtonPosition} ${
				cssProp.includes(slideNavButtonPosition) ? 'slideNavDiv' : ''
			} ${showNavigationControlsOnHover ? (hover ? 'showFlex' : 'hide') : ''}`}
			style={resolvedStyles.slideButtonsContainer ?? {}}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="slideButtonsContainer"
			></SubHelperComponent>
			{showDotsButtons &&
				(value?.length > 0 ? value : updatedDef)?.map((e: any, key: any) => (
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
							if (key == currentRef.current.number) return;

							const c = currentRef?.current.number;
							currentRef.current.number = key;

							const toScroll = Math.abs(currentRef.current.number - c);
							const dir = c > currentRef.current.number ? -1 : 1;

							setCurrent(c);
							if (isCenterMode()) {
								setCenter(
									c <= currentRef.current.number
										? (center + toScroll) % innerSlides?.current?.length
										: (center - toScroll + innerSlides?.current?.length) %
												innerSlides?.current?.length,
								);
							}
							applyTransform(
								innerSlides.current,
								innerSlides?.current?.length,
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
	);

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
			{showArrowButtons ? arrowButtonComp : undefined}
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

				{slideButtonContainer}
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
	bindingPaths: {
		bindingPath: { name: 'Array Binding' },
	},
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
