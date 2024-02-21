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
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 1',
		name: 'chartPrimaryDataColor1',
		defaultValue: '#1594BA',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 2',
		name: 'chartPrimaryDataColor2',
		defaultValue: '#137898',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 3',
		name: 'chartPrimaryDataColor3',
		defaultValue: '#0D5B78',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 4',
		name: 'chartPrimaryDataColor4',
		defaultValue: '#0E3C55',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 5',
		name: 'chartPrimaryDataColor5',
		defaultValue: '#C02F1C',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 6',
		name: 'chartPrimaryDataColor6',
		defaultValue: '#D94E1E',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 7',
		name: 'chartPrimaryDataColor7',
		defaultValue: '#F16C20',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 8',
		name: 'chartPrimaryDataColor8',
		defaultValue: '#EE8B2C',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 9',
		name: 'chartPrimaryDataColor9',
		defaultValue: '#ECAA38',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 10',
		name: 'chartPrimaryDataColor10',
		defaultValue: '#EAC645',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 11',
		name: 'chartPrimaryDataColor11',
		defaultValue: '#A2B76C',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Data Color 12',
		name: 'chartPrimaryDataColor12',
		defaultValue: '#5BA793',
		noPrefix: true,
	},

	{
		groupName: 'Primary',
		displayName: 'Chart Primary X Axis Color',
		name: 'chartPrimaryXAxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Y Axis Color',
		name: 'chartPrimaryYAxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Y2 Axis Color',
		name: 'chartPrimaryY2AxisColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},

	{
		groupName: 'Primary',
		displayName: 'Chart Primary Background Horizontal Lines Color',
		name: 'chartPrimaryBackgroundHorizontalLinesColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
	{
		groupName: 'Primary',
		displayName: 'Chart Primary Background Vertical Lines Color',
		name: 'chartPrimaryBackgroundVerticalLinesColor',
		defaultValue: '#CCCCCC',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
