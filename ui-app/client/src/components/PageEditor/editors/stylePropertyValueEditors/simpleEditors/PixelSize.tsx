import React, { useEffect, useState } from 'react';
import { Dropdown } from './Dropdown';
import { RangeSlider } from './RangeSlider';

export function PixelSize({
	value = '',
	onChange,
	placeholder,
	min = 0,
	max = 100,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	min?: number;
	max?: number;
}) {
	let num = '';
	let unit = 'px';

	if (value) {
		num = value.replace(/[a-zA-Z% ]/g, '');
		unit = value.replace(/[0-9. ]/g, '').toLowerCase();
	}

	const [inNum, setInNum] = useState(num);

	useEffect(() => {
		setInNum(num);
	}, [num]);

	return (
		<div className="_simpleEditorPixelSize">
			<RangeSlider
				value={Number(inNum)}
				onChange={v => onChange(String(v) + unit)}
				min={min}
				max={max}
				step={1}
			/>
			<input
				tabIndex={0}
				className="_simpleEditorInput"
				type="text"
				value={inNum}
				placeholder={placeholder}
				onChange={e => setInNum(e.target.value)}
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
										(Number(inNum) + (e.key === 'ArrowDown' ? -1 : 1)) * 100,
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
			<Dropdown
				value={unit}
				onChange={v => onChange(num + v)}
				options={[
					{ name: 'px', displayName: 'px' },
					{ name: 'vw', displayName: 'vw' },
					{ name: 'vh', displayName: 'vh' },
					{ name: 'vmin', displayName: 'vmin' },
					{ name: 'vmax', displayName: 'vmax' },
					{ name: '%', displayName: '%' },
					{ name: 'em', displayName: 'em' },
					{ name: 'rem', displayName: 'rem' },
					{ name: 'cm', displayName: 'cm' },
					{ name: 'mm', displayName: 'mm' },
					{ name: 'in', displayName: 'in' },
					{ name: 'pt', displayName: 'pt' },
					{ name: 'pc', displayName: 'pc' },
					{ name: 'ex', displayName: 'ex' },
					{ name: 'ch', displayName: 'ch' },
				]}
			/>
		</div>
	);
}
