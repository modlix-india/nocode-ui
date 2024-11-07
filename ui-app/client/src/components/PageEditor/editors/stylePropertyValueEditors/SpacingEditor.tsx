import React, { ReactNode, useRef, useState } from 'react';
import { StyleEditorsProps, extractValue, valuesChangedOnlyValues } from './simpleEditors';
import { iconButtonOptions, IconsSimpleEditor } from './simpleEditors/IconsSimpleEditor';
import { PixelSize } from './simpleEditors/SizeSliders';

export function SpacingEditor({
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

		const directionOptions: iconButtonOptions = [];

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
				className={`_spacingEditor _margin ${marginHasValue ? '_hasValue' : ''}`}
				ref={parentRef}
			>
				<div
					className={`_label ${marginHasValue ? '_hasValue' : ''}`}
					title="Double click to clear"
					onDoubleClick={() =>
						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							propValues: [
								{ prop: 'marginTop', value: '' },
								{ prop: 'marginBottom', value: '' },
								{ prop: 'marginLeft', value: '' },
								{ prop: 'marginRight', value: '' },
							],
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
						})
					}
				>
					Margin
				</div>
				<div className={`_square _top ${propValues.marginTop ? '_hasValue' : ''}`} />
				<div className={`_square _left ${propValues.marginLeft ? '_hasValue' : ''}`} />
				<div className={`_square _right ${propValues.marginRight ? '_hasValue' : ''}`} />
				<div className={`_square _bottom ${propValues.marginBottom ? '_hasValue' : ''}`} />
				{marginValues}
				<div className={`_padding ${paddingHasValue ? '_hasValue' : ''}`}>
					<div
						className={`_label ${paddingHasValue ? '_hasValue' : ''}`}
						title="Double click to clear"
						onDoubleClick={() =>
							valuesChangedOnlyValues({
								subComponentName,
								selectedComponent,
								selectedComponentsList,
								propValues: [
									{ prop: 'paddingTop', value: '' },
									{ prop: 'paddingBottom', value: '' },
									{ prop: 'paddingLeft', value: '' },
									{ prop: 'paddingRight', value: '' },
								],
								selectorPref,
								defPath,
								locationHistory,
								pageExtractor,
							})
						}
					>
						Padding
					</div>
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
