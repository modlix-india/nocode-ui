import * as fs from 'fs';
import * as path from 'path';
import { StylePropertyDefinition } from '../../../types/common';
import { processEachResolution } from '../../../util/styleProcessor';

/**
 * `dist/styleProperties/Dropdown.json` is hand-authored and fetched at runtime, so nothing in
 * the build catches a mistake in it.
 */

const ARTIFACT = path.resolve(__dirname, '../../../../dist/styleProperties/Dropdown.json');

const props: StylePropertyDefinition[] = JSON.parse(fs.readFileSync(ARTIFACT, 'utf-8'));

describe('Dropdown theme artifact', () => {
	it('emits the hover rule after the selected rule, so hover shows on the selected row', () => {
		// `._dropdownItem._hover` and `._dropdownItem._selected` have the same specificity, and
		// rules come out in the order their entries appear in the file. With selected last, a
		// theme that sets a selected background (mono sets it to transparent) hid the hover
		// tint on the selected option.
		const theme = new Map([
			['dropdownBackgroundHover<designType><colorScheme>', 'red'],
			['dropdownBackgroundSelected<designType><colorScheme>', 'transparent'],
		]);
		const css = processEachResolution('', props, 'ALL', theme);
		const hover = css.indexOf('._dropdownItem._hover {');
		const selected = css.indexOf('._dropdownItem._selected {');

		expect(hover).toBeGreaterThan(-1);
		expect(selected).toBeGreaterThan(-1);
		expect(hover).toBeGreaterThan(selected);
	});
});
