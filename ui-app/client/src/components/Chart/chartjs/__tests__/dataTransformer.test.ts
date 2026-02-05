/**
 * @jest-environment jsdom
 */
import { transformToChartJsData, determineChartJsType } from '../dataTransformer';
import { ChartData, ChartProperties, DataSetStyle, ChartType, PointType, AxisType } from '../../types/common';
import RepetetiveArray from '../../../../util/RepetetiveArray';

// Helper to create a minimal ChartProperties object
function createMockProperties(overrides: Partial<ChartProperties> = {}): ChartProperties {
	return {
		hideGrid: false,
		colorScheme: 'default',
		chartType: ChartType.Regular,
		data: [],
		dataSetColors: ['#FF0000'],
		dataSetPointType: [PointType.Circle],
		xAxisType: 'derived' as AxisType | 'time' | 'derived',
		xAxisStartPosition: 'bottom',
		xAxisLabelsSort: 'none',
		yAxisType: 'derived' as AxisType | 'derived',
		yAxisStartPosition: 'left',
		yAxisLabelsSort: 'none',
		stackedAxis: 'none',
		animationTime: 0,
		animationTimingFunction: 'easeLinear',
		preNormalization: 'none',
		tooltipPosition: 'top',
		tooltipData: 'currentDataSet',
		tooltipTrigger: 'hoverOnData',
		radarType: 'polygon',
		radialType: 'circle',
		padding: 0,
		focusDataSetOnHover: false,
		gradientSpace: 'userSpaceOnUse',
		hideXAxisLine: false,
		hideYAxisLine: false,
		...overrides,
	};
}

// Helper to create a minimal ChartData object
function createMockChartData(overrides: Partial<ChartData> = {}): ChartData {
	return {
		dataSetData: [],
		xUniqueData: [],
		yUniqueData: [],
		xAxisType: 'ordinal',
		yAxisType: 'value',
		actualXAxisType: 'ordinal',
		actualYAxisType: 'value',
		yDataIsActuallyOrdinal: false,
		axisInverted: false,
		hasBar: false,
		hasHorizontalBar: false,
		gradients: new Map(),
		...overrides,
	};
}

// Helper to create RepetetiveArray
function createRepArray<T>(values: T[]): RepetetiveArray<T> {
	const arr = new RepetetiveArray<T>();
	values.forEach(v => arr.push(v));
	return arr;
}

describe('determineChartJsType', () => {
	it('should return bar for bar charts', () => {
		const properties = createMockProperties();
		const chartData = createMockChartData({
			dataSetData: [{
				data: [{ x: 'A', y: 10 }],
				isHidden: false,
				dataSetStyle: DataSetStyle.Bar,
				dataColors: createRepArray(['#FF0000']),
				dataStrokeColors: createRepArray(['#FF0000']),
				fillOpacity: createRepArray([1]),
				strokeOpacity: createRepArray([1]),
				pointType: createRepArray([PointType.Circle]),
				pointSize: createRepArray([3]),
			}],
		});

		expect(determineChartJsType(properties, chartData)).toBe('bar');
	});

	it('should return line for line charts', () => {
		const properties = createMockProperties();
		const chartData = createMockChartData({
			dataSetData: [{
				data: [{ x: 'A', y: 10 }],
				isHidden: false,
				dataSetStyle: DataSetStyle.Line,
				dataColors: createRepArray(['#FF0000']),
				dataStrokeColors: createRepArray(['#FF0000']),
				fillOpacity: createRepArray([1]),
				strokeOpacity: createRepArray([1]),
				pointType: createRepArray([PointType.Circle]),
				pointSize: createRepArray([3]),
			}],
		});

		expect(determineChartJsType(properties, chartData)).toBe('line');
	});

	it('should return scatter for dot charts', () => {
		const properties = createMockProperties();
		const chartData = createMockChartData({
			dataSetData: [{
				data: [{ x: 'A', y: 10 }],
				isHidden: false,
				dataSetStyle: DataSetStyle.Dot,
				dataColors: createRepArray(['#FF0000']),
				dataStrokeColors: createRepArray(['#FF0000']),
				fillOpacity: createRepArray([1]),
				strokeOpacity: createRepArray([1]),
				pointType: createRepArray([PointType.Circle]),
				pointSize: createRepArray([3]),
			}],
		});

		expect(determineChartJsType(properties, chartData)).toBe('scatter');
	});

	it('should return pie for radial pie charts', () => {
		const properties = createMockProperties({ chartType: ChartType.Radial });
		const chartData = createMockChartData({
			dataSetData: [{
				data: [{ x: 'A', y: 10 }],
				isHidden: false,
				dataSetStyle: DataSetStyle.Pie,
				dataColors: createRepArray(['#FF0000']),
				dataStrokeColors: createRepArray(['#FF0000']),
				fillOpacity: createRepArray([1]),
				strokeOpacity: createRepArray([1]),
				pointType: createRepArray([PointType.Circle]),
				pointSize: createRepArray([3]),
			}],
		});

		expect(determineChartJsType(properties, chartData)).toBe('pie');
	});

	it('should return radar for radar charts', () => {
		const properties = createMockProperties({ chartType: ChartType.Radar });
		const chartData = createMockChartData();

		expect(determineChartJsType(properties, chartData)).toBe('radar');
	});
});

