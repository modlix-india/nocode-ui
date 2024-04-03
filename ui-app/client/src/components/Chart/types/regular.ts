import { isNullValue } from '@fincity/kirun-js';
import { processStyleObjectToString } from '../../../util/styleProcessor';
import {
	ChartData,
	ChartProperties,
	MakeChartProps,
	DataSetStyle,
	Dimension,
	labelDimensions,
	maxDimensions,
} from './common';

const CHART_PADDING = 10;

export function makeRegularChart(props: MakeChartProps) {
	const {
		properties,
		svgRef,
		chartData,
		chartDimension,
		resolvedStyles,
		focusedDataSet,
		hiddenDataSets,
	} = props;

	const d3 = globalThis.d3;
	const svg = d3.select(svgRef);
	const chartGroup = svg.select('g.chartGroup');

	let {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	} = computeChartDimensions(
		chartData.xUniqueData,
		chartData.yUniqueData,
		properties,
		chartData,
		svg,
		chartDimension,
	);

	let chart = chartGroup.select('g.chart');
	if (!chart.node()) {
		chartGroup.append('g').attr('class', 'chart');
		chart = chartGroup.select('g.chart');
	}

	chart.attr(
		'transform',
		`translate(${properties.yAxisStartPosition === 'left' ? yAxisMaxDimensions.width : 0}, ${
			properties.xAxisStartPosition === 'top' ? xAxisMaxDimensions.height : 0
		})`,
	);

	const { xScale, yScale } = makeScale(properties, chartData, d3, chartHeight, chartWidth);

	const { xAxis, yAxis, xAxisTickValues, yAxisTickValues } = makeAxis(
		properties,
		chartData,
		d3,
		svg,
		xScale,
		yScale,
	);

	renderAxis(
		properties,
		xAxis,
		chartGroup,
		yAxisMaxDimensions,
		xAxisMaxDimensions,
		chartHeight,
		yScale,
		chart,
		yAxis,
		chartWidth,
		xScale,
		resolvedStyles,
	);

	renderGrid(
		properties,
		chartData,
		chart,
		chartWidth,
		chartHeight,
		xScale,
		yScale,
		xAxisTickValues,
		yAxisTickValues,
		resolvedStyles,
	);

	const barIndexes: number[] = [];
	const otherIndexes: number[] = [];

	chartData.dataSetData.forEach((data, index) => {
		if (hiddenDataSets.has(index)) return;
		if (
			data.dataSetStyle === DataSetStyle.Bar ||
			data.dataSetStyle === DataSetStyle.HorizontalBar
		)
			barIndexes.push(index);
		else otherIndexes.push(index);
	});

	if (barIndexes.length) {
		renderBars(
			chart,
			barIndexes,
			chartData,
			d3,
			properties,
			xScale,
			yScale,
			chartWidth,
			chartHeight,
			resolvedStyles,
			focusedDataSet,
			props.onFocusDataSet,
		);
	} else {
		chart.selectAll('g.barDataSetGroup').remove();
	}
}

function barX(chartData: ChartData, properties: ChartProperties, xScale: any, barWidth: number) {
	return ({ i, j }: { i: number; j: number }) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.y : data.x;
		if (Array.isArray(value)) value = value[0];
		if (
			properties.stackedAxis === 'x' ||
			properties.stackedAxis === 'y' ||
			properties.stackedAxis === 'none'
		)
			return (
				xScale(value) +
				properties.padding +
				(barWidth + properties.padding) * (properties.stackedAxis === 'y' ? 0 : i)
			);
		return xScale(value) + properties.padding * (i + 1);
	};
}

