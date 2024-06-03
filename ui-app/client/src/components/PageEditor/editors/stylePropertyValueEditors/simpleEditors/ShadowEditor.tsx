import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useMemo } from 'react';
import { PixelSize } from './SizeSliders';
import { CommonColorPicker } from '../../../../../commonComponents/CommonColorPicker';
import { IconsSimpleEditor } from './IconsSimpleEditor';
import { ButtonBar } from './ButtonBar';

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
			{shadows.map((e, i) => (
				<div key={makeKey(e, type) + '_' + i} className="_eachShadowEditor">
					<div className="_color_controls">
						<CommonColorPicker
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
								if (v === 'Add') {
									const shadow = createShadowString(shadows, type);
									if (shadow) {
										onChange(shadow + ', 0px 0px #000000');
									}
									return;
								}
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
									name: 'Add',
									description: 'Add a new shadow',
									width: '20',
									height: '10',
									icon: (
										<>
											<path
												d="M14.614,20v1.234H5V20Z"
												transform="translate(30.424 -5) rotate(90)"
												fillOpacity="0.25"
											/>
											<path
												d="M14.614,20v1.234H5V20Z"
												transform="translate(0 -15.81)"
												fillOpacity="0.25"
											/>
										</>
									),
								},
								{
									name: 'Move Down',
									description: 'Move this shadow down',
									width: '20',
									height: '14',
									icon: (
										<>
											<path
												d="M4.32643 1C4.06219 1 3.84856 1.21363 3.84856 1.47786V11.3753L1.81342 9.35418C1.62509 9.16866 1.32432 9.16866 1.13879 9.35699C0.95327 9.54533 0.95327 9.8461 1.1416 10.0316L3.98911 12.8623C4.08187 12.955 4.20274 13 4.32643 13C4.45011 13 4.57098 12.955 4.66374 12.8623L7.51406 10.0316C7.70239 9.8461 7.70239 9.54252 7.51687 9.35699C7.33134 9.16866 7.02776 9.16866 6.84224 9.35418L4.80429 11.3753V1.47786C4.80429 1.21644 4.59066 1 4.32643 1Z"
												fillOpacity="0.25"
												transform="translate(6,0)"
											/>
										</>
									),
								},
								{
									name: 'Move Up',
									description: 'Move this shadow up',
									width: '20',
									height: '14',
									icon: (
										<>
											<path
												d="M3.98268 13C3.71844 13 3.50481 12.7864 3.50481 12.5221V2.62474L1.46967 4.64582C1.28134 4.83134 0.980567 4.83134 0.795043 4.64301C0.60952 4.45467 0.60952 4.1539 0.797854 3.96838L3.64536 1.13774C3.73812 1.04497 3.85899 1 3.98268 1C4.10636 1 4.22723 1.04497 4.31999 1.13774L7.17031 3.96838C7.35864 4.1539 7.35864 4.45748 7.17312 4.64301C6.98759 4.83134 6.68401 4.83134 6.49849 4.64582L4.46054 2.62474V12.5221C4.46054 12.7836 4.24691 13 3.98268 13Z"
												fillOpacity="0.25"
												transform="translate(2,0)"
											/>
										</>
									),
								},

								{
									name: 'Delete',
									description: 'Delete this shadow',
									width: '13',
									height: '14',
									icon: (
										<>
											<path
												d="M3.93393 0.483984L3.74107 0.875H1.16964C0.695536 0.875 0.3125 1.26602 0.3125 1.75C0.3125 2.23398 0.695536 2.625 1.16964 2.625H11.4554C11.9295 2.625 12.3125 2.23398 12.3125 1.75C12.3125 1.26602 11.9295 0.875 11.4554 0.875H8.88393L8.69107 0.483984C8.54643 0.185938 8.24911 0 7.925 0H4.7C4.37589 0 4.07857 0.185938 3.93393 0.483984ZM11.4554 3.5H1.16964L1.7375 12.7695C1.78036 13.4613 2.34286 14 3.02054 14H9.60446C10.2821 14 10.8446 13.4613 10.8875 12.7695L11.4554 3.5Z"
												fillOpacity="0.25"
												strokeWidth="0"
											/>
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
						placeholder="H-Offset"
						extraOptions={[
							{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
							{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
							{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
							{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
							{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
							{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
						]}
					/>
					<PixelSize
						value={e.vOffset ?? ''}
						onChange={v => {
							const newShadows = duplicate(shadows);
							newShadows[i].vOffset = v;
							if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
							onChange(createShadowString(newShadows, type));
						}}
						placeholder="V-Offset"
						extraOptions={[
							{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
							{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
							{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
							{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
							{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
							{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
						]}
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
						placeholder="Blur"
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
							placeholder="Spread"
						/>
					)}
					{type === ShadowEditorType.BoxShadow && (
						<div className="_inset">
							<div className="_simpleLabel">Position : </div>
							<ButtonBar
								value={e.inset ? 'inset' : ''}
								onChange={v => {
									const newShadows = duplicate(shadows);
									newShadows[i].inset = v === 'inset';
									if (!newShadows[i].hOffset) newShadows[i].hOffset = '0px';
									if (!newShadows[i].vOffset) newShadows[i].vOffset = '0px';
									if (!newShadows[i].blur) newShadows[i].blur = '0px';
									if (!newShadows[i].spread) newShadows[i].spread = '0px';
									onChange(createShadowString(newShadows, type));
								}}
								options={[
									{
										name: '',
										displayName: 'Outer',
										description: 'Outset',
									},
									{
										name: 'inset',
										displayName: 'Inner',
										description: 'Inset',
									},
								]}
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
