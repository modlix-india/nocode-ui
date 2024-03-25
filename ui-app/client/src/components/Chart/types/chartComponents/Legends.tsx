import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { shortUUID } from '../../../../util/shortUUID';
import { ChartData, ChartProperties, Dimension } from '../common';
import Animate from './Animate';

const RECT_WIDTH = 15;
const RECT_HEIGHT = 15;
const SPACE = 10;
const NO_ANIMATION = 0;

interface LegendGroupItem {
	label: string;
	labelDimension: Dimension;
	rectDimension: Dimension;
	color: string;
	fillOpacity: number;
	strokeOpacity: number;
	id?: string;
	alreadyHidden?: boolean;
}

interface LegendRowColumn {
	size: number;
	maxSize: number;
	legends: Array<LegendGroupItem>;
}

export default function Legends({
	containerDimension,
	legendDimension,
	properties,
	chartData,
	onLegendDimensionChange,
	labelStyles,
	rectangleStyles,
	hiddenDataSets,
	onToggleDataSet,
}: Readonly<{
	containerDimension: Dimension;
	legendDimension: Dimension;
	properties: ChartProperties;
	chartData: ChartData | undefined;
	onLegendDimensionChange: (d: Dimension) => void;
	labelStyles: CSSProperties;
	rectangleStyles: CSSProperties;
	hiddenDataSets: Set<number>;
	onToggleDataSet: (index: number) => void;
}>) {
	const labelWidthRef = useRef<SVGTextElement>(null);

	const [legends, setLegends] = useState<LegendGroupItem[]>([]);

	useEffect(() => {
		if (
			properties.legendPosition === 'none' ||
			containerDimension.width <= 0 ||
			containerDimension.height <= 0
		) {
			if (legendDimension.width !== 0 || legendDimension.height !== 0)
				onLegendDimensionChange({ width: 0, height: 0 });
			return;
		}

		if (!labelWidthRef?.current) return;

		const legendGroups: Array<LegendGroupItem> = makeLegendItems(
			chartData,
			properties,
			labelWidthRef,
			rectangleStyles,
		);

		const legendRowsColumnns: Array<LegendRowColumn> = arrangeInRowsOrColumns(
			properties,
			containerDimension,
			legendGroups,
		);

		const newDimension = positionLegends(legendRowsColumnns, containerDimension, properties);

		if (
			legendDimension.width !== newDimension.width ||
			legendDimension.height !== newDimension.height
		) {
			onLegendDimensionChange(newDimension);
		}

		setLegends(old => {
			let i = 0;

			for (; i < legendGroups.length; i++) {
				legendGroups[i].id = old[i]?.id ?? shortUUID();
			}

			for (; i < old.length; i++) {
				const older = { ...old[i], alreadyHidden: true };
				if (!old[i].alreadyHidden) {
					switch (properties.legendPosition) {
						case 'top':
							older.labelDimension.y = older.rectDimension.y = -100;
							break;
						case 'bottom':
							older.labelDimension.y = older.rectDimension.y =
								containerDimension.height + 100;
							break;
						case 'left':
							older.labelDimension.x = older.rectDimension.x = -100;
							break;
						case 'right':
							older.labelDimension.x = older.rectDimension.x =
								containerDimension.width + 100;
							break;
					}
				}
				legendGroups.push(older);
			}

			return legendGroups;
		});
	}, [
		labelWidthRef?.current,
		containerDimension,
		chartData,
		properties.legendPosition,
		properties.disableLegendInteraction,
		labelStyles,
		rectangleStyles,
		setLegends,
	]);

	if (
		containerDimension.width <= 0 ||
		containerDimension.height <= 0 ||
		properties.legendPosition === 'none'
	)
		return <></>;

	return (
		<g className="legendGroup">
			<text
				x={0}
				y={0}
				style={{ ...labelStyles, transition: 'none' }}
				fillOpacity={0}
				strokeOpacity={0}
				ref={labelWidthRef}
			></text>
			{legends.map((legend, index) => (
				<g key={legend.id} opacity={hiddenDataSets.has(index) ? '0.5' : ''}>
					<Animate.Rect
						key={`${legend.id}-rect`}
						id={`${legend.id}-rect`}
						width={legend.rectDimension.width}
						height={legend.rectDimension.height}
						fill={legend.color}
						fillOpacity={legend.fillOpacity}
						strokeOpacity={legend.strokeOpacity}
						style={rectangleStyles}
						x={legend.rectDimension.x ?? 0}
						y={legend.rectDimension.y ?? 0}
						duration={NO_ANIMATION ?? properties.animationTime}
						easing={properties.animationTimingFunction}
						onClick={
							properties.disableLegendInteraction
								? undefined
								: () => onToggleDataSet(index)
						}
					/>
					<Animate.Text
						key={`${legend.id}-text`}
						id={`${legend.id}-text`}
						className="legendText"
						width={legend.labelDimension.width}
						height={legend.labelDimension.height}
						style={labelStyles}
						fill="currentColor"
						alignmentBaseline="before-edge"
						x={legend.labelDimension.x ?? 0}
						y={legend.labelDimension.y ?? 0}
						duration={NO_ANIMATION ?? properties.animationTime}
						easing={properties.animationTimingFunction}
						onClick={
							properties.disableLegendInteraction
								? undefined
								: () => onToggleDataSet(index)
						}
					>
						{legend.label}
					</Animate.Text>

					{hiddenDataSets.has(index) ? (
						<Animate.Line
							key={`${legend.id}-strike`}
							x1={legend.rectDimension.x}
							y1={
								(legend.rectDimension.y ?? 0) +
								(legend.rectDimension.height > legend.labelDimension.height
									? legend.rectDimension.height
									: legend.labelDimension.height) /
									2
							}
							x2={(legend.labelDimension.x ?? 0) + legend.labelDimension.width}
							y2={
								(legend.rectDimension.y ?? 0) +
								(legend.rectDimension.height > legend.labelDimension.height
									? legend.rectDimension.height
									: legend.labelDimension.height) /
									2
							}
							oldX1={legend.rectDimension.x}
							oldY1={
								(legend.rectDimension.y ?? 0) +
								(legend.rectDimension.height > legend.labelDimension.height
									? legend.rectDimension.height
									: legend.labelDimension.height) /
									2
							}
							oldX2={(legend.labelDimension.x ?? 0) + legend.labelDimension.width}
							oldY2={
								(legend.rectDimension.y ?? 0) +
								(legend.rectDimension.height > legend.labelDimension.height
									? legend.rectDimension.height
									: legend.labelDimension.height) /
									2
							}
							easing={properties.animationTimingFunction}
							duration={NO_ANIMATION ?? properties.animationTime}
							stroke="currentColor"
							onClick={
								properties.disableLegendInteraction
									? undefined
									: () => onToggleDataSet(index)
							}
						/>
					) : (
						<></>
					)}
				</g>
			))}
		</g>
	);
}

