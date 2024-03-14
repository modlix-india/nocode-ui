import React, { CSSProperties, useCallback, useEffect } from 'react';
import { ChartProperties, Dimension, ChartData } from '../common';
import { shortUUID } from '../../../../util/shortUUID';
import { duplicate } from '@fincity/kirun-js';
import Animate from './Animate';

const NO_ANIMATION = 0;
const TICK_SIZE = 5;

interface LabelItem {
	dimension: Dimension;
	oldX?: number;
	oldY?: number;
	label: string;
	id?: string;
	alreadyHidden?: boolean;
	rotation?: number;
}

interface LineItem {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	oldX1?: number;
	oldY1?: number;
	oldX2?: number;
	oldY2?: number;
	id?: string;
	alreadyHidden?: boolean;
}

export default function RegularDotChartGrid({
	properties,
	chartDimension,
	drawAreaDimension,
	hiddenDataSets,
	chartData,
	xAxisLabelStyle,
	yAxisLabelStyle,
	horizontalLinesStyle,
	verticalLinesStyle,
	onDrawAreaDimensionChange,
}: Readonly<{
	properties: ChartProperties;
	chartDimension: Dimension;
	drawAreaDimension: Dimension;
	hiddenDataSets: Set<number>;
	chartData?: ChartData;
	onDrawAreaDimensionChange: (dimension: Dimension) => void;
	xAxisLabelStyle: React.CSSProperties;
	yAxisLabelStyle: React.CSSProperties;
	horizontalLinesStyle: React.CSSProperties;
	verticalLinesStyle: React.CSSProperties;
}>) {
	const xAxisLabelRef = React.useRef<SVGTextElement>(null);
	const yAxisLabelRef = React.useRef<SVGTextElement>(null);

	const [xLabelData, setXLabelData] = React.useState<LabelItem[]>([]);
	const [yLabelData, setYLabelData] = React.useState<LabelItem[]>([]);
	const [horizontalLines, setHorizontalLines] = React.useState<LineItem[]>([]);
	const [verticalLines, setVerticalLines] = React.useState<LineItem[]>([]);

	useEffect(() => {
		if (
			properties.hideGrid ||
			(properties.chartType !== 'regular' && properties.chartType !== 'dot') ||
			!chartData ||
			chartDimension.width <= 0 ||
			chartDimension.height <= 0 ||
			xAxisLabelRef.current === null ||
			yAxisLabelRef.current === null
		) {
			onDrawAreaDimensionChange(chartDimension);
			return;
		}

		const [xLabels, yLabels, maxYAxisWidth, maxXAxisHeight, horizontalLines, verticalLines] =
			makeLabelsnLines(
				chartData,
				properties,
				chartDimension,
				xAxisLabelRef.current,
				yAxisLabelRef.current,
			);

		setXLabelData(curryForLabelData(xLabels, properties, chartData, chartDimension));
		setYLabelData(curryForLabelData(yLabels, properties, chartData, chartDimension));
		setHorizontalLines(
			curryForLinesData(horizontalLines, properties, chartData, chartDimension),
		);
		setVerticalLines(curryForLinesData(verticalLines, properties, chartData, chartDimension));

		onDrawAreaDimensionChange({
			x:
				(chartDimension.x ?? 0) +
				(properties.yAxisStartPosition === 'right'
					? 0
					: chartDimension.width - drawAreaDimension.width),
			y:
				(chartDimension.y ?? 0) +
				(properties.xAxisStartPosition === 'bottom'
					? 0
					: chartDimension.height - drawAreaDimension.height),
			height: chartDimension.height - maxXAxisHeight,
			width: chartDimension.width - maxYAxisWidth,
		});
	}, [
		chartDimension,
		hiddenDataSets,
		chartData,
		xAxisLabelStyle,
		yAxisLabelStyle,
		yAxisLabelRef.current,
		xAxisLabelRef.current,
		properties,
		onDrawAreaDimensionChange,
		setHorizontalLines,
		setVerticalLines,
		setXLabelData,
		setYLabelData,
	]);

	if (
		properties.hideGrid ||
		(properties.chartType !== 'regular' && properties.chartType !== 'dot') ||
		!chartData
	)
		return <></>;

	const labelCreator = useCallback(
		(className: string, styles: CSSProperties, alignmentBaseline: 'middle' | 'hanging') =>
			({ dimension: { x, y, width, height }, label, id, oldX, oldY }: LabelItem) =>
				(
					<>
						<Animate.Text
							key={id}
							duration={NO_ANIMATION ?? properties.animationTime}
							easing={properties.animationTimingFunction}
							x={x}
							y={y}
							oldX={oldX}
							oldY={oldY}
							className={className}
							style={{
								...styles,
								transformOrigin: `${(x ?? 0) + width}px ${y}px`,
							}}
							fill="currentColor"
							alignmentBaseline={alignmentBaseline}
						>
							{label}
						</Animate.Text>
						<rect
							x={x}
							y={y}
							width={width}
							height={height}
							fill="transparent"
							stroke="black"
							strokeWidth="1"
						/>
					</>
				),
		[NO_ANIMATION ?? properties.animationTime, properties.animationTimingFunction],
	);

	const lineCreator = useCallback(
		(className: string, styles: CSSProperties) =>
			({ x1, y1, x2, y2, id, oldX1, oldY1, oldX2, oldY2 }: LineItem) =>
				(
					<Animate.Line
						key={id}
						duration={NO_ANIMATION ?? properties.animationTime}
						easing={properties.animationTimingFunction}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						oldX1={oldX1}
						oldY1={oldY1}
						oldX2={oldX2}
						oldY2={oldY2}
						className={className}
						style={styles}
						stroke="currentColor"
						strokeWidth={1}
						strokeOpacity={0.5}
					/>
				),
		[NO_ANIMATION ?? properties.animationTime, properties.animationTimingFunction],
	);

	return (
		<>
			<text
				x={0}
				y={0}
				style={{ ...xAxisLabelStyle, transition: 'none' }}
				fillOpacity={0}
				strokeOpacity={0}
				ref={xAxisLabelRef}
			></text>
			<text
				x={0}
				y={0}
				style={{ ...yAxisLabelStyle, transition: 'none' }}
				fillOpacity={0}
				strokeOpacity={0}
				ref={yAxisLabelRef}
			></text>
			{xLabelData.map(
				labelCreator(
					(chartData.axisInverted ? 'y' : 'x') + 'LabelText',
					chartData.axisInverted ? yAxisLabelStyle : xAxisLabelStyle,
					'hanging',
				),
			)}
			{yLabelData.map(
				labelCreator(
					(chartData.axisInverted ? 'x' : 'y') + 'LabelText',
					chartData.axisInverted ? xAxisLabelStyle : yAxisLabelStyle,
					'hanging',
				),
			)}
			{horizontalLines.map(lineCreator('horizontalLine', horizontalLinesStyle))}
			{verticalLines.map(lineCreator('verticalLine', verticalLinesStyle))}
			<rect
				x={drawAreaDimension.x ?? 0}
				y={drawAreaDimension.y ?? 0}
				width={drawAreaDimension.width}
				height={drawAreaDimension.height}
				fill="transparent"
				stroke="blue"
				strokeWidth="1"
			/>
		</>
	);
}

