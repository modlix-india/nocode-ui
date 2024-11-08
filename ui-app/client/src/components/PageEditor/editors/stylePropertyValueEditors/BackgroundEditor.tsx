import React, { useState, useEffect } from 'react';
import { duplicate, Position } from '@fincity/kirun-js';
import { FileBrowser } from '../../../../commonComponents/FileBrowser';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorType,
	StyleEditorsProps,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { ManyValuesEditor } from './simpleEditors/ManyValuesEditor';
import { FunctionDetail, ManyFunctionsEditor } from './simpleEditors/ManyFunctionsEditor';
import { CommonColorPickerPropertyEditor } from '../../../../commonComponents/CommonColorPicker';
import { ComponentProperty } from '../../../../types/common';
import { color, max } from 'd3';
import { ButtonBar } from './simpleEditors/ButtonBar';

type BackgroundImage = {
	type: 'URL' | 'Gradient';
	value: string;
};
export interface RelatedProps {
	props: string[];
	logic: (values: Record<string, any>) => Record<string, any>;
}

const FILTER_FUNCTIONS: Array<FunctionDetail> = [
	{
		name: 'blur',
		displayName: 'Blur',
		params: [{ name: 'length', displayName: 'Length', type: 'pixel size' }],
	},
	{
		name: 'brightness',
		displayName: 'Brightness',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'contrast',
		displayName: 'Contrast',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'grayScale',
		displayName: 'Gray Scale',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'hueRotate',
		displayName: 'Hue Rotate',
		params: [
			{
				name: 'angle',
				displayName: 'Angle',
				type: 'angle size',
			},
		],
	},
	{
		name: 'invert',
		displayName: 'Invert',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'opacity',
		displayName: 'Opacity',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'saturate',
		displayName: 'Saturate',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'sepia',
		displayName: 'Sepia',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
];

const BACKGROUND_PROPS = [
	'backgroundColor',
	'backgroundImage',
	'backgroundSize',
	'backgroundWidth',
	'backgroundHeight',
	'backgroundRepeat',
	'backgroundPosition',
	'backgroundPositionX',
	'backgroundPositionY',
	'backgroundAttachment',
	'backgroundOrigin',
	'backgroundClip',
	'backgroundBlendMode',
	'backdropFilter',
];

export function BackgroundEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <BackgroundDetailedEditor {...props} />;
	}
	return <BackgroundStandardEditor {...props} />;
}

