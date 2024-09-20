import React, { useState, useEffect } from 'react';

import { CommonColorPickerPropertyEditor } from '../../../../commonComponents/CommonColorPicker';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorMultipleValueType,
	SimpleEditorType,
	StyleEditorsProps,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { PixelSize } from './simpleEditors/SizeSliders';
import { Dropdown, DropdownOptions } from './simpleEditors/Dropdown';
import { ComponentProperty } from '../../../../types/common';

export function BackgroundEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <BackgroundDetailedEditor {...props} />;
	}

	return <BackgroundStandardEditor {...props} />;
}

function BackgroundDetailedEditor({
	selectedComponent,
	subComponentName,
	iterateProps,
	pseudoState,
	selectorPref,
	selectedComponentsList,
	defPath,
	locationHistory,
	pageExtractor,
	styleProps,
	saveStyle,
	properties,
}: Readonly<StyleEditorsProps>) {
	const [attachment, setAttachment] = useState<string>('');
	const [blendMode, setBlendMode] = useState<string>('');
	const [opacity, setOpacity] = useState<string>('');
	const [clip, setClip] = useState<string>('');
	const [origin, setOrigin] = useState<string>('');
	const [backdropFilter, setBackdropFilter] = useState<string>('');
	const [selectedFilter, setSelectedFilter] = useState<string>('');
	const [backdropFilterValue, setBackdropFilterValue] = useState<string>('');

	useEffect(() => {
		if (!selectedComponent) return;

		const extractAndSetValue = (
			prop: string,
			setter: React.Dispatch<React.SetStateAction<string>>,
		) => {
			const extractedValue = extractValue({
				subComponentName,
				prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value;
			setter(extractedValue || '');
		};

		extractAndSetValue('backgroundAttachment', setAttachment);
		extractAndSetValue('backgroundBlendMode', setBlendMode);
		extractAndSetValue('backgroundOpacity', setOpacity);
		extractAndSetValue('backgroundClip', setClip);
		extractAndSetValue('backgroundOrigin', setOrigin);
		extractAndSetValue('backdropFilter', setBackdropFilter);
	}, [selectedComponent, subComponentName, iterateProps, pseudoState, selectorPref]);

	const onChangeCurry = (propType: string) => (value: string | ComponentProperty<string>) => {
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'background' + propType, value: value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const onChangeBDFCurry = (propType: string) => (value: string | ComponentProperty<string>) => {
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: propType, value: value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const handleBackdropFilterChange = (filter: string, value: string) => {
		const newFilter = value ? `${filter}(${value})` : '';
		setBackdropFilter(newFilter);
		onChangeBDFCurry('backdropFilter')(newFilter);
	};

	// for multiple filters
	// const handleBackdropFilterChange = (filter: string, value: string) => {
	// 	const newFilter = value ? `${filter}(${value})` : '';
	// 	const filterRegex = new RegExp(`${filter}\\([^)]*\\)`);

	// 	let updatedFilters = backdropFilter;
	// 	if (backdropFilter.match(filterRegex)) {
	// 		updatedFilters = backdropFilter.replace(filterRegex, newFilter);
	// 	} else {
	// 		updatedFilters = backdropFilter
	// 			.split(/\s+/)
	// 			.filter(Boolean)
	// 			.concat(newFilter)
	// 			.join(' ');
	// 	}

	// 	setBackdropFilter(updatedFilters);
	// 	onChangeBDFCurry('backdropFilter')(updatedFilters);
	// };

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Attachment</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'scroll',
								description: 'Scroll',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<path
											d="M6 6h12v12H6z"
											fill="currentColor"
											fillOpacity="0.3"
										/>
										<path d="M8 18l8-8" stroke="currentColor" strokeWidth="2" />
									</g>
								),
							},
							{
								name: 'fixed',
								description: 'Fixed',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<path
											d="M6 6h12v12H6z"
											fill="currentColor"
											fillOpacity="0.3"
										/>
										<path
											d="M6 18h12M6 6h12"
											stroke="currentColor"
											strokeWidth="2"
										/>
									</g>
								),
							},
							{
								name: 'local',
								description: 'Local',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<path
											d="M6 6h12v12H6z"
											fill="currentColor"
											fillOpacity="0.3"
										/>
										<path
											d="M6 10h12M6 14h12"
											stroke="currentColor"
											strokeWidth="2"
										/>
									</g>
								),
							},
						]}
						selected={attachment}
						onChange={v => onChangeCurry('Attachment')(v as string)}
						withBackground={true}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Blend Mode</div>
				<div className="_simpleEditor">
					<Dropdown
						options={[
							{ name: 'normal', displayName: 'Normal' },
							{ name: 'multiply', displayName: 'Multiply' },
							{ name: 'screen', displayName: 'Screen' },
							{ name: 'overlay', displayName: 'Overlay' },
							{ name: 'darken', displayName: 'Darken' },
							{ name: 'lighten', displayName: 'Lighten' },
							{ name: 'color-dodge', displayName: 'Color Dodge' },
							{ name: 'color-burn', displayName: 'Color Burn' },
							{ name: 'hard-light', displayName: 'Hard Light' },
							{ name: 'soft-light', displayName: 'Soft Light' },
							{ name: 'difference', displayName: 'Difference' },
							{ name: 'exclusion', displayName: 'Exclusion' },
							{ name: 'hue', displayName: 'Hue' },
							{ name: 'saturation', displayName: 'Saturation' },
							{ name: 'color', displayName: 'Color' },
							{ name: 'luminosity', displayName: 'Luminosity' },
						]}
						value={blendMode}
						onChange={v => onChangeCurry('BlendMode')(v as string)}
					/>
				</div>
			</div>
			{/* <div className="_combineEditors">
				<div className="_simpleLabel">Opacity</div>
				<div className="_simpleEditor">
					<PixelSize value={opacity} onChange={onChangeCurry('Opacity')} />
				</div>
			</div> */}

			<div className="_combineEditors">
				<div className="_simpleLabel">Clip</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'border-box',
								description: 'Border Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'padding-box',
								description: 'Padding Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'content-box',
								description: 'Content Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="8"
											y="8"
											width="8"
											height="8"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'text',
								description: 'Text',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<text
											x="12"
											y="16"
											fontSize="14"
											fontWeight="bold"
											textAnchor="middle"
											fill="currentColor"
										>
											T
										</text>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="currentColor"
											fillOpacity="0.1"
										/>
									</g>
								),
							},
							{
								name: 'border-area',
								description: 'Border Area',
								icon: (
									<g transform="translate(7 7)">
										<rect
											x="2"
											y="2"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="2"
											y="2"
											width="14"
											height="14"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
						]}
						selected={clip}
						onChange={v => onChangeCurry('Clip')(v as string)}
						withBackground={true}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Origin</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'border-box',
								description: 'Border Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'padding-box',
								description: 'Padding Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'content-box',
								description: 'Content Box',
								icon: (
									<g transform="translate(4 4)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="4"
											y="4"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="8"
											y="8"
											width="8"
											height="8"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
						]}
						selected={origin}
						onChange={v => onChangeCurry('Origin')(v as string)}
						withBackground={true}
					/>
				</div>
			</div>
			<div className="_simpleLabel">Backdrop Filter</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Filter</div>
				<div className="_simpleEditor">
					<Dropdown
						options={[
							{ name: 'blur', displayName: 'Blur' },
							{ name: 'brightness', displayName: 'Brightness' },
							{ name: 'contrast', displayName: 'Contrast' },
							{ name: 'drop-shadow', displayName: 'Drop Shadow' },
							{ name: 'grayscale', displayName: 'Grayscale' },
							{ name: 'hue-rotate', displayName: 'Hue Rotate' },
							{ name: 'invert', displayName: 'Invert' },
							{ name: 'opacity', displayName: 'Opacity' },
							{ name: 'saturate', displayName: 'Saturate' },
							{ name: 'sepia', displayName: 'Sepia' },
						]}
						value={selectedFilter}
						onChange={(v: string | string[]) => {
							const filter = v as string;
							setSelectedFilter(filter);
							setBackdropFilterValue('');
							handleBackdropFilterChange(filter, '');
						}}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Value</div>
				<div className="_simpleEditor">
					<input
						type="text"
						className="_simpleEditorInput"
						value={backdropFilterValue}
						onChange={e => {
							const newValue = e.target.value;
							setBackdropFilterValue(newValue);
							handleBackdropFilterChange(selectedFilter, newValue);
						}}
						placeholder={selectedFilter === 'drop-shadow' ? 'color x y blur' : 'value'}
					/>
				</div>
			</div>
		</>
	);
}

