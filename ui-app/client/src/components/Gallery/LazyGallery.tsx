import React, { useState, useEffect, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './galleryProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import getSrcUrl from '../util/getSrcUrl';
import { getRenderData } from '../util/getRenderData';

export default function Gallery(props: Readonly<ComponentProps>) {
	const [isActive, setIsActive] = useState(false);
	const [startingImageSrc, setStartingImageSrc] = useState();
	const {
		definition: { bindingPath, bindingPath2 },
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
			props.context.pageName,
			(_, value) => {
				setIsActive(!!value);
			},
			bindingPathPath,
		);
	}, []);

	useEffect(() => {
		if (!bindingPathPath2) return;
		return addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				setStartingImageSrc(value);
			},
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

	if (isActive || (globalThis.designMode == 'PAGE' && showInDesign === true)) {
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
