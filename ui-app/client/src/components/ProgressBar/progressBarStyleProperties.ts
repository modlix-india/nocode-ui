import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
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
		groupName: 'Circular Progress Label BG Size',
		displayName: 'Circular Progress Label BG Size Width',
		name: 'circularProgressLabelBGSizeWidth',
		defaultValue: '30%',
		cssProperty: 'r',
		selector:
			'.comp.compProgressBar._circular_text_background_outline ._circular_progress ._circular_progres_text_bg, .comp.compProgressBar._circular_text_background ._circular_progress ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Primary Circular Design Progress Bar Track BG Color',
		name: 'primaryCircularDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._primary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Secondary Circular Design Progress Bar Track BG Color',
		name: 'secondaryCircularDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._secondary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Tertiary Circular Design Progress Bar Track BG Color',
		name: 'tertiaryCircularDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._tertiary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quaternary Circular Design Progress Bar Track BG Color',
		name: 'quaternaryCircularDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._quaternary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quinary Circular Design Progress Bar Track BG Color',
		name: 'quinaryCircularDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._quinary ._circular_track',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Primary Circular Text Bg Design Progress Bar Track BG Color',
		name: 'primaryCircularTextBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular_text_background._primary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Secondary Circular Text Bg Design Progress Bar Track BG Color',
		name: 'secondaryCircularTextBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular_text_background._secondary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Tertiary Circular Text Bg Design Progress Bar Track BG Color',
		name: 'tertiaryCircularTextBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular_text_background._tertiary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quaternary Circular Text Bg Design Progress Bar Track BG Color',
		name: 'quaternaryCircularTextBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular_text_background._quaternary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quinary Circular Text Bg Design Progress Bar Track BG Color',
		name: 'quinaryCircularTextBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular_text_background._quinary ._circular_track',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Primary Circular Text Outline Bg Design Progress Bar Track BG Color',
		name: 'primaryCircularTextOutlineBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Secondary Circular Text Outline Bg Design Progress Bar Track BG Color',
		name: 'secondaryCircularTextOutlineBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Tertiary Circular Text Outline Bg Design Progress Bar Track BG Color',
		name: 'tertiaryCircularTextOutlineBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quaternary Circular Text Outline Bg Design Progress Bar Track BG Color',
		name: 'quaternaryCircularTextOutlineBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_track',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track BG Color',
		displayName: 'Quinary Circular Text Outline Bg Design Progress Bar Track BG Color',
		name: 'quinaryCircularTextOutlineBgDesignProgressBarTrackBGColor',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_track',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Primary Circular Design Progress Bar Track Indicator Color',
		name: 'primaryCircularDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._primary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Secondary Circular Design Progress Bar Track Indicator Color',
		name: 'secondaryCircularDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._secondary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Tertiary Circular Design Progress Bar Track Indicator Color',
		name: 'tertiaryCircularDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._tertiary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Quaternary Circular Design Progress Bar Track Indicator Color',
		name: 'quaternaryCircularDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._quaternary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Quinary Circular Design Progress Bar Track Indicator Color',
		name: 'quinaryCircularDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'stroke',
		selector: '.comp.compProgressBar._circular._quinary ._circular_progress_indicator',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Primary Circular Text Bg Design Progress Bar Track Indicator Color',
		name: 'primaryCircularTextBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background._primary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Secondary Circular Text Bg Design Progress Bar Track Indicator Color',
		name: 'secondaryCircularTextBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background._secondary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Tertiary Circular Text Bg Design Progress Bar Track Indicator Color',
		name: 'tertiaryCircularTextBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background._tertiary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Quaternary Circular Text Bg Design Progress Bar Track Indicator Color',
		name: 'quaternaryCircularTextBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background._quaternary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Quinary Circular Text Bg Design Progress Bar Track Indicator Color',
		name: 'quinaryCircularTextBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background._quinary ._circular_progress_indicator',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Primary Circular Text Outline Bg Design Progress Bar Track Indicator Color',
		name: 'primaryCircularTextOutlineBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Secondary Circular Text Outline Bg Design Progress Bar Track Indicator Color',
		name: 'secondaryCircularTextOutlineBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Tertiary Circular Text Outline Bg Design Progress Bar Track Indicator Color',
		name: 'tertiaryCircularTextOutlineBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName:
			'Quaternary Circular Text Outline Bg Design Progress Bar Track Indicator Color',
		name: 'quaternaryCircularTextOutlineBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_progress_indicator',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Track Indicator Color',
		displayName: 'Quinary Circular Text Outline Bg Design Progress Bar Track Indicator Color',
		name: 'quinaryCircularTextOutlineBgDesignProgressBarTrackIndicatorColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'stroke',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_progress_indicator',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Primary Circular Design Progress Bar Text Color',
		name: 'primaryCircularDesignProgressBarTextColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular._primary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Secondary Circular Design Progress Bar Text Color',
		name: 'secondaryCircularDesignProgressBarTextColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular._secondary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Tertiary Circular Design Progress Bar Text Color',
		name: 'tertiaryCircularDesignProgressBarTextColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular._tertiary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quaternary Circular Design Progress Bar Text Color',
		name: 'quaternaryCircularDesignProgressBarTextColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular._quaternary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quinary Circular Design Progress Bar Text Color',
		name: 'quinaryCircularDesignProgressBarTextColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular._quinary ._circular_label',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Primary Circular Text Bg Design Progress Bar Text Color',
		name: 'primaryCircularTextBgDesignProgressBarTextColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular_text_background._primary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Secondary Circular Text Bg Design Progress Bar Text Color',
		name: 'secondaryCircularTextBgDesignProgressBarTextColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular_text_background._secondary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Tertiary Circular Text Bg Design Progress Bar Text Color',
		name: 'tertiaryCircularTextBgDesignProgressBarTextColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular_text_background._tertiary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quaternary Circular Text Bg Design Progress Bar Text Color',
		name: 'quaternaryCircularTextBgDesignProgressBarTextColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular_text_background._quaternary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quinary Circular Text Bg Design Progress Bar Text Color',
		name: 'quinaryCircularTextBgDesignProgressBarTextColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector: '.comp.compProgressBar._circular_text_background._quinary ._circular_label',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Primary Circular Text Outline Bg Design Progress Bar Text Color',
		name: 'primaryCircularTextOutlineBgDesignProgressBarTextColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Secondary Circular Text Outline Bg Design Progress Bar Text Color',
		name: 'secondaryCircularTextOutlineBgDesignProgressBarTextColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Tertiary Circular Text Outline Bg Design Progress Bar Text Color',
		name: 'tertiaryCircularTextOutlineBgDesignProgressBarTextColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quaternary Circular Text Outline Bg Design Progress Bar Text Color',
		name: 'quaternaryCircularTextOutlineBgDesignProgressBarTextColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_label',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Indicator Text Color',
		displayName: 'Quinary Circular Text Outline Bg Design Progress Bar Text Color',
		name: 'quinaryCircularTextOutlineBgDesignProgressBarTextColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_label',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Primary Circular Design Progress Bar Text Background Color',
		name: 'primaryCircularDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'fill',
		selector: '.comp.compProgressBar._circular._primary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Secondary Circular Design Progress Bar Text Background Color',
		name: 'secondaryCircularDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'fill',
		selector: '.comp.compProgressBar._circular._secondary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Tertiary Circular Design Progress Bar Text Background Color',
		name: 'tertiaryCircularDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'fill',
		selector: '.comp.compProgressBar._circular._tertiary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quaternary Circular Design Progress Bar Text Background Color',
		name: 'quaternaryCircularDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'fill',
		selector: '.comp.compProgressBar._circular._quaternary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quinary Circular Design Progress Bar Text Background Color',
		name: 'quinaryCircularDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'fill',
		selector: '.comp.compProgressBar._circular._quinary ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Primary Circular Text Bg Design Progress Bar Text Background Color',
		name: 'primaryCircularTextBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorOne>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._primary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Secondary Circular Text Bg Design Progress Bar Text Background Color',
		name: 'secondaryCircularTextBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorTwo>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._secondary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Tertiary Circular Text Bg Design Progress Bar Text Background Color',
		name: 'tertiaryCircularTextBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorThree>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._tertiary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quaternary Circular Text Bg Design Progress Bar Text Background Color',
		name: 'quaternaryCircularTextBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFour>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._quaternary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quinary Circular Text Bg Design Progress Bar Text Background Color',
		name: 'quinaryCircularTextBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFive>66',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background._quinary ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Primary Circular Text Outline Bg Design Progress Bar Text Background Color',
		name: 'primaryCircularTextOutlineBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._primary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Secondary Circular Text Outline Bg Design Progress Bar Text Background Color',
		name: 'secondaryCircularTextOutlineBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._secondary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Tertiary Circular Text Outline Bg Design Progress Bar Text Background Color',
		name: 'tertiaryCircularTextOutlineBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._tertiary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName:
			'Quaternary Circular Text Outline Bg Design Progress Bar Text Background Color',
		name: 'quaternaryCircularTextOutlineBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quaternary ._circular_progres_text_bg',
		noPrefix: true,
	},
	{
		groupName: 'Circular Progress Label BG Color',
		displayName: 'Quinary Circular Text Outline Bg Design Progress Bar Text Background Color',
		name: 'quinaryCircularTextOutlineBgDesignProgressBarTextBackgroundColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'fill',
		selector:
			'.comp.compProgressBar._circular_text_background_outline._quinary ._circular_progres_text_bg',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Primary Default Design Progress Bar Progress Bg',
		name: 'primaryDefaultDesignProgressBarProgressBg',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._primary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Secondary Default Design Progress Bar Progress Bg',
		name: 'secondaryDefaultDesignProgressBarProgressBg',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._secondary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Tertiary Default Design Progress Bar Progress Bg',
		name: 'tertiaryDefaultDesignProgressBarProgressBg',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._tertiary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quaternary Default Design Progress Bar Progress Bg',
		name: 'quaternaryDefaultDesignProgressBarProgressBg',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._quaternary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quinary Default Design Progress Bar Progress Bg',
		name: 'quinaryDefaultDesignProgressBarProgressBg',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._default._quinary ._progress',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Primary Striped Design Progress Bar Progress Bg',
		name: 'primaryStripedDesignProgressBarProgressBg',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorOne>, <backgroundColorOne> 10px, <backgroundColorOne>66 10px, <backgroundColorOne>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._primary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Secondary Striped Design Progress Bar Progress Bg',
		name: 'secondaryStripedDesignProgressBarProgressBg',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorTwo>, <backgroundColorTwo> 10px, <backgroundColorTwo>66 10px, <backgroundColorTwo>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._secondary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Tertiary Striped Design Progress Bar Progress Bg',
		name: 'tertiaryStripedDesignProgressBarProgressBg',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorThree>, <backgroundColorThree> 10px, <backgroundColorThree>66 10px, <backgroundColorThree>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._tertiary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quaternary Striped Design Progress Bar Progress Bg',
		name: 'quaternaryStripedDesignProgressBarProgressBg',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorFour>, <backgroundColorFour> 10px, <backgroundColorFour>66 10px, <backgroundColorFour>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._quaternary ._progress',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Progress Background',
		displayName: 'Quinary Striped Design Progress Bar Progress Bg',
		name: 'quinaryStripedDesignProgressBarProgressBg',
		defaultValue:
			'repeating-linear-gradient(75deg, <backgroundColorFive>, <backgroundColorFive> 10px, <backgroundColorFive>66 10px, <backgroundColorFive>66 20px)',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._striped._quinary ._progress',
		noPrefix: true,
	},

	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Primary Default Design Progress Bar Outside Text Color',
		name: 'primaryDefaultDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._primary > ._top, .comp.compProgressBar._default._primary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Secondary Default Design Progress Bar Outside Text Color',
		name: 'secondaryDefaultDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._secondary > ._top, .comp.compProgressBar._default._secondary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Tertiary Default Design Progress Bar Outside Text Color',
		name: 'tertiaryDefaultDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._tertiary > ._top, .comp.compProgressBar._default._tertiary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Quaternary Default Design Progress Bar Outside Text Color',
		name: 'quaternaryDefaultDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._quaternary > ._top, .comp.compProgressBar._default._quaternary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Quinary Default Design Progress Bar Outside Text Color',
		name: 'quinaryDefaultDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._default._quinary > ._top, .comp.compProgressBar._default._quinary > ._bottom',
		noPrefix: true,
	},

	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Primary Striped Design Progress Bar Outside Text Color',
		name: 'primaryStripedDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._striped._primary > ._top, .comp.compProgressBar._striped._primary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Secondary Striped Design Progress Bar Outside Text Color',
		name: 'secondaryStripedDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._striped._secondary > ._top, .comp.compProgressBar._striped._secondary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Tertiary Striped Design Progress Bar Outside Text Color',
		name: 'tertiaryStripedDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._striped._tertiary > ._top, .comp.compProgressBar._striped._tertiary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Quaternary Striped Design Progress Bar Outside Text Color',
		name: 'quaternaryStripedDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._striped._quaternary > ._top, .comp.compProgressBar._striped._quaternary > ._bottom',
		noPrefix: true,
	},
	{
		groupName: 'Progress Text Color Outside',
		displayName: 'Quinary Striped Design Progress Bar Outside Text Color',
		name: 'quinaryStripedDesignProgressBarOutsideTextColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compProgressBar._striped._quinary > ._top, .comp.compProgressBar._striped._quinary > ._bottom',
		noPrefix: true,
	},

	{
		groupName: 'Progress Bar Font',
		displayName: ' Default Design Progress Bar Text Font',
		name: ' DefaultDesignProgressBarTextFont',
		cssProperty: 'font',
		selector: '.comp.compProgressBar._default',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Font',
		displayName: ' Striped Design Progress Bar Text Font',
		name: ' StripedDesignProgressBarTextFont',
		cssProperty: 'font',
		selector: '.comp.compProgressBar._striped',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Font',
		displayName: ' Circular Design Progress Bar Progress Bar Text Font',
		name: ' CircularDesignProgressBarProgressBarTextFont',
		cssProperty: 'font',
		selector: '.comp.compProgressBar._circular',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Font',
		displayName: ' Circular Text Bg Design Progress Bar Progress Bar Text Font',
		name: ' CircularTextBgDesignProgressBarProgressBarTextFont',
		cssProperty: 'font',
		selector: '.comp.compProgressBar._circular_text_background',
		noPrefix: true,
	},
	{
		groupName: 'Progress Bar Font',
		displayName: ' Circular Text Outline Bg Design Progress Bar Progress Bar Text Font',
		name: ' CircularTextOutlineBgDesignProgressBarProgressBarTextFont',
		cssProperty: 'font',
		selector: '.comp.compProgressBar._circular_text_background_outline',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
