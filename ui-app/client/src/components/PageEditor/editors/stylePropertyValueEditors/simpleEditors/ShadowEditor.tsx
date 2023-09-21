import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useMemo } from 'react';
import { PixelSize } from './PixelSize';
import { ColorSelector } from './ColorSelector';
import { IconsSimpleEditor } from './IconsSimpleEditor';

export enum ShadowEditorType {
	BoxShadow = 'boxShadow',
	TextShadow = 'textShadow',
}

interface Shadow {
	hOffset?: string;
	vOffset?: string;
	blur?: string;
	spread?: string;
	color?: string;
	inset?: boolean;
}

function createShadowString(shadows: Array<Shadow>, type: ShadowEditorType) {
	if (!shadows || shadows.length === 0) return '';
	const is_box_shadow = type === ShadowEditorType.BoxShadow;
	return shadows
		.map(e => {
			const { hOffset, vOffset, blur, spread, color, inset } = e;
			if (!hOffset || !vOffset) return '';

			const arr = [hOffset, vOffset];
			if (blur) arr.push(blur);
			if (is_box_shadow && spread) arr.push(spread);
			if (color) arr.push(color);
			if (is_box_shadow && inset) arr.push('inset');

			return arr.join(' ');
		})
		.join(',');
}

export function splitShadows(shadows: string): Array<string> {
	const arr: Array<string> = [];

	let current = '';
	let i = 0;

	while (i < shadows.length) {
		let c = shadows[i];
		if (c === '(') {
			let count = 1;
			while (count > 0 && i < shadows.length) {
				current += c;
				c = shadows[++i];
				if (c === '(') count++;
				else if (c === ')') count--;
			}
			current += c;
		} else if (c === ',') {
			arr.push(current.trim());
			current = '';
		} else {
			current += c;
		}
		i++;
	}

	if (current) arr.push(current.trim());

	return arr;
}

export function convertEachStringToShadow(shadowString: string): Shadow {
	const v = shadowString.trim().split(' ');
	if (v.length < 2) return {};

	const [hOffset, vOffset, ...other] = v;

	const shadow: Shadow = {
		hOffset,
		vOffset,
	};

	for (let i = 0; i < other.length; i++) {
		const current = other[i].trim();
		if (current === 'inset') {
			shadow.inset = true;
		} else if (current.startsWith('#')) {
			shadow.color = current;
		} else if (current.startsWith('rgb') || current.startsWith('hsl')) {
			let c = current;
			while (i < other.length) {
				c += ' ' + other[++i];
				if (c.endsWith(')')) break;
			}
			shadow.color = c;
		} else {
			if (!shadow.blur) shadow.blur = current;
			else shadow.spread = current;
		}
	}

	return shadow;
}

export function makeKey(shadow: Shadow, type: ShadowEditorType) {
	const is_box_shadow = type === ShadowEditorType.BoxShadow;
	const { hOffset, vOffset, blur, spread, color, inset } = shadow;
	if (!hOffset || !vOffset) return '';

	const arr = [hOffset, vOffset];
	if (blur) arr.push(blur);
	if (is_box_shadow && spread) arr.push(spread);
	if (is_box_shadow && inset) arr.push('inset');
	return arr.join(' ');
}

