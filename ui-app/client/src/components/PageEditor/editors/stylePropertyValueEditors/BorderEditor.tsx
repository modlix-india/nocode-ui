import React, { ReactNode, useRef, useState } from 'react';
import {
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
	extractValue,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { IconOptions, IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { PixelSize } from './simpleEditors/SizeSliders';

export function BorderEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	selectedComponentsList,
	saveStyle,
	properties,
	defPath,
	locationHistory,
	pageExtractor,
}: StyleEditorsProps) {
	const [top, setTop] = useState('');
	const [changeType, setChangeType] = useState('');
	const [direction, setDirection] = useState('');
	const parentRef = useRef<HTMLDivElement>(null);

	let borderValues: ReactNode[] = [];
	let borderColorValues: ReactNode[] = [];
	let borderHasValue = false;
	let borderHasColor = false;
	let propValues: any = {};
	let colorPropValues: any = {};
	for (let prop of ['borderBottom', 'borderLeft', 'borderRight', 'borderTop']) {
		const value = extractValue({
			subComponentName,
			prop,
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const direction = prop.replace('border', '').toLowerCase();

		borderValues.push(
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

					if (
						propValues['borderTop'] === propValues['borderBottom'] &&
						propValues['borderTop'] === propValues['borderLeft'] &&
						propValues['borderTop'] === propValues['borderRight']
					)
						d = 'all';
					else if (
						(prop.endsWith('Top') || prop.endsWith('Bottom')) &&
						propValues['borderTop'] === propValues['borderBottom']
					)
						d = 'topBottom';
					else if (
						(prop.endsWith('Left') || prop.endsWith('Right')) &&
						propValues['borderLeft'] === propValues['borderRight']
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
			borderHasValue = true;
		}
	}

	for (let prop of [
		'borderBottomColor',
		'borderLeftColor',
		'borderRightColor',
		'borderTopColor',
	]) {
		const value = extractValue({
			subComponentName,
			prop,
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const direction = prop.replace('border', '').toLowerCase();

		borderColorValues.push(
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

					if (
						colorPropValues['borderTopColor'] ===
							colorPropValues['borderBottomColor'] &&
						colorPropValues['borderTopColor'] === colorPropValues['borderLeftColor'] &&
						colorPropValues['borderTopColor'] === colorPropValues['borderRightColor']
					)
						d = 'all';
					else if (
						(prop.endsWith('TopColor') || prop.endsWith('BottomColor')) &&
						colorPropValues['borderTopColor'] === colorPropValues['borderBottomColor']
					)
						d = 'topBottom';
					else if (
						(prop.endsWith('LeftColor') || prop.endsWith('RightColor')) &&
						colorPropValues['borderLeftColor'] === colorPropValues['borderRightColor']
					)
						d = 'leftRight';
					setDirection(d);
				}}
			>
				{value ?? direction}
			</div>,
		);

		colorPropValues[prop] = value;
	}

	console.log(borderColorValues);

	let changer = undefined;

	if (changeType) {
		let title = changeType.replace('border', 'Border ');

		let whatDirection = changeType.replace('border', '');

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
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_203"
							data-name="Path 203"
							d="M3,1c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,2,3,1.552,3,1Z"
							transform="translate(7 7)"
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
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_206"
							data-name="Path 206"
							d="M3,17c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,18,3,17.552,3,17Z"
							transform="translate(7 7)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		} else if (whatDirection === 'Left') {
			directionOptions.push({
				name: '',
				description: 'Left',
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_204"
							data-name="Path 204"
							d="M1,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C0,3.269.448,3,1,3Z"
							transform="translate(7 7)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		} else if (whatDirection === 'Right') {
			directionOptions.push({
				name: '',
				description: 'Right',
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>

						<path
							id="Path_205"
							data-name="Path 205"
							d="M17,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C16,3.269,16.448,3,17,3Z"
							transform="translate(7 7)"
							fill="currentColor"
							strokeWidth="0"
						/>
					</>
				),
			});
		}

		if (changeType.endsWith('Top') || changeType.endsWith('Bottom')) {
			directionOptions.push({
				name: 'topBottom',
				description: 'Top/Bottom',
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_203"
							data-name="Path 203"
							d="M3,1c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,2,3,1.552,3,1Z"
							transform="translate(7 7)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_206"
							data-name="Path 206"
							d="M3,17c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,18,3,17.552,3,17Z"
							transform="translate(7 7)"
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
				icon: (
					<>
						<rect
							id="Rectangle_28"
							data-name="Rectangle 28"
							width="8"
							height="8"
							rx="1"
							transform="translate(12 12)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_205"
							data-name="Path 205"
							d="M17,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C16,3.269,16.448,3,17,3Z"
							transform="translate(7 7)"
							fill="currentColor"
							strokeWidth="0"
						/>
						<path
							id="Path_204"
							data-name="Path 204"
							d="M1,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C0,3.269.448,3,1,3Z"
							transform="translate(7 7)"
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
			icon: (
				<>
					<rect
						id="Rectangle_28"
						data-name="Rectangle 28"
						width="8"
						height="8"
						rx="1"
						transform="translate(12 12)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<path
						id="Path_203"
						data-name="Path 203"
						d="M3,1c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,2,3,1.552,3,1Z"
						transform="translate(7 7)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<path
						id="Path_204"
						data-name="Path 204"
						d="M1,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C0,3.269.448,3,1,3Z"
						transform="translate(7 7)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<path
						id="Path_205"
						data-name="Path 205"
						d="M17,3c.552,0,1,.269,1,.6V14.4c0,.331-.448.6-1,.6s-1-.269-1-.6V3.6C16,3.269,16.448,3,17,3Z"
						transform="translate(7 7)"
						fill="currentColor"
						strokeWidth="0"
					/>
					<path
						id="Path_206"
						data-name="Path 206"
						d="M3,17c0-.552.269-1,.6-1H14.4c.331,0,.6.448.6,1s-.269,1-.6,1H3.6C3.269,18,3,17.552,3,17Z"
						transform="translate(7 7)"
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

							if (direction === 'all') {
								for (let d of ['Top', 'Bottom', 'Left', 'Right'])
									newValues.push({
										prop: `${'border'}${d}`,
										value,
									});
							} else if (direction === 'topBottom') {
								for (let d of ['Top', 'Bottom'])
									newValues.push({
										prop: `${'border'}${d}`,
										value,
									});
							} else if (direction === 'leftRight') {
								for (let d of ['Left', 'Right'])
									newValues.push({
										prop: `${'border'}${d}`,
										value,
									});
							} else {
								newValues.push({
									prop: changeType,
									value,
								});
							}

							console.log(newValues);

							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: newValues,
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							});
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				className={`_spacingEditor _border ${borderHasValue ? '_hasValue' : ''}`}
				ref={parentRef}
			>
				<div
					className={`_label ${borderHasValue ? '_hasValue' : ''}`}
					title="Double click to clear"
					onDoubleClick={() =>
						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							propValues: [
								{ prop: 'borderTop', value: '' },
								{ prop: 'borderBottom', value: '' },
								{ prop: 'borderLeft', value: '' },
								{ prop: 'borderRight', value: '' },
							],
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
						})
					}
				>
					Border
				</div>
				<div className={`_square _top ${propValues.borderTop ? '_hasValue' : ''}`} />
				<div className={`_square _left ${propValues.borderLeft ? '_hasValue' : ''}`} />
				<div className={`_square _right ${propValues.borderRight ? '_hasValue' : ''}`} />
				<div className={`_square _bottom ${propValues.borderBottom ? '_hasValue' : ''}`} />
				{borderValues}
				{changer}
			</div>
		</>
	);
}