function hBarX(
	chartData: ChartData,
	properties: ChartProperties,
	xScale: any,
	axisPosition: number,
) {
	return ({
		i,
		j,
		k0,
		k1,
		sum,
	}: {
		i: number;
		j: number;
		k0?: number;
		k1?: number;
		sum?: number;
	}) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.y : data.x;

		if (properties.stackedAxis === 'x' && !isNullValue(sum)) {
			const x0 = xScale(sum);
			const x1 = xScale(sum + value);

			return x0 < x1 ? x0 : x1;
		} else if (isNullValue(k0) || isNullValue(k1) || !Array.isArray(value)) {
			if (Array.isArray(value)) value = value[0];
			const x = xScale(value);

			if (properties.yAxisStartPosition === 'left') return 0;
			return x < axisPosition ? x : axisPosition;
		}

		const x0 = xScale(value[k0!]);
		const x1 = xScale(value[k1!]);

		return x0 < x1 ? x0 : x1;
	};
}

function barY(
	chartData: ChartData,
	properties: ChartProperties,
	yScale: any,
	axisPosition: number,
) {
	return ({
		i,
		j,
		k0,
		k1,
		sum,
	}: {
		i: number;
		j: number;
		k0?: number;
		k1?: number;
		sum?: number;
	}) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.x : data.y;

		if (properties.stackedAxis === 'y' && !isNullValue(sum)) {
			const y0 = yScale(sum);
			const y1 = yScale(sum + value);

			return y0 < y1 ? y0 : y1;
		} else if (isNullValue(k0) || isNullValue(k1) || !Array.isArray(value)) {
			if (Array.isArray(value)) value = value[0];
			const y = yScale(value);

			if (properties.xAxisStartPosition === 'bottom') return y;
			return y < axisPosition ? y : axisPosition;
		}

		const y0 = yScale(value[k0!]);
		const y1 = yScale(value[k1!]);

		return y0 < y1 ? y0 : y1;
	};
}

function hBarY(
	chartData: ChartData,
	properties: ChartProperties,
	yScale: any,
	barWidth: number,
	barIndexes: number[],
) {
	return ({ i, j }: { i: number; j: number }) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.x : data.y;
		if (Array.isArray(value)) value = value[0];

		if (
			properties.stackedAxis === 'x' ||
			properties.stackedAxis === 'y' ||
			properties.stackedAxis === 'none'
		)
			return (
				yScale(value) +
				properties.padding +
				(properties.stackedAxis === 'x'
					? 0
					: (barWidth + properties.padding) * barIndexes.indexOf(i))
			);

		return yScale(value) + properties.padding * (barIndexes.indexOf(i) + 1);
	};
}

function barW(properties: ChartProperties, barWidth: number) {
	return ({ i, j }: { i: number; j: number }) =>
		barWidth - (properties.stackedAxis !== 'z' ? 0 : properties.padding * i * 2);
}

function hBarW(
	chartData: ChartData,
	properties: ChartProperties,
	xScale: any,
	axisPosition: number,
) {
	return ({
		i,
		j,
		k0,
		k1,
		sum,
	}: {
		i: number;
		j: number;
		k0?: number;
		k1?: number;
		sum?: number;
	}) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.y : data.x;

		if (properties.stackedAxis === 'x' && !isNullValue(sum)) {
			const x0 = xScale(sum);
			const x1 = xScale(sum + value);

			return Math.abs(x0 - x1);
		} else if (isNullValue(k0) || isNullValue(k1) || !Array.isArray(value)) {
			if (Array.isArray(value)) value = value[0];
			const x = xScale(value);

			if (properties.yAxisStartPosition === 'left') x;
			return Math.abs(x - axisPosition);
		}

		const x0 = xScale(value[k0!]);
		const x1 = xScale(value[k1!]);

		return Math.abs(x0 - x1);
	};
}

function barH(
	chartData: ChartData,
	properties: ChartProperties,
	yScale: any,
	axisPosition: number,
	barWidth: number,
) {
	return ({
		i,
		j,
		k0,
		k1,
		sum,
	}: {
		i: number;
		j: number;
		k0?: number;
		k1?: number;
		sum?: number;
	}) => {
		const data = chartData.dataSetData[i].data[j];
		let value = chartData.axisInverted ? data.x : data.y;

		if (properties.stackedAxis === 'y' && !isNullValue(sum)) {
			const y0 = yScale(sum);
			const y1 = yScale(sum + value);

			return Math.abs(y0 - y1);
		} else if (isNullValue(k0) || isNullValue(k1) || !Array.isArray(value)) {
			if (Array.isArray(value)) value = value[0];
			const y = yScale(value);

			if (properties.xAxisStartPosition === 'top') return y;
			return Math.abs(y - axisPosition);
		}

		const y0 = yScale(value[k0!]);
		const y1 = yScale(value[k1!]);

		return Math.abs(y0 - y1);
	};
}

