import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { PageStoreExtractor, getDataFromPath } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import RepetetiveArray from '../../../util/RepetetiveArray';

export interface Dimension {
	x?: number;
	y?: number;
	from?: {
		x: number;
		y: number;
	};
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
	SteppedLine = 'steppedLine',
	SmoothLine = 'smoothLine',
	SmoothDottedLine = 'smoothDottedLine',
	SmoothDashedLine = 'smoothDashedLine',
	SmoothLongDashedLine = 'smoothLongDashedLine',
	Lollipop = 'lollipop',

	Bar = 'bar',
	RoundedBar = 'roundedBar',

	Pie = 'pie',
	Doughnut = 'doughnut',
	PolarArea = 'polarArea',
	Radar = 'radar',

	Dot = 'dot',

	Waffle = 'waffle',
}

// Properties of the chart component
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

	xAxisType: 'ordinal' | 'value' | 'time' | 'log' | 'derived'; // Done only time is not done yet
	xAxisStartPosition: 'bottom' | 'top' | 'center';
	xAxisLabels?: string[]; // Done.
	xAxisLabelsSort?: boolean; // Done.
	xAxisMin?: number; // Done.
	xAxisSuggestedMin?: number; // Done.
	xAxisMax?: number; // Done.
	xAxisSuggestedMax?: number; // Done.
	xAxisReverse?: boolean;
	xAxisHideTicks?: boolean;
	xAxisHideLabels?: boolean;
	xAxisDataPath?: string; // Done.
	hideXAxis?: boolean;
	xAxisTitle?: string;
	yAxisType: 'ordinal' | 'value' | 'log' | 'derived'; // Done.
	yAxisStartPosition: 'left' | 'right' | 'center';
	dataSetLabels?: string[]; //Done.
	yAxisLabels?: string[]; // Done.
	yAxisLabelsSort?: boolean; // Done.
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
	yAxisTitle?: string;
	stackedAxis: 'none' | 'x' | 'y' | 'z';
	legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';

	invertAxis?: boolean;
	animationTime?: number;
	animationEasing: 'linear';
	preNormalization: 'none' | '100' | '1' | '-100' | '-1';
	tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
	tooltipData: 'allDataSets' | 'currentDataSet';
	tooltipTrigger: 'hoverOnAxis' | 'hoverOnData' | 'clickOnData';
	disableLegendInteraction?: boolean;
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
	xAxisLabels: string[];
	yAxisLabels: string[];
	yAxisData: any[][];
	xAxisData: any[];
	xAxisType: 'ordinal' | 'value' | 'time' | 'log';
	yAxisType: 'ordinal' | 'value' | 'log';
	xAxisMin?: number;
	xAxisMax?: number;
	yAxisMin?: number;
	yAxisMax?: number;
	dataColors: RepetetiveArray<any>[];
	fillOpacity: RepetetiveArray<any>[];
	strokeOpacity: RepetetiveArray<any>[];
	pointType: RepetetiveArray<any>[];
	pointSize: RepetetiveArray<any>[];
	dataSetStyles: RepetetiveArray<any>[];
}

