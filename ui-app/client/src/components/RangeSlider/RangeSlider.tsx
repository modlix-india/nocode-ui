import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { runEvent } from '../util/runEvent';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	setData,
	getPathFromLocation,
} from '../../context/StoreContext';
import RangeSliderStyle from './RangeSliderStyle';
import { styleDefaults } from './rangeSliderStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { propertiesDefinition, stylePropertiesDefinition } from './rangeSliderProperties';
import { isNullValue } from '@fincity/kirun-js';
import { onMouseDownDragStartCurry } from '../../functions/utils';

function RangeSlider(props: Readonly<ComponentProps>) {
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

	const [actualValue, setActualValue] = useState<number | undefined>(undefined);
	const [hoverSlider, setHoverSlider] = useState<boolean>(false);
	const [hoverThumb, setHoverThumb] = useState<boolean>(false);
	const [hoverMark, setHoverMark] = useState<number | undefined>(undefined);
	const [hoverTick, setHoverTick] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setActualValue(v),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, storageDataType, min, max, step]);

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

	const value = getValue(
		isNullValue(actualValue) ? min : actualValue,
		storageDataType,
		min,
		max,
		step,
	);
	const visualPercent = getPercentage(value, min, max, step, 2);
	const precision = getPrecision(step, decimalPrecision);
	const labelPercent = getPercentage(value, min, max, step, precision);

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
		(v: number) => {
			if (!bindingPathPath) return;
			if (v < min) v = min;
			else if (v > max) v = max;
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
		],
	);

	const handleChange = useCallback(
		(v: number) => {
			if (!bindingPathPath || readOnly) return;
			if (v < min) v = min;
			else if (v > max) v = max;
			if (updateStoreImmediately) updateStore(v);
			else setActualValue(v);
		},
		[bindingPathPath, readOnly, min, max, updateStoreImmediately],
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
				markValueType === 'value' ? mark : getValue(mark, 'percent', min, max, step);
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
					style={{ ...style, left: `${markPercent}%` }}
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
			<div className={`_toolTip ${toolTipPosition}`}>
				<SubHelperComponent subComponentName="toolTip" definition={definition} />
				{`${toolTipValueLabelPrefix ?? ''}${toolTipDisplayType == 'value' ? (actualValue == value ? value : actualValue) ?? '' : labelPercent + '%'}${toolTipValueLabelSuffix ?? ''}`}
			</div>
		);
	}

	const track = (
		<div
			className="_track _contentMargin"
			style={(hoverSlider ? hoverStyleProperties : styleProperties)?.track ?? {}}
			ref={ref}
			onClick={e => {
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
							? undefined
							: (newX, newY, diffX) => {
									let newValue = !step
										? Math.round(startValue + (diffX / width) * (max - min))
										: Math.round(
												(startValue + (diffX / width) * (max - min)) / step,
											) * step;
									updateStore(newValue);
								},
					)(e);
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
	if (updateStore) tickContainer.addEventListener('click', () => updateStore(value));
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
): number {
	if (storageDataType === 'value') {
		if (vOrP < min) return min;
		else if (vOrP > max) return max;
		else {
			const value = Math.round((vOrP - min) / step) * step + min;
			return value;
		}
	}

	return Math.round((min + ((max - min) * vOrP) / 100) / step) * step;
}

function getPrecision(step: number, decimalPrecision: string): number {
	if (decimalPrecision != 'auto') return parseInt(decimalPrecision);

	if (step > 0) return 0;

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
	return Math.round(perOne * precision) / precision;
}

const component: Component = {
	name: 'RangeSlider',
	displayName: 'RangeSlider',
	description: 'RangeSlider component',
	component: RangeSlider,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: RangeSliderStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	sections: [{ name: 'rangeSlider', pageName: 'rangeSlider' }],
	stylePseudoStates: ['hover', 'readOnly'],
	bindingPaths: {
		bindingPath: { name: 'Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'RangeSlider',
		name: 'RangeSlider',
		properties: { value: { value: 'RangeSlider' } },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="2"
						fillOpacity="0.2"
						fill="currentColor"
					/>
					<path d="M2 11H22V13H2V11Z" fill="currentColor" />
					<path
						d="M12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8ZM12 10C12.5523 10 13 10.4477 13 11C13 11.5523 12.5523 12 12 12C11.4477 12 11 11.5523 11 11C11 10.4477 11.4477 10 12 10Z"
						transform="translate(0 1)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'track',
			displayName: 'Track',
			description: 'Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rangeTrack',
			displayName: 'Range Track',
			description: 'Range Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Thumb',
			description: 'Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbPit',
			displayName: 'Thumb Pit',
			description: 'Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'minLabel',
			displayName: 'Min Label',
			description: 'Min Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'maxLabel',
			displayName: 'Max Label',
			description: 'Max Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topLabelContainer',
			displayName: 'Top Label Container',
			description: 'Top Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabelContainer',
			displayName: 'Bottom Label Container',
			description: 'Bottom Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumb',
			displayName: 'Mark Thumb',
			description: 'Mark Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumbPit',
			displayName: 'Mark Thumb Pit',
			description: 'Mark Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markLabel',
			displayName: 'Mark Label',
			description: 'Mark Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ticksContainer',
			displayName: 'Ticks Container',
			description: 'Ticks Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickContainer',
			displayName: 'Tick Container',
			description: 'Tick Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tick',
			displayName: 'Tick',
			description: 'Tick',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickLabel',
			displayName: 'Tick Label',
			description: 'Tick Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolTip',
			displayName: 'Tool Tip',
			description: 'Tool Tip',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
