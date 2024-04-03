import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { PageStoreExtractor, getDataFromPath } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import RepetetiveArray from '../../../util/RepetetiveArray';

export interface Dimension {
	x?: number;
	y?: number;
	width: number;
	height: number;
}

export enum PointType {
	Circle = 'circle',
	FilledCircle = 'filledCircle',
	Cross = 'cross',
	X = 'x',
	Dash = 'dash',
	Line = 'line',
	VerticalLine = 'verticalLine',
	Square = 'square',
	FilledSquare = 'filledSquare',
	SquareRounded = 'squareRounded',
	FilledSquareRounded = 'filledSquareRounded',
	SquareRot = 'squareRot',
	FilledSquareRot = 'filledSquareRot',
	Star = 'star',
	FilledStar = 'filledStar',
	Triangle = 'triangle',
	FilledTriangle = 'filledTriangle',
	TriangleRot = 'triangleRot',
	FilledTriangleRot = 'filledTriangleRot',
	None = 'none',
}

export enum ChartType {
	Regular = 'regular',
	Radial = 'radial',
	Radar = 'radar',
	Waffle = 'waffle',
}

export enum DataSetStyle {
	Line = 'line',
	SmoothLine = 'smoothLine',
	SteppedLineBefore = 'steppedLineBefore',
	SteppedLineAfter = 'steppedLineAfter',
	SteppedLineMiddle = 'steppedLineMiddle',
	Bar = 'bar',
	HorizontalBar = 'horizontalBar',
	Lollipop = 'lollipop',
	Dot = 'dot',

	Pie = 'pie',

	Doughnut = 'doughnut',

	PolarArea = 'polarArea',

	Radar = 'radar',

	Waffle = 'waffle',
}

export const VALID_COMBINATIONS = new Map([
	[
		ChartType.Regular,
		new Set([
			DataSetStyle.Line,
			DataSetStyle.SmoothLine,
			DataSetStyle.SteppedLineBefore,
			DataSetStyle.SteppedLineAfter,
			DataSetStyle.SteppedLineMiddle,
			DataSetStyle.Bar,
			DataSetStyle.HorizontalBar,
			DataSetStyle.Lollipop,
			DataSetStyle.Dot,
		]),
	],
	[ChartType.Radial, new Set([DataSetStyle.Pie, DataSetStyle.Doughnut, DataSetStyle.PolarArea])],
	[ChartType.Radar, new Set([DataSetStyle.Radar])],
	[ChartType.Waffle, new Set([DataSetStyle.Waffle])],
]);

// Properties of the chart component

export type AxisType = 'ordinal' | 'value' | 'log';
export interface ChartProperties {
	hideGrid: boolean;
	colorScheme: string;
	chartType: ChartType;
	data: any; // Done.

	dataSetColors: string[]; // Done.
	dataColorsPath?: string[]; // Done.
	dataSetFillOpacity?: number[]; // Done.
	dataFillOpacityPath?: string[]; // Done.
	dataSetStrokeOpacity?: number[]; // Done.
	dataStrokeOpacityPath?: string[]; // Done.
	dataSetPointType: PointType[]; // Done.
	dataPointTypePath?: string[]; // Done.
	dataSetPointSize?: number[]; // Done.
	dataPointSizePath?: string[]; // Done.
	dataSetStrokeColors?: string[]; // Done.
	dataStrokeColorsPath?: string[]; // Done.