function hBarH(properties: ChartProperties, yScale: any, barWidth: number) {
	return ({ i, j }: { i: number; j: number }) => {
		if (properties.stackedAxis === 'y' || properties.stackedAxis === 'none') return barWidth;

		if (properties.stackedAxis === 'x')
			return barWidth - (properties.stackedAxis === 'x' ? 0 : properties.padding * i * 2);

		return barWidth - properties.padding * 2 * i;
	};
}

function renderBars(
	chart: any,
	barIndexes: number[],
	chartData: ChartData,
	d3: any,
	properties: ChartProperties,
	xScale: any,
	yScale: any,
	chartWidth: number,
	chartHeight: number,
	resolvedStyles: any,
	focusedDataSet: number | undefined,
	onFocusDataSet: (index: number | undefined) => void,
) {
	const bandWidth = (chartData.hasHorizontalBar ? yScale : xScale).bandwidth?.() ?? 0;
	let barWidth = bandWidth - properties.padding * 2;

	if (
		properties.stackedAxis === (chartData.hasBar ? 'x' : 'y') ||
		properties.stackedAxis === 'none'
	) {
		barWidth += properties.padding;
		barWidth = barWidth / barIndexes.length - properties.padding;
	}
	if (barWidth < 0.5) barWidth = 0.5;

	let axisPosition: number;

	if (chartData.hasHorizontalBar) {
		if (properties.yAxisStartPosition === 'right') axisPosition = chartWidth;
		else if (properties.yAxisStartPosition === 'left') axisPosition = 0;
		else if (properties.yAxisStartPosition === 'center') axisPosition = chartWidth / 2;
		else if (properties.yAxisStartPosition === 'x0') axisPosition = xScale(0);
		else if (properties.yAxisStartPosition === 'custom') {
			axisPosition = xScale(properties.yAxisStartCustomValue);
			if (isNullValue(axisPosition))
				axisPosition = xScale(parseFloat(properties.yAxisStartCustomValue ?? ''));
		}
	} else {
		if (properties.xAxisStartPosition === 'bottom') axisPosition = chartHeight;
		else if (properties.xAxisStartPosition === 'top') axisPosition = 0;
		else if (properties.xAxisStartPosition === 'center') axisPosition = chartHeight / 2;
		else if (properties.xAxisStartPosition === 'y0') axisPosition = yScale(0);
		else if (properties.xAxisStartPosition === 'custom') {
			axisPosition = yScale(properties.xAxisStartCustomValue);
			if (isNullValue(axisPosition))
				axisPosition = yScale(parseFloat(properties.xAxisStartCustomValue ?? ''));
		}
	}

	const xFunction = chartData.hasHorizontalBar
		? hBarX(chartData, properties, xScale, axisPosition!)
		: barX(chartData, properties, xScale, barWidth);
	const yFunction = chartData.hasHorizontalBar
		? hBarY(chartData, properties, yScale, barWidth, barIndexes)
		: barY(chartData, properties, yScale, axisPosition!);
	const widthFunction = chartData.hasHorizontalBar
		? hBarW(chartData, properties, xScale, axisPosition!)
		: barW(properties, barWidth);
	const heightFunction = chartData.hasHorizontalBar
		? hBarH(properties, yScale, barWidth)
		: barH(chartData, properties, yScale, axisPosition!, barWidth);

	const max = chartData.dataSetData.find(e => Array.isArray(e.data) && e.data.length)?.data
		?.length;
	const positiveSums = new Array(max).fill(0);
	const negativeSums = new Array(max).fill(0);

	const dataSetGroups = chart
		.selectAll('g.barDataSetGroup')
		.data(barIndexes, (i: number) => i)
		.join('g')
		.attr('class', 'barDataSetGroup');

	dataSetGroups
		.transition()
		.attr('opacity', (i: number) =>
			focusedDataSet === undefined || focusedDataSet === i ? 1 : 0.3,
		);

	dataSetGroups
		.selectAll('rect')
		.data((index: number) =>
			chartData.dataSetData[index].data.flatMap((_, j) => {
				const dataSet = chartData.dataSetData[index];

				if (!Array.isArray(dataSet.data[j].y)) {
					if (
						(chartData.hasBar && properties.stackedAxis === 'y') ||
						(properties.stackedAxis === 'x' && chartData.hasHorizontalBar)
					) {
						const value = dataSet.data[j].y;
						let sum;
						if (value > 0) {
							sum = positiveSums[j] ?? 0;
							positiveSums[j] = sum + value;
						} else {
							sum = negativeSums[j] ?? 0;
							negativeSums[j] = sum + value;
						}

						return [{ i: index, j, sum }];
					}

					return [{ i: index, j }];
				}

				let bars = [];
				for (let i = 0; i < dataSet.data[j].y.length; i += 2) {
					bars.push({ i: index, j, k0: i, k1: i + 1 });
				}

				return bars;
			}),
		)
		.join('rect')
		.on(
			'mouseover',
			properties.focusDataSetOnHover ? (e: any, d: any) => onFocusDataSet(d.i) : undefined,
		)
		.on(
			'mouseout',
			properties.focusDataSetOnHover ? (e: any, d: any) => onFocusDataSet(d.i) : undefined,
		)
		.transition(
			d3
				.transition()
				.duration(properties.animationTime)
				.ease(d3[properties.animationTimingFunction] ?? d3.easeLinear),
		)
		.attr('x', xFunction)
		.attr('y', yFunction)
		.attr('width', widthFunction)
		.attr('height', heightFunction)
		.attr(
			'fill',
			(d: any) => chartData.dataSetData[d.i].dataColors?.safeGet(d.j) ?? 'currentColor',
		)
		.attr(
			'fill-opacity',
			(d: any) => chartData.dataSetData[d.i].fillOpacity?.safeGet(d.j) ?? '1',
		)
		.attr(
			'stroke',
			(d: any) => chartData.dataSetData[d.i].dataStrokeColors?.safeGet(d.j) ?? 'currentColor',
		)
		.attr(
			'stroke-opacity',
			(d: any) => chartData.dataSetData[d.i].strokeOpacity?.safeGet(d.j) ?? '1',
		)
		.attr('style', processStyleObjectToString(resolvedStyles.bar));
}

