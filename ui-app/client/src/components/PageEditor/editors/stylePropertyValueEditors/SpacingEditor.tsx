import React, { ReactNode, useRef, useState } from 'react';
import {
	StyleEditorsProps,
	extractValue,
	valuesChanged,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { RangeSlider } from './simpleEditors/RangeSlider';
import { PixelSize } from './simpleEditors/SizeSliders';
import { IconOptions, IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';

export function SpacingEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
}: StyleEditorsProps) {
	const [top, setTop] = useState('');
	const [changeType, setChangeType] = useState('');
	const [direction, setDirection] = useState('');
	const parentRef = useRef<HTMLDivElement>(null);

	let padValues: ReactNode[] = [];
	let marginValues: ReactNode[] = [];
	let marginHasValue = false;
	let paddingHasValue = false;
	let propValues: any = {};
	for (let prop of [
		'marginBottom',
		'marginLeft',
		'marginRight',
		'marginTop',
		'paddingBottom',
		'paddingLeft',
		'paddingRight',
		'paddingTop',
	]) {
		const value = extractValue({
			subComponentName,
			prop,
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const direction = prop.replace('margin', '').replace('padding', '').toLowerCase();

		(prop.startsWith('margin') ? marginValues : padValues).push(
			<div
				key={prop}
				className={`_value _${direction} ${value ? '' : '_default'}`}
				onClick={(e: React.MouseEvent<HTMLDivElement>) => {
					e.stopPropagation();
					e.preventDefault();
					const rect = e.currentTarget.getBoundingClientRect();
					const parentRect = parentRef.current?.getBoundingClientRect();
					setTop(e.clientY - (parentRect?.top ?? 0 - rect.top) + 'px');
					setChangeType(prop);
					let d = '';
					const typ = prop.startsWith('margin') ? 'margin' : 'padding';
					if (
						propValues[typ + 'Top'] === propValues[typ + 'Bottom'] &&
						propValues[typ + 'Top'] === propValues[typ + 'Left'] &&
						propValues[typ + 'Top'] === propValues[typ + 'Right']
					)
						d = 'all';
					else if (
						(prop.endsWith('Top') || prop.endsWith('Bottom')) &&
						propValues[typ + 'Top'] === propValues[typ + 'Bottom']
					)
						d = 'topBottom';
					else if (
						(prop.endsWith('Left') || prop.endsWith('Right')) &&
						propValues[typ + 'Left'] === propValues[typ + 'Right']
					)
						d = 'leftRight';
					setDirection(d);
				}}
			>
				{value ?? direction}
			</div>,
		);

		propValues[prop] = value;

		if (value) {
			if (prop.startsWith('margin')) marginHasValue = true;
			else paddingHasValue = true;
		}
	}
	let changer = undefined;

	if (changeType) {
		let title = changeType.replace('margin', 'Margin ').replace('padding', 'Padding ');

		let whatDirection = changeType.replace('margin', '').replace('padding', '');

		if (direction === 'all') {
			title = title.replace(whatDirection, '');
		} else if (direction === 'topBottom') {
			title = title.replace(whatDirection, 'Top/Bottom');
		} else if (direction === 'leftRight') {
			title = title.replace(whatDirection, 'Left/Right');
		}

		const directionOptions: IconOptions = [];

		if (whatDirection === 'Top') {
			directionOptions.push({
				name: '',
				description: 'Top',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<>
						<rect
							width="8"
							height="8"
							transform="translate(12 3)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		} else if (whatDirection === 'Bottom') {
			directionOptions.push({
				name: '',
				description: 'Bottom',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<rect
						width="8"
						height="8"
						transform="translate(12 21)"
						fill="currentColor"
						strokeWidth="0"
					/>
				),
			});
		} else if (whatDirection === 'Left') {
			directionOptions.push({
				name: '',
				description: 'Left',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<rect
						width="8"
						height="8"
						transform="translate(2 12)"
						fill="currentColor"
						strokeWidth="0"
					/>
				),
			});
		} else if (whatDirection === 'Right') {
			directionOptions.push({
				name: '',
				description: 'Right',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<rect
						width="8"
						height="8"
						transform="translate(22 12)"
						fill="currentColor"
						strokeWidth="0"
					/>
				),
			});
		}

		if (changeType.endsWith('Top') || changeType.endsWith('Bottom')) {
			directionOptions.push({
				name: 'topBottom',
				description: 'Top/Bottom',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<>
						<rect
							width="8"
							height="8"
							transform="translate(12 3)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<rect
							width="8"
							height="8"
							transform="translate(12 21)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		} else {
			directionOptions.push({
				name: 'leftRight',
				description: 'Left/Right',
				width: '24',
				height: '24',
				viewBox: '0 0 32 32',
				icon: (
					<>
						<rect
							width="8"
							height="8"
							transform="translate(22 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<rect
							width="8"
							height="8"
							transform="translate(2 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		}

		directionOptions.push({
			name: 'all',
			description: 'All',
			width: '24',
			height: '24',
			viewBox: '0 0 32 32',
			icon: (
				<>
					<rect
						width="8"
						height="8"
						transform="translate(12 3)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<rect
						width="8"
						height="8"
						transform="translate(12 21)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<rect
						width="8"
						height="8"
						transform="translate(22 12)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<rect
						width="8"
						height="8"
						transform="translate(2 12)"
						fill="currentColor"
						strokeWidth="0"
					/>
				</>
			),
		});

		changer = (
			<div
				className="_changer"
				style={{ top }}
				onMouseLeave={() => {
					setChangeType('');
					setTop('');
					setDirection('');
				}}
			>
				<div className="_header">
					Change {title}
					<svg
						width="14"
						height="14"
						viewBox="0 0 14 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						onClick={() => {
							setChangeType('');
							setTop('');
							setDirection('');
						}}
					>
						<path
							d="M12.6449 3.04935C13.1134 2.58082 13.1134 1.81993 12.6449 1.3514C12.1763 0.882867 11.4154 0.882867 10.9469 1.3514L7 5.30205L3.04935 1.35515C2.58082 0.886616 1.81993 0.886616 1.3514 1.35515C0.882867 1.82368 0.882867 2.58457 1.3514 3.0531L5.30205 7L1.35515 10.9506C0.886616 11.4192 0.886616 12.1801 1.35515 12.6486C1.82368 13.1171 2.58457 13.1171 3.0531 12.6486L7 8.69795L10.9506 12.6449C11.4192 13.1134 12.1801 13.1134 12.6486 12.6449C13.1171 12.1763 13.1171 11.4154 12.6486 10.9469L8.69795 7L12.6449 3.04935Z"
							fill="black"
							stroke="#F8FAFB"
							strokeWidth="1.5"
						></path>
					</svg>
				</div>
				<div className="_body">
					<IconsSimpleEditor
						selected={direction}
						onChange={e => setDirection(e as string)}
						options={directionOptions}
						withBackground={true}
					/>
					<PixelSize
						autofocus={true}
						value={propValues[changeType]}
						onChange={(value: string) => {
							const newValues: { prop: string; value: string }[] = [];
							const isMargin = changeType.startsWith('margin');

							if (direction === 'all') {
								for (let d of ['Top', 'Bottom', 'Left', 'Right'])
									newValues.push({
										prop: `${isMargin ? 'margin' : 'padding'}${d}`,
										value,
									});
							} else if (direction === 'topBottom') {
								for (let d of ['Top', 'Bottom'])
									newValues.push({
										prop: `${isMargin ? 'margin' : 'padding'}${d}`,
										value,
									});
							} else if (direction === 'leftRight') {
								for (let d of ['Left', 'Right'])
									newValues.push({
										prop: `${isMargin ? 'margin' : 'padding'}${d}`,
										value,
									});
							} else {
								newValues.push({
									prop: changeType,
									value,
								});
							}

							valuesChangedOnlyValues({
								styleProps,
								properties,
								propValues: newValues,
								pseudoState,
								saveStyle,
								iterateProps,
							});
						}}
						min={0}
						max={100}
					/>
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				className={`_spacingEditor _margin ${marginHasValue ? '_hasValue' : ''}`}
				ref={parentRef}
			>
				<div className={`_label ${marginHasValue ? '_hasValue' : ''}`}>Margin</div>
				<div className={`_square _top ${propValues.marginTop ? '_hasValue' : ''}`} />
				<div className={`_square _left ${propValues.marginLeft ? '_hasValue' : ''}`} />
				<div className={`_square _right ${propValues.marginRight ? '_hasValue' : ''}`} />
				<div className={`_square _bottom ${propValues.marginBottom ? '_hasValue' : ''}`} />
				{marginValues}
				<div className={`_padding ${paddingHasValue ? '_hasValue' : ''}`}>
					<div className={`_label ${paddingHasValue ? '_hasValue' : ''}`}>Padding</div>
					<div className={`_circle _top ${propValues.paddingTop ? '_hasValue' : ''}`} />
					<div className={`_circle _left ${propValues.paddingLeft ? '_hasValue' : ''}`} />
					<div
						className={`_circle _right ${propValues.paddingRight ? '_hasValue' : ''}`}
					/>
					<div
						className={`_circle _bottom ${propValues.paddingBottom ? '_hasValue' : ''}`}
					/>
					{padValues}
				</div>
				{changer}
			</div>
		</>
	);
}