	xAxisType: AxisType | 'time' | 'derived'; // Done only time is not done yet
	xAxisStartPosition: 'bottom' | 'top' | 'center' | 'y0' | 'custom';
	xAxisStartCustomValue?: string;
	xAxisLabels?: string[]; // Done.
	xAxisLabelsSort: 'none' | 'ascending' | 'descending'; // Done.
	xAxisMin?: number; // Done.
	xAxisSuggestedMin?: number; // Done.
	xAxisMax?: number; // Done.
	xAxisSuggestedMax?: number; // Done.
	xAxisReverse?: boolean;
	xAxisHideTicks?: boolean;
	xAxisHideLabels?: boolean;
	xAxisDataSetPath?: string[]; // Done.
	hideXAxis?: boolean;
	hideXAxisLine: boolean;
	hideXLines?: boolean;
	xAxisTitle?: string;
	yAxisType: AxisType | 'derived'; // Done.
	yAxisStartPosition: 'left' | 'right' | 'center' | 'x0' | 'custom';
	yAxisStartCustomValue?: string;
	dataSetLabels?: string[]; //Done.
	yAxisLabelsSort: 'none' | 'ascending' | 'descending'; // Done.
	yAxisMin?: number; // Done.
	yAxisSuggestedMin?: number; // Done.
	yAxisMax?: number; // Done.
	yAxisSuggestedMax?: number; // Done.
	yAxisReverse?: boolean;
	yAxisHideTicks?: boolean;
	yAxisHideLabels?: boolean;
	yAxisDataSetPath?: string[]; // Done.
	yAxisRangeDataSetPath?: string[]; // Done.
	yAxisDataSetStyle?: DataSetStyle[];
	hideYAxis?: boolean;
	hideYAxisLine: boolean;
	hideYLines?: boolean;
	yAxisTitle?: string;
	stackedAxis: 'none' | 'x' | 'y' | 'z';
	legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
	invertAxis?: boolean;
	animationTime: number;
	animationTimingFunction:
		| 'easeLinear'
		| 'easePoly'
		| 'easeQuad'
		| 'easeCubic'
		| 'easeSin'
		| 'easeExp'
		| 'easeCircle'
		| 'easeElastic'
		| 'easeBack'
		| 'easeBounce';
	preNormalization: 'none' | '100' | '1' | '-100' | '-1';
	tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
	tooltipData: 'allDataSets' | 'currentDataSet';
	tooltipTrigger: 'hoverOnAxis' | 'hoverOnData' | 'clickOnData';
	disableLegendInteraction?: boolean;
	radarType: 'polygon' | 'circle';
	radialType: 'circle' | 'line';

	padding: number;
	focusDataSetOnHover: boolean;
}

export interface MakeChartProps {
	properties: ChartProperties;
	chartData: ChartData;
	svgRef: SVGElement;
	resolvedStyles: any;
	chartDimension: Dimension;
	hiddenDataSets: Set<number>;
	focusedDataSet: number | undefined;
	onFocusDataSet: (index: number | undefined) => void;
}

class DataValueExtractor extends TokenValueExtractor {
	private data: any;

	public setData(newData: any): void {
		this.data = newData;
	}

	public getPrefix(): string {
		return 'Data.';
	}

	protected getValueInternal(token: string): any {
		if (token === 'Data') return this.data;

		return this.retrieveElementFrom(
			token,
			token.split(TokenValueExtractor.REGEX_DOT),
			1,
			this.data,
		);
	}

	public getStore(): any {
		return this.data;
	}
}

const dvExtractor = new DataValueExtractor();

function simpleExtractor(
	path: string,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
) {
	if (path == 'Data') return (data: any) => data;
	return (data: any) => {
		if (isNullValue(data)) return data;
		dvExtractor.setData(data);
		return getDataFromPath(path, locationHistory, pageExtractor, dvExtractor);
	};
}

const colorScheme: Map<string, string[]> = new Map();

export interface DataSetData {
	data: { x: any; y: any }[];
	isHidden: boolean;
	dataColors: RepetetiveArray<string>;
	fillOpacity: RepetetiveArray<number>;
	strokeOpacity: RepetetiveArray<number>;
	pointType: RepetetiveArray<PointType>;
	pointSize: RepetetiveArray<number>;
	dataSetStyle: DataSetStyle;
	dataStrokeColors: RepetetiveArray<string>;
}
export interface ChartData {
	dataSetData: DataSetData[];
	xUniqueData: any[];
	yUniqueData: any[];
	xAxisType: AxisType | 'time';
	yAxisType: AxisType;
	axisInverted: boolean;
	hasBar: boolean;
	hasHorizontalBar: boolean;
	xAxisTitle?: string;
	yAxisTitle?: string;
	actualXAxisType: AxisType | 'time';
	actualYAxisType: AxisType;
}