function renderGrid(
	properties: ChartProperties,
	chartData: ChartData,
	chart: any,
	chartWidth: number,
	chartHeight: number,
	xScale: any,
	yScale: any,
	xAxisTickValues: any[],
	yAxisTickValues: any[],
	resolvedStyles: any,
) {
	if (properties.hideGrid) {
		let grid = chart.select('.grid');
		if (grid.node()) {
			grid.remove();
		}
		return;
	}

	let grid = chart.select('.grid');
	if (!grid.node()) {
		chart.append('g').attr('class', 'grid');
		grid = chart.select('.grid');
	}

	if (!properties.hideXLines) {
		grid.selectAll('line.horizontalGrid').remove();
		const ys = (
			yScale.ticks
				? yScale.ticks()
				: chartData.axisInverted
				? xAxisTickValues
				: yAxisTickValues
		).map((d: any) => yScale(d));
		ys.indexOf(chartHeight) === -1 && ys.push(chartHeight);
		ys.indexOf(0) === -1 && ys.push(0);
		grid.selectAll('line.horizontalGrid')
			.data(ys)
			.enter()
			.append('line')
			.attr('class', 'horizontalGrid')
			.attr('x1', 0)
			.attr('x2', chartWidth)
			.attr('y1', (d: any) => d)
			.attr('y2', (d: any) => d)
			.attr('stroke', 'currentColor')
			.attr('style', processStyleObjectToString(resolvedStyles.horizontalLines));
	} else {
		grid.selectAll('line.horizontalGrid').remove();
	}
	if (!properties.hideYLines) {
		grid.selectAll('line.verticalGrid').remove();
		const xs = (
			xScale.ticks
				? xScale.ticks()
				: chartData.axisInverted
				? yAxisTickValues
				: xAxisTickValues
		).map((d: any) => xScale(d));
		xs.indexOf(chartWidth) === -1 && xs.push(chartWidth);
		xs.indexOf(0) === -1 && xs.push(0);
		grid.selectAll('line.verticalGrid')
			.data(xs)
			.enter()
			.append('line')
			.attr('class', 'verticalGrid')
			.attr('x1', (d: any) => d)
			.attr('x2', (d: any) => d)
			.attr('y1', 0)
			.attr('y2', chartHeight)
			.attr('stroke', 'currentColor')
			.attr('style', processStyleObjectToString(resolvedStyles.verticalLines));
	} else {
		grid.selectAll('line.verticalGrid').remove();
	}
}

