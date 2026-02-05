import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { PageStoreExtractor, getDataFromPath } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import RepetetiveArray from '../../../util/RepetetiveArray';
import { hashCode } from '../../../functions/utils';

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

export interface Gradient {
	hashCode: number;
	gradient: string;
}

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
	dataSetPointShowOnHover?: boolean; // Done.
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
	tooltipLabel?: string;
	disableLegendInteraction?: boolean;
	radarType: 'polygon' | 'circle';
	radialType: 'circle' | 'line';

	padding: number;
	focusDataSetOnHover: boolean;
	gradientSpace: 'objectBoundingBox' | 'userSpaceOnUse';
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
			TokenValueExtractor.splitPath(token),
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
	// True if Y data actually contains string/categorical values (not just configured as ordinal)
	yDataIsActuallyOrdinal: boolean;
	gradients: Map<number, Gradient>;
}

export function makeChartDataFromProperties(
	properties: ChartProperties,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
): ChartData {
	const isRadialChart = properties.chartType === 'radial';
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

	// Sort xUniqueData if requested
	if (properties.xAxisLabelsSort && properties.xAxisLabelsSort !== 'none' && xUniqueData.length > 0) {
		if (xAxisType === 'value' || xAxisType === 'log') {
			// Numeric sort for value/log axis
			xUniqueData.sort((a, b) => {
				const numA = Number.parseFloat(a);
				const numB = Number.parseFloat(b);
				return properties.xAxisLabelsSort === 'ascending' ? numA - numB : numB - numA;
			});
		} else if (xAxisType === 'time') {
			// Chronological sort for time axis
			xUniqueData.sort((a, b) => {
				const timeA = new Date(a).getTime();
				const timeB = new Date(b).getTime();
				return properties.xAxisLabelsSort === 'ascending' ? timeA - timeB : timeB - timeA;
			});
		} else if (xAxisType === 'ordinal') {
			// String sort for ordinal axis
			xUniqueData.sort((a, b) => {
				const strA = String(a);
				const strB = String(b);
				return properties.xAxisLabelsSort === 'ascending'
					? strA.localeCompare(strB)
					: strB.localeCompare(strA);
			});
		}
	}

	// Sort yUniqueData if requested
	if (properties.yAxisLabelsSort && properties.yAxisLabelsSort !== 'none' && yUniqueData.length > 0) {
		if (yAxisType === 'value' || yAxisType === 'log') {
			// Numeric sort for value/log axis
			yUniqueData.sort((a, b) => {
				const numA = Number.parseFloat(a);
				const numB = Number.parseFloat(b);
				return properties.yAxisLabelsSort === 'ascending' ? numA - numB : numB - numA;
			});
		} else if (yAxisType === 'ordinal') {
			// String sort for ordinal axis
			yUniqueData.sort((a, b) => {
				const strA = String(a);
				const strB = String(b);
				return properties.yAxisLabelsSort === 'ascending'
					? strA.localeCompare(strB)
					: strB.localeCompare(strA);
			});
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

	let dataColors: RepetetiveArray<string>[];
	let dataStrokeColors: RepetetiveArray<string>[];

	dataColors = getPathBasedValues(
		properties.data,
		properties.dataSetColors ?? properties.dataSetStrokeColors ?? dataSetColors,
		properties.dataColorsPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
		isRadialChart,
	);
	dataStrokeColors = getPathBasedValues(
		properties.data,
		properties.dataSetStrokeColors ?? properties.dataSetColors ?? dataSetColors,
		properties.dataStrokeColorsPath,
		yAxisData.length,
		locationHistory,
		pageExtractor,
		isRadialChart,
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

	let gradients: Map<number, Gradient>;

	[gradients, dataColors, dataStrokeColors] = makeGradientMap(dataColors, dataStrokeColors);

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

	// Determine if Y data actually contains ordinal (string) values, regardless of configured type
	// This is used to decide whether to apply ordinal-to-index mapping in dataTransformer
	// Even if yAxisType is configured as 'ordinal', we shouldn't map numeric values to indices
	const yDataIsActuallyOrdinal = yUniqueData.some((val: any) =>
		typeof val === 'string' && Number.isNaN(Number.parseFloat(val)));

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
		yDataIsActuallyOrdinal,
		axisInverted,
		hasBar,
		hasHorizontalBar,
		xAxisTitle: axisInverted ? properties.yAxisTitle : properties.xAxisTitle,
		yAxisTitle: axisInverted ? properties.xAxisTitle : properties.yAxisTitle,
		xUniqueData,
		yUniqueData,
		gradients,
	};
}

function makeGradientMap(
	dataColors: RepetetiveArray<string>[],
	dataStrokeColors: RepetetiveArray<string>[],
): [Map<number, Gradient>, RepetetiveArray<string>[], RepetetiveArray<string>[]] {
	const gradients = new Map<number, Gradient>();

	for (let c of [dataColors, dataStrokeColors]) {
		for (let arr of c) {
			const v = arr.getUniqueValues();
			for (let color of v) {
				if (color.toLowerCase().indexOf('-gradient') === -1) continue;
				{
					const hash = hashCode(color);
					if (!gradients.has(hash)) {
						gradients.set(hash, {
							hashCode: hash,
							gradient: color,
						});
					}
					arr.replaceValue(color, `url(#gradient_${Math.abs(hash)})`);
				}
			}
		}
	}

	return [gradients, dataColors, dataStrokeColors];
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

/**
 * Converts multiValued property format to array of path strings
 * Handles both array format ["path1", "path2"] and object format
 * { key1: { order: 1, property: { value: "path1" } }, key2: { order: 2, property: { value: "path2" } } }
 */
function extractPaths(pathProperty: any): string[] {
	if (!pathProperty) return [];

	// Already an array of strings
	if (Array.isArray(pathProperty)) {
		return pathProperty.map(p => (typeof p === 'string' ? p : p?.property?.value ?? p?.value ?? p));
	}

	// Single string path
	if (typeof pathProperty === 'string') {
		return [pathProperty];
	}

	// Object format from multiValued properties: { key: { order, property: { value } } }
	if (typeof pathProperty === 'object') {
		return Object.values(pathProperty)
			.sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
			.map((item: any) => item?.property?.value ?? item?.value ?? item)
			.filter((p): p is string => typeof p === 'string');
	}

	return [];
}

function makeYAxisData(
	properties: ChartProperties,
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
	hiddenDataSets: Set<number>,
) {
	let yAxisData: any[][] | undefined = [];
	if (properties.yAxisDataSetPath) {
		const paths = extractPaths(properties.yAxisDataSetPath);
		yAxisData = paths.map((path: string, index: number) => {
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
		const rangePaths = extractPaths(properties.yAxisRangeDataSetPath);
		for (let path of rangePaths) {
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
				if (Array.isArray(rangeData)) {
					// For range data, preserve [start, end] pairs for floating bars
					// Only flatten one level to keep range pairs intact: [[10,20],[23,30]] stays as-is
					// but [[[10,20]]] becomes [[10,20]]
					yAxisData[i] = rangeData.map(e => {
						if (!Array.isArray(e)) return e;
						// Check if this is an array of range pairs (e.g., [[10,20],[23,30]])
						// or a single value/pair that needs flattening
						const firstElement = e[0];
						if (Array.isArray(firstElement) && firstElement.length === 2 &&
							typeof firstElement[0] === 'number' && typeof firstElement[1] === 'number') {
							// This is an array of [start, end] pairs - keep them intact
							return e;
						}
						// Otherwise flatten as before for backward compatibility
						return e?.flat(Infinity) ?? e;
					});
				} else yAxisData[i] = [rangeData];
			} else
				yAxisData[i] = yAxisData[i].map((val: any, index: number) => {
					if (isNullValue(val)) val = [];
					else if (!Array.isArray(val)) val = [val];

					if (isNullValue(rangeData[index])) return val;
					if (Array.isArray(rangeData[index])) {
						// Check if range data contains [start, end] pairs
						const firstElement = rangeData[index][0];
						if (Array.isArray(firstElement) && firstElement.length === 2 &&
							typeof firstElement[0] === 'number' && typeof firstElement[1] === 'number') {
							// Preserve range pairs - don't flatten
							return val.concat(rangeData[index]);
						}
						return val.concat(rangeData[index].flat(Infinity));
					}
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
		const paths = extractPaths(properties.xAxisDataSetPath);
		xAxisData = paths.map((path: string, index: number) => {
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
	distributeColorsPerDataPoint: boolean = false,
): RepetetiveArray<T>[] {
	if (!data) return [];
	if (!Array.isArray(data) && typeof data !== 'object') return [];
	const dataList = Array.isArray(data) ? data : Object.values(data);

	// Extract paths from multiValued property format if needed
	const extractedPaths = dataPaths ? extractPaths(dataPaths) : [];

	// If no paths provided (or empty after extraction), use the set values directly
	if (!extractedPaths.length) {
		if (!set?.length) return [];
		const result: RepetetiveArray<any>[] = [];
		for (let i = 0; i < numberOfDataSets; i++) {
			const temp = new RepetetiveArray<any>();
			// For radial charts (pie/doughnut/polarArea), distribute colors per data point (slice)
			// For other charts, use the same color for all data points in a dataset
			if (distributeColorsPerDataPoint) {
				dataList.forEach((_, dataIndex) => {
					temp.push(set[dataIndex % set.length]);
				});
			} else {
				for (const _ of dataList) {
					temp.push(set[i % set.length]);
				}
			}
			result.push(temp);
		}
		return result;
	}

	const result: RepetetiveArray<any>[] = [];

	let dataSetNum = 0;

	for (let path of extractedPaths) {
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