function BackgroundStandardEditor(props: Readonly<StyleEditorsProps>) {
	const { propValues, propAndValue } = BACKGROUND_PROPS.reduce(
		(a, c) => {
			const value = extractValue({
				subComponentName: props.subComponentName,
				prop: c,
				iterateProps: props.iterateProps,
				pseudoState: props.pseudoState,
				selectorPref: props.selectorPref,
				selectedComponent: props.selectedComponent,
			});

			a.propValues.push(value);
			a.propAndValue.push({ prop: c, value: value.value?.value ?? '' });

			return a;
		},
		{ propValues: [] as any[], propAndValue: [] as { prop: string; value: string }[] },
	);

	let isAdvanced = propValues.map(e => e.value).some(e => !!e.location);
	let [backgroundImages, setBackgroundImages] = useState<Array<BackgroundImage>>([]);
	let [showFileBrowser, setShowFileBrowser] = useState(false);

	let backgroundSizeRelatedProps: RelatedProps = {
		props: ['backgroundSize', 'backgroundWidth', 'backgroundHeight'],
		logic: values => {
			let { backgroundSize, backgroundWidth, backgroundHeight } = values;

			if (backgroundSize === 'cover' || backgroundSize === 'contain') {
				return {
					backgroundSize,
				};
			}

			let width = backgroundWidth === 'auto' ? 'auto' : backgroundWidth;
			let height = backgroundHeight === 'auto' ? 'auto' : backgroundHeight;

			return {
				backgroundSize: `${width} ${height}`,
				backgroundWidth: width,
				backgroundHeight: height,
			};
		},
	};

	useEffect(() => {
		if (!props.selectedComponent) return;
		const extractedImage = propAndValue.find(p => p.prop === 'backgroundImage')?.value || '';
		const parsedImages = extractedImage.split(/,(?![^(]*\))/g).map((v: string) => {
			// const parsedImages = parseImageValues(extractedImage).map((v: string) => {
			const trimmed = v.trim();
			if (trimmed.startsWith('url(')) {
				return { type: 'URL', value: trimmed.slice(4, -1) };
			} else {
				return { type: 'Gradient', value: trimmed.slice(16, -1) };
			}
		});

		setBackgroundImages(
			parsedImages.length === 0
				? [{ type: 'URL', value: '' }]
				: (parsedImages as BackgroundImage[]),
		);
	}, [
		props.selectedComponent,
		props.subComponentName,
		props.iterateProps,
		props.pseudoState,
		props.selectorPref,
	]);

	if (isAdvanced) {
		return (
			<div className="_simpleEditor _warning">
				<svg width="14" height="14" viewBox="0 0 32 32">
					<g
						id="Group_75"
						data-name="Group 75"
						transform="translate(21.016 2) rotate(90)"
					>
						<path
							id="Path_161"
							data-name="Path 161"
							d="M4.758,0c4.073.656,6.593,3.713,14.274,4.758C11.405,5.837,8.971,8.824,4.758,9.516A4.758,4.758,0,0,1,4.758,0Z"
							transform="translate(0 0.5)"
							fillOpacity={0.5}
							fill="currentColor"
						/>
						<circle
							id="Ellipse_13"
							data-name="Ellipse 13"
							cx="2.855"
							cy="2.855"
							r="2.855"
							transform="translate(22.664 2.403)"
							fill="currentColor"
						/>
					</g>
				</svg>
				Expressions are used in the properties, use advanced editor to edit.
			</div>
		);
	}

	const updateBackgroundImages = (newImages: Array<BackgroundImage>) => {
		const newValue = newImages
			.map(img =>
				img.type === 'URL' ? `url(${img.value})` : `linear-gradient(${img.value})`,
			)
			.join(', ');
		valuesChangedOnlyValues({
			subComponentName: props.subComponentName,
			selectedComponent: props.selectedComponent,
			selectedComponentsList: props.selectedComponentsList,
			propValues: [{ prop: 'backgroundImage', value: newValue }],
			selectorPref: props.selectorPref,
			defPath: props.defPath,
			locationHistory: props.locationHistory,
			pageExtractor: props.pageExtractor,
		});
		setBackgroundImages(newImages);
	};

	const canAddNewImage = backgroundImages.every(img => img.value !== '');

	const renderBackgroundImageEditor = (img: BackgroundImage, index: number) => (
		<div key={`background_${index}`} className="_eachBackgroundEditor">
			<div className="_combineEditors">
				<div className="_layerControls" style={{ display: 'flex' }}>
					<ButtonBar
						value={img.type}
						onChange={v => {
							const newImages = duplicate(backgroundImages);
							newImages[index].type = v as 'URL' | 'Gradient';
							newImages[index].value = '';
							updateBackgroundImages(newImages);
						}}
						options={[
							{
								name: 'URL',
								displayName: 'URL',
								description: 'URL',
							},
							{
								name: 'Gradient',
								displayName: 'Gradient',
								description: 'Gradient',
							},
						]}
					/>
					<IconsSimpleEditor
						options={[
							{
								name: 'Add',
								description: 'Add a new image layer',
								width: '20',
								height: '10',
								icon: (
									<g>
										<path
											d="M14.614,20v1.234H5V20Z"
											transform="translate(30.424 -5) rotate(90)"
											fillOpacity={canAddNewImage ? '0.25' : '0.1'}
										/>
										<path
											d="M14.614,20v1.234H5V20Z"
											transform="translate(0 -15.81)"
											fillOpacity={canAddNewImage ? '0.25' : '0.1'}
										/>
									</g>
								),
							},
							{
								name: 'Move Up',
								description: 'Move this layer up',
								icon: (
									<g transform="translate(13 9)">
										<path
											d="M3.98268 13C3.71844 13 3.50481 12.7864 3.50481 12.5221V2.62474L1.46967 4.64582C1.28134 4.83134 0.980567 4.83134 0.795043 4.64301C0.60952 4.45467 0.60952 4.1539 0.797854 3.96838L3.64536 1.13774C3.73812 1.04497 3.85899 1 3.98268 1C4.10636 1 4.22723 1.04497 4.31999 1.13774L7.17031 3.96838C7.35864 4.1539 7.35864 4.45748 7.17312 4.64301C6.98759 4.83134 6.68401 4.83134 6.49849 4.64582L4.46054 2.62474V12.5221C4.46054 12.7836 4.24691 13 3.98268 13Z"
											fillOpacity="0.25"
											transform="translate(2,0)"
										/>
									</g>
								),
							},
							{
								name: 'Move Down',
								description: 'Move this layer down',
								icon: (
									<g transform="translate(11 9)">
										<path
											d="M4.32643 1C4.06219 1 3.84856 1.21363 3.84856 1.47786V11.3753L1.81342 9.35418C1.62509 9.16866 1.32432 9.16866 1.13879 9.35699C0.95327 9.54533 0.95327 9.8461 1.1416 10.0316L3.98911 12.8623C4.08187 12.955 4.20274 13 4.32643 13C4.45011 13 4.57098 12.955 4.66374 12.8623L7.51406 10.0316C7.70239 9.8461 7.70239 9.54252 7.51687 9.35699C7.33134 9.16866 7.02776 9.16866 6.84224 9.35418L4.80429 11.3753V1.47786C4.80429 1.21644 4.59066 1 4.32643 1Z"
											fillOpacity="0.25"
											transform="translate(2,0)"
										/>
									</g>
								),
							},
							{
								name: 'Delete',
								description: 'Delete this image layer',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M3.93393 0.483984L3.74107 0.875H1.16964C0.695536 0.875 0.3125 1.26602 0.3125 1.75C0.3125 2.23398 0.695536 2.625 1.16964 2.625H11.4554C11.9295 2.625 12.3125 2.23398 12.3125 1.75C12.3125 1.26602 11.9295 0.875 11.4554 0.875H8.88393L8.69107 0.483984C8.54643 0.185938 8.24911 0 7.925 0H4.7C4.37589 0 4.07857 0.185938 3.93393 0.483984ZM11.4554 3.5H1.16964L1.7375 12.7695C1.78036 13.4613 2.34286 14 3.02054 14H9.60446C10.2821 14 10.8446 13.4613 10.8875 12.7695L11.4554 3.5Z"
											fillOpacity="1"
											strokeWidth="0"
										/>
									</g>
								),
							},
						]}
						onChange={v => {
							if (v === 'Add' && canAddNewImage) {
								const newImages = duplicate(backgroundImages);
								newImages.push({ type: 'URL', value: '' });
								updateBackgroundImages(newImages);
							} else if (v === 'Move Up') {
								if (index === 0) return;
								const newImages = duplicate(backgroundImages);
								[newImages[index - 1], newImages[index]] = [
									newImages[index],
									newImages[index - 1],
								];
								updateBackgroundImages(newImages);
							} else if (v === 'Move Down') {
								if (index === backgroundImages.length - 1) return;
								const newImages = duplicate(backgroundImages);
								[newImages[index], newImages[index + 1]] = [
									newImages[index + 1],
									newImages[index],
								];
								updateBackgroundImages(newImages);
							} else if (v === 'Delete') {
								if (backgroundImages.length === 1) return;
								const newImages = duplicate(backgroundImages);
								newImages.splice(index, 1);
								updateBackgroundImages(newImages);
							}
						}}
						withBackground={false}
						selected={''}
					/>
				</div>
			</div>
			{img.type === 'URL' ? (
				<div className="_simpleEditor">
					<div className="_inputWithIcon">
						<svg
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							onClick={() => setShowFileBrowser(true)}
							className="_inputIcon"
						>
							<path
								d="M1.75014 1.75173C4.08608 -0.583909 7.88234 -0.583909 10.2183 1.75173C12.304 3.83722 12.5222 7.09199 10.8757 9.42762L13.7004 12.2519C13.8924 12.4439 14 12.7027 14 12.9762C14 13.2496 13.8924 13.5055 13.7004 13.7004C13.5084 13.8953 13.2495 14 12.976 14C12.7026 14 12.4466 13.8924 12.2517 13.7004L9.42703 10.8761C8.39724 11.6033 7.19 11.9727 5.97985 11.9727C4.44679 11.9727 2.91374 11.388 1.74723 10.2217C-0.582894 7.88314 -0.582893 4.08736 1.75014 1.75173ZM2.78284 9.18621C4.54861 10.9517 7.42272 10.9517 9.18849 9.18621C10.0437 8.33107 10.515 7.19379 10.515 5.9838C10.515 4.7738 10.0437 3.63652 9.18849 2.78138C8.30415 1.89716 7.14636 1.45795 5.98566 1.45795C4.82497 1.45795 3.66718 1.90007 2.78284 2.78138C1.01706 4.54984 1.01706 7.42066 2.78284 9.18621Z"
								fill="black"
								fillOpacity="0.15"
							/>
						</svg>
						<input
							type="text"
							className="_simpleEditorInputWithIcon"
							value={img.value}
							onChange={e => {
								const newImages = duplicate(backgroundImages);
								newImages[index].value = e.target.value;
								updateBackgroundImages(newImages);
							}}
							placeholder="Enter URL or select file"
						/>
					</div>
				</div>
			) : (
				<div className="_simpleEditor">
					<input
						type="text"
						className="_simpleEditorInput"
						value={img.value}
						onChange={e => {
							const newImages = duplicate(backgroundImages);
							newImages[index].value = e.target.value;
							updateBackgroundImages(newImages);
						}}
						placeholder="Enter gradient color a,b,.."
					/>
				</div>
			)}
		</div>
	);

	const fileBrowserPopup = showFileBrowser ? (
		<div className={`_popupBackground`} onClick={() => setShowFileBrowser(false)}>
			<div
				className="_popupContainer _imagePopupContainer"
				onClick={e => e.stopPropagation()}
			>
				<FileBrowser
					selectedFile=""
					onChange={(url, type, directory) => {
						if (!directory) {
							const newImages = duplicate(backgroundImages);
							newImages[newImages.length - 1].value = url;
							updateBackgroundImages(newImages);
							setShowFileBrowser(false);
						}
					}}
					editOnUpload={true}
					resourceType="static"
					startLocation="/"
					restrictSelectionType={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
				/>
			</div>
		</div>
	) : null;

	return (
		<>
			{backgroundImages.map((img, index) => renderBackgroundImageEditor(img, index))}
			<div className="_simpleEditorBackground">
				<ManyValuesEditor
					onChange={v =>
						valuesChangedOnlyValues({
							subComponentName: props.subComponentName,
							selectedComponent: props.selectedComponent,
							selectedComponentsList: props.selectedComponentsList,
							selectorPref: props.selectorPref,
							defPath: props.defPath,
							locationHistory: props.locationHistory,
							pageExtractor: props.pageExtractor,
							propValues: v.map(item => ({ prop: item.prop, value: item.value })),
						})
					}
					values={propAndValue}
					groupTitle={'Standard Properties'}
					newValueProps={['backgroundColor']}
					showNewGroup={false}
					relatedProps={backgroundSizeRelatedProps}
					propDefinitions={[
						{
							name: 'backgroundColor',
							displayName: 'Color',
							type: 'color',
							default: '',
							options: [],
						},
						{
							name: 'backgroundSize',
							displayName: 'Size',
							type: 'icons',
							default: 'auto',
							withBackground: true,
							options: [
								{
									name: 'cover',
									description: 'Cover',
									icon: (
										<g transform="translate(9 9)">
											<path
												d="M13.8261 0.173923C13.7714 0.118809 13.7063 0.0750675 13.6346 0.0452176C13.5629 0.0153677 13.486 0 13.4083 0C13.3307 0 13.2538 0.0153677 13.1821 0.0452176C13.1104 0.0750675 13.0453 0.118809 12.9906 0.173923L11.201 1.95879C11.1903 1.97014 11.1775 1.97919 11.1632 1.98538C11.1489 1.99156 11.1335 1.99475 11.1179 1.99475C11.1023 1.99475 11.0869 1.99156 11.0727 1.98538C11.0584 1.97919 11.0455 1.97014 11.0348 1.95879L10.4035 1.32744C10.37 1.29464 10.3276 1.27247 10.2816 1.26374C10.2355 1.25501 10.1879 1.26011 10.1448 1.27838C10.1016 1.29666 10.0649 1.3273 10.0391 1.36644C10.0133 1.40558 9.99973 1.45147 10 1.49833V3.76264C10 3.82559 10.025 3.88596 10.0695 3.93047C10.114 3.97498 10.1744 3.99999 10.2374 3.99999H12.5017C12.5487 4.0004 12.5947 3.98656 12.6337 3.96029C12.6727 3.93402 12.7028 3.89655 12.72 3.85283C12.7387 3.80992 12.7437 3.76229 12.7344 3.71643C12.725 3.67056 12.7018 3.62869 12.6678 3.5965L12.0412 2.96515C12.0301 2.95398 12.0213 2.94062 12.0156 2.92592C12.0099 2.91121 12.0073 2.89547 12.008 2.8797C12.0074 2.86465 12.01 2.84965 12.0158 2.83572C12.0215 2.82179 12.0302 2.80926 12.0412 2.799L13.8261 1.00939C13.8812 0.954678 13.9249 0.889599 13.9548 0.817905C13.9846 0.746211 14 0.669318 14 0.591658C14 0.513997 13.9846 0.437105 13.9548 0.36541C13.9249 0.293716 13.8812 0.228637 13.8261 0.173923Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M0.173848 13.8244C0.227904 13.8805 0.292797 13.9249 0.36458 13.9551C0.436362 13.9853 0.513534 14.0006 0.591402 14C0.669269 14.0006 0.746441 13.9853 0.818224 13.9551C0.890006 13.9249 0.954899 13.8805 1.00896 13.8244L2.79779 12.0403C2.80844 12.029 2.82131 12.0199 2.83559 12.0138C2.84987 12.0076 2.86527 12.0044 2.88083 12.0044C2.89639 12.0044 2.91179 12.0076 2.92607 12.0138C2.94035 12.0199 2.95322 12.029 2.96387 12.0403L3.59494 12.6667C3.61613 12.6895 3.64185 12.7076 3.67045 12.7198C3.69905 12.7321 3.7299 12.7382 3.76101 12.7378C3.79065 12.7449 3.82153 12.7449 3.85117 12.7378C3.89449 12.72 3.93158 12.6898 3.95776 12.651C3.98393 12.6121 3.99803 12.5664 3.99826 12.5196V10.2373C3.99826 10.1743 3.97327 10.114 3.92877 10.0695C3.88428 10.025 3.82394 10 3.76101 10H1.49768C1.4507 9.9996 1.4047 10.0134 1.36573 10.0397C1.32677 10.066 1.29667 10.1034 1.27942 10.1471C1.26075 10.19 1.25574 10.2376 1.26508 10.2835C1.27442 10.3293 1.29765 10.3712 1.33161 10.4033L1.95794 11.0344C1.96929 11.0451 1.97833 11.0579 1.98452 11.0722C1.9907 11.0865 1.99389 11.1019 1.99389 11.1174C1.99389 11.133 1.9907 11.1484 1.98452 11.1627C1.97833 11.177 1.96929 11.1898 1.95794 11.2005L0.173848 12.9893C0.118758 13.044 0.075035 13.1091 0.045198 13.1807C0.015361 13.2524 0 13.3292 0 13.4069C0 13.4845 0.015361 13.5614 0.045198 13.633C0.075035 13.7047 0.118758 13.7697 0.173848 13.8244Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M10.1477 12.7376C10.1774 12.7447 10.2082 12.7447 10.2379 12.7376C10.269 12.738 10.2998 12.7319 10.3284 12.7196C10.357 12.7074 10.3828 12.6893 10.4039 12.6665L11.035 12.0402C11.0456 12.0288 11.0585 12.0198 11.0728 12.0136C11.087 12.0074 11.1024 12.0042 11.118 12.0042C11.1336 12.0042 11.149 12.0074 11.1632 12.0136C11.1775 12.0198 11.1904 12.0288 11.201 12.0402L12.9897 13.8241C13.0441 13.8798 13.109 13.924 13.1807 13.9542C13.2524 13.9844 13.3295 14 13.4073 14C13.4851 14 13.5621 13.9844 13.6338 13.9542C13.7055 13.924 13.7704 13.8798 13.8248 13.8241C13.8799 13.7695 13.9236 13.7044 13.9534 13.6328C13.9833 13.5611 13.9986 13.4842 13.9986 13.4066C13.9986 13.329 13.9833 13.2521 13.9534 13.1805C13.9236 13.1088 13.8799 13.0438 13.8248 12.9891L12.0408 11.2004C12.0295 11.1897 12.0204 11.1769 12.0142 11.1626C12.0081 11.1483 12.0049 11.1329 12.0049 11.1174C12.0049 11.1018 12.0081 11.0864 12.0142 11.0721C12.0204 11.0578 12.0295 11.045 12.0408 11.0343L12.6671 10.4033C12.7011 10.3711 12.7243 10.3293 12.7336 10.2834C12.743 10.2376 12.738 10.19 12.7193 10.1471C12.702 10.1034 12.6719 10.0659 12.633 10.0397C12.594 10.0134 12.548 9.9996 12.501 10H10.2379C10.2067 10 10.1759 10.0061 10.1471 10.0181C10.1183 10.03 10.0922 10.0475 10.0701 10.0695C10.0481 10.0915 10.0306 10.1177 10.0187 10.1465C10.0068 10.1752 10.0006 10.2061 10.0006 10.2372V12.5004C9.99694 12.5504 10.0092 12.6003 10.0356 12.6429C10.062 12.6856 10.1013 12.7187 10.1477 12.7376Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M3.99999 1.49777C4.00027 1.4509 3.98666 1.405 3.96089 1.36585C3.93512 1.3267 3.89834 1.29605 3.85518 1.27777C3.81202 1.2595 3.76441 1.2544 3.71836 1.26313C3.67231 1.27187 3.62988 1.29403 3.59641 1.32684L2.96492 1.95833C2.95466 1.96937 2.94213 1.97805 2.9282 1.98379C2.91427 1.98952 2.89926 1.99218 2.8842 1.99157C2.86843 1.99225 2.85269 1.98965 2.83798 1.98393C2.82327 1.97821 2.8099 1.96949 2.79874 1.95833L1.00873 0.17307C0.89791 0.0622551 0.747613 0 0.590898 0C0.434182 0 0.283885 0.0622551 0.17307 0.17307C0.0622551 0.283885 0 0.434182 0 0.590898C0 0.747613 0.0622551 0.89791 0.17307 1.00873L1.95833 2.79874C1.96969 2.80939 1.97874 2.82226 1.98493 2.83656C1.99111 2.85085 1.9943 2.86625 1.9943 2.88183C1.9943 2.8974 1.99111 2.91281 1.98493 2.9271C1.97874 2.94139 1.96969 2.95426 1.95833 2.96492L1.33159 3.59641C1.3015 3.63126 1.28267 3.67442 1.27758 3.72019C1.27249 3.76595 1.28139 3.81219 1.3031 3.8528C1.32037 3.89653 1.35049 3.934 1.38948 3.96028C1.42846 3.98655 1.4745 4.0004 1.52151 3.99999H3.76259C3.82555 3.99999 3.88594 3.97498 3.93046 3.93046C3.97498 3.88594 3.99999 3.82555 3.99999 3.76259V1.49777Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M8.6 5H5.4C5.17909 5 5 5.17909 5 5.4V8.6C5 8.82091 5.17909 9 5.4 9H8.6C8.82091 9 9 8.82091 9 8.6V5.4C9 5.17909 8.82091 5 8.6 5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'contain',
									description: 'Contain',
									icon: (
										<g transform="translate(9 9)">
											<path
												d="M10.1739 3.82608C10.2286 3.88119 10.2937 3.92493 10.3654 3.95478C10.4371 3.98463 10.514 4 10.5917 4C10.6693 4 10.7462 3.98463 10.8179 3.95478C10.8896 3.92493 10.9547 3.88119 11.0094 3.82608L12.799 2.04121C12.8097 2.02986 12.8225 2.02081 12.8368 2.01462C12.8511 2.00844 12.8665 2.00525 12.8821 2.00525C12.8977 2.00525 12.9131 2.00844 12.9273 2.01462C12.9416 2.02081 12.9545 2.02986 12.9652 2.04121L13.5965 2.67256C13.63 2.70536 13.6724 2.72753 13.7184 2.73626C13.7645 2.74499 13.8121 2.73989 13.8552 2.72162C13.8984 2.70334 13.9351 2.6727 13.9609 2.63356C13.9867 2.59442 14.0003 2.54853 14 2.50167V0.237358C14 0.174409 13.975 0.114038 13.9305 0.0695267C13.886 0.0250151 13.8256 8.82149e-06 13.7626 8.82149e-06L11.4983 8.82149e-06C11.4513 -0.000399113 11.4053 0.0134439 11.3663 0.0397131C11.3273 0.0659826 11.2972 0.103445 11.28 0.147165C11.2613 0.190083 11.2563 0.237711 11.2656 0.283574C11.275 0.329438 11.2982 0.371312 11.3322 0.403502L11.9588 1.03485C11.9699 1.04602 11.9787 1.05938 11.9844 1.07408C11.9901 1.08879 11.9927 1.10453 11.992 1.1203C11.9926 1.13535 11.99 1.15035 11.9842 1.16428C11.9785 1.17821 11.9698 1.19074 11.9588 1.201L10.1739 2.99061C10.1188 3.04532 10.0751 3.1104 10.0452 3.18209C10.0154 3.25379 10 3.33068 10 3.40834C10 3.486 10.0154 3.5629 10.0452 3.63459C10.0751 3.70628 10.1188 3.77136 10.1739 3.82608Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M3.82444 10.1756C3.77039 10.1195 3.70549 10.0751 3.63371 10.0449C3.56193 10.0147 3.48476 9.99943 3.40689 10C3.32902 9.99943 3.25185 10.0147 3.18007 10.0449C3.10828 10.0751 3.04339 10.1195 2.98934 10.1756L1.2005 11.9597C1.18985 11.971 1.17698 11.9801 1.1627 11.9862C1.14842 11.9924 1.13302 11.9956 1.11746 11.9956C1.1019 11.9956 1.0865 11.9924 1.07222 11.9862C1.05794 11.9801 1.04507 11.971 1.03442 11.9597L0.403349 11.3333C0.382165 11.3105 0.356446 11.2924 0.327844 11.2802C0.299242 11.2679 0.268392 11.2618 0.237277 11.2622C0.20764 11.2551 0.17676 11.2551 0.147123 11.2622C0.103797 11.28 0.0667093 11.3102 0.0405331 11.349C0.0143569 11.3879 0.000263929 11.4336 3.00407e-05 11.4804L3.00407e-05 13.7627C3.00407e-05 13.8257 0.0250256 13.886 0.0695179 13.9305C0.11401 13.975 0.174355 14 0.237277 14H2.50061C2.54759 14.0004 2.5936 13.9866 2.63256 13.9603C2.67152 13.934 2.70162 13.8966 2.71887 13.8529C2.73754 13.81 2.74255 13.7624 2.73321 13.7165C2.72387 13.6707 2.70064 13.6288 2.66668 13.5967L2.04035 12.9656C2.029 12.9549 2.01996 12.9421 2.01377 12.9278C2.00759 12.9135 2.0044 12.8981 2.0044 12.8826C2.0044 12.867 2.00759 12.8516 2.01377 12.8373C2.01996 12.823 2.029 12.8102 2.04035 12.7995L3.82444 11.0107C3.87953 10.956 3.92326 10.8909 3.95309 10.8193C3.98293 10.7476 3.99829 10.6708 3.99829 10.5931C3.99829 10.5155 3.98293 10.4386 3.95309 10.367C3.92326 10.2953 3.87953 10.2303 3.82444 10.1756Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M13.8508 11.2624C13.8212 11.2553 13.7903 11.2553 13.7607 11.2624C13.7295 11.262 13.6987 11.2681 13.6701 11.2804C13.6415 11.2926 13.6158 11.3107 13.5946 11.3335L12.9636 11.9598C12.9529 11.9712 12.9401 11.9802 12.9258 11.9864C12.9115 11.9926 12.8961 11.9958 12.8805 11.9958C12.865 11.9958 12.8496 11.9926 12.8353 11.9864C12.821 11.9802 12.8082 11.9712 12.7975 11.9598L11.0088 10.1759C10.9544 10.1202 10.8895 10.076 10.8178 10.0458C10.7461 10.0156 10.6691 10 10.5913 10C10.5135 10 10.4365 10.0156 10.3647 10.0458C10.293 10.076 10.2281 10.1202 10.1737 10.1759C10.1187 10.2305 10.0749 10.2956 10.0451 10.3672C10.0153 10.4389 9.99991 10.5158 9.99991 10.5934C9.99991 10.671 10.0153 10.7479 10.0451 10.8195C10.0749 10.8912 10.1187 10.9562 10.1737 11.0109L11.9577 12.7996C11.9691 12.8103 11.9781 12.8231 11.9843 12.8374C11.9905 12.8517 11.9937 12.8671 11.9937 12.8826C11.9937 12.8982 11.9905 12.9136 11.9843 12.9279C11.9781 12.9422 11.9691 12.955 11.9577 12.9657L11.3314 13.5967C11.2975 13.6289 11.2742 13.6707 11.2649 13.7166C11.2556 13.7624 11.2606 13.81 11.2792 13.8529C11.2965 13.8966 11.3266 13.9341 11.3655 13.9603C11.4045 13.9866 11.4505 14.0004 11.4975 14H13.7607C13.7918 14 13.8227 13.9939 13.8514 13.9819C13.8802 13.97 13.9064 13.9525 13.9284 13.9305C13.9504 13.9085 13.9679 13.8823 13.9798 13.8535C13.9917 13.8248 13.9979 13.7939 13.9979 13.7628V11.4996C14.0016 11.4496 13.9894 11.3997 13.9629 11.3571C13.9365 11.3144 13.8972 11.2813 13.8508 11.2624Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M8.58307e-06 2.50223C-0.000266552 2.5491 0.0133383 2.595 0.0391088 2.63415C0.0648792 2.6733 0.101662 2.70395 0.144821 2.72223C0.187981 2.7405 0.235586 2.7456 0.281636 2.73687C0.327686 2.72813 0.370121 2.70597 0.403592 2.67316L1.03508 2.04167C1.04534 2.03063 1.05787 2.02195 1.0718 2.01621C1.08573 2.01048 1.10074 2.00782 1.1158 2.00843C1.13157 2.00775 1.14731 2.01035 1.16202 2.01607C1.17673 2.02179 1.1901 2.03051 1.20126 2.04167L2.99127 3.82693C3.10209 3.93774 3.25239 4 3.4091 4C3.56582 4 3.71612 3.93774 3.82693 3.82693C3.93774 3.71612 4 3.56582 4 3.4091C4 3.25239 3.93774 3.10209 3.82693 2.99127L2.04167 1.20126C2.03031 1.19061 2.02126 1.17774 2.01507 1.16344C2.00889 1.14915 2.0057 1.13375 2.0057 1.11817C2.0057 1.1026 2.00889 1.08719 2.01507 1.0729C2.02126 1.05861 2.03031 1.04574 2.04167 1.03508L2.66841 0.403592C2.6985 0.368737 2.71733 0.325583 2.72242 0.279814C2.72751 0.234045 2.71861 0.187809 2.6969 0.147198C2.67963 0.103468 2.64951 0.0659971 2.61052 0.039722C2.57154 0.0134468 2.5255 -0.000399113 2.47849 8.58307e-06L0.237411 8.58307e-06C0.174448 8.58307e-06 0.114064 0.0250206 0.0695422 0.0695422C0.0250206 0.114064 8.58307e-06 0.174448 8.58307e-06 0.237411L8.58307e-06 2.50223Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M8.6 5H5.4C5.17909 5 5 5.17909 5 5.4V8.6C5 8.82091 5.17909 9 5.4 9H8.6C8.82091 9 9 8.82091 9 8.6V5.4C9 5.17909 8.82091 5 8.6 5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'auto',
									description: 'Auto',
									icon: (
										<g transform="translate(9 9)">
											<rect
												y="5"
												width="9"
												height="9"
												rx="0.5"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M9.21741 4.7826C9.2858 4.85149 9.36715 4.90617 9.45677 4.94348C9.54639 4.98079 9.6425 5 9.73958 5C9.83665 5 9.93277 4.98079 10.0224 4.94348C10.112 4.90617 10.1934 4.85149 10.2617 4.7826L12.4988 2.55151C12.5121 2.53732 12.5282 2.52601 12.546 2.51828C12.5639 2.51055 12.5831 2.50656 12.6026 2.50656C12.6221 2.50656 12.6413 2.51055 12.6592 2.51828C12.677 2.52601 12.6931 2.53732 12.7064 2.55151L13.4956 3.3407C13.5375 3.3817 13.5905 3.40941 13.648 3.42032C13.7056 3.43123 13.7651 3.42487 13.819 3.40202C13.873 3.37918 13.9189 3.34088 13.9511 3.29195C13.9833 3.24303 14.0003 3.18566 14 3.12709V0.296698C14 0.218011 13.9687 0.142548 13.9131 0.0869083C13.8575 0.0312686 13.782 1.09673e-05 13.7033 1.09673e-05H10.8729C10.8142 -0.000498772 10.7566 0.0168047 10.7079 0.0496411C10.6592 0.082478 10.6216 0.129307 10.6 0.183957C10.5766 0.237603 10.5704 0.297138 10.582 0.354468C10.5937 0.411798 10.6228 0.464139 10.6652 0.504378L11.4485 1.29356C11.4624 1.30752 11.4733 1.32422 11.4805 1.3426C11.4876 1.36099 11.4909 1.38066 11.49 1.40037C11.4908 1.41919 11.4875 1.43794 11.4803 1.45535C11.4731 1.47277 11.4623 1.48842 11.4485 1.50124L9.21741 3.73826C9.14852 3.80665 9.09384 3.888 9.05653 3.97762C9.01922 4.06724 9.00001 4.16335 9.00001 4.26043C9.00001 4.3575 9.01922 4.45362 9.05653 4.54324C9.09384 4.63286 9.14852 4.7142 9.21741 4.7826Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
							],
						},
						{
							name: 'backgroundWidth',
							displayName: 'Width',
							type: 'pixel size',
							default: '0px',
							options: [],
						},
						{
							name: 'backgroundHeight',
							displayName: 'Height',
							type: 'pixel size',
							default: '0px',
							options: [],
						},

						{
							name: 'backgroundRepeat',
							displayName: 'Repeat',
							type: 'icons',
							default: 'repeat',
							withBackground: true,
							options: [
								{
									name: 'repeat',
									description: 'Repeat both horizontally and vertically',
									icon: (
										<g transform="translate(9 9)">
											<rect width="14" height="14" rx="1" opacity={0} />
											<path
												d="M6 5.5C6 5.77614 5.77614 6 5.5 6H1.5C1.22386 6 1 5.77614 1 5.5V1.5C1 1.22386 1.22386 1 1.5 1H5.5C5.77614 1 6 1.22386 6 1.5V5.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M6 12.5C6 12.7761 5.77614 13 5.5 13H1.5C1.22386 13 1 12.7761 1 12.5V8.5C1 8.22386 1.22386 8 1.5 8H5.5C5.77614 8 6 8.22386 6 8.5V12.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M13 5.5C13 5.77614 12.7761 6 12.5 6H8.5C8.22386 6 8 5.77614 8 5.5V1.5C8 1.22386 8.22386 1 8.5 1H12.5C12.7761 1 13 1.22386 13 1.5V5.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M13 12.5C13 12.7761 12.7761 13 12.5 13H8.5C8.22386 13 8 12.7761 8 12.5V8.5C8 8.22386 8.22386 8 8.5 8H12.5C12.7761 8 13 8.22386 13 8.5V12.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'repeat-x',
									description: 'Repeat horizontally',
									icon: (
										<g transform="translate(9 9)">
											<rect
												width="14"
												height="14"
												rx="1"
												opacity={0}
												strokeOpacity={1}
											/>
											<path
												d="M6 9.5C6 9.77614 5.77614 10 5.5 10H1.5C1.22386 10 1 9.77614 1 9.5V5.5C1 5.22386 1.22386 5 1.5 5H5.5C5.77614 5 6 5.22386 6 5.5V9.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M13 9.5C13 9.77614 12.7761 10 12.5 10H8.5C8.22386 10 8 9.77614 8 9.5V5.5C8 5.22386 8.22386 5 8.5 5H12.5C12.7761 5 13 5.22386 13 5.5V9.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'repeat-y',
									description: 'Repeat vertically',
									icon: (
										<g transform="translate(9 9)">
											<rect
												width="14"
												height="14"
												rx="1"
												opacity={0}
												strokeOpacity={1}
											/>
											<path
												d="M9 8C9.27614 8 9.5 8.22386 9.5 8.5V12.5C9.5 12.7761 9.27614 13 9 13H5C4.72386 13 4.5 12.7761 4.5 12.5L4.5 8.5C4.5 8.22386 4.72386 8 5 8L9 8Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M9 1C9.27614 1 9.5 1.22386 9.5 1.5V5.5C9.5 5.77614 9.27614 6 9 6L5 6C4.72386 6 4.5 5.77614 4.5 5.5L4.5 1.5C4.5 1.22386 4.72386 1 5 1L9 1Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'no-repeat',
									description: 'No repeat',
									icon: (
										<g transform="translate(9 9)">
											<rect
												width="14"
												height="14"
												rx="1"
												opacity={0}
												strokeOpacity={1}
											/>
											<path
												d="M9 4.5C9.27614 4.5 9.5 4.72386 9.5 5V9C9.5 9.27614 9.27614 9.5 9 9.5H5C4.72386 9.5 4.5 9.27614 4.5 9L4.5 5C4.5 4.72386 4.72386 4.5 5 4.5L9 4.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'space',
									description: 'Space',
									icon: (
										<g transform="translate(9 9)">
											<rect
												width="14"
												height="14"
												rx="1"
												opacity={0}
												strokeOpacity={1}
											/>
											<path
												d="M5 4.5C5 4.77614 4.77614 5 4.5 5H0.5C0.223858 5 0 4.77614 0 4.5V0.5C0 0.223858 0.223857 0 0.5 0H4.5C4.77614 0 5 0.223857 5 0.5V4.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M5 13.5C5 13.7761 4.77614 14 4.5 14H0.5C0.223858 14 0 13.7761 0 13.5V9.5C0 9.22386 0.223857 9 0.5 9H4.5C4.77614 9 5 9.22386 5 9.5V13.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M14 4.5C14 4.77614 13.7761 5 13.5 5H9.5C9.22386 5 9 4.77614 9 4.5V0.5C9 0.223858 9.22386 0 9.5 0H13.5C13.7761 0 14 0.223857 14 0.5V4.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
											<path
												d="M14 13.5C14 13.7761 13.7761 14 13.5 14H9.5C9.22386 14 9 13.7761 9 13.5V9.5C9 9.22386 9.22386 9 9.5 9H13.5C13.7761 9 14 9.22386 14 9.5V13.5Z"
												fill="#02B694"
												strokeOpacity={0}
											/>
										</g>
									),
								},
								{
									name: 'round',
									description: 'Round',
									icon: (
										<g transform="translate(9 9)" strokeOpacity={1}>
											<path
												d="M14 13C14 13.5523 13.5523 14 13 14H1C0.447716 14 0 13.5523 0 13V1C0 0.447716 0.447716 0 1 0H13C13.5523 0 14 0.447716 14 1V13Z"
												fill="#02B694" // style={{ fill: 'none' }}
												strokeOpacity={0}
											/>
										</g>
									),
								},
							],
						},

						{
							name: 'backgroundPosition',
							displayName: 'Position',
							type: 'icons',
							withBackground: true,
							gridSize: '3 3',
							// dropdownOptions: [
							// 	{ name: 'left top', displayName: 'Left Top' },
							// 	{ name: 'center top', displayName: 'Center Top' },
							// 	{ name: 'right top', displayName: 'Right Top' },
							// 	{ name: 'left center', displayName: 'Left Center' },
							// 	{ name: 'center center', displayName: 'Center Center' },
							// 	{ name: 'right center', displayName: 'Right Center' },
							// 	{ name: 'left bottom', displayName: 'Left Bottom' },
							// 	{ name: 'center bottom', displayName: 'Center Bottom' },
							// 	{ name: 'right bottom', displayName: 'Right Bottom' },
							// ],
							options: [
								{
									name: 'left top',
									description: 'Left Top',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												stroke="#02B694"
												strokeWidth="1"
												style={{ fill: 'none' }}
											/>
											<path d="M2 2h4v4H2V2z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'center top',
									description: 'Center Top',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M5 2h4v4H5V2z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'right top',
									description: 'Right Top',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M8 2h4v4H8V2z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'left center',
									description: 'Left Center',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M2 5h4v4H2V5z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'center center',
									description: 'Center Center',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M5 5h4v4H5V5z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'right center',
									description: 'Right Center',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M8 5h4v4H8V5z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'left bottom',
									description: 'Left Bottom',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M2 8h4v4H2V8z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'center bottom',
									description: 'Center Bottom',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M5 8h4v4H5V8z" fill="#02B694" />
										</g>
									),
								},
								{
									name: 'right bottom',
									description: 'Right Bottom',
									icon: (
										<g transform="translate(9 9)">
											<rect
												x="1"
												y="1"
												width="12"
												height="12"
												style={{ fill: 'none' }}
												stroke="#02B694"
												strokeWidth="1"
											/>
											<path d="M8 8h4v4H8V8z" fill="#02B694" />
										</g>
									),
								},
							],
							default: 'left top',
						},

						{
							name: 'backgroundPositionX',
							displayName: 'Horizontal',
							type: 'pixel size',
							default: '10px',
							options: [],
						},
						{
							name: 'backgroundPositionY',
							displayName: 'Vertical',
							type: 'pixel size',
							default: '10px',
							options: [],
						},
					]}
				/>
			</div>
			{fileBrowserPopup}
		</>
	);
}

function BackgroundDetailedEditor(props: Readonly<StyleEditorsProps>) {
	const { propValues, propAndValue } = BACKGROUND_PROPS.reduce(
		(a, c) => {
			const value = extractValue({
				subComponentName: props.subComponentName,
				prop: c,
				iterateProps: props.iterateProps,
				pseudoState: props.pseudoState,
				selectorPref: props.selectorPref,
				selectedComponent: props.selectedComponent,
			});

			a.propValues.push(value);
			a.propAndValue.push({ prop: c, value: value.value?.value ?? '' });

			return a;
		},
		{ propValues: [] as any[], propAndValue: [] as { prop: string; value: string }[] },
	);

	return (
		<div className="_detailedEditor">
			<ManyValuesEditor
				onChange={v =>
					valuesChangedOnlyValues({
						subComponentName: props.subComponentName,
						selectedComponent: props.selectedComponent,
						selectedComponentsList: props.selectedComponentsList,
						selectorPref: props.selectorPref,
						defPath: props.defPath,
						locationHistory: props.locationHistory,
						pageExtractor: props.pageExtractor,
						propValues: v.map(item => ({
							prop: item.prop,
							value: item.value,
						})),
					})
				}
				values={propAndValue}
				groupTitle={`Detailed Properties`}
				newValueProps={[]}
				showNewGroup={false}
				// splitOptions={{ splitBy: 'comma' }}
				propDefinitions={[
					{
						name: 'backgroundAttachment',
						displayName: 'Attachment',
						type: 'icons',
						default: 'scroll',
						options: [
							{
								name: 'scroll',
								description: 'Scroll',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M0 0L0 14H1.5L1.5 0H0Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
										<path
											d="M12.5 0L12.5 14H14L14 0H12.5Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
										<path
											d="M8.99459 8.99219L11 6.99754L8.99459 4.99225V6.66326L5.00516 6.66326V4.99225L3 6.99754L5.00516 8.99219V7.33156L8.99459 7.33156V8.99219Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
									</g>
								),
							},
							{
								name: 'fixed',
								description: 'Fixed',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M14 12.5H0L0 14H14V12.5Z"
											// fill="#f9f9f9"
											className=""
											strokeOpacity={0}
										/>
										<path
											d="M14 0L0 0L0 1.5L14 1.5V0Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
										<path
											d="M5 8.99459L6.99465 11L8.99994 8.99459H7.32893V5.00516H8.99994L6.99465 3L5 5.00516H6.66063V8.99459H5Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
									</g>
								),
							},
							{
								name: 'local',
								description: 'Local',
								icon: (
									<g transform="translate(9 9)">
										<path
											d="M8.87801 6.37743H8.69063V5.6904C8.6916 5.28488 8.54641 4.89259 8.28166 4.58541C8.01691 4.27824 7.65034 4.07675 7.24912 4.01787C6.84789 3.959 6.43889 4.04667 6.09705 4.26483C5.75521 4.48299 5.50343 4.81702 5.38785 5.20572C5.37604 5.24509 5.3721 5.2864 5.37625 5.3273C5.38041 5.36819 5.39258 5.40786 5.41206 5.44405C5.45142 5.51714 5.5182 5.57161 5.59771 5.59546C5.67722 5.61931 5.76295 5.6106 5.83604 5.57125C5.90913 5.53189 5.96359 5.46511 5.98745 5.3856C6.0608 5.14164 6.21942 4.93218 6.43437 4.79545C6.64932 4.65872 6.90626 4.60382 7.15831 4.64078C7.41037 4.67774 7.64073 4.80409 7.80737 4.99678C7.97402 5.18947 8.06583 5.43565 8.06605 5.6904V6.25252C8.06605 6.28565 8.05289 6.31742 8.02946 6.34085C8.00604 6.36427 7.97426 6.37743 7.94113 6.37743H5.13052C4.998 6.37743 4.87091 6.43008 4.77721 6.52378C4.6835 6.61749 4.63086 6.74458 4.63086 6.8771V9.50034C4.63086 9.56595 4.64378 9.63093 4.66889 9.69155C4.694 9.75217 4.73081 9.80725 4.77721 9.85365C4.82361 9.90005 4.87869 9.93685 4.93931 9.96197C4.99993 9.98708 5.06491 10 5.13052 10H8.87801C8.94362 10 9.0086 9.98708 9.06922 9.96197C9.12984 9.93685 9.18492 9.90005 9.23132 9.85365C9.27772 9.80725 9.31452 9.75217 9.33963 9.69155C9.36475 9.63093 9.37767 9.56595 9.37767 9.50034V6.8771C9.37767 6.74458 9.32503 6.61749 9.23132 6.52378C9.13762 6.43008 9.01052 6.37743 8.87801 6.37743ZM6.5046 7.87643C6.5046 7.74391 6.55724 7.61682 6.65095 7.52311C6.74465 7.42941 6.87175 7.37676 7.00426 7.37676C7.13678 7.37676 7.26388 7.42941 7.35758 7.52311C7.45129 7.61682 7.50393 7.74391 7.50393 7.87643C7.5034 7.96362 7.48007 8.04917 7.43624 8.12455C7.39241 8.19994 7.32961 8.26254 7.2541 8.30614V8.87576C7.2541 8.94202 7.22778 9.00556 7.18092 9.05241C7.13407 9.09927 7.07052 9.12559 7.00426 9.12559C6.938 9.12559 6.87446 9.09927 6.82761 9.05241C6.78075 9.00556 6.75443 8.94202 6.75443 8.87576V8.30614C6.67891 8.26254 6.61612 8.19994 6.57229 8.12455C6.52846 8.04917 6.50513 7.96362 6.5046 7.87643Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
										<path
											d="M14 12.5H0L0 14H14V12.5Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
										<path
											d="M14 0L0 0L0 1.5L14 1.5V0Z"
											fill="#02B694"
											strokeOpacity={0}
										/>
									</g>
								),
							},
						],
					},
					{
						name: 'backgroundClip',
						displayName: 'Clip',
						type: 'icons',
						default: 'border-box',
						options: [
							{
								name: 'border-box',
								description: 'Border Box',
								icon: (
									<g transform="translate(9 9)">
										<rect
											width="14"
											height="14"
											rx="2"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M12.5 0.5H1.5C0.947715 0.5 0.5 0.947715 0.5 1.5V12.5C0.5 13.0523 0.947715 13.5 1.5 13.5H12.5C13.0523 13.5 13.5 13.0523 13.5 12.5V1.5C13.5 0.947715 13.0523 0.5 12.5 0.5Z"
											strokeDasharray="1 1"
											strokeWidth={1}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
							{
								name: 'padding-box',
								description: 'Padding Box',
								icon: (
									<g transform="translate(8 8)">
										<rect
											x="1.5"
											y="1.49219"
											width="13"
											height="13"
											rx="2"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z"
											stroke="#02B694"
											strokeDasharray="2.5 2.5"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
							{
								name: 'content-box',
								description: 'Content Box',
								icon: (
									<g transform="translate( 8 8)">
										<rect
											x="4"
											y="4"
											width="8"
											height="8"
											rx="1"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M14.6 1H1.4C1.17909 1 1 1.17909 1 1.4V14.6C1 14.8209 1.17909 15 1.4 15H14.6C14.8209 15 15 14.8209 15 14.6V1.4C15 1.17909 14.8209 1 14.6 1Z"
											stroke="#02B694"
											strokeDasharray="2.5 2.5"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
							{
								name: 'text',
								description: 'Text',
								icon: (
									<g transform="translate(8 8)">
										<path
											d="M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z"
											stroke="#02B694"
											strokeDasharray="2.5 2.5"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
										<path
											d="M11 5V6.62389H10.8227C10.7176 6.24926 10.601 5.98083 10.4729 5.81858C10.3448 5.65339 10.1691 5.52212 9.94581 5.42478C9.82102 5.37168 9.60263 5.34513 9.29064 5.34513H8.7931V9.97345C8.7931 10.2802 8.81117 10.472 8.84729 10.5487C8.8867 10.6254 8.96059 10.6932 9.06897 10.7522C9.18062 10.8083 9.33169 10.8363 9.52217 10.8363H9.74384V11H6.24631V10.8363H6.46798C6.66174 10.8363 6.81773 10.8053 6.93596 10.7434C7.02135 10.7021 7.08867 10.6313 7.13793 10.531C7.17406 10.4602 7.19212 10.2743 7.19212 9.97345V5.34513H6.70936C6.25944 5.34513 5.93268 5.43068 5.72906 5.60177C5.44335 5.84071 5.26273 6.18142 5.18719 6.62389H5V5H11Z"
											fill="#E3E5EA"
											strokeOpacity={0}
											className="_lowlight"
										/>
									</g>
								),
							},
							{
								name: 'border-area',
								description: 'Border Area',
								icon: (
									<g transform="translate(8 8)">
										<rect
											x="1.5"
											y="1.5"
											width="13"
											height="13"
											rx="0.4"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z"
											stroke="#02B694"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
						],
					},
					{
						name: 'backgroundOrigin',
						displayName: 'Origin',
						type: 'icons',
						default: 'padding-box',
						options: [
							{
								name: 'border-box',
								description: 'Border Box',
								icon: (
									<g transform="translate(9 9)">
										<rect
											width="14"
											height="14"
											rx="2"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M12.5 0.5H1.5C0.947715 0.5 0.5 0.947715 0.5 1.5V12.5C0.5 13.0523 0.947715 13.5 1.5 13.5H12.5C13.0523 13.5 13.5 13.0523 13.5 12.5V1.5C13.5 0.947715 13.0523 0.5 12.5 0.5Z"
											strokeDasharray="1 1"
											strokeWidth={1}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
							{
								name: 'padding-box',
								description: 'Padding Box',
								icon: (
									<g transform="translate(8 8)">
										<rect
											x="1.5"
											y="1.49219"
											width="13"
											height="13"
											rx="2"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z"
											stroke="#02B694"
											strokeDasharray="2.5 2.5"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
							{
								name: 'content-box',
								description: 'Content Box',
								icon: (
									<g transform="translate( 8 8)">
										<rect
											x="4"
											y="4"
											width="8"
											height="8"
											rx="1"
											strokeOpacity={0}
											className="_lowlight"
										/>
										<path
											d="M14.6 1H1.4C1.17909 1 1 1.17909 1 1.4V14.6C1 14.8209 1.17909 15 1.4 15H14.6C14.8209 15 15 14.8209 15 14.6V1.4C15 1.17909 14.8209 1 14.6 1Z"
											stroke="#02B694"
											strokeDasharray="2.5 2.5"
											strokeWidth={2}
											style={{ fill: 'none' }}
											opacity={1}
										/>
									</g>
								),
							},
						],
					},
				]}
			/>

			<hr />

			<div className="_simpleLabel _withPadding">Mix Blend Mode</div>
			<EachSimpleEditor
				selectedComponentsList={props.selectedComponentsList}
				defPath={props.defPath}
				locationHistory={props.locationHistory}
				pageExtractor={props.pageExtractor}
				subComponentName={props.subComponentName}
				pseudoState={props.pseudoState}
				prop="backgroundBlendMode"
				placeholder="Mix Blend Mode"
				iterateProps={props.iterateProps}
				selectorPref={props.selectorPref}
				styleProps={props.styleProps}
				selectedComponent={props.selectedComponent}
				saveStyle={props.saveStyle}
				properties={props.properties}
				className="_simpleEditor"
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropDownShowNoneLabel: true,
					dropdownOptions: [
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
					],
				}}
			/>

			<div className="_simpleLabel _withPadding">Backdrop Filter</div>
			<div className="background-multiimage-common-editor">
				<ManyFunctionsEditor
					onChange={v =>
						valuesChangedOnlyValues({
							subComponentName: props.subComponentName,
							selectedComponent: props.selectedComponent,
							selectedComponentsList: props.selectedComponentsList,
							selectorPref: props.selectorPref,
							defPath: props.defPath,
							locationHistory: props.locationHistory,
							pageExtractor: props.pageExtractor,
							propValues: [{ prop: 'backdropFilter', value: v }],
						})
					}
					value={propAndValue.find(p => p.prop === 'backdropFilter')?.value ?? ''}
					newFunctionTitle="Backdrop Filter"
					functionDetails={FILTER_FUNCTIONS}
				/>
			</div>
		</div>
	);
}