function renderAxis(
	properties: ChartProperties,
	xAxis: any,
	chartGroup: any,
	yAxisMaxDimensions: Dimension | { width: number; height: number },
	xAxisMaxDimensions: Dimension | { width: number; height: number },
	chartHeight: number,
	yScale: any,
	chart: any,
	yAxis: any,
	chartWidth: number,
	xScale: any,
	resolvedStyles: any,
) {
	if (!properties.hideGrid && !properties.hideXAxis && xAxis) {
		let xAxisGroup = chartGroup.select('.xAxisGroup');
		if (xAxisGroup.node()) {
			xAxisGroup.remove();
		}
		chartGroup.append('g').attr('class', 'xAxisGroup');
		xAxisGroup = chartGroup.select('.xAxisGroup');

		let left = 0,
			top = 0;
		if (properties.yAxisStartPosition === 'left') {
			left = yAxisMaxDimensions.width;
		}

		if (properties.xAxisStartPosition === 'top') {
			top = xAxisMaxDimensions.height;
		} else if (properties.xAxisStartPosition === 'center') {
			top = chartHeight / 2;
		} else if (properties.xAxisStartPosition === 'y0') {
			top = yScale(0);
		} else if (properties.xAxisStartPosition === 'bottom') {
			top = chartHeight;
		} else if (properties.xAxisStartPosition === 'custom') {
			top =
				yScale(properties.xAxisStartCustomValue) ??
				yScale(parseFloat(properties.xAxisStartCustomValue ?? ''));
		}

		xAxisGroup.transition().duration(properties.animationTime).call(xAxis);
		xAxisGroup
			.selectAll('text')
			.attr('opacity', properties.xAxisHideLabels ? 0 : 1)
			.attr('style', processStyleObjectToString(resolvedStyles.xAxisLabel));
		xAxisGroup
			.attr('transform', `translate(${left}, ${top})`)
			.attr('font-size', 'inherit')
			.attr('font-family', 'inherit')
			.attr('style', processStyleObjectToString(resolvedStyles.xAxis));
		if (properties.hideXAxisLine) xAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let xAxisGroup = chartGroup.select('.xAxisGroup');
		xAxisGroup.remove();
	}

	if (!properties.hideGrid && !properties.hideYAxis && yAxis) {
		let yAxisGroup = chartGroup.select('.yAxisGroup');
		if (yAxisGroup.node()) {
			yAxisGroup.remove();
		}
		chartGroup.append('g').attr('class', 'yAxisGroup');
		yAxisGroup = chartGroup.select('.yAxisGroup');

		let left = 0,
			top = 0;
		if (properties.xAxisStartPosition === 'top') {
			top = xAxisMaxDimensions.height;
		}

		if (properties.yAxisStartPosition === 'left') {
			left = yAxisMaxDimensions.width;
		} else if (properties.yAxisStartPosition === 'right') {
			left = chartWidth;
		} else if (properties.yAxisStartPosition === 'center') {
			left = chartWidth / 2;
		} else if (properties.yAxisStartPosition === 'x0') {
			left = xScale(0);
		} else if (properties.yAxisStartPosition === 'custom') {
			left =
				xScale(properties.yAxisStartCustomValue) ??
				xScale(parseFloat(properties.yAxisStartCustomValue ?? ''));
		}

		yAxisGroup.transition().duration(properties.animationTime).call(yAxis);
		yAxisGroup
			.selectAll('text')
			.attr('opacity', properties.yAxisHideLabels ? 0 : 1)
			.attr('style', processStyleObjectToString(resolvedStyles.yAxisLabel));
		yAxisGroup
			.attr('transform', `translate(${left}, ${top})`)
			.attr('font-size', 'inherit')
			.attr('font-family', 'inherit')
			.attr('style', processStyleObjectToString(resolvedStyles.yAxis));
		if (properties.hideYAxisLine) yAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let yAxisGroup = chartGroup.select('.yAxisGroup');
		yAxisGroup.remove();
	}
}

