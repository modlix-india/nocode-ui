import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		groupName: 'Font',
		displayName: 'Chart Font',
		name: 'chartFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compChart',
		noPrefix: true,
	},
	{
		groupName: 'Text Color',
		displayName: 'Chart Font Color',
		name: 'chartFontColor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compChart',
		noPrefix: true,
	},

	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 1',
		name: 'primaryChartDesign1DataColor1',
		defaultValue: '#1594BA',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 2',
		name: 'primaryChartDesign1DataColor2',
		defaultValue: '#137898',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 3',
		name: 'primaryChartDesign1DataColor3',
		defaultValue: '#0D5B78',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 4',
		name: 'primaryChartDesign1DataColor4',
		defaultValue: '#0E3C55',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 5',
		name: 'primaryChartDesign1DataColor5',
		defaultValue: '#C02F1C',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 6',
		name: 'primaryChartDesign1DataColor6',
		defaultValue: '#D94E1E',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 7',
		name: 'primaryChartDesign1DataColor7',
		defaultValue: '#F16C20',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 8',
		name: 'primaryChartDesign1DataColor8',
		defaultValue: '#EE8B2C',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 9',
		name: 'primaryChartDesign1DataColor9',
		defaultValue: '#ECAA38',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 10',
		name: 'primaryChartDesign1DataColor10',
		defaultValue: '#EAC645',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 11',
		name: 'primaryChartDesign1DataColor11',
		defaultValue: '#A2B76C',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Data Color 12',
		name: 'primaryChartDesign1DataColor12',
		defaultValue: '#5BA793',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Missing Data Color',
		name: 'primaryChartDesign1MissingDataColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},

	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 X Axis Color',
		name: 'primaryChartDesign1XAxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Y Axis Color',
		name: 'primaryChartDesign1YAxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Y2 Axis Color',
		name: 'primaryChartDesign1Y2AxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},

	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Background Horizontal Lines Color',
		name: 'primaryChartDesign1BackgroundHorizontalLinesColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Primary Chart Design1 Background Vertical Lines Color',
		name: 'primaryChartDesign1BackgroundVerticalLinesColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