function positionLegends(
	legendRowsColumnns: Array<LegendRowColumn>,
	chartDimension: Dimension,
	properties: ChartProperties,
): Dimension {
	const horizontal =
		properties.legendPosition === 'top' || properties.legendPosition === 'bottom';

	let x = 0,
		y = 0;

	let start = 0;
	if (properties.legendPosition === 'bottom')
		start = y =
			chartDimension.height -
			legendRowsColumnns.reduce(
				(acc, rowColumn) =>
					acc +
					Math.max(
						...rowColumn.legends.map(e =>
							e.labelDimension.height > e.rectDimension.height
								? e.labelDimension.height
								: e.rectDimension.height,
						),
					),
				0,
			) -
			(legendRowsColumnns.length - 1) * SPACE;
	else if (properties.legendPosition === 'right')
		start = x =
			chartDimension.width -
			legendRowsColumnns.reduce(
				(acc, rowColumn) =>
					acc +
					Math.max(
						...rowColumn.legends.map(
							e => e.labelDimension.width + SPACE + e.rectDimension.width,
						),
					),
				0,
			) -
			(legendRowsColumnns.length - 1) * SPACE;

	for (const element of legendRowsColumnns) {
		const rowColumn = element;
		if (horizontal) x = Math.round((chartDimension.width - rowColumn.size) / 2);
		else y = Math.round((chartDimension.height - rowColumn.size) / 2);

		let maxSize = 0;
		for (let j = 0; j < rowColumn.legends.length; j++) {
			const legend = rowColumn.legends[j];
			const maxLegenedHeight = Math.max(
				legend.labelDimension.height,
				legend.rectDimension.height,
			);
			legend.rectDimension.x = x;
			legend.rectDimension.y =
				y + Math.round((maxLegenedHeight - legend.rectDimension.height) / 2);
			legend.labelDimension.x = x + legend.rectDimension.width + SPACE;
			legend.labelDimension.y =
				y + Math.round((maxLegenedHeight - legend.labelDimension.height) / 2);
			if (horizontal) {
				x += legend.labelDimension.width + SPACE + legend.rectDimension.width + SPACE;
				maxSize = Math.max(maxSize, maxLegenedHeight);
			} else {
				y += maxLegenedHeight + SPACE;
				maxSize = Math.max(
					maxSize,
					legend.labelDimension.width + SPACE + legend.rectDimension.width,
				);
			}
		}

		if (horizontal) y += maxSize + SPACE;
		else x += maxSize + SPACE;
	}

	const width = horizontal ? chartDimension.width : x - legendRowsColumnns.length * SPACE - start;
	const height = horizontal ? y - SPACE - start : chartDimension.height;

	return { width: width, height: height };
}

