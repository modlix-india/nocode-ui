import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>();

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = [
	{
		cp: 'color',
		sel: '.comp.compTabs._line<colorScheme> > .tabsContainer > .tabDiv._active, .comp.compTabs<designType><colorScheme> > .tabsContainer > .tabDiv._active, .comp.compTabs._underLine<colorScheme> > .tabsContainer > .tabDiv._active',
		np: true,
		spv: {
			'_default-_primary': '<fontColorThree>',
			'_default-_secondary': '<fontColorFour>',
			'_default-_tertiary': '<fontColorFive>',
			'_default-_quaternary': '<fontColorNine>',
			'_default-_quinary': '<fontColorSeven>',
		},
		gn: 'Color',
		dn: 'Color Active',
		n: 'tabsColorActive<designType><colorScheme>',
	},
	{
		cp: 'background',
		sel: '.comp.compTabs<designType><colorScheme>  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_highlight-_primary': '<backgroundColorOne>',
			'_highlight-_secondary': '<backgroundColorTwo>',
			'_highlight-_tertiary': '<backgroundColorThree>',
			'_highlight-_quaternary': '<backgroundColorFour>',
			'_highlight-_quinary': '<backgroundColorFive>',
			'_default-': '<tabChildContainerBackground>',
			'_line-': '<tabChildContainerBackground>',
		},
		gn: 'Background',
		dn: 'Background TabHighlighter',
		n: 'tabsBackgroundTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'transform',
		sel: '.comp.compTabs<designType><colorScheme>  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_highlight-': 'scale(0.8)',
		},
		gn: 'Transform',
		dn: 'Transform TabHighlighter',
		n: 'tabsTransformTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'box-shadow',
		sel: '.comp.compTabs<designType><colorScheme>  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_default-': '0px 0px 6px #DDD',
			'_line-': '0px 0px 6px #DDD',
			'_highlight-': '0px 0px 6px #DDD',
		},
		gn: 'Box Shadow',
		dn: 'BoxShadow TabHighlighter',
		n: 'tabsBoxShadowTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'font',
		sel: '.comp.compTabs<designType><colorScheme> .tabDiv',
		np: true,
		gn: 'Font',
		dn: 'Font TabDiv',
		n: 'tabsFontTabDiv<designType><colorScheme>',
		dv: '<primaryFont>',
	},
	{
		cp: 'gap',
		sel: '.comp.compTabs<designType><colorScheme> .tabDiv',
		np: true,
		gn: 'Gap',
		dn: 'Gap TabDiv',
		n: 'tabsGapTabDiv<designType><colorScheme>',
		dv: '5px',
	},
	{
		cp: 'padding',
		sel: '.comp.compTabs<designType><colorScheme> .tabGridDiv',
		np: true,
		gn: 'Padding',
		dn: 'Padding TabGridDiv',
		n: 'tabsPaddingTabGridDiv<designType><colorScheme>',
		dv: '5px',
	},
	{
		cp: 'background',
		sel: '.comp.compTabs<designType><colorScheme> .tabsContainer',
		np: true,
		gn: 'Background',
		dn: 'Background TabsContainer',
		n: 'tabsBackgroundTabsContainer<designType><colorScheme>',
		dv: 'transparent',
	},
	{
		cp: 'background',
		sel: '.comp.compTabs<designType><colorScheme> > .tabGridDiv',
		np: true,
		spv: {
			'_default-': '#FCFCFC',
			'_line-': '#FCFCFC',
			'_highlight-': '#FCFCFC',
			'_underLine-': 'transparent',
		},
		gn: 'Background',
		dn: 'Background TabGridDiv',
		n: 'tabsBackgroundTabGridDiv<designType><colorScheme>',
	},
	{
		cp: 'gap',
		sel: '.comp.compTabs<designType><colorScheme> > .tabsContainer',
		np: true,
		spv: {
			'_default-': '0px',
			'_line-': '0px',
			'_highlight-': '0px',
			'_underLine-': '10px',
		},
		gn: 'Gap',
		dn: 'Gap TabsContainer',
		n: 'tabsGapTabsContainer<designType><colorScheme>',
	},
	{
		cp: 'color',
		sel: '.comp.compTabs<designType><colorScheme> > .tabsContainer > .tabDiv',
		np: true,
		spv: {
			'_underLine-': '<borderColorSix>',
		},
		gn: 'Color',
		dn: 'Color TabDiv',
		n: 'tabsColorTabDiv<designType><colorScheme>',
	},
	{
		cp: 'border-radius',
		sel: '.comp.compTabs<designType><colorScheme>._horizontal  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_default-': '3px 3px 0px 0px',
			'_line-': 'none',
			'_highlight-': '4px',
		},
		gn: 'Border Radius',
		dn: 'BorderRadius Horizontal TabHighlighter',
		n: 'tabsBorderRadiusHorizontalTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'padding',
		sel: '.comp.compTabs<designType><colorScheme>._horizontal > .tabsContainer > .tabDiv',
		np: true,
		spv: {
			'_default-': '3px 8px',
			'_line-': '3px 8px',
			'_highlight-': '8px 8px',
			'_underLine-': '5px 0px',
		},
		gn: 'Padding',
		dn: 'Padding Horizontal TabDiv',
		n: 'tabsPaddingHorizontalTabDiv<designType><colorScheme>',
	},
	{
		cp: 'border',
		sel: '.comp.compTabs<designType><colorScheme>._horizontal > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_default-': 'none',
			'_highlight-': '4px solid transparent',
			'_underLine-': 'none, none, 3px solid, none',
			'_line-': '2px solid, none, none, none',
		},
		gn: 'Border',
		dn: 'Border Horizontal TabHighlighter',
		n: 'tabsBorderHorizontalTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'border',
		sel: '.comp.compTabs<designType><colorScheme>._horizontal > .tabsContainer > .tabsSeperator',
		np: true,
		spv: {
			'_default-': 'none',
			'_line-': 'none',
			'_highlight-': 'none',
			'_underLine-': 'none, none, 1px solid <borderColorSix>, none',
		},
		gn: 'Border',
		dn: 'Border Horizontal Tabs Seperator',
		n: 'tabsBorderHorizontalTabsSeperator<designType><colorScheme>',
	},
	{
		cp: 'border-radius',
		sel: '.comp.compTabs<designType><colorScheme>._vertical  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_default-': '3px 0px 0px 3px',
			'_line-': 'none',
			'_highlight-': '4px',
		},
		gn: 'Border Radius',
		dn: 'BorderRadius Vertical TabHighlighter',
		n: 'tabsBorderRadiusVerticalTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'padding',
		sel: '.comp.compTabs<designType><colorScheme>._vertical > .tabsContainer > .tabDiv',
		np: true,
		spv: {
			'_default-': '3px 8px',
			'_line-': '3px 8px',
			'_highlight-': '8px 8px',
			'_underLine-': '0px 5px',
		},
		gn: 'Padding',
		dn: 'Padding Vertical TabDiv',
		n: 'tabsPaddingVerticalTabDiv<designType><colorScheme>',
	},
	{
		cp: 'border',
		sel: '.comp.compTabs<designType><colorScheme>._vertical > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_default-': 'none',
			'_line-': 'none, none, none, 2px solid',
			'_highlight-': '4px solid transparent',
			'_underLine-': 'none, 3px solid, none, none',
		},
		gn: 'Border',
		dn: 'Border Vertical TabHighlighter',
		n: 'tabsBorderVerticalTabHighlighter<designType><colorScheme>',
	},
	{
		cp: 'border',
		sel: '.comp.compTabs<designType><colorScheme>._vertical > .tabsContainer > .tabsSeperator',
		np: true,
		spv: {
			'_default-': 'none',
			'_line-': 'none',
			'_highlight-': 'none',
			'_underLine-': 'none, 1px solid <borderColorSix>, none, none',
		},
		gn: 'Border',
		dn: 'Border Vertical Tabs Seperator',
		n: 'tabsBorderVerticalTabsSeperator<designType><colorScheme>',
	},
	{
		cp: 'border-color',
		sel: '.comp.compTabs<designType><colorScheme>._horizontal  > .tabsContainer > .tabHighlighter, .comp.compTabs<designType><colorScheme>._vertical  > .tabsContainer > .tabHighlighter',
		np: true,
		spv: {
			'_line-_primary': '<fontColorThree>',
			'_line-_secondary': '<fontColorFour>',
			'_line-_tertiary': '<fontColorFive>',
			'_line-_quaternary': '<fontColorNine>',
			'_line-_quinary': '<fontColorSeven>',
			'_underLine-_primary': '<fontColorThree>',
			'_underLine-_secondary': '<fontColorFour>',
			'_underLine-_tertiary': '<fontColorFive>',
			'_underLine-_quaternary': '<fontColorNine>',
			'_underLine-_quinary': '<fontColorSeven>',
		},
		gn: 'Border Color',
		dn: 'BorderColor TabHighlighter',
		n: 'tabsBorderColorTabHighlighter<designType><colorScheme>',
	},
];