export function ShadowEditor({
	value,
	type,
	onChange,
}: {
	value: string;
	type: ShadowEditorType;
	onChange: (v: string) => void;
}) {
	const shadows = useMemo<Array<Shadow>>(() => {
		if (!value) return [{}];

		const arr = splitShadows(value)
			.map(convertEachStringToShadow)
			.filter(e => !isNullValue(e.hOffset) && !isNullValue(e.vOffset));

		return arr.length === 0 ? [{}] : arr;
	}, [value]);

	return (
		<div className="_simpleEditorShadow">
			<div className="_label">
				{type === ShadowEditorType.BoxShadow ? 'Box Shadow :' : 'Text Shadow :'}
				<IconsSimpleEditor
					selected={''}
					onChange={v => {
						const shadow = createShadowString(shadows, type);
						if (shadow) {
							onChange(shadow + ', 0px 0px #000000');
						}
					}}
					withBackground={false}
					options={[
						{
							name: 'Add',
							description: 'Add a new shadow',
							width: '10',
							height: '10',
							icon: (
								<>
									<path
										id="Path_142"
										data-name="Path 142"
										d="M14.614,20v1.234H5V20Z"
										transform="translate(25.424 -5) rotate(90)"
										fill="#e9ebef"
									/>
									<path
										id="Path_143"
										data-name="Path 143"
										d="M14.614,20v1.234H5V20Z"
										transform="translate(-5 -15.81)"
										fill="#e9ebef"
									/>
								</>
							),
						},
					]}
				/>
			</div>
			{shadows.map((e, i) => (
				<div key={makeKey(e, type) + '_' + i} className="_eachShadowEditor">
					<div className="_color_controls">
						<ColorSelector
							variableSelection={false}
							color={{ value: e.color ?? '' }}
							onChange={v => {
								const newShadows = duplicate(shadows);
								newShadows[i].color = v.value;
								if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
								if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
								if (!newShadows[i].blur) newShadows[i].blur = '0px';
								if (type === ShadowEditorType.BoxShadow) {
									if (!newShadows[i].spread) newShadows[i].spread = '0px';
								}
								onChange(createShadowString(newShadows, type));
							}}
						/>
						<IconsSimpleEditor
							selected={''}
							onChange={v => {
								if (v === 'Delete') {
									const newShadows = duplicate(shadows);
									newShadows.splice(i, 1);
									onChange(createShadowString(newShadows, type));
									return;
								}

								if (shadows.length === 1) return;

								if (v === 'Move Up') {
									const newShadows = duplicate(shadows);
									const current = newShadows[i];
									newShadows.splice(i, 1);
									newShadows.splice(
										i <= 0 ? newShadows.length : i - 1,
										0,
										current,
									);
									onChange(createShadowString(newShadows, type));
									return;
								} else {
									const newShadows = duplicate(shadows);
									const current = newShadows[i];
									newShadows.splice(i, 1);
									newShadows.splice(
										i >= newShadows.length ? 0 : i + 1,
										0,
										current,
									);
									onChange(createShadowString(newShadows, type));
									return;
								}
							}}
							withBackground={false}
							options={[
								{
									name: 'Move Up',
									description: 'Move this shadow up',
									width: '10',
									height: '11',
									icon: (
										<>
											<path
												id="Path_142"
												data-name="Path 142"
												d="M14.614,20v1.234H5V20Z"
												transform="translate(25.319 -3.84) rotate(90)"
											/>
											<path
												id="Path_143"
												data-name="Path 143"
												d="M8.866,20v1.234l-3.738.017V20.017Z"
												transform="translate(15.276 -17.711) rotate(45)"
											/>
											<path
												id="Path_144"
												data-name="Path 144"
												d="M3.849,1.234V0L.047-.028V1.206Z"
												transform="translate(5.594 0.839) rotate(135)"
											/>
										</>
									),
								},
								{
									name: 'Move Down',
									description: 'Move this shadow down',
									width: '13',
									height: '11',
									icon: (
										<>
											<path
												id="Path_142"
												data-name="Path 142"
												d="M9.614,1.234V0H0V1.234Z"
												transform="translate(4.085 9.614) rotate(-90)"
											/>
											<path
												id="Path_143"
												data-name="Path 143"
												d="M3.737,1.251V.017L0,0V1.234Z"
												transform="translate(3.876 9.831) rotate(-45)"
											/>
											<path
												id="Path_144"
												data-name="Path 144"
												d="M3.8,0V1.234L0,1.262V.028Z"
												transform="translate(4.688 10.774) rotate(-135)"
											/>
										</>
									),
								},
								{
									name: 'Delete',
									description: 'Delete this shadow',
									width: '10',
									height: '11',
									icon: (
										<>
											<path d="M9.29119 1.09029H5.88995V0.983634C5.88995 0.438487 5.45146 0 4.90632 0C4.36117 0 3.92268 0.438487 3.92268 0.983634V1.09029H0.521444C0.23702 1.09029 0 1.32731 0 1.61174C0 1.89616 0.23702 2.13318 0.521444 2.13318H9.29119C9.57561 2.13318 9.81263 1.89616 9.81263 1.61174C9.81263 1.32731 9.57561 1.09029 9.29119 1.09029Z" />
											<path d="M8.91185 2.84424H0.900574C0.793915 2.84424 0.710958 2.93905 0.722809 3.04571L1.63534 10.3341C1.70644 10.8555 2.14493 11.2585 2.67822 11.2585H7.1342C7.6675 11.2585 8.10599 10.8674 8.17709 10.3341L9.08962 3.04571C9.10147 2.93905 9.01851 2.84424 8.91185 2.84424Z" />
										</>
									),
								},
							]}
						/>
					</div>
					<PixelSize
						value={e.hOffset ?? ''}
						onChange={v => {
							const newShadows = duplicate(shadows);
							newShadows[i].hOffset = v;
							if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
							onChange(createShadowString(newShadows, type));
						}}
						min={0}
						max={50}
						placeholder="hOffset"
					/>
					<PixelSize
						value={e.vOffset ?? ''}
						onChange={v => {
							const newShadows = duplicate(shadows);
							newShadows[i].vOffset = v;
							if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
							onChange(createShadowString(newShadows, type));
						}}
						min={0}
						max={50}
						placeholder="vOffset"
					/>
					<PixelSize
						value={e.blur ?? ''}
						onChange={v => {
							const newShadows = duplicate(shadows);
							newShadows[i].blur = v;
							if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
							if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
							onChange(createShadowString(newShadows, type));
						}}
						min={0}
						max={50}
						placeholder="blur"
					/>
					{type === ShadowEditorType.BoxShadow && (
						<PixelSize
							value={e.spread ?? ''}
							onChange={v => {
								const newShadows = duplicate(shadows);
								newShadows[i].spread = v;
								if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
								if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
								if (!newShadows[i].blur) newShadows[i].blur = '0px';
								onChange(createShadowString(newShadows, type));
							}}
							min={0}
							max={50}
							placeholder="spread"
						/>
					)}
					{type === ShadowEditorType.BoxShadow && (
						<div className="_inset">
							<label>Inset</label>
							<input
								type="checkbox"
								checked={e.inset}
								onChange={e => {
									const newShadows = duplicate(shadows);
									newShadows[i].inset = e.target.checked;
									if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
									if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
									if (!newShadows[i].blur) newShadows[i].blur = '0px';
									if (!newShadows[i].spread) newShadows[i].spread = '0px';
									onChange(createShadowString(newShadows, type));
								}}
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
