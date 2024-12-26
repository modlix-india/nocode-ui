import { isNullValue } from '@fincity/kirun-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { onMouseDownDragStartCurry } from '../../functions/utils';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './rangeSliderProperties';

export default function RangeSlider(props: Readonly<ComponentProps>) {
	const {
		definition: { bindingPath, bindingPath2 },
		definition,
		locationHistory,
		context,
		pageDefinition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: {
			trackDesign,
			trackColor,
			rangeThumbDesign,
			rangeThumbSize,
			rangeThumbPitDesign,
			toolTipDesign,
			storageDataType,
			min: originalMin,
			minLabelDisplay,
			minLabelPosition,
			minLabel,
			minLabelValuePrefix,
			minLabelValueSuffix,
			max: originalMax,
			maxLabelDisplay,
			maxLabelPosition,
			maxLabel,
			maxLabelValuePrefix,
			maxLabelValueSuffix,
			step,
			minOffset,
			maxOffset,
			toolTipDisplayType,
			toolTipPosition,
			toolTipDisplay,
			toolTipValueLabelPrefix,
			toolTipValueLabelSuffix,
			decimalPrecision,
			updateStoreImmediately,
			markValueType,
			markLabelType,
			marks,
			markValueLabelPrefix,
			markValueLabelSuffix,
			markLabelPosition,
			ticks,
			tickCount,
			ticksValueType,
			tickValueLabelPrefix,
			tickValueLabelSuffix,
			ticksPosition,
			fillType,
			sliderCrossing,
			readOnly,
			colorScheme,
			onChange,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const bindingPathPath2 = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const [min, max] =
		originalMin > originalMax ? [originalMax, originalMin] : [originalMin, originalMax];

	const [hoverSlider, setHoverSlider] = useState<boolean>(false);
	const [hoverThumb, setHoverThumb] = useState<boolean>(false);
	const [hoverMark, setHoverMark] = useState<number | undefined>(undefined);

	const [value1, setValue1] = useState<number | undefined>(min);
	const [value2, setValue2] = useState<number | undefined>(max);

	const precision = getPrecision(step, decimalPrecision);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (isNullValue(v)) setValue1(undefined);
				else if (storageDataType === 'value') setValue1(v);
				else setValue1(getValue(v, storageDataType, min, max, step, precision));
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, storageDataType, min, max, step, precision]);

	const constrainValues = useCallback(
		(val1?: number, val2?: number) => {
			let newVal1 = Math.min(max, Math.max(min, val1 ?? min));
			let newVal2 = Math.min(max, Math.max(min, val2 ?? max));

			newVal1 = Math.round((newVal1 - min) / step) * step + min;
			newVal2 = Math.round((newVal2 - min) / step) * step + min;

			if (!bindingPathPath2) {
				return [newVal1, newVal2];
			}

			const isMovingFirstSlider = val1 !== undefined && val1 !== value1;
			const diff = newVal2 - newVal1;

			if (minOffset !== undefined || maxOffset !== undefined) {
				if (sliderCrossing) {
					if (isMovingFirstSlider) {
						if (minOffset && Math.abs(diff) < minOffset) {
							newVal1 = newVal1 > value2! ? value2! + minOffset : value2! - minOffset;
						}
						if (maxOffset && Math.abs(diff) > maxOffset) {
							newVal1 = newVal1 > value2! ? value2! + maxOffset : value2! - maxOffset;
						}
					} else {
						if (minOffset && Math.abs(diff) < minOffset) {
							newVal2 = newVal2 > value1! ? value1! + minOffset : value1! - minOffset;
						}
						if (maxOffset && Math.abs(diff) > maxOffset) {
							newVal2 = newVal2 > value1! ? value1! + maxOffset : value1! - maxOffset;
						}
					}
				} else {
					if (isMovingFirstSlider) {
						if (minOffset) newVal1 = Math.min(newVal1, newVal2 - minOffset);
						if (maxOffset) newVal1 = Math.max(newVal1, newVal2 - maxOffset);
					} else {
						if (minOffset) newVal2 = Math.max(newVal2, newVal1 + minOffset);
						if (maxOffset) newVal2 = Math.min(newVal2, newVal1 + maxOffset);
					}
				}
			} else if (!sliderCrossing && diff < step) {
				if (isMovingFirstSlider) {
					newVal1 = newVal2 - step;
				} else {
					newVal2 = newVal1 + step;
				}
			}

			newVal1 = Math.min(max, Math.max(min, newVal1));
			newVal2 = Math.min(max, Math.max(min, newVal2));

			newVal1 = Math.round((newVal1 - min) / step) * step + min;
			newVal2 = Math.round((newVal2 - min) / step) * step + min;

			return [newVal1, newVal2];
		},
		[min, max, step, sliderCrossing, bindingPathPath2, minOffset, maxOffset, value1, value2],
	);

	useEffect(() => {
		if (!bindingPathPath2) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (isNullValue(v)) setValue2(undefined);
				else if (storageDataType === 'value') setValue2(v);
				else setValue2(getValue(v, storageDataType, min, max, step, precision));
			},
			pageExtractor,
			bindingPathPath2,
		);
	}, [bindingPathPath2, storageDataType, min, max, step, precision]);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const hoverStyleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const visualPercent1 = value1 ? getPercentage(value1, min, max, step, 2) : 0;
	const labelPercent1 = value1 ? getPercentage(value1, min, max, step, precision) : 0;
	const visualPercent2 = value2 ? getPercentage(value2, min, max, step, 2) : 0;
	const labelPercent2 = value2 ? getPercentage(value2, min, max, step, precision) : 0;

	const topLabels: Array<JSX.Element> = [];
	const bottomLabels: Array<JSX.Element> = [];

	if (minLabelDisplay !== 'none') {
		(minLabelPosition === 'top' ? topLabels : bottomLabels).push(
			<div
				key="minLabel"
				className="_minLabel"
				style={(hoverSlider ? hoverStyleProperties : styleProperties)?.minLabel ?? {}}
			>
				<SubHelperComponent subComponentName="minLabel" definition={definition} />
				{`${minLabelValuePrefix ?? ''}${minLabel ?? (minLabelDisplay === 'value' ? min : getPercentage(min, min, max, step, precision) + '%')}${minLabelValueSuffix ?? ''}`}
			</div>,
		);
	}

	if (maxLabelDisplay !== 'none') {
		(maxLabelPosition === 'top' ? topLabels : bottomLabels).push(
			<div
				key="maxLabel"
				className="_maxLabel"
				style={(hoverSlider ? hoverStyleProperties : styleProperties)?.maxLabel ?? {}}
			>
				<SubHelperComponent subComponentName="maxLabel" definition={definition} />
				{`${maxLabelValuePrefix ?? ''}${maxLabel ?? (maxLabelDisplay === 'value' ? max : getPercentage(max, min, max, step, precision) + '%')}${maxLabelValueSuffix ?? ''}`}
			</div>,
		);
	}

	const ref = useRef<HTMLDivElement>(null);

	const updateStore1 = useCallback(
		(newValue: number) => {
			if (!bindingPathPath || readOnly) return;

			const [constrainedVal1, constrainedVal2] = constrainValues(newValue, value2);

			setData(
				bindingPathPath,
				storageDataType === 'value'
					? constrainedVal1
					: getPercentage(constrainedVal1, min, max, step, precision),
				context.pageName,
			);

			if (bindingPathPath2 && constrainedVal2 !== value2) {
				updateStore2(constrainedVal2);
			}

			setValue1(constrainedVal1);

			if (onChange && pageDefinition.eventFunctions?.[onChange]) {
				(async () => {
					await runEvent(
						pageDefinition.eventFunctions[onChange],
						definition.key,
						context.pageName,
						locationHistory,
						pageDefinition,
					);
				})();
			}
		},
		[
			bindingPathPath,
			readOnly,
			storageDataType,
			min,
			max,
			step,
			precision,
			value2,
			onChange,
			pageDefinition,
			context,
			definition,
			locationHistory,
		],
	);

	const updateStore2 = useCallback(
		(newValue: number) => {
			if (!bindingPathPath2 || readOnly) return;

			const [constrainedVal1, constrainedVal2] = constrainValues(value1, newValue);

			setData(
				bindingPathPath2,
				storageDataType === 'value'
					? constrainedVal2
					: getPercentage(constrainedVal2, min, max, step, precision),
				context.pageName,
			);

			if (!sliderCrossing && constrainedVal1 !== value1) {
				updateStore1(constrainedVal1);
			}
			setValue2(constrainedVal2);

			if (onChange && pageDefinition.eventFunctions?.[onChange]) {
				(async () => {
					await runEvent(
						pageDefinition.eventFunctions[onChange],
						definition.key,
						context.pageName,
						locationHistory,
						pageDefinition,
					);
				})();
			}
		},
		[
			bindingPathPath2,
			bindingPathPath,
			readOnly,
			storageDataType,
			min,
			max,
			step,
			precision,
			sliderCrossing,
			value1,
			onChange,
			pageDefinition,
			context,
			definition,
			locationHistory,
			fillType,
		],
	);

	const handleChange1 = useCallback(
		(v: number) => {
			if (!bindingPathPath || readOnly) return;

			let newValue = getValue(v, 'value', min, max, step, precision);

			if (bindingPathPath2 && !sliderCrossing && value2 !== undefined) {
				newValue = Math.min(newValue, value2 - step);
			}

			newValue = Math.max(min, Math.min(newValue, max));

			if (updateStoreImmediately) updateStore1(newValue);
			else setValue1(newValue);
		},
		[
			bindingPathPath,
			bindingPathPath2,
			readOnly,
			min,
			max,
			updateStoreImmediately,
			updateStore1,
			step,
			precision,
			sliderCrossing,
			value2,
			fillType,
		],
	);

	const handleChange2 = useCallback(
		(v: number) => {
			if (!bindingPathPath2 || readOnly) return;

			let newValue = getValue(v, 'value', min, max, step, precision);

			if (!sliderCrossing && value1 !== undefined) {
				newValue = Math.max(newValue, value1 + step);
			}

			newValue = Math.max(min, Math.min(newValue, max));

			if (updateStoreImmediately) updateStore2(newValue);
			else setValue2(newValue);
		},
		[
			bindingPathPath,
			bindingPathPath2,
			readOnly,
			min,
			max,
			updateStoreImmediately,
			updateStore2,
			step,
			precision,
			sliderCrossing,
			value1,
			fillType,
		],
	);

	const markThumbs: Array<JSX.Element> = [];
	const markLabels: Array<JSX.Element> = [];

	if (marks) {
		const defaultMarkThumbStyle = {
			...(styleProperties?.thumb ?? {}),
			...(styleProperties?.markThumb ?? {}),
		};

		const defaultMarkThumbPitStyle = {
			...(styleProperties?.thumbPit ?? {}),
			...(styleProperties?.markThumbPit ?? {}),
		};
		const processedMarks = new Set<number>();
		for (const mark of marks) {
			if (processedMarks.has(mark)) continue;
			processedMarks.add(mark);

			const markPercent =
				markValueType === 'value' ? getPercentage(mark, min, max, step, precision) : mark;
			const markValue =
				markValueType === 'value'
					? mark
					: getValue(mark, 'percent', min, max, step, precision);

			if (markPercent < 0 || markPercent > 100) continue;
			let style = defaultMarkThumbStyle;
			let pitStyle = defaultMarkThumbPitStyle;
			if (hoverMark === markPercent) {
				style = {
					...style,
					...(hoverStyleProperties?.thumb ?? {}),
					...(hoverStyleProperties?.markThumb ?? {}),
				};
				pitStyle = {
					...pitStyle,
					...(hoverStyleProperties?.thumbPit ?? {}),
					...(hoverStyleProperties?.markThumbPit ?? {}),
				};
			}

			markThumbs.push(
				<div
					key={mark}
					className="_mark _thumb"
					style={{
						...style,
						left: `${markPercent}%`,
						opacity: markPercent === visualPercent1 ? 0 : 1,
					}}
					onMouseOver={() => setHoverMark(markPercent)}
					onMouseOut={() => setHoverMark(undefined)}
					onClick={e => {
						e.stopPropagation();
						e.preventDefault();
						updateStore1(markValue);
					}}
				>
					<SubHelperComponent subComponentName="markThumb" definition={definition} />
					<div className="_thumbPit" style={pitStyle}>
						<SubHelperComponent
							subComponentName="markThumbPit"
							definition={definition}
						/>
					</div>
				</div>,
			);
			if (markLabelType !== 'none') {
				markLabels.push(
					<div
						key={mark}
						className="_markLabel"
						onMouseOver={() => setHoverMark(markPercent)}
						onMouseOut={() => setHoverMark(undefined)}
						style={{
							...((hoverMark === markPercent ? styleProperties : hoverStyleProperties)
								?.markLabel ?? {}),
							left: `${markPercent}%`,
							opacity: markPercent === visualPercent1 ? 0 : 1,
						}}
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							updateStore1(markValue);
						}}
					>
						<SubHelperComponent subComponentName="markLabel" definition={definition} />
						{`${markValueLabelPrefix ?? ''}${markLabelType === 'value' ? markValue : markPercent + '%'}${markValueLabelSuffix ?? ''}`}
					</div>,
				);
			}
		}
	}

	let toolTip1 = undefined;
	if (toolTipDisplay !== '_neverToolTip') {
		toolTip1 = (
			<div
				className={`_toolTip ${toolTipPosition}`}
				style={{
					...(styleProperties?.toolTip1 ?? {}),
				}}
			>
				<SubHelperComponent subComponentName="toolTip1" definition={definition} />
				{`${toolTipValueLabelPrefix ?? ''}${toolTipDisplayType == 'value' ? (value1 ?? '') : labelPercent1 + '%'}${toolTipValueLabelSuffix ?? ''}`}
			</div>
		);
	}

	let toolTip2 = undefined;
	if (toolTipDisplay !== '_neverToolTip' && bindingPathPath2) {
		toolTip2 = (
			<div
				className={`_toolTip ${toolTipPosition}`}
				style={{
					...(styleProperties?.toolTip2 ?? {}),
				}}
			>
				<SubHelperComponent subComponentName="toolTip2" definition={definition} />
				{`${toolTipValueLabelPrefix ?? ''}${toolTipDisplayType == 'value' ? (value2 ?? '') : labelPercent2 + '%'}${toolTipValueLabelSuffix ?? ''}`}
			</div>
		);
	}

	const thumbRef1 = useRef<HTMLDivElement>(null);
	const thumbRef2 = useRef<HTMLDivElement>(null);
	const filledTrackRef = useRef<HTMLDivElement>(null);

	const calculateFilledTrackWidth = () => {
		if (!bindingPathPath2) {
			return visualPercent1;
		}

		if (fillType === 'fromStart') {
			return Math.max(visualPercent2, visualPercent1);
		}

		return Math.abs(visualPercent2 - visualPercent1);
	};

	const calculateFilledTrackLeft = () => {
		if (fillType === 'fromStart' || !bindingPathPath2) {
			return 0;
		}

		return Math.min(visualPercent1, visualPercent2);
	};

	const track = (
		<div
			className="_track _contentMargin"
			style={(hoverSlider ? hoverStyleProperties : styleProperties)?.track ?? {}}
			ref={ref}
			onClick={e => {
				e.stopPropagation();
				e.preventDefault();
				if (!ref.current) return;
				const width = ref.current.getBoundingClientRect().width ?? 0;
				const newValue =
					min +
					Math.round(
						(((e.clientX - ref.current.getBoundingClientRect().left) / width) *
							(max - min)) /
							step,
					) *
						step;
				updateStore1(newValue);
			}}
		>
			<SubHelperComponent subComponentName="track" definition={definition} zIndex={7} />
			<div
				className="_rangeTrack"
				ref={filledTrackRef}
				style={{
					...((hoverSlider ? hoverStyleProperties : styleProperties)?.rangeTrack ?? {}),
					left: `${calculateFilledTrackLeft()}%`,
					width: `${calculateFilledTrackWidth()}%`,
				}}
			>
				<SubHelperComponent
					subComponentName="rangeTrack"
					definition={definition}
					zIndex={8}
				/>
			</div>

			<div
				className="_thumb"
				ref={thumbRef1}
				onMouseOver={() => setHoverThumb(true)}
				onMouseOut={() => setHoverThumb(false)}
				style={{
					left: `${visualPercent1}%`,
					...((hoverThumb ? hoverStyleProperties : styleProperties)?.thumb1 ?? {}),
				}}
				onMouseDown={e => {
					e.preventDefault();
					e.stopPropagation();

					if (e.button !== 0) return;

					const startValue = value1 ?? min;
					const width = ref.current?.getBoundingClientRect()?.width ?? 0;
					if (thumbRef1.current) thumbRef1.current.style.transition = 'none';
					if (filledTrackRef.current) filledTrackRef.current.style.transition = 'none';

					onMouseDownDragStartCurry(
						e.clientX,
						0,
						(newX, newY, diffX) => {
							let newValue = !step
								? Math.round(startValue + (diffX / width) * (max - min))
								: Math.round((startValue + (diffX / width) * (max - min)) / step) *
									step;
							if (
								bindingPathPath2 &&
								!sliderCrossing &&
								value2 !== undefined &&
								newValue > value2
							) {
								newValue = value2;
							}

							handleChange1(newValue);
						},
						updateStoreImmediately
							? () => {
									if (thumbRef1.current) thumbRef1.current.style.transition = '';
									if (filledTrackRef.current)
										filledTrackRef.current.style.transition = '';
								}
							: (newX, newY, diffX) => {
									let newValue = !step
										? Math.round(startValue + (diffX / width) * (max - min))
										: Math.round(
												(startValue + (diffX / width) * (max - min)) / step,
											) * step;

									if (
										bindingPathPath2 &&
										!sliderCrossing &&
										value2 !== undefined &&
										newValue > value2
									) {
										newValue = value2;
									}

									if (thumbRef1.current) thumbRef1.current.style.transition = '';
									if (filledTrackRef.current)
										filledTrackRef.current.style.transition = '';
									updateStore1(newValue);
								},
					)(e);
				}}
				onMouseUp={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				<SubHelperComponent subComponentName="thumb1" definition={definition} zIndex={10} />
				<div
					className="_thumbPit"
					style={{
						...((hoverThumb ? hoverStyleProperties : styleProperties)?.thumbPit1 ?? {}),
					}}
				>
					<SubHelperComponent
						subComponentName="thumbPit1"
						definition={definition}
						zIndex={7}
					/>
				</div>
				{toolTipDesign !== '_fixedLabelTT' ? toolTip1 : null}
			</div>

			{bindingPathPath2 && (
				<div
					className="_thumb"
					ref={thumbRef2}
					onMouseOver={() => setHoverThumb(true)}
					onMouseOut={() => setHoverThumb(false)}
					style={{
						left: `${visualPercent2}%`,
						...((hoverThumb ? hoverStyleProperties : styleProperties)?.thumb2 ?? {}),
						...styleProperties?.[rangeThumbDesign],
						...styleProperties?.[rangeThumbSize],
					}}
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();

						if (e.button !== 0) return;

						const startValue = value2 ?? max;
						const width = ref.current?.getBoundingClientRect()?.width ?? 0;
						if (thumbRef2.current) thumbRef2.current.style.transition = 'none';
						if (filledTrackRef.current)
							filledTrackRef.current.style.transition = 'none';

						onMouseDownDragStartCurry(
							e.clientX,
							0,
							(newX, newY, diffX) => {
								let newValue = !step
									? Math.round(startValue + (diffX / width) * (max - min))
									: Math.round(
											(startValue + (diffX / width) * (max - min)) / step,
										) * step;

								if (!sliderCrossing && value1 !== undefined && newValue < value1) {
									newValue = value1;
								}

								handleChange2(newValue);
							},
							updateStoreImmediately
								? () => {
										if (thumbRef2.current)
											thumbRef2.current.style.transition = '';
										if (filledTrackRef.current)
											filledTrackRef.current.style.transition = '';
									}
								: (newX, newY, diffX) => {
										let newValue = !step
											? Math.round(startValue + (diffX / width) * (max - min))
											: Math.round(
													(startValue + (diffX / width) * (max - min)) /
														step,
												) * step;

										if (
											!sliderCrossing &&
											value1 !== undefined &&
											newValue < value1
										) {
											newValue = value1;
										}

										if (thumbRef2.current)
											thumbRef2.current.style.transition = '';
										if (filledTrackRef.current)
											filledTrackRef.current.style.transition = '';
										updateStore2(newValue);
									},
						)(e);
					}}
					onMouseUp={e => {
						e.stopPropagation();
						e.preventDefault();
					}}
				>
					<SubHelperComponent
						subComponentName="thumb2"
						definition={definition}
						zIndex={9}
						style={styleProperties?.[rangeThumbDesign]}
					/>
					<div
						className="_thumbPit"
						style={{
							...((hoverThumb ? hoverStyleProperties : styleProperties)?.thumbPit2 ??
								{}),
						}}
					>
						<SubHelperComponent
							subComponentName="thumbPit2"
							definition={definition}
							style={styleProperties?.[rangeThumbPitDesign]}
							zIndex={10}
						/>
					</div>
					{toolTipDesign !== '_fixedLabelTT' ? toolTip2 : null}

					{/* <div
						className={`_toolTip ${toolTipPosition}`}
						style={styleProperties?.toolTip ?? {}}
					>
						<SubHelperComponent subComponentName="toolTip2" definition={definition} />
						{`${toolTipValueLabelPrefix ?? ''}${toolTipDisplayType == 'value' ? (value2 ?? '') : labelPercent2 + '%'}${toolTipValueLabelSuffix ?? ''}`}
					</div> */}
				</div>
			)}
			{markThumbs}
		</div>
	);

	let topContainer = undefined;

	if (topLabels.length || (markLabels.length && markLabelPosition === 'top')) {
		topContainer = (
			<div
				className="_topLabelContainer _contentMargin"
				style={
					(hoverSlider ? hoverStyleProperties : styleProperties)?.topLabelContainer ?? {}
				}
			>
				<SubHelperComponent subComponentName="topLabelContainer" definition={definition} />
				{topLabels}
				{markLabels.length && markLabelPosition === 'top' ? markLabels : null}
			</div>
		);
	}

	let bottomContainer = undefined;
	if (bottomLabels.length || (markLabels.length && markLabelPosition === 'bottom')) {
		bottomContainer = (
			<div
				className="_bottomLabelContainer _contentMargin"
				style={
					(hoverSlider ? hoverStyleProperties : styleProperties)?.bottomLabelContainer ??
					{}
				}
			>
				<SubHelperComponent
					subComponentName="bottomLabelContainer"
					definition={definition}
				/>
				{bottomLabels}
				{markLabels.length && markLabelPosition === 'bottom' ? markLabels : null}
			</div>
		);
	}

	let ticksContainer = undefined;
	const ticksContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ticksContainerRef.current) return;
		const container = ticksContainerRef.current;
		container.innerHTML = '';
		if (!tickCount) return;

		container.appendChild(
			makeTick(
				min,
				0,
				0,
				ticksValueType,
				tickValueLabelPrefix,
				tickValueLabelSuffix,
				styleProperties,
				hoverStyleProperties,
				updateStore1,
			),
		);

		const maxTick = makeTick(
			max,
			100,
			100,
			ticksValueType,
			tickValueLabelPrefix,
			tickValueLabelSuffix,
			styleProperties,
			hoverStyleProperties,
			updateStore1,
		);
		container.appendChild(maxTick);

		const dummyTick = makeTick(
			min,
			0,
			0,
			ticksValueType,
			tickValueLabelPrefix,
			tickValueLabelSuffix,
			styleProperties,
			hoverStyleProperties,
			undefined,
		);
		dummyTick.style.visibility = 'hidden';
		dummyTick.style.position = 'static';
		container.appendChild(dummyTick);

		let tCount = tickCount;
		if (tCount < 0) {
			const eachTickWidth = maxTick.getBoundingClientRect().width;
			tCount = Math.floor(container.getBoundingClientRect().width / eachTickWidth);
			const stepBasedCount = Math.floor((max - min) / step) - 2;
			if (tCount > stepBasedCount) tCount = stepBasedCount;
		}
		const tickStep = (max - min) / (tCount + 1);
		const precisionFactor = Math.pow(10, precision);
		for (let i = 0; i < tCount; i++) {
			const value =
				Math.round((min + tickStep * (i + 1)) * precisionFactor) / precisionFactor;
			const percent = getPercentage(value, min, max, step, 2);
			container.appendChild(
				makeTick(
					value,
					percent,
					getPercentage(value, min, max, step, precision),
					ticksValueType,
					tickValueLabelPrefix,
					tickValueLabelSuffix,
					styleProperties,
					hoverStyleProperties,
					updateStore1,
				),
			);
		}
	}, [
		ticksContainerRef.current,
		min,
		max,
		step,
		ticks,
		tickCount,
		ticksValueType,
		tickValueLabelPrefix,
		tickValueLabelSuffix,
		ticksPosition,
		precision,
		JSON.stringify(styleProperties),
		JSON.stringify(hoverStyleProperties),
		updateStore1,
		readOnly,
	]);

	if (tickCount) {
		ticksContainer = (
			<div
				className={`_ticksContainer _contentMargin _${ticksPosition}TickLabel _${ticks} ${hoverSlider ? '_hovered' : ''}`}
				style={(hoverSlider ? hoverStyleProperties : styleProperties)?.ticksContainer ?? {}}
				ref={ticksContainerRef}
			></div>
		);
	}

	return (
		<div
			className={`comp compRangeSlider ${readOnly ? '_readOnly' : ''} ${hoverSlider ? '_hoverSlider' : ''} ${colorScheme} ${trackDesign} ${trackColor} ${rangeThumbDesign} ${rangeThumbPitDesign} ${toolTipDesign} ${toolTipPosition} ${rangeThumbSize} ${toolTipDisplay} ${bindingPathPath2 ? `${rangeThumbDesign} ${rangeThumbSize} ${rangeThumbPitDesign} ${toolTipDesign} ${toolTipPosition || toolTipPosition} ${toolTipDisplay || toolTipDisplay}` : ''} `}
			style={(hoverSlider ? hoverStyleProperties : styleProperties)?.comp ?? {}}
			onMouseEnter={() => setHoverSlider(true)}
			onMouseLeave={() => setHoverSlider(false)}
		>
			<HelperComponent context={context} definition={definition} />
			{toolTipPosition === '_top' && toolTipDesign === '_fixedLabelTT' ? toolTip1 : null}
			{bindingPathPath2 && toolTipPosition === '_top' && toolTipDesign === '_fixedLabelTT'
				? toolTip2
				: null}
			{topContainer}
			{ticksPosition === 'top' ? ticksContainer : null}
			{track}
			{ticksPosition === 'bottom' ? ticksContainer : null}
			{bottomContainer}
			{toolTipPosition !== '_top' && toolTipDesign === '_fixedLabelTT' ? toolTip1 : null}
			{bindingPathPath2 && toolTipPosition !== '_top' && toolTipDesign === '_fixedLabelTT'
				? toolTip2
				: null}
		</div>
	);
}