function BackgroundStandardEditor({
	selectedComponent,
	subComponentName,
	iterateProps,
	pseudoState,
	selectorPref,
	selectedComponentsList,
	defPath,
	locationHistory,
	pageExtractor,
	styleProps,
	saveStyle,
	properties,
}: Readonly<StyleEditorsProps>) {
	const [color, setColor] = useState<string>('');
	const [image, setImage] = useState<string>('');
	const [size, setSize] = useState<string>('');
	const [sizeX, setSizeX] = useState<string>('');
	const [sizeY, setSizeY] = useState<string>('');
	const [repeat, setRepeat] = useState<string>('');
	const [position, setPosition] = useState<string>('');
	const [positionX, setPositionX] = useState<string>('');
	const [positionY, setPositionY] = useState<string>('');

	const backgroundProps = [
		{ prop: 'backgroundColor', setter: setColor },
		{ prop: 'backgroundImage', setter: setImage },
		{ prop: 'backgroundSize', setter: setSize },
		{ prop: 'backgroundSizeX', setter: setSizeX },
		{ prop: 'backgroundSizeY', setter: setSizeY },
		{ prop: 'backgroundRepeat', setter: setRepeat },
		{ prop: 'backgroundPosition', setter: setPosition },
		{ prop: 'backgroundPositionX', setter: setPositionX },
		{ prop: 'backgroundPositionY', setter: setPositionY },
	];

	useEffect(() => {
		if (!selectedComponent) return;

		backgroundProps.forEach(({ prop, setter }) => {
			const extractedValue = extractValue({
				subComponentName,
				prop,
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			})?.value?.value;
			setter(extractedValue || '');
		});
	}, [selectedComponent, subComponentName, iterateProps, pseudoState, selectorPref]);

	const onChangeCurry = (propType: string) => (value: string | ComponentProperty<string>) => {
		valuesChangedOnlyValues({
			subComponentName,
			selectedComponent,
			selectedComponentsList,
			propValues: [{ prop: 'background' + propType, value: value }],
			selectorPref,
			defPath,
			locationHistory,
			pageExtractor,
		});
	};

	const updatePosition = (x: string, y: string) => {
		const newPosition = `${x} ${y}`.trim();
		setPosition(newPosition);
		onChangeCurry('Position')(newPosition);
		onChangeCurry('PositionX')(x);
		onChangeCurry('PositionY')(y);
	};

	const updateSize = (newSize: string, newSizeX: string, newSizeY: string) => {
		setSize(newSize);
		setSizeX(newSizeX);
		setSizeY(newSizeY);

		if (['cover', 'contain', 'auto'].includes(newSize)) {
			onChangeCurry('Size')(newSize);
			onChangeCurry('SizeX')('');
			onChangeCurry('SizeY')('');
		} else {
			const combinedSize = `${newSizeX} ${newSizeY}`.trim();
			onChangeCurry('Size')(combinedSize);
			onChangeCurry('SizeX')(newSizeX);
			onChangeCurry('SizeY')(newSizeY);
		}
	};

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Color</div>
				<div className="_simpleEditor">
					<CommonColorPickerPropertyEditor
						color={{ value: color }}
						onChange={onChangeCurry('Color')}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Image</div>
				<div className="_simpleEditor">
					<input
						type="text"
						className="_simpleEditorInput"
						value={image}
						onChange={e => onChangeCurry('Image')(e.target.value)}
						placeholder="URL or Gradient"
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Size </div>
				<div className="_simpleLabel">
					<input
						type="text"
						className="_simpleEditorInput"
						value={size}
						onChange={e => updateSize(e.target.value, '', '')}
					/>
				</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'cover',
								description: 'Cover',
								icon: (
									<g transform="translate(5 5)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'contain',
								description: 'Contain',
								icon: (
									<g transform="translate(5 5)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="12"
											height="12"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
							{
								name: 'auto',
								description: 'Auto',
								icon: (
									<g transform="translate(5 5)">
										<rect
											x="2"
											y="2"
											width="20"
											height="20"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="6"
											y="6"
											width="8"
											height="8"
											fill="currentColor"
											fillOpacity="0.3"
										/>
									</g>
								),
							},
						]}
						selected={size}
						onChange={v => updateSize(v as string, '', '')}
						withBackground={true}
					/>
				</div>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Width</div>
				<div className="_simpleEditor">
					<PixelSize value={sizeX} onChange={v => updateSize('', v, sizeY)} />
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Height</div>
				<div className="_simpleEditor">
					<PixelSize value={sizeY} onChange={v => updateSize('', sizeX, v)} />
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Repeat</div>
				<div className="_simpleEditor">
					<IconsSimpleEditor
						options={[
							{
								name: 'repeat',
								description: 'Repeat both horizontally and vertically',
								icon: (
									<g transform="translate(5 5)">
										<path d="M3 3h6v6H3zM12 3h6v6h-6zM3 12h6v6H3zM12 12h6v6h-6z" />
									</g>
								),
							},
							{
								name: 'repeat-x',
								description: 'Repeat horizontally',
								icon: (
									<g transform="translate(5 5)">
										<path d="M3 9h6v6H3zM12 9h6v6h-6zM21 9h-1v6h1zM1 9h1v6H1z" />
										,
									</g>
								),
							},
							{
								name: 'repeat-y',
								description: 'Repeat vertically',
								icon: (
									<g transform="translate(5 5)">
										<path d="M9 3h6v6H9zM9 12h6v6H9zM9 21v1h6v-1zM9 1v1h6V1z" />
										,
									</g>
								),
							},
							{
								name: 'no-repeat',
								description: 'No repeat',
								icon: (
									<g transform="translate(5 5)">
										<path d="M5 5h14v14H5z" />,
									</g>
								),
							},
							{
								name: 'space',
								description: 'Space',
								icon: (
									<g transform="translate(5 5)">
										<path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" />
									</g>
								),
							},
							{
								name: 'round',
								description: 'Round',
								icon: (
									<g transform="translate(5 5)">
										<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
									</g>
								),
							},
						]}
						selected={repeat}
						onChange={v => onChangeCurry('Repeat')(v as string)}
						withBackground={true}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Position </div>
				<div className="_simpleEditor">
					<div className="_iconGrid">
						{[
							['left top', 'center top', 'right top'],
							['left center', 'center center', 'right center'],
							['left bottom', 'center bottom', 'right bottom'],
						].map((row, rowIndex) => (
							<div key={rowIndex} className="_iconRow">
								{row.map(positionName => {
									const option = [
										{
											name: 'left top',
											description: 'Top Left',
											icon: (
												<g transform="translate(0 1)">
													<path d="M3 3h6v6H3z" />
												</g>
											),
										},
										{
											name: 'center top',
											description: 'Top Center',
											icon: (
												<g transform="translate(3 1	)">
													<path d="M9 3h6v6H9z" />
												</g>
											),
										},
										{
											name: 'right top',
											description: 'Top Right',
											icon: (
												<g transform="translate(5 1)">
													<path d="M15 3h6v6h-6z" />
												</g>
											),
										},
										{
											name: 'left center',
											description: 'Center Left',
											icon: (
												<g transform="translate(0 3)">
													<path d="M3 9h6v6H3z" />
												</g>
											),
										},
										{
											name: 'center center',
											description: 'Center Center',
											icon: (
												<g transform="translate(3 3)">
													<path d="M9 9h6v6H9z" />
												</g>
											),
										},
										{
											name: 'right center',
											description: 'Center Right',
											icon: (
												<g transform="translate(5 3)">
													<path d="M15 9h6v6h-6z" />
												</g>
											),
										},
										{
											name: 'left bottom',
											description: 'Bottom Left',
											icon: (
												<g transform="translate(0 5)">
													<path d="M3 15h6v6H3z" />
												</g>
											),
										},
										{
											name: 'center bottom',
											description: 'Bottom Center',
											icon: (
												<g transform="translate(3 5)">
													<path d="M9 15h6v6H9z" />
												</g>
											),
										},
										{
											name: 'right bottom',
											description: 'Bottom Right',
											icon: (
												<g transform="translate(5 5)">
													<path d="M15 15h6v6h-6z" />
												</g>
											),
										},
									].find(opt => opt.name === positionName);
									return (
										<button
											key={positionName}
											className={`_iconButton ${position === positionName ? '_selected' : ''}`}
											onClick={() => {
												const [x, y] = positionName.split(' ');
												setPositionX(x);
												setPositionY(y);
												updatePosition(x, y);
											}}
											title={option?.description}
										>
											<svg viewBox="0 0 24 24" width="24" height="24">
												{option?.icon}
											</svg>
										</button>
									);
								})}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Position X</div>
				<div className="_simpleEditor">
					<PixelSize
						value={positionX}
						onChange={value => {
							setPositionX(value);
							updatePosition(value, positionY);
						}}
					/>
				</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Position Y</div>
				<div className="_simpleEditor">
					<PixelSize
						value={positionY}
						onChange={value => {
							setPositionY(value);
							updatePosition(positionX, value);
						}}
					/>
				</div>
			</div>
		</>
	);
}

// basic:

// Color, Image, Size, Repeat, Position

// Detailed:

// Attachment, Blend Mode, Opacity, Clip, Origin, Backdrop Filter

// url(api/files/static/file/SYSTEM/Modlix/round.svg)

// url(api/files/static/file/SYSTEM/Modlix/round.svg), url(api/files/static/file/SYSTEM/Modlix/x.svg), linear-gradient(blue, red)