export function makeChartDataFromProperties(
	properties: ChartProperties,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): ChartData {
	let xAxisLabels: string[] = [];
	let yAxisLabels: string[] = [];
	let yAxisData: any[][] = [];
	let xAxisData: any[] = [];
	let xAxisType: 'ordinal' | 'value' | 'time' | 'log';
	let yAxisType: 'ordinal' | 'value' | 'log';
	let yAxisMin: number | undefined;
	let yAxisMax: number | undefined;
	let xAxisMin: number | undefined;
	let xAxisMax: number | undefined;

	if (properties.xAxisLabels) xAxisLabels = properties.xAxisLabels;
	else {
		if (Array.isArray(properties.data) && typeof properties.xAxisDataPath == 'string') {
			xAxisLabels = properties.data.map(
				simpleExtractor(properties.xAxisDataPath!, locationHistory, pageExtractor),
			);
		} else if (properties.data && typeof properties.data === 'object') {
			if (typeof properties.xAxisDataPath == 'string') {
				xAxisLabels = Object.values(properties.data).map(
					simpleExtractor(properties.xAxisDataPath!, locationHistory, pageExtractor),
				);
			} else xAxisLabels = Object.keys(properties.data);
		}
	}
	xAxisData = [...xAxisLabels];

	if (properties.xAxisLabelsSort) {
		xAxisLabels = [...xAxisLabels];
		xAxisLabels.sort();
	}

	if (properties.xAxisType === 'time') {
		// need to process time differently.

		xAxisType = 'time';
		yAxisType = 'value';
	} else {
		if (properties.yAxisDataSetPath) {
			yAxisData = (
				Array.isArray(properties.yAxisDataSetPath)
					? properties.yAxisDataSetPath
					: [properties.yAxisDataSetPath]
			).map((path: string) => {
				if (Array.isArray(properties.data)) {
					return properties.data.map(
						simpleExtractor(path, locationHistory, pageExtractor),
					);
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
				if (isNullValue(rangeData)) continue;
				if (!yAxisData[i]?.length) yAxisData[i] = rangeData;
				else
					yAxisData[i] = yAxisData[i]
						.map((val: any) =>
							isNullValue(val) ? [] : Array.isArray(val) ? val : [val],
						)
						.map((val: any, index: number) =>
							val.concat(
								isNullValue(rangeData[index])
									? []
									: Array.isArray(rangeData[index])
									? rangeData[index]
									: [rangeData[index]],
							),
						);
			}
		}

		if (properties.xAxisType === 'derived') {
			if (xAxisData?.length) {
				xAxisType =
					xAxisData?.reduce((acc, curr, index) => {
						if (index === 0) return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
						else if (acc === 'ordinal') return acc;
						else return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
					}) ?? 'ordinal';
			} else {
				xAxisType = 'ordinal';
			}
		} else {
			xAxisType = properties.xAxisType;
		}

		const flatYData = yAxisData?.flat(Infinity);

		if (properties.yAxisType === 'derived') {
			if (flatYData?.length) {
				yAxisType =
					flatYData?.reduce((acc, curr, index) => {
						if (index === 0) return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
						else if (acc === 'ordinal') return acc;
						else return isNaN(parseFloat(curr)) ? 'ordinal' : 'value';
					}) ?? 'ordinal';
			} else {
				yAxisType = 'ordinal';
			}
		} else {
			yAxisType = properties.yAxisType;
		}

		if (yAxisType !== 'ordinal' && flatYData?.length) {
			let min = Infinity,
				max = -Infinity;
			for (let val of flatYData) {
				if (isNullValue(val)) continue;
				if (val < min) min = val;
				if (val > max) max = val;
			}
			yAxisMin = min;
			if (
				!isNullValue(properties.yAxisSuggestedMin) &&
				yAxisMin > properties.yAxisSuggestedMin!
			)
				yAxisMin = properties.yAxisSuggestedMin!;
			if (!isNullValue(properties.yAxisMin) && yAxisMin < properties.yAxisMin!)
				yAxisMin = properties.yAxisMin!;
			yAxisMax = max;
			if (
				!isNullValue(properties.yAxisSuggestedMax) &&
				yAxisMax < properties.yAxisSuggestedMax!
			)
				yAxisMax = properties.yAxisSuggestedMax!;
			if (!isNullValue(properties.yAxisMax) && yAxisMax > properties.yAxisMax!)
				yAxisMax = properties.yAxisMax!;
		} else {
			yAxisLabels = Array.from(new Set(flatYData));
			if (properties.yAxisLabelsSort) yAxisLabels.sort();
		}

		if (xAxisType !== 'ordinal' && xAxisData?.length) {
			let min = Infinity,
				max = -Infinity;
			for (let val of xAxisData) {
				if (isNullValue(val)) continue;
				if (val < min) min = val;
				if (val > max) max = val;
			}
			xAxisMin = min;
			if (
				!isNullValue(properties.xAxisSuggestedMin) &&
				xAxisMin > properties.xAxisSuggestedMin!
			)
				xAxisMin = properties.xAxisSuggestedMin!;
			if (!isNullValue(properties.xAxisMin) && xAxisMin < properties.xAxisMin!)
				xAxisMin = properties.xAxisMin!;
			xAxisMax = max;
			if (
				!isNullValue(properties.xAxisSuggestedMax) &&
				xAxisMax < properties.xAxisSuggestedMax!
			)
				xAxisMax = properties.xAxisSuggestedMax!;
			if (!isNullValue(properties.xAxisMax) && xAxisMax > properties.xAxisMax!)
				xAxisMax = properties.xAxisMax!;
		}
	}

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

	const dataColors: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		dataSetColors,
		properties.dataColorsPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const fillOpacity: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		properties.dataSetFillOpacity ?? [],
		properties.dataFillOpacityPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const strokeOpacity: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		properties.dataSetStrokeOpacity ?? [],
		properties.dataStrokeOpacityPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const pointType: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		properties.dataSetPointType,
		properties.dataPointTypePath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const pointSize: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		properties.dataSetPointSize ?? [],
		properties.dataPointSizePath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	const dataSetStyles: RepetetiveArray<any>[] = getPathBasedValues(
		properties.data,
		[],
		properties.yAxisDataSetStyle,
		yAxisData.length,
		locationHistory,
		pageExtractor,
	);

	return {
		xAxisLabels,
		yAxisLabels,
		xAxisData,
		yAxisData,
		xAxisType,
		yAxisType,
		xAxisMin,
		xAxisMax,
		yAxisMin,
		yAxisMax,
		dataColors,
		fillOpacity,
		strokeOpacity,
		pointType,
		pointSize,
		dataSetStyles,
	};
}

function getPathBasedValues(
	data: any,
	set: any[],
	dataPaths: any[] | undefined,
	numberOfDataSets: number,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): RepetetiveArray<any>[] {
	if (!data) return [];
	if (!Array.isArray(data) && typeof data !== 'object') return [];
	const dataList = Array.isArray(data) ? data : Object.values(data);

	if (!dataPaths) {
		if (!set?.length) return [];
		const result: RepetetiveArray<any>[] = [];
		for (let i = 0; i < numberOfDataSets; i++) {
			const temp = new RepetetiveArray<any>();
			for (let j = 0; j < dataList.length; j++) {
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

		for (let i = 0; i < dataList.length; i++) {
			let value = extractor(dataList[i]);
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
