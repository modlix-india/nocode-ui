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
		definition: { bindingPath },
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
			rangeThumbPitDesign,
			toolTipDesign,
			storageDataType,
			rangeThumbSize,
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

	const [min, max] =
		originalMin > originalMax ? [originalMax, originalMin] : [originalMin, originalMax];

	const [hoverSlider, setHoverSlider] = useState<boolean>(false);
	const [hoverThumb, setHoverThumb] = useState<boolean>(false);
	const [hoverMark, setHoverMark] = useState<number | undefined>(undefined);

	const [value, setValue] = useState<number | undefined>();

	const precision = getPrecision(step, decimalPrecision);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (isNullValue(v)) setValue(undefined);
				else if (storageDataType === 'value') setValue(v);
				else setValue(getValue(v, storageDataType, min, max, step, precision));
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, storageDataType, min, max, step, precision]);

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

	const visualPercent = value ? getPercentage(value, min, max, step, 2) : 0;
	const labelPercent = value ? getPercentage(value, min, max, step, precision) : 0;

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

	const updateStore = useCallback(
		(v: number, processed: boolean = false) => {
			if (!bindingPathPath || readOnly) return;
			if (v < min) v = min;
			else if (v > max) v = max;
			if (!processed) v = getValue(v, 'value', min, max, step, precision);

			setData(
				bindingPathPath,
				storageDataType === 'value' ? v : getPercentage(v, min, max, step, precision),
				context.pageName,
			);
			if (!onChange || !pageDefinition.eventFunctions?.[onChange]) return;
			(async () => {
				await runEvent(
					pageDefinition.eventFunctions[onChange],
					definition.key,
					context.pageName,
					locationHistory,
					pageDefinition,
				);
			})();
		},
		[
			bindingPathPath,
			storageDataType,
			min,
			max,
			step,
			precision,
			onChange,
			pageDefinition.eventFunctions,
			readOnly,
			updateStoreImmediately,
		],
	);

	const handleChange = useCallback(
		(v: number) => {
			if (!bindingPathPath || readOnly) return;

			v = getValue(v, 'value', min, max, step, precision);

			if (v < min) v = min;
			else if (v > max) v = max;
			if (updateStoreImmediately) updateStore(v, true);
			else setValue(v);
		},
		[bindingPathPath, readOnly, min, max, updateStoreImmediately, updateStore, step, precision],
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
						opacity: markPercent === visualPercent ? 0 : 1,
					}}
					onMouseOver={() => setHoverMark(markPercent)}
					onMouseOut={() => setHoverMark(undefined)}
					onClick={e => {
						e.stopPropagation();
						e.preventDefault();
						updateStore(markValue);
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
							opacity: markPercent === visualPercent ? 0 : 1,
						}}
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							updateStore(markValue);
						}}
					>
						<SubHelperComponent subComponentName="markLabel" definition={definition} />
						{`${markValueLabelPrefix ?? ''}${markLabelType === 'value' ? markValue : markPercent + '%'}${markValueLabelSuffix ?? ''}`}
					</div>,
				);
			}
		}
	}

	let toolTip = undefined;

	if (toolTipDisplay !== '_neverToolTip') {
		toolTip = (
			<div className={`_toolTip ${toolTipPosition}`} style={styleProperties?.toolTip ?? {}}>
				<SubHelperComponent subComponentName="toolTip" definition={definition} />
				{`${toolTipValueLabelPrefix ?? ''}${toolTipDisplayType == 'value' ? (value ?? '') : labelPercent + '%'}${toolTipValueLabelSuffix ?? ''}`}
			</div>
		);
	}

	const thumbRef = useRef<HTMLDivElement>(null);
	const filledTrackRef = useRef<HTMLDivElement>(null);

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
				updateStore(newValue);
			}}
		>
			<SubHelperComponent subComponentName="track" definition={definition} zIndex={7} />
			<div
				className="_rangeTrack"
				ref={filledTrackRef}
				style={{
					...((hoverSlider ? hoverStyleProperties : styleProperties)?.rangeTrack ?? {}),
					width: `${visualPercent}%`,
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
				ref={thumbRef}
				onMouseOver={() => setHoverThumb(true)}
				onMouseOut={() => setHoverThumb(false)}
				style={{
					left: `${visualPercent}%`,
					...((hoverThumb ? hoverStyleProperties : styleProperties)?.thumb ?? {}),
				}}
				onMouseDown={e => {
					e.preventDefault();
					e.stopPropagation();

					if (e.button !== 0) return;

					const startValue = value ?? min;
					const width = ref.current?.getBoundingClientRect()?.width ?? 0;
					if (thumbRef.current) thumbRef.current.style.transition = 'none';
					if (filledTrackRef.current) filledTrackRef.current.style.transition = 'none';

					onMouseDownDragStartCurry(
						e.clientX,
						0,
						(newX, newY, diffX) => {
							let newValue = !step
								? Math.round(startValue + (diffX / width) * (max - min))
								: Math.round((startValue + (diffX / width) * (max - min)) / step) *
									step;
							handleChange(newValue);
						},
						updateStoreImmediately
							? () => {
									if (thumbRef.current) thumbRef.current.style.transition = '';
									if (filledTrackRef.current)
										filledTrackRef.current.style.transition = '';
								}
							: (newX, newY, diffX) => {
									let newValue = !step
										? Math.round(startValue + (diffX / width) * (max - min))
										: Math.round(
												(startValue + (diffX / width) * (max - min)) / step,
											) * step;
									if (thumbRef.current) thumbRef.current.style.transition = '';
									if (filledTrackRef.current)
										filledTrackRef.current.style.transition = '';
									updateStore(newValue);
								},
					)(e);
				}}
				onMouseUp={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				<SubHelperComponent subComponentName="thumb" definition={definition} zIndex={9} />
				<div
					className="_thumbPit"
					style={(hoverThumb ? hoverStyleProperties : styleProperties)?.thumbPit ?? {}}
				>
					<SubHelperComponent
						subComponentName="thumbPit"
						definition={definition}
						zIndex={10}
					/>
				</div>
				{toolTipDesign !== '_fixedLabelTT' ? toolTip : null}
			</div>
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
				updateStore,
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
			updateStore,
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
					updateStore,
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
		updateStore,
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
			className={`comp compRangeSlider ${readOnly ? '_readOnly' : ''} ${hoverSlider ? '_hoverSlider' : ''} ${colorScheme} ${trackDesign} ${trackColor} ${rangeThumbDesign} ${rangeThumbPitDesign} ${toolTipDesign} ${toolTipPosition} ${rangeThumbSize} ${toolTipDisplay} `}
			style={(hoverSlider ? hoverStyleProperties : styleProperties)?.comp ?? {}}
			onMouseEnter={() => setHoverSlider(true)}
			onMouseLeave={() => setHoverSlider(false)}
		>
			<HelperComponent context={context} definition={definition} />
			{toolTipPosition === '_top' && toolTipDesign === '_fixedLabelTT' ? toolTip : null}
			{topContainer}
			{ticksPosition === 'top' ? ticksContainer : null}
			{track}
			{ticksPosition === 'bottom' ? ticksContainer : null}
			{bottomContainer}
			{toolTipPosition !== '_top' && toolTipDesign === '_fixedLabelTT' ? toolTip : null}
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