function makeAxis(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	svg: any,
	xScale: any,
	yScale: any,
) {
	let xAxis;

	if (properties.xAxisStartPosition === 'top') {
		xAxis = d3.axisTop(xScale);
	} else if (properties.xAxisStartPosition === 'center') {
		xAxis = d3.axisTop(xScale);
	} else if (
		properties.xAxisStartPosition === 'y0' ||
		properties.xAxisStartPosition === 'custom'
	) {
		xAxis = d3.axisBottom(xScale);
	} else if (properties.xAxisStartPosition === 'bottom') {
		xAxis = d3.axisBottom(xScale);
	}

	let yAxis;
	if (properties.yAxisStartPosition === 'right') {
		yAxis = d3.axisRight(yScale);
	} else if (properties.yAxisStartPosition === 'center') {
		yAxis = d3.axisLeft(yScale);
	} else if (
		properties.yAxisStartPosition === 'x0' ||
		properties.yAxisStartPosition === 'custom'
	) {
		yAxis = d3.axisRight(yScale);
	} else if (properties.yAxisStartPosition === 'left') {
		yAxis = d3.axisLeft(yScale);
	}
	if (properties.xAxisHideTicks) xAxis?.tickSize(0);
	if (properties.yAxisHideTicks) yAxis?.tickSize(0);

	let xAxisTickValues = [];

	if (chartData.xAxisType === 'ordinal') {
		const axis = chartData.axisInverted ? yAxis : xAxis;
		const scale = chartData.axisInverted ? yScale : xScale;
		const sizes = labelDimensions(scale.domain(), svg.select('.xAxisLabelSampler').node());
		const maxLabelSize = maxDimensions(sizes);
		const range = scale.range();

		const number = Math.floor(
			Math.abs(range[0] - range[1]) /
				(chartData.axisInverted ? maxLabelSize.height : maxLabelSize.width),
		);

		if (number < sizes.length) {
			const factor = Math.floor(sizes.length / number);
			axis?.tickValues(
				(xAxisTickValues = scale
					.domain()
					.filter(
						(_: any, index: number, arr: any[]) =>
							!(
								(properties.yAxisStartPosition === 'right'
									? arr.length - index
									: index) % factor
							),
					)),
			);
		} else {
			xAxisTickValues = scale.domain();
		}
	}

	let yAxisTickValues = [];
	if (chartData.yAxisType === 'ordinal') {
		const axis = chartData.axisInverted ? xAxis : yAxis;
		const scale = chartData.axisInverted ? xScale : yScale;
		const sizes = labelDimensions(scale.domain(), svg.select('.yAxisLabelSampler').node());
		const maxLabelSize = maxDimensions(sizes);
		const range = scale.range();

		const number = Math.floor(
			Math.abs(range[0] - range[1]) /
				(chartData.axisInverted ? maxLabelSize.width : maxLabelSize.height),
		);

		if (number < sizes.length) {
			const factor = Math.floor(sizes.length / number);
			axis?.tickValues(
				(yAxisTickValues = scale
					.domain()
					.filter(
						(_: any, index: number, arr: any[]) =>
							!(
								(properties.xAxisStartPosition === 'top'
									? arr.length - index
									: index) % factor
							),
					)),
			);
		} else {
			yAxisTickValues = scale.domain();
		}
	}

	return { xAxis, yAxis, xAxisTickValues, yAxisTickValues };
}

