import { isNullValue } from '@fincity/kirun-js';
import { processStyleObjectToString } from '../../../util/styleProcessor';
import { ChartData, ChartProperties } from '../types/common';

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

export function renderBars(params: {
	chart: any;
	barIndexes: number[];
	chartData: ChartData;
	d3: any;
	properties: ChartProperties;
	xScale: any;
	yScale: any;
	chartWidth: number;
	chartHeight: number;
	resolvedStyles: any;
	focusedDataSet: number | undefined;
	onFocusDataSet: (index: number | undefined) => void;
}) {
	const {
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
		onFocusDataSet,
	} = params;

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
	} else if (chartData.hasBar) {
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
		.attr('x', function (d: any) {
			const value = xFunction(d);
			if (d3.select(this)?.attr('x') == value) return value;
			if (chartData.hasBar) return value;
			return axisPosition;
		})
		.attr('y', function (d: any) {
			const value = yFunction(d);
			if (d3.select(this)?.attr('y') == value) return value;
			if (chartData.hasBar) {
				if (properties.xAxisStartPosition === 'top') return value;
				return axisPosition;
			}
			return value;
		})
		.attr('width', function (d: any) {
			const value = widthFunction(d);
			if (d3.select(this)?.attr('width') == value) return value;
			if (chartData.hasBar) return value;
			return 0;
		})
		.attr('height', function (d: any) {
			const value = heightFunction(d);
			if (d3.select(this)?.attr('height') == value) return value;
			if (chartData.hasBar) return 0;
			return value;
		})
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