function curryForLinesData(
	newLines: LineItem[],
	properties: ChartProperties,
	chartData: ChartData,
	chartDimension: Dimension,
) {
	return (old: LineItem[]) => {
		let i = 0;
		for (; i < newLines.length; i++) {
			if (old.length === 0) {
				newLines[i].oldX1 = newLines[i].x1;
				newLines[i].oldY1 = newLines[i].y1;
				newLines[i].oldX2 = newLines[i].x2;
				newLines[i].oldY2 = newLines[i].y2;
			}
			newLines[i].id = old[i]?.id ?? shortUUID();
		}

		for (; i < old.length; i++) {
			const older = duplicate(old[i]);
			if (older.alreadyHidden) {
				newLines.push(older);
				continue;
			}

			if (old[i].x1 == old[i].x2) {
				old[i].x2 = old[i].x1 = chartData.axisInverted
					? chartDimension.height + 100
					: chartDimension.height - 100;
			} else {
				old[i].y2 = old[i].y1 = chartData.axisInverted
					? chartDimension.width + 100
					: chartDimension.width - 100;
			}

			newLines.push(old[i]);
		}

		return newLines;
	};
}

function curryForLabelData(
	newLabels: LabelItem[],
	properties: ChartProperties,
	chartData: ChartData,
	chartDimension: Dimension,
) {
	return (old: LabelItem[]) => {
		let i = 0;
		for (; i < newLabels.length; i++) {
			if (old.length === 0) {
				newLabels[i].oldX = newLabels[i].dimension.x;
				newLabels[i].oldY = newLabels[i].dimension.y;
			}
			newLabels[i].id = old[i]?.id ?? shortUUID();
		}

		for (; i < old.length; i++) {
			const older = duplicate(old[i]);
			if (older.alreadyHidden) {
				newLabels.push(older);
				continue;
			}
			if (chartData.axisInverted)
				old[i].dimension.x =
					properties.xAxisStartPosition === 'bottom' ? -100 : chartDimension.width + 100;
			else
				old[i].dimension.y =
					properties.xAxisStartPosition === 'bottom' ? -100 : chartDimension.height + 100;
			newLabels.push(old[i]);
		}

		return newLabels;
	};
}

