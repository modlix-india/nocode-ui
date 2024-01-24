import React, { useEffect, useRef, useState } from 'react';
import { RangeSlider } from '../stylePropertyValueEditors/simpleEditors/RangeSlider';
import axios from 'axios';

interface ImageResizerProps {
	path?: string;
	headers: any;
	formData: FormData | undefined;
	image: string;
	setImage: React.Dispatch<React.SetStateAction<string>>;
	setInProgress: React.Dispatch<React.SetStateAction<boolean>>;
	setShowImageResizerPopup: React.Dispatch<React.SetStateAction<boolean>>;
	callForFiles: Function;
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
}: ImageResizerProps) => {
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [imageInitialSize, setImageInitialSize] = useState<any>({ width: 0, height: 0 });
	const [sliderVal, setSliderVal] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
	const [scale, setScale] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
	const [allowScroll, setAllowScroll] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState<number>(1);
	const [sliderRotationVal, setSliderRotationVal] = useState<number>(0);
	const [containerSize, setContainerSize] = useState<any>();
	const [imageWrapperUpdatedSize, setImageWrapperUpdatedSize] = useState<any>({
		width: 0,
		height: 0,
	});
	const [imageUpdatedSize, setImageUpdatedSize] = useState<any>({ width: 0, height: 0 });
	const [fixAspectRatio, setFixAspectRatio] = useState<boolean>(true);
	const cropRectRef = React.useRef<HTMLDivElement>(null);
	const [cropAreaLeftTopBounding, setcropAreaLeftTopBounding] = useState<any>({
		top: 0,
		left: 0,
	});

	let scaleSlider = undefined;
	const min = 0;
	const max = 200;
	scaleSlider = (
		<RangeSlider
			value={sliderVal.x * 2}
			onChange={v => {
				let val = v ?? 0;
				setSliderVal({ x: val, y: val });
			}}
			min={min}
			max={max ?? 100}
		/>
	);

	let scaleSliderX = undefined;
	scaleSliderX = (
		<RangeSlider
			value={sliderVal.x}
			onChange={v => {
				setSliderVal({ ...sliderVal, x: v ?? 0 });
			}}
			min={min}
			max={max ?? 100}
		/>
	);

	let scaleSliderY = undefined;
	scaleSliderY = (
		<RangeSlider
			value={sliderVal.y}
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
					width: imageInitialSize.width * val,
					height: imageInitialSize.height * val,
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
					width: imageInitialSize.width * xVal,
					height: imageInitialSize.height * yVal,
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
			width: imageRef.current.clientWidth,
			height: imageRef.current.clientHeight,
		};
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

		const width = calcWidthHeight(nTopLeft[0], nTopRight[0], nBottomLeft[0], nBottomRight[0]);
		const height = calcWidthHeight(nTopLeft[1], nTopRight[1], nBottomLeft[1], nBottomRight[1]);

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

	// useEffect(() => {
	// 	setImageUpdatedSize(imageInitialSize);
	// }, [imageInitialSize]);

	useEffect(() => {
		handleRotation(sliderRotationVal);
	}, [sliderRotationVal]);

	return (
		<div>
			<div
				className={`_popupBackground`}
				onClick={() => {
					setShowImageResizerPopup(false);
					setImage('');
				}}
			>
				<div className="_popupContainer _imageResize" onClick={e => e.stopPropagation()}>
					<div className="imageResizerHeader">
						<i style={{ color: '#fff' }} className="fa-solid fa-pen-to-square" />
						<span>Edit</span>
					</div>
					<div className="_popupEditorContainer">
						<div
							className="imagePopupEditorBackground"
							style={{
								height:
									(sliderRotationVal / 90) % 2 === 1
										? `${containerSize?.height}px`
										: '',
							}}
						>
							<div
								ref={imageWrapperRef}
								className="imageWrapper"
								style={{
									width: `${imageWrapperUpdatedSize?.width}px`,
									height: `${imageWrapperUpdatedSize?.height}px`,
								}}
							>
								<img
									className="uploadingImage"
									ref={imageRef}
									src={image}
									draggable={false}
									onLoad={e => handleImageLoad(e)}
									// onMouseDown={handleMouseDown}
									// onMouseUp={handleMouseUp}
									// onWheel={e => allowScroll && handleMouseWheel(e)}
									alt=""
									style={{
										width:
											imageUpdatedSize && imageUpdatedSize?.width
												? `${imageUpdatedSize?.width}px`
												: 'fit-content',
										height:
											imageUpdatedSize && imageUpdatedSize?.height
												? `${imageUpdatedSize?.height}px`
												: '223px',
										transform: `rotate(${sliderRotationVal}deg) translate(${
											-50 * scale.x
										}%, ${-50 * scale.y}%) scale(${scale.x}, ${scale.y})`,
									}}
								/>
							</div>
							{/* <div
                        ref={cropRectRef}
                        className="_cropArea"
                        draggable
                        style={{
                            top: `${cropAreaLeftTopBounding.top}px`,
                            left: `${cropAreaLeftTopBounding.left}px`,
                        }}
                    ></div> */}
						</div>
						{/** Tabs button */}
						<div className="_tabButtonsContainer">
							{/** Tab1 button */}
							<div
								onClick={() => setSelectedTab(1)}
								className={`tabBtn ${selectedTab === 1 ? 'selected' : ''}`}
							>
								<i className="fa-solid fa-crop-simple"></i>
								<span>Crop & Edit</span>
							</div>
							{/** Tab2 button */}
							<div
								onClick={() => setSelectedTab(2)}
								className={`tabBtn ${selectedTab === 2 ? 'selected' : ''}`}
							>
								<i className="fa-solid fa-expand"></i>
								<span>Resize Image</span>
							</div>
						</div>
						{/** Crop and Edit Tab */}
						{selectedTab === 1 ? (
							<div className="_editCrop">
								<p className="resizeLabel">
									Rotate <span className="resizeLabelInfo">i</span>
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
									Flip <span className="resizeLabelInfo">i</span>
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
							</div>
						) : (
							<div className="_editCrop">
								<p className="resizeLabel">
									Resize <span className="resizeLabelInfo">i</span>
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
											// onChange={v =>
											// 	// also add functionality to update container size
											// 	setImageUpdatedSize({
											// 		...imageUpdatedSize,
											// 		width: v.target.value,
											// 	})
											// }
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
											// onChange={v =>
											// 	// also add functionality to update container size
											// 	setImageUpdatedSize({
											// 		...imageUpdatedSize,
											// 		height: v.target.value,
											// 	})
											// }
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
							</div>
						)}
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
							onClick={async () => {
								try {
									await axios.post(
										`/api/files/static${path === '' ? '/' : path}`,
										formData,
										{
											headers,
										},
									);
								} catch (e) {}
								setInProgress(false);
								setShowImageResizerPopup(false);
								setImage('');
								callForFiles();
							}}
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImageResizer;
