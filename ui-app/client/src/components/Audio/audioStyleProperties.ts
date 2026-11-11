import { StylePropertyDefinition } from '../../types/common';

/**
 * The waveform design (_audioDesign5). Kept apart from styleProperties and styleDefaults below:
 * those two fill from the lazily loaded Audio.json, and a list or map that is already non empty
 * stops that load. AudioStyle expands these for the colour schemes itself; they are also listed
 * in stylePropertiesForTheme so the theme editor shows them.
 */
export const waveformStylePropertiesForTheme: Array<StylePropertyDefinition> = [
	{
		cp: 'background-color',
		sel: '.comp.compAudio._audioDesign5<colorScheme> ._waveform ._waveformBar',
		np: true,
		spv: {
			_primary: '<backgroundHoverColorOne>',
			_secondary: '<backgroundHoverColorTwo>',
			_tertiary: '<backgroundHoverColorThree>',
			_quaternary: '<backgroundHoverColorFour>',
			_quinary: '<backgroundHoverColorFive>',
		},
		gn: 'Waveform',
		dn: 'Waveform Bar Color',
		n: 'audioWaveformBarColor<colorScheme>',
	},
	{
		cp: 'background-color',
		sel: '.comp.compAudio._audioDesign5<colorScheme> ._waveform ._waveformBar._played',
		np: true,
		spv: {
			_primary: '<backgroundDarkerColorOne>',
			_secondary: '<backgroundDarkerColorTwo>',
			_tertiary: '<backgroundDarkerColorThree>',
			_quaternary: '<backgroundDarkerColorFour>',
			_quinary: '<backgroundDarkerColorFive>',
		},
		gn: 'Waveform',
		dn: 'Waveform Played Color',
		n: 'audioWaveformPlayedColor<colorScheme>',
	},
	{
		cp: 'background-color',
		sel: '.comp.compAudio._audioDesign5<colorScheme> ._waveform ._waveformCursor',
		np: true,
		spv: {
			_primary: '<backgroundDarkerColorOne>',
			_secondary: '<backgroundDarkerColorTwo>',
			_tertiary: '<backgroundDarkerColorThree>',
			_quaternary: '<backgroundDarkerColorFour>',
			_quinary: '<backgroundDarkerColorFive>',
		},
		gn: 'Waveform',
		dn: 'Waveform Cursor Color',
		n: 'audioWaveformCursorColor<colorScheme>',
	},
	{
		cp: '--audio-waveform-bar-width',
		sel: '.comp.compAudio._audioDesign5 ._waveform',
		np: true,
		dv: '3px',
		gn: 'Waveform',
		dn: 'Waveform Bar Width (px)',
		n: 'audioWaveformBarWidth',
	},
	{
		cp: '--audio-waveform-bar-gap',
		sel: '.comp.compAudio._audioDesign5 ._waveform',
		np: true,
		dv: '2px',
		gn: 'Waveform',
		dn: 'Waveform Bar Gap (px)',
		n: 'audioWaveformBarGap',
	},
	{
		cp: 'height',
		sel: '.comp.compAudio._audioDesign5 ._waveform',
		np: true,
		dv: '40px',
		gn: 'Waveform',
		dn: 'Waveform Height',
		n: 'audioWaveformHeight',
	},
];
export const waveformStyleProperties: Array<StylePropertyDefinition> = [];
export const waveformStyleDefaults = new Map<string, string>();

export const styleDefaults = new Map<string, string>();
export const styleProperties: Array<StylePropertyDefinition> = [];
export const stylePropertiesForTheme: Array<StylePropertyDefinition> = [
	...waveformStylePropertiesForTheme,
];
