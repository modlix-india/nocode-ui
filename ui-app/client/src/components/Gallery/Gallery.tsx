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
import { HelperComponent } from '../HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';

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
			showThumbnailFeature,
			thumbnailPosition,
			showPreviewFeature,
			previewPosition,
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
						src={galleryData[transitionFrom!].src}
						alt="previousSlide"
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
						src={galleryData[slideNum!].src}
						alt="CurrentSlide"
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
						className={`slideImage ${zoom ? 'allowZoom' : ''}`}
						src={galleryData[slideNum!].src}
						alt="displayedImage"
						ref={imageRef}
						onClick={event => {
							zoom && handleImageClick(event);
						}}
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
			className="fa-solid fa-xmark fa-xl"
			onClick={() => setShowPreview(false)}
		></i>
	);
	const zoomIcon = zoom ? (
		<i
			style={resolvedStyles.previewCloseButton ?? {}}
			className="fa-solid fa-magnifying-glass fa-xl"
			onClick={() => handleZoomIconClick()}
			key="zoom"
		></i>
	) : null;

	const autoPlayIcon = autoPlay ? (
		<>
			{!slideShow ? (
				<i
					style={resolvedStyles.toolbarButton ?? {}}
					className="fa-solid fa-play fa-xl"
					onClick={() => setSlideShow(true)}
					key="play"
				></i>
			) : (
				<i
					style={resolvedStyles.toolbarButton ?? {}}
					className="fa-solid fa-pause fa-xl"
					onClick={() => setSlideShow(false)}
					key="pause"
				></i>
			)}
		</>
	) : null;
	const fullScreenIcon = fullScreen ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-expand fa-xl"
			onClick={() => toogleFullscreen()}
			key="fullscreen"
		></i>
	) : null;
	const thumbnailIcon = showThumbnailFeature ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-grip-vertical fa-xl"
			onClick={() => setShowThumbnail(!showThumbnail)}
			key="thumbnail"
		></i>
	) : null;
	const previewIcon = showPreviewFeature ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-list fa-xl"
			onClick={() => setShowPreview(!showPreivew)}
			key="preview"
		></i>
	) : null;
	const closeIcon = showClose ? (
		<i
			style={resolvedStyles.toolbarButton ?? {}}
			className="fa-solid fa-xmark fa-xl closeIcon"
			onClick={handleClose}
			key="close"
		></i>
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
					<HelperComponent definition={props.definition} />
					<div className={`mainContainer preview${previewPosition}`}>
						<div className={`galleryContainer thumbnail${thumbnailPosition}`}>
							<div className={`galleryToolbar`} onClick={handleBubbling}>
								<div className="leftColumn">
									{`${slideNum + 1} / ${galleryData?.length}`}
								</div>
								<div className="rightColumn"> {galleryTools}</div>
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
										></i>
										<i
											className={` fa-solid fa-chevron-right button`}
											style={resolvedStyles.arrowButtons ?? {}}
											onClick={() => nextImage()}
										></i>
									</div>
								)}
								{showChildren}
							</div>
							{showThumbnailFeature && (
								<div
									className={`thumbnailContainer thumbnail${thumbnailPosition} ${
										!showThumbnail ? `hide${thumbnailPosition}` : ''
									} ${isZoomed ? 'imageZoomed' : ''}`}
									style={resolvedStyles?.thumbnailContainer ?? {}}
									onClick={handleBubbling}
								>
									{galleryData?.map((each: any, index: number) => (
										<div
											className={`thumbnailImageDiv ${
												slideNum === index ? 'selected' : ''
											}`}
											onClick={() => selectedImage(index)}
											key={each[`${startingImage?.keyName}`]}
										>
											<img
												src={each?.src}
												alt={`${each?.name}}`}
												className="thumbnailImage"
											/>
										</div>
									))}
								</div>
							)}
						</div>
						{showPreviewFeature && (
							<div
								className={`previewContainer ${previewPosition} ${
									showPreivew ? `show${previewPosition}` : ''
								}`}
								onClick={handleBubbling}
							>
								<div className={`previewCloseIcon ${!showPreivew ? 'hide' : ''}`}>
									{previewCloseIcon}
								</div>
								<div
									className={`previewList ${previewPosition} ${
										!showPreivew ? `hide${previewPosition}` : ''
									}`}
								>
									{galleryData?.map((each: any, index: number) => (
										<div
											className={`previewImageDiv ${previewPosition} ${
												slideNum === index ? 'selected' : ''
											}`}
											onClick={() => selectedImage(index)}
											key={each[`${startingImage?.keyName}`]}
										>
											<img
												src={each?.src}
												alt={`${each?.name}}`}
												className="previewImage"
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
	icon: 'fa-regular fa-images',
	name: 'Gallery',
	displayName: 'Gallery',
	description: 'Gallery component',
	component: Gallery,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GalleryStyles,
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
};

export default component;
