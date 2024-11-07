import React, { useState, useEffect, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import GalleryStyle from './GalleryStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './galleryProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import { styleDefaults } from './galleryStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';
import { getRenderData } from '../util/getRenderData';

function Gallery(props: ComponentProps) {
	const [isActive, setIsActive] = useState(false);
	const [startingImageSrc, setStartingImageSrc] = useState();
	const {
		definition: { bindingPath, bindingPath2 },
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			selectionKey,
			datatype,
			data,
			showClose,
			closeOnEscape,
			closeOnOutsideClick,
			zoom,
			zoomInFactor,
			fullScreen,
			showArrowButtons,
			arrowButtons,
			previewMode,
			position,
			easing,
			autoPlay,
			slideSpeed,
			animationType,
			animationDuration,
			showInDesign,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, props.locationHistory, pageExtractor);
	const bindingPathPath2 =
		bindingPath2 && getPathFromLocation(bindingPath2, props.locationHistory, pageExtractor);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setIsActive(!!value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	useEffect(() => {
		if (!bindingPathPath2) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setStartingImageSrc(value);
			},
			pageExtractor,
			bindingPathPath2,
		);
	}, []);

	const galleryData = React.useMemo(
		() =>
			Array.from(
				getRenderData(data, datatype, 'RANDOM', '', 'KEY', selectionKey)
					.reduce((acc: Map<string, any>, each: any) => {
						if (isNullValue(each?.key)) return acc;

						acc.set(each.key, { key: each.key, src: each.value });

						return acc;
					}, new Map())
					.values(),
			),
		[data, datatype, selectionKey],
	);

	const [showPreivew, setShowPreview] = useState(false);
	const [showThumbnail, setShowThumbnail] = useState(true);
	const [slideShow, setSlideShow] = useState(false);
	const [transitionFrom, setTransitionFrom] = useState<number | undefined>(undefined);
	const [slideNum, setSlideNum] = useState<number>(0);
	const [firstTime, setFirstTime] = useState(true);
	const [isZoomed, setIsZoomed] = useState(false);
	const galleryRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	const handleClose = useCallback(() => {
		if (!bindingPathPath) return;

		setData(bindingPathPath, false, props.context?.pageName);
	}, []);

	const handleCloseOnOutsideClick = closeOnOutsideClick ? handleClose : undefined;

	const handleBubbling = (e: any) => {
		e.stopPropagation();
	};

	useEffect(() => {
		const escapeHandler = (event: any) => {
			if (event.key === 'Escape') {
				handleClose();
			}
		};
		if (isActive && closeOnEscape) {
			document.body.addEventListener('keyup', escapeHandler);
		}
		return () => {
			document.body.removeEventListener('keyup', escapeHandler);
		};
	}, [isActive, handleClose]);

	const getStartingImageIndex = () => {
		let ind = galleryData.findIndex((e: any) => e.src === startingImageSrc);
		if (ind === -1) return 0;
		return ind;
	};

	useEffect(() => {
		setSlideNum(getStartingImageIndex());
	}, [startingImageSrc]);

	useEffect(() => {
		if (!slideShow) return;
		if (!galleryData || galleryData?.length <= 1) return;
		const handle = setTimeout(
			() => {
				setTransitionFrom(slideNum);
				setSlideNum((slideNum + 1) % galleryData.length);
				setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
				if (firstTime) setFirstTime(false);
			},
			firstTime ? slideSpeed : slideSpeed + animationDuration + 220,
		);
		return () => clearTimeout(handle);
	}, [galleryData, slideNum, setSlideNum, slideSpeed, firstTime, setFirstTime, slideShow]);

	const currentSlide = useRef<HTMLDivElement>(null);
	const previousSlide = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!currentSlide.current || isNullValue(transitionFrom)) return;
		setTimeout(() => {
			if (!currentSlide.current || isNullValue(transitionFrom)) return;
			currentSlide.current!.className = `_eachSlide _current _${animationType} _${animationType}Start ${
				slideNum - transitionFrom! + 1 == galleryData.length ||
				(slideNum - transitionFrom! < 0 &&
					slideNum - transitionFrom! - 1 != -galleryData.length)
					? '_reverse'
					: ''
			}`;

			if (
				animationType == 'fadeoutin' ||
				animationType == 'crossover' ||
				animationType == 'slide'
			) {
				previousSlide.current!.className = `_eachSlide _previous _${animationType} _${animationType}Start ${
					slideNum - transitionFrom! + 1 == galleryData.length ||
					(slideNum - transitionFrom! < 0 &&
						slideNum - transitionFrom! - 1 != -galleryData.length)
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
	if (galleryData?.length) {
		if (!isNullValue(transitionFrom)) {
			showChildren = [
				<div
					className={`_eachSlide _previous _${animationType} ${
						slideNum - transitionFrom! + 1 == galleryData.length ||
						(slideNum - transitionFrom! < 0 &&
							slideNum - transitionFrom! - 1 != -galleryData.length)
							? '_reverse'
							: ''
					}`}
					key={galleryData[transitionFrom!].key}
					style={prevStyle}
					ref={previousSlide}
				>
					<img
						className="_slideImage"
						style={resolvedStyles?.slideImage ?? {}}
						src={getSrcUrl(galleryData[transitionFrom!].src)}
						alt="previousSlide"
					/>
					<SubHelperComponent
						style={resolvedStyles.slideImage ?? {}}
						className="_slideImage"
						definition={props.definition}
						subComponentName="slideImage"
					/>
				</div>,
				<div
					className={`_eachSlide _current _${animationType} ${
						slideNum - transitionFrom! + 1 == galleryData.length ||
						(slideNum - transitionFrom! < 0 &&
							slideNum - transitionFrom! - 1 != -galleryData.length)
							? '_reverse'
							: ''
					}`}
					key={galleryData[slideNum].key}
					style={style}
					ref={currentSlide}
				>
					<img
						className="_slideImage"
						style={resolvedStyles?.slideImage ?? {}}
						src={getSrcUrl(galleryData[slideNum!].src)}
						alt="CurrentSlide"
					/>
					<SubHelperComponent
						style={resolvedStyles.slideImage ?? {}}
						className="_slideImage"
						definition={props.definition}
						subComponentName="slideImage"
					/>
				</div>,
			];
		} else {
			showChildren = [
				<div
					className="_eachSlide _previous"
					key={galleryData[slideNum!].key}
					onClick={handleBubbling}
				>
					<img
						className="_slideImage"
						style={resolvedStyles?.slideImage ?? {}}
						src={getSrcUrl(galleryData[slideNum!].src)}
						alt="displayedImage"
						ref={imageRef}
						onClick={event => {
							zoom && handleImageClick(event);
						}}
					/>
					<SubHelperComponent
						style={resolvedStyles.slideImage ?? {}}
						className="_slideImage"
						definition={props.definition}
						subComponentName="slideImage"
					/>
				</div>,
			];
		}
	}

	const prevImage = () => {
		if (!isNullValue(transitionFrom)) return;
		setTransitionFrom(slideNum);
		setSlideNum(slideNum == 0 ? galleryData.length - 1 : slideNum - 1);
		setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
	};

	const nextImage = () => {
		if (!isNullValue(transitionFrom)) return;
		setTransitionFrom(slideNum);
		setSlideNum(slideNum + 1 >= galleryData.length ? 0 : slideNum + 1);
		setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
	};

	const selectedImage = (index: number) => {
		if (!isNullValue(transitionFrom)) return;
		setTransitionFrom(slideNum);
		setSlideNum(index);
		setTimeout(() => setTransitionFrom(undefined), animationDuration + 120);
	};

	useEffect(() => {
		if (isActive) {
			document.body.addEventListener('fullscreenchange', () => {});
		}
		return () => document.body.removeEventListener('fullscreenchange', () => {});
	}, [isActive]);

	const toogleFullscreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			galleryRef.current?.requestFullscreen();
		}
	};

	useEffect(() => {
		if (imageRef.current) {
			if (zoom) imageRef.current.style.cursor = 'zoom-in';
			else imageRef.current.style.cursor = 'default';
		}
	}, [zoom]);

	function zoomIn(clickImage: boolean, clientX: number, clientY: number) {
		imageRef.current?.classList.add('zoomed');
		if (imageRef.current) {
			imageRef.current.style.transformOrigin = clickImage
				? `${clientX}px ${clientY}px`
				: 'center';
			imageRef.current.style.transform = `scale(${zoomInFactor})`;
			imageRef.current.style.cursor = 'zoom-out';
		}
	}

	function zoomOut() {
		imageRef.current?.classList.remove('zoomed');
		if (imageRef.current) {
			imageRef.current.style.transform = 'none';
			imageRef.current.style.cursor = 'zoom-in';
		}
	}

	const handleImageClick = (event: any) => {
		setSlideShow(false);
		if (imageRef.current?.classList.contains('zoomed')) {
			zoomOut();
			setIsZoomed(false);
		} else {
			zoomIn(true, event.clientX, event.clientY);
			setIsZoomed(true);
		}
	};

	const handleZoomIconClick = () => {
		setSlideShow(false);
		if (imageRef.current?.classList.contains('zoomed')) {
			zoomOut();
			setIsZoomed(false);
		} else {
			zoomIn(false, 0, 0);
			setIsZoomed(true);
		}
	};

	const previewCloseIcon = (
		<i
			style={resolvedStyles.previewCloseButton ?? {}}
			className="fa-solid fa-xmark"
			onClick={() => setShowPreview(false)}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="previewCloseButton"
			/>
		</i>
	);

	const zoomIcon = zoom ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-magnifying-glass"
			onClick={() => handleZoomIconClick()}
			key="zoom"
		>
			<SubHelperComponent definition={props.definition} subComponentName="toolbarButton" />
		</i>
	) : null;

	const autoPlayIcon = autoPlay ? (
		<>
			{!slideShow ? (
				<i
					style={resolvedStyles.toolbarButton ?? {}}
					className="fa-solid fa-play"
					onClick={() => setSlideShow(true)}
					key="play"
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="toolbarButton"
					/>
				</i>
			) : (
				<i
					style={resolvedStyles.toolbarButton ?? {}}
					className="fa-solid fa-pause"
					onClick={() => setSlideShow(false)}
					key="pause"
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="toolbarButton"
					/>
				</i>
			)}
		</>
	) : null;

	const fullScreenIcon = fullScreen ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-expand"
			onClick={() => toogleFullscreen()}
			key="fullscreen"
		>
			<SubHelperComponent definition={props.definition} subComponentName="toolbarButton" />
		</i>
	) : null;

	const thumbnailIcon =
		previewMode === 'Thumbnail' ? (
			<i
				style={resolvedStyles.toolbarButton ?? {}}
				className="fa-solid fa-grip-vertical"
				onClick={() => setShowThumbnail(!showThumbnail)}
				key="thumbnail"
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="toolbarButton"
				/>
			</i>
		) : null;

	const previewIcon =
		previewMode === 'Preview' ? (
			<i
				style={resolvedStyles.toolbarButton ?? {}}
				className="fa-solid fa-list"
				onClick={() => setShowPreview(!showPreivew)}
				key="preview"
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="toolbarButton"
				/>
			</i>
		) : null;

	const closeIcon = showClose ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-xmark"
			onClick={handleClose}
			key="close"
		>
			<SubHelperComponent definition={props.definition} subComponentName="toolbarButton" />
		</i>
	) : null;

	const galleryTools = (
		<>
			{zoomIcon}
			{autoPlayIcon}
			{fullScreenIcon}
			{thumbnailIcon}
			{previewIcon}
			{closeIcon}
		</>
	);

	const thumbnailComp =
		previewMode === 'Thumbnail' ? (
			<div
				className={`_thumbnailContainer _thumbnail${position} ${
					!showThumbnail ? `_hide${position}` : ''
				} ${isZoomed ? '_imageZoomed' : ''}`}
				style={resolvedStyles?.thumbnailContainer ?? {}}
				onClick={handleBubbling}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="_thumbnailContainer"
				/>
				{galleryData?.map((each: any, index: number) => (
					<div
						className={`_thumbnailImageDiv ${slideNum === index ? '_selected' : ''}`}
						style={resolvedStyles?.thumbnailImageDiv ?? {}}
						onClick={() => selectedImage(index)}
						key={each.key}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="_thumbnailImageDiv"
						/>
						<img
							src={getSrcUrl(each?.src)}
							alt={`${each?.name}}`}
							className="_thumbnailImage"
							style={resolvedStyles?.thumbnailImage ?? {}}
						/>
						<SubHelperComponent
							style={resolvedStyles.thumbnailImage ?? {}}
							className="_thumbnailImage"
							definition={props.definition}
							subComponentName="thumbnailImage"
						/>
					</div>
				))}
			</div>
		) : null;

	const previewComp =
		previewMode === 'Preview' ? (
			<div
				className={`_previewContainer _${position} ${
					showPreivew ? `_show${position}` : ''
				}`}
				style={resolvedStyles.previewContainer ?? {}}
				onClick={handleBubbling}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="previewContainer"
				/>
				<div className={`_previewCloseIcon ${!showPreivew ? `_hide${position}` : ''}`}>
					{previewCloseIcon}
				</div>
				<div
					className={`_previewList _${position} ${
						!showPreivew ? `_hide${position}` : ''
					}`}
					style={resolvedStyles.previewList ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="previewList"
					/>
					{galleryData?.map((each: any, index: number) => (
						<div
							className={`_previewImageDiv _${position} ${
								slideNum === index ? '_selected' : ''
							}`}
							style={resolvedStyles.previewImageDiv ?? {}}
							onClick={() => selectedImage(index)}
							key={each.key}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="previewImageDiv"
							/>
							<img
								src={getSrcUrl(each?.src)}
								alt={`${each?.name}}`}
								className="_previewImage"
								style={resolvedStyles.previewImage ?? {}}
							/>
							<SubHelperComponent
								style={resolvedStyles.previewImage ?? {}}
								className="_previewImage"
								definition={props.definition}
								subComponentName="previewImage"
							/>
						</div>
					))}
				</div>
			</div>
		) : null;

	if (isActive || (isDesignMode && showInDesign === true)) {
		return (
			<Portal>
				<div
					className="comp compGallery"
					onClick={handleCloseOnOutsideClick}
					style={resolvedStyles.comp ?? {}}
					ref={galleryRef}
				>
					<HelperComponent context={props.context} definition={props.definition} />
					<div className={`_mainContainer _preview${position}`}>
						<div className={`_galleryContainer _thumbnail${position}`}>
							<div className={`_galleryToolbar`} onClick={handleBubbling}>
								<div
									className="_leftColumn"
									style={resolvedStyles.toolbarLeftColumn ?? {}}
								>
									{`${slideNum + 1} / ${galleryData?.length}`}
									<SubHelperComponent
										definition={props.definition}
										subComponentName="toolbarLeftColumn"
									/>
								</div>
								<div
									className="_rightColumn"
									style={resolvedStyles.toolbarRightColumn ?? {}}
								>
									{galleryTools}
									<SubHelperComponent
										definition={props.definition}
										subComponentName="toolbarRightColumn"
									/>
								</div>
							</div>
							<div
								className={`_imageSliderContainer ${
									isZoomed ? '_imageZoomed' : ''
								}`}
								style={resolvedStyles?.imageSliderContainer ?? {}}
							>
								{showArrowButtons && (
									<div
										className={`_arrowButtonsContainer ${arrowButtons}`}
										style={resolvedStyles.arrowButtonsContainer ?? {}}
										onClick={handleBubbling}
									>
										<i
											className={`fa-solid fa-chevron-left _button`}
											style={resolvedStyles.arrowButtons ?? {}}
											onClick={() => prevImage()}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="arrowButtons"
											/>
										</i>
										<i
											className={` fa-solid fa-chevron-right _button`}
											style={resolvedStyles.arrowButtons ?? {}}
											onClick={() => nextImage()}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="arrowButtons"
											/>
										</i>
									</div>
								)}
								{showChildren}
							</div>
							{thumbnailComp}
						</div>
						{previewComp}
					</div>
				</div>
			</Portal>
		);
	}
	return <></>;
}

const component: Component = {
	order: 12,
	name: 'Gallery',
	displayName: 'Gallery',
	description: 'Gallery component',
	component: Gallery,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GalleryStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Toggle Binding' },
		bindingPath2: { name: 'Starting Image Source Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Gallery',
		name: 'Gallery',
	},
	needShowInDesginMode: true,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 46 33">
					<path
						className="_gallerymainframe"
						d="M45.355 31L45.355 21.1611C45.355 20.0566 44.4596 19.1611 43.355 19.1611L2.64479 19.1611C1.54023 19.1611 0.644794 20.0566 0.644794 21.1611L0.644794 31C0.644794 32.1046 1.54022 33 2.64479 33L43.355 33C44.4595 33 45.355 32.1046 45.355 31Z"
						fill="url(#paint0_linear_3782_8677)"
					/>
					<path
						className="_gallerysecondframe"
						d="M42.1616 13.9677L42.1616 11.5806C42.1616 10.476 41.2662 9.58057 40.1616 9.58057L5.8386 9.58056C4.73404 9.58056 3.8386 10.476 3.8386 11.5806L3.8386 13.9677C3.8386 15.0723 4.73404 15.9677 5.8386 15.9677L40.1616 15.9677C41.2662 15.9677 42.1616 15.0723 42.1616 13.9677Z"
						fill="url(#paint1_linear_3782_8677)"
					/>
					<path
						className="_galleryfirstframe"
						d="M36.8389 4.38693L36.8389 1.99976C36.8389 0.895186 35.9434 -0.00024418 34.8389 -0.000244228L11.1611 -0.000245263C10.0566 -0.000245311 9.16113 0.895183 9.16113 1.99975L9.16113 4.38692C9.16113 5.49149 10.0566 6.38692 11.1611 6.38692L34.8389 6.38693C35.9434 6.38693 36.8389 5.4915 36.8389 4.38693Z"
						fill="url(#paint2_linear_3782_8677)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3782_8677"
							x1="22.9999"
							y1="19.1611"
							x2="22.9999"
							y2="33"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#BEADFA" />
							<stop offset="1" stopColor="#AC94FF" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3782_8677"
							x1="23.0001"
							y1="9.58057"
							x2="23.0001"
							y2="15.9677"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3782_8677"
							x1="23"
							y1="-0.000244746"
							x2="23"
							y2="6.38693"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'toolbarLeftColumn',
			displayName: 'Toolbar Left Column',
			description: 'Toolbar Left Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarRightColumn',
			displayName: 'Toolbar Right Column',
			description: 'Toolbar Right Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarButton',
			displayName: 'Toolbar Button',
			description: 'Toolbar Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideImage',
			displayName: 'Slide Image',
			description: 'Slide Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailContainer',
			displayName: 'Thumbnail Container',
			description: 'Thumbnail Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImageDiv',
			displayName: 'Thumbnail Image Div',
			description: 'Thumbnail Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImage',
			displayName: 'Thumbnail Image',
			description: 'Thumbnail Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewContainer',
			displayName: 'Preview Container',
			description: 'Preview Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewCloseButton',
			displayName: 'Preview Close Button',
			description: 'Preview Close Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewList',
			displayName: 'Preview List',
			description: 'Preview List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImageDiv',
			displayName: 'Preview Image Div',
			description: 'Preview Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImage',
			displayName: 'Preview Image',
			description: 'Preview Image',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
