import {
	applyLookToData,
	applyLookToOptions,
	effectiveLook,
	type ChartLook,
	type LookTheme,
} from '../Chart/chartjs/chartLook';
import type { ChartTheme, ReportChartConfig } from './reportChartConfig';

/**
 * A report widget chart in the theme's chart look (`Theme.reportChartLook`), with the same rules
 * as the Chart component's `chartLook`: dotMatrix and isometric for vertical bar charts, wave
 * for vertical bar or line charts. The widget's own chart type decides; any other chart, and a
 * theme with no look, gets the config back as the very same object.
 *
 * Ridges (wave) give every data set a row of its own, which reads wrongly for a trend line or a
 * compared period drawn beside its series, so a chart carrying either keeps its normal drawing.
 */
export function reportLookFor(config: ReportChartConfig, look: string | undefined): ChartLook {
	const horizontal = config.options?.indexAxis === 'y';
	const l = effectiveLook({ chartLook: look, invertAxis: horizontal }, config.type);
	if (l === 'wave' && config.data?.datasets?.some((d: any) => d?._trend || d?._ghost))
		return 'default';
	return l;
}

export function applyReportChartLook(
	config: ReportChartConfig,
	theme: ChartTheme,
): ReportChartConfig {
	const look = reportLookFor(config, theme.look);
	if (look === 'default') return config;
	const lookTheme: LookTheme = {
		palette: theme.palette,
		textColor: theme.text || undefined,
		gridColor: theme.grid || undefined,
		axisColor: theme.muted || undefined,
	};
	const props = { chartLook: look };
	return {
		...config,
		data: applyLookToData(config.data, props, lookTheme, config.type),
		options: applyLookToOptions(
			config.options,
			props,
			lookTheme,
			config.data?.labels,
			config.type,
		),
	};
}
