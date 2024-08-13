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

function RangeSlider(props: ComponentProps) {
	const {
		definition: { bindingPath },
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: {
			min,
			max,
			step,
			tooltipDisplay,
			readOnly,
			updateStoreImmediately,
			minTooltipDisplay,
			maxTooltipDisplay,
			rangeSliderType,
			toolTipPosition,
			decimalPrecision,
			circularRangeSliderIndicatorWidth,
			startPoint,
			showticks,
			tickcounts,
			showMarks,
			marksType,
			marksValue,
			rangeSliderDesignType,
			rangeSliderColorScheme,
			minValueLabelPosition,
			maxValueLabelPosition,
			tickslabelvalue,
			tickslabelposition,
			storingDataType,
			circularRangeSliderRadius,
			onThumbMove,
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

	const [value, setValue] = useState<number>(min);
	const [hover, setHover] = useState(false);
	const [mouseDown, setMouseDown] = useState(false);

	const ref = useRef<HTMLDivElement>(null);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, storeValue) => {
				if (typeof storeValue === 'number') {
					let newValue: number;
					if (storingDataType === 'Percent') {
						newValue = min + (storeValue / 100) * (max - min);
						setValue(Math.min(Math.max(newValue, min), max));
					} else {
						newValue = storeValue;
						setValue(Math.min(Math.max(newValue, min), max));
					}
					//setValue(Math.min(Math.max(newValue, min), max));
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, min, max, storingDataType]);

	const onThumbMovementEvent = onThumbMove
		? props.pageDefinition.eventFunctions?.[onThumbMove]
		: undefined;

  const handleOnThumbMovement = onThumbMovementEvent ?  async() =>
   	await runEvent(
   		onThumbMovementEvent,
   		onThumbMove,
	 		props.context.pageName,
	 		props.locationHistory,
	 		props.pageDefinition,
	 	)
	  : undefined;

	const updateValue = useCallback(
		(newValue: number) => {
			const clampedValue = Math.min(Math.max(newValue, min), max);
			setValue(clampedValue);
			if (bindingPathPath && updateStoreImmediately) {
				let valueToStore: number;
				if (storingDataType === 'Percent') {
					valueToStore = ((clampedValue - min) / (max - min)) * 100;
				} else {
					valueToStore = clampedValue;
				}
				if (decimalPrecision) {
					const precision = parseInt(decimalPrecision);
					if (precision >= 0 && precision <= 20) {
						valueToStore = Number(valueToStore.toFixed(precision));
					}
				}
				setData(bindingPathPath, valueToStore, context.pageName);
				handleOnThumbMovement?.();
			}
		},
		[
			min,
			max,
			bindingPathPath,
			context.pageName,
			updateStoreImmediately,
			storingDataType,
			decimalPrecision,
			handleOnThumbMovement,
		],
	);

	const currentValueRef = useRef(value); // using the useRef to keep track of current value 

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (readOnly) return;
			e.preventDefault();
			e.stopPropagation();
			setMouseDown(true);

			const handleMove = (moveEvent: MouseEvent) => {
				const rect = ref.current?.getBoundingClientRect();
				if (!rect) return;
				let newValue;
				if (rangeSliderType === '_circular') {
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;
					const angleAdjustments: { [key: string]: number } = {
						top: 90,
						right: 180,
						bottom: 270,
					};

					const adjustment = angleAdjustments[startPoint] || 0;
					let angle =
						Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
						(180 / Math.PI);
					angle = (angle + 360 + adjustment) % 360;
					const percentage = angle / 360;

					newValue = min + percentage * (max - min);
				} else {
					const x = moveEvent.clientX - rect.left;
					const percentage = Math.max(0, Math.min(1, x / rect.width));
					newValue = min + percentage * (max - min);
				}

				const steppedValue = Math.round(newValue / step) * step;
				currentValueRef.current = steppedValue; // tracking the current value
				updateValue(steppedValue);
			};

			const handleMouseUp = () => {
				setMouseDown(false);
				document.removeEventListener('mousemove', handleMove);
				document.removeEventListener('mouseup', handleMouseUp);
				if (bindingPathPath && !updateStoreImmediately) {
					const finalValue = currentValueRef.current;
					let valueToStore:number;
					if(storingDataType === 'Percent'){
						valueToStore = ((finalValue-min)/(max-min)) * 100;
					} else {
						valueToStore = finalValue;
					}
					if(decimalPrecision){
						const precision = parseInt(decimalPrecision);
						if(precision >= 0 && precision <= 20){
							valueToStore = Number(valueToStore.toFixed(precision));
						}
					}
					setData(bindingPathPath, valueToStore, context.pageName);
					handleOnThumbMovement?.();
				}
			};

			handleMove(e.nativeEvent);

			document.addEventListener('mousemove', handleMove);
			document.addEventListener('mouseup', handleMouseUp);
		},
		[
			min,
			max,
			step,
			readOnly,
			updateValue,
			bindingPathPath,
			updateStoreImmediately,
			value,
			context.pageName,
			rangeSliderType,
			startPoint,
			handleOnThumbMovement,
		],
	);

	const positionStyles: any = {
		top: '_top',
		left: '_left',
		right: '_right',
		bottom: '_bottom',
	};

	const toolTipPositionStyle = positionStyles[toolTipPosition] || '_bottom';
	const minLabelPosition = minValueLabelPosition === 'bottom' ? '_bottom' : '';
	const maxLabelPosition = maxValueLabelPosition === 'bottom' ? '_bottom' : '';

	const percent = ((value - min) / (max - min)) * 100;

	const getTooltipText = useCallback(
		(type: 'min' | 'max' | 'value') => {
			const getDisplayType = () => {
				if (type === 'min') return minTooltipDisplay;
				if (type === 'max') return maxTooltipDisplay;
				return tooltipDisplay;
			};

			const displayType = getDisplayType();

			const decimalPoints = Math.min(Math.max(parseInt(decimalPrecision), 0), 20);

			const getValueText = () => {
				switch (type) {
					case 'min':
						return min.toFixed(decimalPoints);
					case 'max':
						return max.toFixed(decimalPoints);
					default:
						return value.toFixed(decimalPoints);
				}
			};

			const getPercentageText = () => {
				switch (type) {
					case 'min':
						return '0%';
					case 'max':
						return '100%';
					default:
						return percent.toFixed(decimalPoints) + '%';
				}
			};

			switch (displayType) {
				case 'VALUE':
					return getValueText();
				case 'PERCENTAGE':
					return getPercentageText();
				default:
					return '';
			}
		},
		[
			min,
			max,
			value,
			minTooltipDisplay,
			maxTooltipDisplay,
			tooltipDisplay,
			percent,
			decimalPrecision,
		],
	);

	const tickslabelpositionvalue = tickslabelposition === 'top' ? '_top' : '';

	const rendertick = () => {
		if (showticks === 'None') return null;

		const tickLabels = [];
		const validatedNumberOfTicks = Math.max(tickcounts, 2);

		const getLabelContent = (i: number, value: number) => {
			const percentLabel = Math.round(i) + '%';
			const valueLabel = value.toFixed(0);
			const isTop = tickslabelposition === 'top';

			switch (tickslabelvalue) {
				case 'Percent':
					return isTop ? (
						<>
							{percentLabel}
							<br />
							&nbsp; |
						</>
					) : (
						<>
							&nbsp; |
							<br />
							{percentLabel}
						</>
					);
				case 'Value':
					return isTop ? (
						<>
							{valueLabel}
							<br />
							&nbsp; |
						</>
					) : (
						<>
							&nbsp; |
							<br />
							{valueLabel}
						</>
					);
				default:
					return (
						<>
							&nbsp; |
							<br />
							&nbsp;
						</>
					);
			}
		};

		for (let i = 0; i <= 100; i += 100 / (validatedNumberOfTicks - 1)) {
			const value = min + (i / 100) * (max - min);
			const labelContent = getLabelContent(i, value);
			const isActive = currentValueRef.current >= value && currentValueRef.current >= i;


			tickLabels.push(
				<div
					key={`tick-${i}`}
					className={`_tick-labels ${isActive ? '_active-tick-label' : ''}`}
					style={{
						left: `${i}%`,
						...styleProperties.tickLabels,
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="tickLabels" />
					{labelContent}
				</div>,
			);
		}

		const tickStyle = {
			...styleProperties.tick,
			visibility:
				showticks === 'Always' || (showticks === 'OnHover' && hover) ? 'visible' : 'hidden',
		};

		return (
			<div className={`_tick ${tickslabelpositionvalue}`} style={tickStyle}>
				<SubHelperComponent definition={definition} subComponentName="tick" />
				{tickLabels}
			</div>
		);
	};

	const renderMarks = () => {
		if (!showMarks || !marksValue) return null;
		return marksValue.map((mark: any) => {
			let markPosition;
			let displayMark;
			let isActive = false;
			if (marksType === 'Value') {
				markPosition = ((mark - min) / (max - min)) * 100;
				displayMark = Math.round(mark);
				isActive = value >= mark;
			} else {
				markPosition = mark;
				displayMark = `${Math.round(mark)}%`;
				isActive = value >= ((mark / 100) * (max - min) + min);
			}

			return (
				<div
					key={`mark-${mark}`}
					className={`_mark ${isActive ? '_active-mark' : ''}`}
					style={{
						left: `${markPosition}%`,
						...styleProperties.marks,
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="marks" />
					<div className="_mark-label">{displayMark}</div>
				</div>
			);
		});
	};

	const renderLinearRangeSlider = () => {
		const thumbLeft: React.CSSProperties = {
			left: `calc(${percent}% - 5px)`,
			//left: `${percent}%`,
		};
		const trackFillWidth: React.CSSProperties = {
			width: `calc(${percent}% + 5px)`,
		};

		const thumbStyles = { ...thumbLeft, ...styleProperties.thumb };
		const trackFilled = { ...trackFillWidth, ...styleProperties.filledTrack };

		return (
			<>
				<div className="_rangeTrack" style={styleProperties.rangeTrack ?? {}}>
					<SubHelperComponent definition={definition} subComponentName="rangeTrack" />

					<div className="_rangeTrackFill" style={trackFilled}>
						<SubHelperComponent
							definition={definition}
							subComponentName="filledTrack"
						/>
					</div>
					{renderMarks()}
				</div>
				{rendertick()}
				<div
					className="_rangeThumb"
					style={thumbStyles}
					role="slider"
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					tabIndex={0}
				>
					<SubHelperComponent definition={definition} subComponentName="thumb" />
					{tooltipDisplay !== 'NONE' && (mouseDown || hover) && (
						<div
							className={`_tooltip ${toolTipPositionStyle}`}
							style={styleProperties.toolTip ?? {}}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="toolTip"
							/>
							{getTooltipText('value')}
						</div>
					)}
				</div>

				{minTooltipDisplay !== 'NONE' && (
					<div
						className={` _min-tooltip ${minLabelPosition}`}
						style={styleProperties.minValueLabel ?? {}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="minValueLabel"
						/>
						{getTooltipText('min')}
					</div>
				)}
				{maxTooltipDisplay !== 'NONE' && (
					<div
						className={`_max-tooltip ${maxLabelPosition}`}
						style={styleProperties.maxValueLabel ?? {}}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="maxValueLabel"
						/>
						{getTooltipText('max')}
					</div>
				)}
			</>
		);
	};

	const renderCircularRangeSlider = () => {
		const validatedRadius = Math.max(20, Math.min(200, circularRangeSliderRadius)); // restricting the radius entered by the user between 20 and 200

		const radius = validatedRadius;
		const svgSize = radius * 2 + 20; // calculating the size of svg and to add more padding inside the svg
		const center = svgSize / 2;

		const percentage = (value - min) / (max - min);

		const startAngles: { [key: string]: number } = {
			top: 0,
			left: 90,
			bottom: 180,
			right: -90,
		};
		const startAngle = startPoint in startAngles ? startAngles[startPoint] : 90;
		const endAngle = startAngle + 360 * percentage;

		const polarToCartesian = (
			centerX: number,
			centerY: number,
			radius: number,
			angleInDegrees: number,
		) => {
			const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
			return {
				x: centerX + radius * Math.cos(angleInRadians),
				y: centerY + radius * Math.sin(angleInRadians),
			};
		};

		const arcPath = (
			x: number,
			y: number,
			radius: number,
			startAngle: number,
			endAngle: number,
		) => {
			const start = polarToCartesian(x, y, radius, endAngle);
			const end = polarToCartesian(x, y, radius, startAngle);
			const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
			return [
				'M',
				start.x,
				start.y,
				'A',
				radius,
				radius,
				0,
				largeArcFlag,
				0,
				end.x,
				end.y,
			].join(' ');
		};

		const thumbAngle = startAngle + 360 * percentage;
		const thumbPosition = polarToCartesian(center, center, radius, thumbAngle);

		const calculateMarkPosition = (markValue: number) => {
			const percentage = (markValue - min) / (max - min);
			const angle = startAngle + 360 * percentage;
			return polarToCartesian(center, center, radius, angle);
		};

		const renderMarks = () => {
			if (!showMarks||!marksValue) return null;
			

			return marksValue.map((mark: any) => {
				let markValue;
				let isActive = false;
				if (marksType === 'Value') {
					markValue = mark;
					isActive =value >= mark;
				} else {
					markValue = min + (mark / 100) * (max - min);
					isActive = value >= (min + (mark / 100) * (max - min));
				}

				const markPosition = calculateMarkPosition(markValue);

				return (
					<circle
						key={`mark-${mark}`}
						className={`_circular-mark ${isActive ?'_active-circular-mark':''}`}
						cx={markPosition.x}
						cy={markPosition.y}
						r={circularRangeSliderIndicatorWidth}
						style={styleProperties.marksvalue}
					/>
				);
			});
		};

		return (
			<svg className="_circular_range" viewBox={`0 0 ${svgSize} ${svgSize}`}>
				<circle
					className="_circular_track"
					r={radius}
					cx={center}
					cy={center}
					fill="none"
					strokeWidth={circularRangeSliderIndicatorWidth}
					style={styleProperties.circularTrack ?? {}}
				/>
				<path
					className="_circular_progress"
					d={arcPath(center, center, radius, startAngle, endAngle)}
					fill="none"
					strokeWidth={circularRangeSliderIndicatorWidth}
					style={styleProperties.circularProgress ?? {}}
				/>
				{renderMarks()}
				<circle
					className="_circular_thumb"
					r={circularRangeSliderIndicatorWidth}
					cx={thumbPosition.x}
					cy={thumbPosition.y}
					style={styleProperties.circularThumb ?? {}}
				/>
				<text
					x={center}
					y={center}
					textAnchor="middle"
					dy=".3em"
					className="_circular_text"
					style={styleProperties.circularText ?? {}}
				>
					{getTooltipText('value')}
				</text>
			</svg>
		);
	};

	return (
		<div
			className={`comp compRangeSlider _simpleEditorRange ${rangeSliderType} ${rangeSliderType === '_linear' ? rangeSliderDesignType : ''} ${rangeSliderColorScheme}`}
			ref={ref}
			style={styleProperties.comp ?? {}}
			onMouseLeave={() => {
				setHover(false);
			}}
			onMouseEnter={() => {
				setHover(true);
			}}
			onMouseDown={handleMouseDown}
		>
			{rangeSliderType === '_circular'
				? renderCircularRangeSlider()
				: renderLinearRangeSlider()}
			<HelperComponent context={props.context} definition={definition} />
		</div>
	);
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
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'rangeTrack',
			displayName: 'RangeTrack',
			description: 'RangeTrack',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Thumb',
			description: 'Thumb',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'filledTrack',
			displayName: 'FilledTrack',
			description: 'FilledTrack',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'toolTip',
			displayName: 'Tool Tip',
			description: 'Tool Tip',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'minValueLabel',
			displayName: 'MinValueLabel',
			description: 'MinValueLabel',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'maxValueLabel',
			displayName: 'MaxValueLabel',
			description: 'MaxValueLabel',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'tick',
			displayName: 'tick',
			description: 'tick',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'tickLabels',
			displayName: 'tickLabels',
			description: 'tickLabels',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'marks',
			displayName: 'Marks',
			description: 'Marks',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'circularText',
			displayName: 'Circular Text',
			description: 'Circular Text',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'circularProgress',
			displayName: 'Circular Progress',
			description: 'Circular Progress',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'circularTrack',
			displayName: 'Circular Track',
			description: 'Circular Track',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'circularThumb',
			displayName: 'Circular Thumb',
			description: 'Circular Thumb',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
