import React, { useEffect, useState } from 'react';
import { Dropdown } from './Dropdown';
import { RangeSlider } from '../../../../../commonComponents/RangeSlider';
import { AngleSlider } from './AngleSlider';

export interface UnitOption {
	name: string;
	displayName: string;
	min?: number;
	max?: number;
	step?: number;
}

export function RangeWithoutUnit({
	value = '',
	onChange,
	placeholder,
	autofocus = false,
	hideSlider = false,
	min,
	max,
	step,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number;
	autofocus?: boolean;
	hideSlider?: boolean;
}) {
	return (
		<GenericRangeSlider
			value={value}
			onChange={e => (e.endsWith('number') ? onChange(e.replace('number', '')) : onChange(e))}
			placeholder={placeholder}
			autofocus={autofocus}
			hideSlider={hideSlider}
			hideUnits={true}
			unitOptions={[{ name: 'number', displayName: 'Number', min, max, step }]}
		/>
	);
}

const NUMBER_PERCENTAGE_OPTIONS: UnitOption[] = [
	{ name: '', displayName: 'Num', min: 0, max: 100, step: 1 },
	{ name: '%', displayName: '%', min: 0, max: 100, step: 0.1 },
];

export function NumberPercentageSize({
	value = '',
	onChange,
	placeholder,
	autofocus = false,
	hideSlider = false,
	extraOptions = [],
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	autofocus?: boolean;
	hideSlider?: boolean;
	extraOptions?: UnitOption[];
}) {
	const options = [...NUMBER_PERCENTAGE_OPTIONS];

	if (extraOptions.length > 0) {
		const extras = extraOptions.reduce((acc, cur) => {
			acc[cur.name] = cur;
			return acc;
		}, {} as { [key: string]: UnitOption });

		for (let i = 0; i < options.length; i++) {
			const option = options[i];
			if (!(option.name in extras)) continue;
			options[i] = { ...option, ...extras[option.name] };
			delete extras[option.name];
		}

		for (let i = 0; i < extraOptions.length; i++) {
			const option = extraOptions[i];
			if (option.name in extras) {
				options.push(option);
				delete extras[option.name];
			}
		}
	}

	return (
		<GenericRangeSlider
			value={value}
			onChange={e => {
				onChange(e);
			}}
			placeholder={placeholder}
			autofocus={autofocus}
			hideSlider={hideSlider}
			unitOptions={options}
		/>
	);
}

const BEFORE_OPTIONS: UnitOption[] = [
	{ name: 'px', displayName: 'px', min: 0, max: 100, step: 1 },
	{ name: 'vw', displayName: 'vw', min: 0, max: 100, step: 1 },
	{ name: 'vh', displayName: 'vh', min: 0, max: 100, step: 1 },
	{ name: 'vmin', displayName: 'vmin', min: 0, max: 100, step: 1 },
	{ name: 'vmax', displayName: 'vmax', min: 0, max: 100, step: 1 },
	{ name: '%', displayName: '%', min: 0, max: 100, step: 0.1 },
	{ name: 'auto', displayName: 'auto' },
];

const AFTER_OPTIONS: UnitOption[] = [
	{ name: 'em', displayName: 'em', min: 0, max: 100, step: 1 },
	{ name: 'rem', displayName: 'rem', min: 0, max: 100, step: 1 },
	{ name: 'cm', displayName: 'cm', min: 0, max: 100, step: 1 },
	{ name: 'mm', displayName: 'mm', min: 0, max: 100, step: 1 },
	{ name: 'in', displayName: 'in', min: 0, max: 100, step: 1 },
	{ name: 'pt', displayName: 'pt', min: 0, max: 100, step: 1 },
	{ name: 'pc', displayName: 'pc', min: 0, max: 100, step: 1 },
	{ name: 'ex', displayName: 'ex', min: 0, max: 100, step: 1 },
	{ name: 'ch', displayName: 'ch', min: 0, max: 100, step: 1 },
];
export function PixelSize({
	value = '',
	onChange,
	placeholder,
	autofocus = false,
	hideSlider = false,
	extraOptions = [],
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	autofocus?: boolean;
	hideSlider?: boolean;
	extraOptions?: UnitOption[];
}) {
	const extras: { [key: string]: UnitOption } = extraOptions.length
		? extraOptions.reduce((acc, cur) => {
				acc[cur.name] = cur;
				return acc;
		  }, {} as { [key: string]: UnitOption })
		: {};

	const options: UnitOption[] = [...BEFORE_OPTIONS];

	if (extraOptions.length) {
		const usedKeys = new Set<string>();
		for (let i = 0; i < options.length; i++) {
			const option = options[i];
			if (!(option.name in extras)) continue;
			usedKeys.add(option.name);
			options[i] = { ...option, ...extras[option.name] };
			delete extras[option.name];
		}

		for (let i = 0; i < extraOptions.length; i++) {
			const option = extraOptions[i];
			if (option.name in extras) {
				options.push(option);
				delete extras[option.name];
			}
		}

		options.push(...AFTER_OPTIONS.filter(e => !(e.name in usedKeys)));
	} else {
		options.push(...AFTER_OPTIONS);
	}

	return (
		<GenericRangeSlider
			value={value}
			onChange={e => onChange(e.endsWith('auto') ? 'auto' : e)}
			placeholder={placeholder}
			autofocus={autofocus}
			hideSlider={hideSlider}
			unitOptions={options}
		/>
	);
}

