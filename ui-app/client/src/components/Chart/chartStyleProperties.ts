import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'Font',
		dn: 'Chart Font',
		n: 'chartFont',
		dv: '<quaternaryFont>',
		cp: 'font',
		sel: '.comp.compChart',
		np: true,
	},
	{
		gn: 'Text Color',
		dn: 'Chart Font Color',
		n: 'chartFontColor',
		dv: '<fontColorEight>',
		cp: 'color',
		sel: '.comp.compChart',
		np: true,
	},

	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 1',
		n: 'chartPrimaryDataColor1',
		dv: '#1594BA',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 2',
		n: 'chartPrimaryDataColor2',
		dv: '#137898',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 3',
		n: 'chartPrimaryDataColor3',
		dv: '#0D5B78',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 4',
		n: 'chartPrimaryDataColor4',
		dv: '#0E3C55',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 5',
		n: 'chartPrimaryDataColor5',
		dv: '#C02F1C',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 6',
		n: 'chartPrimaryDataColor6',
		dv: '#D94E1E',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 7',
		n: 'chartPrimaryDataColor7',
		dv: '#F16C20',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 8',
		n: 'chartPrimaryDataColor8',
		dv: '#EE8B2C',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 9',
		n: 'chartPrimaryDataColor9',
		dv: '#ECAA38',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 10',
		n: 'chartPrimaryDataColor10',
		dv: '#EAC645',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 11',
		n: 'chartPrimaryDataColor11',
		dv: '#A2B76C',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Data Color 12',
		n: 'chartPrimaryDataColor12',
		dv: '#5BA793',
		np: true,
	},

	{
		gn: 'Primary',
		dn: 'Chart Primary X Axis Color',
		n: 'chartPrimaryXAxisColor',
		dv: '#CCCCCC',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Y Axis Color',
		n: 'chartPrimaryYAxisColor',
		dv: '#CCCCCC',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Y2 Axis Color',
		n: 'chartPrimaryY2AxisColor',
		dv: '#CCCCCC',
		np: true,
	},

	{
		gn: 'Primary',
		dn: 'Chart Primary Background Horizontal Lines Color',
		n: 'chartPrimaryBackgroundHorizontalLinesColor',
		dv: '#CCCCCC',
		np: true,
	},
	{
		gn: 'Primary',
		dn: 'Chart Primary Background Vertical Lines Color',
		n: 'chartPrimaryBackgroundVerticalLinesColor',
		dv: '#CCCCCC',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