function makeTick(
	value: number,
	percent: number,
	displayPercent: number,
	ticksValueType: string,
	tickValueLabelPrefix: string | undefined,
	tickValueLabelSuffix: string | undefined,
	styleProperties: any,
	hoverStyleProperties: any,
	updateStore: ((v: number) => void) | undefined,
) {
	const tickContainer = document.createElement('div');
	tickContainer.className = '_tickContainer';
	tickContainer.style.left = `${percent}%`;
	if (updateStore)
		tickContainer.addEventListener('click', e => {
			e.stopPropagation();
			updateStore(value);
		});
	applyStyle(tickContainer, styleProperties?.tickContainer);

	const tick = document.createElement('div');
	tick.className = '_tick';
	tickContainer.appendChild(tick);
	applyStyle(tick, styleProperties?.tick);

	const tickLabel = document.createElement('div');
	tickLabel.className = `_tickLabel ${!updateStore ? '_dummy' : ''}`;
	tickContainer.appendChild(tickLabel);
	tickLabel.innerHTML = `${tickValueLabelPrefix ?? ''}${ticksValueType === 'value' ? value : displayPercent + '%'}${tickValueLabelSuffix ?? ''}`;
	applyStyle(tickLabel, styleProperties?.tickLabel);

	if (
		hoverStyleProperties?.tickContainer ||
		hoverStyleProperties?.tick ||
		hoverStyleProperties?.tickLabel
	) {
		tickContainer.addEventListener('mouseover', () => {
			tickContainer.removeAttribute('style');
			tick.removeAttribute('style');
			tickLabel.removeAttribute('style');
			if (percent < 50) tickContainer.style.left = `${percent}%`;
			else tickContainer.style.right = `${100 - percent}%`;
			applyStyle(tickContainer, hoverStyleProperties?.tickContainer);
			applyStyle(tick, hoverStyleProperties?.tick);
			applyStyle(tickLabel, hoverStyleProperties?.tickLabel);
		});
		tickContainer.addEventListener('mouseout', () => {
			tickContainer.removeAttribute('style');
			tick.removeAttribute('style');
			tickLabel.removeAttribute('style');
			if (percent < 50) tickContainer.style.left = `${percent}%`;
			else tickContainer.style.right = `${100 - percent}%`;
			applyStyle(tickContainer, styleProperties?.tickContainer);
			applyStyle(tick, styleProperties?.tick);
			applyStyle(tickLabel, styleProperties?.tickLabel);
		});
	}

	return tickContainer;
}