const ANGLE_UNITS = [
	{ name: 'deg', displayName: 'Deg', min: 0, max: 360, step: 1 },
	{ name: 'rad', displayName: 'Rad', min: 0, max: 2 * Math.PI, step: 0.01 },
	{ name: 'grad', displayName: 'Grad', min: 0, max: 400, step: 1 },
	{ name: 'turn', displayName: 'Turn', min: 0, max: 1, step: 0.01 },
];

export function AngleSize({
	value = '',
	onChange,
	placeholder,
	autofocus = false,
	hideSlider = false,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	autofocus?: boolean;
	hideSlider?: boolean;
}) {
	let unit = value.replace(/[0-9\-. ]/g, '').toLowerCase();
	if (!unit) unit = 'deg';

	const { min, max, step } = ANGLE_UNITS.find(e => e.name === unit) ?? {};

	return (
		<div className="_simpleEditorAngleSize">
			<AngleSlider
				value={Number(value.replace(/[a-zA-Z ]/g, ''))}
				onChange={v => onChange(v + unit)}
				min={min}
				max={max}
				step={step}
			/>
			<GenericRangeSlider
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				autofocus={autofocus}
				hideSlider={hideSlider}
				unitOptions={ANGLE_UNITS}
			></GenericRangeSlider>
		</div>
	);
}

export function TimeSize({
	value = '',
	onChange,
	placeholder,
	autofocus = false,
	hideSlider = false,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number;
	autofocus?: boolean;
	hideSlider?: boolean;
}) {
	return (
		<GenericRangeSlider
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			autofocus={autofocus}
			hideSlider={hideSlider}
			unitOptions={[
				{ name: 's', displayName: 'Sec', min: 0, max: 100, step: 1 },
				{ name: 'ms', displayName: 'MS', min: 0, max: 10000, step: 100 },
			]}
		/>
	);
}

function GenericRangeSlider({
	value = '',
	onChange,
	placeholder,
	unitOptions,
	autofocus = false,
	hideSlider = false,
	children,
	hideUnits = false,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	unitOptions: UnitOption[];
	autofocus?: boolean;
	hideSlider?: boolean;
	hideUnits?: boolean;
	children?: React.ReactNode | React.ReactNode[];
}) {
	let num = '';
	let unit = unitOptions[0]?.name ?? '';

	if (value) {
		num = value.replace(/[a-zA-Z% ]/g, '');
		unit = value.replace(/[0-9\-. ]/g, '').toLowerCase();
	}

	const [inNum, setInNum] = useState(num);

	useEffect(() => {
		setInNum(num);
	}, [num]);

	let slider = undefined;
	if (!hideSlider) {
		const { min, max, step } = unitOptions.find(e => e.name === unit) ?? {};
		slider = (
			<RangeSlider
				value={Number(inNum)}
				onChange={v => onChange(String(v) + unit)}
				min={min}
				max={max ?? 100}
				step={step}
			/>
		);
	}

	let dropdown = undefined;
	if (unitOptions.length > 0 && !hideUnits)
		dropdown = (
			<Dropdown
				value={unit}
				onChange={v => onChange(num + v)}
				options={unitOptions}
				showNoneLabel={false}
			/>
		);

	return (
		<div className="_simpleEditorPixelSize">
			{children}
			{slider}
			<div className="_inputDropdownContainer">
				<input
					tabIndex={0}
					type="text"
					value={inNum}
					placeholder={placeholder}
					onChange={e => setInNum(e.target.value)}
					autoFocus={autofocus}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							if (isNaN(Number(inNum)) || inNum == '') onChange(inNum);
							else onChange(inNum + unit);
							setInNum(inNum.replace(/[a-zA-Z% ]/g, ''));
						} else if (e.key === 'Escape') setInNum(num);
						else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
							e.preventDefault();
							if (isNaN(Number(inNum))) setInNum(inNum);
							else
								setInNum(
									String(
										Math.round(
											(Number(inNum) + (e.key === 'ArrowDown' ? -1 : 1)) *
												100,
										) / 100,
									),
								);
						}
					}}
					onBlur={() => {
						if (isNaN(Number(inNum)) || inNum == '') onChange(inNum);
						else onChange(inNum + unit);
					}}
				/>
				{dropdown}
			</div>
		</div>
	);
}