function arrangeInRowsOrColumns(
	properties: ChartProperties,
	chartDimension: Dimension,
	labelGroups: LegendGroupItem[],
): Array<LegendRowColumn> {
	let horizontal = properties.legendPosition === 'top' || properties.legendPosition === 'bottom';
	let rowsColumns: Array<{ size: number; maxSize: number; legends: Array<LegendGroupItem> }> = [];
	let rowColumnNumber = 0;
	let rowColumnSize = 0;
	let currentRowColumn: Array<LegendGroupItem> = [];
	let columnRowMaxSize = 0;

	const AVAILABLE_SIZE = horizontal ? chartDimension.width : chartDimension.height;

	for (const element of labelGroups) {
		let size = horizontal
			? element.labelDimension.width + SPACE + element.rectDimension.width
			: element.labelDimension.height > element.rectDimension.height
			? element.labelDimension.height
			: element.rectDimension.height;

		if (rowColumnSize + size >= AVAILABLE_SIZE) {
			rowsColumns.push({
				size: rowColumnSize - (currentRowColumn.length === 1 ? 0 : SPACE),
				maxSize: columnRowMaxSize,
				legends: currentRowColumn,
			});
			rowColumnNumber++;
			rowColumnSize = 0;
			columnRowMaxSize = 0;
			currentRowColumn = [];
		}

		rowColumnSize += size + SPACE;
		columnRowMaxSize = Math.max(columnRowMaxSize, size);
		currentRowColumn.push(element);
	}

	if (currentRowColumn.length)
		rowsColumns.push({
			size: rowColumnSize,
			maxSize: columnRowMaxSize,
			legends: currentRowColumn,
		});

	return rowsColumns;
}

function makeLegendItems(
	chartData: ChartData | undefined,
	properties: ChartProperties,
	labelWidthRef: React.RefObject<SVGTextElement>,
	rectStyles: CSSProperties,
) {
	const labelGroups: Array<LegendGroupItem> = [];
	if (!labelWidthRef.current) return labelGroups;

	for (let i = 0; i < (chartData?.dataSetData?.length ?? 0); i++) {
		const label = properties?.dataSetLabels?.[i] ?? `Data set ${i + 1}`;
		labelWidthRef.current.innerHTML = label;
		const { width, height } = labelWidthRef.current.getBoundingClientRect();
		const labelDimension = { width: Math.round(width), height: Math.round(height) };
		const rW: number = rectStyles.width ? parseInt('' + rectStyles.width) : RECT_WIDTH;
		const rh: number = rectStyles.height ? parseInt('' + rectStyles.height) : RECT_HEIGHT;

		const rectDimension = {
			width: isNaN(rW) ? RECT_WIDTH : rW,
			height: isNaN(rh) ? RECT_HEIGHT : rh,
		};

		labelGroups.push({
			label,
			labelDimension,
			rectDimension,
			color: chartData?.dataSetData?.[i]?.dataColors?.safeGet(0) ?? 'black',
			fillOpacity: chartData?.dataSetData?.[i]?.fillOpacity?.safeGet(0) ?? 1,
			strokeOpacity: chartData?.dataSetData?.[i]?.strokeOpacity?.safeGet(0) ?? 1,
		});
	}
	return labelGroups;
}
