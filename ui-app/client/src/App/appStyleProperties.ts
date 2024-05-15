import { StylePropertyDefinition } from '../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'bodyBackground',
		displayName: 'Application/Site Background',
		description: 'This is the application level background',
		noPrefix: true,
		cssProperty: 'background',
		selector: 'body',
	},
	{
		name: 'bodyMargin',
		displayName: 'Application/Site Body Margin',
		description: 'This is the application level body margin',
		noPrefix: true,
		cssProperty: 'margin',
		selector: 'body',
		defaultValue: '0',
	},
	{
		name: 'bodyFont',
		displayName: 'Application/Site Font',
		description: 'This is the application level font',
		noPrefix: true,
		cssProperty: 'font',
		selector: 'body',
		defaultValue: '<primaryFont>',
	},
	{
		name: 'scrollBarWidth',
		displayName: 'Scroll bar width',
		description: 'Scroll bar width',
		noPrefix: true,
		cssProperty: 'width',
		selector: '::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarHeight',
		displayName: 'Scroll bar height',
		description: 'Scroll bar height',
		noPrefix: true,
		cssProperty: 'height',
		selector: '::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarThumbBg',
		displayName: 'Scroll bar thumb background',
		description: 'Scroll bar thumb background',
		noPrefix: true,
		cssProperty: 'background',
		selector: '::-webkit-scrollbar-thumb',
		defaultValue: '#a3b2c0',
	},
	{
		name: 'scrollBarThumbBorderRadius',
		displayName: 'Scroll bar thumb border radius',
		description: 'Scroll bar thumb border radius',
		noPrefix: true,
		cssProperty: 'border-radius',
		selector: '::-webkit-scrollbar-thumb, ::-webkit-scrollbar-corner',
		defaultValue: '3px',
	},
	{
		name: 'scrollBarHoverWidth',
		displayName: 'Scroll bar hover width',
		description: 'Scroll bar hover width',
		noPrefix: true,
		cssProperty: 'width',
		selector: '*:hover::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarThumbHoverBg',
		displayName: 'Scroll bar hover thumb background',
		description: 'Scroll bar hover thumb background',
		noPrefix: true,
		cssProperty: 'background',
		selector: '*:hover::-webkit-scrollbar-thumb',
		defaultValue: '#6d8499',
	},
	{
		name: 'iconThinnerWeight',
		displayName: 'Icon Thinner Weight',
		description: 'Icon Thinner Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._thinner, .mi._thinner, .ms._thinner',
		defaultValue: '100',
	},
	{
		name: 'iconThinWeight',
		displayName: 'Icon Thin Weight',
		description: 'Icon Thin Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._thins, .mi._thins, .ms._thins',
		defaultValue: '200',
	},
	{
		name: 'iconLightWeight',
		displayName: 'Icon Light Weight',
		description: 'Icon Light Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._light, .mi._light, .ms._light',
		defaultValue: '300',
	},
	{
		name: 'iconRegularWeight',
		displayName: 'Icon Regular Weight',
		description: 'Icon Regular Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._regular, .mi._regular, .ms._regular',
		defaultValue: '400',
	},
	{
		name: 'iconMediumWeight',
		displayName: 'Icon Medium Weight',
		description: 'Icon Medium Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._medium, .mi._medium, .ms._medium',
		defaultValue: '500',
	},
	{
		name: 'iconSemiBoldWeight',
		displayName: 'Icon Semi Bold Weight',
		description: 'Icon Semi Bold Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._semiBold, .mi._semiBold, .ms._semiBold',
		defaultValue: '600',
	},
	{
		name: 'iconBoldWeight',
		displayName: 'Icon Bold Weight',
		description: 'Icon Bold Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._bold, .mi._bold, .ms._bold',
		defaultValue: '700',
	},
	{
		name: 'iconExtraBoldWeight',
		displayName: 'Icon Extra Bold Weight',
		description: 'Icon Extra Bold Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._extraBold, .mi._extraBold, .ms._extraBold',
		defaultValue: '800',
	},
	{
		name: 'iconBlackWeight',
		displayName: 'Icon Black Weight',
		description: 'Icon Black Weight',
		noPrefix: true,
		cssProperty: 'font-weight',
		selector: '.fa._black, .mi._black, .ms._black',
		defaultValue: '900',
	},

	{
		name: 'iconSize1',
		displayName: 'Icon Size 1',
		description: 'Icon Size 1',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size1::before, .mi._size1::before, .ms._size1::before',
		defaultValue: '1em',
	},
	{
		name: 'iconSize2',
		displayName: 'Icon Size 2',
		description: 'Icon Size 2',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size2::before, .mi._size2::before, .ms._size2::before',
		defaultValue: '1.5em',
	},
	{
		name: 'iconSize3',
		displayName: 'Icon Size 3',
		description: 'Icon Size 3',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size3::before, .mi._size3::before, .ms._size3::before',
		defaultValue: '2em',
	},
	{
		name: 'iconSize4',
		displayName: 'Icon Size 4',
		description: 'Icon Size 4',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size4::before, .mi._size4::before, .ms._size4::before',
		defaultValue: '2.5em',
	},
	{
		name: 'iconSize5',
		displayName: 'Icon Size 5',
		description: 'Icon Size 5',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size5::before, .mi._size5::before, .ms._size5::before',
		defaultValue: '3em',
	},
	{
		name: 'iconSize6',
		displayName: 'Icon Size 6',
		description: 'Icon Size 6',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size6::before, .mi._size6::before, .ms._size6::before',
		defaultValue: '3.5em',
	},
	{
		name: 'iconSize7',
		displayName: 'Icon Size 7',
		description: 'Icon Size 7',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size7::before, .mi._size7::before, .ms._size7::before',
		defaultValue: '4em',
	},
	{
		name: 'iconSize8',
		displayName: 'Icon Size 8',
		description: 'Icon Size 8',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '.fa._size8::before, .mi._size8::before, .ms._size8::before',
		defaultValue: '4.5em',
	},

	// Global Theme
	{
		groupName: 'Primary Font',
		displayName: 'Primary Font',
		name: 'primaryFont',
		defaultValue: '14px/16px Asap',
		description: 'Primary Font used in application.',
		cssProperty: 'font',
		selector: '._primaryFont',
		noPrefix: true,
	},
	{
		groupName: 'Secodary Font',
		displayName: 'Secondary Font',
		name: 'secondaryFont',
		defaultValue: '18px/20px Asap',
		description: 'Secondary Font used in application.',
		cssProperty: 'font',
		selector: '._secondaryFont',
		noPrefix: true,
	},
	{
		groupName: 'Tertiary Font',
		displayName: 'Tertiary Font',
		name: 'tertiaryFont',
		defaultValue: '16px/18px Asap',
		description: 'Tertiary Font used in application.',
		cssProperty: 'font',
		selector: '._tertiaryFont',
		noPrefix: true,
	},
	{
		groupName: 'Quaternary Font',
		displayName: 'Quaternary Font',
		name: 'quaternaryFont',
		defaultValue: '12px/14px Asap',
		description: 'Quaternary Font used in application.',
		cssProperty: 'font',
		selector: '._quaternaryFont',
		noPrefix: true,
	},
	{
		groupName: 'Quinary Font',
		displayName: 'Quinary Font',
		name: 'quinaryFont',
		defaultValue: '24px/26px Asap',
		description: 'Quinary Font used in application.',
		cssProperty: 'font',
		selector: '._quinaryFont',
		noPrefix: true,
	},
	{
		groupName: 'Senary Font',
		displayName: 'Senary Font',
		name: 'senaryFont',
		defaultValue: '30px/30px Inter',
		description: 'Senary Font used in application.',
		cssProperty: 'font',
		selector: '._senaryFont',
		noPrefix: true,
	},

	{
		groupName: 'Font Style',
		displayName: 'Normal Font Style',
		name: 'normalFontStyle',
		defaultValue: 'normal',
		description: 'Normal Font Style used in application.',
		selector: '._normalFontStyle',
		noPrefix: true,
	},
	{
		groupName: 'Font Style',
		displayName: 'Italic Font Style',
		name: 'italicFontStyle',
		defaultValue: 'italic',
		description: 'Italic Font Style used in application.',
		selector: '._italicFontStyle',
		noPrefix: true,
	},
	{
		groupName: 'Font Style',
		displayName: 'Oblique Font Style',
		name: 'obliqueFontStyle',
		defaultValue: 'oblique',
		description: 'oblique Font Style used in application.',
		selector: '._obliqueFontStyle',
		noPrefix: true,
	},

	{
		groupName: 'Color',
		displayName: 'Color One',
		name: 'colorOne',
		defaultValue: '#52BD94',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Two',
		name: 'colorTwo',
		defaultValue: '#08705C',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Three',
		name: 'colorThree',
		defaultValue: '#FFC728',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Four',
		name: 'colorFour',
		defaultValue: '#EC6B5F',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Five',
		name: 'colorFive',
		defaultValue: '#4D7FEE',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Six',
		name: 'colorSix',
		defaultValue: '#333333',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Seven',
		name: 'colorSeven',
		defaultValue: '#FFFFFF',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Eight',
		name: 'colorEight',
		defaultValue: '#8E90A4',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Nine',
		name: 'colorNine',
		defaultValue: '#E5E5E5',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Ten',
		name: 'colorTen',
		defaultValue: '#0085F2',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Eleven',
		name: 'colorEleven',
		defaultValue: '#61c554',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Twelve',
		name: 'colorTwelve',
		defaultValue: '#FE3939',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Thirteen',
		name: 'colorThirteen',
		defaultValue: '#A3A3A3',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Fourteen',
		name: 'colorFourteen',
		defaultValue: '#A3A3A3',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Color Fifteen',
		name: 'colorFifteen',
		defaultValue: '#6A7FFF',
		noPrefix: true,
	},

	{
		groupName: 'Color',
		displayName: 'Color Sixteen',
		name: 'colorSixteen',
		defaultValue: '#333333',
		noPrefix: true,
	},

	{
		groupName: 'Font Color',
		displayName: 'Font Color One',
		name: 'fontColorOne',
		defaultValue: '<colorSix>',
		description: 'Font Color One used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Two',
		name: 'fontColorTwo',
		defaultValue: '<colorSeven>',
		description: 'Font Color Two used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Three',
		name: 'fontColorThree',
		defaultValue: '<colorOne>',
		description: 'Font Color Three used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Four',
		name: 'fontColorFour',
		defaultValue: '<colorTwo>',
		description: 'Font Color Four used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Five',
		name: 'fontColorFive',
		defaultValue: '<colorThree>',
		description: 'Font Color Five used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Six',
		name: 'fontColorSix',
		defaultValue: '<colorNine>',
		description: 'Font Color Six used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Seven',
		name: 'fontColorSeven',
		defaultValue: '<colorFive>',
		description: 'Font Color Seven used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Eight',
		name: 'fontColorEight',
		defaultValue: '<colorThirteen>',
		description: 'Font Color Eight used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Nine',
		name: 'fontColorNine',
		defaultValue: '<colorFour>',
		description: 'Font Color Nine used in application',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Font Color Ten',
		name: 'fontColorTen',
		defaultValue: '<colorSixteen>',
		description: 'Font Color Ten used in application',
		noPrefix: true,
	},

	{
		groupName: 'Background Color',
		displayName: 'Background Color One',
		name: 'backgroundColorOne',
		defaultValue: '<colorOne>',
		description: 'Background One used in application',
		cssProperty: 'background',
		selector: '._PRIMARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Two',
		name: 'backgroundColorTwo',
		defaultValue: '<colorTwo>',
		description: 'Background Two used in application',
		cssProperty: 'background',
		selector: '._SECONDARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Three',
		name: 'backgroundColorThree',
		defaultValue: '<colorThree>',
		description: 'Background Three used in application',
		cssProperty: 'background',
		selector: '._TERTIARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Four',
		name: 'backgroundColorFour',
		defaultValue: '<colorFour>',
		description: 'Background Four used in application',
		cssProperty: 'background',
		selector: '._QUATERNARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Five',
		name: 'backgroundColorFive',
		defaultValue: '<colorFive>',
		description: 'Background Five used in application',
		cssProperty: 'background',
		selector: '._QUINARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Six',
		name: 'backgroundColorSix',
		defaultValue: '<colorSix>',
		description: 'Background Six used in application',
		cssProperty: 'background',
		selector: '._SENARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Seven',
		name: 'backgroundColorSeven',
		defaultValue: '<colorSeven>',
		description: 'Background Seven used in application',
		cssProperty: 'background',
		selector: '._SEPTENARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Eight',
		name: 'backgroundColorEight',
		defaultValue: '<colorThirteen>',
		description: 'Background Eight used in application',
		cssProperty: 'background',
		selector: '._OCTONARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Nine',
		name: 'backgroundColorNine',
		defaultValue: '<colorNine>',
		description: 'Background Nine used in application',
		cssProperty: 'background',
		selector: '._NONARYBG',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Color Ten',
		name: 'backgroundColorTen',
		defaultValue: 'transparent',
		description: 'Background Ten used in application',
		noPrefix: true,
	},

	{
		groupName: 'Border Color',
		displayName: 'Border Color One',
		name: 'borderColorOne',
		defaultValue: '<colorSix>',
		description: 'Border Color One used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Two',
		name: 'borderColorTwo',
		defaultValue: '<colorSeven>',
		description: 'Border Color Two used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Three',
		name: 'borderColorThree',
		defaultValue: '<colorOne>',
		description: 'Border Color Three used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Four',
		name: 'borderColorFour',
		defaultValue: '<colorTwo>',
		description: 'Border Color Four used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Five',
		name: 'borderColorFive',
		defaultValue: '<colorThree>',
		description: 'Border Color Five used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Six',
		name: 'borderColorSix',
		defaultValue: '<colorNine>',
		description: 'Border Color Six used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Border Color Seven',
		name: 'borderColorSeven',
		defaultValue: '<colorFive>',
		description: 'Border Color Seven used in application.',
		noPrefix: true,
	},

	{
		groupName: 'Letter Spacing',
		displayName: 'Letter Spacing One',
		name: 'letterSpacingOne',
		defaultValue: 'normal',
		description: 'Letter Spacing One used in application.',
		noPrefix: true,
	},
	{
		groupName: 'Letter Spacing',
		displayName: 'Letter Spacing Two',
		name: 'letterSpacingTwo',
		defaultValue: '0.16px',
		description: 'Letter Spacing Two used in application.',
		noPrefix: true,
	},

	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color One',
		name: 'gradientColorOne',
		defaultValue: 'linear-gradient(90deg, <backgroundColorOne>, transparent)',
		description: 'Gradient One used in application',
		cssProperty: 'background',
		selector: '._PRIMARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Two',
		name: 'gradientColorTwo',
		defaultValue: 'linear-gradient(90deg, <backgroundColorTwo>, transparent)',
		description: 'Gradient Two used in application',
		cssProperty: 'background',
		selector: '._SECONDARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Three',
		name: 'gradientColorThree',
		defaultValue: 'linear-gradient(90deg, <backgroundColorThree>, transparent)',
		description: 'Gradient Three used in application',
		cssProperty: 'background',
		selector: '._TERTIARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Four',
		name: 'gradientColorFour',
		defaultValue: 'linear-gradient(90deg, <backgroundColorFour>, transparent)',
		description: 'Gradient Four used in application',
		cssProperty: 'background',
		selector: '._QUATERNARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Five',
		name: 'gradientColorFive',
		defaultValue: 'linear-gradient(90deg, <backgroundColorFive>, transparent)',
		description: 'Gradient Five used in application',
		cssProperty: 'background',
		selector: '._QUINARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Six',
		name: 'gradientColorSix',
		defaultValue: 'linear-gradient(90deg, <backgroundColorSix>, transparent)',
		description: 'Gradient Six used in application',
		cssProperty: 'background',
		selector: '._SENARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Seven',
		name: 'gradientColorSeven',
		defaultValue: 'linear-gradient(90deg, <backgroundColorSeven>, transparent)',
		description: 'Gradient Seven used in application',
		cssProperty: 'background',
		selector: '._SEPTENARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Eight',
		name: 'gradientColorEight',
		defaultValue: 'linear-gradient(90deg, <backgroundColorEight>, transparent)',
		description: 'Gradient Eight used in application',
		cssProperty: 'background',
		selector: '._OCTONARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Nine',
		name: 'gradientColorNine',
		defaultValue: 'linear-gradient(90deg, <backgroundColorNine>, transparent)',
		description: 'Gradient Nine used in application',
		cssProperty: 'background',
		selector: '._NONARYGRADBG',
		noPrefix: true,
	},
	{
		groupName: 'Gradient Color',
		displayName: 'Gradient Color Ten',
		name: 'gradientColorTen',
		defaultValue: 'linear-gradient(90deg, <backgroundColorTen>, transparent)',
		description: 'Gradient Ten used in application',
		noPrefix: true,
	},

	{
		groupName: 'Success Color',
		displayName: 'Success Color',
		name: 'successColor',
		defaultValue: '#227700',
		noPrefix: true,
	},
	{
		groupName: 'Information Color',
		displayName: 'Information Color',
		name: 'informationColor',
		defaultValue: '#059',
		noPrefix: true,
	},
	{
		groupName: 'Warning Color',
		displayName: 'Warning Color',
		name: 'warningColor',
		defaultValue: '#e5d122',
		noPrefix: true,
	},
	{
		groupName: 'Error Color',
		displayName: 'Error Color',
		name: 'errorColor',
		defaultValue: '#ed6a5e',
		noPrefix: true,
	},

	{
		groupName: 'Validation Message',
		displayName: 'Validation Message Font',
		name: 'validationMessageFont',
		defaultValue: '<quaternaryFont>',
		cssProperty: 'font',
		selector: '._validationMessages',
		noPrefix: true,
	},
	{
		groupName: 'Validation Message',
		displayName: 'Validation Message Color',
		name: 'validationMessageFontColor',
		defaultValue: '<errorColor>',
		cssProperty: 'color',
		selector: '._validationMessages',
		noPrefix: true,
	},

	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color One',
		name: 'backgroundHoverColorOne',
		defaultValue: '#A8DEC9',
		description: 'Background Hover One used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Two',
		name: 'backgroundHoverColorTwo',
		defaultValue: '#81B7AB',
		description: 'Background Hover Two used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Three',
		name: 'backgroundHoverColorThree',
		defaultValue: '#FFE193',
		description: 'Background Hover Three used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Four',
		name: 'backgroundHoverColorFour',
		defaultValue: '#F3B4AE',
		description: 'Background Hover Four used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Five',
		name: 'backgroundHoverColorFive',
		defaultValue: '#A5BDF6',
		description: 'Background Hover Five used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Six',
		name: 'backgroundHoverColorSix',
		defaultValue: '#999999',
		description: 'Background Hover Six used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Seven',
		name: 'backgroundHoverColorSeven',
		defaultValue: '#DDDDDD',
		description: 'Background Hover Seven used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Eight',
		name: 'backgroundHoverColorEight',
		defaultValue: '#DDDDDD',
		description: 'Background Hover Eight used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Hover Color',
		displayName: 'Background Hover Color Nine',
		name: 'backgroundHoverColorNine',
		defaultValue: '#FFFFFF',
		description: 'Background Hover Nine used in application',
		noPrefix: true,
	},

	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color One',
		name: 'backgroundDarkerColorOne',
		defaultValue: '#1e4e3c',
		description: 'Background Darker One used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Two',
		name: 'backgroundDarkerColorTwo',
		defaultValue: '#032d25',
		description: 'Background Darker Two used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Three',
		name: 'backgroundDarkerColorThree',
		defaultValue: '#765700',
		description: 'Background Darker Three used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Four',
		name: 'backgroundDarkerColorFour',
		defaultValue: '#76170e',
		description: 'Background Darker Four used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Five',
		name: 'backgroundDarkerColorFive',
		defaultValue: '#0b2b73',
		description: 'Background Darker Five used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Six',
		name: 'backgroundDarkerColorSix',
		defaultValue: '#141414',
		description: 'Background Darker Six used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Seven',
		name: 'backgroundDarkerColorSeven',
		defaultValue: '#666666',
		description: 'Background Darker Seven used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Eight',
		name: 'backgroundDarkerColorEight',
		defaultValue: '#373844',
		description: 'Background Darker Eight used in application',
		noPrefix: true,
	},
	{
		groupName: 'Background Color',
		displayName: 'Background Darker Color Nine',
		name: 'backgroundDarkerColorNine',
		defaultValue: '#5c5c5c',
		description: 'Background Darker Nine used in application',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
