import React, { useEffect } from 'react';
import { RangeSlider } from '../RangeSlider';
import { onMouseDownDragStartCurry } from '../../functions/utils';
import { CommonColorPicker } from '../CommonColorPicker';
import { getDataFromPath } from '../../context/StoreContext';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import axios from 'axios';

interface ImageResizer2Props {
	url: string;
	cropToWidth?: number;
	cropToHeight?: number;
	cropToCircle?: boolean;
	cropToMaxWidth?: number;
	cropToMaxHeight?: number;
	cropToMinWidth?: number;
	cropToMinHeight?: number;
	cropToAspectRatio?: string;
	onClose: () => void;
	onSave: (props: any) => void;
	isTransparent: boolean;
	fileName: string;
}

interface CropDimension {
	x: number;
	y: number;
	width: number;
	height: number;
}

const MIN_CROP_SIZE = 30;

export function ImageResizer2({
	url,
	cropToWidth,
	cropToHeight,
	cropToCircle,
	cropToMaxWidth,
	cropToMaxHeight,
	cropToMinWidth,
	cropToMinHeight,
	cropToAspectRatio,
	onClose,
	onSave,
	isTransparent,
	fileName,
}: ImageResizer2Props) {
	const imageRef = React.useRef<HTMLImageElement | null>(null);
	const [zoom, setZoom] = React.useState(1);
	const [size, setSize] = React.useState({ width: 0, height: 0 });
	const [imageSize, setImageSize] = React.useState<{ width?: number; height?: number }>({
		width: undefined,
		height: undefined,
	});
	const [rotate, setRotate] = React.useState(0);
	const [flipHorizontal, setFlipHorizontal] = React.useState(false);
	const [flipVertical, setFlipVertical] = React.useState(false);
	const [keepAspectRatio, setKeepAspectRatio] = React.useState(true);
	const [bgColor, setBgColor] = React.useState(isTransparent ? undefined : '#000000');
	const [showOverride, setShowOverride] = React.useState(false);

	const hasCrop = !!(
		cropToWidth ??
		cropToHeight ??
		cropToMaxWidth ??
		cropToMaxHeight ??
		cropToMinWidth ??
		cropToMinHeight ??
		cropToAspectRatio
	);

	let finFileName = fileName;
	if (hasCrop && fileName.indexOf('.') !== -1) {
		const ind = fileName.lastIndexOf('.');
		finFileName = fileName.substring(0, ind) + '_edit' + fileName.substring(ind);
	}

	const [overrideFileName, setOverrideFileName] = React.useState(finFileName);

	let x = 0,
		y = 0;

	const { width: actualWidth, height: actualHeight } = size;
	let { width: imgWidth = actualWidth, height: imgHeight = actualHeight } = imageSize;

	if (rotate != 0) {
		const {
			left,
			top,
			width: newWidth,
			height: newHeight,
		} = computeLeftAndTopForRotation(rotate, imgWidth, imgHeight, flipHorizontal, flipVertical);
		imgWidth = newWidth;
		imgHeight = newHeight;
		x = left * zoom;
		y = top * zoom;
	} else {
		if (flipHorizontal) x += imgWidth * zoom;
		if (flipVertical) y += imgHeight * zoom;
	}

	const aspects = cropToAspectRatio?.split(':')?.map(Number);

	const [crop, setCrop] = React.useState<CropDimension | undefined>(
		hasCrop
			? getDefaultCropBox({
					cropToWidth,
					cropToHeight,
					cropToCircle,
					cropToMaxWidth,
					cropToMaxHeight,
					cropToMinWidth,
					cropToMinHeight,
					cropToAspectRatio: aspects,
					size,
			  })
			: undefined,
	);

	useEffect(() => {
		setCrop(e => {
			if (
				(cropToHeight || cropToWidth) &&
				(e?.width !== cropToWidth || e?.height !== cropToHeight)
			) {
				return getDefaultCropBox({
					cropToWidth,
					cropToHeight,
					cropToCircle,
					cropToMaxWidth,
					cropToMaxHeight,
					cropToMinWidth,
					cropToMinHeight,
					cropToAspectRatio: aspects,
					size,
				});
			}

			return e;
		});
	}, [
		setCrop,
		hasCrop,
		cropToWidth,
		cropToHeight,
		cropToCircle,
		cropToMaxWidth,
		cropToMaxHeight,
		cropToMinWidth,
		cropToMinHeight,
		size,
	]);

	if (cropToMinWidth && cropToMaxWidth && cropToMinWidth > cropToMaxWidth) {
		let temp = cropToMinWidth;
		cropToMinWidth = cropToMaxWidth;
		cropToMaxWidth = temp;
	}

	if (cropToMinHeight && cropToMaxHeight && cropToMinHeight > cropToMaxHeight) {
		let temp = cropToMinHeight;
		cropToMinHeight = cropToMaxHeight;
		cropToMaxHeight = temp;
	}

	const cropDefaults = {
		cropToWidth,
		cropToHeight,
		cropToCircle,
		cropToMaxWidth,
		cropToMaxHeight,
		cropToMinWidth,
		cropToMinHeight,
		cropToAspectRatio: aspects,
	};

	let cropBox = null,
		cropTextBoxes = null;

	let translate = '';
	if (crop) {
		if (crop.x < 0 || crop.y < 0) {
			translate = `translate(${crop.x < 0 ? -crop.x : 0}px, ${crop.y < 0 ? -crop.y : 0}px)`;
		}
		cropBox = (
			<div
				className="_cropBox"
				style={{
					left: crop.x * zoom,
					top: crop.y * zoom,
					width: crop.width * zoom,
					height: crop.height * zoom,
					transform: translate,
				}}
				onMouseDown={onMouseDownDragStartCurry(crop.x * zoom, crop.y * zoom, (nX, nY) => {
					nX /= zoom;
					nY /= zoom;
					if (nX - 10 < -crop.width) nX = 10 - crop.width;
					else if (nX + 10 > imgWidth) nX = imgWidth - 10;
					if (nY - 10 < -crop.height) nY = 10 - crop.height;
					else if (nY + 10 > imgHeight) nY = imgHeight - 10;
					setCrop(c => ({ ...c!, x: nX, y: nY }));
				})}
			>
				<div className="_mask" />
				<div className="_horizontal1" />
				<div className="_horizontal2" />

				<div className="_vertical1" />
				<div className="_vertical2" />

				<div
					className="_topLeft"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 1, y: 1, width: 1, height: 1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_topRight"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 0, y: 1, width: -1, height: 1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_bottomLeft"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 1, y: 0, width: 1, height: -1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_bottomRight"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 0, y: 0, width: -1, height: -1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_top"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 0, y: 1, width: 0, height: 1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_bottom"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 0, y: 0, width: 0, height: -1 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_left"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 1, y: 0, width: 1, height: 0 },
							cropDefaults,
						),
					)}
				/>
				<div
					className="_right"
					onMouseDown={onMouseDownDragStartCurry(
						0,
						0,
						adjustCropBox(
							crop,
							setCrop,
							zoom,
							{ x: 0, y: 0, width: -1, height: 0 },
							cropDefaults,
						),
					)}
				/>
			</div>
		);

		cropTextBoxes = (
			<>
				<div className="_controlValue">
					<div className="_controlInput">
						<span>X</span>
						<input
							className="_size"
							type="number"
							value={crop.x}
							onChange={e => setCrop({ ...crop, x: parseInt(e.target.value) })}
						/>
					</div>
					<div className="_controlInput">
						<span>Y</span>
						<input
							className="_size"
							type="number"
							value={crop.y}
							onChange={e => setCrop({ ...crop, y: parseInt(e.target.value) })}
						/>
					</div>
				</div>
				<div className="_controlValue">
					<div className="_controlInput">
						<input
							className="_size"
							type="number"
							value={crop.width}
							readOnly={!!cropToWidth}
							onChange={
								!cropToWidth
									? e => {
											let width = parseInt(e.target.value);
											let height = crop.height;
											if (cropToAspectRatio) {
												if (!cropToHeight)
													height = Math.round(
														(width * aspects![1]) / aspects![0],
													);
												else
													width = Math.round(
														(height * aspects![0]) / aspects![1],
													);
											}
											if (cropToMinWidth && width < cropToMinWidth) return;
											if (cropToMaxWidth && width > cropToMaxWidth) return;
											if (cropToMinHeight && height < cropToMinHeight) return;
											if (cropToMaxHeight && height > cropToMaxHeight) return;
											setCrop({ ...crop, width, height });
									  }
									: undefined
							}
						/>
						<span>px (W)</span>
					</div>
					<div className="_controlInput">
						<input
							className="_size"
							type="number"
							value={crop.height}
							readOnly={!!cropToHeight}
							onChange={
								!cropToHeight
									? e => {
											let height = parseInt(e.target.value);
											let width = crop.width;
											if (cropToAspectRatio) {
												if (!cropToWidth)
													width = Math.round(
														(height * aspects![0]) / aspects![1],
													);
												else
													height = Math.round(
														(width * aspects![1]) / aspects![0],
													);
											}
											if (cropToMinWidth && width < cropToMinWidth) return;
											if (cropToMaxWidth && width > cropToMaxWidth) return;
											if (cropToMinHeight && height < cropToMinHeight) return;
											if (cropToMaxHeight && height > cropToMaxHeight) return;
											setCrop({ ...crop, width, height });
									  }
									: undefined
							}
						/>
						<span>px (H)</span>
					</div>
				</div>
			</>
		);
	}

	let overrideDialog = null;
	if (showOverride) {
		overrideDialog = (
			<div className="_iroBackground">
				<div className="_iroContainer">
					<div className="_imageResizerHeader _iroHeader">
						<ResizerIcon
							size={16}
							pathData="M14.7375 0.513281C14.0531 -0.171094 12.9469 -0.171094 12.2625 0.513281L11.3219 1.45078L14.3813 4.51016L15.3219 3.56953C16.0063 2.88516 16.0063 1.77891 15.3219 1.09453L14.7375 0.513281ZM5.3875 7.38828C5.19687 7.57891 5.05 7.81328 4.96562 8.07266L4.04063 10.8477C3.95 11.1164 4.02188 11.4133 4.22188 11.6164C4.42188 11.8195 4.71875 11.8883 4.99062 11.7977L7.76562 10.8727C8.02188 10.7883 8.25625 10.6414 8.45 10.4508L13.6781 5.21953L10.6156 2.15703L5.3875 7.38828ZM3 1.83516C1.34375 1.83516 0 3.17891 0 4.83516V12.8352C0 14.4914 1.34375 15.8352 3 15.8352H11C12.6562 15.8352 14 14.4914 14 12.8352V9.83516C14 9.28203 13.5531 8.83516 13 8.83516C12.4469 8.83516 12 9.28203 12 9.83516V12.8352C12 13.3883 11.5531 13.8352 11 13.8352H3C2.44688 13.8352 2 13.3883 2 12.8352V4.83516C2 4.28203 2.44688 3.83516 3 3.83516H6C6.55312 3.83516 7 3.38828 7 2.83516C7 2.28203 6.55312 1.83516 6 1.83516H3Z"
						/>
						Change / Override
					</div>

					<div className="_iroBody">
						<span>Enter a new file name to make a copy</span>
						<div className="_controlInput">
							<input
								type="text"
								value={overrideFileName}
								onChange={e => setOverrideFileName(e.target.value)}
							/>
						</div>
					</div>
					<div className="_iroButtons">
						<button onClick={() => setShowOverride(false)}>Cancel</button>
						<button
							onClick={() => {
								if (hasCrop && overrideFileName == fileName) {
									alert('Cannot use the same file name as the original file.');
									return;
								}
								onSave({
									crop,
									rotate,
									flipHorizontal,
									flipVertical,
									imageSize,
									bgColor,
									fileName: overrideFileName,
								});
							}}
						>
							Edit
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="_imageResizer">
			{overrideDialog}
			<div className="_imageResizerHeader">
				<ResizerIcon
					size={16}
					pathData="M14.7375 0.513281C14.0531 -0.171094 12.9469 -0.171094 12.2625 0.513281L11.3219 1.45078L14.3813 4.51016L15.3219 3.56953C16.0063 2.88516 16.0063 1.77891 15.3219 1.09453L14.7375 0.513281ZM5.3875 7.38828C5.19687 7.57891 5.05 7.81328 4.96562 8.07266L4.04063 10.8477C3.95 11.1164 4.02188 11.4133 4.22188 11.6164C4.42188 11.8195 4.71875 11.8883 4.99062 11.7977L7.76562 10.8727C8.02188 10.7883 8.25625 10.6414 8.45 10.4508L13.6781 5.21953L10.6156 2.15703L5.3875 7.38828ZM3 1.83516C1.34375 1.83516 0 3.17891 0 4.83516V12.8352C0 14.4914 1.34375 15.8352 3 15.8352H11C12.6562 15.8352 14 14.4914 14 12.8352V9.83516C14 9.28203 13.5531 8.83516 13 8.83516C12.4469 8.83516 12 9.28203 12 9.83516V12.8352C12 13.3883 11.5531 13.8352 11 13.8352H3C2.44688 13.8352 2 13.3883 2 12.8352V4.83516C2 4.28203 2.44688 3.83516 3 3.83516H6C6.55312 3.83516 7 3.38828 7 2.83516C7 2.28203 6.55312 1.83516 6 1.83516H3Z"
				/>
				Edit
			</div>
			<div className="_imageResizerBody">
				<div
					className="_imagePreviewer"
					style={bgColor ? { backgroundColor: bgColor, backgroundImage: 'none' } : {}}
				>
					<div className="_imageZOOM">
						<button onClick={() => setZoom(zoom + (zoom > 0.1 ? 0.1 : 0.01))}>+</button>
						<button onClick={() => setZoom(1)}>o</button>
						<button
							onClick={() =>
								setZoom(
									zoom -
										(zoom <= 0.1 || Math.abs(0.1 - zoom) < Number.EPSILON
											? 0.01
											: 0.1),
								)
							}
						>
							-
						</button>
					</div>
					<div
						className="_imageSizeDisplayer"
						style={{
							width: imgWidth * zoom,
							height: imgHeight * zoom,
							transform: translate,
						}}
					/>
					{cropBox}
					<img
						ref={async r => {
							imageRef.current = r;

							if (!r || r.src) return;

							if (url.indexOf('api/files/secured') !== -1) {
								const headers: any = {
									Authorization: getDataFromPath(
										`${LOCAL_STORE_PREFIX}.AuthToken`,
										[],
									),
								};
								if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

								r.src = await axios
									.get(url, { responseType: 'blob', headers })
									.then(res => URL.createObjectURL(res.data));
							} else r.src = url;
						}}
						style={{
							transform: `scale(${zoom}) rotate(${rotate}deg) ${
								flipHorizontal ? 'scaleX(-1)' : ''
							} ${flipVertical ? 'scaleY(-1)' : ''} ${translate}`,
							left: `${x}px`,
							top: `${y}px`,
						}}
						onLoad={e => {
							const { width, height } = e.currentTarget.getBoundingClientRect();
							setSize({ width, height });
						}}
						width={imageSize.width ?? 'auto'}
						height={imageSize.height ?? 'auto'}
					/>
				</div>
				<div className="_imageControls">
					<div className="_controlGroup">
						<div className="_controlHeader">
							<ResizerIcon
								size={14}
								pathData="M3.5 0.875C3.5 0.391016 3.10898 0 2.625 0C2.14102 0 1.75 0.391016 1.75 0.875V1.75H0.875C0.391016 1.75 0 2.14102 0 2.625C0 3.10898 0.391016 3.5 0.875 3.5H1.75V10.5C1.75 11.4652 2.53477 12.25 3.5 12.25H9.625V10.5H3.5V0.875ZM10.5 13.125C10.5 13.609 10.891 14 11.375 14C11.859 14 12.25 13.609 12.25 13.125V12.25H13.125C13.609 12.25 14 11.859 14 11.375C14 10.891 13.609 10.5 13.125 10.5H12.25V3.5C12.25 2.53477 11.4652 1.75 10.5 1.75H4.375V3.5H10.5V13.125Z"
							/>
							Crop & Rotate
						</div>
						<div className="_controlBody">
							<div className="_controlLabel">
								{!hasCrop && (
									<input
										id="cropBox"
										type="checkbox"
										checked={!!crop}
										onChange={e =>
											setCrop(
												e.target.checked
													? getDefaultCropBox({
															cropToWidth,
															cropToHeight,
															cropToCircle,
															cropToMaxWidth,
															cropToMaxHeight,
															cropToMinWidth,
															cropToMinHeight,
															size,
													  })
													: undefined,
											)
										}
									/>
								)}
								<label htmlFor="cropBox">Crop</label>
							</div>
							{cropTextBoxes}
							<div className="_controlLabel">Rotate</div>
							<div className="_controlValue">
								<button onClick={() => setRotate((rotate + 270) % 360)}>
									<ResizerIcon
										size={16}
										pathData="M2.344,2.344,1.281,1.281A.751.751,0,0,0,0,1.809V5.25A.748.748,0,0,0,.75,6H4.191a.751.751,0,0,0,.531-1.281l-.962-.963a6,6,0,1,1,.813,9.169,1,1,0,1,0-1.147,1.641A8,8,0,1,0,2.344,2.344Z"
									/>
									90&deg;
								</button>
								<button onClick={() => setRotate((rotate + 90) % 360)}>
									<ResizerIcon
										size={16}
										pathData="M13.6562 2.34375L14.7188 1.28125C15.1906 0.809375 16 1.14375 16 1.80938V5.25C16 5.66563 15.6656 6 15.25 6H11.8094C11.1406 6 10.8062 5.19063 11.2781 4.71875L12.2406 3.75625C11.1562 2.67188 9.65625 2 8 2C4.6875 2 2 4.6875 2 8C2 11.3125 4.6875 14 8 14C9.275 14 10.4562 13.6031 11.4281 12.925C11.8812 12.6094 12.5031 12.7188 12.8219 13.1719C13.1406 13.625 13.0281 14.2469 12.575 14.5656C11.275 15.4688 9.69688 16 8 16C3.58125 16 0 12.4187 0 8C0 3.58125 3.58125 0 8 0C10.2094 0 12.2094 0.896875 13.6562 2.34375Z"
									/>
									90&deg;
								</button>
							</div>
							<div className="_controlValue">
								<RangeSlider
									value={rotate}
									onChange={setRotate}
									min={0}
									max={359}
									step={1}
								/>
								<div className="_controlInput">
									<input
										className="_degrees"
										type="number"
										value={rotate}
										min={0}
										max={359}
										onChange={e => setRotate(parseInt(e.target.value))}
									/>
									<span>deg</span>
								</div>
							</div>
							<div className="_controlLabel">Flip</div>
							<div className="_controlValue">
								<button onClick={() => setFlipHorizontal(!flipHorizontal)}>
									<ResizerIcon
										size={16}
										pathData="M8.68571 0.615385V15.3846C8.68571 15.7243 8.37851 16 8 16C7.62149 16 7.31429 15.7243 7.31429 15.3846V0.615385C7.31429 0.275692 7.62149 0 8 0C8.37851 0 8.68571 0.275692 8.68571 0.615385ZM5.25714 0.820513H2.51429C1.12731 0.820513 0 1.83221 0 3.07692V12.9231C0 14.1678 1.12731 15.1795 2.51429 15.1795H5.25714C5.63566 15.1795 5.94286 14.9038 5.94286 14.5641V1.4359C5.94286 1.09621 5.63566 0.820513 5.25714 0.820513ZM12.1143 13.9487H10.7429C10.3643 13.9487 10.0571 14.2244 10.0571 14.5641C10.0571 14.9038 10.3643 15.1795 10.7429 15.1795H12.1143C12.4928 15.1795 12.8 14.9038 12.8 14.5641C12.8 14.2244 12.4928 13.9487 12.1143 13.9487ZM15.3143 6.13908C14.9358 6.13908 14.6286 6.41477 14.6286 6.75446V9.24882C14.6286 9.58851 14.9358 9.86421 15.3143 9.86421C15.6928 9.86421 16 9.58851 16 9.24882V6.75446C16 6.41477 15.6928 6.13908 15.3143 6.13908ZM15.3143 11.127C14.9358 11.127 14.6286 11.4027 14.6286 11.7424V12.9231C14.6286 13.2021 14.5051 13.4638 14.2821 13.6591C14.0105 13.8962 14.0041 14.2859 14.2683 14.5296C14.4027 14.6535 14.581 14.7159 14.7602 14.7159C14.9321 14.7159 15.1049 14.6576 15.2384 14.5419C15.7303 14.1128 16 13.5385 16 12.9239V11.7432C16 11.4035 15.6928 11.1278 15.3143 11.1278V11.127ZM15.2421 1.46215C14.9714 1.22503 14.5371 1.22913 14.272 1.47282C14.0069 1.71569 14.0123 2.10544 14.2839 2.34338C14.5061 2.53785 14.6286 2.79877 14.6286 3.07774V4.26174C14.6286 4.60144 14.9358 4.87713 15.3143 4.87713C15.6928 4.87713 16 4.60144 16 4.26174V3.07774C16 2.46482 15.7312 1.89046 15.2421 1.46215ZM12.1143 0.820513H10.7429C10.3643 0.820513 10.0571 1.09621 10.0571 1.4359C10.0571 1.77559 10.3643 2.05128 10.7429 2.05128H12.1143C12.4928 2.05128 12.8 1.77559 12.8 1.4359C12.8 1.09621 12.4928 0.820513 12.1143 0.820513Z"
									/>
									Horizontal
								</button>
								<button onClick={() => setFlipVertical(!flipVertical)}>
									<ResizerIcon
										size={16}
										pathData="M0.615385 7.31429L15.3846 7.31429C15.7243 7.31429 16 7.62149 16 8C16 8.37851 15.7243 8.68571 15.3846 8.68571L0.615385 8.68571C0.275692 8.68571 0 8.37851 0 8C0 7.62149 0.275692 7.31429 0.615385 7.31429ZM0.820513 10.7429L0.820513 13.4857C0.820513 14.8727 1.83221 16 3.07692 16H12.9231C14.1678 16 15.1795 14.8727 15.1795 13.4857V10.7429C15.1795 10.3643 14.9038 10.0571 14.5641 10.0571L1.4359 10.0571C1.09621 10.0571 0.820513 10.3643 0.820513 10.7429ZM13.9487 3.88571V5.25714C13.9487 5.63566 14.2244 5.94286 14.5641 5.94286C14.9038 5.94286 15.1795 5.63566 15.1795 5.25714V3.88571C15.1795 3.5072 14.9038 3.2 14.5641 3.2C14.2244 3.2 13.9487 3.5072 13.9487 3.88571ZM6.13908 0.685714C6.13908 1.06423 6.41477 1.37143 6.75446 1.37143L9.24882 1.37143C9.58851 1.37143 9.86421 1.06423 9.86421 0.685714C9.86421 0.307199 9.58851 0 9.24882 0L6.75446 0C6.41477 0 6.13908 0.307199 6.13908 0.685714ZM11.127 0.685714C11.127 1.06423 11.4027 1.37143 11.7424 1.37143H12.9231C13.2021 1.37143 13.4638 1.49486 13.6591 1.71794C13.8962 1.98949 14.2859 1.99588 14.5296 1.73166C14.6535 1.59726 14.7159 1.41897 14.7159 1.23977C14.7159 1.06789 14.6576 0.895085 14.5419 0.7616C14.1128 0.269714 13.5385 0 12.9239 0H11.7432C11.4035 0 11.1278 0.307199 11.1278 0.685714H11.127ZM1.46215 0.757943C1.22503 1.02857 1.22913 1.46286 1.47282 1.728C1.71569 1.99314 2.10544 1.98766 2.34338 1.71611C2.53785 1.49394 2.79877 1.37143 3.07774 1.37143H4.26174C4.60144 1.37143 4.87713 1.06423 4.87713 0.685714C4.87713 0.307199 4.60144 0 4.26174 0H3.07774C2.46482 0 1.89046 0.268801 1.46215 0.757943ZM0.820513 3.88571L0.820513 5.25714C0.820513 5.63566 1.09621 5.94286 1.4359 5.94286C1.77559 5.94286 2.05128 5.63566 2.05128 5.25714V3.88571C2.05128 3.5072 1.77559 3.2 1.4359 3.2C1.09621 3.2 0.820513 3.5072 0.820513 3.88571Z"
									/>
									Vertical
								</button>
							</div>
						</div>
					</div>
					<div className="_controlGroup">
						<div className="_controlHeader">
							<ResizerIcon
								size={14}
								pathData="M2 1.9H1.9V2V4C1.9 4.4979 1.4979 4.9 1 4.9C0.502103 4.9 0.1 4.4979 0.1 4V1C0.1 0.502103 0.502103 0.1 1 0.1H4C4.4979 0.1 4.9 0.502103 4.9 1C4.9 1.4979 4.4979 1.9 4 1.9H2ZM1.9 12V12.1H2H4C4.4979 12.1 4.9 12.5021 4.9 13C4.9 13.4979 4.4979 13.9 4 13.9H1C0.502103 13.9 0.1 13.4979 0.1 13V10C0.1 9.5021 0.502103 9.1 1 9.1C1.4979 9.1 1.9 9.5021 1.9 10V12ZM12.1 2V1.9H12H10C9.5021 1.9 9.1 1.4979 9.1 1C9.1 0.502103 9.5021 0.1 10 0.1H13C13.4979 0.1 13.9 0.502103 13.9 1V4C13.9 4.4979 13.4979 4.9 13 4.9C12.5021 4.9 12.1 4.4979 12.1 4V2ZM12 12.1H12.1V12V10C12.1 9.5021 12.5021 9.1 13 9.1C13.4979 9.1 13.9 9.5021 13.9 10V13C13.9 13.4979 13.4979 13.9 13 13.9H10C9.5021 13.9 9.1 13.4979 9.1 13C9.1 12.5021 9.5021 12.1 10 12.1H12Z"
							/>
							Resize
						</div>
						<div className="_controlBody">
							<div className="_controlLabel">Resize</div>
							<div className="_controlValue">
								<div className="_controlInput">
									<input
										className="_size"
										type="number"
										value={imageSize.width ?? size.width}
										onChange={e => {
											const width = parseInt(e.target.value);
											setImageSize({
												width,
												height: keepAspectRatio
													? Math.round((width / size.width) * size.height)
													: imageSize.height ?? size.height,
											});
										}}
									/>
									<span>px (W)</span>
								</div>
								<svg
									className={`_aspectRatio ${keepAspectRatio ? '_active' : ''}`}
									onClick={() => {
										setKeepAspectRatio(!keepAspectRatio);
										if (!keepAspectRatio) {
											const widthPercent = Math.round(
												((imageSize.width ?? size.width) * 100) /
													size.width,
											);
											const heightPercent = Math.round(
												((imageSize.height ?? size.height) * 100) /
													size.height,
											);
											if (widthPercent === heightPercent) return;
											setImageSize({
												width: size.width,
												height: size.height,
											});
										}
									}}
									width="16"
									height="8"
									viewBox="0 0 16 8"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M0 3.99964C0 6.00794 1.62806 7.63601 3.63636 7.63601H5.81818C6.21984 7.63601 6.54545 7.31041 6.54545 6.90874C6.54545 6.50706 6.21984 6.18146 5.81818 6.18146H3.63636C2.43138 6.18146 1.45455 5.20466 1.45455 3.99964C1.45455 2.79463 2.43138 1.81783 3.63636 1.81783H5.81818C6.21984 1.81783 6.54545 1.49221 6.54545 1.09055C6.54545 0.688889 6.21984 0.363281 5.81818 0.363281H3.63636C1.62806 0.363281 0 1.99134 0 3.99964Z"
										fill="currentColor"
									/>
									<path
										d="M9.45508 6.90874C9.45508 7.31041 9.78068 7.63601 10.1824 7.63601H12.3642C14.3725 7.63601 16.0005 6.00794 16.0005 3.99964C16.0005 1.99134 14.3725 0.363281 12.3642 0.363281H10.1824C9.78068 0.363281 9.45508 0.688889 9.45508 1.09055C9.45508 1.49221 9.78068 1.81783 10.1824 1.81783H12.3642C13.5692 1.81783 14.546 2.79463 14.546 3.99964C14.546 5.20466 13.5692 6.18146 12.3642 6.18146H10.1824C9.78068 6.18146 9.45508 6.50706 9.45508 6.90874Z"
										fill="currentColor"
									/>
									<path
										d="M5.09055 4.72603C4.6889 4.72603 4.36328 4.40043 4.36328 3.99876C4.36328 3.59708 4.6889 3.27148 5.09055 3.27148H10.9087C11.3104 3.27148 11.636 3.59708 11.636 3.99876C11.636 4.40043 11.3104 4.72603 10.9087 4.72603H5.09055Z"
										fill="currentColor"
									/>
								</svg>
								<div className="_controlInput">
									<input
										className="_size"
										type="number"
										value={imageSize.height ?? size.height}
										onChange={e => {
											const height = parseInt(e.target.value);
											setImageSize({
												height,
												width: keepAspectRatio
													? (height / size.height) * size.width
													: imageSize.width ?? size.width,
											});
										}}
									/>
									<span>px (H)</span>
								</div>
							</div>

							{keepAspectRatio ? (
								<>
									<div className="_controlLabel">Size</div>
									<div className="_controlValue">
										<RangeSlider
											value={Math.round(
												((imageSize.width ?? size.width) * 100) /
													size.width,
											)}
											onChange={v =>
												setImageSize({
													width: Math.round((v * size.width) / 100),
													height: Math.round((v * size.height) / 100),
												})
											}
											min={1}
											max={200}
											step={1}
										/>
									</div>
								</>
							) : (
								<>
									<div className="_controlLabel">Width</div>
									<div className="_controlValue">
										<RangeSlider
											value={Math.round(
												((imageSize.width ?? size.width) * 100) /
													size.width,
											)}
											onChange={v =>
												setImageSize({
													width: Math.round((v * size.width) / 100),
													height: imageSize.height,
												})
											}
											min={1}
											max={200}
											step={1}
										/>
									</div>
									<div className="_controlLabel">Height</div>
									<div className="_controlValue">
										<RangeSlider
											value={Math.round(
												((imageSize.height ?? size.height) * 100) /
													size.height,
											)}
											onChange={v =>
												setImageSize({
													width: imageSize.width,
													height: Math.round((v * size.height) / 100),
												})
											}
											min={1}
											max={200}
											step={1}
										/>
									</div>
								</>
							)}

							<div className="_controlLabel">
								Background Color{' '}
								<CommonColorPicker
									color={{ value: bgColor }}
									showAlpha={isTransparent}
									variableSelection={false}
									onChange={e =>
										setBgColor(
											e.value
												? e.value
												: isTransparent
												? undefined
												: '#000000',
										)
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="_imageResizerFooter">
				<button onClick={onClose}>Cancel</button>
				<button
					onClick={() => {
						if (url.startsWith('data')) {
							onSave({
								crop,
								rotate,
								flipHorizontal,
								flipVertical,
								imageSize,
								bgColor,
							});
						} else {
							setShowOverride(true);
						}
					}}
				>
					{url.startsWith('data') ? 'Upload' : 'Edit'}
				</button>
			</div>
		</div>
	);
}

function adjustCropBox(
	crop: CropDimension,
	setCrop: (crop: CropDimension) => void,
	zoom: number,
	changeDefaults: {
		x: number;
		y: number;
		width: number;
		height: number;
	},
	cropDefaults: {
		cropToWidth?: number;
		cropToHeight?: number;
		cropToCircle?: boolean;
		cropToMaxWidth?: number;
		cropToMaxHeight?: number;
		cropToMinWidth?: number;
		cropToMinHeight?: number;
		cropToAspectRatio?: number[];
	},
) {
	const {
		cropToWidth,
		cropToHeight,
		cropToMaxWidth,
		cropToMaxHeight,
		cropToMinWidth,
		cropToMinHeight,
		cropToAspectRatio,
	} = cropDefaults;

	const { x: changeX, y: changeY, width: changeWidth, height: changeHeight } = changeDefaults;
	let [aspectWidth, aspectHeight] = cropToAspectRatio ?? [];

	return (nX: number, nY: number) => {
		nX /= zoom;
		nY /= zoom;

		let width = crop.width - nX * changeWidth;
		if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
		if (cropToWidth) width = cropToWidth;
		else if (cropToMinWidth && width < cropToMinWidth) width = cropToMinWidth;
		else if (cropToMaxWidth && width > cropToMaxWidth) width = cropToMaxWidth;

		let height = crop.height - nY * changeHeight;
		if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;
		if (cropToHeight) height = cropToHeight;
		else if (cropToMinHeight && height < cropToMinHeight) height = cropToMinHeight;
		else if (cropToMaxHeight && height > cropToMaxHeight) height = cropToMaxHeight;

		if (cropToAspectRatio && (!cropToWidth || !cropToHeight)) {
			if (aspectHeight === undefined) aspectHeight = aspectWidth;

			if (!cropToWidth && !changeHeight)
				width = Math.round((height * aspectWidth) / aspectHeight);
			else height = Math.round((width * aspectHeight) / aspectWidth);
		}

		setCrop({
			x: crop.x + (crop.width - width) * changeX,
			y: crop.y + (crop.height - height) * changeY,
			width: changeWidth ? width : crop.width,
			height: changeHeight ? height : crop.height,
		});
	};
}

function getDefaultCropBox({
	cropToWidth,
	cropToHeight,
	cropToCircle,
	cropToMaxWidth,
	cropToMaxHeight,
	cropToMinWidth,
	cropToMinHeight,
	cropToAspectRatio,
	size,
}: {
	cropToWidth?: number;
	cropToHeight?: number;
	cropToCircle?: boolean;
	cropToMaxWidth?: number;
	cropToMaxHeight?: number;
	cropToMinWidth?: number;
	cropToMinHeight?: number;
	cropToAspectRatio?: number[];
	size: { width: number; height: number };
}): { x: number; y: number; width: number; height: number } {
	const defaults = {
		x: 0,
		y: 0,
		width:
			cropToWidth ??
			cropToMinWidth ??
			cropToMaxWidth ??
			Math.max(Math.round(size.width / 10), MIN_CROP_SIZE),
		height:
			cropToHeight ??
			cropToMinHeight ??
			cropToMaxHeight ??
			Math.max(Math.round(size.height / 10), MIN_CROP_SIZE),
	};

	if (cropToAspectRatio && (!cropToWidth || !cropToHeight)) {
		const [aspectWidth, aspectHeight] = cropToAspectRatio;
		if (aspectHeight === undefined) cropToAspectRatio[1] = aspectWidth;
		if (!cropToWidth) {
			defaults.width = Math.round((defaults.height * aspectWidth) / aspectHeight);
		} else {
			defaults.height = Math.round((defaults.width * aspectHeight) / aspectWidth);
		}
	}

	return defaults;
}

function cartesianCoordinatesToPolar(x: number, y: number): { r: number; theta: number } {
	const r = Math.sqrt(x * x + y * y);
	const theta = Math.atan2(y, x);
	return { r, theta };
}

function polarCoordinatesToCartesian(r: number, theta: number): { x: number; y: number } {
	const x = r * Math.cos(theta);
	const y = r * Math.sin(theta);
	return { x, y };
}

// To compute the left and top after rotation, here we are coming up with 4 co-ordinates of the rectangular images.
// These 4 co-ordinates are then rotated by the given angle by converting them to polar co-ordinates and then back to cartesian co-ordinates.
// If there is a flip, then the rectangle is displaced by the width or height or both so the origin in the polar co-ordinates is changed.
// The left and top are then computed by taking the minimum of the 4 co-ordinates and multiplied by -1 to reverse the displacement caused by rotation.
// The rotated image will have different width and height than the one we started with.
function computeLeftAndTopForRotation(
	rotate: number,
	width: number,
	height: number,
	flipHorizontal: boolean,
	flipVertical: boolean,
): { left: number; top: number; width: number; height: number } {
	const angle = (rotate * Math.PI) / 180;
	let x1 = 0,
		y1 = 0, // top left corner
		x2 = width,
		y2 = 0, // top right corner
		x3 = width,
		y3 = height, // bottom right corner
		x4 = 0,
		y4 = height; // bottom left corner

	if (flipHorizontal) {
		x1 -= width;
		x2 -= width;
		x3 -= width;
		x4 -= width;
	}

	if (flipVertical) {
		y1 -= height;
		y2 -= height;
		y3 -= height;
		y4 -= height;
	}

	// top left corner
	const { r: r1, theta: theta1 } = cartesianCoordinatesToPolar(x1, y1);
	({ x: x1, y: y1 } = polarCoordinatesToCartesian(r1, theta1 + angle));

	// top right corner
	const { r: r2, theta: theta2 } = cartesianCoordinatesToPolar(x2, y2);
	({ x: x2, y: y2 } = polarCoordinatesToCartesian(r2, theta2 + angle));

	// bottom right corner
	const { r: r3, theta: theta3 } = cartesianCoordinatesToPolar(x3, y3);
	({ x: x3, y: y3 } = polarCoordinatesToCartesian(r3, theta3 + angle));

	// bottom left corner
	const { r: r4, theta: theta4 } = cartesianCoordinatesToPolar(x4, y4);
	({ x: x4, y: y4 } = polarCoordinatesToCartesian(r4, theta4 + angle));

	width = Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4);
	height = Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4);

	const left = Math.min(x1, x2, x3, x4) * -1;
	const top = Math.min(y1, y2, y3, y4) * -1;

	return { left, top, width, height };
}

function ResizerIcon({ size, pathData }: Readonly<{ size: number; pathData: string }>) {
	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d={pathData} fill="currentColor" />
		</svg>
	);
}
