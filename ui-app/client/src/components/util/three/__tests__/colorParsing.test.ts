import { isParsableColor } from '../sceneRuntime';

/**
 * The platform's colour picker writes `rgb(94, 192, 164)` into the property.
 * The first version of the pattern put `rgba?\(` inside a `^(...)$` group, so
 * the `$` anchored the whole alternation and that branch could only match the
 * literal string "rgb(". Every real rgb() colour fell through to the grey
 * fallback with a console warning nobody reads, which made the colour swatch
 * -- the normal way anyone picks a colour -- appear to do nothing at all.
 */
describe('colours the picker and the theme actually produce', () => {
	it.each([
		['rgb(94, 192, 164)', 'what the colour swatch writes'],
		['rgba(94, 192, 164, 0.5)', 'the swatch with alpha'],
		['rgb(94 192 164)', 'the modern space-separated form'],
		['rgb(94 192 164 / 50%)', 'space-separated with an alpha slash'],
		['hsl(248, 47%, 20%)', 'hsl'],
		['hsla(248, 47%, 20%, 0.4)', 'hsla'],
		['hsl(248 47% 20%)', 'space-separated hsl'],
	])('accepts %s — %s', value => {
		expect(isParsableColor(value)).toBe(true);
	});

	it.each(['#fff', '#ffff', '#0a0a0a', '#0a0a0aff', '#0A0A0A'])(
		'accepts the hex form %s',
		value => {
			expect(isParsableColor(value)).toBe(true);
		},
	);

	it.each(['red', 'tomato', 'rebeccapurple', 'transparent'])(
		'accepts the named colour %s',
		value => {
			expect(isParsableColor(value)).toBe(true);
		},
	);

	it('tolerates surrounding whitespace, which a pasted value carries', () => {
		expect(isParsableColor('  rgb(1, 2, 3)  ')).toBe(true);
		expect(isParsableColor('\t#123456\n')).toBe(true);
	});
});

describe('what must still be rejected', () => {
	it('refuses stylesheet variable syntax rather than rendering it white', () => {
		// `<colorOne>` is style-sheet syntax. Nothing upstream resolves it, so
		// letting it through would reach three and render as white, which is
		// easily mistaken for a working light scene.
		expect(isParsableColor('<colorOne>')).toBe(false);
	});

	it('refuses a bare opening paren, which is what the bug used to accept', () => {
		expect(isParsableColor('rgb(')).toBe(false);
		expect(isParsableColor('hsl(')).toBe(false);
	});

	it('refuses an unclosed function', () => {
		expect(isParsableColor('rgb(94, 192')).toBe(false);
	});

	it('refuses an empty or non-string value', () => {
		for (const v of ['', '   ', undefined, null, 42, {}, []]) {
			expect(isParsableColor(v)).toBe(false);
		}
	});

	it('refuses a hex of the wrong length', () => {
		expect(isParsableColor('#12345')).toBe(false);
		expect(isParsableColor('#1234567')).toBe(false);
	});
});