function dimesionsOfLabels(
	stringLabels: string[],
	labelRef: SVGTextElement,
): [Dimension, Dimension[]] {
	if (stringLabels.length === 0) return [{ width: 0, height: 0 }, []];

	const labelSizes: Dimension[] = [];

	let totalWidth = 0;
	let totalHeight = 0;

	for (const element of stringLabels) {
		labelRef.innerHTML = element;
		const { width, height } = labelRef.getBoundingClientRect();
		labelSizes.push({ width, height });

		totalWidth += width;
		totalHeight += height;
	}

	return [{ width: totalWidth, height: totalHeight }, labelSizes];
}

function addLocationToLabelsnMakeLines(
	xLabels: LabelItem[],
	yLabels: LabelItem[],
	chartData: ChartData,
	chartDimension: Dimension,
	properties: ChartProperties,
	maxWidth: number,
	maxHeight: number,
	xAxisLabelRef: SVGTextElement,
	yAxisLabelRef: SVGTextElement,
): [LabelItem[], LabelItem[], number, number, LineItem[], LineItem[]] {
	const xLines: LineItem[] = [];
	const yLines: LineItem[] = [];

	if (properties.stackedAxis === 'x') {
	} else {
		let xAxisX: number = 0,
			xAxisY: number = 0,
			yAxisX: number = 0,
			yAxisY: number = 0;
		if (properties.yAxisStartPosition === 'left') {
			xAxisX =
				(chartDimension.x ?? 0) + maxWidth - (properties.xAxisHideTicks ? 0 : TICK_SIZE);
			yAxisX = chartDimension.x ?? 0;
		} else if (properties.yAxisStartPosition === 'right') {
			xAxisX = chartDimension.x ?? 0;
			yAxisX =
				(chartDimension.x ?? 0) +
				chartDimension.width -
				maxWidth +
				(properties.yAxisHideTicks ? 0 : TICK_SIZE);
		} else if (properties.yAxisStartPosition === 'center') {
			xAxisX = chartDimension.x ?? 0;
			maxWidth = 0;
			yAxisX = (chartDimension.x ?? 0) + (chartDimension.width - maxWidth) / 2;
		}

		if (properties.xAxisStartPosition === 'bottom') {
			xAxisY = (chartDimension.y ?? 0) + chartDimension.height - maxHeight;
			yAxisY = chartDimension.y ?? 0 + (properties.xAxisHideTicks ? 0 : TICK_SIZE);
		} else if (properties.xAxisStartPosition === 'top') {
			xAxisY = chartDimension.y ?? 0;
			yAxisY =
				(chartDimension.y ?? 0) + maxHeight - (properties.xAxisHideTicks ? 0 : TICK_SIZE);
		} else if (properties.xAxisStartPosition === 'center') {
			xAxisY = (chartDimension.height - maxHeight) / 2;
			maxHeight = 0;
			yAxisY = chartDimension.y ?? 0;
		}

		let xAxisIncrement = (chartDimension.width - maxWidth) / xLabels.length;
		let yAxisIncrement = (chartDimension.height - maxHeight) / yLabels.length;

		if (!properties.hideXAxis) {
			xLines.push({
				x1:
					(chartDimension.x ?? 0) +
					(properties.yAxisStartPosition === 'left'
						? maxWidth - (properties.yAxisHideTicks ? 0 : TICK_SIZE)
						: 0),
				y1:
					(chartDimension.y ?? 0) +
					(properties.xAxisStartPosition === 'top'
						? maxHeight
						: chartDimension.height - maxHeight),
				x2:
					(chartDimension.x ?? 0) +
					(properties.yAxisStartPosition === 'right'
						? chartDimension.width -
						  maxWidth +
						  (properties.yAxisHideTicks ? 0 : TICK_SIZE)
						: chartDimension.width),
				y2:
					(chartDimension.y ?? 0) +
					(properties.xAxisStartPosition === 'top'
						? maxHeight
						: chartDimension.height - maxHeight),
			});
		}

		for (let i = 0; i < xLabels.length; i++) {
			if (xLabels[i].dimension.width > xAxisIncrement) {
				const label = xLabels[i].label.substring(0, xLabels[i].label.length / 2) + '...';
				xAxisLabelRef.innerHTML = label;
				const { width } = xAxisLabelRef.getBoundingClientRect();
				xLabels[i].dimension.width = width;
				xLabels[i].label = label;
			}

			xLabels[i].dimension.x =
				xAxisX + xAxisIncrement * i + (xAxisIncrement - xLabels[i].dimension.width) / 2;

			xLabels[i].dimension.y =
				xAxisY +
				(properties.xAxisStartPosition === 'top'
					? maxHeight - xLabels[i].dimension.height - TICK_SIZE
					: TICK_SIZE);
		}

		for (let i = 0; i < yLabels.length; i++) {
			yLabels[i].dimension.x =
				yAxisX +
				(properties.yAxisStartPosition === 'right'
					? 0
					: maxWidth - yLabels[i].dimension.width);
			yLabels[i].dimension.y = yAxisY + yAxisIncrement * i;

			if (!properties.hideYLines && i != 0) {
				xLines.push({
					x1:
						(chartDimension.x ?? 0) +
						(properties.yAxisStartPosition === 'left'
							? maxWidth - (properties.yAxisHideTicks ? 0 : TICK_SIZE)
							: 0),
					y1: yAxisY + yAxisIncrement * i + yAxisIncrement / 2,
					x2:
						(chartDimension.x ?? 0) +
						(properties.yAxisStartPosition === 'right'
							? chartDimension.width -
							  maxWidth +
							  (properties.yAxisHideTicks ? 0 : TICK_SIZE)
							: chartDimension.width),
					y2: yAxisY + yAxisIncrement * i + yAxisIncrement / 2,
				});
			}
		}
	}

	return [xLabels, yLabels, maxWidth, maxHeight, xLines, yLines];
}

