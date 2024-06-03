import React from 'react';
import { Generate } from './FillerValueEditorIcons';
import { CommonColorPicker } from '../../../commonComponents/CommonColorPicker';

const PALLETTE_NAMES = [
	{
		displayName: 'Summer',
		colors: ['#96ceb4', '#ffeead', '#ffcc5c', '#ff6f69'],
	},
	{
		displayName: 'Candy',
		colors: ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb'],
	},
	{
		displayName: 'Nature',
		colors: ['#ffbe76', '#ff7979', '#badc58', '#dff9fb'],
	},
	{
		displayName: 'Coral',
		colors: ['#f8a5c2', '#f78fb3', '#f5cd79', '#f19066'],
	},
	{
		displayName: 'Blue',
		colors: ['#bccad6', '#8d9db6', '#667292', '#f1e3dd'],
	},
	{
		displayName: 'Grey',
		colors: ['#f0f0f0', '#c5d5c5', '#9fa9a3', '#e3e0cc'],
	},
];

// 				samplePalettes={editor.samplePalettes}
// 				hideGeneratePalette={editor.hideGeneratePalette}
export default function Palette({
	value,
	onChange,
	numOfColors,
	samplePalettes,
	hideGeneratePalette,
}: {
	value: string[];
	onChange: (colors: string[]) => void;
	numOfColors: number;
	samplePalettes?: { displayName: string; colors: string[] }[];
	hideGeneratePalette?: boolean;
}) {
	const [bodyOpen, setBodyOpen] = React.useState(false);

	let body = <></>;
	if (bodyOpen) {
		body = (
			<div className="_simpleFillerPickerDropdownBody _colorDropdown">
				{(samplePalettes ?? PALLETTE_NAMES).map((palette, index) => (
					<div
						key={`${palette.displayName}_${index}`}
						className="_simpleFillerPickerDropdownOption"
						onClick={() => {
							const colors = [...palette.colors];

							while (colors.length < numOfColors) {
								colors.push(colors[colors.length - 1]);
							}
							onChange(colors);
							setBodyOpen(false);
						}}
					>
						<div className="_simpleFillerPickerDropdownOptionColors">
							{palette.colors.map((color, index) => (
								<div
									key={`${color}_${index}`}
									className="_eachColor"
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
						{palette.displayName}
					</div>
				))}
			</div>
		);
	}
	let combo = <></>;
	if ((samplePalettes ?? PALLETTE_NAMES)?.length) {
		combo = (
			<div
				className="_simpleFillerPickerSelect"
				onClick={() => setBodyOpen(true)}
				onMouseLeave={() => setBodyOpen(false)}
				role="combobox"
			>
				Choose a Palette
				<svg
					width="8"
					height="4"
					viewBox="0 0 8 4"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4.56629 3.80476C4.56548 3.80476 4.5647 3.80505 4.56408 3.80556C4.25163 4.06508 3.74506 4.06481 3.43301 3.80476L0.234347 1.13914C0.00444266 0.947547 -0.0630292 0.662241 0.0619187 0.412339C0.186867 0.162436 0.476746 5.68513e-09 0.80161 9.5591e-09L7.19894 8.58465e-08C7.52131 8.96907e-08 7.81369 0.162437 7.93863 0.412339C8.06358 0.662241 7.99361 0.947547 7.76621 1.13914L4.5685 3.80396C4.56788 3.80448 4.5671 3.80476 4.56629 3.80476Z"
						fill="#CCCCCC"
					/>
				</svg>
				{body}
			</div>
		);
	}

	let generateButton = <></>;
	if (!hideGeneratePalette) {
		generateButton = (
			<div className="_generateButtonContainer">
				<div
					className="_generateButton"
					onClick={() => {
						const colors = [];
						for (let i = 0; i < numOfColors; i++) {
							colors.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
						}
						onChange(colors);
					}}
				>
					<Generate />
				</div>
			</div>
		);
	}

	return (
		<div className="_palette">
			<div className="_currentPalette">
				{(value.length ? value : new Array(numOfColors).fill('')).map((color, index) => (
					<CommonColorPicker
						key={`${index}`}
						color={color ?? ''}
						onChange={color => {
							const colors = [
								...(value.length ? value : new Array(numOfColors).fill('')),
							];
							colors[index] = color;
							onChange(colors);
						}}
					/>
				))}
				{generateButton}
			</div>
			{combo}
		</div>
	);
}