function makeScale(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	chartHeight: number,
	chartWidth: number,
) {
	let xScale, yScale;

	if (chartData.xAxisType === 'value') {
		let extent = d3.extent(chartData.xUniqueData);

		let min = extent[0];
		let max = extent[1];
		if (!isNullValue(properties.xAxisSuggestedMin) && properties.xAxisSuggestedMin! < min)
			min = properties.xAxisSuggestedMin!;
		if (!isNullValue(properties.xAxisSuggestedMax) && properties.xAxisSuggestedMax! > max)
			max = properties.xAxisSuggestedMax!;
		if (!isNullValue(properties.xAxisMin)) min = properties.xAxisMin!;
		if (!isNullValue(properties.xAxisMax)) max = properties.xAxisMax!;
		extent = [min, max];

		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleLinear()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'ordinal') {
		let data = [...chartData.xUniqueData];
		if (properties.xAxisLabelsSort != 'none') {
			let sortLogic;
			if (chartData.actualXAxisType === 'value')
				sortLogic =
					properties.xAxisLabelsSort === 'ascending'
						? (a: number, b: number) => a - b
						: (a: number, b: number) => b - a;
			else
				sortLogic =
					properties.xAxisLabelsSort === 'ascending'
						? (a: any, b: any) => (a.localeCompare ? a.localeCompare(b) : a - b)
						: (a: any, b: any) => (b.localeCompare ? b.localeCompare(a) : b - a);

			data = data.sort(sortLogic);
		}
		if (properties.xAxisReverse) data = data.reverse();
		if (
			(chartData.hasBar && !chartData.axisInverted) ||
			(chartData.hasHorizontalBar && chartData.axisInverted)
		) {
			xScale = d3
				.scaleBand()
				.domain(data)
				.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
		} else {
			let size = chartData.axisInverted ? chartHeight : chartWidth;
			const gap = size / (data.length + 2);
			xScale = d3
				.scalePoint()
				.domain(data)
				.range([gap, size - gap]);
		}
	} else if (chartData.xAxisType === 'log') {
		let extent = d3.extent(chartData.xUniqueData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleLog()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'time') {
		let extent = d3.extent(chartData.xUniqueData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleTime()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	}

	const yUniqueData = chartData.yUniqueData;

	if (chartData.yAxisType === 'value') {
		let extent = d3.extent(yUniqueData);

		let min = extent[0];
		let max = extent[1];
		if (!isNullValue(properties.yAxisSuggestedMin) && properties.yAxisSuggestedMin! < min)
			min = properties.yAxisSuggestedMin!;
		if (!isNullValue(properties.yAxisSuggestedMax) && properties.yAxisSuggestedMax! > max)
			max = properties.yAxisSuggestedMax!;
		if (!isNullValue(properties.yAxisMin)) min = properties.yAxisMin!;
		if (!isNullValue(properties.yAxisMax)) max = properties.yAxisMax!;
		extent = [min, max];

		if (properties.yAxisReverse) extent = extent.reverse();
		yScale = d3
			.scaleLinear()
			.domain(extent)
			.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	} else if (chartData.yAxisType === 'ordinal') {
		let data = [...yUniqueData];
		if (properties.yAxisLabelsSort != 'none') {
			let sortLogic;
			if (chartData.actualYAxisType === 'value')
				sortLogic =
					properties.yAxisLabelsSort === 'ascending'
						? (a: number, b: number) => a - b
						: (a: number, b: number) => b - a;
			else
				sortLogic =
					properties.yAxisLabelsSort === 'ascending'
						? (a: any, b: any) => (a.localeCompare ? a.localeCompare(b) : a - b)
						: (a: any, b: any) => (b.localeCompare ? b.localeCompare(a) : b - a);

			data = data.sort(sortLogic);
		}
		if (properties.yAxisReverse) data = [...data].reverse();

		if (
			(chartData.hasBar && chartData.axisInverted) ||
			(chartData.hasHorizontalBar && !chartData.axisInverted)
		) {
			yScale = d3
				.scaleBand()
				.domain(data)
				.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
		} else {
			let size = chartData.axisInverted ? chartWidth : chartHeight;
			const gap = size / (data.length + 2);
			yScale = d3
				.scalePoint()
				.domain(data)
				.range([gap, size - gap]);
		}
	} else if (chartData.yAxisType === 'log') {
		let extent = d3.extent(yUniqueData);
		if (properties.yAxisReverse) extent = extent.reverse();
		yScale = d3
			.scaleLog()
			.domain(extent)
			.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	}

	if (chartData.axisInverted) {
		[xScale, yScale] = [yScale, xScale];
	}

	if (xScale.nice) xScale = xScale.nice();
	if (yScale.nice) yScale = yScale.nice();

	return { xScale, yScale };
}

function computeChartDimensions(
	xAxisData: any[],
	yFlatData: any[],
	properties: ChartProperties,
	chartData: ChartData,
	svg: any,
	chartDimension: Dimension,
) {
	if (properties.hideGrid) {
		return {
			yAxisMaxDimensions: { width: 0, height: 0 },
			xAxisMaxDimensions: { width: 0, height: 0 },
			chartDimension,
		};
	}

	const uniqueXAxisData = Array.from(new Set(xAxisData));
	const uniqueYAxisData = Array.from(new Set(yFlatData));

	let xAxisLabelsDimensions = labelDimensions(
		uniqueXAxisData,
		svg.select('.xAxisLabelSampler').node(),
	);
	let yAxisLabelsDimensions = labelDimensions(
		uniqueYAxisData,
		svg.select('.yAxisLabelSampler').node(),
	);

	let xAxisMaxDimensions = maxDimensions(xAxisLabelsDimensions);
	let yAxisMaxDimensions = maxDimensions(yAxisLabelsDimensions);

	if (chartData.axisInverted) {
		[xAxisMaxDimensions, yAxisMaxDimensions] = [yAxisMaxDimensions, xAxisMaxDimensions];
	}

	let chartWidth = chartDimension.width;
	let chartHeight = chartDimension.height;
	if (!properties.hideXAxis) {
		if (properties.xAxisStartPosition === 'top' || properties.xAxisStartPosition === 'bottom') {
			chartHeight -= xAxisMaxDimensions.height;
		}
		if (!properties.xAxisHideTicks) {
			chartHeight -= 10;
			xAxisMaxDimensions.height += 15;
		} else {
			chartHeight -= 5;
			xAxisMaxDimensions.height += 10;
		}
	}

	if (!properties.hideYAxis) {
		if (properties.yAxisStartPosition === 'left' || properties.yAxisStartPosition === 'right') {
			chartWidth -= yAxisMaxDimensions.width;
		}
		if (!properties.yAxisHideTicks) {
			chartWidth -= 20;
			yAxisMaxDimensions.width += 15;
		} else {
			chartWidth -= 10;
			yAxisMaxDimensions.width += 10;
		}
	}

	if (chartData.xAxisTitle) {
		const node = svg.select('.xAxisTitle').node();
		const [{ width, height }] = labelDimensions([chartData.xAxisTitle], node);
		let y = 0;
		if (properties.xAxisStartPosition !== 'top') {
			y = chartDimension.height + height - CHART_PADDING;
		}
		const x = (chartWidth - width) / 2;
		svg.select('.xAxisTitle').attr('transform', `translate(${x}, ${y})`);
		chartHeight -= height;
	}

	if (chartData.yAxisTitle) {
		const node = svg.select('.yAxisTitle').node();
		svg.select('.yAxisTitle').attr('transform', '');
		const [{ width, height }] = labelDimensions([chartData.yAxisTitle], node);

		let x = 0;
		if (properties.yAxisStartPosition !== 'left') {
			x = chartDimension.width + height - CHART_PADDING;
		}
		const y = (chartDimension.height - width) / 2;
		svg.select('.yAxisTitle').attr('transform', `translate(${x}, ${y}) rotate(-90)`);
		chartWidth -= height;
	}

	return {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	};
}
