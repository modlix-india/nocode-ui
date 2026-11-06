import { inflateThemeStylePropsOnce } from '../lazyStylePropertyUtil';
import { propertiesDefinition as textProps } from '../../Text/textProperties';
import { stylePropertiesForTheme as textTheme } from '../../Text/TextStyleProperties';

describe('inflateThemeStylePropsOnce', () => {
	const props: any = [
		{
			name: 'size',
			enumValues: [
				{ name: 'S', displayName: 'S' },
				{ name: 'L', displayName: 'L' },
			],
		},
	];
	const theme: any = [
		{ n: 'pad<size>', cp: 'padding', sel: '.x<size>', spv: { S: '1px', L: '2px' } },
	];

	it('expands the variants once and says so', () => {
		const styleProperties: any[] = [];
		const defaults = new Map<string, string>();
		expect(inflateThemeStylePropsOnce(props, ['size'], theme, styleProperties, defaults)).toBe(
			true,
		);
		expect(styleProperties.map(e => e.sel)).toEqual(['.x.S', '.x.L']);
		expect(defaults.get('padS')).toBe('1px');
		expect(defaults.get('padL')).toBe('2px');

		expect(inflateThemeStylePropsOnce(props, ['size'], theme, styleProperties, defaults)).toBe(
			false,
		);
		expect(styleProperties).toHaveLength(2);
	});

	it('gives Text its heading sizes without waiting for a timer', () => {
		const styleProperties: any[] = [];
		const defaults = new Map<string, string>();
		inflateThemeStylePropsOnce(
			textProps,
			['textContainer', 'textColor'],
			textTheme,
			styleProperties,
			defaults,
		);
		expect(
			styleProperties.some(
				e => e.sel === '.comp.compText.H2._coloredText1' && e.cp === 'font',
			),
		).toBe(true);
	});
});
