import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Primary Progress Bar Progress Color',
		name: 'primaryProgressBGColorProgress',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._primary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Secondary Progress Bar Progress Color',
		name: 'secondaryProgressBGColorProgress',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._secondary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Tertiary Progress Bar Progress Color',
		name: 'tertiaryProgressBGColorProgress',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._tertiary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quaternary Progress Bar Progress Color',
		name: 'quaternaryProgressBGColorProgress',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._quaternary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quinary Progress Bar Progress Color',
		name: 'quinaryProgressBGColorProgress',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._quinary ._progress',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Background',
		displayName: 'Default Design Progress Bar Background',
		name: 'progressBarBackgroundColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default ._track, .comp.compProgressBar._striped  ._track',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Border Radius',
		displayName: 'Default Design Progress Bar Border Radius',
		name: 'progressBarBorderRadius',
		defaultValue: '10px',
		cssProperty: 'border-radius',
		selector:
			'.comp.compProgressBar._default  ._track, .comp.compProgressBar._default ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Border Radius',
		displayName: 'Striped Design Progress Bar Border Radius',
		name: 'stripedProgressBarBorderRadius',
		defaultValue: '2px',
		cssProperty: 'border-radius',
		selector:
			'.comp.compProgressBar._striped  ._track, .comp.compProgressBar._striped ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Progress Bar Light Font Color',
		name: 'progressBarLightFontColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default ._progress, .comp.compProgressBar._striped ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Font Color',
		displayName: 'Progress Bar Dark Font Color',
		name: 'progressBarDarkFontColor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default ._progress._top, .comp.compProgressBar._default ._progress._bottom, .comp.compProgressBar._striped ._progress._top, .comp.compProgressBar._striped ._progress._bottom',
		noPrefix: true,
	},

	{
		groupName: 'Padding',
		displayName: 'Progress Bar Text Padding Left',
		name: 'progressBarTextLeftPadding',
		defaultValue: '5px',
		cssProperty: 'padding-left',
		selector:
			'.comp.compProgressBar._default ._progress._left, .comp.compProgressBar._striped ._progress._left',
		noPrefix: true,
	},
	{
		groupName: 'Padding',
		displayName: 'Progress Bar Text Padding Right',
		name: 'progressBarTextRightPadding',
		defaultValue: '5px',
		cssProperty: 'padding-right',
		selector:
			'.comp.compProgressBar._default ._progress._right, .comp.compProgressBar._striped ._progress._right',
		noPrefix: true,
	},
	{
		groupName: 'Padding',
		displayName: 'Progress Bar Text Padding Top',
		name: 'progressBarTextTopPadding',
		defaultValue: '5px',
		cssProperty: 'padding-top',
		selector:
			'.comp.compProgressBar._default ._progress._top, .comp.compProgressBar._striped ._progress._top',
		noPrefix: true,
	},
	{
		groupName: 'Padding',
		displayName: 'Progress Bar Text Padding Bottom',
		name: 'progressBarTextBottomPadding',
		defaultValue: '5px',
		cssProperty: 'padding-bottom',
		selector:
			'.comp.compProgressBar._default ._progress._bottom, .comp.compProgressBar._striped ._progress._bottom',
		noPrefix: true,
	},

	{
		groupName: 'Height',
		displayName: 'Progress Bar Height Default Design',
		name: 'progressBarHeightWithoutText',
		defaultValue: '10px',
		cssProperty: 'height',
		selector:
			'.comp.compProgressBar._default  ._track, .comp.compProgressBar._striped  ._track',
		noPrefix: true,
	},
	{
		groupName: 'Height',
		displayName: 'Progress Bar Height Default Design With Text',
		name: 'progressBarHeightWithText',
		defaultValue: '16px',
		cssProperty: 'height',
		selector:
			'.comp.compProgressBar._default._hasLabel  ._track, .comp.compProgressBar._striped._hasLabel  ._track',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Outside Text Color',
		displayName: 'Primary Progress Bar Outside Text Color',
		name: 'primaryProgressOutsideTextColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._primary > ._top, .comp.compProgressBar._default._primary > ._bottom, .comp.compProgressBar._striped._primary > ._top, .comp.compProgressBar._striped._primary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Color',
		displayName: 'Secondary Progress Bar Outside Text Color',
		name: 'secondaryProgressOutsideTextColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._secondary > ._top, .comp.compProgressBar._default._secondary > ._bottom, .comp.compProgressBar._striped._secondary > ._top, .comp.compProgressBar._striped._secondary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Color',
		displayName: 'Tertiary Progress Bar Outside Text Color',
		name: 'tertiaryProgressOutsideTextColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._tertiary > ._top, .comp.compProgressBar._default._tertiary > ._bottom, .comp.compProgressBar._striped._tertiary > ._top, .comp.compProgressBar._striped._tertiary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Color',
		displayName: 'Quaternary Progress Bar Outside Text Color',
		name: 'quaternaryProgressOutsideTextColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._quaternary > ._top, .comp.compProgressBar._default._quaternary > ._bottom, .comp.compProgressBar._striped._quaternary > ._top, .comp.compProgressBar._striped._quaternary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Color',
		displayName: 'Quinary Progress Bar Outside Text Color',
		name: 'quinaryProgressOutsideTextColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._quinary > ._top, .comp.compProgressBar._default._quinary > ._bottom, .comp.compProgressBar._striped._quinary > ._top, .comp.compProgressBar._striped._quinary > ._bottom',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Outside Text Padding',
		displayName: 'Progress Bar Outside Text Top Padding',
		name: 'progressOutsideTextTopPadding',
		defaultValue: '5px',
		cssProperty: 'padding-top',
		selector:
			'.comp.compProgressBar._default > ._bottom, .comp.compProgressBar._striped > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Padding',
		displayName: 'Progress Bar Outside Text Bottom Padding',
		name: 'progressOutsideTextBottomPadding',
		defaultValue: '5px',
		cssProperty: 'padding-bottom',
		selector: '.comp.compProgressBar._default > ._top, .comp.compProgressBar._striped > ._top',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Padding',
		displayName: 'Progress Bar Outside Text Left Padding',
		name: 'progressOutsideTextLeftPadding',
		defaultValue: '5px',
		cssProperty: 'padding-left',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Outside Text Padding',
		displayName: 'Progress Bar Outside Text Right Padding',
		name: 'progressOutsideTextRightPadding',
		defaultValue: '5px',
		cssProperty: 'padding-right',
		noPrefix: true,
	},

	{
		groupName: 'Striped Background',
		displayName: 'Progress Bar Striped design background Primary Color Scheme',
		name: 'primaryProgressBarStripedBackground',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorOne>, <backgroundColorOne> 10px, <backgroundColorOne>66 10px, <backgroundColorOne>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._primary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Striped Background',
		displayName: 'Progress Bar Striped design background Secondary Color Scheme',
		name: 'secondaryProgressBarStripedBackground',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorTwo>, <backgroundColorTwo> 10px, <backgroundColorTwo>66 10px, <backgroundColorTwo>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._secondary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Striped Background',
		displayName: 'Progress Bar Striped design background Tertiary Color Scheme',
		name: 'tertiaryProgressBarStripedBackground',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorThree>, <backgroundColorThree> 10px, <backgroundColorThree>66 10px, <backgroundColorThree>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._tertiary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Striped Background',
		displayName: 'Progress Bar Striped design background Quaternary Color Scheme',
		name: 'quaternaryProgressBarStripedBackground',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorFour>, <backgroundColorFour> 10px, <backgroundColorFour>66 10px, <backgroundColorFour>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._quaternary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Striped Background',
		displayName: 'Progress Bar Striped design background Quinary Color Scheme',
		name: 'quinaryProgressBarStripedBackground',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorFive>, <backgroundColorFive> 10px, <backgroundColorFive>66 10px, <backgroundColorFive>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._quinary ._progress',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Primary Circular Progress Bar Track BG Color',
		name: 'circularProgressColorPrimary',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._primary ._circular_track, .comp.compProgressBar._circular_text_background._primary ._circular_track, .comp.compProgressBar._circular_text_background_outline._primary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Secondary Circular Progress Bar Track BG Color',
		name: 'circularProgressColorSecondary',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._secondary ._circular_track, .comp.compProgressBar._circular_text_background._secondary ._circular_track, .comp.compProgressBar._circular_text_background_outline._secondary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Tertiary Circular Progress Bar Track BG Color',
		name: 'circularProgressColorTertiary',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._tertiary ._circular_track, .comp.compProgressBar._circular_text_background._tertiary ._circular_track, .comp.compProgressBar._circular_text_background_outline._tertiary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quaternary Circular Progress Bar Track BG Color',
		name: 'circularProgressColorQuaternary',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._quaternary ._circular_track, .comp.compProgressBar._circular_text_background._quaternary ._circular_track, .comp.compProgressBar._circular_text_background_outline._quaternary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quinary Circular Progress Bar Track BG Color',
		name: 'circularProgressColorQuinary',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._quinary ._circular_track, .comp.compProgressBar._circular_text_background._quinary ._circular_track, .comp.compProgressBar._circular_text_background_outline._quinary ._circular_track',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator BG Color',
		displayName: 'Primary Circular Progress Bar Indicator BG Color',
		name: 'circularProgressIndicatorColorPrimary',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._primary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background._primary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background_outline._primary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator BG Color',
		displayName: 'Secondary Circular Progress Bar Indicator BG Color',
		name: 'circularProgressIndicatorColorSecondary',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._secondary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background._secondary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background_outline._secondary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator BG Color',
		displayName: 'Tertiary Circular Progress Bar Indicator BG Color',
		name: 'circularProgressIndicatorColorTertiary',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._tertiary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background._tertiary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background_outline._tertiary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator BG Color',
		displayName: 'Quaternary Circular Progress Bar Indicator BG Color',
		name: 'circularProgressIndicatorColorQuaternary',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._quaternary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background._quaternary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background_outline._quaternary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator BG Color',
		displayName: 'Quinary Circular Progress Bar Indicator BG Color',
		name: 'circularProgressIndicatorColorQuinary',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular._quinary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background._quinary ._circular_progress_indicator, .comp.compProgressBar._circular_text_background_outline._quinary ._circular_progress_indicator',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Primary Circular Progress Bar Label Color',
		name: 'circularProgressLabelColorPrimary',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular._primary ._circular_label, .comp.compProgressBar._circular_text_background._primary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Secondary Circular Progress Bar Label Color',
		name: 'circularProgressLabelColorSecondary',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular._secondary ._circular_label, .comp.compProgressBar._circular_text_background._secondary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Tertiary Circular Progress Bar Label Color',
		name: 'circularProgressLabelColorTertiary',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular._tertiary ._circular_label, .comp.compProgressBar._circular_text_background._tertiary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quaternary Circular Progress Bar Label Color',
		name: 'circularProgressLabelColorQuaternary',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular._quaternary ._circular_label, .comp.compProgressBar._circular_text_background._quaternary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quinary Circular Progress Bar Label Color',
		name: 'circularProgressLabelColorQuinary',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular._quinary ._circular_label, .comp.compProgressBar._circular_text_background._quinary ._circular_label',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator Text Color Outline Style',
		displayName: 'Primary Circular Progress Bar Label Color Outline Style',
		name: 'circularProgressLabelColorOutlineStylePrimary',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color Outline Style',
		displayName: 'Secondary Circular Progress Bar Label Color Outline Style',
		name: 'circularProgressLabelColorOutlineStyleSecondary',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color Outline Style',
		displayName: 'Tertiary Circular Progress Bar Label Color Outline Style',
		name: 'circularProgressLabelColorOutlineStyleTertiary',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color Outline Style',
		displayName: 'Quaternary Circular Progress Bar Label Color Outline Style',
		name: 'circularProgressLabelColorOutlineStyleQuaternary',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color Outline Style',
		displayName: 'Quinary Circular Progress Bar Label Color Outline Style',
		name: 'circularProgressLabelColorOutlineStyleQuinary',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_label',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Primary Circular Progress Bar Label BG Color',
		name: 'circularProgressLabelBGColorPrimary',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._primary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Secondary Circular Progress Bar Label BG Color',
		name: 'circularProgressLabelBGColorSecondary',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._secondary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Tertiary Circular Progress Bar Label BG Color',
		name: 'circularProgressLabelBGColorTertiary',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._tertiary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quaternary Circular Progress Bar Label BG Color',
		name: 'circularProgressLabelBGColorQuaternary',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._quaternary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quinary Circular Progress Bar Label BG Color',
		name: 'circularProgressLabelBGColorQuinary',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._quinary ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Primary Circular Progress Bar Label BG Color',
		name: 'Primary Circular Progress Bar Label BG Color Outlined',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Secondary Circular Progress Bar Label BG Color',
		name: 'Secondary Circular Progress Bar Label BG Color Outlined',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Tertiary Circular Progress Bar Label BG Color',
		name: 'Tertiary Circular Progress Bar Label BG Color Outlined',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quaternary Circular Progress Bar Label BG Color',
		name: 'Quaternary Circular Progress Bar Label BG Color Outlined',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quinary Circular Progress Bar Label BG Color',
		name: 'Quinary Circular Progress Bar Label BG Color Outlined',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Size',
		displayName: 'Circular Progress Label BG Size Width',
		name: 'circularProgressLabelBGSizeWidth',
		defaultValue: '30%',
		cssProperty: 'r',
		selector:
			'.comp.compProgressBar._circular_text_background_outline ._circular_progress ._circular_progres_text_bg, .comp.compProgressBar._circular_text_background ._circular_progress ._circular_progres_text_bg',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