describe('transformToChartJsData', () => {
	describe('simple numeric data', () => {
		it('should transform simple numeric bar chart data correctly', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: [10, -20, -80, 60],
				yUniqueData: [30, 50, 90, 80],
				hasBar: true,
				dataSetData: [{
					data: [
						{ x: 10, y: 30 },
						{ x: -20, y: 50 },
						{ x: -80, y: 90 },
						{ x: 60, y: 80 },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
					fillOpacity: createRepArray([1, 1, 1, 1]),
					strokeOpacity: createRepArray([1, 1, 1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3, 3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			expect(result.labels).toEqual([10, -20, -80, 60]);
			expect(result.datasets[0].data).toEqual([30, 50, 90, 80]);
		});

		it('should NOT convert numeric Y values to indices when yDataIsActuallyOrdinal is false', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan', 'Feb', 'Mar'],
				yUniqueData: [30, 50, 90],
				hasBar: true,
				yDataIsActuallyOrdinal: false, // Numeric data should NOT be converted
				dataSetData: [{
					data: [
						{ x: 'Jan', y: 30 },
						{ x: 'Feb', y: 50 },
						{ x: 'Mar', y: 90 },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					fillOpacity: createRepArray([1, 1, 1]),
					strokeOpacity: createRepArray([1, 1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Y values should remain as-is (not converted to indices)
			expect(result.datasets[0].data).toEqual([30, 50, 90]);
		});
	});

	describe('ordinal Y values', () => {
		it('should convert ordinal Y values to indices when yDataIsActuallyOrdinal is true', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan', 'Feb', 'Mar'],
				yUniqueData: ['Low', 'Medium', 'High'],
				hasBar: true,
				yDataIsActuallyOrdinal: true,
				dataSetData: [{
					data: [
						{ x: 'Jan', y: 'Low' },
						{ x: 'Feb', y: 'High' },
						{ x: 'Mar', y: 'Medium' },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					fillOpacity: createRepArray([1, 1, 1]),
					strokeOpacity: createRepArray([1, 1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Ordinal values should be converted to indices (1-based)
			// Low -> 1, Medium -> 2, High -> 3
			expect(result.datasets[0].data).toEqual([1, 3, 2]);
		});

		it('should handle multiple datasets with seasonal ordinal Y values', () => {
			// Matches user scenario: multiple Y datasets (y1, y2) with season names
			// yUniqueData order comes from flat(Infinity) then Set:
			// [Summer, Autum, Spring, Spring, Winter, Summer, Fall, Winter] → Set → [Summer, Autum, Spring, Winter, Fall]
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan', 'Feb', 'Mar', 'Apr'],
				// Unique Y values in order they appear in flattened data
				yUniqueData: ['Summer', 'Autum', 'Spring', 'Winter', 'Fall'],
				hasBar: true,
				hasHorizontalBar: true,
				yDataIsActuallyOrdinal: true,
				dataSetData: [
					// First dataset (y1): Summer, Autum, Spring, Spring
					{
						data: [
							{ x: 'Jan', y: 'Summer' },
							{ x: 'Feb', y: 'Autum' },
							{ x: 'Mar', y: 'Spring' },
							{ x: 'Apr', y: 'Spring' },
						],
						isHidden: false,
						dataSetStyle: DataSetStyle.HorizontalBar,
						dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
						dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
						fillOpacity: createRepArray([1, 1, 1, 1]),
						strokeOpacity: createRepArray([1, 1, 1, 1]),
						pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle, PointType.Circle]),
						pointSize: createRepArray([3, 3, 3, 3]),
					},
					// Second dataset (y2): Winter, Summer, Fall, Winter
					{
						data: [
							{ x: 'Jan', y: 'Winter' },
							{ x: 'Feb', y: 'Summer' },
							{ x: 'Mar', y: 'Fall' },
							{ x: 'Apr', y: 'Winter' },
						],
						isHidden: false,
						dataSetStyle: DataSetStyle.HorizontalBar,
						dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
						dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
						fillOpacity: createRepArray([1, 1, 1, 1]),
						strokeOpacity: createRepArray([1, 1, 1, 1]),
						pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle, PointType.Circle]),
						pointSize: createRepArray([3, 3, 3, 3]),
					},
				],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1', 'Dataset 2']);

			// Ordinal values should be converted to indices (1-based)
			// yUniqueData order: Summer=1, Autum=2, Spring=3, Winter=4, Fall=5
			// Dataset 1: Summer(1), Autum(2), Spring(3), Spring(3)
			expect(result.datasets[0].data).toEqual([1, 2, 3, 3]);
			// Dataset 2: Winter(4), Summer(1), Fall(5), Winter(4)
			expect(result.datasets[1].data).toEqual([4, 1, 5, 4]);
		});
	});

	describe('range/floating bar data', () => {
		it('should preserve single range pairs for floating bars', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan', 'Feb'],
				yUniqueData: [10, 20, 30, 40],
				hasBar: true,
				dataSetData: [{
					data: [
						{ x: 'Jan', y: [10, 20] },
						{ x: 'Feb', y: [30, 40] },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00']),
					fillOpacity: createRepArray([1, 1]),
					strokeOpacity: createRepArray([1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Range pairs should be preserved
			expect(result.datasets[0].data).toEqual([[10, 20], [30, 40]]);
		});

		it('should create separate datasets for multiple range pairs per category', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan'],
				yUniqueData: [10, 20, 23, 30],
				hasBar: true,
				dataSetData: [{
					data: [
						{ x: 'Jan', y: [[10, 20], [23, 30]] },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000']),
					dataStrokeColors: createRepArray(['#FF0000']),
					fillOpacity: createRepArray([1]),
					strokeOpacity: createRepArray([1]),
					pointType: createRepArray([PointType.Circle]),
					pointSize: createRepArray([3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Multiple range pairs should create separate datasets, NOT duplicate labels
			expect(result.labels).toEqual(['Jan']);
			// First dataset gets first range pair
			expect(result.datasets[0].data).toEqual([[10, 20]]);
			// Second dataset gets second range pair
			expect(result.datasets[1].data).toEqual([[23, 30]]);
		});

		it('should consolidate multiple categories with multiple ranges', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Jan', 'Feb', 'Mar'],
				yUniqueData: [3, 5, 9, 10, 13, 14, 15, 20, 23, 24, 26, 28, 29, 30],
				hasBar: true,
				dataSetData: [{
					data: [
						{ x: 'Jan', y: [[10, 20], [24, 29]] },
						{ x: 'Feb', y: [[13, 15], [26, 28]] },
						{ x: 'Mar', y: [[3, 5], [9, 14], [23, 26]] },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					fillOpacity: createRepArray([1, 1, 1]),
					strokeOpacity: createRepArray([1, 1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Labels should be unique (not duplicated)
			expect(result.labels).toEqual(['Jan', 'Feb', 'Mar']);
			// Should create 3 datasets (max ranges per category is 3 for Mar)
			expect(result.datasets.length).toBe(3);
			// First layer: first range from each category
			expect(result.datasets[0].data).toEqual([[10, 20], [13, 15], [3, 5]]);
			// Second layer: second range from each category
			expect(result.datasets[1].data).toEqual([[24, 29], [26, 28], [9, 14]]);
			// Third layer: only Mar has a third range
			expect(result.datasets[2].data).toEqual([null, null, [23, 26]]);
		});
	});

	describe('sorting', () => {
		it('should reorder data when sorting is requested', () => {
			const properties = createMockProperties({ xAxisLabelsSort: 'ascending' });
			const chartData = createMockChartData({
				xUniqueData: ['A', 'B', 'C'], // Already sorted in common.ts
				yUniqueData: [30, 10, 20],
				hasBar: true,
				dataSetData: [{
					data: [
						{ x: 'C', y: 20 },
						{ x: 'A', y: 30 },
						{ x: 'B', y: 10 },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.Bar,
					dataColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00', '#0000FF']),
					fillOpacity: createRepArray([1, 1, 1]),
					strokeOpacity: createRepArray([1, 1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			// Labels come from sorted xUniqueData
			expect(result.labels).toEqual(['A', 'B', 'C']);
			// Data should be reordered to match sorted labels
			expect(result.datasets[0].data).toEqual([30, 10, 20]);
		});
	});

	describe('horizontal bar charts', () => {
		it('should handle horizontal bar chart data correctly', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				xUniqueData: ['Category A', 'Category B'],
				yUniqueData: [100, 200],
				hasBar: true,
				hasHorizontalBar: true,
				dataSetData: [{
					data: [
						{ x: 'Category A', y: 100 },
						{ x: 'Category B', y: 200 },
					],
					isHidden: false,
					dataSetStyle: DataSetStyle.HorizontalBar,
					dataColors: createRepArray(['#FF0000', '#00FF00']),
					dataStrokeColors: createRepArray(['#FF0000', '#00FF00']),
					fillOpacity: createRepArray([1, 1]),
					strokeOpacity: createRepArray([1, 1]),
					pointType: createRepArray([PointType.Circle, PointType.Circle]),
					pointSize: createRepArray([3, 3]),
				}],
			});

			const result = transformToChartJsData(properties, chartData, ['Dataset 1']);

			expect(result.labels).toEqual(['Category A', 'Category B']);
			expect(result.datasets[0].data).toEqual([100, 200]);
		});
	});
});
