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

export enum DataSetStyle {
	Line = 'line',
	DottedLine = 'dottedLine',
	DashedLine = 'dashedLine',
	LongDashedLine = 'longDashedLine',
	SteppedLineBefore = 'steppedLineBefore',
	SteppedLineMiddle = 'steppedLineMiddle',
	SteppedLineAfter = 'steppedLineAfter',
	SmoothLine = 'smoothLine',
	SmoothDottedLine = 'smoothDottedLine',
	SmoothDashedLine = 'smoothDashedLine',
	SmoothLongDashedLine = 'smoothLongDashedLine',
	Lollipop = 'lollipop',

	Bar = 'bar',
	horizontalBar = 'horizontalBar',

	Pie = 'pie',
	Doughnut = 'doughnut',
	PolarArea = 'polarArea',
	Radar = 'radar',

	Dot = 'dot',

	Waffle = 'waffle',
}

// Properties of the chart component

export type AxisType = 'ordinal' | 'value' | 'log';
export interface ChartProperties {
	hideGrid: boolean;
	colorScheme: string;
	chartType: 'regular' | 'radial' | 'radar' | 'dot' | 'waffle';
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
	xAxisDataPath?: string; // Done.
	hideXAxis?: boolean;
	hideXAxisLine: boolean;
	hideXLines?: boolean;
	xAxisTitle?: string;
	yAxisType: AxisType | 'derived'; // Done.
	yAxisStartPosition: 'left' | 'right' | 'center' | 'x0' | 'custom';
	yAxisStartCustomValue?: string;
	dataSetLabels?: string[]; //Done.
	yAxisLabels?: string[]; // Done.
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
	animationTimingFunction: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
	preNormalization: 'none' | '100' | '1' | '-100' | '-1';
	tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
	tooltipData: 'allDataSets' | 'currentDataSet';
	tooltipTrigger: 'hoverOnAxis' | 'hoverOnData' | 'clickOnData';
	disableLegendInteraction?: boolean;
	radarType: 'polygon' | 'circle';
	radialType: 'circle' | 'line';
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

export interface ChartData {
	yAxisData: any[][];
	xAxisData: any[];
	xAxisType: AxisType | 'time';
	yAxisType: AxisType;
	dataColors: RepetetiveArray<string>[];
	fillOpacity: RepetetiveArray<number>[];
	strokeOpacity: RepetetiveArray<number>[];
	pointType: RepetetiveArray<PointType>[];
	pointSize: RepetetiveArray<number>[];
	dataSetStyles: RepetetiveArray<DataSetStyle>[];
	axisInverted: boolean;
	hasBar: boolean;
}

export function makeChartDataFromProperties(
	properties: ChartProperties,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
): ChartData {
	const hasBar =
		properties.chartType === 'regular' &&
		(properties.yAxisDataSetStyle?.some(
			style => style === 'bar' || style === 'horizontalBar',
		) ??
			true);

	let xAxisData = makeXAxisData(properties, locationHistory, pageExtractor);
	let yAxisData = makeYAxisData(
		properties,
		locationHistory,
		pageExtractor,
		hasBar,
		hiddenDataSets,
	);

	const xAxisType: AxisType | 'time' =
		properties.xAxisType === 'time' ? 'time' : findDerivedType(xAxisData, properties.xAxisType);
	const yAxisType = findDerivedType(yAxisData, properties.yAxisType);

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

	const dataColors = getPathBasedValues(
		properties.data,
		dataSetColors,
		properties.dataColorsPath,
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

	const dataSetStyles = getPathBasedValues(
		properties.data,
		properties.yAxisDataSetStyle ?? [],
		[],
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	return {
		xAxisData,
		yAxisData,
		xAxisType,
		yAxisType,
		dataColors,
		fillOpacity,
		strokeOpacity,
		pointType,
		pointSize,
		dataSetStyles,
		axisInverted: !!properties.invertAxis && properties.stackedAxis !== 'x',
		hasBar,
	};
}

function makeYAxisData(
	properties: ChartProperties,
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
	hasBar: boolean,
	hiddenDataSets: Set<number>,
) {
	if (properties.yAxisLabels) return [properties.yAxisLabels];

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
			if (!yAxisData[i]?.length) yAxisData[i] = rangeData;
			else
				yAxisData[i] = yAxisData[i].map((val: any, index: number) => {
					if (isNullValue(val)) val = [];
					else if (!Array.isArray(val)) val = [val];

					if (isNullValue(rangeData[index])) return val;
					if (Array.isArray(rangeData[index])) return val.concat(rangeData[index]);
					return val.concat(rangeData[index]);
				});
		}
	}

	return yAxisData;
}

function makeXAxisData(
	properties: ChartProperties,

	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
) {
	let xAxisData: any[] = [];

	if (properties.xAxisLabels) xAxisData = properties.xAxisLabels;
	else if (Array.isArray(properties.data) && typeof properties.xAxisDataPath == 'string') {
		xAxisData = properties.data.map(
			simpleExtractor(properties.xAxisDataPath, locationHistory, pageExtractor),
		);
	} else if (properties.data && typeof properties.data === 'object') {
		if (typeof properties.xAxisDataPath == 'string') {
			xAxisData = Object.values(properties.data).map(
				simpleExtractor(properties.xAxisDataPath, locationHistory, pageExtractor),
			);
		} else xAxisData = Object.keys(properties.data);
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
