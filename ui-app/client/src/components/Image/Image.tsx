import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getHref } from '../util/getHref';
import getSrcUrl from '../util/getSrcUrl';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import { styleProperties, styleDefaults } from './imageStyleProperties';
import ImageStyle from './ImageStyles';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import axios from 'axios';
// import { onMouseDownDragStartCurry } from '../../functions/utils';

async function secureImage(src: string) {
	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

	return await axios
		.get(src, { responseType: 'blob', headers })
		.then(res => URL.createObjectURL(res.data));
}

function ImageComponent(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const [touchHover, setTouchHover] = useState(false);
	const [src, setSrc] = useState('');
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const [falledBack, setFalledBack] = useState(false);
	const location = useLocation();
	const imageRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [sliderPosition, setSliderPosition] = useState(50);
	const [isDragging, setIsDragging] = useState(false);

	const {
		properties: {
			alt,
			src: defaultSrc,
			src2,
			src3,
			src4,
			src5,
			onClick: onClickEvent,
			fallBackImg,
			imgLazyLoading,
			stopPropagation,
			preventDefault,
			useObjectToRender,
			enhancementType,
			zoomPreviewVisible,
			zoomFactor,
			magnifierSize,
			magnificationFactor,
			previewPlacement,
			previewWidth,
			previewHeight,
			comparisonSrc,
			sliderPosition: initialSliderPosition,
			sliderOrientation,
			sliderWidth,
			sliderHandleSize,
			sliderHandleType,
			sliderHandleImage,
			tooltipText,
			tooltipEnabled,
			tooltipPosition,
			tooltipOffset,
		} = {},
		key,
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const clickEvent = onClickEvent
		? props.pageDefinition.eventFunctions?.[onClickEvent]
		: undefined;

	useEffect(() => {
		addListenerAndCallImmediately(
			props.context.pageName,
			(_, value) => {
				if (value?.TABLET_LANDSCAPE_SCREEN_ONLY && src2) {
					setSrc(src2);
				} else if (value?.TABLET_POTRAIT_SCREEN_ONLY && src3) {
					setSrc(src3);
				} else if (value?.MOBILE_LANDSCAPE_SCREEN_ONLY && src4) {
					setSrc(src4);
				} else if (value?.MOBILE_POTRAIT_SCREEN_ONLY && src5) {
					setSrc(src5);
				} else {
					setSrc(defaultSrc);
				}
			},
			'Store.devices',
		);
	}, [defaultSrc, src2, src3, src4, src5]);

	const handleClick = () => {
		(async () =>
			await runEvent(
				clickEvent,
				key,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};
	const handleError = (e: any) => {
		if (falledBack) return;
		e.currentTarget.src = fallBackImg;
		setFalledBack(true);
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (initialSliderPosition !== undefined) {
			setSliderPosition(initialSliderPosition);
		}
	}, [initialSliderPosition]);

	const [actualSrc, setActualSrc] = useState<string | undefined>();
	const [actualComparisonSrc, setActualComparisonSrc] = useState<string | undefined>();
	const computedUrl = getSrcUrl(getHref(src ?? defaultSrc, location)!);
	const computedComparisonUrl = comparisonSrc
		? getSrcUrl(getHref(comparisonSrc, location)!)
		: undefined;

	useEffect(() => {
		if (!computedUrl.includes('api/files/secured')) {
			setActualSrc(computedUrl);
			return;
		}
		(async () => setActualSrc(await secureImage(computedUrl)))();
	}, [computedUrl]);

	useEffect(() => {
		if (!computedComparisonUrl || !computedComparisonUrl.includes('api/files/secured')) {
			setActualComparisonSrc(computedComparisonUrl);
			return;
		}
		(async () => setActualComparisonSrc(await secureImage(computedComparisonUrl)))();
	}, [computedComparisonUrl]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (enhancementType !== 'comparison' || !actualComparisonSrc) return;
		setIsDragging(true);
		updateSliderPosition(e);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (enhancementType === 'zoomPreview' || enhancementType === 'magnification') {
			const { left, top, width, height } = containerRef.current?.getBoundingClientRect() || {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
			};
			const x = ((e.clientX - left) / width) * 100;
			const y = ((e.clientY - top) / height) * 100;

			setMousePosition({ x, y });
		}

		if (enhancementType === 'comparison' && isDragging && actualComparisonSrc) {
			updateSliderPosition(e);
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Touch event handlers for mobile support
	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (enhancementType === 'comparison' && actualComparisonSrc) {
			e.preventDefault();
			setIsDragging(true);
			updateSliderPositionFromTouch(e);
		} else {
			// For other enhancement types, show hover state on touch
			setTouchHover(true);
		}
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (enhancementType === 'zoomPreview' || enhancementType === 'magnification') {
			const touch = e.touches[0];
			if (!touch) return;

			const { left, top, width, height } = containerRef.current?.getBoundingClientRect() || {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
			};
			const x = ((touch.clientX - left) / width) * 100;
			const y = ((touch.clientY - top) / height) * 100;

			setMousePosition({ x, y });
		}

		if (enhancementType === 'comparison' && isDragging && actualComparisonSrc) {
			e.preventDefault();
			updateSliderPositionFromTouch(e);
		}
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
		// Add a small delay before hiding touch hover to allow for tooltip display
		setTimeout(() => setTouchHover(false), 2000);
	};

	const updateSliderPosition = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;

		const { left, top, width, height } = containerRef.current.getBoundingClientRect();
		let newPosition;

		if (sliderOrientation === 'vertical') {
			newPosition = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
		} else {
			newPosition = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
		}

		setSliderPosition(newPosition);
	};

	const updateSliderPositionFromTouch = (e: React.TouchEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;

		const touch = e.touches[0];
		if (!touch) return;

		const { left, top, width, height } = containerRef.current.getBoundingClientRect();
		let newPosition;

		if (sliderOrientation === 'vertical') {
			newPosition = Math.min(100, Math.max(0, ((touch.clientY - top) / height) * 100));
		} else {
			newPosition = Math.min(100, Math.max(0, ((touch.clientX - left) / width) * 100));
		}

		setSliderPosition(newPosition);
	};

	useEffect(() => {
		const handleGlobalMouseUp = () => setIsDragging(false);
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (
				isDragging &&
				enhancementType === 'comparison' &&
				actualComparisonSrc &&
				containerRef.current
			) {
				const { left, top, width, height } = containerRef.current.getBoundingClientRect();
				let newPosition;

				if (sliderOrientation === 'vertical') {
					newPosition = Math.min(100, Math.max(0, ((e.clientY - top) / height) * 100));
				} else {
					newPosition = Math.min(100, Math.max(0, ((e.clientX - left) / width) * 100));
				}

				setSliderPosition(newPosition);
			}
		};

		const handleGlobalTouchEnd = () => setIsDragging(false);
		const handleGlobalTouchMove = (e: TouchEvent) => {
			if (
				isDragging &&
				enhancementType === 'comparison' &&
				actualComparisonSrc &&
				containerRef.current
			) {
				e.preventDefault();
				const touch = e.touches[0];
				if (!touch) return;

				const { left, top, width, height } = containerRef.current.getBoundingClientRect();
				let newPosition;

				if (sliderOrientation === 'vertical') {
					newPosition = Math.min(
						100,
						Math.max(0, ((touch.clientY - top) / height) * 100),
					);
				} else {
					newPosition = Math.min(
						100,
						Math.max(0, ((touch.clientX - left) / width) * 100),
					);
				}

				setSliderPosition(newPosition);
			}
		};

		document.addEventListener('mouseup', handleGlobalMouseUp);
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('touchend', handleGlobalTouchEnd);
		document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

		return () => {
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
			document.removeEventListener('touchmove', handleGlobalTouchMove);
		};
	}, [isDragging, enhancementType, actualComparisonSrc, sliderOrientation]);

	let imageTag = undefined;

	if (actualSrc) {
		const actualImage = useObjectToRender ? (
			<object type="image/svg+xml" data={actualSrc} style={resolvedStyles.image ?? {}} />
		) : (
			<img
				ref={imageRef}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				onClick={
					onClickEvent
						? ev => {
								if (stopPropagation) ev.stopPropagation();
								if (preventDefault) ev.preventDefault();
								handleClick();
							}
						: undefined
				}
				className={onClickEvent ? '_onclicktrue' : ''}
				style={resolvedStyles.image ?? {}}
				src={actualSrc}
				alt={alt}
				onError={fallBackImg ? handleError : undefined}
				loading={imgLazyLoading ? 'lazy' : 'eager'}
			/>
		);

		const zoomPreviewClass = `_zoomPreview _preview-${previewPlacement || 'right'}`;
		const zoomPreviewStyle = {
			...resolvedStyles.zoomPreview,
			width: `${previewWidth || 300}px`,
			height: `${previewHeight || 300}px`,
			backgroundImage: `url('${actualSrc}')`,
			backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
			backgroundSize: `${(zoomFactor || 2) * 100}%`,
		};

		const zoomPreview = enhancementType === 'zoomPreview' && (
			<div
				className={`${zoomPreviewClass} ${zoomPreviewVisible || hover || touchHover ? 'visible' : ''}`}
				style={zoomPreviewStyle}
			>
				<SubHelperComponent definition={definition} subComponentName="zoomPreview" />
			</div>
		);

		const magnifierStyle = {
			...resolvedStyles.magnifier,
			left: `${mousePosition.x}%`,
			top: `${mousePosition.y}%`,
			width: `${magnifierSize || 150}px`,
			height: `${magnifierSize || 150}px`,
			backgroundImage: `url('${actualSrc}')`,
			backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
			backgroundSize: `${(magnificationFactor || 2) * 100}%`,
		};

		const magnifier = enhancementType === 'magnification' && (hover || touchHover) && (
			<div className="_magnifier" style={magnifierStyle}>
				<SubHelperComponent definition={definition} subComponentName="magnifier" />
			</div>
		);

		const comparisonSlider = enhancementType === 'comparison' && actualComparisonSrc && (
			<>
				<div
					className="_comparisonContainer"
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						overflow: 'hidden',
					}}
				>
					<img
						className="_comparisonImage"
						src={actualComparisonSrc}
						alt={`${alt} comparison`}
						style={{
							...resolvedStyles.image,
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							clipPath:
								sliderOrientation === 'vertical'
									? `polygon(0 0, 100% 0, 100% ${sliderPosition}%, 0 ${sliderPosition}%)`
									: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
						}}
					/>
				</div>
				<div
					className="_sliderLine"
					style={{
						...resolvedStyles.sliderLine,
						position: 'absolute',
						...(sliderOrientation === 'vertical'
							? {
									left: 0,
									width: '100%',
									top: `calc(${sliderPosition}% - ${(sliderWidth || 2) / 2}px)`,
									height: `${sliderWidth || 2}px`,
								}
							: {
									top: 0,
									height: '100%',
									left: `calc(${sliderPosition}% - ${(sliderWidth || 2) / 2}px)`,
									width: `${sliderWidth || 2}px`,
								}),
						cursor: sliderOrientation === 'vertical' ? 'row-resize' : 'col-resize',
						zIndex: 10,
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="sliderLine" />
				</div>

				{sliderHandleType !== 'none' && (
					<div
						className="_sliderHandle"
						style={{
							...resolvedStyles.sliderHandle,
							position: 'absolute',
							...(sliderOrientation === 'vertical'
								? {
										left: `calc(50% - ${(sliderHandleSize || 40) / 2}px)`,
										top: `calc(${sliderPosition}% - ${(sliderHandleSize || 40) / 2}px)`,
									}
								: {
										top: `calc(50% - ${(sliderHandleSize || 40) / 2}px)`,
										left: `calc(${sliderPosition}% - ${(sliderHandleSize || 40) / 2}px)`,
									}),
							width: `${sliderHandleSize || 40}px`,
							height: `${sliderHandleSize || 40}px`,
							borderRadius: '50%',
							cursor: sliderOrientation === 'vertical' ? 'row-resize' : 'col-resize',
							zIndex: 20,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							...(sliderHandleType === 'custom' && sliderHandleImage
								? {
										backgroundImage: `url('${getSrcUrl(getHref(sliderHandleImage, location)!)}')`,
										backgroundSize: 'contain',
										backgroundPosition: 'center',
										backgroundRepeat: 'no-repeat',
									}
								: {}),
						}}
					>
						{sliderHandleType === 'default' && (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									width: '100%',
									height: '100%',
								}}
							>
								{sliderOrientation === 'vertical' ? (
									<span
										style={{
											fontSize: `${sliderHandleSize ? sliderHandleSize / 2 : 20}px`,
										}}
									>
										⇅
									</span>
								) : (
									<span
										style={{
											fontSize: `${sliderHandleSize ? sliderHandleSize / 2 : 20}px`,
										}}
									>
										⇄
									</span>
								)}
							</div>
						)}
						<SubHelperComponent
							definition={definition}
							subComponentName="sliderHandle"
						/>
					</div>
				)}
			</>
		);

		let tooltip;

		tooltip = tooltipEnabled && tooltipText && (hover || touchHover) && (
			<div
				className="_tooltip"
				style={{
					...resolvedStyles.tooltip,
					position: 'absolute',
					...(tooltipPosition === 'top' && {
						bottom: '100%',
						left: '50%',
						transform: 'translateX(-50%)',
						marginBottom: `${tooltipOffset || 10}px`,
					}),
					...(tooltipPosition === 'bottom' && {
						top: '100%',
						left: '50%',
						transform: 'translateX(-50%)',
						marginTop: `${tooltipOffset || 10}px`,
					}),
					...(tooltipPosition === 'left' && {
						right: '100%',
						top: '50%',
						transform: 'translateY(-50%)',
						marginRight: `${tooltipOffset || 10}px`,
					}),
					...(tooltipPosition === 'right' && {
						left: '100%',
						top: '50%',
						transform: 'translateY(-50%)',
						marginLeft: `${tooltipOffset || 10}px`,
					}),
					whiteSpace: 'nowrap',
					zIndex: 30,
				}}
			>
				{tooltipText}
				<SubHelperComponent definition={definition} subComponentName="tooltip" />
			</div>
		);

		imageTag = (
			<>
				{actualImage}
				{zoomPreview}
				{magnifier}
				{comparisonSlider}
				{tooltip}
				<SubHelperComponent
					style={resolvedStyles.image ?? {}}
					className={onClickEvent ? '_onclicktrue' : ''}
					definition={definition}
					subComponentName="image"
				></SubHelperComponent>
			</>
		);
	}

	return (
		<div
			className="comp compImage"
			style={{ ...(resolvedStyles.comp ?? {}), userSelect: isDragging ? 'none' : 'auto' }}
			ref={containerRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			<HelperComponent context={props.context} definition={definition} />
			{imageTag}
		</div>
	);
}

const component: Component = {
	order: 3,
	name: 'Image',
	displayName: 'Image',
	description: 'Image Component',
	component: ImageComponent,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'Image',
		type: 'Image',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/sample.svg' },
			alt: { value: 'Image' },
		},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
