/**
 * @jest-environment jsdom
 */
import { buildChartJsOptions } from '../configBuilder';
import { ChartData, ChartProperties, ChartType, PointType, AxisType } from '../../types/common';

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

describe('buildChartJsOptions', () => {
	describe('basic options', () => {
		it('should create responsive options', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar');

			expect(options.responsive).toBe(true);
			expect(options.maintainAspectRatio).toBe(false);
		});

		it('should set animation options when animationTime > 0', () => {
			const properties = createMockProperties({ animationTime: 500 });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar');

			expect(options.animation).toEqual({
				duration: 500,
				easing: 'linear',
			});
		});

		it('should disable animation when animationTime is 0', () => {
			const properties = createMockProperties({ animationTime: 0 });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar');

			expect(options.animation).toBe(false);
		});
	});

	describe('indexAxis for bar charts', () => {
		it('should set indexAxis to x for vertical bar charts', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({ hasBar: true, hasHorizontalBar: false });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.indexAxis).toBe('x');
		});

		it('should set indexAxis to y for horizontal bar charts', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({ hasBar: true, hasHorizontalBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.indexAxis).toBe('y');
		});
	});

	describe('scales configuration', () => {
		it('should create scales for bar charts', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales).toBeDefined();
			expect(options.scales.x).toBeDefined();
			expect(options.scales.y).toBeDefined();
		});

		it('should NOT create scales for pie charts', () => {
			const properties = createMockProperties({ chartType: ChartType.Radial });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'pie') as any;

			expect(options.scales).toBeUndefined();
		});

		it('should set category scale for ordinal axis', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: true,
				xAxisType: 'ordinal',
				yAxisType: 'value',
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.type).toBe('category');
			expect(options.scales.y.type).toBe('linear');
		});

		it('should set logarithmic scale for log axis', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: false,
				xAxisType: 'value',
				yAxisType: 'log',
			});

			const options = buildChartJsOptions(properties, chartData, 'line') as any;

			expect(options.scales.y.type).toBe('logarithmic');
		});
	});

	describe('ordinal Y values handling', () => {
		it('should NOT apply custom ticks when yDataIsActuallyOrdinal is false (numeric data)', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: true,
				yDataIsActuallyOrdinal: false, // Numeric data
				yUniqueData: [30, 50, 90],
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			// Y-axis should use linear scale without custom callbacks
			expect(options.scales.y.type).toBe('linear');
			// Ticks should just have display property
			expect(options.scales.y.ticks.callback).toBeUndefined();
		});

		it('should apply custom ticks when yDataIsActuallyOrdinal is true for vertical bar', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: true,
				hasHorizontalBar: false,
				yDataIsActuallyOrdinal: true, // String data
				yUniqueData: ['Low', 'Medium', 'High'],
				actualYAxisType: 'ordinal',
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			// Y-axis should use linear scale with custom tick callback
			expect(options.scales.y.type).toBe('linear');
			expect(options.scales.y.ticks.callback).toBeDefined();
			expect(options.scales.y.min).toBe(0);
			expect(options.scales.y.max).toBe(4); // yUniqueData.length + 1
		});

		it('should apply custom ticks to X-axis for horizontal bar with ordinal Y data', () => {
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: true,
				hasHorizontalBar: true,
				yDataIsActuallyOrdinal: true,
				yUniqueData: ['Summer', 'Winter'],
				actualYAxisType: 'ordinal',
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			// X-axis should have custom tick callback
			expect(options.scales.x.type).toBe('linear');
			expect(options.scales.x.ticks.callback).toBeDefined();
			expect(options.scales.x.min).toBe(0);
			expect(options.scales.x.max).toBe(3); // yUniqueData.length + 1
		});

		it('should return correct ordinal labels from tick callback for seasonal data', () => {
			// yUniqueData order: as they appear in the flattened data
			const properties = createMockProperties();
			const chartData = createMockChartData({
				hasBar: true,
				hasHorizontalBar: true,
				yDataIsActuallyOrdinal: true,
				yUniqueData: ['Summer', 'Autum', 'Spring', 'Winter', 'Fall'],
				actualYAxisType: 'ordinal',
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			// X-axis should have custom tick callback
			const callback = options.scales.x.ticks.callback;
			expect(callback).toBeDefined();

			// Verify callback returns correct labels for each index
			// Index 0 should return empty string (origin)
			expect(callback(0)).toBe('');
			// Index 1 should return 'Summer' (first ordinal value)
			expect(callback(1)).toBe('Summer');
			// Index 2 should return 'Autum'
			expect(callback(2)).toBe('Autum');
			// Index 3 should return 'Spring'
			expect(callback(3)).toBe('Spring');
			// Index 4 should return 'Winter'
			expect(callback(4)).toBe('Winter');
			// Index 5 should return 'Fall'
			expect(callback(5)).toBe('Fall');
			// Index 6 (out of bounds) should return empty string
			expect(callback(6)).toBe('');
		});
	});

	describe('stacking', () => {
		it('should enable stacking when stackedAxis is set', () => {
			const properties = createMockProperties({ stackedAxis: 'y' });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.stacked).toBe(true);
			expect(options.scales.y.stacked).toBe(true);
		});

		it('should disable stacking when yDataIsActuallyOrdinal is true', () => {
			const properties = createMockProperties({ stackedAxis: 'y' });
			const chartData = createMockChartData({
				hasBar: true,
				yDataIsActuallyOrdinal: true,
			});

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			// Stacking should be disabled for ordinal Y values
			expect(options.scales.x.stacked).toBe(false);
			expect(options.scales.y.stacked).toBe(false);
		});
	});

	describe('axis visibility', () => {
		it('should hide X-axis when hideXAxis is true', () => {
			const properties = createMockProperties({ hideXAxis: true });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.display).toBe(false);
		});

		it('should hide Y-axis when hideYAxis is true', () => {
			const properties = createMockProperties({ hideYAxis: true });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.y.display).toBe(false);
		});

		it('should hide grid lines when hideXLines is true', () => {
			const properties = createMockProperties({ hideXLines: true });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.grid.display).toBe(false);
		});

		it('should hide axis ticks when xAxisHideTicks is true', () => {
			const properties = createMockProperties({ xAxisHideTicks: true });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.grid.tickLength).toBe(0);
		});
	});

	describe('min/max constraints', () => {
		it('should apply xAxisMin/Max for vertical bar charts', () => {
			const properties = createMockProperties({
				xAxisMin: 0,
				xAxisMax: 100,
			});
			const chartData = createMockChartData({
				hasBar: false, // Line chart with linear X
				xAxisType: 'value',
			});

			const options = buildChartJsOptions(properties, chartData, 'line') as any;

			expect(options.scales.x.min).toBe(0);
			expect(options.scales.x.max).toBe(100);
		});

		it('should apply yAxisMin/Max for value axis', () => {
			const properties = createMockProperties({
				yAxisMin: 0,
				yAxisMax: 200,
			});
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.y.min).toBe(0);
			expect(options.scales.y.max).toBe(200);
		});

		it('should apply suggested min/max for value axis', () => {
			const properties = createMockProperties({
				yAxisSuggestedMin: 10,
				yAxisSuggestedMax: 90,
			});
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.y.suggestedMin).toBe(10);
			expect(options.scales.y.suggestedMax).toBe(90);
		});
	});

	describe('axis position', () => {
		it('should set X-axis position to top when xAxisStartPosition is top', () => {
			const properties = createMockProperties({ xAxisStartPosition: 'top' });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.position).toBe('top');
		});

		it('should set Y-axis position to right when yAxisStartPosition is right', () => {
			const properties = createMockProperties({ yAxisStartPosition: 'right' });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.y.position).toBe('right');
		});
	});

	describe('axis reversal', () => {
		it('should reverse X-axis when xAxisReverse is true', () => {
			const properties = createMockProperties({ xAxisReverse: true });
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.x.reverse).toBe(true);
		});

		it('should auto-reverse Y-axis when X-axis is at top for vertical bars', () => {
			const properties = createMockProperties({
				xAxisStartPosition: 'top',
				// yAxisReverse not explicitly set
			});
			const chartData = createMockChartData({ hasBar: true });

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.scales.y.reverse).toBe(true);
		});
	});

	describe('legend', () => {
		it('should show legend when legendPosition is set', () => {
			const properties = createMockProperties({ legendPosition: 'top' });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.plugins.legend.display).toBe(true);
			expect(options.plugins.legend.position).toBe('top');
		});

		it('should hide legend when legendPosition is none', () => {
			const properties = createMockProperties({ legendPosition: 'none' });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.plugins.legend.display).toBe(false);
		});
	});

	describe('tooltip', () => {
		it('should set tooltip mode to index for allDataSets', () => {
			const properties = createMockProperties({ tooltipData: 'allDataSets' });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.plugins.tooltip.mode).toBe('index');
		});

		it('should set tooltip mode to nearest for currentDataSet', () => {
			const properties = createMockProperties({ tooltipData: 'currentDataSet' });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.plugins.tooltip.mode).toBe('nearest');
		});

		it('should set intersect based on tooltipTrigger', () => {
			const properties = createMockProperties({ tooltipTrigger: 'hoverOnAxis' });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'bar') as any;

			expect(options.plugins.tooltip.intersect).toBe(false);
		});
	});

	describe('radar charts', () => {
		it('should create radar scale options for radar charts', () => {
			const properties = createMockProperties({ chartType: ChartType.Radar });
			const chartData = createMockChartData();

			const options = buildChartJsOptions(properties, chartData, 'radar') as any;

			expect(options.scales).toBeDefined();
			expect(options.scales.r).toBeDefined();
			expect(options.scales.r.pointLabels).toBeDefined();
		});
	});
});