export function makeChartDataFromProperties(
	properties: ChartProperties,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
): ChartData {
	let yAxisData = makeYAxisData(properties, locationHistory, pageExtractor, hiddenDataSets);
	let xAxisData = makeXAxisData(
		yAxisData.length,
		properties,
		locationHistory,
		pageExtractor,
		hiddenDataSets,
	);

	const axisInverted = !!properties.invertAxis;

	const xUniqueData = xAxisData?.length ? Array.from(new Set(xAxisData.flat(Infinity))) : [];
	let yUniqueData = yAxisData?.length ? Array.from(new Set(yAxisData.flat(Infinity))) : [];

	let xAxisType: AxisType | 'time' =
		properties.xAxisType === 'time'
			? 'time'
			: findDerivedType(xUniqueData, properties.xAxisType);
	let yAxisType = findDerivedType(yUniqueData, properties.yAxisType);

	let dataSetColors: string[] = [];
	if (!properties.dataSetColors) {
		if (colorScheme.has(properties.colorScheme)) {
			dataSetColors = colorScheme.get(properties.colorScheme)!;
		} else {
			const cscheme =
				properties.colorScheme[1].toUpperCase() + properties.colorScheme.slice(2);
			for (let i = 1; i <= 12; i++)
				dataSetColors.push(getDataFromPath(`Theme.chart${cscheme}DataColor${i}`, []));
			colorScheme.set(properties.colorScheme, dataSetColors);
		}
	}

	let dataColors: RepetetiveArray<string>[];
	let dataStrokeColors: RepetetiveArray<string>[];

	const givenColors = !!properties.dataSetColors?.length;
	const givenStrokeColors = !!properties.dataSetStrokeColors?.length;

	dataColors = getPathBasedValues(
		properties.data,
		properties.dataSetColors ?? properties.dataSetStrokeColors ?? dataSetColors,
		properties.dataColorsPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);
	dataStrokeColors = getPathBasedValues(
		properties.data,
		properties.dataSetStrokeColors ?? properties.dataSetColors ?? dataSetColors,
		properties.dataStrokeColorsPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const fillOpacity = getPathBasedValues(
		properties.data,
		properties.dataSetFillOpacity ?? [],
		properties.dataFillOpacityPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const strokeOpacity = getPathBasedValues(
		properties.data,
		properties.dataSetStrokeOpacity ?? [],
		properties.dataStrokeOpacityPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const pointType = getPathBasedValues(
		properties.data,
		properties.dataSetPointType,
		properties.dataPointTypePath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const pointSize = getPathBasedValues(
		properties.data,
		properties.dataSetPointSize ?? [],
		properties.dataPointSizePath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const dataSetStylesArray = properties.yAxisDataSetStyle?.length
		? [...properties.yAxisDataSetStyle]
		: (['bar'] as DataSetStyle[]);

	let dataSetStyles: RepetetiveArray<DataSetStyle> = new RepetetiveArray<DataSetStyle>();
	if (dataSetStylesArray.length != yAxisData.length) {
		const filler = new RepetetiveArray<DataSetStyle>();
		for (let i = 0; i < yAxisData.length; i++)
			filler.push(dataSetStylesArray[i % dataSetStylesArray.length]);

		dataSetStyles = RepetetiveArray.from(filler);
	} else {
		dataSetStyles = RepetetiveArray.from(dataSetStylesArray);
	}

	const dataSetData: DataSetData[] = [];

	for (let i = 0; i < yAxisData.length; i++) {
		const data = [];
		for (let j = 0; j < yAxisData[i].length; j++) {
			data.push({ x: xAxisData?.[i]?.[j], y: yAxisData[i][j] });
		}
		dataSetData.push({
			data,
			isHidden: hiddenDataSets.has(i),
			fillOpacity: fillOpacity[i],
			strokeOpacity: strokeOpacity[i],
			pointType: pointType[i],
			pointSize: pointSize[i],
			dataSetStyle: dataSetStyles.get(i),
			dataColors: dataColors[i],
			dataStrokeColors: dataStrokeColors[i],
		});
	}

	const hasBar = dataSetStyles.some(style => style === 'bar');
	const hasHorizontalBar = dataSetStyles.some(style => style === 'horizontalBar');

	const actualXAxisType = xAxisType;
	const actualYAxisType = yAxisType;

	if ((hasBar && !axisInverted) || (hasHorizontalBar && axisInverted)) xAxisType = 'ordinal';
	else if ((hasHorizontalBar && !axisInverted) || (hasBar && axisInverted)) yAxisType = 'ordinal';

	if (
		(hasBar && properties.stackedAxis === 'y') ||
		(hasHorizontalBar && properties.stackedAxis === 'x')
	) {
		yUniqueData = makeStackedYAxisStackedData(dataSetData, yUniqueData, hiddenDataSets);
	}

	return {
		dataSetData,
		xAxisType,
		yAxisType,
		actualXAxisType,
		actualYAxisType,
		axisInverted,
		hasBar,
		hasHorizontalBar,
		xAxisTitle: axisInverted ? properties.yAxisTitle : properties.xAxisTitle,
		yAxisTitle: axisInverted ? properties.xAxisTitle : properties.yAxisTitle,
		xUniqueData,
		yUniqueData,
	};
}

function makeStackedYAxisStackedData(
	dataSetData: DataSetData[],
	yUniqueData: any[],
	hiddenDataSets: Set<number>,
) {
	let data = new Set();
	const max = dataSetData.find(e => Array.isArray(e.data) && e.data.length)?.data.length ?? 0;
	for (let i = 0; i < max; i++) {
		let positiveSum = 0;
		let negativeSum = 0;

		for (let j = 0; j < dataSetData.length; j++) {
			if (hiddenDataSets.has(j)) continue;
			let value = dataSetData[j].data[i].y;
			if (Array.isArray(value)) {
				for (let k = 0; k < value.length; k += 2) {
					let current = value[k] - value[k + 1];
					if (current < 0) negativeSum += current;
					else positiveSum += current;
				}
			} else {
				if (value > 0) positiveSum += value;
				else negativeSum += value;
			}
		}

		data.add(positiveSum);
		data.add(negativeSum);
	}
	yUniqueData = Array.from(data);

	return yUniqueData;
}

function makeYAxisData(
	properties: ChartProperties,
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
) {
	let yAxisData: any[][] | undefined = [];
	if (properties.yAxisDataSetPath) {
		yAxisData = (
			Array.isArray(properties.yAxisDataSetPath)
				? properties.yAxisDataSetPath
				: [properties.yAxisDataSetPath]
		).map((path: string, index: number) => {
			if (hiddenDataSets.has(index)) return [];
			if (Array.isArray(properties.data)) {
				return properties.data.map(simpleExtractor(path, locationHistory, pageExtractor));
			} else if (properties.data && typeof properties.data === 'object') {
				return Object.values(properties.data).map(
					simpleExtractor(path, locationHistory, pageExtractor),
				);
			}
			return [];
		});
	}

	if (properties.yAxisRangeDataSetPath) {
		let i = -1;
		for (let path of Array.isArray(properties.yAxisRangeDataSetPath)
			? properties.yAxisRangeDataSetPath
			: [properties.yAxisRangeDataSetPath]) {
			let rangeData: any = undefined;
			if (Array.isArray(properties.data)) {
				rangeData = properties.data.map(
					simpleExtractor(path, locationHistory, pageExtractor),
				);
			} else if (properties.data && typeof properties.data === 'object') {
				rangeData = Object.values(properties.data).map(
					simpleExtractor(path, locationHistory, pageExtractor),
				);
			}
			i++;
			if (isNullValue(rangeData) || hiddenDataSets.has(i)) continue;
			if (!yAxisData[i]?.length) {
				if (Array.isArray(rangeData))
					yAxisData[i] = rangeData.map(e => e?.flat(Infinity) ?? e);
				else yAxisData[i] = [rangeData];
			} else
				yAxisData[i] = yAxisData[i].map((val: any, index: number) => {
					if (isNullValue(val)) val = [];
					else if (!Array.isArray(val)) val = [val];

					if (isNullValue(rangeData[index])) return val;
					if (Array.isArray(rangeData[index]))
						return val.concat(rangeData[index].flat(Infinity));
					return val.concat(rangeData[index]);
				});
		}
	}

	return yAxisData;
}

function makeXAxisData(
	dataSetsCount: number | undefined,
	properties: ChartProperties,
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
) {
	let xAxisData: any[][] | undefined = [];
	if (properties.xAxisLabels) {
		return Array(dataSetsCount).fill(properties.xAxisLabels);
	}
	if (properties.xAxisDataSetPath) {
		xAxisData = (
			Array.isArray(properties.xAxisDataSetPath)
				? properties.xAxisDataSetPath
				: [properties.xAxisDataSetPath]
		).map((path: string, index: number) => {
			if (hiddenDataSets.has(index)) return [];
			if (Array.isArray(properties.data)) {
				return properties.data.map(simpleExtractor(path, locationHistory, pageExtractor));
			} else if (properties.data && typeof properties.data === 'object') {
				return Object.values(properties.data).map(
					simpleExtractor(path, locationHistory, pageExtractor),
				);
			}
			return [];
		});
	}

	return xAxisData;
}

function coefficientOfVariation(data: any[]) {
	const n = data.length;
	const mean = data.reduce((acc, val) => acc + val, 0) / n;
	const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
	const standardDeviation = Math.sqrt(variance);
	return standardDeviation / mean;
}

function findDerivedType(data: any[], axisType: AxisType | 'derived'): AxisType {
	if (axisType != 'derived') return axisType;

	if (!data?.length) return 'ordinal';

	let retAxisType =
		data?.reduce((acc, curr, index) => {
			if (index === 0) return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
			else if (acc === 'ordinal') return acc;
			else return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
		}) ?? 'ordinal';

	if (retAxisType === 'value') {
		if (coefficientOfVariation(data) > 0.95) retAxisType = 'log';
	}

	return retAxisType;
}

function getPathBasedValues<T>(
	data: any,
	set: T[],
	dataPaths: any[] | undefined,
	numberOfDataSets: number,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): RepetetiveArray<T>[] {
	if (!data) return [];
	if (!Array.isArray(data) && typeof data !== 'object') return [];
	const dataList = Array.isArray(data) ? data : Object.values(data);

	if (!dataPaths) {
		if (!set?.length) return [];
		const result: RepetetiveArray<any>[] = [];
		for (let i = 0; i < numberOfDataSets; i++) {
			const temp = new RepetetiveArray<any>();
			for (const _ of dataList) {
				temp.push(set[i % set.length]);
			}
			result.push(temp);
		}
		return result;
	}

	const result: RepetetiveArray<any>[] = [];

	let dataSetNum = 0;

	for (let path of dataPaths) {
		const temp = new RepetetiveArray<any>();
		const extractor = simpleExtractor(path, locationHistory, pageExtractor);

		for (const element of dataList) {
			let value = extractor(element);
			if (isNullValue(value) && set?.length) temp.push(set[dataSetNum % set.length]);
			else temp.push(value);
		}

		result.push(temp);
		dataSetNum++;
	}

	if (!result.length) return [];

	const filler: RepetetiveArray<any>[] = [];
	for (let i = 0; i < numberOfDataSets - result.length; i++) {
		filler.push(result[i % result.length]);
	}

	return [...result, ...filler];
}

export function labelDimensions(data: any[], labelElement: any): Dimension[] {
	const dimensions = [];
	for (const element of data) {
		labelElement.innerHTML = element;
		const rect = labelElement.getBoundingClientRect();
		dimensions.push({ width: rect.width, height: rect.height });
	}

	return dimensions;
}

export function maxDimensions(dimensions: Dimension[]): Dimension {
	return dimensions.reduce(
		(acc, curr) => {
			return {
				width: Math.max(acc.width, curr.width),
				height: Math.max(acc.height, curr.height),
			};
		},
		{ width: 0, height: 0 },
	);
}
