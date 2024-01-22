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
import GalleryStyles from './GalleryStyles';
import { propertiesDefinition, stylePropertiesDefinition } from './galleryProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import { styleDefaults } from './galleryStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';

function Gallery(props: ComponentProps) {
	const [isActive, setIsActive] = useState(false);
	const [startingImage, setStartingImage] = useState<
		{ keyName: string; value: string } | undefined
	>(undefined);
	const {
		definition: { bindingPath, bindingPath2 },
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			galleryData,
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
				setStartingImage(value);
			},
			pageExtractor,
			bindingPathPath2,
		);
	}, []);

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
		let ind = 0;
		if (startingImage) {
			galleryData?.forEach((el: any, index: number) => {
				if (el[`${startingImage?.keyName}`] === startingImage?.value) ind = index;
			});
		}
		return ind;
	};

	useEffect(() => {
		setSlideNum(getStartingImageIndex());
	}, [startingImage]);

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
					key={galleryData[transitionFrom!][`${startingImage?.keyName}`]}
					style={prevStyle}
					ref={previousSlide}
				>
					<img
						className="slideImage"
						style={resolvedStyles?.slideImage ?? {}}
						src={getSrcUrl(galleryData[transitionFrom!].src)}
						alt="previousSlide"
					/>
					<SubHelperComponent
						style={resolvedStyles.slideImage ?? {}}
						className="slideImage"
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
					ref={currentSlide}
					key={galleryData[slideNum][`${startingImage?.keyName}`]}
					style={style}
				>
					<img
						className="slideImage"
						style={resolvedStyles?.slideImage ?? {}}
						src={getSrcUrl(galleryData[slideNum!].src)}
						alt="CurrentSlide"
					/>
					<SubHelperComponent
						style={resolvedStyles.slideImage ?? {}}
						className="slideImage"
						definition={props.definition}
						subComponentName="slideImage"
					/>
				</div>,
			];
		} else {
			showChildren = [
				<div
					className="_eachSlide _previous"
					key={galleryData[slideNum!][`${startingImage?.keyName}`]}
					onClick={handleBubbling}
				>
					<img
						className="slideImage"
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
						className="slideImage"
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
	const galleryTools = [
		zoomIcon,
		autoPlayIcon,
		fullScreenIcon,
		thumbnailIcon,
		previewIcon,
		closeIcon,
	];

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
					<div className={`mainContainer preview${position}`}>
						<div className={`galleryContainer thumbnail${position}`}>
							<div className={`galleryToolbar`} onClick={handleBubbling}>
								<div
									className="leftColumn"
									style={resolvedStyles.toolbarLeftColumn ?? {}}
								>
									{`${slideNum + 1} / ${galleryData?.length}`}
									<SubHelperComponent
										definition={props.definition}
										subComponentName="toolbarLeftColumn"
									/>
								</div>
								<div
									className="rightColumn"
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
								className={`imageSliderContainer ${isZoomed ? 'imageZoomed' : ''}`}
								style={resolvedStyles?.imageSliderContainer ?? {}}
							>
								{showArrowButtons && (
									<div
										className={`arrowButtonsContainer ${arrowButtons}`}
										style={resolvedStyles.arrowButtonsContainer ?? {}}
										onClick={handleBubbling}
									>
										<i
											className={`fa-solid fa-chevron-left button`}
											style={resolvedStyles.arrowButtons ?? {}}
											onClick={() => prevImage()}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="arrowButtons"
											/>
										</i>
										<i
											className={` fa-solid fa-chevron-right button`}
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
							{previewMode === 'Thumbnail' && (
								<div
									className={`thumbnailContainer thumbnail${position} ${
										!showThumbnail ? `hide${position}` : ''
									} ${isZoomed ? 'imageZoomed' : ''}`}
									style={resolvedStyles?.thumbnailContainer ?? {}}
									onClick={handleBubbling}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="thumbnailContainer"
									/>
									{galleryData?.map((each: any, index: number) => (
										<div
											className={`thumbnailImageDiv ${
												slideNum === index ? 'selected' : ''
											}`}
											style={resolvedStyles?.thumbnailImageDiv ?? {}}
											onClick={() => selectedImage(index)}
											key={each[`${startingImage?.keyName}`]}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="thumbnailImageDiv"
											/>
											<img
												src={getSrcUrl(each?.src)}
												alt={`${each?.name}}`}
												className="thumbnailImage"
												style={resolvedStyles?.thumbnailImage ?? {}}
											/>
											<SubHelperComponent
												style={resolvedStyles.thumbnailImage ?? {}}
												className="thumbnailImage"
												definition={props.definition}
												subComponentName="thumbnailImage"
											/>
										</div>
									))}
								</div>
							)}
						</div>
						{previewMode === 'Preview' && (
							<div
								className={`previewContainer ${position} ${
									showPreivew ? `show${position}` : ''
								}`}
								style={resolvedStyles.previewContainer ?? {}}
								onClick={handleBubbling}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="previewContainer"
								/>
								<div className={`previewCloseIcon ${!showPreivew ? 'hide' : ''}`}>
									{previewCloseIcon}
								</div>
								<div
									className={`previewList ${position} ${
										!showPreivew ? `hide${position}` : ''
									}`}
									style={resolvedStyles.previewList ?? {}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="previewList"
									/>
									{galleryData?.map((each: any, index: number) => (
										<div
											className={`previewImageDiv ${position} ${
												slideNum === index ? 'selected' : ''
											}`}
											style={resolvedStyles.previewImageDiv ?? {}}
											onClick={() => selectedImage(index)}
											key={each[`${startingImage?.keyName}`]}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="previewImageDiv"
											/>
											<img
												src={getSrcUrl(each?.src)}
												alt={`${each?.name}}`}
												className="previewImage"
												style={resolvedStyles.previewImage ?? {}}
											/>
											<SubHelperComponent
												style={resolvedStyles.previewImage ?? {}}
												className="previewImage"
												definition={props.definition}
												subComponentName="previewImage"
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</Portal>
		);
	}
	return <></>;
}

const component: Component = {
	name: 'Gallery',
	displayName: 'Gallery',
	description: 'Gallery component',
	component: Gallery,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GalleryStyles,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Toggle Binding' },
		bindingPath2: { name: 'Starting Image Binding' },
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M16.1953 3.45215C17.8452 3.45215 19.1953 4.79961 19.1953 6.45215C19.1953 8.10268 17.8458 9.45215 16.1953 9.45215C14.5448 9.45215 13.1953 8.10268 13.1953 6.45215C13.1953 4.79961 14.5454 3.45215 16.1953 3.45215Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M6.03544 9.37851L4.17973 10.1906C4.07055 10.2384 4 10.3462 4 10.4654V19.4C4 19.7314 4.26863 20 4.6 20H19.4C19.7314 20 20 19.7314 20 19.4V16.3432C20 16.2501 19.9568 16.1624 19.8832 16.1056L17.2524 14.0774C16.8427 13.7615 16.2846 13.7186 15.8315 13.9682L13.0133 15.5205C12.8906 15.588 12.7375 15.5617 12.6444 15.4571L7.52791 9.70542C7.1537 9.28476 6.55123 9.15279 6.03544 9.37851Z"
						fill="currentColor"
					/>
					<rect
						x="1.5"
						y="1.5"
						width="21"
						height="21"
						rx="1.5"
						fill="none"
						stroke="currentColor"
						strokeOpacity="0.2"
					/>
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