function makeLabelsnLines(
	chartData: ChartData,
	properties: ChartProperties,
	chartDimension: Dimension,
	xAxisLabelRef: SVGTextElement,
	yAxisLabelRef: SVGTextElement,
): [LabelItem[], LabelItem[], number, number, LineItem[], LineItem[]] {
	const [xLabels, yLabels, maxWidth, maxHeight] = makeLabels(
		properties,
		chartData,
		xAxisLabelRef,
		yAxisLabelRef,
		chartDimension,
	);

	return addLocationToLabelsnMakeLines(
		xLabels,
		yLabels,
		chartData,
		chartDimension,
		properties,
		maxWidth,
		maxHeight,
		xAxisLabelRef,
		yAxisLabelRef,
	);
}
function makeLabels(
	properties: ChartProperties,
	chartData: ChartData,
	xAxisLabelRef: SVGTextElement,
	yAxisLabelRef: SVGTextElement,
	chartDimension: Dimension,
): [LabelItem[], LabelItem[], number, number] {
	const [xTotal, xLabelSizes] = properties.hideXAxis
		? [{ width: 0, height: 0 }, []]
		: dimesionsOfLabels(chartData.xAxisLabels, xAxisLabelRef);

	const yAxisLabels = chartData.yAxisLabels;

	const [yTotal, yLabelSizes] = properties.hideYAxis
		? [{ width: 0, height: 0 }, []]
		: dimesionsOfLabels(yAxisLabels, yAxisLabelRef);

	const xLabels: LabelItem[] = [];
	const yLabels: LabelItem[] = [];

	let maxHeight = 0;
	let maxWidth = 0;

	if (properties.stackedAxis === 'x') {
	} else {
		let increment = Math.ceil(
			(chartData.axisInverted ? yTotal.width : xTotal.width) / chartDimension.width,
		);

		let labels = chartData.axisInverted ? yAxisLabels : chartData.xAxisLabels;
		let labelSizes = chartData.axisInverted ? yLabelSizes : xLabelSizes;

		if (labelSizes?.length) {
			for (let i = 0; i < labels.length; i += increment) {
				xLabels.push({
					dimension: labelSizes[i],
					label: labels[i],
				});
				maxHeight = Math.max(maxHeight, labelSizes[i].height);
			}
		}

		if (properties.xAxisReverse) xLabels.reverse();
		if (properties.yAxisStartPosition === 'right') xLabels.reverse();

		increment = Math.ceil(
			(chartData.axisInverted ? yTotal.height : xTotal.height) / chartDimension.height,
		);
		if (increment <= 0) increment = 1;
		labels = chartData.axisInverted ? chartData.xAxisLabels : yAxisLabels;
		labelSizes = chartData.axisInverted ? xLabelSizes : yLabelSizes;

		if (labelSizes?.length) {
			for (let i = 0; i < labels.length; i += increment) {
				yLabels.push({
					dimension: labelSizes[i],
					label: labels[i],
				});
				maxWidth = Math.max(maxWidth, labelSizes[i].width);
			}
		}

		if (properties.yAxisReverse) yLabels.reverse();
		if (properties.xAxisStartPosition === 'bottom') yLabels.reverse();
	}

	maxWidth += 5 + TICK_SIZE;
	maxHeight += 5 + TICK_SIZE;

	return [xLabels, yLabels, maxWidth, maxHeight];
}
