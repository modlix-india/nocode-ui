import * as fs from 'fs';
import * as path from 'path';
import { StylePropertyDefinition } from '../../../types/common';
import { processEachResolution } from '../../../util/styleProcessor';

/**
 * `dist/styleProperties/PhoneNumber.json` is hand-authored and fetched at runtime, so nothing in
 * the build catches a mistake in it.
 *
 * The clear (x) icon is the same `._clearText._rightIcon` element in a TextBox and a
 * PhoneNumber (both render CommonInputText). The text box sizes it with
 * `textBoxFontSizeIcon`; the phone had no such variable, so its icon inherited the 14px
 * field font beside the text box's 18px one in the same form.
 */

const DIST = path.resolve(__dirname, '../../../../dist/styleProperties');
const read = (name: string): StylePropertyDefinition[] =>
	JSON.parse(fs.readFileSync(path.join(DIST, name + '.json'), 'utf-8'));

const phone = read('PhoneNumber');
const textBox = read('TextBox');

const ICON = 'phoneNumberFontSizeIcon<designType><colorScheme>';

describe('PhoneNumber theme artifact', () => {
	it('declares an icon font size on the right icon, as the text box does', () => {
		const entry = phone.find(p => p.n === ICON);
		expect(entry).toBeDefined();
		expect(entry!.cp).toBe('font-size');
		expect(entry!.np).toBe(true);
		expect(entry!.sel).toBe('.comp.compPhoneNumber<designType><colorScheme> ._rightIcon');

		const reference = textBox.find(p => p.n === 'textBoxFontSizeIcon<designType><colorScheme>');
		expect(reference?.cp).toBe('font-size');
		expect(reference?.sel).toContain('._rightIcon');
	});

	it('has no default, so a theme that does not set it renders as before', () => {
		expect(phone.find(p => p.n === ICON)!.dv).toBeUndefined();
		const css = processEachResolution('', phone, 'ALL', new Map([['unrelated', 'x']]));
		expect(css).not.toContain('._rightIcon {');
	});

	it('emits the same size for the phone icon as the text box icon when the theme sets both', () => {
		const theme = new Map([
			[ICON, '18px'],
			['textBoxFontSizeIcon<designType><colorScheme>', '18px'],
		]);
		const phoneCss = processEachResolution('', phone, 'ALL', theme);
		const textBoxCss = processEachResolution('', textBox, 'ALL', theme);

		expect(phoneCss).toMatch(
			/\.comp\.compPhoneNumber<designType><colorScheme> \._rightIcon \{ font-size: 18px;\s*\}/,
		);
		expect(textBoxCss).toMatch(/\._rightIcon \{ font-size: 18px;\s*\}/);
	});

	it('is still valid JSON with every entry carrying a selector and a property', () => {
		for (const p of phone) {
			expect(p.n).toBeTruthy();
			if (p.n === ICON) expect(p.sel && p.cp).toBeTruthy();
		}
	});
});
