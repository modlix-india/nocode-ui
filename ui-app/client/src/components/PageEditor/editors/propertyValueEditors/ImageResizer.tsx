import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RangeSlider } from '../stylePropertyValueEditors/simpleEditors/RangeSlider';
import axios from 'axios';
import { ColorSelector } from '../stylePropertyValueEditors/simpleEditors/ColorSelector';

interface ImageResizerProps {
	path?: string;
	headers: any;
	formData: FormData | undefined;
	image: string;
	setImage: React.Dispatch<React.SetStateAction<string>>;
	setInProgress: React.Dispatch<React.SetStateAction<boolean>>;
	setShowImageResizerPopup: React.Dispatch<React.SetStateAction<boolean>>;
	callForFiles: Function;
	override: boolean;
	setOverride: React.Dispatch<React.SetStateAction<boolean>>;
	name: string;
}

const ImageResizer = ({
	path,
	headers,
	formData,
	image,
	setImage,
	setInProgress,
	setShowImageResizerPopup,
	callForFiles,
	override,
	setOverride,
	name,
}: ImageResizerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [imageInitialSize, setImageInitialSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});
	const [sliderVal, setSliderVal] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
	const [scale, setScale] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
	const [sliderRotationVal, setSliderRotationVal] = useState<number>(0);
	const [imageWrapperUpdatedSize, setImageWrapperUpdatedSize] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });
	const [imageUpdatedSize, setImageUpdatedSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});
	const [fixAspectRatio, setFixAspectRatio] = useState<boolean>(true);
	const [showCropArea, setShowCropArea] = useState<boolean>(false);
	const cropRectRef = React.useRef<HTMLDivElement>(null);
	const [cropAreaSize, setCropAreaSize] = useState<{ width: number; height: number }>({
		width: 100,
		height: 100,
	});
	const [cropAreaPosition, setCropAreaPosition] = useState<{ top: number; left: number }>({
		top: 0,
		left: 0,
	});
	const [dragging, setDragging] = useState<boolean>(false);
	const topLeftRef = useRef<HTMLDivElement>(null);
	const topRightRef = useRef<HTMLDivElement>(null);
	const bottomLeftRef = useRef<HTMLDivElement>(null);
	const bottomRightRef = useRef<HTMLDivElement>(null);
	const leftRef = useRef<HTMLDivElement>(null);
	const topRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const [chngValue, setChngValue] = useState<any>('');
	const [imageName, setImageName] = useState<string>(name);

	let scaleSlider = undefined;
	const min = 0;
	const max = 200;
	scaleSlider = (
		<RangeSlider
			value={sliderVal.x * 2}
			onChange={v => {
				let val = v / 2 ?? 0;
				setSliderVal({ x: val, y: val });
			}}
			min={min}
			max={max ?? 100}
		/>
	);

	let scaleSliderX = undefined;
	scaleSliderX = (
		<RangeSlider
			value={sliderVal.x * 2}
			onChange={v => {
				setSliderVal({ ...sliderVal, x: v / 2 ?? 0 });
			}}
			min={min}
			max={max ?? 100}
		/>
	);

	let scaleSliderY = undefined;
	scaleSliderY = (
		<RangeSlider
			value={sliderVal.y * 2}
			onChange={v => {
				setSliderVal({ ...sliderVal, y: v ?? 0 });
			}}
			min={min}
			max={max ?? 100}
		/>
	);

	let rotateSlider = undefined;
	const rotationMin = 0;
	const rotationMax = 360;
	rotateSlider = (
		<RangeSlider
			value={sliderRotationVal}
			onChange={v => {
				setSliderRotationVal(v ?? 0);
			}}
			min={rotationMin}
			max={rotationMax ?? 360}
		/>
	);

	useEffect(() => {
		//change here according to aspect ratio
		if (fixAspectRatio) {
			let val = sliderVal.x / 50;

			if (imageRef.current && imageUpdatedSize) {
				setImageUpdatedSize({
					width: Math.round(imageInitialSize.width * val),
					height: Math.round(imageInitialSize.height * val),
				});
			}

			let bottomLeft = [100, 100];
			let topLeft = [100, imageInitialSize.height * val + 100];
			let topRight = [
				imageInitialSize.width * val + 100,
				imageInitialSize.height * val + 100,
			];
			let bottomRight = [imageInitialSize.width * val + 100, 100];

			const { width, height } = cartesianToPolar(
				topLeft,
				topRight,
				bottomLeft,
				bottomRight,
				sliderRotationVal,
			);

			setImageWrapperUpdatedSize({ width, height });
		} else {
			let xVal = sliderVal.x / 50;
			let yVal = sliderVal.y / 50;

			if (imageRef.current && imageUpdatedSize) {
				setImageUpdatedSize({
					width: Math.round(imageInitialSize.width * xVal),
					height: Math.round(imageInitialSize.height * yVal),
				});
			}

			let bottomLeft = [100, 100];
			let topLeft = [100, imageInitialSize.height * yVal + 100];
			let topRight = [
				imageInitialSize.width * xVal + 100,
				imageInitialSize.height * yVal + 100,
			];
			let bottomRight = [imageInitialSize.width * xVal + 100, 100];

			const { width, height } = cartesianToPolar(
				topLeft,
				topRight,
				bottomLeft,
				bottomRight,
				sliderRotationVal,
			);

			setImageWrapperUpdatedSize({ width, height });
		}
	}, [sliderVal]);

	const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		// Wait for the image to be fully loaded
		if (!imageRef.current) {
			return;
		}

		const imgSize = {
			width: Math.round(imageRef.current.clientWidth),
			height: Math.round(imageRef.current.clientHeight),
		};

		let lastIndexOf = name?.lastIndexOf('.');
		let newName = name?.substring(0, lastIndexOf) || '';
		setImageName(newName);

		setImageInitialSize(imgSize);
		setImageWrapperUpdatedSize(imgSize);

		let bottomLeft = [100, 100];
		let topLeft = [100, imgSize.height + 100];
		let topRight = [imgSize.width + 100, imgSize.height + 100];
		let bottomRight = [imgSize.width + 100, 100];

		const { width, height } = cartesianToPolar(topLeft, topRight, bottomLeft, bottomRight, 0);

		setImageWrapperUpdatedSize({ width, height });
	};

	function cartesianToPolar(
		topLeft: number[],
		topRight: number[],
		bottomLeft: number[],
		bottomRight: number[],
		rotatedAngle: number,
	) {
		let r1 = Math.sqrt(topLeft[0] * topLeft[0] + topLeft[1] * topLeft[1]);
		let r2 = Math.sqrt(topRight[0] * topRight[0] + topRight[1] * topRight[1]);
		let r3 = Math.sqrt(bottomLeft[0] * bottomLeft[0] + bottomLeft[1] * bottomLeft[1]);
		let r4 = Math.sqrt(bottomRight[0] * bottomRight[0] + bottomRight[1] * bottomRight[1]);

		let theta1 = Math.atan(topLeft[1] / topLeft[0]);
		let theta2 = Math.atan(topRight[1] / topRight[0]);
		let theta3 = Math.atan(bottomLeft[1] / bottomLeft[0]);
		let theta4 = Math.atan(bottomRight[1] / bottomRight[0]);

		//   let rotatedAngle = Math.PI / 4;
		const rotatedAngleInRadians = (rotatedAngle * Math.PI) / 180;

		const newTheta1 = theta1 + rotatedAngleInRadians;
		const newTheta2 = theta2 + rotatedAngleInRadians;
		const newTheta3 = theta3 + rotatedAngleInRadians;
		const newTheta4 = theta4 + rotatedAngleInRadians;

		const nTopLeft = [
			r1 * parseFloat(Math.cos(newTheta1).toFixed(4)),
			r1 * parseFloat(Math.sin(newTheta1).toFixed(4)),
		];
		const nTopRight = [
			r2 * parseFloat(Math.cos(newTheta2).toFixed(4)),
			r2 * parseFloat(Math.sin(newTheta2).toFixed(4)),
		];
		const nBottomLeft = [
			r3 * parseFloat(Math.cos(newTheta3).toFixed(4)),
			r3 * parseFloat(Math.sin(newTheta3).toFixed(4)),
		];
		const nBottomRight = [
			r4 * parseFloat(Math.cos(newTheta4).toFixed(4)),
			r4 * parseFloat(Math.sin(newTheta4).toFixed(4)),
		];

		const width = Math.round(
			calcWidthHeight(nTopLeft[0], nTopRight[0], nBottomLeft[0], nBottomRight[0]),
		);
		const height = Math.round(
			calcWidthHeight(nTopLeft[1], nTopRight[1], nBottomLeft[1], nBottomRight[1]),
		);

		return { width, height };
	}

	function calcWidthHeight(p1: number, p2: number, p3: number, p4: number) {
		let min = Math.min(p1, Math.min(p2, Math.min(p3, p4)));
		let max = Math.max(p1, Math.max(p2, Math.max(p3, p4)));
		return max - min;
	}

	function handleRotation(rotatedAngle: number) {
		const imgSize = {
			height: imageUpdatedSize?.height ? imageUpdatedSize?.height : imageInitialSize.height,
			width: imageUpdatedSize?.width ? imageUpdatedSize?.width : imageInitialSize.width,
		};

		// Cartesian co-ordinates
		let bottomLeft = [100, 100];
		let topLeft = [100, imgSize.height + 100];
		let topRight = [imgSize.width + 100, imgSize.height + 100];
		let bottomRight = [imgSize.width + 100, 100];

		// convert cartesian to polar and then calculate new width and height
		const { width, height } = cartesianToPolar(
			topLeft,
			topRight,
			bottomLeft,
			bottomRight,
			rotatedAngle,
		);

		setImageWrapperUpdatedSize({ width, height });
	}

	useEffect(() => {
		setImageUpdatedSize(imageInitialSize);
	}, [imageInitialSize]);

	useEffect(() => {
		handleRotation(sliderRotationVal);
	}, [sliderRotationVal]);

	useEffect(() => {
		let left = Math.round((imageWrapperUpdatedSize.width - cropAreaSize.width) / 2);
		let top = Math.round((imageWrapperUpdatedSize.height - cropAreaSize.height) / 2);
		setCropAreaPosition({ left, top });
	}, [imageWrapperUpdatedSize]);

	const handleMouseDown = (e: any) => {
		if (e.target == cropRectRef.current) {
			// compute crop area dragging
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			setDragging(true);
			const initX = e.screenX;
			const initY = e.screenY;
			const initScrollLeft = containerRef?.current?.scrollLeft ?? 0;
			const initScrollTop = containerRef?.current?.scrollTop ?? 0;

			const handleMouseMove = (ie: any) => {
				const rightMost = containerRef?.current?.getBoundingClientRect().right ?? 0 - 20;
				const topMost = containerRef?.current?.getBoundingClientRect().bottom ?? 0 - 20;

				let offsetLeft = 0;
				let offsetTop = 0;
				// to scroll the container
				if (containerRef.current) {
					if (ie.screenX >= rightMost) {
						containerRef.current.scrollLeft = 5;
						offsetLeft = 5;
					} else if (ie.screenY >= topMost) {
						containerRef.current.scrollTop = 5;
						offsetTop = 5;
					} else if (ie.screenX >= rightMost && ie.screenY >= topMost) {
						containerRef.current.scrollLeft = 5;
						containerRef.current.scrollTop = 5;
						offsetLeft = 5;
						offsetTop = 5;
					}
				}
				// to drag the crop area
				if (cropRectRef.current) {
					let left = Math.min(
						imageWrapperUpdatedSize.width - cropAreaSize.width,
						Math.max(
							0,
							cropAreaPosition.left +
								ie.screenX -
								initX +
								(containerRef?.current?.scrollLeft ?? 0) -
								initScrollLeft,
						),
					);
					let top = Math.min(
						imageWrapperUpdatedSize.height - cropAreaSize.height,
						Math.max(
							0,
							cropAreaPosition.top +
								ie.screenY -
								initY +
								(containerRef?.current?.scrollTop ?? 0) -
								initScrollTop,
						),
					);

					setCropAreaPosition({
						left: Math.round(left + offsetLeft),
						top: Math.round(top + offsetTop),
					});
				}
			};

			const handleMouseUp = () => {
				setDragging(false);
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == topLeftRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;
			const initY = e.screenY;
			const initScrollLeft = containerRef?.current?.scrollLeft ?? 0;
			const initScrollTop = containerRef?.current?.scrollTop ?? 0;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolledX = initX - ie.screenX;
					let scrolledY = initY - ie.screenY;
					let scrolled = Math.max(scrolledX, scrolledY);

					let left = Math.min(
						imageWrapperUpdatedSize.width - cropAreaSize.width,
						Math.max(0, cropAreaPosition.left + initScrollLeft - scrolled / 2),
					);
					let top = Math.min(
						imageWrapperUpdatedSize.height - cropAreaSize.height,
						Math.max(0, cropAreaPosition.top + initScrollTop - scrolled / 2),
					);

					let updateSize = {
						width: Math.round(
							Math.min(
								imageWrapperUpdatedSize.width,
								Math.max(60, initCropSize.width + scrolled),
							),
						),
						height: Math.round(
							Math.min(
								imageWrapperUpdatedSize.height,
								Math.max(60, initCropSize.height + scrolled),
							),
						),
					};

					if (
						(scrolled < 0 && (updateSize.width === 60 || updateSize.height === 60)) ||
						(scrolled > 0 &&
							(updateSize.width === imageWrapperUpdatedSize.width ||
								updateSize.height === imageWrapperUpdatedSize.height))
					) {
						return;
					}

					if (
						left <= 0 ||
						left + updateSize.width >= imageWrapperUpdatedSize.width ||
						top <= 0 ||
						top + updateSize.height >= imageWrapperUpdatedSize.height
					)
						return;

					setCropAreaPosition({ left: Math.round(left), top: Math.round(top) });
					setCropAreaSize(updateSize);
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == topRightRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;
			const initY = e.screenY;
			const initScrollTop = containerRef?.current?.scrollTop ?? 0;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolledX = ie.screenX - initX;
					let scrolledY = ie.screenY - initY;
					let scrolled =
						scrolledX > scrolledY
							? Math.max(scrolledX, scrolledY)
							: Math.min(scrolledX, scrolledY);

					let top = Math.min(
						imageWrapperUpdatedSize.height - cropAreaSize.height,
						Math.max(0, cropAreaPosition.top + initScrollTop - scrolled / 2),
					);

					const updatedSize = {
						width: Math.round(
							Math.min(
								imageWrapperUpdatedSize.width,
								Math.max(60, initCropSize.width + scrolled),
							),
						),
						height: Math.round(
							Math.min(
								imageWrapperUpdatedSize.height,
								Math.max(60, initCropSize.height + scrolled),
							),
						),
					};

					if (
						(scrolled < 0 && (updatedSize.width === 60 || updatedSize.height === 60)) ||
						(scrolled > 0 &&
							(updatedSize.width === imageWrapperUpdatedSize.width ||
								updatedSize.height === imageWrapperUpdatedSize.height))
					) {
						return;
					}

					if (
						cropAreaPosition.left <= 0 ||
						cropAreaPosition.left + updatedSize.width >=
							imageWrapperUpdatedSize.width ||
						top <= 0 ||
						top + updatedSize.height >= imageWrapperUpdatedSize.height
					)
						return;

					setCropAreaPosition({ ...cropAreaPosition, top: Math.round(top) });
					setCropAreaSize(updatedSize);
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == bottomLeftRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;
			const initY = e.screenY;
			const initScrollLeft = containerRef?.current?.scrollLeft ?? 0;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolledX = ie.screenX - initX;
					let scrolledY = ie.screenY - initY;
					let scrolled =
						scrolledX < scrolledY
							? Math.max(scrolledX, scrolledY)
							: Math.min(scrolledX, scrolledY);

					let left = Math.min(
						imageWrapperUpdatedSize.width - cropAreaSize.width,
						Math.max(0, cropAreaPosition.left + initScrollLeft - scrolled / 2),
					);

					let updatedSize = {
						width: Math.round(
							Math.min(
								imageWrapperUpdatedSize.width,
								Math.max(60, initCropSize.width + scrolled),
							),
						),
						height: Math.round(
							Math.min(
								imageWrapperUpdatedSize.height,
								Math.max(60, initCropSize.height + scrolled),
							),
						),
					};

					if (
						(scrolled < 0 && (updatedSize.width === 60 || updatedSize.height === 60)) ||
						(scrolled > 0 &&
							(updatedSize.width === imageWrapperUpdatedSize.width ||
								updatedSize.height === imageWrapperUpdatedSize.height))
					) {
						return;
					}

					if (
						left <= 0 ||
						left + updatedSize.width >= imageWrapperUpdatedSize.width ||
						cropAreaPosition.top <= 0 ||
						cropAreaPosition.top + updatedSize.height >= imageWrapperUpdatedSize.height
					)
						return;

					setCropAreaPosition({ ...cropAreaPosition, left: Math.round(left) });
					setCropAreaSize(updatedSize);
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == bottomRightRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;
			const initY = e.screenY;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolledX = ie.screenX - initX;
					let scrolledY = ie.screenY - initY;
					let scrolled = Math.max(scrolledX, scrolledY);

					let updatedSize = {
						width: Math.round(
							Math.min(
								imageWrapperUpdatedSize.width,
								Math.max(60, initCropSize.width + scrolled),
							),
						),
						height: Math.round(
							Math.min(
								imageWrapperUpdatedSize.height,
								Math.max(60, initCropSize.height + scrolled),
							),
						),
					};

					if (
						(scrolled < 0 && (updatedSize.width === 60 || updatedSize.height === 60)) ||
						(scrolled > 0 &&
							(updatedSize.width === imageWrapperUpdatedSize.width ||
								updatedSize.height === imageWrapperUpdatedSize.height))
					) {
						return;
					}

					if (
						cropAreaPosition.left <= 0 ||
						cropAreaPosition.left + updatedSize.width >=
							imageWrapperUpdatedSize.width ||
						cropAreaPosition.top <= 0 ||
						cropAreaPosition.top + updatedSize.height >= imageWrapperUpdatedSize.height
					)
						return;

					setCropAreaSize(updatedSize);
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == leftRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;
			const initScrollLeft = containerRef?.current?.scrollLeft ?? 0;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolled = initX - ie.screenX;
					let left = Math.min(
						imageUpdatedSize.width - cropAreaSize.width,
						Math.max(0, cropAreaPosition.left + initScrollLeft - scrolled / 2),
					);

					let width = Math.min(
						imageUpdatedSize.width,
						Math.max(60, initCropSize.width + scrolled),
					);

					if (left <= 0 || left + width >= imageWrapperUpdatedSize.width) return;

					setCropAreaSize({
						...cropAreaSize,
						width,
					});

					setCropAreaPosition({
						...cropAreaPosition,
						left: Math.round(left),
					});
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == topRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initY = e.screenY;
			const initScrollTop = containerRef?.current?.scrollTop ?? 0;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolled = initY - ie.screenY;
					let top = Math.min(
						imageUpdatedSize.width - cropAreaSize.width,
						Math.max(0, cropAreaPosition.top + initScrollTop - scrolled / 2),
					);

					let height = Math.min(
						imageWrapperUpdatedSize.height,
						Math.max(60, initCropSize.height + scrolled),
					);

					if (top <= 0 || top + height >= imageWrapperUpdatedSize.height) return;

					setCropAreaPosition({
						...cropAreaPosition,
						top: Math.round(top),
					});

					setCropAreaSize({
						...cropAreaSize,
						height,
					});
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == rightRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initX = e.screenX;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolled = ie.screenX - initX;

					let width = Math.min(
						imageWrapperUpdatedSize.width,
						Math.max(60, initCropSize.width + scrolled),
					);

					if (cropAreaPosition.left + width >= imageWrapperUpdatedSize.width) return;

					setCropAreaSize({
						...cropAreaSize,
						width,
					});
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else if (e.target == bottomRef.current && showCropArea) {
			if (!cropRectRef.current) return;

			cropRectRef.current.style.left = `${cropAreaPosition.left}px`;
			cropRectRef.current.style.top = `${cropAreaPosition.top}px`;

			const initY = e.screenY;

			const initCropSize = cropAreaSize;

			const handleMouseMove = (ie: any) => {
				if (cropRectRef.current) {
					let scrolled = ie.screenY - initY;

					let height = Math.min(
						imageWrapperUpdatedSize.height,
						Math.max(60, initCropSize.height + scrolled),
					);

					if (cropAreaPosition.top + height >= imageWrapperUpdatedSize.height) return;

					setCropAreaSize({
						...cropAreaSize,
						height,
					});
				}
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}
	};

	function rgbToHex(rgb: string) {
		if (rgb.startsWith('rgb(')) {
			rgb = rgb.substring(4, rgb.length - 1);
			const rgbaVals = rgb.split(',').map(val => val.trim());
			const r = parseInt(rgbaVals[0]);
			const g = parseInt(rgbaVals[1]);
			const b = parseInt(rgbaVals[2]);

			const toHex = (value: number) => {
				const hex = Math.round(value).toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			};

			return '#' + toHex(r) + toHex(g) + toHex(b);
		} else if (rgb.startsWith('rgba(')) {
			rgb = rgb.substring(5, rgb.length - 1);
			const rgbaVals = rgb.split(',').map(val => val.trim());
			const r = parseInt(rgbaVals[0]);
			const g = parseInt(rgbaVals[1]);
			const b = parseInt(rgbaVals[2]);
			const a = parseFloat(rgbaVals[3]);

			const toHex = (value: number) => {
				const hex = Math.round(value).toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			};

			const alphaHex = Math.round(a * 255).toString(16);

			return '#' + toHex(r) + toHex(g) + toHex(b) + alphaHex;
		}
	}

	const handleSave = async () => {
		const newFormData = new FormData();

		newFormData.append('path', image);
		newFormData.append('name', imageName);
		newFormData.append('overrideImage', `${override}`);

		if (formData) {
			formData.forEach((value, key) => {
				newFormData.append(key, value);
			});
		}
		const width = imageUpdatedSize?.width;
		const height = imageUpdatedSize?.height;
		newFormData?.append('width', width ? String(width) : '');
		newFormData?.append('height', height ? String(height) : '');

		if (showCropArea) {
			const xAxis = cropAreaPosition?.left;
			const yAxis = cropAreaPosition?.top;
			newFormData?.append('xAxis', xAxis ? String(xAxis) : '0');
			newFormData?.append('yAxis', yAxis ? String(yAxis) : '0');

			const caWidth = cropAreaSize?.width;
			const caHeight = cropAreaSize?.height;
			newFormData?.append('cropAreaWidth', caWidth ? String(caWidth) : '0');
			newFormData?.append('cropAreaHeight', caHeight ? String(caHeight) : '0');
		} else {
			newFormData?.append('xAxis', '0');
			newFormData?.append('yAxis', '0');
			newFormData?.append('cropAreaWidth', '0');
			newFormData?.append('cropAreaHeight', '0');
		}

		newFormData?.append('rotation', sliderRotationVal ? String(sliderRotationVal) : '0');

		newFormData?.append('backgroundColor', chngValue ? String(rgbToHex(chngValue)) : '');

		const flipHorizontal = scale?.x;
		const flipVertical = scale?.y;
		newFormData?.append('flipHorizontal', flipHorizontal == -1 ? 'true' : 'false');
		newFormData?.append('flipVertical', flipVertical == -1 ? 'true' : 'false');
		// setFormData(newFormData);

		try {
			await axios.post(`api/files/transform/static${path === '' ? '/' : path}`, newFormData, {
				headers,
			});
		} catch (e) {}
		setInProgress(false);
		setShowImageResizerPopup(false);
		setImage('');
		setOverride(!override);
		callForFiles();
	};

	return (
		<>
			<div
				className={`_popupBackground`}
				style={{ alignItems: 'stretch' }}
				onClick={() => {
					setShowImageResizerPopup(false);
					setImage('');
				}}
			>
				<div className="_popupContainer _imageResize" onClick={e => e.stopPropagation()}>
					<div className="_popupEditorContainer">
						<div ref={containerRef} className="imagePopupEditorBackground">
							<div
								ref={imageWrapperRef}
								className="imageWrapper"
								style={{
									width: `${imageWrapperUpdatedSize?.width}px`,
									height: `${imageWrapperUpdatedSize?.height}px`,
									backgroundColor: `${chngValue}`,
								}}
								draggable={false}
							>
								<img
									className="uploadingImage"
									ref={imageRef}
									src={image}
									draggable={false}
									onLoad={e => handleImageLoad(e)}
									alt=""
									style={{
										width:
											imageUpdatedSize && imageUpdatedSize?.width
												? `${imageUpdatedSize?.width}px`
												: 'fit-content',
										height:
											imageUpdatedSize && imageUpdatedSize?.height
												? `${imageUpdatedSize?.height}px`
												: 'fit-content',
										transform: `rotate(${sliderRotationVal}deg) translate(${
											-50 * scale.x
										}%, ${-50 * scale.y}%) scale(${scale.x}, ${scale.y})`,
									}}
								/>
								{showCropArea && (
									<div
										ref={cropRectRef}
										className="_cropArea"
										style={{
											top: `${cropAreaPosition.top}px`,
											left: `${cropAreaPosition.left}px`,
											width: `${cropAreaSize.width}px`,
											height: `${cropAreaSize.height}px`,
										}}
										onMouseDown={handleMouseDown}
									>
										<div ref={topLeftRef} className="_cropTopLeft"></div>
										<div ref={topRightRef} className="_cropTopRight"></div>
										<div ref={bottomLeftRef} className="_cropBottomLeft"></div>
										<div
											ref={bottomRightRef}
											className="_cropBottomRight"
										></div>
										<div ref={leftRef} className="_cropLeft"></div>
										<div ref={topRef} className="_cropTop"></div>
										<div ref={rightRef} className="_cropRight"></div>
										<div ref={bottomRef} className="_cropBottom"></div>
									</div>
								)}
							</div>
						</div>
						{/** Crop and Edit Tab */}
						<div className="_editOptions">
							<div className="_editCrop">
								<div className={`tabBtn selected`}>
									<i className="fa-solid fa-crop-simple"></i>
									<span>Crop & Edit</span>
								</div>
								<p className="resizeLabel">
									Rotate{' '}
									<span title="Rotate" className="resizeLabelInfo">
										i
									</span>
								</p>
								<div className="_scaleSliderContainer">
									<div className="_scaleSlider">
										<div
											className="_rotateFlipBtnContainer"
											onClick={() => {
												setSliderRotationVal(
													(sliderRotationVal + 90) % 360,
												);
											}}
										>
											<i className="fa-solid fa-rotate-right _rotateBtnIcon"></i>
											<p className="_rotateFlipBtnLabel">Rotate 90°</p>
										</div>
										<div className="imageScaleSlider">{rotateSlider}</div>
										<input
											className="sliderInput sizeSliderInput"
											id="sizeSliderInput"
											type="number"
											value={Math.floor(sliderRotationVal) || 0}
											onChange={v => {
												let newVal = Math.min(
													parseInt(v.target.value),
													360,
												);

												setSliderRotationVal(newVal || 0);
												handleRotation(newVal);
											}}
										/>
										<label
											className="sliderInputLabel sizeSliderInputLabel"
											htmlFor="sizeSliderInput"
										>
											°
										</label>
									</div>
								</div>
								<p className="resizeLabel">
									Flip{' '}
									<span title="Flip" className="resizeLabelInfo">
										i
									</span>
								</p>
								<div className="_scaleSliderContainer">
									<div className="_scaleSlider">
										<div
											className="_rotateFlipBtnContainer"
											onClick={() => {
												setScale({
													...scale,
													x: scale.x > 0 ? -1 : 1,
												});
											}}
										>
											<div className="_flipIconContainer">
												<div className="_flipIconPart1"></div>
												<div className="_flipIconPart2"></div>
											</div>
											<p className="_rotateFlipBtnLabel">Flip Horizontal</p>
										</div>

										<div
											className="_rotateFlipBtnContainer"
											onClick={() => {
												setScale({
													...scale,
													y: scale.y > 0 ? -1 : 1,
												});
											}}
										>
											<div className="_flipIconContainer _flipVerticalContainer">
												<div className="_flipIconPart1"></div>
												<div className="_flipIconPart2"></div>
											</div>
											<p className="_rotateFlipBtnLabel">Flip Vertical</p>
										</div>
									</div>
								</div>
								<p className="resizeLabel">
									Image Background Color
									<span
										title="Image Background Color"
										className="resizeLabelInfo"
									>
										i
									</span>
								</p>
								<ColorSelector
									color={{ value: chngValue }}
									variableSelection={false}
									onChange={e => setChngValue(e.value)}
								/>
								<div className="checkboxContainer">
									<input
										id="showCropArea"
										type="checkbox"
										checked={showCropArea}
										onChange={() => setShowCropArea(!showCropArea)}
									/>
									<label htmlFor="showCropArea">Show Crop Area</label>
								</div>
							</div>
							<div className="_editCrop">
								<div className={`tabBtn selected`}>
									<i className="fa-solid fa-expand"></i>
									<span>Resize Image</span>
								</div>
								<p className="resizeLabel">
									Resize{' '}
									<span title="Resize" className="resizeLabelInfo">
										i
									</span>
								</p>
								{fixAspectRatio ? (
									<div className="_scaleSliderContainer">
										<div className="_scaleSlider">
											<div className="imageScaleSlider">{scaleSlider}</div>
											<input
												className="sliderInput"
												id="sliderInput"
												type="number"
												value={sliderVal.x * 2 ?? 0}
												onChange={v => {
													let newVal =
														Math.max(
															Math.min(
																parseInt(v.target.value) / 2,
																100,
															),
															0,
														) || 0;
													setSliderVal({ x: newVal, y: newVal });
												}}
											/>
											<label
												className="sliderInputLabel"
												htmlFor="sliderInput"
											>
												%
											</label>
										</div>
									</div>
								) : (
									<div className="_scaleSliderContainer">
										<div className="_scaleSlider">
											<div className="imageScaleSlider">{scaleSliderX}</div>
											<input
												className="sliderInput"
												id="sliderXInput"
												type="number"
												value={sliderVal.x * 2}
												onChange={v => {
													let newVal =
														Math.max(
															Math.min(
																parseInt(v.target.value) / 2,
																100,
															),
															0,
														) || 0;
													setSliderVal({
														...sliderVal,
														x: newVal,
													});
												}}
											/>
											<label
												className="sliderInputLabel"
												htmlFor="sliderXInput"
											>
												%
											</label>
										</div>
										<div className="_scaleSlider">
											<div className="imageScaleSlider">{scaleSliderY}</div>
											<input
												className="sliderInput"
												id="sliderYInput"
												type="number"
												value={sliderVal.y * 2}
												onChange={v => {
													let newVal =
														Math.max(
															Math.min(
																parseInt(v.target.value) / 2,
																100,
															),
															0,
														) || 0;
													setSliderVal({
														...sliderVal,
														y: newVal,
													});
												}}
											/>
											<label
												className="sliderInputLabel"
												htmlFor="sliderYInput"
											>
												%
											</label>
										</div>
									</div>
								)}
								<div className="_sizeInputBoxContainer">
									<div className="_sizeInputBox">
										<input
											disabled
											id="widthInput"
											type="number"
											value={
												Math.floor(
													imageUpdatedSize?.width
														? imageUpdatedSize?.width
														: imageInitialSize?.width,
												) ?? 0
											}
										/>
										<label htmlFor="widthInput">W</label>
									</div>
									<div className="_sizeInputBox">
										<input
											disabled
											id="heightInput"
											type="number"
											value={
												Math.floor(
													imageUpdatedSize?.height
														? imageUpdatedSize?.height
														: imageInitialSize?.height,
												) ?? 0
											}
										/>
										<label htmlFor="heightInput">H</label>
									</div>
								</div>
								<div className="checkboxContainer">
									<input
										id="aspectRatio"
										type="checkbox"
										checked={fixAspectRatio}
										onChange={() => setFixAspectRatio(!fixAspectRatio)}
									/>
									<label htmlFor="aspectRatio">Lock aspect ratio</label>
								</div>
								<p className="resizeLabel">
									Image Name{' '}
									<span title="Image Name" className="resizeLabelInfo">
										i
									</span>
								</p>
								<input
									className="_updateImgName"
									id="heightInput"
									type="text"
									value={imageName}
									onChange={e => setImageName(e.target.value)}
								/>
								<div className="checkboxContainer">
									<input
										id="overrideImage"
										type="checkbox"
										checked={override}
										onChange={() => setOverride(!override)}
									/>
									<label htmlFor="overrideImage">Override Existing Image</label>
								</div>
							</div>
							<div className="_editBtnContainer">
								<button
									className="_cancelBtn"
									title="Cancel"
									tabIndex={0}
									onClick={() => {
										setInProgress(false);
										setShowImageResizerPopup(false);
										setImage('');
										// setShowImageBrowser(false);
									}}
								>
									Cancel
								</button>
								<button
									className="_saveBtn"
									title="Save Changes"
									tabIndex={0}
									onClick={handleSave}
								>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ImageResizer;