function applyStyle(element: HTMLDivElement, style: { [key: string]: string } | undefined) {
	if (!style) return;

	for (const [key, value] of Object.entries(style)) {
		let actualKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
		element.style.setProperty(actualKey, value);
	}
}

function getValue(
	vOrP: number,
	storageDataType: string,
	min: number,
	max: number,
	step: number,
	decimalPrecision: number,
): number {
	let value;

	if (storageDataType === 'value') {
		if (vOrP < min) value = min;
		else if (vOrP > max) value = max;
		else value = Math.round((vOrP - min) / step) * step + min;
	} else value = Math.round((min + ((max - min) * vOrP) / 100) / step) * step;

	const precision = Math.pow(10, decimalPrecision);
	value = Math.round(value * precision) / precision;

	return parseFloat(value.toFixed(decimalPrecision));
}

function getPrecision(step: number, decimalPrecision: string): number {
	if (decimalPrecision != 'auto') return parseInt(decimalPrecision);

	const stepString = step.toString();
	const decimalIndex = stepString.indexOf('.');
	if (decimalIndex === -1) return 0;
	return stepString.length - decimalIndex - 1;
}

function getPercentage(
	value: number,
	min: number,
	max: number,
	step: number,
	decimalPrecision: number,
): number {
	const precision = Math.pow(10, decimalPrecision);
	if (value < min) return 0;
	if (value > max) return 100;
	const perOne = ((value - min) * 100) / (max - min);
	return parseFloat((Math.round(perOne * precision) / precision).toFixed(decimalPrecision));
}
